create table if not exists public.gsc_cache (
  cache_key text primary key,
  payload jsonb not null,
  cached_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists gsc_cache_expires_at_idx
  on public.gsc_cache (expires_at);

alter table public.gsc_cache enable row level security;

comment on table public.gsc_cache is
  'Server-side cache for Google Search Console Edge Function responses. Access is limited to service-role operations through the Edge Function.';
