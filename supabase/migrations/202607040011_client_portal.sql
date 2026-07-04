-- Creative Books SA: Client Portal access

create table if not exists public.client_portal_access (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  access_token text not null unique default (
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  ),
  email text not null,
  is_active boolean not null default true,
  expires_at timestamptz,
  last_accessed_at timestamptz,
  access_count integer not null default 0 check (access_count >= 0),
  allowed_sections text[] not null default array['quotes', 'invoices', 'projects', 'documents']::text[],
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (allowed_sections <@ array['quotes', 'invoices', 'projects', 'documents']::text[])
);

create index if not exists client_portal_access_contact_idx
  on public.client_portal_access(contact_id, created_date desc);
create index if not exists client_portal_access_active_expiry_idx
  on public.client_portal_access(is_active, expires_at)
  where is_active = true;

create or replace function public.set_client_portal_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.set_client_portal_updated_date() from public;

drop trigger if exists client_portal_access_set_updated_date on public.client_portal_access;
create trigger client_portal_access_set_updated_date
before update on public.client_portal_access
for each row execute procedure public.set_client_portal_updated_date();

create or replace function public.consume_client_portal_access(p_token text)
returns public.client_portal_access
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_access public.client_portal_access%rowtype;
begin
  update public.client_portal_access
  set last_accessed_at = now(),
      access_count = access_count + 1
  where access_token = p_token
    and is_active = true
    and (expires_at is null or expires_at > now())
  returning * into v_access;

  if not found then
    return null;
  end if;

  return v_access;
end;
$$;

revoke all on function public.consume_client_portal_access(text) from public;
grant execute on function public.consume_client_portal_access(text) to anon, authenticated, service_role;

alter table public.client_portal_access enable row level security;

create policy "Admins can manage client portal access"
on public.client_portal_access for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
