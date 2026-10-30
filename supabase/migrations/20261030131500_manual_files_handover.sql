-- Allow non-printing services (editing, typesetting, cover design...) to be handed over without
-- sending files through the CRM's "Review & delivery files" panel, which was removed from the CRM.
-- Staff confirm 'files_sent' with a note (e.g. "Final PDF sent via WeTransfer on 30 Oct").
-- The older 'files_delivered' method keeps its check that a CRM delivery email was sent.
CREATE OR REPLACE FUNCTION cb_billing_private.cb_confirm_final_handover(p_id uuid, p_service text, p_method text, p_note text, p_version integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE p public.cb_projects;g public.cb_project_service_progress;s public.cb_production_services;d public.cb_service_deliveries;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF p.id IS NULL OR NOT p.services?p_service OR p.status='on_hold' THEN RAISE EXCEPTION 'A started project and selected service are required';END IF;
 SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service FOR UPDATE;
 IF g.handover_at IS NOT NULL THEN RETURN;END IF;
 IF g.version IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'Service progress changed. Reload before confirming delivery.';END IF;
 SELECT * INTO s FROM public.cb_production_services WHERE key=p_service;
 IF EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.completed) AND NOT i=ANY(g.skipped)) OR NOT EXISTS(SELECT 1 FROM generate_series(0,jsonb_array_length(s.stages)-1) i WHERE NOT i=ANY(g.skipped)) THEN RAISE EXCEPTION 'Complete every included service stage before confirming final delivery';END IF;
 IF p_method IS NULL OR (p_service='printing' AND p_method NOT IN ('books_delivered','books_collected')) OR (p_service<>'printing' AND p_method NOT IN ('files_delivered','files_sent')) THEN RAISE EXCEPTION 'Choose the correct final delivery or collection method';END IF;
 IF p_note IS NULL OR length(btrim(p_note)) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'Record the delivery or collection reference and confirmation';END IF;
 IF p_method='files_delivered' THEN
  SELECT * INTO d FROM public.cb_service_deliveries WHERE project_id=p_id AND service=p_service ORDER BY created_at DESC,id DESC LIMIT 1;
  IF d.id IS NULL OR d.status<>'sent' OR NOT cb_billing_private.cb_resources_valid(d.resource_ids) THEN RAISE EXCEPTION 'Send the final agreed files successfully before confirming their delivery';END IF;
 END IF;
 UPDATE public.cb_project_service_progress SET handover_at=now(),handover_method=p_method,handover_note=btrim(p_note),handover_by=auth.uid(),version=version+1 WHERE id=g.id;
 PERFORM cb_billing_private.cb_log(p.quote_id,'final_handover',p_service||': '||p_method||'. '||btrim(p_note));
END $function$;
