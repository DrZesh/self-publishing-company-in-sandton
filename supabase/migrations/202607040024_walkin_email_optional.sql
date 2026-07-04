-- Walk-in visitors may check in with a phone number before providing email.
-- Standard public web forms continue enforcing email in the capture Edge Function.

alter table public.contacts
  alter column email drop not null;

alter table public.submissions
  alter column email drop not null;

-- Replace the email lookup index with a partial unique index that ignores rows
-- where no email address has been provided yet.
drop index if exists public.contacts_email_lower_unique;
create unique index if not exists contacts_email_lower_unique
  on public.contacts (lower(email))
  where email is not null;
