# Supabase Setup for Creative Books SA

This repository is being migrated from Base44 to Supabase incrementally. The public website and business modules should be moved one module at a time rather than switched all at once.

## 1. Create the Supabase project

Create a Supabase project and keep the project URL and publishable key available for the deployment environment.

## 2. Apply the database migration

Apply:

```text
supabase/migrations/202607040001_auth_foundation.sql
```

This creates:

- `public.profiles`
- roles: `super_admin`, `admin`, `staff`, `client`
- automatic profile creation when a Supabase Auth user is created
- a backfill for existing Supabase Auth users
- Row Level Security policies
- admin role checks at database level

## 3. Configure local environment variables

Create `.env.local` from `.env.example` and set:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Do not commit `.env.local` or private service-role keys.

## 4. Create the first administrator

Create the first user in Supabase Auth. Then promote the profile in the SQL Editor:

```sql
update public.profiles
set role = 'super_admin'
where id = '<USER_UUID>';
```

The browser application must never contain a Supabase service-role key.

## 5. Test authentication

Test these flows before merging the migration branch:

1. Open `/admin/login`.
2. Log in with the Supabase Auth email and password.
3. Confirm that `super_admin` and `admin` users reach `/admin/dashboard`.
4. Confirm that `staff` and `client` users cannot access protected admin routes.
5. Sign out and confirm that protected routes return to `/admin/login`.

## 6. Deployment environment

Add the same public Supabase environment variables to the deployment platform. Preview deployments should use a non-production Supabase environment where possible.

## Migration order after authentication

The recommended order for the existing Creative Books SA app is:

1. Submissions and Leads
2. Clients and Contacts
3. Pipeline and Follow-ups
4. Quotes and Invoices
5. Payments
6. Documents and E-signatures
7. Projects and Production Board
8. Appointments and Booking Settings
9. Client Portal
10. Automations, Email, WhatsApp and Notifications
11. Reports, Revenue Forecast and Analytics
12. SEO and Search Console integrations

Each module should receive its own database migration, Row Level Security policies, data-access layer and test pass before Base44 dependencies are removed from that module.
