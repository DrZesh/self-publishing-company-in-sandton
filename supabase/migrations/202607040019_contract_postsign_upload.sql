-- Preserve the signing token briefly after completion so the browser can upload
-- the generated signed PDF through the token-scoped post-sign upload flow.

create or replace function public.preserve_contract_sign_token_after_signing()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('Signed', 'Fully Signed')
     and old.sign_token is not null
     and new.sign_token is null then
    new.sign_token = old.sign_token;
  end if;
  return new;
end;
$$;

revoke all on function public.preserve_contract_sign_token_after_signing() from public;

drop trigger if exists contracts_preserve_sign_token_after_signing on public.contracts;
create trigger contracts_preserve_sign_token_after_signing
before update on public.contracts
for each row execute procedure public.preserve_contract_sign_token_after_signing();
