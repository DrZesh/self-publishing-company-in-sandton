-- Creative Books SA: Projects, production pipeline and client delays

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete restrict,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  book_title text not null,
  author_name text,
  service_type text not null default 'Full Publishing Package'
    check (service_type in (
      'Full Publishing Package', 'Printing Only', 'Editing Only', 'Cover Design Only',
      'Typesetting Only', 'Ebook', 'Ghostwriting', 'Children''s Book',
      'Academic Editing', 'Custom'
    )),
  stage text not null default 'Enquiry Received'
    check (stage in (
      'Enquiry Received', 'Quote Sent', 'Quote Accepted', 'Contract Sent',
      'Contract Signed', 'Payment Received', 'Manuscript Received', 'Editing',
      'Proofreading', 'Typesetting', 'Cover Design', 'Client Approval',
      'Changes Requested', 'Final Approval Received', 'Sample Print Queued',
      'Sample Print Completed', 'Mass Production Started', 'Ready for Collection',
      'Courier Booked', 'Delivered', 'Completed'
    )),
  current_stage text,
  stage_changed_at timestamptz not null default now(),
  waiting_on text not null default 'None'
    check (waiting_on in (
      'Client', 'Admin', 'Editor', 'Designer', 'Typesetter', 'Production',
      'Courier', 'Payment', 'Approval', 'Documents', 'None'
    )),
  queue_number integer check (queue_number is null or queue_number > 0),
  queue_type text
    check (queue_type is null or queue_type in (
      'Sample Print Queue', 'Mass Production Queue', 'Active Print Queue'
    )),
  deadline date,
  project_value numeric(12,2) not null default 0 check (project_value >= 0),
  payment_status text not null default 'Unpaid'
    check (payment_status in (
      'Unpaid', 'Deposit Paid', 'Partially Paid', 'Fully Paid', 'Overdue'
    )),
  contract_status text not null default 'Not Sent'
    check (contract_status in ('Not Sent', 'Sent', 'Signed', 'Expired')),
  assigned_editor text,
  assigned_designer text,
  assigned_typesetter text,
  assigned_manager text,
  revision_counts jsonb not null default '{"cover_design":0,"editing":0,"layout":0,"proofreading":0}'::jsonb,
  revision_limits jsonb not null default '{"cover_design":2,"editing":1,"layout":2,"proofreading":1}'::jsonb,
  book_spec jsonb not null default '{}'::jsonb,
  is_vip boolean not null default false,
  vip_tag text
    check (vip_tag is null or vip_tag in (
      'Returning Author', 'High-Value', 'Corporate', 'Urgent', 'Referral', 'Bulk Print'
    )),
  notes text,
  client_notes text,
  is_at_risk boolean not null default false,
  risk_reason text,
  completed_at timestamptz,
  automation_enabled boolean not null default false,
  updates_paused boolean not null default false,
  last_update_sent_at timestamptz,
  automation_stop_reason text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create unique index if not exists projects_quote_unique_idx
  on public.projects(quote_id) where quote_id is not null;
create index if not exists projects_contact_idx
  on public.projects(contact_id, created_date desc);
create index if not exists projects_stage_idx
  on public.projects(stage, stage_changed_at desc);
create index if not exists projects_invoice_idx
  on public.projects(invoice_id) where invoice_id is not null;
create index if not exists projects_deadline_idx
  on public.projects(deadline) where deadline is not null;
create index if not exists projects_risk_idx
  on public.projects(is_at_risk, stage) where is_at_risk = true;
create index if not exists projects_queue_idx
  on public.projects(queue_type, queue_number) where queue_number is not null;

create table if not exists public.project_stage_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  changed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists project_stage_history_project_idx
  on public.project_stage_history(project_id, changed_at desc);

create table if not exists public.client_delays (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  delay_type text not null
    check (delay_type in (
      'Late Manuscript', 'Late Payment', 'Late Approval', 'Late Corrections',
      'Wrong File Sent', 'Changed Specifications', 'Client Unresponsive',
      'Contract Delay', 'Other'
    )),
  description text,
  days_delayed integer not null default 0 check (days_delayed >= 0),
  reported_at timestamptz not null default now(),
  resolved boolean not null default false,
  resolved_at timestamptz,
  impact_on_deadline text,
  notified_client boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  check (not resolved or resolved_at is not null)
);

create index if not exists client_delays_project_idx
  on public.client_delays(project_id, reported_at desc);
create index if not exists client_delays_unresolved_idx
  on public.client_delays(resolved, reported_at desc) where resolved = false;

create or replace function public.project_stage_order(p_stage text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_stage
    when 'Enquiry Received' then 1
    when 'Quote Sent' then 2
    when 'Quote Accepted' then 3
    when 'Contract Sent' then 4
    when 'Contract Signed' then 5
    when 'Payment Received' then 6
    when 'Manuscript Received' then 7
    when 'Editing' then 8
    when 'Proofreading' then 9
    when 'Typesetting' then 10
    when 'Cover Design' then 11
    when 'Client Approval' then 12
    when 'Changes Requested' then 13
    when 'Final Approval Received' then 14
    when 'Sample Print Queued' then 15
    when 'Sample Print Completed' then 16
    when 'Mass Production Started' then 17
    when 'Ready for Collection' then 18
    when 'Courier Booked' then 19
    when 'Delivered' then 20
    when 'Completed' then 21
    else 0
  end;
$$;

revoke all on function public.project_stage_order(text) from public;
grant execute on function public.project_stage_order(text) to authenticated;
grant execute on function public.project_stage_order(text) to service_role;

create or replace function public.prepare_project_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  new.current_stage = new.stage;

  if tg_op = 'INSERT' then
    new.stage_changed_at = coalesce(new.stage_changed_at, now());
  elsif new.stage is distinct from old.stage then
    new.stage_changed_at = now();
  end if;

  if new.stage = 'Completed' then
    new.completed_at = coalesce(new.completed_at, now());
    new.automation_enabled = false;
    new.updates_paused = false;
    new.automation_stop_reason = coalesce(new.automation_stop_reason, 'completed');
  elsif tg_op = 'UPDATE' and old.stage = 'Completed' and new.stage <> 'Completed' then
    new.completed_at = null;
    if new.automation_stop_reason = 'completed' then
      new.automation_stop_reason = null;
    end if;
  end if;

  if new.stage = 'Sample Print Queued' and new.queue_type is null then
    new.queue_type = 'Sample Print Queue';
  elsif new.stage = 'Mass Production Started' and new.queue_type is null then
    new.queue_type = 'Mass Production Queue';
  elsif new.stage in ('Sample Print Completed', 'Ready for Collection') and new.queue_type is null then
    new.queue_type = 'Active Print Queue';
  end if;

  return new;
end;
$$;

revoke all on function public.prepare_project_write() from public;

drop trigger if exists projects_prepare_write on public.projects;
create trigger projects_prepare_write
before insert or update on public.projects
for each row execute procedure public.prepare_project_write();

create or replace function public.log_project_stage_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.stage is distinct from old.stage then
    insert into public.project_stage_history (
      project_id,
      from_stage,
      to_stage,
      actor_id,
      actor_email,
      metadata
    ) values (
      new.id,
      case when tg_op = 'INSERT' then null else old.stage end,
      new.stage,
      auth.uid(),
      auth.jwt() ->> 'email',
      jsonb_build_object(
        'source', case when auth.role() = 'service_role' then 'system_or_edge_function' else 'admin_ui' end,
        'waiting_on', new.waiting_on,
        'queue_number', new.queue_number
      )
    );
  end if;
  return new;
end;
$$;

revoke all on function public.log_project_stage_change() from public;

drop trigger if exists projects_log_stage_change on public.projects;
create trigger projects_log_stage_change
after insert or update of stage on public.projects
for each row execute procedure public.log_project_stage_change();

create or replace function public.prepare_client_delay_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  if new.resolved and (tg_op = 'INSERT' or not old.resolved) then
    new.resolved_at = coalesce(new.resolved_at, now());
  elsif not new.resolved then
    new.resolved_at = null;
  end if;
  return new;
end;
$$;

revoke all on function public.prepare_client_delay_write() from public;

drop trigger if exists client_delays_prepare_write on public.client_delays;
create trigger client_delays_prepare_write
before insert or update on public.client_delays
for each row execute procedure public.prepare_client_delay_write();

create or replace function public.handle_accepted_quote_project_workflow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contact public.contacts%rowtype;
  v_invoice public.invoices%rowtype;
  v_project public.projects%rowtype;
  v_items jsonb;
begin
  if new.status <> 'Accepted' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'Accepted' then
    return new;
  end if;

  select * into v_contact
  from public.contacts
  where id = new.contact_id;

  select * into v_invoice
  from public.invoices
  where quote_id = new.id
  order by created_date asc
  limit 1;

  if not found then
    select coalesce(jsonb_agg(jsonb_build_object(
      'description', description,
      'quantity', quantity,
      'unit_price', unit_price,
      'line_total', line_total
    ) order by sort_order), '[]'::jsonb)
    into v_items
    from public.quote_line_items
    where quote_id = new.id
      and is_selected = true;

    insert into public.invoices (
      invoice_number,
      contact_id,
      quote_id,
      status,
      line_items,
      subtotal,
      vat_rate,
      vat_amount,
      include_vat,
      total,
      amount_paid,
      balance_due,
      due_date,
      book_title,
      contact_snapshot,
      notes
    ) values (
      public.next_finance_number('invoice'),
      new.contact_id,
      new.id,
      'Draft',
      v_items,
      new.subtotal,
      new.vat_rate,
      new.vat_amount,
      new.include_vat,
      new.total,
      0,
      new.total,
      current_date + 7,
      new.book_title,
      new.contact_snapshot,
      new.notes
    ) returning * into v_invoice;
  end if;

  insert into public.projects (
    contact_id,
    quote_id,
    invoice_id,
    book_title,
    author_name,
    stage,
    project_value,
    payment_status,
    contract_status,
    stage_changed_at
  ) values (
    new.contact_id,
    new.id,
    v_invoice.id,
    coalesce(nullif(new.book_title, ''), nullif(v_contact.book_title, ''), 'Untitled Book'),
    coalesce(v_contact.full_name, ''),
    'Quote Accepted',
    new.total,
    case
      when v_invoice.status = 'Paid' then 'Fully Paid'
      when v_invoice.status = 'Partially Paid' then 'Partially Paid'
      when v_invoice.status = 'Overdue' then 'Overdue'
      else 'Unpaid'
    end,
    'Not Sent',
    now()
  )
  on conflict (quote_id) where quote_id is not null
  do update set
    invoice_id = coalesce(public.projects.invoice_id, excluded.invoice_id),
    project_value = excluded.project_value,
    updated_date = now()
  returning * into v_project;

  update public.invoices
  set project_id = v_project.id::text
  where id = v_invoice.id
    and project_id is distinct from v_project.id::text;

  update public.contacts
  set pipeline_stage = 'Project Started'
  where id = new.contact_id
    and pipeline_stage is distinct from 'Project Started';

  return new;
end;
$$;

revoke all on function public.handle_accepted_quote_project_workflow() from public;

drop trigger if exists quotes_start_project_workflow on public.quotes;
create trigger quotes_start_project_workflow
after insert or update of status on public.quotes
for each row
when (new.status = 'Accepted')
execute procedure public.handle_accepted_quote_project_workflow();

create or replace function public.link_invoice_to_project()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project_id uuid;
begin
  if new.quote_id is null then
    return new;
  end if;

  select id into v_project_id
  from public.projects
  where quote_id = new.quote_id
  limit 1;

  if v_project_id is not null then
    update public.projects
    set invoice_id = new.id
    where id = v_project_id
      and invoice_id is distinct from new.id;

    if new.project_id is distinct from v_project_id::text then
      update public.invoices
      set project_id = v_project_id::text
      where id = new.id;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.link_invoice_to_project() from public;

drop trigger if exists invoices_link_project on public.invoices;
create trigger invoices_link_project
after insert or update of quote_id on public.invoices
for each row execute procedure public.link_invoice_to_project();

create or replace function public.sync_project_payment_status_from_invoice()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project_payment_status text;
begin
  v_project_payment_status := case
    when new.status = 'Paid' then 'Fully Paid'
    when new.status = 'Partially Paid' then 'Partially Paid'
    when new.status = 'Overdue' then 'Overdue'
    else 'Unpaid'
  end;

  update public.projects
  set payment_status = v_project_payment_status,
      stage = case
        when new.status = 'Paid'
          and public.project_stage_order(stage) < public.project_stage_order('Payment Received')
          then 'Payment Received'
        else stage
      end
  where invoice_id = new.id
     or (new.quote_id is not null and quote_id = new.quote_id)
     or id::text = new.project_id;

  return new;
end;
$$;

revoke all on function public.sync_project_payment_status_from_invoice() from public;

drop trigger if exists invoices_sync_project_payment on public.invoices;
create trigger invoices_sync_project_payment
after insert or update of status, amount_paid, balance_due on public.invoices
for each row execute procedure public.sync_project_payment_status_from_invoice();

create or replace function public.sync_project_from_document_workflow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.project_id is null or new.project_id = '' then
    return new;
  end if;

  if new.category = 'Unsigned Contract'
     and new.status = 'Signed'
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    update public.projects
    set contract_status = 'Signed',
        stage = case
          when public.project_stage_order(stage) < public.project_stage_order('Contract Signed')
            then 'Contract Signed'
          else stage
        end
    where id::text = new.project_id;
  end if;

  if new.category = 'Proof Approval'
     and new.status = 'Approved'
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    update public.projects
    set stage = case
      when public.project_stage_order(stage) < public.project_stage_order('Final Approval Received')
        then 'Final Approval Received'
      else stage
    end
    where id::text = new.project_id;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_project_from_document_workflow() from public;

drop trigger if exists documents_sync_project_workflow on public.documents;
create trigger documents_sync_project_workflow
after insert or update of status on public.documents
for each row execute procedure public.sync_project_from_document_workflow();

-- Backfill project records for quotes already accepted before this migration.
-- This intentionally goes through the same workflow helper by changing Accepted
-- rows to themselves only after the trigger is installed is not sufficient, so
-- create the project and invoice relationship explicitly in a deterministic pass.
do $$
declare
  v_quote public.quotes%rowtype;
  v_contact public.contacts%rowtype;
  v_invoice public.invoices%rowtype;
  v_items jsonb;
  v_project public.projects%rowtype;
begin
  for v_quote in
    select * from public.quotes q
    where q.status = 'Accepted'
      and not exists (select 1 from public.projects p where p.quote_id = q.id)
    order by q.created_date
  loop
    select * into v_contact from public.contacts where id = v_quote.contact_id;
    select * into v_invoice from public.invoices where quote_id = v_quote.id order by created_date limit 1;

    if not found then
      select coalesce(jsonb_agg(jsonb_build_object(
        'description', description,
        'quantity', quantity,
        'unit_price', unit_price,
        'line_total', line_total
      ) order by sort_order), '[]'::jsonb)
      into v_items
      from public.quote_line_items
      where quote_id = v_quote.id and is_selected = true;

      insert into public.invoices (
        invoice_number, contact_id, quote_id, status, line_items,
        subtotal, vat_rate, vat_amount, include_vat, total,
        amount_paid, balance_due, due_date, book_title, contact_snapshot, notes
      ) values (
        public.next_finance_number('invoice'), v_quote.contact_id, v_quote.id, 'Draft', v_items,
        v_quote.subtotal, v_quote.vat_rate, v_quote.vat_amount, v_quote.include_vat, v_quote.total,
        0, v_quote.total, current_date + 7, v_quote.book_title, v_quote.contact_snapshot, v_quote.notes
      ) returning * into v_invoice;
    end if;

    insert into public.projects (
      contact_id, quote_id, invoice_id, book_title, author_name,
      stage, project_value, payment_status, contract_status
    ) values (
      v_quote.contact_id,
      v_quote.id,
      v_invoice.id,
      coalesce(nullif(v_quote.book_title, ''), nullif(v_contact.book_title, ''), 'Untitled Book'),
      coalesce(v_contact.full_name, ''),
      'Quote Accepted',
      v_quote.total,
      case
        when v_invoice.status = 'Paid' then 'Fully Paid'
        when v_invoice.status = 'Partially Paid' then 'Partially Paid'
        when v_invoice.status = 'Overdue' then 'Overdue'
        else 'Unpaid'
      end,
      'Not Sent'
    ) returning * into v_project;

    update public.invoices set project_id = v_project.id::text where id = v_invoice.id;
    update public.contacts set pipeline_stage = 'Project Started' where id = v_quote.contact_id;
  end loop;
end;
$$;

alter table public.projects enable row level security;
alter table public.project_stage_history enable row level security;
alter table public.client_delays enable row level security;

create policy "Admins can manage projects"
on public.projects for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can read project stage history"
on public.project_stage_history for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can manage client delays"
on public.client_delays for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());
