-- Creative Books SA: Appointments, booking services and availability

create table if not exists public.booking_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 480),
  buffer_minutes integer not null default 15 check (buffer_minutes between 0 and 240),
  allowed_modes text[] not null default array['on_site', 'zoom']::text[],
  prep_tips text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (cardinality(allowed_modes) > 0),
  check (allowed_modes <@ array['on_site', 'zoom']::text[])
);

create index if not exists booking_services_active_sort_idx
  on public.booking_services(is_active, sort_order, name);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday text not null unique
    check (weekday in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time text,
  end_time text,
  is_open boolean not null default true,
  min_notice_hours integer not null default 24 check (min_notice_hours between 0 and 8760),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (start_time is null or start_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  check (end_time is null or end_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  check (not is_open or (start_time is not null and end_time is not null and start_time < end_time))
);

insert into public.availability_rules (weekday, start_time, end_time, is_open, min_notice_hours)
values
  ('Monday', '09:00', '17:00', true, 24),
  ('Tuesday', '09:00', '17:00', true, 24),
  ('Wednesday', '09:00', '17:00', true, 24),
  ('Thursday', '09:00', '17:00', true, 24),
  ('Friday', '09:00', '17:00', true, 24),
  ('Saturday', null, null, false, 24),
  ('Sunday', null, null, false, 24)
on conflict (weekday) do nothing;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text not null,
  client_phone text,
  service_id uuid references public.booking_services(id) on delete set null,
  service_name text not null,
  service_duration_minutes integer not null default 30 check (service_duration_minutes between 5 and 480),
  mode text not null default 'on_site' check (mode in ('on_site', 'zoom')),
  date date not null,
  start_time text not null,
  end_time text not null,
  client_note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'cancelled', 'completed', 'no_show')),
  zoom_link text,
  zoom_meeting_id text,
  decline_reason text,
  proposed_date date,
  proposed_start_time text,
  proposed_end_time text,
  linked_lead_id uuid references public.leads(id) on delete set null,
  linked_client_id uuid references public.contacts(id) on delete set null,
  google_event_id text,
  reminder_24h_sent boolean not null default false,
  reminder_1h_sent boolean not null default false,
  approved_at timestamptz,
  cancelled_at timestamptz,
  cancel_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  reschedule_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (start_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  check (end_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  check (start_time < end_time),
  check (proposed_start_time is null or proposed_start_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  check (proposed_end_time is null or proposed_end_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$')
);

create index if not exists appointments_status_date_idx
  on public.appointments(status, date, start_time);
create index if not exists appointments_date_status_idx
  on public.appointments(date, status, start_time);
create index if not exists appointments_client_email_idx
  on public.appointments(lower(client_email), created_date desc);
create index if not exists appointments_linked_client_idx
  on public.appointments(linked_client_id, created_date desc) where linked_client_id is not null;
create index if not exists appointments_linked_lead_idx
  on public.appointments(linked_lead_id, created_date desc) where linked_lead_id is not null;

create or replace function public.set_booking_module_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.set_booking_module_updated_date() from public;

drop trigger if exists booking_services_set_updated_date on public.booking_services;
create trigger booking_services_set_updated_date
before update on public.booking_services
for each row execute procedure public.set_booking_module_updated_date();

drop trigger if exists availability_rules_set_updated_date on public.availability_rules;
create trigger availability_rules_set_updated_date
before update on public.availability_rules
for each row execute procedure public.set_booking_module_updated_date();

drop trigger if exists appointments_set_updated_date on public.appointments;
create trigger appointments_set_updated_date
before update on public.appointments
for each row execute procedure public.set_booking_module_updated_date();

create or replace function public.hhmm_to_minutes(p_value text)
returns integer
language sql
immutable
strict
set search_path = ''
as $$
  select split_part(p_value, ':', 1)::integer * 60 + split_part(p_value, ':', 2)::integer;
$$;

revoke all on function public.hhmm_to_minutes(text) from public;
grant execute on function public.hhmm_to_minutes(text) to anon, authenticated, service_role;

create or replace function public.minutes_to_hhmm(p_minutes integer)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select lpad(((p_minutes / 60) % 24)::text, 2, '0') || ':' || lpad((p_minutes % 60)::text, 2, '0');
$$;

revoke all on function public.minutes_to_hhmm(integer) from public;
grant execute on function public.minutes_to_hhmm(integer) to anon, authenticated, service_role;

create or replace function public.booking_weekday_name(p_date date)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select case extract(dow from p_date)::integer
    when 0 then 'Sunday'
    when 1 then 'Monday'
    when 2 then 'Tuesday'
    when 3 then 'Wednesday'
    when 4 then 'Thursday'
    when 5 then 'Friday'
    when 6 then 'Saturday'
  end;
$$;

revoke all on function public.booking_weekday_name(date) from public;
grant execute on function public.booking_weekday_name(date) to anon, authenticated, service_role;

create or replace function public.get_available_appointment_slots(
  p_service_id uuid,
  p_date date
)
returns table(start_time text, end_time text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_service public.booking_services%rowtype;
  v_rule public.availability_rules%rowtype;
  v_notice_hours integer := 24;
  v_cursor integer;
  v_end integer;
  v_duration integer;
  v_step integer;
  v_slot_start text;
  v_slot_end text;
  v_local_now timestamp;
begin
  select * into v_service
  from public.booking_services
  where id = p_service_id
    and is_active = true;

  if not found then
    return;
  end if;

  select * into v_rule
  from public.availability_rules
  where weekday = public.booking_weekday_name(p_date);

  if not found or not v_rule.is_open or v_rule.start_time is null or v_rule.end_time is null then
    return;
  end if;

  select coalesce(min_notice_hours, 24)
  into v_notice_hours
  from public.availability_rules
  where weekday = 'Monday';

  v_notice_hours := coalesce(v_notice_hours, 24);
  v_duration := v_service.duration_minutes;
  v_step := v_service.duration_minutes + v_service.buffer_minutes;
  v_cursor := public.hhmm_to_minutes(v_rule.start_time);
  v_end := public.hhmm_to_minutes(v_rule.end_time);
  v_local_now := now() at time zone 'Africa/Johannesburg';

  while v_cursor + v_duration <= v_end loop
    v_slot_start := public.minutes_to_hhmm(v_cursor);
    v_slot_end := public.minutes_to_hhmm(v_cursor + v_duration);

    if (p_date::timestamp + v_slot_start::time) > (v_local_now + make_interval(hours => v_notice_hours))
       and not exists (
         select 1
         from public.appointments a
         where a.date = p_date
           and a.status = 'approved'
           and public.hhmm_to_minutes(v_slot_start) < public.hhmm_to_minutes(a.end_time)
           and public.hhmm_to_minutes(v_slot_end) > public.hhmm_to_minutes(a.start_time)
       ) then
      start_time := v_slot_start;
      end_time := v_slot_end;
      return next;
    end if;

    v_cursor := v_cursor + v_step;
  end loop;
end;
$$;

revoke all on function public.get_available_appointment_slots(uuid, date) from public;
grant execute on function public.get_available_appointment_slots(uuid, date) to anon, authenticated, service_role;

create or replace function public.approve_appointment(p_appointment_id uuid)
returns public.appointments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_appointment public.appointments%rowtype;
begin
  if not public.current_user_is_admin() and auth.role() <> 'service_role' then
    raise exception 'Admin access required';
  end if;

  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'Appointment not found';
  end if;

  if v_appointment.status <> 'pending' then
    raise exception 'Only pending appointments can be approved';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_appointment.date::text, 82421));

  if exists (
    select 1
    from public.appointments a
    where a.id <> v_appointment.id
      and a.date = v_appointment.date
      and a.status = 'approved'
      and public.hhmm_to_minutes(v_appointment.start_time) < public.hhmm_to_minutes(a.end_time)
      and public.hhmm_to_minutes(v_appointment.end_time) > public.hhmm_to_minutes(a.start_time)
  ) then
    raise exception 'This time overlaps an already approved appointment';
  end if;

  update public.appointments
  set status = 'approved',
      approved_at = now(),
      decline_reason = null
  where id = v_appointment.id
  returning * into v_appointment;

  return v_appointment;
end;
$$;

revoke all on function public.approve_appointment(uuid) from public;
grant execute on function public.approve_appointment(uuid) to authenticated, service_role;

alter table public.booking_services enable row level security;
alter table public.availability_rules enable row level security;
alter table public.appointments enable row level security;

create policy "Public can read active booking services"
on public.booking_services for select to anon
using (is_active = true);

create policy "Authenticated users can read booking services"
on public.booking_services for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can create booking services"
on public.booking_services for insert to authenticated
with check (public.current_user_is_admin());

create policy "Admins can update booking services"
on public.booking_services for update to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can delete booking services"
on public.booking_services for delete to authenticated
using (public.current_user_is_admin());

create policy "Public can read availability rules"
on public.availability_rules for select to anon
using (true);

create policy "Authenticated admins can read availability rules"
on public.availability_rules for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can update availability rules"
on public.availability_rules for update to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage appointments"
on public.appointments for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
