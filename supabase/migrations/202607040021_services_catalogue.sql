-- Creative Books SA: admin services and pricing catalogue

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'printing', 'editing', 'design', 'writing', 'publishing', 'other'
  )),
  service_name text not null,
  package_name text,
  description text,
  price numeric(12,2) check (price is null or price >= 0),
  pricing_type text not null check (pricing_type in (
    'fixed', 'per_page', 'per_word', 'per_copy', 'per_colour_page', 'custom'
  )),
  base_price numeric(12,4) check (base_price is null or base_price >= 0),
  quantity integer check (quantity is null or quantity > 0),
  book_size_condition text,
  page_count_min integer check (page_count_min is null or page_count_min >= 0),
  page_count_max integer check (page_count_max is null or page_count_max >= 0),
  word_count_min integer check (word_count_min is null or word_count_min >= 0),
  word_count_max integer check (word_count_max is null or word_count_max >= 0),
  copy_quantity_min integer check (copy_quantity_min is null or copy_quantity_min >= 0),
  copy_quantity_max integer check (copy_quantity_max is null or copy_quantity_max >= 0),
  add_on_condition text,
  notes text,
  active boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (page_count_max is null or page_count_min is null or page_count_max >= page_count_min),
  check (word_count_max is null or word_count_min is null or word_count_max >= word_count_min),
  check (copy_quantity_max is null or copy_quantity_min is null or copy_quantity_max >= copy_quantity_min)
);

create index if not exists services_category_idx
  on public.services(category, service_name);
create index if not exists services_active_idx
  on public.services(active, category) where active = true;
create index if not exists services_name_idx
  on public.services(lower(service_name));

create or replace function public.touch_service_catalogue()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.touch_service_catalogue() from public;

drop trigger if exists services_touch_updated on public.services;
create trigger services_touch_updated
before update on public.services
for each row execute procedure public.touch_service_catalogue();

alter table public.services enable row level security;

create policy "Admins can manage services"
on public.services for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
