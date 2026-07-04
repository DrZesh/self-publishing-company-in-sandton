# Supabase Setup for Creative Books SA

This repository is being migrated from Base44 to Supabase incrementally. The public website and business modules should be moved one module at a time rather than switched all at once.

## 1. Create the Supabase project

Create a Supabase project and keep the project URL and publishable key available for the deployment environment.

## 2. Apply the database migrations

Apply the migrations in this order:

```text
supabase/migrations/202607040001_auth_foundation.sql
supabase/migrations/202607040002_submissions_leads.sql
```

The first migration creates:

- `public.profiles`
- roles: `super_admin`, `admin`, `staff`, `client`
- automatic profile creation when a Supabase Auth user is created
- a backfill for existing Supabase Auth users
- Row Level Security policies
- admin role checks at database level

The second migration creates:

- `public.contacts`
- `public.submissions`
- `public.leads`
- `public.activity_logs`
- indexes and data integrity checks
- Row Level Security for CRM tables
- automatic lead weighted-value calculation
- atomic `convert_submission_to_lead` database function
- realtime publication for submission changes

## 3. Deploy the submission capture Edge Function

Deploy:

```text
supabase/functions/capture-form-submission
```

The function receives public Contact and Quote form payloads, creates or updates a contact, creates the submission, links the records and writes an activity log.

Set a private function secret for IP hashing:

```text
CAPTURE_IP_SALT=<LONG_RANDOM_SECRET>
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in browser environment variables. Supabase provides service environment values to the Edge Function runtime.

## 4. Configure local environment variables

Create `.env.local` from `.env.example` and set:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Do not commit `.env.local` or private service-role keys.

## 5. Create the first administrator

Create the first user in Supabase Auth. Then promote the profile in the SQL Editor:

```sql
update public.profiles
set role = 'super_admin'
where id = '<USER_UUID>';
```

The browser application must never contain a Supabase service-role key.

## 6. Test authentication and CRM flows

Test these flows before merging the migration branch:

1. Open `/admin/login`.
2. Log in with the Supabase Auth email and password.
3. Confirm that `super_admin` and `admin` users reach `/admin/dashboard`.
4. Confirm that `staff` and `client` users cannot access protected admin routes.
5. Submit the public Contact form and confirm it appears in `/admin/submissions`.
6. Submit the public Quote form and confirm the contact and submission are linked.
7. Open a new submission and confirm its status changes from `new` to `read`.
8. Add and save internal notes.
9. Convert a submission to a lead and confirm the lead, contact linkage and submission status update together.
10. Create, edit, change stage and delete a manual lead.
11. Sign out and confirm that protected routes return to `/admin/login`.

## 7. Deployment environment

Add the same public Supabase environment variables to the deployment platform. Preview deployments should use a non-production Supabase environment where possible.

## Migration order after the current phase

The recommended order for the remaining Creative Books SA app is:

1. Admin Contacts screen and contact detail dependencies
2. Pipeline and Follow-ups
3. Quotes and Invoices
4. Payments
5. Documents and E-signatures
6. Projects and Production Board
7. Appointments and Booking Settings
8. Client Portal
9. Automations, Email, WhatsApp and Notifications
10. Reports, Revenue Forecast and Analytics
11. SEO and Search Console integrations

Each module should receive its own database migration, Row Level Security policies, data-access layer and test pass before Base44 dependencies are removed from that module.
