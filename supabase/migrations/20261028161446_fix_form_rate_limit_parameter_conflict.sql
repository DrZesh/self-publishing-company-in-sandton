create or replace function public.cb_rate_limit(fingerprint text, maximum integer) returns boolean language plpgsql security definer set search_path = '' as $$
declare current_count integer;
begin
 insert into cb_private.request_limits as limits values($1,date_trunc('minute',now()),1)
 on conflict on constraint request_limits_pkey do update set count=limits.count+1 returning count into current_count;
 delete from cb_private.request_limits where window_start < now()-interval '1 hour';
 return current_count <= $2;
end;
$$;
revoke all on function public.cb_rate_limit(text,integer) from public,anon,authenticated;
grant execute on function public.cb_rate_limit(text,integer) to service_role;
