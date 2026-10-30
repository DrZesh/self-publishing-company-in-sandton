BEGIN;
ALTER TABLE public.cb_projects ADD COLUMN review_requested_at timestamptz;
-- Preserve any previously queued / sent request. No migration emails.
UPDATE public.cb_projects p SET review_requested_at=n.created_at FROM public.cb_workflow_notifications n WHERE n.project_id=p.id AND n.event_key='project-completed:'||p.id::text;
CREATE OR REPLACE FUNCTION cb_billing_private.cb_try_project_completed(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR p.project_completed_at IS NOT NULL OR p.status='on_hold' OR jsonb_array_length(p.services)=0 THEN RETURN;END IF;
 -- Every selected service must exist, have at least one included stage, finish all included stages and have an explicit final handover.
 IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(p.services) selected(key) LEFT JOIN public.cb_production_services s ON s.key=selected.key LEFT JOIN public.cb_project_service_progress g ON g.project_id=p.id AND g.service=selected.key WHERE g.id IS NULL OR g.handover_at IS NULL OR s.key IS NULL OR NOT EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.skipped)) OR EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.completed) AND NOT i=ANY(g.skipped))) THEN RETURN;END IF;
 UPDATE public.cb_projects SET project_completed_at=now() WHERE id=p.id;
 PERFORM cb_billing_private.cb_log(p.quote_id,'project_completed','Project Completed. All agreed services finished and final delivery or collection confirmed. Google review request is available as a separate production stage.');
END $$;
CREATE OR REPLACE FUNCTION cb_billing_private.cb_project_completion_payload(p_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;t public.cb_project_email_templates;subject text;body text;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id;IF NOT FOUND THEN RAISE EXCEPTION 'Project not found';END IF;
 SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;SELECT * INTO t FROM public.cb_project_email_templates WHERE key='project_completed';
 subject:=replace(replace(t.subject,'{{client_first_name}}',coalesce(nullif(btrim(c.first_name),''),nullif(split_part(btrim(c.display_name),' ',1),''),'there')),'{{book_title}}',coalesce(nullif(btrim(p.book_title),''),'your book'));
 body:=replace(replace(t.body,'{{client_first_name}}',coalesce(nullif(btrim(c.first_name),''),nullif(split_part(btrim(c.display_name),' ',1),''),'there')),'{{book_title}}',coalesce(nullif(btrim(p.book_title),''),'your book'));
 RETURN jsonb_build_object('stage','Request Google Review','client_name',c.display_name,'client_email',c.email,'template_subject',subject,'template_body',body,'template_version',t.version);
END $$;
CREATE FUNCTION cb_billing_private.cb_request_google_review(p_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;job uuid;payload jsonb;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR p.project_completed_at IS NULL THEN RAISE EXCEPTION 'Confirm all final service deliveries or collections before requesting a Google review';END IF;
 SELECT id INTO job FROM public.cb_workflow_notifications WHERE event_key='project-completed:'||p_id::text;
 IF job IS NOT NULL THEN RETURN job;END IF;
 payload:=cb_billing_private.cb_project_completion_payload(p_id);
 IF coalesce(payload->>'client_email','')!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Save a valid client email before requesting a review';END IF;
 INSERT INTO public.cb_workflow_notifications(event_key,kind,quote_id,project_id,payload) VALUES('project-completed:'||p.id::text,'stage_client',p.quote_id,p.id,payload) RETURNING id INTO job;
 UPDATE public.cb_projects SET review_requested_at=now() WHERE id=p_id;
 PERFORM cb_billing_private.cb_log(p.quote_id,'review_requested','Request Google Review selected. Personalised email queued once to the saved project client.');RETURN job;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_request_google_review(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_request_google_review(uuid) TO authenticated;
CREATE FUNCTION public.cb_request_google_review(p_id uuid) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_request_google_review(p_id) $$;
REVOKE ALL ON FUNCTION public.cb_request_google_review(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_request_google_review(uuid) TO authenticated;

-- Claim only the deliberately requested job for immediate dispatch; preserve existing leases and retry windows.
CREATE FUNCTION cb_billing_private.cb_claim_workflow_notification(p_id uuid) RETURNS SETOF public.cb_workflow_notifications LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 RETURN QUERY WITH picked AS (SELECT id FROM public.cb_workflow_notifications WHERE id=p_id AND ((status IN ('pending','failed') AND available_at<=now()) OR (status='processing' AND lease_until<now())) AND attempts<8 AND (first_attempt_at IS NULL OR first_attempt_at>now()-interval '23 hours') FOR UPDATE SKIP LOCKED)
 UPDATE public.cb_workflow_notifications n SET status='processing',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),lease_until=now()+interval '2 minutes',claim_token=gen_random_uuid() FROM picked WHERE n.id=picked.id RETURNING n.*;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_claim_workflow_notification(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_claim_workflow_notification(uuid) TO service_role;
CREATE FUNCTION public.cb_claim_workflow_notification(p_id uuid) RETURNS SETOF public.cb_workflow_notifications LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT * FROM cb_billing_private.cb_claim_workflow_notification(p_id) $$;
REVOKE ALL ON FUNCTION public.cb_claim_workflow_notification(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_claim_workflow_notification(uuid) TO service_role;

CREATE FUNCTION cb_billing_private.cb_send_review_files(p_id uuid,p_service text,p_instructions text,p_request uuid,p_resources uuid[],p_subject text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;g public.cb_project_service_progress;body text;instructions text;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.cb_workflow_notifications WHERE id=p_request AND project_id=p_id AND event_key='review-files:'||p_request::text) THEN RETURN p_request;END IF;
 SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service;
 IF p.id IS NULL OR NOT p.services?p_service OR g.id IS NULL OR p.status='on_hold' OR g.handover_at IS NOT NULL THEN RAISE EXCEPTION 'Select a started project service awaiting final handover';END IF;
 IF p_request IS NULL OR p_resources IS NULL OR NOT coalesce(cb_billing_private.cb_resources_valid(p_resources),false) OR EXISTS(SELECT 1 FROM unnest(p_resources) rid WHERE NOT EXISTS(SELECT 1 FROM public.cb_service_resources WHERE id=rid AND project_id=p_id AND service=p_service AND purpose='review')) THEN RAISE EXCEPTION 'Select valid author-review files for this service';END IF;
 IF p_subject IS NULL OR p_instructions IS NULL OR length(btrim(p_subject)) NOT BETWEEN 1 AND 200 OR p_subject~E'[\r\n]' OR length(btrim(p_instructions)) NOT BETWEEN 1 AND 8000 THEN RAISE EXCEPTION 'Add a valid email subject and review instructions';END IF;
 SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;
 IF coalesce(c.email,'')!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Save a valid client email before sending review files';END IF;
 instructions:=p_instructions||CASE WHEN g.track_changes THEN E'\nPlease review the Word Track Changes and comments. The editor name is Mac.' ELSE '' END;
 body:='Hi '||coalesce(nullif(btrim(c.first_name),''),nullif(split_part(btrim(c.display_name),' ',1),''),'there')||E',\n\nPlease review the supplied '||p_service||' files for '||coalesce(nullif(btrim(p.book_title),''),'your book')||E'.\n\n'||instructions||E'\n\nView your files securely: https://creativebooks.co.za/portal/p/'||p.portal_token::text||E'\n\nKind regards,\nCreative Books SA';
 INSERT INTO public.cb_workflow_notifications(id,event_key,kind,quote_id,project_id,payload) VALUES(p_request,'review-files:'||p_request::text,'stage_client',p.quote_id,p_id,jsonb_build_object('service',p_service,'stage','Author-review files','client_email',c.email,'template_subject',p_subject,'template_body',body,'resource_ids',to_jsonb(p_resources),'requires_review',true,'portal_url','https://creativebooks.co.za/portal/p/'||p.portal_token::text));
 UPDATE public.cb_service_resources SET released_at=coalesce(released_at,now()) WHERE id=ANY(p_resources);
 UPDATE public.cb_project_service_progress SET review_open=true,review_instructions=p_instructions,review_resource_ids=p_resources WHERE id=g.id;
 PERFORM cb_billing_private.cb_log(p.quote_id,'review_files_sent',p_service||': author-review email requested with selected files.');RETURN p_request;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_send_review_files(uuid,text,text,uuid,uuid[],text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_send_review_files(uuid,text,text,uuid,uuid[],text) TO authenticated;
CREATE FUNCTION public.cb_send_review_files(p_id uuid,p_service text,p_instructions text,p_request uuid,p_resources uuid[],p_subject text) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_send_review_files(p_id,p_service,p_instructions,p_request,p_resources,p_subject) $$;
REVOKE ALL ON FUNCTION public.cb_send_review_files(uuid,text,text,uuid,uuid[],text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_send_review_files(uuid,text,text,uuid,uuid[],text) TO authenticated;
CREATE OR REPLACE FUNCTION cb_billing_private.cb_send_service_delivery(p_id uuid,p_service text,p_instructions text,p_request uuid,p_resources uuid[],p_subject text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;g public.cb_project_service_progress;ids uuid[];last_stage integer;body text;
BEGIN
 PERFORM cb_billing_private.require_staff();IF EXISTS(SELECT 1 FROM public.cb_service_deliveries WHERE id=p_request AND project_id=p_id) THEN RETURN p_request;END IF;
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service;SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;
 IF g.handover_at IS NOT NULL OR p.project_completed_at IS NOT NULL THEN RAISE EXCEPTION 'Final handover is confirmed. The service delivery record is complete.';END IF;
 SELECT jsonb_array_length(stages)-1 INTO last_stage FROM public.cb_production_services WHERE key=p_service;
 IF p_service NOT IN ('cover','editing','typesetting','printing') OR g.current_index IS DISTINCT FROM last_stage OR p.status='on_hold' THEN RAISE EXCEPTION 'Move the service to its ready-for-delivery stage first';END IF;
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
CREATE OR REPLACE FUNCTION cb_billing_private.cb_save_review_settings(p_id uuid,p_service text,p_instructions text,p_track boolean,p_resources uuid[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE j public.cb_workflow_notifications;v_payload jsonb;BEGIN
 PERFORM cb_billing_private.require_staff();PERFORM 1 FROM public.cb_projects WHERE id=p_id AND services?p_service FOR UPDATE;IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service) THEN RAISE EXCEPTION 'Selected project service not found';END IF;IF p_instructions IS NULL OR p_track IS NULL THEN RAISE EXCEPTION 'Review settings are required';END IF;IF length(p_instructions)>8000 THEN RAISE EXCEPTION 'Review instructions are too long';END IF;
 IF p_resources IS NULL OR EXISTS(SELECT 1 FROM unnest(p_resources) rid WHERE NOT EXISTS(SELECT 1 FROM public.cb_service_resources WHERE id=rid AND project_id=p_id AND service=p_service AND purpose='review')) THEN RAISE EXCEPTION 'Select review files for this project and service';END IF;
 UPDATE public.cb_project_service_progress SET review_instructions=p_instructions,review_resource_ids=p_resources,track_changes=p_track,editor_name='Mac' WHERE project_id=p_id AND service=p_service;
 FOR j IN SELECT * FROM public.cb_workflow_notifications WHERE project_id=p_id AND payload->>'service'=p_service AND status='blocked' AND email_message IS NULL AND payload?'stage_index' AND (payload->>'requires_review')::boolean LOOP
  v_payload:=cb_billing_private.cb_service_payload(p_id,p_service,(j.payload->>'stage_index')::integer);
  IF cb_billing_private.cb_resources_valid(ARRAY(SELECT jsonb_array_elements_text(v_payload->'resource_ids')::uuid)) AND btrim(v_payload->>'review_instructions')<>'' THEN
   UPDATE public.cb_workflow_notifications SET payload=v_payload,status='pending',last_error=NULL,available_at=now(),first_attempt_at=NULL,attempts=0 WHERE id=j.id;
   UPDATE public.cb_service_resources SET released_at=coalesce(released_at,now()) WHERE id IN (SELECT jsonb_array_elements_text(v_payload->'resource_ids')::uuid);
   UPDATE public.cb_project_service_progress SET review_open=true WHERE project_id=p_id AND service=p_service;
  END IF;
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION cb_billing_private.cb_portal_resource(p_token uuid,p_resource uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE resource public.cb_service_resources;BEGIN
 SELECT r.* INTO resource FROM public.cb_service_resources r JOIN public.cb_projects p ON p.id=r.project_id WHERE r.id=p_resource AND p.portal_token=p_token AND r.released_at IS NOT NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'File is not available for this project';END IF;
 UPDATE public.cb_service_resources SET download_requested_at=now() WHERE id=resource.id;
 RETURN jsonb_build_object('name',resource.name,'path',resource.object_path,'url',resource.secure_url);
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
