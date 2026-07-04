create table if not exists public.ga_cache (
  cache_key text primary key,
  payload jsonb not null,
  cached_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists ga_cache_expires_at_idx
  on public.ga_cache (expires_at);

alter table public.ga_cache enable row level security;

comment on table public.ga_cache is
  'Server-side cache for Google Analytics Edge Function responses. Access is limited to service-role operations through the Edge Function.';
