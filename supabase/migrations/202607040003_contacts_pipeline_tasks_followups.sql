-- Creative Books SA: Contacts, Pipeline, Tasks and Follow-up reminders

-- Extend contacts so the existing pipeline UI can be migrated without changing
-- its current business semantics.
alter table public.contacts
  add column if not exists country text default 'South Africa',
  add column if not exists whatsapp_number text,
  add column if not exists package_type text,
  add column if not exists deal_priority text
    check (deal_priority is null or deal_priority in ('High', 'Medium', 'Low')),
  add column if not exists probability integer
    check (probability is null or probability between 0 and 100),
  add column if not exists expected_close_date date,
  add column if not exists pipeline_stage_changed_at timestamptz not null default now();

create index if not exists contacts_pipeline_stage_idx
  on public.contacts (pipeline_stage);
create index if not exists contacts_pipeline_owner_idx
  on public.contacts (pipeline_owner);
create index if not exists contacts_pipeline_stage_changed_idx
  on public.contacts (pipeline_stage_changed_at desc);

-- Keep stage age accurate even when updates come from screens other than the
-- pipeline board.
create or replace function public.track_contact_pipeline_stage_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.pipeline_stage is distinct from old.pipeline_stage then
    new.pipeline_stage_changed_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists contacts_track_pipeline_stage_change on public.contacts;
create trigger contacts_track_pipeline_stage_change
before update of pipeline_stage on public.contacts
for each row execute procedure public.track_contact_pipeline_stage_change();

-- Log pipeline stage movement for auditability.
create or replace function public.log_contact_pipeline_stage_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.pipeline_stage is distinct from old.pipeline_stage then
    insert into public.activity_logs (
      entity_type,
      entity_id,
      action,
      actor_id,
      description,
      metadata
    ) values (
      'contact',
      new.id,
      'pipeline_stage_changed',
      auth.uid(),
      'Pipeline stage changed from ' || coalesce(old.pipeline_stage, 'Unassigned') || ' to ' || coalesce(new.pipeline_stage, 'Unassigned'),
      jsonb_build_object(
        'old_stage', old.pipeline_stage,
        'new_stage', new.pipeline_stage,
        'pipeline_value', new.pipeline_value
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists contacts_log_pipeline_stage_change on public.contacts;
create trigger contacts_log_pipeline_stage_change
after update of pipeline_stage on public.contacts
for each row execute procedure public.log_contact_pipeline_stage_change();

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  task_type text not null default 'General',
  contact_id uuid references public.contacts(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  due_date timestamptz not null,
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  status text not null default 'Pending'
    check (status in ('Pending', 'In Progress', 'Done', 'Cancelled')),
  assigned_to text,
  owner_id uuid references public.profiles(id) on delete set null,
  notes text,
  completed_at timestamptz,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists tasks_status_due_idx
  on public.tasks (status, due_date);
create index if not exists tasks_contact_id_idx
  on public.tasks (contact_id);
create index if not exists tasks_lead_id_idx
  on public.tasks (lead_id);
create index if not exists tasks_owner_id_idx
  on public.tasks (owner_id);

create or replace function public.prepare_task_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();

  if new.status = 'Done' and (tg_op = 'INSERT' or old.status is distinct from 'Done') then
    new.completed_at = now();
  elsif new.status is distinct from 'Done' then
    new.completed_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_prepare_write on public.tasks;
create trigger tasks_prepare_write
before insert or update on public.tasks
for each row execute procedure public.prepare_task_write();

alter table public.tasks enable row level security;

create policy "Admins can read tasks"
on public.tasks for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can create tasks"
on public.tasks for insert to authenticated
with check (public.current_user_is_admin());

create policy "Admins can update tasks"
on public.tasks for update to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can delete tasks"
on public.tasks for delete to authenticated
using (public.current_user_is_admin());

-- Unified reminder calculation for data already migrated to Supabase.
-- Quote reminders will be added when Quotes move to Supabase.
create or replace function public.get_follow_up_reminders()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_follow_ups jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_high integer := 0;
  v_medium integer := 0;
  v_low integer := 0;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  with reminders as (
    -- New leads older than 24 hours.
    select
      'lead_followup'::text as type,
      case
        when now() - l.created_date > interval '3 days' then 'high'
        else 'medium'
      end as priority,
      'Follow up with ' || coalesce(c.full_name, 'lead') as title,
      'New lead has not progressed from the New stage.' as description,
      c.id as contact_id,
      l.id as lead_id,
      null::uuid as submission_id,
      null::uuid as task_id,
      greatest(1, floor(extract(epoch from (now() - l.created_date)) / 86400))::integer as days_pending,
      null::integer as days_overdue,
      l.estimated_value,
      l.created_date as sort_date
    from public.leads l
    join public.contacts c on c.id = l.contact_id
    where l.stage = 'new'
      and l.created_date < now() - interval '24 hours'

    union all

    -- Leads in active stages with no movement for seven days.
    select
      'lead_followup'::text,
      case
        when now() - l.stage_changed_at > interval '14 days' then 'high'
        else 'medium'
      end,
      'Pipeline follow-up: ' || coalesce(c.full_name, 'lead'),
      'Lead has remained in ' || l.stage || ' without movement.',
      c.id,
      l.id,
      null::uuid,
      null::uuid,
      greatest(1, floor(extract(epoch from (now() - l.stage_changed_at)) / 86400))::integer,
      null::integer,
      l.estimated_value,
      l.stage_changed_at
    from public.leads l
    join public.contacts c on c.id = l.contact_id
    where l.stage in ('contacted', 'qualified', 'quoted', 'negotiating')
      and l.stage_changed_at < now() - interval '7 days'

    union all

    -- Public submissions that are still unread after 48 hours.
    select
      'submission_conversion'::text,
      case
        when now() - s.created_date > interval '5 days' then 'high'
        else 'medium'
      end,
      'Unread submission from ' || s.full_name,
      'Submission has remained unread for more than 48 hours.',
      s.contact_id,
      null::uuid,
      s.id,
      null::uuid,
      greatest(2, floor(extract(epoch from (now() - s.created_date)) / 86400))::integer,
      null::integer,
      null::numeric,
      s.created_date
    from public.submissions s
    where s.status = 'new'
      and s.created_date < now() - interval '48 hours'

    union all

    -- Overdue tasks.
    select
      'task_overdue'::text,
      case
        when t.priority = 'Urgent' or now() - t.due_date > interval '3 days' then 'high'
        when t.priority = 'High' then 'medium'
        else 'low'
      end,
      t.title,
      coalesce(t.notes, 'Task is overdue.'),
      t.contact_id,
      t.lead_id,
      null::uuid,
      t.id,
      null::integer,
      greatest(1, floor(extract(epoch from (now() - t.due_date)) / 86400))::integer,
      null::numeric,
      t.due_date
    from public.tasks t
    where t.status in ('Pending', 'In Progress')
      and t.due_date < now()
  ), ranked as (
    select *
    from reminders
    order by
      case priority when 'high' then 1 when 'medium' then 2 else 3 end,
      sort_date asc
    limit 100
  )
  select
    coalesce(jsonb_agg(
      jsonb_build_object(
        'type', type,
        'priority', priority,
        'title', title,
        'description', description,
        'contact_id', contact_id,
        'lead_id', lead_id,
        'submission_id', submission_id,
        'task_id', task_id,
        'days_pending', days_pending,
        'days_overdue', days_overdue,
        'estimated_value', estimated_value
      )
    ), '[]'::jsonb),
    count(*)::integer,
    count(*) filter (where priority = 'high')::integer,
    count(*) filter (where priority = 'medium')::integer,
    count(*) filter (where priority = 'low')::integer
  into v_follow_ups, v_total, v_high, v_medium, v_low
  from ranked;

  return jsonb_build_object(
    'followUps', v_follow_ups,
    'summary', jsonb_build_object(
      'total', v_total,
      'high', v_high,
      'medium', v_medium,
      'low', v_low
    )
  );
end;
$$;

revoke all on function public.get_follow_up_reminders() from public;
grant execute on function public.get_follow_up_reminders() to authenticated;

-- Contact pipeline activity is used by the detail drawer.
create or replace function public.get_contact_activity(p_contact_id uuid)
returns setof public.activity_logs
language sql
security definer
set search_path = ''
as $$
  select a.*
  from public.activity_logs a
  where public.current_user_is_admin()
    and (
      (a.entity_type = 'contact' and a.entity_id = p_contact_id)
      or (
        a.entity_type = 'submission'
        and exists (
          select 1
          from public.submissions s
          where s.id = a.entity_id
            and s.contact_id = p_contact_id
        )
      )
      or (
        a.entity_type = 'lead'
        and exists (
          select 1
          from public.leads l
          where l.id = a.entity_id
            and l.contact_id = p_contact_id
        )
      )
    )
  order by a.created_date desc
  limit 100;
$$;

revoke all on function public.get_contact_activity(uuid) from public;
grant execute on function public.get_contact_activity(uuid) to authenticated;
