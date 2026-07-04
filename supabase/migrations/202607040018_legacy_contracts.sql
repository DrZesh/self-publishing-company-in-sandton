-- Creative Books SA: legacy Contracts and countersigning compatibility

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  document_type text not null default 'Contract'
    check (document_type in (
      'Contract', 'NDA', 'Publishing Agreement', 'Book Cover Agreement',
      'Editing Agreement', 'Printing Agreement', 'Supplier Agreement',
      'Freelancer Agreement', 'Payment Agreement', 'Approval Form',
      'Author Agreement', 'Internal Document', 'Legal Document', 'Other'
    )),
  book_title text,
  status text not null default 'Draft'
    check (status in (
      'Draft', 'Sent', 'Admin Fields Completed', 'Admin Signed',
      'Sent for Signature', 'Opened', 'Viewed', 'Signing Started',
      'Signed', 'Fully Signed', 'Declined', 'Expired', 'Resent',
      'Cancelled', 'Archived'
    )),
  contract_file_url text,
  signed_file_url text,
  sign_token text unique,
  sign_token_expires timestamptz,
  admin_signature_url text,
  admin_signed_at timestamptz,
  admin_signer_name text,
  admin_signer_email text,
  contract_field_values jsonb not null default '{}'::jsonb,
  signer_name text,
  signer_email text,
  signer_ip_hash text,
  signer_user_agent text,
  signature_image_url text,
  audit_trail jsonb not null default '[]'::jsonb,
  sent_at timestamptz,
  opened_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  declined_at timestamptz,
  declined_reason text,
  expiry_date date,
  reminder_sent_at timestamptz,
  reminder_count integer not null default 0 check (reminder_count >= 0),
  legal_consent_checked boolean not null default false,
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists contracts_contact_idx
  on public.contracts(contact_id, created_date desc);
create index if not exists contracts_project_idx
  on public.contracts(project_id, created_date desc) where project_id is not null;
create index if not exists contracts_status_idx
  on public.contracts(status, created_date desc);
create index if not exists contracts_token_idx
  on public.contracts(sign_token) where sign_token is not null;

create or replace function public.set_contract_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

revoke all on function public.set_contract_updated_date() from public;

drop trigger if exists contracts_set_updated_date on public.contracts;
create trigger contracts_set_updated_date
before update on public.contracts
for each row execute procedure public.set_contract_updated_date();

alter table public.contracts enable row level security;

create policy "Admins can manage contracts"
on public.contracts for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create or replace function public.complete_legacy_contract_signature(
  p_contract_id uuid,
  p_signer_name text,
  p_signer_email text,
  p_signature_image_url text,
  p_signature_method text,
  p_legal_consent boolean,
  p_signer_ip_hash text,
  p_signer_user_agent text,
  p_client_field_values jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contract public.contracts%rowtype;
  v_updated public.contracts%rowtype;
  v_now timestamptz := now();
  v_final_status text;
begin
  select * into v_contract
  from public.contracts
  where id = p_contract_id
  for update;

  if not found then
    raise exception 'Contract not found';
  end if;

  if v_contract.sign_token_expires is not null and v_contract.sign_token_expires < v_now then
    raise exception 'Signing link has expired';
  end if;

  if v_contract.status in ('Signed', 'Fully Signed', 'Declined', 'Cancelled', 'Archived') then
    raise exception 'Contract has already been processed';
  end if;

  if coalesce(p_signer_name, '') = '' or coalesce(p_signer_email, '') = '' then
    raise exception 'Signer name and email are required';
  end if;

  if not coalesce(p_legal_consent, false) then
    raise exception 'Electronic signature consent is required';
  end if;

  if coalesce(v_contract.contract_file_url, '') = '' then
    raise exception 'Contract document is missing';
  end if;

  v_final_status := case when v_contract.admin_signed_at is not null then 'Fully Signed' else 'Signed' end;

  update public.contracts
  set
    status = v_final_status,
    signed_at = v_now,
    signer_name = p_signer_name,
    signer_email = p_signer_email,
    signer_ip_hash = p_signer_ip_hash,
    signer_user_agent = p_signer_user_agent,
    signature_image_url = p_signature_image_url,
    legal_consent_checked = p_legal_consent,
    sign_token = null,
    contract_field_values = coalesce(contract_field_values, '{}'::jsonb)
      || jsonb_build_object('_client', coalesce(p_client_field_values, '{}'::jsonb)),
    audit_trail = coalesce(audit_trail, '[]'::jsonb)
      || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
        'event', 'signed',
        'timestamp', v_now,
        'signer_name', p_signer_name,
        'signer_email', p_signer_email,
        'ip_hash', p_signer_ip_hash,
        'user_agent', p_signer_user_agent,
        'legal_consent', p_legal_consent
      )))
  where id = p_contract_id
  returning * into v_updated;

  insert into public.documents (
    contact_id, project_id, document_title, client_name_snapshot,
    category, status, file_name, file_url, signed_document_url,
    book_title, notes, uploaded_by, signed_at
  ) values (
    v_updated.contact_id,
    case when v_updated.project_id is null then null else v_updated.project_id::text end,
    v_updated.title,
    p_signer_name,
    'Signed Contract',
    'Signed',
    v_updated.title || ' - Signed.pdf',
    v_updated.contract_file_url,
    coalesce(v_updated.signed_file_url, v_updated.contract_file_url),
    v_updated.book_title,
    'Electronically signed by ' || p_signer_name || ' (' || p_signer_email || ')',
    p_signer_email,
    v_now
  );

  insert into public.e_signature_requests (
    contact_id, project_id, title, file_url, file_name, document_category,
    signing_order, status, contract_fields, admin_field_values, client_field_values,
    admin_signature_url, admin_signed_at, admin_signer_name, admin_signer_email,
    recipient_name, recipient_email, signature_image_url, signature_method,
    signer_confirmed_name, signer_confirmed_email, signer_ip_hash,
    signer_user_agent, consent_read, consent_identity, consent_authorised,
    consent_electronic, consent_submit, signed_at, sent_at, opened_at,
    signed_document_url, audit_trail, sent_by, open_count
  ) values (
    v_updated.contact_id,
    case when v_updated.project_id is null then null else v_updated.project_id::text end,
    v_updated.title,
    v_updated.contract_file_url,
    v_updated.title || '.pdf',
    v_updated.document_type,
    'admin_first',
    'Signed',
    coalesce(v_updated.contract_field_values -> '_defs', '[]'::jsonb),
    coalesce(v_updated.contract_field_values - '_defs' - '_client', '{}'::jsonb),
    coalesce(p_client_field_values, '{}'::jsonb),
    v_updated.admin_signature_url,
    v_updated.admin_signed_at,
    v_updated.admin_signer_name,
    v_updated.admin_signer_email,
    p_signer_name,
    p_signer_email,
    p_signature_image_url,
    case when p_signature_method = 'type' then 'typed' else 'drawn' end,
    p_signer_name,
    p_signer_email,
    p_signer_ip_hash,
    p_signer_user_agent,
    true,
    true,
    true,
    p_legal_consent,
    p_legal_consent,
    v_now,
    coalesce(v_updated.sent_at, v_now),
    coalesce(v_updated.opened_at, v_now),
    coalesce(v_updated.signed_file_url, v_updated.contract_file_url),
    v_updated.audit_trail,
    'Creative Books SA',
    1
  );

  if v_updated.project_id is not null then
    update public.projects
    set
      contract_status = 'Signed',
      stage = 'Contract Signed',
      current_stage = 'Contract Signed',
      stage_changed_at = v_now
    where id = v_updated.project_id;
  end if;

  return jsonb_build_object(
    'id', v_updated.id,
    'status', v_updated.status,
    'signed_at', v_updated.signed_at,
    'contract_file_url', v_updated.contract_file_url,
    'signed_file_url', v_updated.signed_file_url,
    'sent_at', v_updated.sent_at,
    'opened_at', v_updated.opened_at
  );
end;
$$;

revoke all on function public.complete_legacy_contract_signature(
  uuid, text, text, text, text, boolean, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.complete_legacy_contract_signature(
  uuid, text, text, text, text, boolean, text, text, jsonb
) to service_role;

create or replace function public.decline_legacy_contract(
  p_contract_id uuid,
  p_signer_name text,
  p_signer_email text,
  p_declined_reason text,
  p_signer_ip_hash text,
  p_signer_user_agent text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contract public.contracts%rowtype;
  v_now timestamptz := now();
begin
  select * into v_contract
  from public.contracts
  where id = p_contract_id
  for update;

  if not found then
    raise exception 'Contract not found';
  end if;

  if v_contract.sign_token_expires is not null and v_contract.sign_token_expires < v_now then
    raise exception 'Signing link has expired';
  end if;

  if v_contract.status in ('Signed', 'Fully Signed', 'Declined', 'Cancelled', 'Archived') then
    raise exception 'Contract has already been processed';
  end if;

  update public.contracts
  set
    status = 'Declined',
    declined_at = v_now,
    declined_reason = coalesce(p_declined_reason, ''),
    signer_name = p_signer_name,
    signer_email = p_signer_email,
    signer_ip_hash = p_signer_ip_hash,
    signer_user_agent = p_signer_user_agent,
    sign_token = null,
    audit_trail = coalesce(audit_trail, '[]'::jsonb)
      || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
        'event', 'declined',
        'timestamp', v_now,
        'signer_name', p_signer_name,
        'signer_email', p_signer_email,
        'reason', p_declined_reason,
        'ip_hash', p_signer_ip_hash,
        'user_agent', p_signer_user_agent
      )))
  where id = p_contract_id;

  return jsonb_build_object('id', p_contract_id, 'status', 'Declined', 'declined_at', v_now);
end;
$$;

revoke all on function public.decline_legacy_contract(
  uuid, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.decline_legacy_contract(
  uuid, text, text, text, text, text
) to service_role;
