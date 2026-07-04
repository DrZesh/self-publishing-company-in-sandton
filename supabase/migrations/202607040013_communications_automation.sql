-- Creative Books SA: Communication delivery, templates and automation

alter table public.contacts
  add column if not exists do_not_contact boolean not null default false,
  add column if not exists unsubscribed boolean not null default false,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists unsubscribe_token text unique default (
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  );

create index if not exists contacts_unsubscribed_idx
  on public.contacts(unsubscribed, do_not_contact);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  email_provider text not null default 'resend'
    check (email_provider in ('resend', 'builtin')),
  sender_name text not null default 'Creative Books SA',
  sender_email text not null default 'info@creativebooks.co.za',
  reply_to text not null default 'info@creativebooks.co.za',
  is_configured boolean not null default false,
  value jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

insert into public.app_settings (
  setting_key, email_provider, sender_name, sender_email, reply_to, is_configured
) values (
  'email_settings', 'resend', 'Creative Books SA', 'info@creativebooks.co.za', 'info@creativebooks.co.za', false
)
on conflict (setting_key) do nothing;

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'email'
    check (channel in ('email', 'whatsapp')),
  subject text,
  content_html text not null,
  variables_used text[] not null default '{}',
  category text not null default 'general'
    check (category in (
      'welcome', 'stage_update', 'payment', 'files', 'proof', 'approval',
      'printing', 'collection', 'delivery', 'completion', 'reminder',
      'review', 'delay', 'general'
    )),
  is_active boolean not null default true,
  is_default boolean not null default false,
  default_content_html text,
  sort_order integer not null default 0,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists message_templates_channel_active_idx
  on public.message_templates(channel, is_active, sort_order, name);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger text not null
    check (trigger in (
      'project_created', 'project_approved', 'stage_changed', 'no_update_2_days',
      'payment_confirmed', 'proof_sent', 'proof_approved', 'client_no_response',
      'project_completed', 'files_received', 'files_required'
    )),
  trigger_stage text,
  conditions jsonb not null default '{}'::jsonb,
  action text not null
    check (action in (
      'send_email', 'send_whatsapp', 'notify_admin', 'create_task',
      'update_status', 'add_note', 'send_reminder', 'stop_automation'
    )),
  template_id uuid references public.message_templates(id) on delete set null,
  template_name text,
  requires_approval boolean not null default false,
  delay_minutes integer not null default 0 check (delay_minutes >= 0),
  is_active boolean not null default true,
  run_count integer not null default 0 check (run_count >= 0),
  last_run_at timestamptz,
  sort_order integer not null default 0,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists automation_rules_trigger_idx
  on public.automation_rules(trigger, is_active, sort_order);

create table if not exists public.message_queue (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.contacts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  automation_rule_id uuid references public.automation_rules(id) on delete set null,
  channel text not null default 'email'
    check (channel in ('email', 'whatsapp')),
  template_id uuid references public.message_templates(id) on delete set null,
  template_name text,
  recipient text not null,
  rendered_subject text not null default '',
  rendered_body text not null,
  status text not null default 'pending_approval'
    check (status in ('pending_approval', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  scheduled_for timestamptz,
  dedup_key text not null,
  triggered_by text not null default 'automation'
    check (triggered_by in ('automation', 'admin')),
  trigger_event text,
  retry_count integer not null default 0 check (retry_count >= 0),
  last_error text,
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  client_name text,
  project_name text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create unique index if not exists message_queue_dedup_active_idx
  on public.message_queue(dedup_key)
  where status in ('pending_approval', 'scheduled', 'sending', 'sent');
create index if not exists message_queue_status_schedule_idx
  on public.message_queue(status, scheduled_for, created_date);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.contacts(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  channel text not null default 'email'
    check (channel in ('email', 'whatsapp')),
  template_used text,
  template_id uuid references public.message_templates(id) on delete set null,
  recipient text not null,
  subject text,
  body text,
  trigger text,
  action_taken text,
  sent_at timestamptz not null default now(),
  success boolean not null default true,
  error_message text,
  triggered_by text not null default 'automation'
    check (triggered_by in ('automation', 'admin')),
  dedup_key text not null,
  automation_rule_id uuid references public.automation_rules(id) on delete set null,
  provider text,
  client_name text,
  project_name text,
  stage_at_send text,
  provider_message_id text,
  created_date timestamptz not null default now()
);

create unique index if not exists message_logs_success_dedup_idx
  on public.message_logs(dedup_key)
  where success = true;
create index if not exists message_logs_sent_idx
  on public.message_logs(sent_at desc);
create index if not exists message_logs_project_idx
  on public.message_logs(project_id, sent_at desc) where project_id is not null;
create index if not exists message_logs_client_idx
  on public.message_logs(client_id, sent_at desc);

create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  event_type text not null,
  old_stage text,
  new_stage text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'processed', 'failed')),
  retry_count integer not null default 0 check (retry_count >= 0),
  last_error text,
  created_date timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists automation_events_pending_idx
  on public.automation_events(status, created_date)
  where status in ('pending', 'failed');

create or replace function public.set_communications_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.set_communications_updated_date() from public;

create trigger app_settings_set_updated_date
before update on public.app_settings
for each row execute procedure public.set_communications_updated_date();

create trigger message_templates_set_updated_date
before update on public.message_templates
for each row execute procedure public.set_communications_updated_date();

create trigger automation_rules_set_updated_date
before update on public.automation_rules
for each row execute procedure public.set_communications_updated_date();

create trigger message_queue_set_updated_date
before update on public.message_queue
for each row execute procedure public.set_communications_updated_date();

create or replace function public.enqueue_project_automation_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_type text;
begin
  if tg_op = 'INSERT' then
    v_event_type := 'project_created';
  elsif new.stage is distinct from old.stage then
    v_event_type := 'stage_changed';
  else
    return new;
  end if;

  insert into public.automation_events (
    project_id,
    event_type,
    old_stage,
    new_stage,
    payload
  ) values (
    new.id,
    v_event_type,
    case when tg_op = 'INSERT' then null else old.stage end,
    new.stage,
    jsonb_build_object(
      'contact_id', new.contact_id,
      'book_title', new.book_title,
      'waiting_on', new.waiting_on,
      'automation_enabled', new.automation_enabled,
      'updates_paused', new.updates_paused
    )
  );

  return new;
end;
$$;

revoke all on function public.enqueue_project_automation_event() from public;

drop trigger if exists projects_enqueue_automation_event on public.projects;
create trigger projects_enqueue_automation_event
after insert or update of stage on public.projects
for each row execute procedure public.enqueue_project_automation_event();

create or replace function public.claim_pending_automation_events(p_limit integer default 50)
returns setof public.automation_events
language sql
security definer
set search_path = ''
as $$
  with candidates as (
    select id
    from public.automation_events
    where status in ('pending', 'failed')
      and retry_count < 5
    order by created_date
    for update skip locked
    limit greatest(1, least(p_limit, 200))
  ), updated as (
    update public.automation_events e
    set status = 'processing',
        last_error = null
    from candidates c
    where e.id = c.id
    returning e.*
  )
  select * from updated;
$$;

revoke all on function public.claim_pending_automation_events(integer) from public;
grant execute on function public.claim_pending_automation_events(integer) to service_role;

alter table public.app_settings enable row level security;
alter table public.message_templates enable row level security;
alter table public.automation_rules enable row level security;
alter table public.message_queue enable row level security;
alter table public.message_logs enable row level security;
alter table public.automation_events enable row level security;

create policy "Admins can manage app settings"
on public.app_settings for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage message templates"
on public.message_templates for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage automation rules"
on public.automation_rules for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage message queue"
on public.message_queue for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can read message logs"
on public.message_logs for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can create message logs"
on public.message_logs for insert to authenticated
with check (public.current_user_is_admin());

create policy "Admins can read automation events"
on public.automation_events for select to authenticated
using (public.current_user_is_admin());
