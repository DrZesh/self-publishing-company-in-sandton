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

## 3. Deploy the Edge Functions

Deploy these functions:

```text
supabase/functions/capture-form-submission
supabase/functions/quote-actions
supabase/functions/send-invoice-email
supabase/functions/document-actions
supabase/functions/e-signature-actions
```

The document and e-signature functions have `verify_jwt = false` because public clients open token-protected links. Administrative actions inside those functions still perform Supabase Auth and admin-role checks before any privileged operation.

Set the required private function secrets:

```text
CAPTURE_IP_SALT=<LONG_RANDOM_SECRET>
RESEND_API_KEY=<RESEND_API_KEY>
SITE_URL=https://www.creativebooks.co.za
```

Optional WhatsApp signing-link delivery uses:

```text
CALLMEBOT_API_KEY=<CALLMEBOT_API_KEY>
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY`, Resend keys, WhatsApp keys or hashing salts in browser environment variables. Supabase provides service environment values to the Edge Function runtime.

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

## 6. Test the migrated flows

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
4. Convert an accepted quote to an invoice.
5. Open `/admin/invoices` and send an invoice.
6. Record a partial payment and confirm `amount_paid`, `balance_due` and invoice status reconcile automatically.
7. Record the remaining payment and confirm the invoice becomes `Paid`.
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

## 7. Transitional compatibility bridge

Large existing screens still call the Base44-style client API. The compatibility bridge translates selected calls to Supabase only on migrated routes.

Current migrated route scope:

```text
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
```

It also bridges public and admin actions to these Edge Functions:

```text
quote-actions
document-actions
e-signature-actions
send-invoice-email
capture-form-submission
```

Private file uploads on migrated document routes use Supabase Storage. Public document and signing pages request a short-lived signed upload grant from the relevant Edge Function before uploading an allowed proof or signature artifact.

Modules outside the migrated route scope continue to use the existing backend until their dependent tables and ID relationships are migrated or mapped. Do not globally redirect every Base44 entity yet.

## 8. Deployment environment

Add the public Supabase environment variables to the deployment platform. Preview deployments should use a non-production Supabase environment where possible.

## Migration order after the current phase

The recommended order for the remaining Creative Books SA app is:

1. Projects and Production Board
2. Appointments and Booking Settings
3. Client Portal
4. Automations, Email, WhatsApp and Notifications
5. Dashboard metrics, Reports, Revenue Forecast and Analytics
6. SEO and Search Console integrations

Each module should receive its own database migration, Row Level Security policies, data-access layer and test pass before Base44 dependencies are removed from that module.
