create table if not exists public.cover_template_lead (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public.cover_template_lead enable row level security;
create index if not exists cover_template_lead_data_gin on public.cover_template_lead using gin (data jsonb_path_ops);
create index if not exists cover_template_lead_created_idx on public.cover_template_lead (created_date desc,id);
insert into cb_private.entity_registry(table_name) values ('cover_template_lead') on conflict do nothing;
revoke all on public.cover_template_lead from anon;
grant select,insert,update,delete on public.cover_template_lead to authenticated,service_role;
create policy staff_access on public.cover_template_lead for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create trigger touch_record before update on public.cover_template_lead for each row execute function cb_private.touch_record();
