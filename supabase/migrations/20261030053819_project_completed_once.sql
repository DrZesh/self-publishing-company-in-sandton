BEGIN;
-- No backfill, historical completion inference or migration emails.
ALTER TABLE public.cb_projects ADD COLUMN project_completed_at timestamptz;
ALTER TABLE public.cb_project_service_progress ADD COLUMN handover_at timestamptz,ADD COLUMN handover_method text CHECK(handover_method IN ('files_delivered','books_delivered','books_collected')),ADD COLUMN handover_note text,ADD COLUMN handover_by uuid;
CREATE TABLE public.cb_project_email_templates(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),key text NOT NULL UNIQUE CHECK(key='project_completed'),subject text NOT NULL CHECK(length(subject) BETWEEN 1 AND 200),body text NOT NULL CHECK(length(body) BETWEEN 1 AND 16000),version integer NOT NULL DEFAULT 0,updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.cb_project_email_templates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_project_email_templates FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_project_email_templates TO authenticated;
GRANT ALL ON public.cb_project_email_templates TO service_role;
CREATE POLICY cb_project_email_templates_staff ON public.cb_project_email_templates FOR SELECT TO authenticated USING ((SELECT cb_private.is_staff()));
INSERT INTO public.cb_project_email_templates(key,subject,body) VALUES('project_completed','Thank you for trusting us with your project | Creative Books SA',$email$Dear {{client_first_name}},

Thank you for giving Creative Books SA the opportunity to work with you on {{book_title}}. We know how much time, care and dedication goes into a book, and it has been a pleasure to be part of bringing yours to life.

As your project comes to a close, we would be grateful if you could take a moment to share your experience with us on Google. Your honest feedback means a great deal to our team and helps other authors choose who to trust with their own projects.

[Share your experience on Google](https://g.page/r/CYluusLzUm24EBM/review)

Thank you again for choosing Creative Books SA. We wish you every success with your book and would be delighted to work with you again.

Warm regards,
Creative Books SA$email$);
CREATE UNIQUE INDEX cb_project_completion_mail_once ON public.cb_workflow_notifications(project_id) WHERE event_key LIKE 'project-completed:%';

CREATE FUNCTION cb_billing_private.cb_project_completion_payload(p_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;t public.cb_project_email_templates;subject text;body text;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id;IF NOT FOUND THEN RAISE EXCEPTION 'Project not found';END IF;
 SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;SELECT * INTO t FROM public.cb_project_email_templates WHERE key='project_completed';
 subject:=replace(replace(t.subject,'{{client_first_name}}',coalesce(nullif(btrim(c.first_name),''),'there')),'{{book_title}}',coalesce(nullif(btrim(p.book_title),''),'your book'));
 body:=replace(replace(t.body,'{{client_first_name}}',coalesce(nullif(btrim(c.first_name),''),'there')),'{{book_title}}',coalesce(nullif(btrim(p.book_title),''),'your book'));
 RETURN jsonb_build_object('stage','Project Completed','client_email',c.email,'template_subject',subject,'template_body',body,'template_version',t.version);
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_project_completion_payload(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION cb_billing_private.cb_try_project_completed(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;payload jsonb;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR p.project_completed_at IS NOT NULL OR p.status='on_hold' OR jsonb_array_length(p.services)=0 THEN RETURN;END IF;
 -- Every selected service must exist, have at least one included stage, finish all included stages and have an explicit final handover.
 IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(p.services) selected(key) LEFT JOIN public.cb_production_services s ON s.key=selected.key LEFT JOIN public.cb_project_service_progress g ON g.project_id=p.id AND g.service=selected.key WHERE g.id IS NULL OR g.handover_at IS NULL OR s.key IS NULL OR NOT EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.skipped)) OR EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.completed) AND NOT i=ANY(g.skipped))) THEN RETURN;END IF;
 payload:=cb_billing_private.cb_project_completion_payload(p.id);
 IF coalesce(payload->>'client_email','')!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'A valid client email is required before completing the project';END IF;
 INSERT INTO public.cb_workflow_notifications(event_key,kind,quote_id,project_id,payload) VALUES('project-completed:'||p.id::text,'stage_client',p.quote_id,p.id,payload) ON CONFLICT(event_key) DO NOTHING;
 UPDATE public.cb_projects SET project_completed_at=now() WHERE id=p.id;
 PERFORM cb_billing_private.cb_log(p.quote_id,'project_completed','Project Completed. All agreed services finished and final delivery or collection confirmed. Thank-you email queued once.');
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_try_project_completed(uuid) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION cb_billing_private.cb_completion_progress_changed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN PERFORM cb_billing_private.cb_try_project_completed(NEW.project_id);RETURN NEW;END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_completion_progress_changed() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_completion_progress_changed AFTER UPDATE OF completed,skipped,handover_at ON public.cb_project_service_progress FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_completion_progress_changed();

CREATE FUNCTION cb_billing_private.cb_confirm_final_handover(p_id uuid,p_service text,p_method text,p_note text,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;g public.cb_project_service_progress;s public.cb_production_services;d public.cb_service_deliveries;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR NOT p.services?p_service OR p.status='on_hold' THEN RAISE EXCEPTION 'A started project and selected service are required';END IF;
 SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service FOR UPDATE;
 IF g.handover_at IS NOT NULL THEN RETURN;END IF;
 IF g.version IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'Service progress changed. Reload before confirming delivery.';END IF;
 SELECT * INTO s FROM public.cb_production_services WHERE key=p_service;
 IF EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.completed) AND NOT i=ANY(g.skipped)) OR NOT EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.skipped)) THEN RAISE EXCEPTION 'Complete every included service stage before confirming final delivery';END IF;
 IF p_method IS NULL OR (p_service='printing' AND p_method NOT IN ('books_delivered','books_collected')) OR (p_service<>'printing' AND p_method<>'files_delivered') THEN RAISE EXCEPTION 'Choose the correct final delivery or collection method';END IF;
 IF p_note IS NULL OR length(btrim(p_note)) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'Record the delivery or collection reference and confirmation';END IF;
 IF p_service<>'printing' THEN
  SELECT * INTO d FROM public.cb_service_deliveries WHERE project_id=p_id AND service=p_service ORDER BY created_at DESC,id DESC LIMIT 1;
  IF d.id IS NULL OR d.status<>'sent' OR NOT cb_billing_private.cb_resources_valid(d.resource_ids) THEN RAISE EXCEPTION 'Send the final agreed files successfully before confirming their delivery';END IF;
 END IF;
 UPDATE public.cb_project_service_progress SET handover_at=now(),handover_method=p_method,handover_note=btrim(p_note),handover_by=auth.uid(),version=version+1 WHERE id=g.id;
 PERFORM cb_billing_private.cb_log(p.quote_id,'final_handover',p_service||': '||p_method||'. '||btrim(p_note));
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_confirm_final_handover(uuid,text,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_confirm_final_handover(uuid,text,text,text,integer) TO authenticated;
CREATE FUNCTION public.cb_confirm_final_handover(p_id uuid,p_service text,p_method text,p_note text,p_version integer) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_confirm_final_handover(p_id,p_service,p_method,p_note,p_version) $$;
REVOKE ALL ON FUNCTION public.cb_confirm_final_handover(uuid,text,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_confirm_final_handover(uuid,text,text,text,integer) TO authenticated;

CREATE FUNCTION cb_billing_private.cb_preview_project_completion(p_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN PERFORM cb_billing_private.require_staff();RETURN cb_billing_private.cb_project_completion_payload(p_id);END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_preview_project_completion(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_preview_project_completion(uuid) TO authenticated;
CREATE FUNCTION public.cb_preview_project_completion(p_id uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_preview_project_completion(p_id) $$;
REVOKE ALL ON FUNCTION public.cb_preview_project_completion(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_preview_project_completion(uuid) TO authenticated;
CREATE FUNCTION cb_billing_private.cb_save_project_email_template(p_id uuid,p_subject text,p_body text,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 PERFORM cb_billing_private.require_staff();
 IF p_subject IS NULL OR p_body IS NULL OR length(btrim(p_subject)) NOT BETWEEN 1 AND 200 OR p_subject~E'[\r\n]' OR length(btrim(p_body)) NOT BETWEEN 1 AND 16000 THEN RAISE EXCEPTION 'Enter a valid subject and message';END IF;
 IF EXISTS(SELECT 1 FROM regexp_matches(p_subject||p_body,'\{\{([^}]+)\}\}','g') m WHERE m[1] NOT IN ('client_first_name','book_title')) THEN RAISE EXCEPTION 'Unknown completion template placeholder';END IF;
 UPDATE public.cb_project_email_templates SET subject=p_subject,body=p_body,version=version+1,updated_at=now() WHERE id=p_id AND version=p_version;IF NOT FOUND THEN RAISE EXCEPTION 'Template changed. Reload before saving.';END IF;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_save_project_email_template(uuid,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_save_project_email_template(uuid,text,text,integer) TO authenticated;
CREATE FUNCTION public.cb_save_project_email_template(p_id uuid,p_subject text,p_body text,p_version integer) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_save_project_email_template(p_id,p_subject,p_body,p_version) $$;
REVOKE ALL ON FUNCTION public.cb_save_project_email_template(uuid,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_save_project_email_template(uuid,text,text,integer) TO authenticated;
CREATE OR REPLACE FUNCTION cb_billing_private.cb_service_stage(p_id uuid,p_service text,p_index integer,p_action text,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;g public.cb_project_service_progress;size integer;next_index integer;changed boolean:=false;list jsonb;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR NOT p.services?p_service OR p.project_completed_at IS NOT NULL THEN RAISE EXCEPTION 'Unfinished project and selected service required';END IF;
 SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service FOR UPDATE;SELECT jsonb_array_length(stages) INTO size FROM public.cb_production_services WHERE key=p_service;
 IF g.id IS NULL THEN RAISE EXCEPTION 'Service progress not found';END IF;
 IF g.version<>p_version THEN RAISE EXCEPTION 'Service progress changed. Reload before updating.';END IF;
 IF p_index<0 OR p_index>=size OR p_action NOT IN ('stage','complete','reopen','skip','unskip') THEN RAISE EXCEPTION 'Invalid stage action';END IF;
 IF p_action IN ('stage','complete','reopen') AND p.status='on_hold' THEN RAISE EXCEPTION 'The deposit must clear before production starts';END IF;
 next_index:=g.current_index;
 IF p_action='stage' THEN
  IF p_index=ANY(g.skipped) THEN RAISE EXCEPTION 'Unskip the stage before starting it';END IF;
  IF g.current_index=p_index THEN RETURN;END IF;next_index:=p_index;changed:=true;
 ELSIF p_action='complete' THEN
  IF p_index=ANY(g.skipped) THEN RAISE EXCEPTION 'Unskip this stage before completing it';END IF;
  IF p_index=ANY(g.completed) THEN RETURN;END IF;g.completed:=array_append(g.completed,p_index);
  IF g.current_index=p_index THEN SELECT n INTO next_index FROM generate_series(p_index+1,size-1) n WHERE NOT n=ANY(g.skipped) LIMIT 1;changed:=next_index IS NOT NULL;IF next_index IS NULL THEN next_index:=p_index;END IF;END IF;
 ELSIF p_action='reopen' THEN
  IF NOT p_index=ANY(g.completed) THEN RETURN;END IF;g.completed:=array_remove(g.completed,p_index);next_index:=p_index;changed:=g.current_index IS DISTINCT FROM next_index;
 ELSIF p_action='skip' THEN
  IF p_index=ANY(g.completed) THEN RAISE EXCEPTION 'Completed stages cannot be skipped';END IF;
  IF p_index=ANY(g.skipped) THEN RETURN;END IF;g.skipped:=array_append(g.skipped,p_index);IF next_index=p_index THEN next_index:=NULL;END IF;
 ELSE
  IF NOT p_index=ANY(g.skipped) THEN RETURN;END IF;g.skipped:=array_remove(g.skipped,p_index);
 END IF;
 UPDATE public.cb_project_service_progress SET completed=g.completed,skipped=g.skipped,current_index=next_index,version=version+1 WHERE id=g.id;
 SELECT jsonb_agg(CASE WHEN c->>'service'=p_service THEN c||jsonb_build_object('done',split_part(c->>'key',':',2)::integer=ANY(g.completed),'skipped',split_part(c->>'key',':',2)::integer=ANY(g.skipped)) ELSE c END ORDER BY ordinality) INTO list FROM jsonb_array_elements(p.checklist) WITH ORDINALITY a(c,ordinality);
 UPDATE public.cb_projects SET checklist=list,current_stage=CASE WHEN changed THEN p_service||':'||next_index::text ELSE current_stage END,production_version=production_version+1 WHERE id=p_id;
 IF changed THEN PERFORM cb_billing_private.cb_queue_service_stage(p_id,p_service,next_index,'service:'||g.id::text||':'||(g.version+1)::text);ELSE PERFORM cb_billing_private.cb_log(p.quote_id,'service_checklist',p_service||': '||(SELECT stages->>p_index FROM public.cb_production_services WHERE key=p_service)||': '||p_action);END IF;
END $$;

CREATE FUNCTION cb_billing_private.cb_guard_final_handover() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF OLD.handover_at IS NOT NULL AND (NEW.completed IS DISTINCT FROM OLD.completed OR NEW.skipped IS DISTINCT FROM OLD.skipped OR NEW.current_index IS DISTINCT FROM OLD.current_index OR NEW.handover_at IS DISTINCT FROM OLD.handover_at) THEN RAISE EXCEPTION 'Final handover is confirmed. Preserve the completed service record.';END IF;RETURN NEW;END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_guard_final_handover() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_guard_final_handover BEFORE UPDATE ON public.cb_project_service_progress FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_guard_final_handover();
CREATE FUNCTION cb_billing_private.cb_guard_completed_scope() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF (OLD.project_completed_at IS NOT NULL OR EXISTS(SELECT 1 FROM public.cb_project_service_progress WHERE project_id=OLD.id AND handover_at IS NOT NULL)) AND NEW.services IS DISTINCT FROM OLD.services THEN RAISE EXCEPTION 'Project services cannot change after final handover is recorded';END IF;RETURN NEW;END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_guard_completed_scope() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_guard_completed_scope BEFORE UPDATE OF services ON public.cb_projects FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_guard_completed_scope();
CREATE OR REPLACE FUNCTION cb_billing_private.cb_project_portal(p_token uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;result jsonb;BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE portal_token=p_token;IF NOT FOUND THEN RAISE EXCEPTION 'Invalid project link';END IF;
 SELECT jsonb_build_object('book_title',coalesce(nullif(p.book_title,''),'Your book'),'status',p.status,'project_completed_at',p.project_completed_at,'services',coalesce((SELECT jsonb_agg(jsonb_build_object('key',s.key,'label',s.label,'stages',s.stages,'current_index',g.current_index,'completed',g.completed,'skipped',g.skipped,'review_open',g.review_open,'client_approved_at',g.client_approved_at,'handover_at',g.handover_at,'handover_method',g.handover_method,'deliveries',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',d.id,'status',d.status,'sent_at',d.sent_at,'instructions',d.instructions)),'[]') FROM public.cb_service_deliveries d WHERE d.project_id=p.id AND d.service=s.key),'files',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'purpose',r.purpose)),'[]') FROM public.cb_service_resources r WHERE r.project_id=p.id AND r.service=s.key AND r.released_at IS NOT NULL),'feedback',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',f.id,'message',f.message,'created_at',f.created_at)),'[]') FROM public.cb_service_feedback f WHERE f.project_id=p.id AND f.service=s.key)) ORDER BY s.sort_order) FROM public.cb_project_service_progress g JOIN public.cb_production_services s ON s.key=g.service WHERE g.project_id=p.id AND p.services?s.key),'[]')) INTO result;RETURN result;
END $$;
CREATE OR REPLACE FUNCTION cb_billing_private.cb_send_service_delivery(p_id uuid,p_service text,p_instructions text,p_request uuid,p_resources uuid[],p_subject text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;g public.cb_project_service_progress;ids uuid[];last_stage integer;body text;
BEGIN
 PERFORM cb_billing_private.require_staff();IF EXISTS(SELECT 1 FROM public.cb_service_deliveries WHERE id=p_request AND project_id=p_id) THEN RETURN p_request;END IF;
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service;SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;
 IF g.handover_at IS NOT NULL OR p.project_completed_at IS NOT NULL THEN RAISE EXCEPTION 'Final handover is confirmed. The service delivery record is complete.';END IF;
 SELECT jsonb_array_length(stages)-1 INTO last_stage FROM public.cb_production_services WHERE key=p_service;
 IF p_service NOT IN ('cover','editing','typesetting') OR g.current_index IS DISTINCT FROM last_stage OR p.status='on_hold' THEN RAISE EXCEPTION 'Move the service to its ready-for-delivery stage first';END IF;
 IF length(btrim(p_subject)) NOT BETWEEN 1 AND 200 OR p_subject~E'[\r\n]' THEN RAISE EXCEPTION 'Enter a valid delivery subject';END IF;
 ids:=p_resources;IF ids IS NULL OR EXISTS(SELECT 1 FROM unnest(ids) rid WHERE NOT EXISTS(SELECT 1 FROM public.cb_service_resources WHERE id=rid AND project_id=p_id AND service=p_service AND purpose='delivery')) THEN RAISE EXCEPTION 'Select the agreed files for this delivery';END IF;IF NOT cb_billing_private.cb_resources_valid(ids) OR length(btrim(p_instructions)) NOT BETWEEN 1 AND 8000 THEN RAISE EXCEPTION 'Delivery requires the correct agreed files or secure links and review instructions';END IF;
 UPDATE public.cb_project_service_progress SET client_approved_at=NULL WHERE id=g.id;
 PERFORM cb_billing_private.cb_production_task(p_id,p_service,'delivery');
 UPDATE public.cb_production_tasks SET status='pending' WHERE project_id=p_id AND service=p_service AND kind='delivery';
 UPDATE public.task SET data=data||jsonb_build_object('status','Pending'),updated_date=now() WHERE id IN (SELECT legacy_task_id FROM public.cb_production_tasks WHERE project_id=p_id AND service=p_service AND kind='delivery');
 INSERT INTO public.cb_service_deliveries(id,project_id,service,resource_ids,instructions,recipient) VALUES(p_request,p_id,p_service,ids,p_instructions,c.email);
 UPDATE public.cb_service_resources SET released_at=coalesce(released_at,now()) WHERE id=ANY(ids);
 body:='Hi '||coalesce(nullif(btrim(c.first_name),''),'there')||E',\n\nYour agreed '||p_service||' files for '||coalesce(nullif(p.book_title,''),'your book')||E' are ready.\n\n'||p_instructions||E'\n\nView your files securely: https://creativebooks.co.za/portal/p/'||p.portal_token::text||E'\n\nKind regards,\nCreative Books SA';
 INSERT INTO public.cb_workflow_notifications(id,event_key,kind,quote_id,project_id,payload) VALUES(p_request,'delivery:'||p_request::text,'delivery_client',p.quote_id,p.id,jsonb_build_object('client_name',c.display_name,'client_email',c.email,'service',p_service,'stage','Delivery email','template_subject',p_subject,'template_body',body,'resource_ids',to_jsonb(ids),'delivery_id',p_request,'portal_url','https://creativebooks.co.za/portal/p/'||p.portal_token::text));
 RETURN p_request;
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
