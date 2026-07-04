-- Creative Books SA: configurable workflow pipeline definitions

create table if not exists public.workflow_pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  pipeline_type text not null default 'sales'
    check (pipeline_type in (
      'sales', 'printing', 'editing', 'cover_design', 'typesetting',
      'full_publishing', 'ghostwriting', 'author_website', 'contract',
      'invoice', 'delivery', 'custom'
    )),
  stages jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_default boolean not null default false,
  entity_type text not null default 'contact'
    check (entity_type in ('contact', 'project')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists workflow_pipelines_type_active_idx
  on public.workflow_pipelines(pipeline_type, is_active, created_date desc);
create index if not exists workflow_pipelines_entity_idx
  on public.workflow_pipelines(entity_type, is_active);

create or replace function public.touch_workflow_pipeline()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.touch_workflow_pipeline() from public;

drop trigger if exists workflow_pipelines_touch_updated on public.workflow_pipelines;
create trigger workflow_pipelines_touch_updated
before update on public.workflow_pipelines
for each row execute procedure public.touch_workflow_pipeline();

alter table public.workflow_pipelines enable row level security;

create policy "Admins can manage workflow pipelines"
on public.workflow_pipelines for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
