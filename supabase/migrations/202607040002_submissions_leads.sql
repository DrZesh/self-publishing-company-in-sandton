-- Creative Books SA: Contacts, Submissions and Leads foundation

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  role text not null default 'author'
    check (role in ('author', 'publisher', 'agent', 'other')),
  lifecycle_stage text not null default 'lead'
    check (lifecycle_stage in ('subscriber', 'lead', 'customer', 'repeat_customer', 'past_customer')),
  city text,
  province text,
  website_url text,
  description text,
  book_title text,
  pipeline_stage text default 'New Enquiry',
  pipeline_value numeric(12,2) not null default 0,
  pipeline_owner text,
  lost_reason text,
  first_contact_date timestamptz not null default now(),
  last_contact_date timestamptz not null default now(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create unique index if not exists contacts_email_lower_unique
  on public.contacts (lower(email));
create index if not exists contacts_lifecycle_stage_idx
  on public.contacts (lifecycle_stage);
create index if not exists contacts_created_date_idx
  on public.contacts (created_date desc);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null default 'other'
    check (form_type in ('contact', 'quote', 'newsletter', 'package_order', 'service_enquiry', 'other')),
  source_page text,
  full_name text not null,
  email text not null,
  phone text,
  message text,
  service_interest text[] not null default '{}',
  budget text,
  book_title text,
  book_genre text,
  book_page_count integer,
  book_word_count integer,
  additional_fields jsonb not null default '{}'::jsonb,
  marketing_source text default 'direct',
  search_keywords text,
  referrer_url text,
  landing_page text,
  pages_viewed text[] not null default '{}',
  session_duration_seconds integer not null default 0,
  device_type text,
  browser text,
  city text,
  country text default 'South Africa',
  ip_address_hash text,
  internal_notes text,
  status text not null default 'new'
    check (status in ('new', 'read', 'converted_to_lead', 'spam', 'archived')),
  contact_id uuid references public.contacts(id) on delete set null,
  lead_id uuid,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists submissions_status_created_idx
  on public.submissions (status, created_date desc);
create index if not exists submissions_email_lower_idx
  on public.submissions (lower(email));
create index if not exists submissions_contact_id_idx
  on public.submissions (contact_id);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete restrict,
  source_submission_id uuid references public.submissions(id) on delete set null,
  stage text not null default 'new'
    check (stage in ('new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost')),
  service_interest text[] not null default '{}',
  description text,
  tags text[] not null default '{}',
  estimated_value numeric(12,2) not null default 0,
  probability_percent integer not null default 50
    check (probability_percent between 0 and 100),
  weighted_value numeric(12,2) not null default 0,
  expected_close_date date,
  next_action text,
  next_action_due date,
  lost_reason text,
  lost_reason_detail text,
  owner_id uuid references public.profiles(id) on delete set null,
  stage_changed_at timestamptz not null default now(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists leads_stage_created_idx
  on public.leads (stage, created_date desc);
create index if not exists leads_contact_id_idx
  on public.leads (contact_id);
create index if not exists leads_source_submission_id_idx
  on public.leads (source_submission_id);
create index if not exists leads_owner_id_idx
  on public.leads (owner_id);

alter table public.submissions
  add constraint submissions_lead_id_fkey
  foreign key (lead_id) references public.leads(id) on delete set null;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now()
);

create index if not exists activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id, created_date desc);

create or replace function public.set_crm_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_date on public.contacts;
create trigger contacts_set_updated_date
before update on public.contacts
for each row execute procedure public.set_crm_updated_date();

drop trigger if exists submissions_set_updated_date on public.submissions;
create trigger submissions_set_updated_date
before update on public.submissions
for each row execute procedure public.set_crm_updated_date();

drop trigger if exists leads_set_updated_date on public.leads;
create trigger leads_set_updated_date
before update on public.leads
for each row execute procedure public.set_crm_updated_date();

create or replace function public.set_lead_weighted_value()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.weighted_value = round(new.estimated_value * new.probability_percent / 100.0, 2);

  if tg_op = 'INSERT' or new.stage is distinct from old.stage then
    new.stage_changed_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists leads_calculate_weighted_value on public.leads;
create trigger leads_calculate_weighted_value
before insert or update of estimated_value, probability_percent, stage on public.leads
for each row execute procedure public.set_lead_weighted_value();

create or replace function public.convert_submission_to_lead(
  p_submission_id uuid,
  p_estimated_value numeric default 0,
  p_probability_percent integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_submission public.submissions%rowtype;
  v_contact public.contacts%rowtype;
  v_lead public.leads%rowtype;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_probability_percent < 0 or p_probability_percent > 100 then
    raise exception 'Probability must be between 0 and 100';
  end if;

  select * into v_submission
  from public.submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Submission not found';
  end if;

  if v_submission.lead_id is not null then
    select * into v_lead from public.leads where id = v_submission.lead_id;
    select * into v_contact from public.contacts where id = v_submission.contact_id;
    return jsonb_build_object('lead', to_jsonb(v_lead), 'contact', to_jsonb(v_contact), 'already_converted', true);
  end if;

  if v_submission.contact_id is not null then
    select * into v_contact from public.contacts where id = v_submission.contact_id;
  end if;

  if v_contact.id is null then
    select * into v_contact
    from public.contacts
    where lower(email) = lower(v_submission.email)
    limit 1;
  end if;

  if v_contact.id is null then
    insert into public.contacts (
      full_name,
      email,
      phone,
      lifecycle_stage,
      book_title,
      city,
      first_contact_date,
      last_contact_date
    ) values (
      v_submission.full_name,
      v_submission.email,
      v_submission.phone,
      'lead',
      v_submission.book_title,
      v_submission.city,
      now(),
      now()
    )
    returning * into v_contact;
  else
    update public.contacts
    set last_contact_date = now(),
        phone = coalesce(public.contacts.phone, v_submission.phone),
        book_title = coalesce(public.contacts.book_title, v_submission.book_title)
    where id = v_contact.id
    returning * into v_contact;
  end if;

  insert into public.leads (
    contact_id,
    source_submission_id,
    stage,
    service_interest,
    description,
    tags,
    estimated_value,
    probability_percent,
    owner_id
  ) values (
    v_contact.id,
    v_submission.id,
    'new',
    coalesce(v_submission.service_interest, '{}'),
    coalesce(v_submission.message, ''),
    array['from-submission'],
    coalesce(p_estimated_value, 0),
    coalesce(p_probability_percent, 50),
    auth.uid()
  )
  returning * into v_lead;

  update public.submissions
  set contact_id = v_contact.id,
      lead_id = v_lead.id,
      status = 'converted_to_lead'
  where id = v_submission.id;

  insert into public.activity_logs (
    entity_type,
    entity_id,
    action,
    actor_id,
    description,
    metadata
  ) values (
    'submission',
    v_submission.id,
    'converted_to_lead',
    auth.uid(),
    'Submission converted to lead',
    jsonb_build_object('lead_id', v_lead.id, 'contact_id', v_contact.id)
  );

  return jsonb_build_object('lead', to_jsonb(v_lead), 'contact', to_jsonb(v_contact), 'already_converted', false);
end;
$$;

revoke all on function public.convert_submission_to_lead(uuid, numeric, integer) from public;
grant execute on function public.convert_submission_to_lead(uuid, numeric, integer) to authenticated;

alter table public.contacts enable row level security;
alter table public.submissions enable row level security;
alter table public.leads enable row level security;
alter table public.activity_logs enable row level security;

-- Contacts
create policy "Admins can read contacts"
on public.contacts for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can create contacts"
on public.contacts for insert to authenticated
with check (public.current_user_is_admin());

create policy "Admins can update contacts"
on public.contacts for update to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can delete contacts"
on public.contacts for delete to authenticated
using (public.current_user_is_admin());

-- Submissions
create policy "Admins can read submissions"
on public.submissions for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can create submissions"
on public.submissions for insert to authenticated
with check (public.current_user_is_admin());

create policy "Admins can update submissions"
on public.submissions for update to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can delete submissions"
on public.submissions for delete to authenticated
using (public.current_user_is_admin());

-- Leads
create policy "Admins can read leads"
on public.leads for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can create leads"
on public.leads for insert to authenticated
with check (public.current_user_is_admin());

create policy "Admins can update leads"
on public.leads for update to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can delete leads"
on public.leads for delete to authenticated
using (public.current_user_is_admin());

-- Activity log
create policy "Admins can read activity logs"
on public.activity_logs for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can create activity logs"
on public.activity_logs for insert to authenticated
with check (public.current_user_is_admin());

-- Realtime for the inbox.
do $$
begin
  alter publication supabase_realtime add table public.submissions;
exception
  when duplicate_object then null;
end $$;
