BEGIN;
ALTER TABLE public.cb_service_deliveries ADD COLUMN client_approved_at timestamptz;
UPDATE public.cb_service_deliveries d SET client_approved_at=g.client_approved_at FROM public.cb_project_service_progress g WHERE g.project_id=d.project_id AND g.service=d.service AND g.client_approved_at IS NOT NULL AND d.id=(SELECT latest.id FROM public.cb_service_deliveries latest WHERE latest.project_id=d.project_id AND latest.service=d.service ORDER BY latest.created_at DESC,latest.id DESC LIMIT 1);
CREATE OR REPLACE FUNCTION cb_billing_private.cb_send_service_delivery(p_id uuid,p_service text,p_instructions text,p_request uuid,p_resources uuid[],p_subject text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;g public.cb_project_service_progress;ids uuid[];last_stage integer;body text;
BEGIN
 PERFORM cb_billing_private.require_staff();IF EXISTS(SELECT 1 FROM public.cb_service_deliveries WHERE id=p_request AND project_id=p_id) THEN RETURN p_request;END IF;
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service;SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;
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
CREATE OR REPLACE FUNCTION cb_billing_private.cb_portal_approve(p_token uuid,p_service text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;d public.cb_service_deliveries;approval timestamptz;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE portal_token=p_token;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invalid project link';END IF;
 PERFORM 1 FROM public.cb_project_service_progress WHERE project_id=p.id AND service=p_service FOR UPDATE;
 SELECT * INTO d FROM public.cb_service_deliveries WHERE project_id=p.id AND service=p_service ORDER BY created_at DESC,id DESC LIMIT 1 FOR UPDATE;
 IF NOT FOUND OR d.status<>'sent' THEN RAISE EXCEPTION 'The latest delivery must be sent before its review approval can be recorded';END IF;
 IF d.client_approved_at IS NOT NULL THEN RETURN;END IF;
 approval:=now();
 UPDATE public.cb_service_deliveries SET client_approved_at=approval WHERE id=d.id;
 UPDATE public.cb_project_service_progress SET client_approved_at=approval WHERE project_id=p.id AND service=p_service;
 PERFORM cb_billing_private.cb_log(p.quote_id,'client_approval',p_service||' delivery '||d.id::text||' review approved by client. Print approval remains separate.');
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
