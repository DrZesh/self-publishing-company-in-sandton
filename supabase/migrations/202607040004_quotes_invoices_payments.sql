-- Creative Books SA: Quotes, Invoices and Payments

create table if not exists public.finance_counters (
  document_type text not null,
  counter_year integer not null,
  last_number integer not null default 0,
  primary key (document_type, counter_year)
);

alter table public.finance_counters enable row level security;

create policy "Admins can read finance counters"
on public.finance_counters for select to authenticated
using (public.current_user_is_admin());

create or replace function public.next_finance_number(p_document_type text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year integer := extract(year from now())::integer;
  v_next integer;
  v_prefix text;
begin
  if p_document_type not in ('quote', 'invoice') then
    raise exception 'Unsupported document type: %', p_document_type;
  end if;

  insert into public.finance_counters (document_type, counter_year, last_number)
  values (p_document_type, v_year, 1)
  on conflict (document_type, counter_year)
  do update set last_number = public.finance_counters.last_number + 1
  returning last_number into v_next;

  v_prefix := case when p_document_type = 'quote' then 'CB' else 'INV' end;
  return v_prefix || '-' || v_year::text || '-' || lpad(v_next::text, 4, '0');
end;
$$;

revoke all on function public.next_finance_number(text) from public;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  contact_snapshot jsonb not null default '{}'::jsonb,
  mode text not null default 'standard'
    check (mode in ('standard', 'premium')),
  status text not null default 'Draft'
    check (status in ('Draft', 'Sent', 'Delivered', 'Opened', 'Viewed', 'Accepted', 'Declined', 'Expired')),
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  vat_rate numeric(6,2) not null default 15,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  include_vat boolean not null default true,
  valid_until date,
  expires_at timestamptz,
  view_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  pdf_url text,
  book_title text,
  project_understanding_text text,
  intro_video_url text,
  primary_package_id text,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  accepted_signature_url text,
  declined_at timestamptz,
  declined_reason text,
  notes text,
  terms text,
  last_viewer_ip_hash text,
  last_viewer_timestamp timestamptz,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists quotes_contact_id_idx on public.quotes(contact_id);
create index if not exists quotes_status_created_idx on public.quotes(status, created_date desc);
create index if not exists quotes_valid_until_idx on public.quotes(valid_until);

create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  service_id text,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  sort_order integer not null default 0,
  is_optional boolean not null default false,
  is_selected boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists quote_line_items_quote_idx
  on public.quote_line_items(quote_id, sort_order);

create table if not exists public.quote_signatures (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  signer_name text not null,
  signer_email text not null,
  signer_ip_hash text,
  signer_user_agent text,
  signature_data text not null,
  signed_at timestamptz not null default now(),
  signature_method text not null
    check (signature_method in ('drawn', 'typed')),
  legal_acknowledgment_checked boolean not null default false,
  created_date timestamptz not null default now()
);

create index if not exists quote_signatures_quote_idx
  on public.quote_signatures(quote_id, signed_at desc);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  project_id text,
  quote_id uuid references public.quotes(id) on delete set null,
  status text not null default 'Draft'
    check (status in ('Draft', 'Sent', 'Viewed', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'Refunded')),
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  vat_rate numeric(6,2) not null default 15,
  vat_amount numeric(12,2) not null default 0,
  include_vat boolean not null default true,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  due_date date,
  payment_terms text not null default 'Payment due within 7 days of invoice date.',
  banking_details text,
  notes text,
  book_title text,
  contact_snapshot jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  paid_at timestamptz,
  pdf_url text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists invoices_contact_id_idx on public.invoices(contact_id);
create index if not exists invoices_quote_id_idx on public.invoices(quote_id);
create index if not exists invoices_status_due_idx on public.invoices(status, due_date);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  project_id text,
  amount numeric(12,2) not null check (amount > 0),
  payment_date date not null,
  payment_method text not null default 'EFT'
    check (payment_method in ('EFT', 'Cash', 'Card', 'PayFast', 'Other')),
  reference text,
  proof_url text,
  status text not null default 'Confirmed'
    check (status in ('Pending', 'Confirmed', 'Refunded')),
  notes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_contact_id_idx on public.payments(contact_id);
create index if not exists payments_date_idx on public.payments(payment_date desc);

create or replace function public.set_finance_updated_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

drop trigger if exists quotes_set_updated_date on public.quotes;
create trigger quotes_set_updated_date
before update on public.quotes
for each row execute procedure public.set_finance_updated_date();

drop trigger if exists quote_line_items_set_updated_date on public.quote_line_items;
create trigger quote_line_items_set_updated_date
before update on public.quote_line_items
for each row execute procedure public.set_finance_updated_date();

drop trigger if exists invoices_set_updated_date on public.invoices;
create trigger invoices_set_updated_date
before update on public.invoices
for each row execute procedure public.set_finance_updated_date();

drop trigger if exists payments_set_updated_date on public.payments;
create trigger payments_set_updated_date
before update on public.payments
for each row execute procedure public.set_finance_updated_date();

create or replace function public.prepare_invoice_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.subtotal = greatest(coalesce(new.subtotal, 0), 0);
  new.vat_amount = greatest(coalesce(new.vat_amount, 0), 0);
  new.total = greatest(coalesce(new.total, 0), 0);
  new.amount_paid = greatest(coalesce(new.amount_paid, 0), 0);
  new.balance_due = greatest(new.total - new.amount_paid, 0);

  if new.status not in ('Cancelled', 'Refunded') then
    if new.balance_due <= 0 and new.total > 0 then
      new.status = 'Paid';
      new.paid_at = coalesce(new.paid_at, now());
    elsif new.amount_paid > 0 then
      new.status = 'Partially Paid';
      new.paid_at = null;
    elsif new.status = 'Paid' then
      new.status = 'Draft';
      new.paid_at = null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists invoices_prepare_write on public.invoices;
create trigger invoices_prepare_write
before insert or update of total, amount_paid, status on public.invoices
for each row execute procedure public.prepare_invoice_write();

create or replace function public.recalculate_invoice_from_payments(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paid numeric(12,2);
  v_total numeric(12,2);
  v_balance numeric(12,2);
begin
  select coalesce(sum(amount), 0)
  into v_paid
  from public.payments
  where invoice_id = p_invoice_id
    and status = 'Confirmed';

  select total into v_total
  from public.invoices
  where id = p_invoice_id
  for update;

  if not found then
    return;
  end if;

  v_balance := greatest(v_total - v_paid, 0);

  update public.invoices
  set amount_paid = v_paid,
      balance_due = v_balance,
      status = case
        when status in ('Cancelled', 'Refunded') then status
        when v_total > 0 and v_balance <= 0 then 'Paid'
        when v_paid > 0 then 'Partially Paid'
        when status in ('Paid', 'Partially Paid') then 'Draft'
        else status
      end,
      paid_at = case
        when v_total > 0 and v_balance <= 0 then coalesce(paid_at, now())
        else null
      end
  where id = p_invoice_id;
end;
$$;

create or replace function public.sync_invoice_after_payment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_invoice_from_payments(old.invoice_id);
    return old;
  end if;

  perform public.recalculate_invoice_from_payments(new.invoice_id);

  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id then
    perform public.recalculate_invoice_from_payments(old.invoice_id);
  end if;

  return new;
end;
$$;

drop trigger if exists payments_sync_invoice on public.payments;
create trigger payments_sync_invoice
after insert or update or delete on public.payments
for each row execute procedure public.sync_invoice_after_payment_change();

create or replace function public.save_quote(
  p_quote_id uuid,
  p_contact_id uuid,
  p_valid_until date,
  p_include_vat boolean,
  p_discount_amount numeric,
  p_notes text,
  p_terms text,
  p_mode text,
  p_line_items jsonb
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contact public.contacts%rowtype;
  v_quote public.quotes%rowtype;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := greatest(coalesce(p_discount_amount, 0), 0);
  v_taxable numeric(12,2);
  v_vat numeric(12,2);
  v_total numeric(12,2);
  v_item jsonb;
  v_index integer := 0;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  select * into v_contact from public.contacts where id = p_contact_id;
  if not found then raise exception 'Contact not found'; end if;

  for v_item in select value from jsonb_array_elements(coalesce(p_line_items, '[]'::jsonb))
  loop
    if coalesce(v_item ->> 'description', '') <> '' then
      v_subtotal := v_subtotal +
        coalesce((v_item ->> 'quantity')::numeric, 1) *
        coalesce((v_item ->> 'unit_price')::numeric, 0);
    end if;
  end loop;

  v_taxable := greatest(v_subtotal - v_discount, 0);
  v_vat := case when coalesce(p_include_vat, true) then round(v_taxable * 0.15, 2) else 0 end;
  v_total := round(v_taxable + v_vat, 2);

  if p_quote_id is null then
    insert into public.quotes (
      quote_number,
      contact_id,
      contact_snapshot,
      mode,
      status,
      valid_until,
      include_vat,
      vat_rate,
      discount_amount,
      subtotal,
      vat_amount,
      total,
      notes,
      terms
    ) values (
      public.next_finance_number('quote'),
      p_contact_id,
      jsonb_build_object(
        'full_name', v_contact.full_name,
        'email', v_contact.email,
        'phone', v_contact.phone,
        'company', v_contact.company
      ),
      coalesce(p_mode, 'standard'),
      'Draft',
      p_valid_until,
      coalesce(p_include_vat, true),
      15,
      v_discount,
      v_subtotal,
      v_vat,
      v_total,
      coalesce(p_notes, ''),
      coalesce(p_terms, '')
    ) returning * into v_quote;
  else
    update public.quotes
    set contact_id = p_contact_id,
        contact_snapshot = jsonb_build_object(
          'full_name', v_contact.full_name,
          'email', v_contact.email,
          'phone', v_contact.phone,
          'company', v_contact.company
        ),
        valid_until = p_valid_until,
        include_vat = coalesce(p_include_vat, true),
        discount_amount = v_discount,
        subtotal = v_subtotal,
        vat_amount = v_vat,
        total = v_total,
        notes = coalesce(p_notes, ''),
        terms = coalesce(p_terms, ''),
        mode = coalesce(p_mode, mode)
    where id = p_quote_id
    returning * into v_quote;

    if not found then raise exception 'Quote not found'; end if;
  end if;

  delete from public.quote_line_items where quote_id = v_quote.id;

  for v_item in select value from jsonb_array_elements(coalesce(p_line_items, '[]'::jsonb))
  loop
    if coalesce(v_item ->> 'description', '') <> '' then
      insert into public.quote_line_items (
        quote_id,
        service_id,
        description,
        quantity,
        unit_price,
        line_total,
        sort_order,
        is_optional,
        is_selected
      ) values (
        v_quote.id,
        nullif(v_item ->> 'service_id', ''),
        v_item ->> 'description',
        coalesce((v_item ->> 'quantity')::numeric, 1),
        coalesce((v_item ->> 'unit_price')::numeric, 0),
        coalesce((v_item ->> 'quantity')::numeric, 1) * coalesce((v_item ->> 'unit_price')::numeric, 0),
        v_index,
        coalesce((v_item ->> 'is_optional')::boolean, false),
        coalesce((v_item ->> 'is_selected')::boolean, true)
      );
      v_index := v_index + 1;
    end if;
  end loop;

  return v_quote;
end;
$$;

revoke all on function public.save_quote(uuid, uuid, date, boolean, numeric, text, text, text, jsonb) from public;
grant execute on function public.save_quote(uuid, uuid, date, boolean, numeric, text, text, text, jsonb) to authenticated;

create or replace function public.duplicate_quote(p_quote_id uuid)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_original public.quotes%rowtype;
  v_new public.quotes%rowtype;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  select * into v_original from public.quotes where id = p_quote_id;
  if not found then raise exception 'Quote not found'; end if;

  insert into public.quotes (
    quote_number, contact_id, contact_snapshot, mode, status,
    subtotal, discount_amount, vat_rate, vat_amount, total, include_vat,
    valid_until, expires_at, book_title, project_understanding_text,
    intro_video_url, primary_package_id, notes, terms
  ) values (
    public.next_finance_number('quote'), v_original.contact_id, v_original.contact_snapshot,
    v_original.mode, 'Draft', v_original.subtotal, v_original.discount_amount,
    v_original.vat_rate, v_original.vat_amount, v_original.total, v_original.include_vat,
    v_original.valid_until, v_original.expires_at, v_original.book_title,
    v_original.project_understanding_text, v_original.intro_video_url,
    v_original.primary_package_id, v_original.notes, v_original.terms
  ) returning * into v_new;

  insert into public.quote_line_items (
    quote_id, service_id, description, quantity, unit_price,
    line_total, sort_order, is_optional, is_selected
  )
  select
    v_new.id, service_id, description, quantity, unit_price,
    line_total, sort_order, is_optional, is_selected
  from public.quote_line_items
  where quote_id = p_quote_id;

  return v_new;
end;
$$;

revoke all on function public.duplicate_quote(uuid) from public;
grant execute on function public.duplicate_quote(uuid) to authenticated;

create or replace function public.convert_quote_to_invoice(
  p_quote_id uuid,
  p_due_date date default null
)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quote public.quotes%rowtype;
  v_invoice public.invoices%rowtype;
  v_items jsonb;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  select * into v_quote from public.quotes where id = p_quote_id;
  if not found then raise exception 'Quote not found'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'description', description,
    'quantity', quantity,
    'unit_price', unit_price,
    'line_total', line_total
  ) order by sort_order), '[]'::jsonb)
  into v_items
  from public.quote_line_items
  where quote_id = p_quote_id
    and is_selected = true;

  select * into v_invoice from public.invoices where quote_id = p_quote_id limit 1;
  if found then return v_invoice; end if;

  insert into public.invoices (
    invoice_number, contact_id, quote_id, status, line_items,
    subtotal, vat_rate, vat_amount, include_vat, total,
    amount_paid, balance_due, due_date, book_title, contact_snapshot, notes
  ) values (
    public.next_finance_number('invoice'),
    v_quote.contact_id,
    v_quote.id,
    'Draft',
    v_items,
    v_quote.subtotal,
    v_quote.vat_rate,
    v_quote.vat_amount,
    v_quote.include_vat,
    v_quote.total,
    0,
    v_quote.total,
    coalesce(p_due_date, current_date + 7),
    v_quote.book_title,
    v_quote.contact_snapshot,
    v_quote.notes
  ) returning * into v_invoice;

  return v_invoice;
end;
$$;

revoke all on function public.convert_quote_to_invoice(uuid, date) from public;
grant execute on function public.convert_quote_to_invoice(uuid, date) to authenticated;

create or replace function public.refresh_overdue_invoices()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  update public.invoices
  set status = 'Overdue'
  where due_date < current_date
    and balance_due > 0
    and status in ('Sent', 'Viewed', 'Partially Paid');

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.refresh_overdue_invoices() from public;
grant execute on function public.refresh_overdue_invoices() to authenticated;

alter table public.quotes enable row level security;
alter table public.quote_line_items enable row level security;
alter table public.quote_signatures enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

create policy "Admins can manage quotes"
on public.quotes for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage quote line items"
on public.quote_line_items for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can read quote signatures"
on public.quote_signatures for select to authenticated
using (public.current_user_is_admin());

create policy "Admins can manage invoices"
on public.invoices for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "Admins can manage payments"
on public.payments for all to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- Extend the unified follow-up function now that Quotes and Invoices are migrated.
create or replace function public.get_follow_up_reminders()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_follow_ups jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_high integer := 0;
  v_medium integer := 0;
  v_low integer := 0;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access required';
  end if;

  with reminders as (
    select
      'lead_followup'::text as type,
      case when now() - l.created_date > interval '3 days' then 'high' else 'medium' end as priority,
      'Follow up with ' || coalesce(c.full_name, 'lead') as title,
      'New lead has not progressed from the New stage.' as description,
      c.id as contact_id,
      l.id as lead_id,
      null::uuid as submission_id,
      null::uuid as task_id,
      null::uuid as quote_id,
      null::uuid as invoice_id,
      greatest(1, floor(extract(epoch from (now() - l.created_date)) / 86400))::integer as days_pending,
      null::integer as days_overdue,
      null::integer as days_until_expiry,
      l.estimated_value,
      null::numeric as quote_total,
      l.created_date as sort_date
    from public.leads l
    join public.contacts c on c.id = l.contact_id
    where l.stage = 'new' and l.created_date < now() - interval '24 hours'

    union all

    select
      'lead_followup',
      case when now() - l.stage_changed_at > interval '14 days' then 'high' else 'medium' end,
      'Pipeline follow-up: ' || coalesce(c.full_name, 'lead'),
      'Lead has remained in ' || l.stage || ' without movement.',
      c.id, l.id, null::uuid, null::uuid, null::uuid, null::uuid,
      greatest(1, floor(extract(epoch from (now() - l.stage_changed_at)) / 86400))::integer,
      null::integer, null::integer, l.estimated_value, null::numeric, l.stage_changed_at
    from public.leads l
    join public.contacts c on c.id = l.contact_id
    where l.stage in ('contacted', 'qualified', 'quoted', 'negotiating')
      and l.stage_changed_at < now() - interval '7 days'

    union all

    select
      'submission_conversion',
      case when now() - s.created_date > interval '5 days' then 'high' else 'medium' end,
      'Unread submission from ' || s.full_name,
      'Submission has remained unread for more than 48 hours.',
      s.contact_id, null::uuid, s.id, null::uuid, null::uuid, null::uuid,
      greatest(2, floor(extract(epoch from (now() - s.created_date)) / 86400))::integer,
      null::integer, null::integer, null::numeric, null::numeric, s.created_date
    from public.submissions s
    where s.status = 'new' and s.created_date < now() - interval '48 hours'

    union all

    select
      'task_overdue',
      case when t.priority = 'Urgent' or now() - t.due_date > interval '3 days' then 'high'
           when t.priority = 'High' then 'medium' else 'low' end,
      t.title,
      coalesce(t.notes, 'Task is overdue.'),
      t.contact_id, t.lead_id, null::uuid, t.id, null::uuid, null::uuid,
      null::integer,
      greatest(1, floor(extract(epoch from (now() - t.due_date)) / 86400))::integer,
      null::integer, null::numeric, null::numeric, t.due_date
    from public.tasks t
    where t.status in ('Pending', 'In Progress') and t.due_date < now()

    union all

    select
      'quote_followup',
      case when now() - q.sent_at > interval '7 days' then 'high' else 'medium' end,
      'Follow up on quote ' || q.quote_number,
      'Quote is still awaiting a client decision.',
      q.contact_id, null::uuid, null::uuid, null::uuid, q.id, null::uuid,
      greatest(2, floor(extract(epoch from (now() - q.sent_at)) / 86400))::integer,
      null::integer, null::integer, null::numeric, q.total, q.sent_at
    from public.quotes q
    where q.status in ('Sent', 'Delivered', 'Opened', 'Viewed')
      and q.sent_at < now() - interval '2 days'

    union all

    select
      'quote_expiring',
      case when q.valid_until <= current_date + 1 then 'high' else 'medium' end,
      'Quote expiring: ' || q.quote_number,
      'Quote validity period is nearly complete.',
      q.contact_id, null::uuid, null::uuid, null::uuid, q.id, null::uuid,
      null::integer, null::integer,
      greatest(0, q.valid_until - current_date),
      null::numeric, q.total, q.valid_until::timestamptz
    from public.quotes q
    where q.status in ('Sent', 'Delivered', 'Opened', 'Viewed')
      and q.valid_until between current_date and current_date + 5

    union all

    select
      'invoice_overdue',
      case when current_date - i.due_date > 7 then 'high' else 'medium' end,
      'Invoice overdue: ' || i.invoice_number,
      'Outstanding balance: R ' || trim(to_char(i.balance_due, 'FM9999999990.00')),
      i.contact_id, null::uuid, null::uuid, null::uuid, null::uuid, i.id,
      null::integer,
      greatest(1, current_date - i.due_date),
      null::integer, null::numeric, i.total, i.due_date::timestamptz
    from public.invoices i
    where i.balance_due > 0
      and i.due_date < current_date
      and i.status not in ('Paid', 'Cancelled', 'Refunded')
  ), ranked as (
    select * from reminders
    order by case priority when 'high' then 1 when 'medium' then 2 else 3 end, sort_date asc
    limit 100
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'type', type,
      'priority', priority,
      'title', title,
      'description', description,
      'contact_id', contact_id,
      'lead_id', lead_id,
      'submission_id', submission_id,
      'task_id', task_id,
      'quote_id', quote_id,
      'invoice_id', invoice_id,
      'days_pending', days_pending,
      'days_overdue', days_overdue,
      'days_until_expiry', days_until_expiry,
      'estimated_value', estimated_value,
      'quote_total', quote_total
    )), '[]'::jsonb),
    count(*)::integer,
    count(*) filter (where priority = 'high')::integer,
    count(*) filter (where priority = 'medium')::integer,
    count(*) filter (where priority = 'low')::integer
  into v_follow_ups, v_total, v_high, v_medium, v_low
  from ranked;

  return jsonb_build_object(
    'followUps', v_follow_ups,
    'summary', jsonb_build_object('total', v_total, 'high', v_high, 'medium', v_medium, 'low', v_low)
  );
end;
$$;
