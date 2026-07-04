# Supabase Setup for Creative Books SA

This repository is being migrated from Base44 to Supabase incrementally. The public website and business modules are moved one bounded module at a time rather than switched all at once.

## 1. Create the Supabase project

Create a Supabase project and keep the project URL and publishable key available for the deployment environment.

## 2. Apply the database migrations

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
```

The migrations currently provide:

### Authentication and administration

- `public.profiles`
- roles: `super_admin`, `admin`, `staff`, `client`
- automatic profile creation for Supabase Auth users
- Row Level Security policies
- database-level administrator checks

### CRM and follow-ups

- `public.contacts`
- `public.submissions`
- `public.leads`
- `public.activity_logs`
- `public.tasks`
- pipeline stage-change timestamps and activity logging
- atomic submission-to-lead conversion
- task completion tracking
- `get_follow_up_reminders()` for stale leads, unread submissions, overdue tasks, quote follow-ups, expiring quotes and overdue invoices
- `get_contact_activity()` for migrated CRM activity history

### Quotes, invoices and payments

- `public.quotes`
- `public.quote_line_items`
- `public.quote_signatures`
- `public.invoices`
- `public.payments`
- atomic quote saving and duplication
- quote-to-invoice conversion
- automatic invoice balance and payment-status reconciliation
- overdue invoice refresh support

### Documents, clauses and electronic signatures

- `public.documents`
- `public.document_activities`
- `public.clauses`
- `public.e_signature_requests`
- immutable `public.signature_audit_events`
- private `document-files` Storage bucket
- private `signature-artifacts` Storage bucket
- document token, expiry and access-revocation fields
- document version relationships and activity records
- admin-first and client signing state
- signer consent capture
- hashed network audit data rather than raw IP-address storage
- signed-document bundle and electronic-signature certificate support

### Projects and Production Board

- `public.projects`
- `public.project_stage_history`
- `public.client_delays`
- production stages, stage-age timestamps and immutable stage history
- waiting-on ownership, print queue metadata and project deadlines
- revision counters, revision limits and book specification JSON
- VIP, risk, automation and completion metadata
- automatic project and invoice creation when a quote is accepted
- automatic project payment-status synchronization from invoices
- automatic `Payment Received` progression after full payment without moving later-stage projects backwards
- automatic contract and final-approval synchronization from project-linked documents
- CRM pipeline protection so legacy actions cannot move an active project contact backwards from `Project Started` to `Payment Pending`
- indexes for transitional project links in invoices, payments, documents and e-signatures

### Appointments and Booking Settings

- `public.booking_services`
- `public.availability_rules`
- `public.appointments`
- seven seeded weekday availability rules so Booking Settings has a complete starting structure
- public read access to active booking services and availability rules
- server-side `get_available_appointment_slots()` calculation in Africa/Johannesburg time
- service duration and buffer-aware slot generation
- minimum-notice enforcement
- approved appointment overlap exclusion
- transaction-level date locking during approval
- a database trigger that prevents overlapping approved appointments even when a direct administrative table update is attempted
- secure client cancellation and reschedule tokens
- linked Contact and Lead references
- reminder state, proposal state, Google Calendar event IDs and appointment status tracking

## 3. Deploy the Edge Functions

Deploy these functions:

```text
supabase/functions/capture-form-submission
supabase/functions/quote-actions
supabase/functions/send-invoice-email
supabase/functions/document-actions
supabase/functions/e-signature-actions
supabase/functions/booking-actions
supabase/functions/appointment-reminders
```

The document, e-signature and booking functions have `verify_jwt = false` because selected actions are public and protected by document tokens, signature tokens, cancellation tokens or server-side booking validation. Administrative actions inside those functions still perform Supabase Auth and admin-role checks before privileged operations.

Set the required private function secrets:

```text
CAPTURE_IP_SALT=<LONG_RANDOM_SECRET>
RESEND_API_KEY=<RESEND_API_KEY>
SITE_URL=https://www.creativebooks.co.za
APPOINTMENT_CRON_SECRET=<LONG_RANDOM_SECRET>
```

Optional WhatsApp notifications use:

```text
CALLMEBOT_API_KEY=<CALLMEBOT_API_KEY>
WHATSAPP_NOTIFY_NUMBER=<ADMIN_WHATSAPP_NUMBER>
```

Optional Google Calendar synchronization uses a service account and a calendar shared with that service account:

```text
GOOGLE_CALENDAR_ID=<CALENDAR_ID>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<SERVICE_ACCOUNT_EMAIL>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<PRIVATE_KEY>
```

The private key can be stored with escaped newline characters. The booking function converts `\n` sequences back to newlines before importing the key.

Do not expose `SUPABASE_SERVICE_ROLE_KEY`, Resend keys, WhatsApp keys, cron secrets, service-account private keys or hashing salts in browser environment variables. Supabase provides its service environment values to the Edge Function runtime.

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

## 6. Schedule appointment reminders

Run `appointment-reminders` every 30 minutes. Send the same private value configured in `APPOINTMENT_CRON_SECRET` as the `x-cron-secret` request header.

The reminder function sends reminders in two windows:

- 24 hours before an approved appointment
- 1 hour before an approved appointment

It marks each reminder as sent only after the email request succeeds, preventing the same reminder from being intentionally sent on every scheduled invocation.

## 7. Test the migrated flows

Test these flows before merging the migration branch.

### Authentication and CRM

1. Open `/admin/login` and sign in with a Supabase Auth account.
2. Confirm `super_admin` and `admin` users reach protected admin routes.
3. Confirm `staff` and `client` users cannot access protected admin routes.
4. Submit the public Contact and Quote forms and confirm submissions and contacts are linked.
5. Convert a submission into a lead.
6. Create and update contacts, pipeline records and tasks.
7. Confirm pipeline movement creates activity records.
8. Confirm stale leads, unread submissions and overdue tasks appear in Follow-up Reminders.

### Finance

1. Open `/admin/quotes` and create, edit and duplicate a quote.
2. Send a quote and open the public quote link.
3. Sign or decline a quote and confirm the status updates.
4. Accept a quote and confirm a project and invoice are created automatically without duplicates.
5. Open `/admin/invoices` and send an invoice.
6. Record a partial payment and confirm `amount_paid`, `balance_due`, invoice status and project payment status reconcile automatically.
7. Record the remaining payment and confirm the invoice becomes `Paid` and an early-stage project advances to `Payment Received`.
8. Confirm overdue invoices appear in Follow-up Reminders.

### Documents

1. Open `/admin/documents` and upload a client document.
2. Upload a reusable template with no client attached.
3. Confirm uploaded files are stored in the private `document-files` bucket.
4. Send a client document and open its `/doc/view/:id/:token` link.
5. Confirm first open, repeat view and download actions create document activity rows.
6. Approve, reject, request changes or sign an applicable document.
7. Upload payment proof and verify it from the admin workflow.
8. Confirm verified payment proof creates a `payments` record and invoice reconciliation runs through the finance trigger.
9. Extend a document link expiry and confirm a new activity entry is recorded.
10. Create a new document version and confirm the previous version is no longer marked latest.
11. Link an unsigned contract to a project, sign it and confirm the project contract state synchronizes without moving a later-stage project backwards.
12. Link a Proof Approval document to a project, approve it and confirm the project advances to `Final Approval Received` only when it was at an earlier stage.

### Clause Library and Document Builder

1. Open `/admin/clause-library` and create, edit and delete a clause.
2. Upload a document template.
3. Open `/admin/document-builder`, insert clauses and merge fields, then save a generated document into the library.
4. Confirm AI-assisted clause or document content still uses the transitional Base44 LLM integration while file storage and entities use Supabase.

### Electronic signatures

1. Open `/admin/esignatures` and create a signing request.
2. Send the request and open `/sign/esig/:requestId/:token`.
3. Review the source document and begin signing.
4. Draw or type a signature, confirm identity fields and accept every required consent.
5. Submit and confirm the request becomes `Client Signed` or `Fully Signed`, depending on admin signing state.
6. Confirm a signed PDF bundle and certificate are created in the private `signature-artifacts` bucket.
7. Confirm immutable rows are written to `signature_audit_events` for open, signing-started, signed and certificate events.
8. Test admin-first signing, followed by client countersigning.
9. Test decline, resend and expired-link handling.
10. Retry PDF generation from the admin screen and confirm `Client Signed` and `Fully Signed` statuses are accepted.

### Projects and Production Board

1. Open `/admin/projects` and create a project for an existing contact.
2. Edit the project service, deadline, value, payment status and internal notes.
3. Move the project through stages and confirm `stage_changed_at`, `current_stage` and `project_stage_history` update.
4. Confirm moving a project to `Completed` sets `completed_at` and stops project automation flags.
5. Change `waiting_on` and queue number from the Project Detail panel and confirm partial updates do not reset book specs, revision counters or other fields.
6. Log a client delay and confirm it appears only on the linked project.
7. Open `/admin/production-board` and confirm production-stage cards load from Supabase and retain the 30-second refresh behavior.
8. Confirm stale stage age, at-risk projects, payment status and deadlines display correctly on the board.
9. Accept a quote through the public quote flow and confirm one project and one invoice are created and linked.
10. Approve a quotation through the document flow and confirm the contact remains in `Project Started`, rather than being moved backwards to `Payment Pending`.
11. Confirm the Project Detail pre-production checklist reads Supabase quotes, invoices and documents for the same contact.
12. Confirm Message History continues to use the transitional communication backend until the communication module is migrated.

### Appointments and Booking Settings

1. Open `/admin/booking-settings` and confirm all seven weekday rules load from Supabase.
2. Change opening hours, close a weekday and update the global minimum-notice period.
3. Create, edit, deactivate and reactivate a booking service.
4. Open `/book` while signed out and confirm active services and availability rules load.
5. Open `/book` while signed in and confirm public booking options still load.
6. Select a service and date and confirm unavailable, past and too-soon slots are not returned.
7. Submit a booking request and confirm the server uses the stored service name, duration and allowed modes rather than trusting browser-supplied snapshots.
8. Confirm an existing Contact is linked by email, or a new Contact is created when no match exists.
9. Confirm the admin email and optional WhatsApp alert are generated for a new request.
10. Open `/admin/appointments` and approve a pending request.
11. Confirm approval email delivery and optional Google Calendar synchronization.
12. Create two overlapping pending requests, approve one, then confirm the second cannot be approved while the first remains approved.
13. Decline an appointment and confirm the reason is emailed to the client.
14. Propose a new date and time and confirm the proposed values are stored and emailed.
15. Open `/appointment/cancel/:token`, cancel an approved appointment and confirm its Google Calendar event is removed when calendar synchronization is configured.
16. Mark an approved appointment `completed` and another `no_show` from the admin screen.
17. Confirm the dashboard Today’s Appointments widget reads the same Supabase appointment data.
18. Run `appointment-reminders` with the cron secret and verify 24-hour and 1-hour reminder windows and sent flags.

## 8. Transitional compatibility bridge

Large existing screens still call the Base44-style client API. The compatibility bridge translates selected calls to Supabase only on migrated routes.

Current migrated route scope:

```text
/admin/dashboard                Appointment widget only
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
/book
/appointment/cancel/:token
/doc/view/:id/:token
/sign/esig/:requestId/:token
```

The bridge currently routes these entity families to Supabase where appropriate:

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
```

It also bridges public and admin actions to these Edge Functions:

```text
quote-actions
document-actions
e-signature-actions
booking-actions
appointment-reminders
send-invoice-email
capture-form-submission
```

Private file uploads on migrated document routes use Supabase Storage. Public document and signing pages request a short-lived signed upload grant from the relevant Edge Function before uploading an allowed proof or signature artifact.

Project routes intentionally keep `MessageLog` on the existing communication backend until the communication phase is migrated, while Project, ClientDelay, Contact, Quote, Invoice and Document data on those routes use Supabase.

Modules outside the migrated route scope continue to use the existing backend until their dependent tables and ID relationships are migrated or mapped. Do not globally redirect every Base44 entity yet.

## 9. Deployment environment

Add the public Supabase environment variables to the deployment platform. Preview deployments should use a non-production Supabase environment where possible.

## Migration order after the current phase

The recommended order for the remaining Creative Books SA app is:

1. Client Portal
2. Automations, Email, WhatsApp and Notifications
3. Dashboard metrics, Reports, Revenue Forecast and Analytics
4. SEO and Search Console integrations

Each module should receive its own database migration, Row Level Security policies, data-access layer and test pass before Base44 dependencies are removed from that module.
