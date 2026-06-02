# Supabase migration notes

This folder contains starter SQL and notes for moving the Creative Books SA app from Base44 runtime services to Supabase.

## Required frontend environment variables

Add these to your local `.env` file and your hosting provider:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Required first table

The frontend auth layer expects a `profiles` table with an `id` column matching `auth.users.id` and a `role` column. Set your admin user's profile role to `admin`.

## Compatibility layer

`src/api/base44Client.js` now routes the old `base44.entities.*` and `base44.functions.invoke(...)` calls through Supabase. This is a bridge only. Each dashboard module should still be converted directly to Supabase table queries or Edge Function calls as the final migration step.
