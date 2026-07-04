-- Creative Books SA: Client Portal hardening

create or replace function public.regenerate_client_portal_token(p_access_id uuid)
returns public.client_portal_access
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_access public.client_portal_access%rowtype;
begin
  if not public.current_user_is_admin() and auth.role() <> 'service_role' then
    raise exception 'Admin access required';
  end if;

  update public.client_portal_access
  set access_token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
      access_count = 0,
      last_accessed_at = null
  where id = p_access_id
  returning * into v_access;

  if not found then
    raise exception 'Portal access record not found';
  end if;

  return v_access;
end;
$$;

revoke all on function public.regenerate_client_portal_token(uuid) from public;
grant execute on function public.regenerate_client_portal_token(uuid) to authenticated, service_role;
