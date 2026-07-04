-- Creative Books SA: Appointment booking hardening

-- Signed-in portal users should still be able to view public booking options.
drop policy if exists "Authenticated users can read booking services" on public.booking_services;
create policy "Authenticated users can read booking services"
on public.booking_services for select to authenticated
using (is_active = true or public.current_user_is_admin());

drop policy if exists "Authenticated admins can read availability rules" on public.availability_rules;
create policy "Authenticated users can read availability rules"
on public.availability_rules for select to authenticated
using (true);

-- Protect every route into approved status, including direct administrative
-- table updates, not only the approval RPC.
create or replace function public.prevent_approved_appointment_overlap()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'approved' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.date::text, 82421));

  if exists (
    select 1
    from public.appointments a
    where a.id <> new.id
      and a.date = new.date
      and a.status = 'approved'
      and public.hhmm_to_minutes(new.start_time) < public.hhmm_to_minutes(a.end_time)
      and public.hhmm_to_minutes(new.end_time) > public.hhmm_to_minutes(a.start_time)
  ) then
    raise exception 'This time overlaps an already approved appointment';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_approved_appointment_overlap() from public;

drop trigger if exists appointments_prevent_approved_overlap on public.appointments;
create trigger appointments_prevent_approved_overlap
before insert or update of status, date, start_time, end_time on public.appointments
for each row execute procedure public.prevent_approved_appointment_overlap();
