BEGIN;
DO $guard$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=ANY(ARRAY['cb_settings','cb_counters','cb_clients','cb_items','cb_quotes','cb_quote_items','cb_projects','cb_invoices','cb_payments','cb_activity'])) THEN RAISE EXCEPTION 'Quote-to-cash tables already exist; stop for schema review'; END IF;
 IF EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='cb_billing_private') THEN RAISE EXCEPTION 'Private billing schema already exists; stop for review'; END IF;
END $guard$;
CREATE SCHEMA cb_billing_private;
REVOKE ALL ON SCHEMA cb_billing_private FROM PUBLIC,anon;
GRANT USAGE ON SCHEMA cb_billing_private TO authenticated,anon,service_role;
CREATE FUNCTION cb_billing_private.require_staff() RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN IF NOT cb_private.is_staff() THEN RAISE EXCEPTION 'Staff access required' USING ERRCODE='42501'; END IF; END $$;
-- =====================================================================
-- Quote to Cash — Creative Books SA
-- Clients → Quote → Send → Accept & sign → 75% deposit invoice → deposit
-- cleared (project starts) → 25% balance invoice → paid → files released.
--
-- All tables are prefixed cb_ so they never clash with existing CRM tables.
-- Run once in Supabase: SQL Editor → paste → Run (or `supabase db push`).
-- Same rules as src/billing/lib/engine.js (demo mode).
-- =====================================================================



-- ---------- settings (change here if your T&Cs change) ----------
create table public.cb_settings (
  id int primary key default 1 check (id = 1),
  quote_validity_days int not null default 30,   -- T&C 3.1
  deposit_percent numeric(5,2) not null default 75, -- T&C 4.1
  quote_prefix text not null default 'Quote-',
  invoice_prefix text not null default 'INV-',
  payment_prefix text not null default 'PAY-',
  number_digits int not null default 6,
  project_checklist jsonb not null default '["Print files approved","Printing","Binding","Quality check","Delivery"]'
);
insert into public.cb_settings (id) values (1) on conflict do nothing;

create table public.cb_counters (key text primary key, next int not null);
-- Quote numbering continues after your last Zoho quote (Quote-001061). Change if needed.
insert into public.cb_counters values ('quote', 1062), ('invoice', 1), ('payment', 1) on conflict do nothing;

-- ---------- tables ----------
create table public.cb_clients (
  id uuid primary key default gen_random_uuid(),
  crm_client_id text unique,                -- optional link to your existing CRM clients/authors table
  client_type text not null default 'individual' check (client_type in ('individual','business')),
  first_name text, last_name text,
  display_name text not null,
  company text, email text not null, phone text,
  billing_address text, vat_number text,
  source text, service text, owner text,
  email_documents boolean not null default true,
  portal_invite boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cb_items (
  id text primary key default gen_random_uuid()::text,
  name text not null, rate numeric(12,2) not null default 0,
  description text default '', active boolean not null default true
);

create table public.cb_quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique, base_number text, revision int not null default 0,
  client_id uuid not null references public.cb_clients(id),
  quote_date date not null default current_date,
  expiry_date date,
  subject text default '', salesperson text default 'Creative Books SA', notes text default '',
  require_signature boolean not null default true,
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','declined','superseded')),
  sub_total numeric(12,2) not null default 0, discount_total numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
  public_token uuid not null default gen_random_uuid() unique,
  sent_at timestamptz, viewed_at timestamptz, accepted_at timestamptz,
  signature jsonb, decline_reason text, superseded_by uuid references public.cb_quotes(id),
  created_at timestamptz not null default now()
);

create table public.cb_quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.cb_quotes(id) on delete cascade,
  item_id text references public.cb_items(id),
  name text not null, description text default '',
  qty numeric(12,2) not null default 1, rate numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0, discount_type text not null default 'amount' check (discount_type in ('amount','percent')),
  amount numeric(12,2) not null default 0, position int not null default 0
);

create table public.cb_projects (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null unique references public.cb_quotes(id),
  client_id uuid not null references public.cb_clients(id),
  title text not null,
  status text not null default 'on_hold' check (status in ('on_hold','in_production','complete','closed')),
  checklist jsonb not null default '[]',
  started_at timestamptz, completed_at timestamptz, files_released_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.cb_invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  type text not null check (type in ('deposit','balance')),
  quote_id uuid not null references public.cb_quotes(id),
  client_id uuid not null references public.cb_clients(id),
  project_id uuid references public.cb_projects(id),
  invoice_date date not null default current_date,
  percent numeric(5,2), total numeric(12,2) not null,
  amount_paid numeric(12,2) not null default 0, balance_due numeric(12,2) not null,
  status text not null default 'due' check (status in ('due','partially_paid','paid')),
  created_at timestamptz not null default now(),
  unique (quote_id, type)
);

create table public.cb_payments (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  invoice_id uuid not null references public.cb_invoices(id),
  amount numeric(12,2) not null check (amount > 0),
  paid_on date not null default current_date,
  method text not null check (method in ('eft','cash_deposit')),   -- T&C 4.1: no cheques
  deposit_to text, reference text,
  proof_url text not null, proof_name text,
  funds_cleared boolean not null default false, cleared_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.cb_activity (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.cb_quotes(id) on delete cascade,
  action text not null, text text not null,
  at timestamptz not null default now()
);

create index cb_quotes_client_idx on public.cb_quotes(client_id);
create index cb_invoices_quote_idx on public.cb_invoices(quote_id);
create index cb_payments_invoice_idx on public.cb_payments(invoice_id);
create index cb_activity_quote_idx on public.cb_activity(quote_id);

-- ---------- helpers ----------

ALTER TABLE public.cb_quote_items ADD CONSTRAINT cb_quote_item_values CHECK(qty>0 AND qty::text NOT IN ('NaN','Infinity','-Infinity') AND rate>=0 AND rate::text NOT IN ('NaN','Infinity','-Infinity') AND discount>=0 AND discount::text NOT IN ('NaN','Infinity','-Infinity') AND ((discount_type='percent' AND discount<=100) OR (discount_type='amount' AND discount<=round(qty*rate,2))));
ALTER TABLE public.cb_quotes ADD CONSTRAINT cb_quote_total_nonnegative CHECK(total>=0);
ALTER TABLE public.cb_settings ADD CONSTRAINT cb_settings_rules CHECK(quote_validity_days>0 AND quote_validity_days<=365 AND deposit_percent>0 AND deposit_percent<100);
CREATE INDEX cb_quote_items_quote_idx ON public.cb_quote_items(quote_id);
CREATE INDEX cb_projects_client_idx ON public.cb_projects(client_id);
CREATE INDEX cb_invoices_client_idx ON public.cb_invoices(client_id);
CREATE INDEX cb_invoices_project_idx ON public.cb_invoices(project_id);
CREATE INDEX cb_quote_items_item_idx ON public.cb_quote_items(item_id);
CREATE INDEX cb_quotes_superseded_idx ON public.cb_quotes(superseded_by);
CREATE FUNCTION cb_billing_private.cb_next_number(p_key text) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
declare n int; s public.cb_settings; prefix text;
begin
  select * into s from public.cb_settings where id = 1;
  update public.cb_counters set next = next + 1 where key = p_key returning next - 1 into n;
  prefix := case p_key when 'quote' then s.quote_prefix when 'invoice' then s.invoice_prefix else s.payment_prefix end;
  return prefix || lpad(n::text, s.number_digits, '0');
end $$;
CREATE FUNCTION cb_billing_private.cb_log(p_quote uuid, p_action text, p_text text) RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ insert into public.cb_activity(quote_id, action, text) values (p_quote, p_action, p_text) $$;
CREATE FUNCTION cb_billing_private.cb_line_amount(qty numeric, rate numeric, discount numeric, dtype text) RETURNS numeric
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
  select round(round(qty * rate, 2) - case when dtype = 'percent' then round(qty * rate * discount / 100, 2) else round(discount, 2) end, 2)
$$;
CREATE FUNCTION cb_billing_private.cb_save_quote(p_quote jsonb, p_items jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes; v_id uuid := nullif(p_quote->>'id','')::uuid; s public.cb_settings; v_date date; it jsonb; i int := 0; v_num text;
begin
 perform cb_billing_private.require_staff();
  select * into s from public.cb_settings where id = 1;
  if coalesce(p_quote->>'client_id','') = '' then raise exception 'Choose a client'; end if;
  if jsonb_array_length(coalesce(p_items,'[]')) = 0 then raise exception 'Add at least one item'; end if;
  v_date := coalesce(nullif(p_quote->>'quote_date','')::date, current_date);
  if v_id is not null then
    select * into q from public.cb_quotes where id = v_id for update;
    if not found then raise exception 'Quote not found'; end if;
    if q.status <> 'draft' then raise exception 'Only a draft can be edited. Use "Revise quote" for a sent quote (T&C 3.3).'; end if;
  else
    v_num := cb_billing_private.cb_next_number('quote');
    insert into public.cb_quotes(number, base_number, client_id) values (v_num, v_num, (p_quote->>'client_id')::uuid) returning * into q;
    perform cb_billing_private.cb_log(q.id, 'created', v_num || ' created');
  end if;
  update public.cb_quotes set
    client_id = (p_quote->>'client_id')::uuid, quote_date = v_date,
    expiry_date = v_date + s.quote_validity_days,                         -- T&C 3.1
    subject = coalesce(p_quote->>'subject',''), salesperson = coalesce(nullif(p_quote->>'salesperson',''), 'Creative Books SA'),
    notes = coalesce(p_quote->>'notes',''), require_signature = coalesce((p_quote->>'require_signature')::boolean, true)
  where id = q.id;
  delete from public.cb_quote_items where quote_id = q.id;
  for it in select * from jsonb_array_elements(p_items) loop
    if btrim(coalesce(it->>'name','')) <> '' then
      insert into public.cb_quote_items(quote_id, item_id, name, description, qty, rate, discount, discount_type, amount, position)
      values (q.id, nullif(it->>'item_id',''), it->>'name', coalesce(it->>'description',''),
        coalesce((it->>'qty')::numeric,0), coalesce((it->>'rate')::numeric,0), coalesce((it->>'discount')::numeric,0),
        coalesce(nullif(it->>'discount_type',''),'amount'),
        cb_billing_private.cb_line_amount(coalesce((it->>'qty')::numeric,0), coalesce((it->>'rate')::numeric,0), coalesce((it->>'discount')::numeric,0), coalesce(nullif(it->>'discount_type',''),'amount')), i);
      i := i + 1;
    end if;
  end loop;
  if i=0 then raise exception 'Add at least one named item'; end if;
  update public.cb_quotes set
    total = coalesce((select sum(amount) from public.cb_quote_items where quote_id = q.id), 0),
    sub_total = coalesce((select sum(amount) from public.cb_quote_items where quote_id = q.id), 0),
    discount_total = coalesce((select sum(round(qty*rate,2) - amount) from public.cb_quote_items where quote_id = q.id), 0)
  where id = q.id;
  return q.id;
end $$;
CREATE FUNCTION public.cb_save_quote(p_quote jsonb, p_items jsonb) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_save_quote(p_quote,p_items) $$;
REVOKE ALL ON FUNCTION public.cb_save_quote(jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_save_quote(jsonb,jsonb) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_mark_sent(p_quote_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes;
begin
 perform cb_billing_private.require_staff();
  select * into q from public.cb_quotes where id = p_quote_id for update;
  if not found then raise exception 'Quote not found'; end if;
  if q.total<=0 then raise exception 'A quote must have a positive total before sharing'; end if;
  if q.status not in ('draft','sent','viewed') then raise exception 'This quote can no longer be sent'; end if;
  update public.cb_quotes set status = case when status = 'draft' then 'sent' else status end, sent_at = now() where id = q.id;
  perform cb_billing_private.cb_log(q.id, 'sent', q.number || ' sent to client');
end $$;
CREATE FUNCTION public.cb_mark_sent(p_quote_id uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_mark_sent(p_quote_id) $$;
REVOKE ALL ON FUNCTION public.cb_mark_sent(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_mark_sent(uuid) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_revise_quote(p_quote_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes; n public.cb_quotes; r int;
begin
 perform cb_billing_private.require_staff();
  select * into q from public.cb_quotes where id = p_quote_id for update;
  if q.status not in ('sent','viewed','declined') then raise exception 'A % quote cannot be revised', q.status; end if;
  r := q.revision + 1;
  insert into public.cb_quotes(number, base_number, revision, client_id, quote_date, expiry_date, subject, salesperson, notes, require_signature, sub_total, discount_total, total)
  values (q.base_number || '-R' || r, q.base_number, r, q.client_id, current_date, current_date + (select quote_validity_days from public.cb_settings where id=1), q.subject, q.salesperson, q.notes, q.require_signature, q.sub_total, q.discount_total, q.total)
  returning * into n;
  insert into public.cb_quote_items(quote_id, item_id, name, description, qty, rate, discount, discount_type, amount, position)
    select n.id, item_id, name, description, qty, rate, discount, discount_type, amount, position from public.cb_quote_items where quote_id = q.id;
  update public.cb_quotes set status = 'superseded', superseded_by = n.id where id = q.id;
  perform cb_billing_private.cb_log(n.id, 'revised', n.number || ' created, replacing ' || q.number);
  return n.id;
end $$;
CREATE FUNCTION public.cb_revise_quote(p_quote_id uuid) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_revise_quote(p_quote_id) $$;
REVOKE ALL ON FUNCTION public.cb_revise_quote(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_revise_quote(uuid) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb__accept(q public.cb_quotes, p_name text, p_image text, p_method text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
declare s public.cb_settings; p public.cb_projects; inv public.cb_invoices; dep numeric;
begin
  if q.id is null then raise exception 'Quote not found'; end if;
  if q.total<=0 then raise exception 'A quote must have a positive total'; end if;
  if btrim(coalesce(p_name,''))='' then raise exception 'Enter the name of the person accepting'; end if;
  if length(coalesce(p_name,''))>200 then raise exception 'Name is too long'; end if;
  if p_method='portal' and p_image is not null and (length(p_image)>1500000 or p_image !~ '^data:image/png;base64,[A-Za-z0-9+/=]+$') then raise exception 'Invalid signature image'; end if;
  if p_method='upload' and (coalesce(p_image,'') not like 'storage:%' or not exists(select 1 from storage.objects where bucket_id='cb-proofs' and name=substring(p_image from 9))) then raise exception 'Upload the signed copy first'; end if;
  select * into s from public.cb_settings where id = 1;
  if q.status not in ('sent','viewed') then raise exception 'This quote is % and can''t be accepted', q.status; end if;
  if q.expiry_date < current_date then raise exception 'This quote has expired (T&C 3.1). Please ask us for a revised quote.'; end if;
  if q.require_signature and p_method = 'portal' and (coalesce(p_name,'') = '' or coalesce(p_image,'') = '') then
    raise exception 'Name and signature are required (T&C 3.7)'; end if;
  update public.cb_quotes set status = 'accepted', accepted_at = now(),
    signature = jsonb_build_object('name', p_name, 'image', p_image, 'method', p_method, 'signed_at', now())
  where id = q.id;
  perform cb_billing_private.cb_log(q.id, 'accepted', case when p_method = 'portal' then 'Accepted & signed by ' || p_name
    else 'Marked accepted (' || case when p_method = 'upload' then 'signed copy uploaded' else 'manual' end || ')' end);
  insert into public.cb_projects(quote_id, client_id, title, checklist)
  values (q.id, q.client_id, coalesce(nullif(q.subject,''), q.number),
    (select coalesce(jsonb_agg(jsonb_build_object('label', x, 'done', false)), '[]') from jsonb_array_elements_text(s.project_checklist) x))
  returning * into p;
  dep := round(q.total * s.deposit_percent / 100, 2);
  insert into public.cb_invoices(number, type, quote_id, client_id, project_id, percent, total, balance_due)
  values (cb_billing_private.cb_next_number('invoice'), 'deposit', q.id, q.client_id, p.id, s.deposit_percent, dep, dep) returning * into inv;
  perform cb_billing_private.cb_log(q.id, 'invoice', inv.number || ' deposit invoice created (' || s.deposit_percent::int || '%)');
  return jsonb_build_object('quote_id', q.id, 'invoice_id', inv.id, 'project_id', p.id);
end $$;
CREATE FUNCTION cb_billing_private.cb_accept_quote_internal(p_quote_id uuid, p_method text, p_name text, p_file text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes;
begin
 perform cb_billing_private.require_staff();
  if p_method not in ('upload','manual') then raise exception 'Invalid method'; end if;
  select * into q from public.cb_quotes where id = p_quote_id for update;
  return cb_billing_private.cb__accept(q, p_name, p_file, p_method);
end $$;
CREATE FUNCTION public.cb_accept_quote_internal(p_quote_id uuid, p_method text, p_name text, p_file text) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_accept_quote_internal(p_quote_id,p_method,p_name,p_file) $$;
REVOKE ALL ON FUNCTION public.cb_accept_quote_internal(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_accept_quote_internal(uuid,text,text,text) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_portal_quote(p_token uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes;
begin
  select * into q from public.cb_quotes where public_token = p_token for update;
  if not found then raise exception 'This quote link is not valid'; end if;
  if q.status='draft' then raise exception 'This quote is not ready to share'; end if;
  if q.status = 'sent' then
    update public.cb_quotes set status = 'viewed', viewed_at = now() where id = q.id returning * into q;
    perform cb_billing_private.cb_log(q.id, 'viewed', 'Viewed by client');
  end if;
  return jsonb_build_object(
    'quote', to_jsonb(q) - 'signature' - 'decline_reason',
    'client', (select jsonb_build_object('display_name', display_name, 'first_name', first_name, 'company', company) from public.cb_clients where id = q.client_id),
    'items', (select coalesce(jsonb_agg(to_jsonb(i) order by position), '[]') from public.cb_quote_items i where quote_id = q.id));
end $$;
CREATE FUNCTION public.cb_portal_quote(p_token uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_portal_quote(p_token) $$;
REVOKE ALL ON FUNCTION public.cb_portal_quote(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_portal_quote(uuid) TO authenticated,service_role,anon;
CREATE FUNCTION cb_billing_private.cb_accept_quote(p_token uuid, p_name text, p_signature text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes;
begin
  select * into q from public.cb_quotes where public_token = p_token for update;
  if not found then raise exception 'This quote link is not valid'; end if;
  return cb_billing_private.cb__accept(q, p_name, p_signature, 'portal');
end $$;
CREATE FUNCTION public.cb_accept_quote(p_token uuid, p_name text, p_signature text) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_accept_quote(p_token,p_name,p_signature) $$;
REVOKE ALL ON FUNCTION public.cb_accept_quote(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_accept_quote(uuid,text,text) TO authenticated,service_role,anon;
CREATE FUNCTION cb_billing_private.cb_decline_quote(p_token uuid, p_reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes;
begin
  select * into q from public.cb_quotes where public_token = p_token for update;
  if not found then raise exception 'This quote link is not valid'; end if;
  if length(coalesce(p_reason,''))>4000 then raise exception 'Reason is too long'; end if;
  if q.status not in ('sent','viewed') then raise exception 'This quote is %', q.status; end if;
  update public.cb_quotes set status = 'declined', decline_reason = p_reason where id = q.id;
  perform cb_billing_private.cb_log(q.id, 'declined', 'Declined by client' || coalesce(': ' || nullif(p_reason,''), ''));
end $$;
CREATE FUNCTION public.cb_decline_quote(p_token uuid, p_reason text) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_decline_quote(p_token,p_reason) $$;
REVOKE ALL ON FUNCTION public.cb_decline_quote(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_decline_quote(uuid,text) TO authenticated,service_role,anon;
CREATE FUNCTION cb_billing_private.cb_request_changes(p_token uuid, p_message text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare q public.cb_quotes;
begin
  select * into q from public.cb_quotes where public_token = p_token;
  if not found then raise exception 'This quote link is not valid'; end if;
  if q.status not in ('sent','viewed') or q.expiry_date<current_date then raise exception 'This quote is not open for changes'; end if;
  if length(coalesce(p_message,''))>4000 then raise exception 'Message is too long'; end if;
  if (select count(*) from public.cb_activity where quote_id=q.id and action='changes' and at>now()-interval '1 day')>=10 then raise exception 'Too many change requests; contact the team'; end if;
  perform cb_billing_private.cb_log(q.id, 'changes', 'Client asked for changes: ' || coalesce(nullif(p_message,''), '(no message)'));
end $$;
CREATE FUNCTION public.cb_request_changes(p_token uuid, p_message text) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_request_changes(p_token,p_message) $$;
REVOKE ALL ON FUNCTION public.cb_request_changes(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_request_changes(uuid,text) TO authenticated,service_role,anon;
CREATE FUNCTION cb_billing_private.cb__apply_gates(p_invoice_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
declare inv public.cb_invoices; cleared numeric;
begin
  select * into inv from public.cb_invoices where id = p_invoice_id;
  if inv.type <> 'deposit' then return; end if;
  select coalesce(sum(amount),0) into cleared from public.cb_payments where invoice_id = inv.id and funds_cleared;
  if cleared >= inv.total - 0.001 then
    update public.cb_projects set status = 'in_production', started_at = now() where id = inv.project_id and status = 'on_hold';
    if found then perform cb_billing_private.cb_log(inv.quote_id, 'project', 'Deposit cleared: project moved to In Production'); end if;
  end if;
end $$;
CREATE FUNCTION cb_billing_private.cb_record_payment(p_payment jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare inv public.cb_invoices; pay public.cb_payments; amt numeric := round((p_payment->>'amount')::numeric, 2); cleared boolean := coalesce((p_payment->>'funds_cleared')::boolean, false);
begin
 perform cb_billing_private.require_staff();
  select * into inv from public.cb_invoices where id = (p_payment->>'invoice_id')::uuid for update;
  if not found then raise exception 'Invoice not found'; end if;
  if amt::text in ('NaN','Infinity','-Infinity') then raise exception 'Invalid payment amount'; end if;
  if coalesce(amt,0) <= 0 then raise exception 'Enter the amount received'; end if;
  if amt > inv.balance_due + 0.001 then raise exception 'Amount is more than the balance due (R%)', inv.balance_due; end if;
  if p_payment->>'method' not in ('eft','cash_deposit') then raise exception 'Only EFT or cash deposit is accepted (T&C 4.1)'; end if;
  if coalesce(p_payment->>'proof_url','') not like 'storage:%' or not exists(select 1 from storage.objects where bucket_id='cb-proofs' and name=substring(p_payment->>'proof_url' from 9)) then raise exception 'Attach the uploaded proof of payment'; end if;
  insert into public.cb_payments(number, invoice_id, amount, paid_on, method, deposit_to, reference, proof_url, proof_name, funds_cleared, cleared_at)
  values (cb_billing_private.cb_next_number('payment'), inv.id, amt, coalesce(nullif(p_payment->>'paid_on','')::date, current_date), p_payment->>'method',
    p_payment->>'deposit_to', p_payment->>'reference', p_payment->>'proof_url', p_payment->>'proof_name', cleared, case when cleared then now() end)
  returning * into pay;
  update public.cb_invoices set amount_paid = amount_paid + amt, balance_due = total - (amount_paid + amt),
    status = case when total - (amount_paid + amt) <= 0 then 'paid' else 'partially_paid' end
  where id = inv.id;
  perform cb_billing_private.cb_log(inv.quote_id, 'payment', pay.number || ': R' || to_char(amt, 'FM999,999,990.00') || ' received on ' || inv.number || case when cleared then ' (funds cleared)' else '' end);
  perform cb_billing_private.cb__apply_gates(inv.id);
  return to_jsonb(pay);
end $$;
CREATE FUNCTION public.cb_record_payment(p_payment jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_record_payment(p_payment) $$;
REVOKE ALL ON FUNCTION public.cb_record_payment(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_record_payment(jsonb) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_clear_payment(p_payment_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare pay public.cb_payments; inv public.cb_invoices;
begin
 perform cb_billing_private.require_staff();
 select * into pay from public.cb_payments where id=p_payment_id;
 if not found then raise exception 'Payment not found'; end if;
 select * into inv from public.cb_invoices where id=pay.invoice_id for update;
 update public.cb_payments set funds_cleared=true,cleared_at=now() where id=pay.id and not funds_cleared returning * into pay;
 if not found then return; end if;
 perform cb_billing_private.cb_log(inv.quote_id,'cleared',pay.number||' funds cleared');
 perform cb_billing_private.cb__apply_gates(inv.id);
end $$;
CREATE FUNCTION public.cb_clear_payment(p_payment_id uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_clear_payment(p_payment_id) $$;
REVOKE ALL ON FUNCTION public.cb_clear_payment(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_clear_payment(uuid) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_toggle_checklist(p_project_id uuid, p_index int) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$BEGIN
 PERFORM cb_billing_private.require_staff();
 IF NOT EXISTS(SELECT 1 FROM public.cb_projects WHERE id=p_project_id AND p_index>=0 AND p_index<jsonb_array_length(checklist)) THEN RAISE EXCEPTION 'Project or checklist item not found'; END IF;
update public.cb_projects set checklist = jsonb_set(checklist, array[p_index::text, 'done'], to_jsonb(not coalesce((checklist->p_index->>'done')::boolean, false)))
  where id = p_project_id;
END $$;
CREATE FUNCTION public.cb_toggle_checklist(p_project_id uuid, p_index int) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_toggle_checklist(p_project_id,p_index) $$;
REVOKE ALL ON FUNCTION public.cb_toggle_checklist(uuid,int) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_toggle_checklist(uuid,int) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_complete_project(p_project_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare p public.cb_projects; q public.cb_quotes; s public.cb_settings; paid numeric; inv public.cb_invoices;
begin
 perform cb_billing_private.require_staff();
  select * into s from public.cb_settings where id = 1;
  select * into p from public.cb_projects where id = p_project_id for update;
  if p.status <> 'in_production' then raise exception 'Only a project in production can be completed'; end if;
  select * into q from public.cb_quotes where id = p.quote_id;
  select coalesce(sum(pm.amount),0) into paid from public.cb_payments pm join public.cb_invoices i on i.id = pm.invoice_id where i.quote_id = q.id;
  update public.cb_projects set status = 'complete', completed_at = now() where id = p.id;
  insert into public.cb_invoices(number, type, quote_id, client_id, project_id, percent, total, balance_due)
  values (cb_billing_private.cb_next_number('invoice'), 'balance', q.id, q.client_id, p.id, 100 - s.deposit_percent, round(q.total - (select total from public.cb_invoices where quote_id=q.id and type='deposit'), 2), round(q.total - (select total from public.cb_invoices where quote_id=q.id and type='deposit'), 2))
  returning * into inv;
  perform cb_billing_private.cb_log(q.id, 'invoice', 'Project complete: ' || inv.number || ' balance invoice created');
  return inv.id;
end $$;
CREATE FUNCTION public.cb_complete_project(p_project_id uuid) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_complete_project(p_project_id) $$;
REVOKE ALL ON FUNCTION public.cb_complete_project(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_complete_project(uuid) TO authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_release_files(p_project_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
declare p public.cb_projects;
begin
 perform cb_billing_private.require_staff();
  select * into p from public.cb_projects where id = p_project_id for update;
  if not found then raise exception 'Project not found'; end if;
  if p.status='closed' then return; end if;
  if p.status<>'complete' then raise exception 'Complete the project first'; end if;
  if not exists (select 1 from public.cb_invoices where project_id = p.id and type = 'balance' and status = 'paid' and (select coalesce(sum(amount),0) from public.cb_payments where invoice_id=public.cb_invoices.id and funds_cleared)>=total) then
    raise exception 'Final files are released only after the balance is paid (T&C 4.3)'; end if;
  update public.cb_projects set status = 'closed', files_released_at = now() where id = p.id;
  perform cb_billing_private.cb_log(p.quote_id, 'closed', 'Final files released, deal closed');
end $$;
CREATE FUNCTION public.cb_release_files(p_project_id uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_release_files(p_project_id) $$;
REVOKE ALL ON FUNCTION public.cb_release_files(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_release_files(uuid) TO authenticated,service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cb_billing_private FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_save_quote(jsonb,jsonb) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_mark_sent(uuid) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_revise_quote(uuid) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_accept_quote_internal(uuid,text,text,text) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_portal_quote(uuid) TO authenticated,service_role,anon;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_accept_quote(uuid,text,text) TO authenticated,service_role,anon;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_decline_quote(uuid,text) TO authenticated,service_role,anon;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_request_changes(uuid,text) TO authenticated,service_role,anon;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_record_payment(jsonb) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_clear_payment(uuid) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_toggle_checklist(uuid,int) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_complete_project(uuid) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_release_files(uuid) TO authenticated,service_role;
ALTER TABLE public.cb_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_settings FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_settings TO authenticated;
GRANT ALL ON public.cb_settings TO service_role;
CREATE POLICY cb_settings_staff ON public.cb_settings FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_counters FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_counters TO authenticated;
GRANT ALL ON public.cb_counters TO service_role;
CREATE POLICY cb_counters_staff ON public.cb_counters FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_clients ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_clients FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_clients TO authenticated;
GRANT ALL ON public.cb_clients TO service_role;
CREATE POLICY cb_clients_staff ON public.cb_clients FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_items FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_items TO authenticated;
GRANT ALL ON public.cb_items TO service_role;
CREATE POLICY cb_items_staff ON public.cb_items FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_quotes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_quotes FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_quotes TO authenticated;
GRANT ALL ON public.cb_quotes TO service_role;
CREATE POLICY cb_quotes_staff ON public.cb_quotes FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_quote_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_quote_items FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_quote_items TO authenticated;
GRANT ALL ON public.cb_quote_items TO service_role;
CREATE POLICY cb_quote_items_staff ON public.cb_quote_items FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_projects ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_projects FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_projects TO authenticated;
GRANT ALL ON public.cb_projects TO service_role;
CREATE POLICY cb_projects_staff ON public.cb_projects FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_invoices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_invoices FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_invoices TO authenticated;
GRANT ALL ON public.cb_invoices TO service_role;
CREATE POLICY cb_invoices_staff ON public.cb_invoices FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_payments FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_payments TO authenticated;
GRANT ALL ON public.cb_payments TO service_role;
CREATE POLICY cb_payments_staff ON public.cb_payments FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
ALTER TABLE public.cb_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_activity FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_activity TO authenticated;
GRANT ALL ON public.cb_activity TO service_role;
CREATE POLICY cb_activity_staff ON public.cb_activity FOR ALL TO authenticated USING ((SELECT cb_private.is_staff())) WITH CHECK ((SELECT cb_private.is_staff()));
GRANT INSERT, UPDATE ON public.cb_clients TO authenticated;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES ('cb-proofs','cb-proofs',false,10485760,ARRAY['application/pdf','image/png','image/jpeg']) ON CONFLICT(id) DO NOTHING;
CREATE POLICY cb_billing_proofs_staff ON storage.objects FOR ALL TO authenticated USING(bucket_id='cb-proofs' AND (SELECT cb_private.is_staff())) WITH CHECK(bucket_id='cb-proofs' AND (SELECT cb_private.is_staff()));
-- ---------- starter catalogue (from the Zoho item list; edit rates as needed) ----------
insert into public.cb_items (id, name, rate, description) values
  ('book-printing', 'Book Printing', 220, ''),
  ('advanced-layout', 'Advanced Layout & Typesetting', 25, E'- Advanced Formatting\n- Paragraph indentation\n- Includes Source File\n- Well structured chapter headings\n- Beautiful Layout Design'),
  ('amazon-paperback', 'Amazon paperback (Print Version)', 2200, ''),
  ('amazon-sep', 'amazon Sep', 2000, ''),
  ('amendments', 'Amendments', 400, ''),
  ('authors-book-cover', 'Authors Book Cover', 0, '')
on conflict (id) do nothing;

-- Copy contact details into billing without changing the source CRM records or fabricating missing emails.
INSERT INTO public.cb_clients(crm_client_id,display_name,company,email,phone,billing_address,vat_number,source)
SELECT id,coalesce(nullif(btrim(data->>'full_name'),''),data->>'email'),nullif(data->>'company',''),data->>'email',data->>'phone',data->>'billing_address',data->>'vat_number','Existing CRM contact'
FROM public.contact WHERE data->>'email' ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$';
UPDATE public.cb_counters SET next=greatest(next,coalesce((SELECT max((regexp_match(data->>'invoice_number','^INV-([0-9]+)$'))[1]::int)+1 FROM public.invoice),1)) WHERE key='invoice';
UPDATE public.cb_counters SET next=greatest(next,coalesce((SELECT max((regexp_match(data->>'quote_number','^Quote-([0-9]+)$'))[1]::int)+1 FROM public.quote),1)) WHERE key='quote';
UPDATE public.cb_counters SET next=greatest(next,coalesce((SELECT max((regexp_match(data->>'payment_number','^PAY-([0-9]+)$'))[1]::int)+1 FROM public.payment),1)) WHERE key='payment';
COMMIT;
