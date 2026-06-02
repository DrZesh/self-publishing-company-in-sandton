-- Creative Books SA Supabase starter schema
-- Run this in the Supabase SQL editor, then add your admin user to public.profiles with role = 'admin'.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy if not exists "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

create policy if not exists "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Core tables used by the current compatibility layer.
-- These are intentionally broad JSON-friendly tables so the existing dashboard can be connected first,
-- then tightened with stricter columns after testing.

create table if not exists public.lead (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid,
  stage text default 'new',
  service_interest jsonb default '[]'::jsonb,
  estimated_value numeric default 0,
  weighted_value numeric default 0,
  source text,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  company text,
  book_title text,
  city text,
  province text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submission (
  id uuid primary key default gen_random_uuid(),
  form_type text,
  full_name text,
  email text,
  phone text,
  source_page text,
  service_interest jsonb default '[]'::jsonb,
  status text default 'new',
  additional_fields jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid,
  quote_number text,
  status text default 'draft',
  total numeric default 0,
  items jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid,
  invoice_number text,
  status text default 'draft',
  total numeric default 0,
  items jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid,
  invoice_id uuid,
  amount numeric default 0,
  status text default 'pending',
  provider text,
  provider_reference text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'todo',
  due_date timestamptz,
  assigned_to uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid,
  title text,
  status text default 'draft',
  unsigned_file_url text,
  signed_file_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_template (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  body text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  image_url text,
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  );
$$;

-- Enable RLS and allow admins to manage core dashboard tables.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['lead','contact','submission','quote','invoice','payment','task','document','email_template','service'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "Admins can manage %I" on public.%I', table_name, table_name);
    execute format('create policy "Admins can manage %I" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', table_name, table_name);
  end loop;
end $$;

-- Public quote forms may create submissions, but cannot read them.
create policy if not exists "Anyone can submit website forms"
on public.submission
for insert
to anon, authenticated
with check (true);
