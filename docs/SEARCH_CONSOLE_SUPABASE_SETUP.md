# Google Search Console on Supabase

The Search Console migration uses the `search-console-data` Supabase Edge Function and keeps the existing frontend `searchConsoleData` response contract intact.

## 1. Apply the database migration

Apply migrations through `202607040016_search_console_cache.sql`.

This creates `public.gsc_cache`, which stores server-side Search Console responses with expiry timestamps. The table has Row Level Security enabled and is accessed by the Edge Function through the Supabase service role.

## 2. Configure Google credentials

Use one of the following credential modes.

### Preferred: Google service account

1. Create or select a Google Cloud project with the Search Console API enabled.
2. Create a service account and JSON key.
3. Grant that service account email access to the `creativebooks.co.za` Search Console property.
4. Store the complete JSON key as a Supabase Edge Function secret named `GOOGLE_SERVICE_ACCOUNT_JSON`.

Example CLI command:

```bash
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"
```

### Alternative: OAuth refresh token

Set all three secrets:

```bash
supabase secrets set GSC_CLIENT_ID="..."
supabase secrets set GSC_CLIENT_SECRET="..."
supabase secrets set GSC_REFRESH_TOKEN="..."
```

The Edge Function prefers `GOOGLE_SERVICE_ACCOUNT_JSON` when both credential modes are present.

## 3. Optional property override

The default property is:

```text
sc-domain:creativebooks.co.za
```

To use another Search Console property, set:

```bash
supabase secrets set GSC_SITE_URL="sc-domain:creativebooks.co.za"
```

## 4. Deploy the Edge Function

```bash
supabase functions deploy search-console-data
```

The function is configured with JWT verification enabled. It also verifies the caller against the `profiles` table and only allows `super_admin` and `admin` roles.

## 5. Functional verification

Test these screens with an authenticated admin account:

- `/admin/seo`
- `/admin/search-console`
- Dashboard Search Console mini card, when present

Verify these actions:

- Performance trend
- Period comparison
- Top queries
- Top pages
- Countries
- Devices
- Search appearance
- Smart insights
- Sitemap list
- Sitemap submission
- URL inspection
- Force refresh

## Cache behaviour

- Analytics responses: 6 hours
- Sitemap list: 1 hour
- URL inspection: 15 minutes
- `forceRefresh: true`: bypasses the read cache and refreshes the stored value
- Sitemap submission: clears the Search Console cache after a successful submission

Google access tokens are cached only in the running Edge Function isolate and are refreshed before expiry.
