BEGIN;
CREATE TABLE public.cb_production_services(key text PRIMARY KEY,label text NOT NULL,sort_order integer NOT NULL,stages jsonb NOT NULL CHECK(jsonb_typeof(stages)='array'));
INSERT INTO public.cb_production_services VALUES
('editing','Editing',1,'["Manuscript received","Editorial assessment","First editorial pass","Author revisions","Second editorial pass","Proofreading and final checks","Edited manuscript approved"]'),
('typesetting','Typesetting / Layout',2,'["Manuscript and design brief received","Page design and sample layout","Interior typesetting","First proof sent to author","Author corrections","Final layout checks","Print-ready interior approved"]'),
('cover','Book Cover Design',3,'["Cover brief and references received","Cover concepts in progress","Concepts sent to author","Selected concept refined","Spine and back cover prepared","Final cover proof approved","Print-ready cover exported"]'),
('printing','Printing / Delivery',4,'["Print files approved","Printing","Binding","Quality check","Delivery"]');
ALTER TABLE public.cb_production_services ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_production_services FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_production_services TO authenticated;
GRANT ALL ON public.cb_production_services TO service_role;
CREATE POLICY cb_production_services_staff ON public.cb_production_services FOR SELECT TO authenticated USING((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_projects ADD COLUMN services jsonb NOT NULL DEFAULT '["printing"]',ADD COLUMN current_stage text,ADD COLUMN production_version integer NOT NULL DEFAULT 0;
ALTER TABLE public.cb_projects ADD CONSTRAINT cb_project_services_array CHECK(jsonb_typeof(services)='array' AND jsonb_array_length(services) BETWEEN 1 AND 4);
-- Preserve every existing checklist item and completion flag. No historical email is enqueued.
UPDATE public.cb_projects p SET checklist=(SELECT jsonb_agg(c.value||jsonb_build_object('service','printing','key','printing:'||(c.ordinality-1)::text) ORDER BY c.ordinality) FROM jsonb_array_elements(p.checklist) WITH ORDINALITY c),current_stage=CASE WHEN status IN ('complete','closed') THEN NULL ELSE 'printing:0' END;
CREATE TABLE public.cb_workflow_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),event_key text NOT NULL UNIQUE,
 kind text NOT NULL CHECK(kind IN ('acceptance_admin','stage_client')),
 quote_id uuid NOT NULL REFERENCES public.cb_quotes(id),project_id uuid REFERENCES public.cb_projects(id),
 payload jsonb NOT NULL,email_message jsonb,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed')),
 attempts integer NOT NULL DEFAULT 0,available_at timestamptz NOT NULL DEFAULT now(),
 first_attempt_at timestamptz,lease_until timestamptz,claim_token uuid,
 provider_id text,last_error text,created_at timestamptz NOT NULL DEFAULT now(),sent_at timestamptz
);
CREATE INDEX cb_workflow_notifications_pending_idx ON public.cb_workflow_notifications(status,available_at) WHERE status<>'sent';
CREATE INDEX cb_workflow_notifications_project_idx ON public.cb_workflow_notifications(project_id,created_at DESC);
CREATE INDEX cb_workflow_notifications_quote_idx ON public.cb_workflow_notifications(quote_id);
ALTER TABLE public.cb_workflow_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_workflow_notifications FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_workflow_notifications TO authenticated;
GRANT ALL ON public.cb_workflow_notifications TO service_role;
CREATE POLICY cb_workflow_notifications_staff ON public.cb_workflow_notifications FOR SELECT TO authenticated USING((SELECT cb_private.is_staff()));

CREATE FUNCTION cb_billing_private.cb_project_checklist(p_services jsonb,p_old jsonb DEFAULT '[]') RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT coalesce(jsonb_agg(coalesce((SELECT old.value FROM jsonb_array_elements(p_old) old WHERE old.value->>'key'=s.key||':'||(stage.ordinality-1)::text LIMIT 1),jsonb_build_object('key',s.key||':'||(stage.ordinality-1)::text,'service',s.key,'label',stage.value,'done',false)) ORDER BY s.sort_order,stage.ordinality),'[]') FROM public.cb_production_services s CROSS JOIN LATERAL jsonb_array_elements_text(s.stages) WITH ORDINALITY stage WHERE p_services?s.key
$$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_project_checklist(jsonb,jsonb) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION cb_billing_private.cb_initial_project_services() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE names text; selected jsonb:='[]';
BEGIN
 SELECT lower(string_agg(name||' '||coalesce(description,''),' ')) INTO names FROM public.cb_quote_items WHERE quote_id=NEW.quote_id;
 IF names~'(edit|proofread)' THEN selected:=selected||'"editing"'::jsonb; END IF;
 IF names~'(typeset|layout|formatting)' THEN selected:=selected||'"typesetting"'::jsonb; END IF;
 IF names~'(cover|artwork)' THEN selected:=selected||'"cover"'::jsonb; END IF;
 IF names~'(print|binding|copies)' OR selected='[]'::jsonb THEN selected:=selected||'"printing"'::jsonb; END IF;
 NEW.services:=selected;NEW.checklist:=cb_billing_private.cb_project_checklist(selected);
 NEW.current_stage:=NEW.checklist->0->>'key';RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_initial_project_services() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_initial_project_services BEFORE INSERT ON public.cb_projects FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_initial_project_services();

CREATE FUNCTION cb_billing_private.cb_queue_acceptance_notification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE q public.cb_quotes;c public.cb_clients;p public.cb_projects;inv public.cb_invoices;nid uuid;
BEGIN
 IF NEW.status<>'accepted' OR OLD.status='accepted' THEN RETURN NULL; END IF;
 SELECT * INTO q FROM public.cb_quotes WHERE id=NEW.id;
 SELECT * INTO c FROM public.cb_clients WHERE id=q.client_id;
 SELECT * INTO p FROM public.cb_projects WHERE quote_id=q.id;
 SELECT * INTO inv FROM public.cb_invoices WHERE quote_id=q.id AND type='deposit';
 INSERT INTO public.cb_workflow_notifications(event_key,kind,quote_id,project_id,payload)
 VALUES('accepted:'||q.id::text,'acceptance_admin',q.id,p.id,jsonb_build_object('client_name',c.display_name,'client_email',c.email,'quote_number',q.number,'quote_total',q.total,'signer',q.signature->>'name','method',q.signature->>'method','accepted_at',q.accepted_at,'invoice_number',inv.number,'project_title',p.title)) ON CONFLICT(event_key) DO NOTHING RETURNING id INTO nid;
 IF nid IS NOT NULL THEN
  INSERT INTO public.notification(data) VALUES(jsonb_build_object('title','Quote accepted: '||q.number,'message',c.display_name||' accepted '||q.number||'. Signer: '||coalesce(q.signature->>'name','Recorded manually')||'. Deposit invoice: '||coalesce(inv.number,'Pending'),'type','success','category','finance','priority','high','is_read',false,'action_url','/admin/billing/quotes/'||q.id::text,'related_entity_id',q.id::text));
 END IF;
 RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_queue_acceptance_notification() FROM PUBLIC,anon,authenticated;
CREATE CONSTRAINT TRIGGER cb_acceptance_notification AFTER UPDATE ON public.cb_quotes DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_queue_acceptance_notification();

CREATE FUNCTION cb_billing_private.cb_queue_project_update() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.cb_clients;q public.cb_quotes;stage text;completed text;message text;revision integer;
BEGIN
 IF NEW.status IS NOT DISTINCT FROM OLD.status AND NEW.current_stage IS NOT DISTINCT FROM OLD.current_stage AND NEW.checklist IS NOT DISTINCT FROM OLD.checklist THEN RETURN NEW; END IF;
 -- Changes to the service selection alone prepare the workflow without emailing a false progress update.
 IF NEW.services IS DISTINCT FROM OLD.services AND NEW.status=OLD.status THEN RETURN NEW; END IF;
 IF NEW.status='on_hold' THEN RETURN NEW; END IF;
 SELECT * INTO c FROM public.cb_clients WHERE id=NEW.client_id;SELECT * INTO q FROM public.cb_quotes WHERE id=NEW.quote_id;
 SELECT item->>'label' INTO stage FROM jsonb_array_elements(NEW.checklist) item WHERE item->>'key'=NEW.current_stage;
 SELECT string_agg(n->>'label',', ') INTO completed FROM jsonb_array_elements(NEW.checklist) n WHERE (n->>'done')::boolean AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(OLD.checklist) o WHERE o->>'key'=n->>'key' AND (o->>'done')::boolean);
 IF NEW.status='closed' THEN stage:='Paid and closed';message:='Your balance has cleared and your project has been closed. Please contact us about any collection or delivery arrangements.';
 ELSIF NEW.status='complete' AND OLD.status IS DISTINCT FROM NEW.status THEN stage:='Production complete';message:='The production work has been marked complete. Your balance invoice is ready. Final files and collection or delivery remain subject to cleared payment.';
 ELSIF OLD.status='on_hold' THEN message:='Your deposit has cleared and your project is now in production.';
 ELSE message:=CASE WHEN completed IS NOT NULL THEN completed||' has been completed. ' ELSE '' END||CASE WHEN stage IS NOT NULL THEN 'Your project is now at: '||stage||'.' ELSE 'All selected production stages have been checked off. The team will confirm completion and the final balance.' END;
 END IF;
 INSERT INTO public.cb_workflow_notifications(event_key,kind,quote_id,project_id,payload) VALUES('project:'||NEW.id::text||':'||NEW.production_version::text||':'||NEW.status,'stage_client',NEW.quote_id,NEW.id,jsonb_build_object('client_name',c.display_name,'client_email',c.email,'project_title',NEW.title,'quote_number',q.number,'stage',coalesce(stage,'Production checks complete'),'message',message,'changed_at',now())) ON CONFLICT(event_key) DO NOTHING;
 PERFORM cb_billing_private.cb_log(NEW.quote_id,'production_update',message||' Client update queued.');
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_queue_project_update() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_project_update_notification AFTER UPDATE ON public.cb_projects FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_queue_project_update();

CREATE FUNCTION cb_billing_private.cb_configure_project_services(p_id uuid,p_services jsonb,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects; selected_services jsonb; list jsonb;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR p.status='closed' THEN RAISE EXCEPTION 'Open project required'; END IF;
 IF p.production_version<>p_version THEN RAISE EXCEPTION 'Project changed. Reload before updating.'; END IF;
 IF p_services IS NULL OR jsonb_typeof(p_services)<>'array' OR jsonb_array_length(p_services) NOT BETWEEN 1 AND 4 THEN RAISE EXCEPTION 'Choose at least one service'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(p_services) s WHERE NOT EXISTS(SELECT 1 FROM public.cb_production_services c WHERE c.key=s)) THEN RAISE EXCEPTION 'Unknown service'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p.checklist) c WHERE (c->>'done')::boolean AND NOT p_services?(c->>'service')) THEN RAISE EXCEPTION 'Cannot remove a service with completed stages'; END IF;
 SELECT jsonb_agg(key ORDER BY sort_order) INTO selected_services FROM public.cb_production_services WHERE p_services?key;
 IF selected_services=p.services THEN RETURN; END IF;
 list:=cb_billing_private.cb_project_checklist(selected_services,p.checklist);
 UPDATE public.cb_projects SET services=selected_services,checklist=list,current_stage=CASE WHEN EXISTS(SELECT 1 FROM jsonb_array_elements(list) x WHERE x->>'key'=p.current_stage) THEN p.current_stage ELSE list->0->>'key' END,production_version=production_version+1 WHERE id=p_id;
 PERFORM cb_billing_private.cb_log(p.quote_id,'services','Production services updated. Existing completed stages preserved.');
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_configure_project_services(uuid,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_configure_project_services(uuid,jsonb,integer) TO authenticated;
CREATE FUNCTION public.cb_configure_project_services(p_id uuid,p_services jsonb,p_version integer) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_configure_project_services(p_id,p_services,p_version) $$;
REVOKE ALL ON FUNCTION public.cb_configure_project_services(uuid,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_configure_project_services(uuid,jsonb,integer) TO authenticated;

CREATE FUNCTION cb_billing_private.cb_set_production_stage(p_id uuid,p_key text,p_complete boolean,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects; list jsonb; idx integer; next_key text;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR p.status NOT IN ('in_production','complete') THEN RAISE EXCEPTION 'Stage updates require a project with a cleared deposit'; END IF;
 IF p.production_version<>p_version THEN RAISE EXCEPTION 'Project changed. Reload before updating.'; END IF;
 SELECT (ordinality-1)::integer INTO idx FROM jsonb_array_elements(p.checklist) WITH ORDINALITY c WHERE c.value->>'key'=p_key;
 IF idx IS NULL THEN RAISE EXCEPTION 'Stage not found'; END IF;
 IF p_complete IS TRUE AND p.checklist->idx->>'label'='Delivery' AND NOT EXISTS(SELECT 1 FROM public.cb_invoices i WHERE i.project_id=p.id AND i.type='balance' AND i.total<=(SELECT coalesce(sum(pm.amount),0) FROM public.cb_payments pm WHERE pm.invoice_id=i.id AND pm.funds_cleared)) THEN RAISE EXCEPTION 'The final balance must clear before delivery can be completed'; END IF;
 list:=p.checklist;
 IF p_complete IS NULL THEN
  IF p.current_stage=p_key THEN RETURN; END IF;
  IF (list->idx->>'done')::boolean THEN RAISE EXCEPTION 'This stage is already completed'; END IF;
  next_key:=p_key;
 ELSE
  IF (list->idx->>'done')::boolean=p_complete THEN RETURN; END IF;
  list:=jsonb_set(list,array[idx::text,'done'],to_jsonb(p_complete));
  list:=jsonb_set(list,array[idx::text,'done_at'],CASE WHEN p_complete THEN to_jsonb(now()) ELSE 'null'::jsonb END);
  IF NOT p_complete THEN next_key:=p_key;
  ELSIF p.current_stage IS DISTINCT FROM p_key AND EXISTS(SELECT 1 FROM jsonb_array_elements(list) c WHERE c->>'key'=p.current_stage AND NOT (c->>'done')::boolean) THEN next_key:=p.current_stage;
  ELSE SELECT c->>'key' INTO next_key FROM jsonb_array_elements(list) c WHERE NOT (c->>'done')::boolean LIMIT 1; END IF;
 END IF;
 UPDATE public.cb_projects SET checklist=list,current_stage=next_key,production_version=production_version+1 WHERE id=p_id;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_set_production_stage(uuid,text,boolean,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_set_production_stage(uuid,text,boolean,integer) TO authenticated;
CREATE FUNCTION public.cb_set_production_stage(p_id uuid,p_key text,p_complete boolean,p_version integer) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_set_production_stage(p_id,p_key,p_complete,p_version) $$;
REVOKE ALL ON FUNCTION public.cb_set_production_stage(uuid,text,boolean,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_set_production_stage(uuid,text,boolean,integer) TO authenticated;
-- Existing clients of the checkbox RPC keep the same permission and clearance gates.
CREATE OR REPLACE FUNCTION cb_billing_private.cb_toggle_checklist(p_project_id uuid,p_index integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_project_id FOR UPDATE;
 IF p_index<0 OR p_index>=jsonb_array_length(p.checklist) THEN RAISE EXCEPTION 'Stage not found'; END IF;
 PERFORM cb_billing_private.cb_set_production_stage(p.id,p.checklist->p_index->>'key',NOT (p.checklist->p_index->>'done')::boolean,p.production_version);
END $$;

CREATE FUNCTION cb_billing_private.cb_retry_workflow_notification(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM cb_billing_private.require_staff();
 IF EXISTS(SELECT 1 FROM public.cb_workflow_notifications WHERE id=p_id AND first_attempt_at<now()-interval '23 hours') THEN RAISE EXCEPTION 'Retry window expired. Check delivery in the email provider before sending again.'; END IF;
 UPDATE public.cb_workflow_notifications SET status='pending',attempts=0,available_at=now(),last_error=NULL WHERE id=p_id AND status='failed';
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_retry_workflow_notification(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_retry_workflow_notification(uuid) TO authenticated;
CREATE FUNCTION public.cb_retry_workflow_notification(p_id uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_retry_workflow_notification(p_id) $$;
REVOKE ALL ON FUNCTION public.cb_retry_workflow_notification(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_retry_workflow_notification(uuid) TO authenticated;

CREATE FUNCTION cb_billing_private.cb_claim_workflow_notifications() RETURNS SETOF public.cb_workflow_notifications LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE public.cb_workflow_notifications SET status='failed',last_error='Retry window expired. Check provider delivery before retrying.' WHERE status IN ('pending','processing') AND first_attempt_at<now()-interval '23 hours';
 RETURN QUERY WITH picked AS (SELECT id FROM public.cb_workflow_notifications WHERE ((status IN ('pending','failed') AND available_at<=now()) OR (status='processing' AND lease_until<now())) AND attempts<8 AND (first_attempt_at IS NULL OR first_attempt_at>now()-interval '23 hours') ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 5)
 UPDATE public.cb_workflow_notifications n SET status='processing',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lease_until=now()+interval '2 minutes',claim_token=gen_random_uuid() FROM picked WHERE n.id=picked.id RETURNING n.*;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_claim_workflow_notifications() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_claim_workflow_notifications() TO service_role;
CREATE FUNCTION public.cb_claim_workflow_notifications() RETURNS SETOF public.cb_workflow_notifications LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT * FROM cb_billing_private.cb_claim_workflow_notifications() $$;
REVOKE ALL ON FUNCTION public.cb_claim_workflow_notifications() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_claim_workflow_notifications() TO service_role;

-- INFRASTRUCTURE: hosted scheduler and Vault. Local PGlite tests exercise the core above.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
DO $$BEGIN IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='cb_workflow_dispatch_token') THEN PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'cb_workflow_dispatch_token','Private token for the billing workflow email worker'); END IF; END $$;
CREATE FUNCTION cb_billing_private.cb_validate_workflow_dispatch(p_token text) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ SELECT length(p_token)=64 AND EXISTS(SELECT 1 FROM vault.decrypted_secrets WHERE name='cb_workflow_dispatch_token' AND extensions.digest(decrypted_secret,'sha256')=extensions.digest(p_token,'sha256')) $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_validate_workflow_dispatch(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_validate_workflow_dispatch(text) TO service_role;
CREATE FUNCTION public.cb_validate_workflow_dispatch(p_token text) RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_validate_workflow_dispatch(p_token) $$;
REVOKE ALL ON FUNCTION public.cb_validate_workflow_dispatch(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_validate_workflow_dispatch(text) TO service_role;
CREATE FUNCTION cb_billing_private.cb_dispatch_workflow_notifications() RETURNS bigint LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 SELECT net.http_post(url:='https://cobpbsfkeewxzyprbmet.supabase.co/functions/v1/billingWorkflowNotifications',headers:=jsonb_build_object('Content-Type','application/json','x-cb-workflow-token',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='cb_workflow_dispatch_token')),body:='{}'::jsonb,timeout_milliseconds:=60000)
$$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_dispatch_workflow_notifications() FROM PUBLIC,anon,authenticated;
SELECT cron.schedule('cb-billing-workflow-notifications','* * * * *','SELECT cb_billing_private.cb_dispatch_workflow_notifications();');
NOTIFY pgrst,'reload schema';
COMMIT;
