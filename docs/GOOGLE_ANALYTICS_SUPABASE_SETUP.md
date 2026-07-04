# Google Analytics on Supabase

The GA4 migration uses the `analytics-data` Supabase Edge Function while preserving the existing `getAnalyticsData` frontend response contract.

The migrated dashboard uses Google Analytics Data API reports and realtime reports. Property discovery uses the Google Analytics Admin API.

## 1. Apply the database migration

Apply migrations through `202607040017_google_analytics_cache.sql`.

This creates `public.ga_cache`, a server-side cache table with Row Level Security enabled. The browser does not access this table directly. The Edge Function reads and writes it using the Supabase service role.

## 2. Configure Google credentials

Use one of the following credential modes.

### Preferred: Google service account

The same `GOOGLE_SERVICE_ACCOUNT_JSON` secret used for Search Console can also be used for Google Analytics, provided the service account email has access to GA4 property `365718361`.

1. Enable the Google Analytics Data API and Google Analytics Admin API in the Google Cloud project.
2. Add the service account email to the GA4 property with read access.
3. Store the complete JSON key in the Supabase Edge Function secret `GOOGLE_SERVICE_ACCOUNT_JSON`.

```bash
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"
```

The Edge Function requests the `analytics.readonly` scope for GA4 calls.

### Alternative: OAuth refresh token

Use a refresh token authorized for Google Analytics read-only access and set:

```bash
supabase secrets set GA_CLIENT_ID="..."
supabase secrets set GA_CLIENT_SECRET="..."
supabase secrets set GA_REFRESH_TOKEN="..."
```

The Edge Function prefers `GOOGLE_SERVICE_ACCOUNT_JSON` when both credential modes are configured.

## 3. Deploy the Edge Function

```bash
supabase functions deploy analytics-data
```

The function requires a valid Supabase JWT and then checks the caller's `profiles.role`. Only `super_admin` and `admin` roles may call the GA4 integration.

## 4. Functional verification

Open the Website Analytics admin screen and verify:

- 30-day sessions trend
- active users
- page views
- bounce rate
- average session duration
- traffic sources
- top pages
- realtime active users and page activity
- manual refresh

The current dashboard property ID is `365718361`.

## Cache behaviour

- Standard 30-day reports: 1 hour
- Property and account discovery: 6 hours
- Realtime data: 20 seconds
- Manual dashboard refresh sends `forceRefresh: true`, bypassing the read cache and refreshing stored report values

Google access tokens are kept only in the running Edge Function isolate and are refreshed before expiry.
