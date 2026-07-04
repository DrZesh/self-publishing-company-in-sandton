-- Creative Books SA: standalone admin email template library

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'general'
    check (category in ('general', 'follow_up', 'quote', 'onboarding', 'invoice', 'marketing')),
  subject text not null,
  body_html text not null default '',
  is_active boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists email_templates_category_active_idx
  on public.email_templates(category, is_active, created_date desc);
create index if not exists email_templates_name_idx
  on public.email_templates(lower(name));

create or replace function public.touch_email_template_library()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.touch_email_template_library() from public;

drop trigger if exists email_templates_touch_updated on public.email_templates;
create trigger email_templates_touch_updated
before update on public.email_templates
for each row execute procedure public.touch_email_template_library();

alter table public.email_templates enable row level security;

create policy "Admins can manage email template library"
on public.email_templates for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
