-- Creative Books SA: client service updates, workflow settings and embedded sales pipeline

create table if not exists public.client_service_projects (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  service_type text not null check (service_type in (
    'Book Printing', 'Book Editing', 'Book Cover Design', 'Typesetting and Layout',
    'Manuscript Evaluation', 'Ghostwriting', 'Author Website', 'Ebook Publishing'
  )),
  project_title text not null,
  start_date date,
  notes text,
  assigned_team_member text,
  current_stage_key text,
  current_stage_label text,
  status text not null default 'active'
    check (status in ('active', 'on_hold', 'completed', 'cancelled')),
  payment_receipt_url text,
  payment_receipt_name text,
  invoice_url text,
  invoice_name text,
  stage_history jsonb not null default '[]'::jsonb,
  last_email_sent_at timestamptz,
  total_emails_sent integer not null default 0 check (total_emails_sent >= 0),
  welcome_email_sent boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists client_service_projects_status_idx
  on public.client_service_projects(status, updated_date desc);
create index if not exists client_service_projects_service_idx
  on public.client_service_projects(service_type, updated_date desc);
create index if not exists client_service_projects_email_idx
  on public.client_service_projects(lower(client_email));

create table if not exists public.service_email_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_service_projects(id) on delete cascade,
  client_name text,
  client_email text not null,
  project_title text,
  service_type text,
  stage_key text not null,
  stage_label text,
  subject text not null,
  body_html text,
  status text not null default 'sent'
    check (status in ('sent', 'failed', 'resent')),
  sent_at timestamptz not null default now(),
  sent_by text,
  error_message text,
  attachments_included text[] not null default '{}'::text[],
  is_welcome_email boolean not null default false,
  provider_message_id text,
  created_date timestamptz not null default now()
);

create index if not exists service_email_logs_project_idx
  on public.service_email_logs(project_id, sent_at desc);
create index if not exists service_email_logs_stage_idx
  on public.service_email_logs(project_id, stage_key, status);

create table if not exists public.client_service_workflows (
  id uuid primary key default gen_random_uuid(),
  service_type text not null unique,
  stages jsonb not null default '[]'::jsonb,
  updated_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.sales_pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stages jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_from_template text,
  template_id uuid,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists sales_pipelines_active_idx
  on public.sales_pipelines(is_active, created_date desc);

create table if not exists public.pipeline_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  stages jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.pipeline_deals (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.sales_pipelines(id) on delete cascade,
  stage_key text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  service_type text,
  project_title text,
  deal_value numeric(12,2) not null default 0,
  notes text,
  assigned_team_member text,
  linked_project_id uuid references public.client_service_projects(id) on delete set null,
  project_created_at timestamptz,
  project_created_by text,
  project_creation_failed boolean not null default false,
  project_creation_error text,
  won_at timestamptz,
  lost_at timestamptz,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (deal_value >= 0)
);

create index if not exists pipeline_deals_pipeline_stage_idx
  on public.pipeline_deals(pipeline_id, stage_key, updated_date desc);
create index if not exists pipeline_deals_linked_project_idx
  on public.pipeline_deals(linked_project_id) where linked_project_id is not null;

create or replace function public.touch_client_service_record()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.touch_client_service_record() from public;

create trigger client_service_projects_touch_updated
before update on public.client_service_projects
for each row execute procedure public.touch_client_service_record();

create trigger client_service_workflows_touch_updated
before update on public.client_service_workflows
for each row execute procedure public.touch_client_service_record();

create trigger sales_pipelines_touch_updated
before update on public.sales_pipelines
for each row execute procedure public.touch_client_service_record();

create trigger pipeline_templates_touch_updated
before update on public.pipeline_templates
for each row execute procedure public.touch_client_service_record();

create trigger pipeline_deals_touch_updated
before update on public.pipeline_deals
for each row execute procedure public.touch_client_service_record();

create or replace function public.update_client_service_stage(
  p_project_id uuid,
  p_stage_key text,
  p_stage_label text,
  p_updated_by text
)
returns public.client_service_projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.client_service_projects%rowtype;
  v_entry jsonb;
begin
  select * into v_project
  from public.client_service_projects
  where id = p_project_id
  for update;

  if not found then
    raise exception 'Project not found';
  end if;

  v_entry := jsonb_build_object(
    'stage_key', p_stage_key,
    'stage_label', p_stage_label,
    'updated_at', now(),
    'updated_by', coalesce(p_updated_by, 'Admin'),
    'email_sent', false
  );

  update public.client_service_projects
  set
    current_stage_key = p_stage_key,
    current_stage_label = p_stage_label,
    stage_history = coalesce(stage_history, '[]'::jsonb) || jsonb_build_array(v_entry),
    welcome_email_sent = case when p_stage_key = 'intro' then false else welcome_email_sent end
  where id = p_project_id
  returning * into v_project;

  return v_project;
end;
$$;

revoke all on function public.update_client_service_stage(uuid, text, text, text) from public, anon;
grant execute on function public.update_client_service_stage(uuid, text, text, text) to authenticated, service_role;

create or replace function public.mark_client_service_stage_email_sent(
  p_project_id uuid,
  p_stage_key text
)
returns public.client_service_projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project public.client_service_projects%rowtype;
  v_history jsonb;
begin
  select * into v_project
  from public.client_service_projects
  where id = p_project_id
  for update;

  if not found then
    raise exception 'Project not found';
  end if;

  select coalesce(jsonb_agg(
    case
      when item ->> 'stage_key' = p_stage_key
        then jsonb_set(item, '{email_sent}', 'true'::jsonb, true)
      else item
    end
    order by ordinality
  ), '[]'::jsonb)
  into v_history
  from jsonb_array_elements(coalesce(v_project.stage_history, '[]'::jsonb)) with ordinality as entries(item, ordinality);

  update public.client_service_projects
  set
    stage_history = v_history,
    last_email_sent_at = now(),
    total_emails_sent = total_emails_sent + 1,
    welcome_email_sent = case when p_stage_key = 'intro' then true else welcome_email_sent end
  where id = p_project_id
  returning * into v_project;

  return v_project;
end;
$$;

revoke all on function public.mark_client_service_stage_email_sent(uuid, text) from public, anon;
grant execute on function public.mark_client_service_stage_email_sent(uuid, text) to authenticated, service_role;

alter table public.client_service_projects enable row level security;
alter table public.service_email_logs enable row level security;
alter table public.client_service_workflows enable row level security;
alter table public.sales_pipelines enable row level security;
alter table public.pipeline_templates enable row level security;
alter table public.pipeline_deals enable row level security;

create policy "Admins can manage client service projects"
on public.client_service_projects for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage service email logs"
on public.service_email_logs for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage client service workflows"
on public.client_service_workflows for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage sales pipelines"
on public.sales_pipelines for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage pipeline templates"
on public.pipeline_templates for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage pipeline deals"
on public.pipeline_deals for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
