-- Finance RPC hardening and service-role compatibility

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.role() = 'service_role'
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('super_admin', 'admin')
    );
$$;

-- Internal helpers should only run through triggers or trusted RPCs.
revoke all on function public.set_finance_updated_date() from public;
revoke all on function public.prepare_invoice_write() from public;
revoke all on function public.recalculate_invoice_from_payments(uuid) from public;
revoke all on function public.sync_invoice_after_payment_change() from public;

-- Keep user-facing RPC execution limited to authenticated users. The functions
-- themselves still enforce admin access, while service-role Edge Functions are
-- allowed by current_user_is_admin().
revoke all on function public.save_quote(uuid, uuid, date, boolean, numeric, text, text, text, jsonb) from public;
grant execute on function public.save_quote(uuid, uuid, date, boolean, numeric, text, text, text, jsonb) to authenticated;
grant execute on function public.save_quote(uuid, uuid, date, boolean, numeric, text, text, text, jsonb) to service_role;

revoke all on function public.duplicate_quote(uuid) from public;
grant execute on function public.duplicate_quote(uuid) to authenticated;
grant execute on function public.duplicate_quote(uuid) to service_role;

revoke all on function public.convert_quote_to_invoice(uuid, date) from public;
grant execute on function public.convert_quote_to_invoice(uuid, date) to authenticated;
grant execute on function public.convert_quote_to_invoice(uuid, date) to service_role;

revoke all on function public.refresh_overdue_invoices() from public;
grant execute on function public.refresh_overdue_invoices() to authenticated;
grant execute on function public.refresh_overdue_invoices() to service_role;
