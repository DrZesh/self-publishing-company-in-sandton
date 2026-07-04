-- Creative Books SA: authors, book archive and client collection records

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  full_name text not null,
  pen_name text,
  email text,
  phone text,
  books_published text[] not null default '{}'::text[],
  services_used text[] not null default '{}'::text[],
  preferred_book_size text,
  author_website text,
  author_bio text,
  profile_photo_url text,
  marketing_permissions boolean not null default false,
  testimonial text,
  testimonial_approved boolean not null default false,
  is_vip boolean not null default false,
  vip_reason text,
  reprint_history jsonb not null default '[]'::jsonb,
  total_books_printed integer not null default 0 check (total_books_printed >= 0),
  notes text,
  tags text[] not null default '{}'::text[],
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists authors_contact_idx
  on public.authors(contact_id) where contact_id is not null;
create index if not exists authors_name_idx
  on public.authors(lower(full_name));
create index if not exists authors_vip_idx
  on public.authors(is_vip, created_date desc) where is_vip = true;

create table if not exists public.book_records (
  id uuid primary key default gen_random_uuid(),
  book_title text not null,
  author_name text not null,
  pen_name text,
  contact_id uuid references public.contacts(id) on delete set null,
  author_id uuid references public.authors(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  genre text check (genre is null or genre in (
    'Fiction', 'Non-Fiction', 'Christian', 'Biography', 'Memoir',
    'Children''s', 'Poetry', 'Academic', 'Business', 'Self-Help', 'Other'
  )),
  services_provided text[] not null default '{}'::text[],
  print_specs jsonb not null default '{}'::jsonb,
  final_cover_url text,
  final_interior_url text,
  thumbnail_url text,
  reprint_count integer not null default 0 check (reprint_count >= 0),
  last_reprint_date date,
  project_status text not null default 'In Progress'
    check (project_status in ('In Progress', 'Completed', 'Delivered', 'Archived')),
  notes text,
  year_completed integer check (year_completed is null or year_completed between 1900 and 2200),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists book_records_author_idx
  on public.book_records(author_id, created_date desc) where author_id is not null;
create index if not exists book_records_contact_idx
  on public.book_records(contact_id, created_date desc) where contact_id is not null;
create index if not exists book_records_project_idx
  on public.book_records(project_id) where project_id is not null;
create index if not exists book_records_title_idx
  on public.book_records(lower(book_title));

create table if not exists public.collection_signatures (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  book_title text,
  collected_by text not null,
  collector_id_number text,
  collection_date timestamptz not null default now(),
  quantity_collected integer not null check (quantity_collected > 0),
  signature_image_url text,
  staff_member text,
  collection_notes text,
  invoice_id uuid references public.invoices(id) on delete set null,
  fully_paid_at_collection boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists collection_signatures_project_idx
  on public.collection_signatures(project_id, collection_date desc);
create index if not exists collection_signatures_contact_idx
  on public.collection_signatures(contact_id, collection_date desc);
create index if not exists collection_signatures_date_idx
  on public.collection_signatures(collection_date desc);

create or replace function public.touch_publishing_record()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.touch_publishing_record() from public;

drop trigger if exists authors_touch_updated on public.authors;
create trigger authors_touch_updated
before update on public.authors
for each row execute procedure public.touch_publishing_record();

drop trigger if exists book_records_touch_updated on public.book_records;
create trigger book_records_touch_updated
before update on public.book_records
for each row execute procedure public.touch_publishing_record();

drop trigger if exists collection_signatures_touch_updated on public.collection_signatures;
create trigger collection_signatures_touch_updated
before update on public.collection_signatures
for each row execute procedure public.touch_publishing_record();

create or replace function public.sync_author_book_titles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_author_id uuid;
begin
  if tg_op = 'DELETE' then
    v_author_id := old.author_id;
  else
    v_author_id := new.author_id;
  end if;

  if v_author_id is not null then
    update public.authors
    set books_published = coalesce((
      select array_agg(br.book_title order by br.created_date)
      from public.book_records br
      where br.author_id = v_author_id
    ), '{}'::text[])
    where id = v_author_id;
  end if;

  if tg_op = 'UPDATE'
     and old.author_id is distinct from new.author_id
     and old.author_id is not null then
    update public.authors
    set books_published = coalesce((
      select array_agg(br.book_title order by br.created_date)
      from public.book_records br
      where br.author_id = old.author_id
    ), '{}'::text[])
    where id = old.author_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_author_book_titles() from public;

drop trigger if exists book_records_sync_author_titles on public.book_records;
create trigger book_records_sync_author_titles
after insert or delete or update of author_id, book_title on public.book_records
for each row execute procedure public.sync_author_book_titles();

create or replace function public.complete_project_on_collection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.projects
  set
    stage = 'Delivered',
    current_stage = 'Delivered',
    waiting_on = 'None',
    stage_changed_at = now()
  where id = new.project_id
    and public.project_stage_order(stage) <= public.project_stage_order('Delivered');

  return new;
end;
$$;

revoke all on function public.complete_project_on_collection() from public;

drop trigger if exists collection_signatures_complete_project on public.collection_signatures;
create trigger collection_signatures_complete_project
after insert on public.collection_signatures
for each row execute procedure public.complete_project_on_collection();

alter table public.authors enable row level security;
alter table public.book_records enable row level security;
alter table public.collection_signatures enable row level security;

create policy "Admins can manage authors"
on public.authors for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage book records"
on public.book_records for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage collection signatures"
on public.collection_signatures for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
