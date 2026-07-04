-- Creative Books SA: Documents, Clause Library and E-signatures

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  project_id text,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  document_title text,
  client_name_snapshot text,
  is_template boolean not null default false,
  is_favourite boolean not null default false,
  template_label text,
  template_status text not null default 'Draft Template'
    check (template_status in ('Draft Template', 'Pending Approval', 'Active', 'Archived Template')),
  requires_signature boolean not null default false,
  default_expiry_days integer not null default 14
    check (default_expiry_days between 1 and 365),
  labels text[] not null default '{}',
  ai_summary text,
  access_revoked boolean not null default false,
  access_revoked_at timestamptz,
  category text not null default 'Client Supplied'
    check (category in (
      'Signed Contract', 'Unsigned Contract', 'Quotation', 'Invoice', 'Payment Proof',
      'Manuscript', 'Book Cover File', 'Typesetting File', 'Final Print File',
      'Proof Approval', 'ISBN Document', 'Copyright Page', 'Printing Spec',
      'Courier Document', 'Client Supplied', 'Internal Admin', 'NDA',
      'Publishing Agreement', 'Printing Terms', 'Supplier Agreement',
      'Payment Agreement', 'Manuscript Submission Form', 'Cover Design Brief',
      'Book Cover Agreement', 'Editing Agreement', 'Printing Agreement',
      'Freelancer Agreement', 'Approval Form', 'Author Agreement',
      'Legal Document', 'Internal Document', 'Other'
    )),
  status text not null default 'Draft'
    check (status in (
      'Draft', 'Sent to Client', 'Opened', 'Viewed', 'Downloaded',
      'Awaiting Signature', 'Signed', 'Awaiting Approval', 'Approved',
      'Rejected', 'Changes Requested', 'Payment Proof Uploaded', 'Expired', 'Archived'
    )),
  file_name text not null,
  file_url text not null,
  signed_document_url text,
  file_type text,
  file_size_kb integer not null default 0 check (file_size_kb >= 0),
  version integer not null default 1 check (version > 0),
  parent_doc_id uuid references public.documents(id) on delete set null,
  is_latest_version boolean not null default true,
  book_title text,
  notes text,
  internal_notes text,
  uploaded_by text,
  secure_token text unique,
  expires_at timestamptz,
  sent_at timestamptz,
  opened_at timestamptz,
  viewed_at timestamptz,
  downloaded_at timestamptz,
  signed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  download_count integer not null default 0 check (download_count >= 0),
  open_count integer not null default 0 check (open_count >= 0),
  client_message text,
  proof_url text,
  signature_url text,
  reminder_sent_count integer not null default 0 check (reminder_sent_count >= 0),
  last_reminder_at timestamptz,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (not access_revoked or access_revoked_at is not null)
);

create index if not exists documents_contact_idx on public.documents(contact_id, created_date desc);
create index if not exists documents_status_idx on public.documents(status, created_date desc);
create index if not exists documents_category_idx on public.documents(category, created_date desc);
create index if not exists documents_templates_idx on public.documents(is_template, template_status, is_favourite);
create index if not exists documents_quote_idx on public.documents(quote_id) where quote_id is not null;
create index if not exists documents_invoice_idx on public.documents(invoice_id) where invoice_id is not null;
create index if not exists documents_parent_idx on public.documents(parent_doc_id) where parent_doc_id is not null;

create table if not exists public.document_activities (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  action text not null
    check (action in (
      'uploaded', 'sent', 'resent', 'opened', 'viewed', 'downloaded',
      'signed', 'approved', 'rejected', 'expired', 'archived',
      'payment_proof_uploaded', 'changes_requested', 'question_asked',
      'link_clicked', 'password_entered', 'version_created', 'reminder_sent'
    )),
  actor_type text not null default 'client'
    check (actor_type in ('admin', 'client', 'system')),
  actor_email text,
  actor_ip_hash text,
  actor_device text,
  actor_browser text,
  actor_user_agent text,
  notes text,
  timestamp timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists document_activities_document_idx
  on public.document_activities(document_id, timestamp desc);
create index if not exists document_activities_contact_idx
  on public.document_activities(contact_id, timestamp desc) where contact_id is not null;

create table if not exists public.clauses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General'
    check (category in (
      'Confidentiality', 'Payment', 'Intellectual Property', 'Cancellation',
      'Approval', 'Revision Limits', 'Delivery', 'Liability',
      'Dispute Resolution', 'General', 'NDA', 'Supplier'
    )),
  content text not null,
  short_description text,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists clauses_active_sort_idx
  on public.clauses(is_active, sort_order, name);

create table if not exists public.e_signature_requests (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  project_id text,
  title text not null,
  file_url text not null,
  file_name text,
  document_category text,
  signing_order text not null default 'admin_first'
    check (signing_order in ('admin_first', 'client_first', 'any_order')),
  status text not null default 'Draft'
    check (status in (
      'Draft', 'Prepared', 'Admin Fields Completed', 'Admin Signed',
      'Sent', 'Delivered', 'Opened', 'Viewed', 'Signing Started',
      'Client Signed', 'Fully Signed', 'Signed', 'Declined', 'Expired',
      'Cancelled', 'Archived'
    )),
  contract_fields jsonb not null default '[]'::jsonb,
  admin_field_values jsonb not null default '{}'::jsonb,
  client_field_values jsonb not null default '{}'::jsonb,
  admin_signature_url text,
  admin_signed_at timestamptz,
  admin_signer_name text,
  admin_signer_email text,
  recipient_name text,
  recipient_email text not null,
  recipient_phone text,
  company_name text,
  sign_token text unique,
  expires_at timestamptz,
  allow_download_before_sign boolean not null default true,
  allow_download_after_sign boolean not null default true,
  send_whatsapp boolean not null default false,
  email_subject text,
  email_message text,
  reminder_days integer[] not null default '{}',
  reminder_sent_count integer not null default 0 check (reminder_sent_count >= 0),
  last_reminder_at timestamptz,
  sent_at timestamptz,
  opened_at timestamptz,
  viewed_at timestamptz,
  signing_started_at timestamptz,
  signed_at timestamptz,
  declined_at timestamptz,
  decline_reason text,
  signature_image_url text,
  signature_method text check (signature_method is null or signature_method in ('drawn', 'typed')),
  signer_confirmed_name text,
  signer_confirmed_email text,
  signer_ip_hash text,
  signer_device text,
  signer_browser text,
  signer_user_agent text,
  consent_read boolean not null default false,
  consent_identity boolean not null default false,
  consent_authorised boolean not null default false,
  consent_electronic boolean not null default false,
  consent_submit boolean not null default false,
  signed_document_url text,
  pdf_generation_status text check (pdf_generation_status is null or pdf_generation_status in ('pending', 'processing', 'done', 'failed')),
  audit_trail jsonb not null default '[]'::jsonb,
  sent_by text,
  notes text,
  open_count integer not null default 0 check (open_count >= 0),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists esignature_status_idx
  on public.e_signature_requests(status, created_date desc);
create index if not exists esignature_contact_idx
  on public.e_signature_requests(contact_id, created_date desc) where contact_id is not null;
create index if not exists esignature_document_idx
  on public.e_signature_requests(document_id) where document_id is not null;
create index if not exists esignature_expiry_idx
  on public.e_signature_requests(expires_at) where status in ('Sent', 'Delivered', 'Opened', 'Viewed', 'Signing Started');

create table if not exists public.signature_audit_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.e_signature_requests(id) on delete cascade,
  event text not null,
  actor_type text not null default 'system'
    check (actor_type in ('admin', 'client', 'system')),
  actor_email text,
  ip_hash text,
  device text,
  browser text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now()
);

create index if not exists signature_audit_request_idx
  on public.signature_audit_events(request_id, created_date asc);

create or replace function public.set_document_module_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.set_document_module_updated_date() from public;

drop trigger if exists documents_set_updated_date on public.documents;
create trigger documents_set_updated_date
before update on public.documents
for each row execute procedure public.set_document_module_updated_date();

drop trigger if exists clauses_set_updated_date on public.clauses;
create trigger clauses_set_updated_date
before update on public.clauses
for each row execute procedure public.set_document_module_updated_date();

drop trigger if exists esignature_set_updated_date on public.e_signature_requests;
create trigger esignature_set_updated_date
before update on public.e_signature_requests
for each row execute procedure public.set_document_module_updated_date();

create or replace function public.log_document_upload()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.document_activities (
    document_id, contact_id, action, actor_type, actor_email, notes, timestamp
  ) values (
    new.id,
    new.contact_id,
    'uploaded',
    case when auth.role() = 'service_role' then 'system' else 'admin' end,
    coalesce(auth.jwt() ->> 'email', new.uploaded_by),
    case when new.is_template then 'Document template added.' else 'Document uploaded.' end,
    now()
  );
  return new;
end;
$$;

revoke all on function public.log_document_upload() from public;

drop trigger if exists documents_log_upload on public.documents;
create trigger documents_log_upload
after insert on public.documents
for each row execute procedure public.log_document_upload();

create or replace function public.log_esignature_request_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.signature_audit_events (
    request_id, event, actor_type, actor_email, metadata
  ) values (
    new.id,
    'created',
    case when auth.role() = 'service_role' then 'system' else 'admin' end,
    auth.jwt() ->> 'email',
    jsonb_build_object('status', new.status, 'signing_order', new.signing_order)
  );
  return new;
end;
$$;

revoke all on function public.log_esignature_request_created() from public;

drop trigger if exists esignature_log_created on public.e_signature_requests;
create trigger esignature_log_created
after insert on public.e_signature_requests
for each row execute procedure public.log_esignature_request_created();

alter table public.documents enable row level security;
alter table public.document_activities enable row level security;
alter table public.clauses enable row level security;
alter table public.e_signature_requests enable row level security;
alter table public.signature_audit_events enable row level security;

create policy "Admins can manage documents"
on public.documents for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage document activity"
on public.document_activities for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage clauses"
on public.clauses for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage signature requests"
on public.e_signature_requests for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can read signature audit events"
on public.signature_audit_events for select to authenticated
using (public.current_user_is_admin());

-- Private storage. Public document and signature access is brokered by token-aware
-- Edge Functions, which create short-lived signed URLs only after validating tokens.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('document-files', 'document-files', false, 52428800),
  ('signature-artifacts', 'signature-artifacts', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

create policy "Admins can read document files"
on storage.objects for select to authenticated
using (bucket_id = 'document-files' and public.current_user_is_admin());

create policy "Admins can upload document files"
on storage.objects for insert to authenticated
with check (bucket_id = 'document-files' and public.current_user_is_admin());

create policy "Admins can update document files"
on storage.objects for update to authenticated
using (bucket_id = 'document-files' and public.current_user_is_admin())
with check (bucket_id = 'document-files' and public.current_user_is_admin());

create policy "Admins can delete document files"
on storage.objects for delete to authenticated
using (bucket_id = 'document-files' and public.current_user_is_admin());

create policy "Admins can read signature artifacts"
on storage.objects for select to authenticated
using (bucket_id = 'signature-artifacts' and public.current_user_is_admin());

create policy "Admins can upload signature artifacts"
on storage.objects for insert to authenticated
with check (bucket_id = 'signature-artifacts' and public.current_user_is_admin());

create policy "Admins can update signature artifacts"
on storage.objects for update to authenticated
using (bucket_id = 'signature-artifacts' and public.current_user_is_admin())
with check (bucket_id = 'signature-artifacts' and public.current_user_is_admin());

create policy "Admins can delete signature artifacts"
on storage.objects for delete to authenticated
using (bucket_id = 'signature-artifacts' and public.current_user_is_admin());
