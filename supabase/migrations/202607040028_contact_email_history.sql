-- Creative Books SA: direct contact email history and threading

create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  direction text not null default 'outbound'
    check (direction in ('outbound', 'inbound')),
  from_address text,
  to_addresses text[] not null default '{}'::text[],
  cc_addresses text[] not null default '{}'::text[],
  bcc_addresses text[] not null default '{}'::text[],
  subject text not null,
  body_html text,
  body_text text,
  attachments jsonb not null default '[]'::jsonb,
  thread_id text,
  external_id text,
  read_status text not null default 'read'
    check (read_status in ('read', 'unread')),
  sent_at timestamptz,
  resend_id text,
  status text not null default 'sent'
    check (status in ('sent', 'failed', 'draft')),
  template_id uuid references public.email_templates(id) on delete set null,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists email_messages_contact_sent_idx
  on public.email_messages(contact_id, sent_at desc nulls last, created_date desc);
create index if not exists email_messages_thread_idx
  on public.email_messages(thread_id, created_date) where thread_id is not null;
create index if not exists email_messages_external_idx
  on public.email_messages(external_id) where external_id is not null;

create or replace function public.touch_email_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.touch_email_message() from public;

drop trigger if exists email_messages_touch_updated on public.email_messages;
create trigger email_messages_touch_updated
before update on public.email_messages
for each row execute procedure public.touch_email_message();

alter table public.email_messages enable row level security;

create policy "Admins can manage contact email history"
on public.email_messages for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
