# Supabase migration notes

This folder contains starter SQL, Edge Function starters, and deployment notes for moving the Creative Books SA app from Base44 runtime services to Supabase.

## Required frontend environment variables

Add these to your local `.env` file and your hosting provider:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Required Edge Function secrets

Add these in Supabase under Project Settings, Edge Functions, Secrets:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=Creative Books SA <noreply@creativebooks.co.za>
ADMIN_EMAIL=info@creativebooks.co.za
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend.

## Required first table

The frontend auth layer expects a `profiles` table with an `id` column matching `auth.users.id` and a `role` column. Set your admin user's profile role to `admin`.

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

## Run the starter migration

Run this file in the Supabase SQL editor:

```text
supabase/migrations/001_profiles_and_core_tables.sql
```

## Deploy starter Edge Functions

From a machine with the Supabase CLI connected to your project:

```bash
supabase functions deploy captureFormSubmission
supabase functions deploy sendFormEmailResend
```

The current frontend calls these functions from the quote and contact forms. The compatibility layer also has fallbacks so early testing can continue before all functions are deployed.

## Compatibility layer

`src/api/base44Client.js` now routes the old `base44.entities.*` and `base44.functions.invoke(...)` calls through Supabase. This is a bridge only. Each dashboard module should still be converted directly to Supabase table queries or Edge Function calls as the final migration step.

## Local testing

After pulling the `supabase-migration` branch:

```bash
npm install
npm run build
npm run dev
```

A new `package-lock.json` should be generated after `npm install`.
