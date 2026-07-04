# Supabase Setup for Creative Books SA

This repository is being migrated from Base44 to Supabase incrementally. Business modules are moved in bounded phases so working routes keep their current user interface while their data and server actions are redirected to Supabase.

## 1. Apply database migrations

Apply the migrations in this order:

```text
supabase/migrations/202607040001_auth_foundation.sql
supabase/migrations/202607040002_submissions_leads.sql
supabase/migrations/202607040003_contacts_pipeline_tasks_followups.sql
supabase/migrations/202607040004_quotes_invoices_payments.sql
supabase/migrations/202607040005_finance_rpc_hardening.sql
supabase/migrations/202607040006_documents_esignatures.sql
supabase/migrations/202607040007_projects_production.sql
supabase/migrations/202607040008_project_workflow_hardening.sql
supabase/migrations/202607040009_appointments_booking.sql
supabase/migrations/202607040010_appointments_booking_hardening.sql
supabase/migrations/202607040011_client_portal.sql
supabase/migrations/202607040012_client_portal_hardening.sql
supabase/migrations/202607040013_communications_automation.sql
supabase/migrations/202607040014_communications_automation_hardening.sql
supabase/migrations/202607040015_automation_task_compatibility.sql
```

## 2. Current Supabase module coverage

### Authentication and administration

- `public.profiles`
- roles: `super_admin`, `admin`, `staff`, `client`
- automatic profile creation for Supabase Auth users
- database-level admin authorization helpers
- Row Level Security policies

### CRM and follow-ups

- `public.contacts`
- `public.submissions`
- `public.leads`
- `public.activity_logs`
- `public.tasks`
- submission-to-lead conversion
- pipeline stage activity
- stale lead, unread submission, overdue task, quote and invoice reminders

### Quotes, invoices and payments

- `public.quotes`
- `public.quote_line_items`
- `public.quote_signatures`
- `public.invoices`
- `public.payments`
- atomic quote save and duplication
- quote-to-invoice conversion
- invoice balance reconciliation
- payment status reconciliation
- overdue invoice refresh

### Documents, clauses and electronic signatures

- `public.documents`
- `public.document_activities`
- `public.clauses`
- `public.e_signature_requests`
- `public.signature_audit_events`
- private `document-files` bucket
- private `signature-artifacts` bucket
- token-protected document access
- document expiry and revocation
- document versioning
- admin-first and client signing flows
- signer consent capture
- hashed network audit data
- signed PDF bundle and certificate generation

### Projects and Production Board

- `public.projects`
- `public.project_stage_history`
- `public.client_delays`
- production stage history
- waiting-on ownership
- print queue metadata
- revision counters and limits
- book specification JSON
- VIP and risk metadata
- automatic project and invoice creation after quote acceptance
- project payment status synchronization
- contract and proof approval synchronization from linked documents
- CRM pipeline protection against backward stage movement

### Appointments and Booking Settings

- `public.booking_services`
- `public.availability_rules`
- `public.appointments`
- seven seeded weekday availability rules
- Africa/Johannesburg slot calculation
- duration and buffer-aware slot generation
- minimum notice enforcement
- transaction-level approval locking
- approved appointment overlap prevention
- secure cancellation and reschedule tokens
- Contact and Lead linkage
- reminder state
- optional Google Calendar event IDs

### Client Portal

- `public.client_portal_access`
- secure database-generated access tokens
- expiry and revocation
- access count and last-access tracking
- section-level visibility for quotes, invoices, projects and documents
- token-scoped `portal-actions` response
- private business tables remain protected by RLS
- portal documents use short-lived signed Storage URLs
- migrated e-signature requests are exposed to the portal as contract progress records

### Communications and automation

- Contact unsubscribe and do-not-contact fields
- `public.app_settings`
- `public.message_templates`
- `public.automation_rules`
- `public.message_queue`
- `public.message_logs`
- `public.automation_events`
- project-created and stage-changed event capture
- delayed and approval-required message queue states
- successful-send deduplication
- email delivery through Resend
- WhatsApp delivery through CallMeBot
- manual email and WhatsApp delivery service
- tokenized unsubscribe links
- project automation event claiming with retry tracking
- daily stale-project automation run
- automation-created task status compatibility with the migrated Tasks module

## 3. Deploy Edge Functions

Deploy:

```text
supabase/functions/capture-form-submission
supabase/functions/quote-actions
supabase/functions/send-invoice-email
supabase/functions/document-actions
supabase/functions/e-signature-actions
supabase/functions/booking-actions
supabase/functions/appointment-reminders
supabase/functions/portal-actions
supabase/functions/communications-actions
supabase/functions/automation-engine
supabase/functions/manual-communication
```

Several functions use `verify_jwt = false` because they contain public token-protected actions or cron entry points. Administrative actions inside those functions still verify the supplied Supabase user token and admin role.

## 4. Required secrets

Set private Edge Function secrets:

```text
CAPTURE_IP_SALT=<LONG_RANDOM_SECRET>
RESEND_API_KEY=<RESEND_API_KEY>
SITE_URL=https://www.creativebooks.co.za
APPOINTMENT_CRON_SECRET=<LONG_RANDOM_SECRET>
COMMUNICATION_CRON_SECRET=<LONG_RANDOM_SECRET>
```

Optional WhatsApp configuration:

```text
CALLMEBOT_API_KEY=<CALLMEBOT_API_KEY>
WHATSAPP_NOTIFY_NUMBER=<ADMIN_WHATSAPP_NUMBER>
```

Optional Google Calendar synchronization:

```text
GOOGLE_CALENDAR_ID=<CALENDAR_ID>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<SERVICE_ACCOUNT_EMAIL>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<PRIVATE_KEY>
```

Do not expose private keys, service-role keys, provider keys, cron secrets or hashing salts in browser environment variables.

## 5. Browser environment

Set:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

The browser application must never contain the Supabase service-role key.

## 6. Create the first administrator

Create the user in Supabase Auth, then promote the profile:

```sql
update public.profiles
set role = 'super_admin'
where id = '<USER_UUID>';
```

## 7. Scheduled jobs

### Appointment reminders

Run `appointment-reminders` every 30 minutes and send:

```text
x-cron-secret: <APPOINTMENT_CRON_SECRET>
```

The function checks approved appointments and sends the 24-hour and 1-hour reminders within their processing windows.

### Automation events

Run `automation-engine` frequently, recommended every 5 minutes, with:

```json
{"action":"process_events","limit":50}
```

Send:

```text
x-cron-secret: <COMMUNICATION_CRON_SECRET>
```

This claims pending project automation events, evaluates active rules, applies conditions, performs immediate sends or creates delayed and approval-required queue rows.

### Stale project automation

Run `automation-engine` once per day with:

```json
{"action":"daily_run"}
```

The function respects the Africa/Johannesburg send window and skips Sunday sending.

### Scheduled message queue

Run `communications-actions` every 5 minutes with:

```json
{"action":"process_due_queue"}
```

Send the same `COMMUNICATION_CRON_SECRET` header.

## 8. Migrated route scope

The compatibility bridge currently routes the following areas to Supabase where their entity and action mappings are complete:

```text
/admin/dashboard                 Appointment widget only
/admin/contacts
/admin/pipeline
/admin/tasks
/admin/quotes
/admin/invoices
/admin/payments
/admin/documents
/admin/document-dashboard
/admin/document-builder
/admin/clause-library
/admin/esignatures
/admin/projects
/admin/production-board
/admin/appointments
/admin/booking-settings
/admin/client-portal
/admin/message-centre
/admin/automation-centre
/admin/communication
/admin/email-settings
/book
/appointment/cancel/:token
/portal/:token
/unsubscribe?token=...
/doc/view/:id/:token
/sign/esig/:requestId/:token
```

Current migrated compatibility entities include:

```text
Contact
Task
Quote
QuoteLineItem
Invoice
Payment
Document
DocumentActivity
Clause
ESignatureRequest
Project
ClientDelay
BookingService
AvailabilityRule
Appointment
MessageTemplate
AutomationRule
MessageQueue
MessageLog
AppSettings
```

## 9. Required test pass

### Core CRM and finance

1. Sign in through `/admin/login` with an admin Supabase account.
2. Create and update contacts, tasks and pipeline records.
3. Create, edit and send a quote.
4. Accept the quote and confirm one project and one invoice are created.
5. Record partial and final payments and confirm invoice and project payment states reconcile.

### Documents and signatures

1. Upload a client document and a reusable template.
2. Open the tokenized document URL and confirm view and download activity.
3. Approve, reject, request changes and upload payment proof where applicable.
4. Create and send an e-signature request.
5. Complete client signing and admin-first countersigning.
6. Confirm audit events and the signed PDF certificate bundle.

### Projects and production

1. Create and edit a project.
2. Move stages and confirm stage history.
3. Change waiting-on owner and print queue metadata.
4. Log and resolve a client delay.
5. Confirm Production Board refresh and stage age display.
6. Confirm project Message History reads migrated `message_logs` where available.

### Appointments

1. Edit weekly availability and services.
2. Book from `/book` while signed out.
3. Confirm unavailable and too-soon slots are rejected server-side.
4. Approve, decline and propose a new time.
5. Confirm overlapping approved appointments are blocked.
6. Cancel through the secure cancellation URL.
7. Verify reminder jobs and optional Google Calendar synchronization.

### Client Portal

1. Create a portal link in `/admin/client-portal`.
2. Open `/portal/:token` and confirm only allowed sections appear.
3. Confirm access count increments once per portal data load.
4. Deactivate the link and confirm access is denied.
5. Regenerate the token and confirm the old URL stops working.
6. Confirm private document links are signed and time limited.
7. Confirm e-signature progress and migrated signing URLs work from the portal.

### Communications and automation

1. Configure Email Settings and send a test email.
2. Create an email template and render a preview.
3. Create a project automation rule and enable project automation.
4. Change project stage and run `process_events`.
5. Confirm immediate rules create `message_logs` and queued rules create `message_queue` rows.
6. Confirm the same successful dedup key is not sent twice.
7. Run delayed queue processing after the scheduled time.
8. Test manual email and WhatsApp sends from `/admin/communication`.
9. Confirm Supabase Contact IDs are accepted by manual communication logging.
10. Open a tokenized unsubscribe link and confirm the contact becomes unsubscribed.
11. Confirm unsubscribed and do-not-contact clients are skipped by the automation engine.

## 10. Known communication hardening item

The Supabase backend already exposes an atomic `approve_queue` action that claims a queue item before sending it. The existing Automation Centre approval UI still follows its older sequence of sending first and then updating the queue row. That UI path should be switched to call `approve_queue` directly before the communication migration is considered fully production-hardened for concurrent multi-admin use.

The current route adapter, manual delivery service, event engine, scheduled queue processor and normal single-admin workflow are in place and the frontend CI build passes. The remaining item is specifically the concurrent approval race on the legacy approval UI sequence.

## 11. Remaining migration order

Recommended next phases:

1. Dashboard metrics, Reports, Revenue Forecast and Analytics
2. SEO and Search Console integrations
3. Legacy Contracts and Signing routes that are separate from the migrated E-signatures module
4. Final Base44 dependency removal and data reconciliation

Each remaining phase should receive its own schema migration, RLS review, adapter mapping and test pass before Base44 is removed globally.
