# Creative Books SA

React/Vite website and CRM using Supabase.

## Vercel deployment

Use the repository root, Vite framework, `npm run build` build command and `dist` output directory. The included vercel.json configures these values and client-side route fallback.

Set these Vercel environment variables for Production and Preview before deploying:

- `VITE_SUPABASE_URL=https://cobpbsfkeewxzyprbmet.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the publishable key from this project's Supabase dashboard.

Never put a service-role or secret key in a VITE variable. Redeploy after changing environment variables. Existing deployments retain their original values.

## Backend status

On 28 October 2026, the supplied schema was installed in project `cobpbsfkeewxzyprbmet` (Creative Books SA Database, Nkanyani account). All 71 public entity tables have RLS enabled. The documents bucket is private. No client records, accounts or uploaded files were included in the source ZIP.

Do not reapply supabase/schema.sql or the initial migration to that project: it is already installed. The two files describe the same initial schema.

The 106 Edge Function entrypoints are included as source. They still require deployment to this project and the appropriate integration secrets. Deploy using the Supabase CLI after login and check the project ref carefully:

```sh
npx supabase functions deploy --project-ref cobpbsfkeewxzyprbmet --use-api
```

Consult supabase/.env.example for server integration secrets. Third-party OAuth sessions and Base44 schedules do not transfer from this export. Configure schedules, webhooks and provider credentials separately. Adobe Sign inbound webhooks remain denied until verified webhook authentication is implemented.

Set the Supabase Auth site URL to the production website and allow its `/admin/login` and `/admin/reset-password` callback URLs. Google sign-in needs its provider credentials. Create the first administrator using scripts/create-admin.mjs with credentials supplied through a trusted terminal environment, or create the Auth account and assign the admin role through trusted SQL.

Deploying the frontend alone does not complete backend setup. Verify login, forms, file uploads and provider workflows before moving production traffic. Marketing image URLs still use the original media CDN.

## Local checks

```sh
npm ci
npm test
npm run build
```

Copy .env.example to .env.local for local development and supply the project's public publishable key. Entity definitions are preserved in docs/entity-schemas.json.

## Partial deployment

The website target is https://creativebooks.co.za, Vercel project creative-books-sa. Supabase function deployment is partial. See docs/DEPLOYMENT_STATUS.json. Functions flagged for external communications or access control are intentionally disabled or undeployed, with their source retained. Forms and booking that depend on disabled functions will not submit until those workflows are approved and configured. The website deployment does not imply that the CRM or integrations are ready.
