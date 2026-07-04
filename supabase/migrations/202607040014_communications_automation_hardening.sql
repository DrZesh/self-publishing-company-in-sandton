-- Creative Books SA: Communication automation hardening

create or replace function public.increment_automation_rule_run(p_rule_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.automation_rules
  set run_count = run_count + 1,
      last_run_at = now()
  where id = p_rule_id;
$$;

revoke all on function public.increment_automation_rule_run(uuid) from public;
grant execute on function public.increment_automation_rule_run(uuid) to service_role;

create or replace function public.mark_automation_event_result(
  p_event_id uuid,
  p_success boolean,
  p_error text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.automation_events
  set status = case when p_success then 'processed' else 'failed' end,
      processed_at = case when p_success then now() else processed_at end,
      retry_count = case when p_success then retry_count else retry_count + 1 end,
      last_error = case when p_success then null else p_error end
  where id = p_event_id;
$$;

revoke all on function public.mark_automation_event_result(uuid, boolean, text) from public;
grant execute on function public.mark_automation_event_result(uuid, boolean, text) to service_role;

-- A direct message may fail before a successful dedup row exists. Keep failed
-- attempts traceable without blocking a later successful retry.
create index if not exists message_logs_failure_dedup_idx
  on public.message_logs(dedup_key, sent_at desc)
  where success = false;
