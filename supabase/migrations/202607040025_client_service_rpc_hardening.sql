-- Client Service stage mutation RPCs are invoked by the authenticated,
-- admin-checked Edge Function. Browser roles do not need direct execution.

revoke execute on function public.update_client_service_stage(uuid, text, text, text)
  from authenticated;
revoke execute on function public.mark_client_service_stage_email_sent(uuid, text)
  from authenticated;

grant execute on function public.update_client_service_stage(uuid, text, text, text)
  to service_role;
grant execute on function public.mark_client_service_stage_email_sent(uuid, text)
  to service_role;
