# Supabase Setup for Creative Books SA

This repository is being migrated from Base44 to Supabase incrementally. Migrated routes preserve their current user interface contracts through layered compatibility adapters while their data, authentication, Storage and server actions move to Supabase.

## 1. Apply database migrations

Apply all migrations in numeric order:

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
supabase/migrations/202607040016_search_console_cache.sql
supabase/migrations/202607040017_google_analytics_cache.sql
supabase/migrations/202607040018_legacy_contracts.sql
supabase/migrations/202607040019_contract_postsign_upload.sql
supabase/migrations/202607040020_publishing_records.sql
supabase/migrations/202607040021_services_catalogue.sql
supabase/migrations/202607040022_client_service_pipeline.sql
supabase/migrations/202607040023_pipeline_template_id_compat.sql
supabase/migrations/202607040024_walkin_email_optional.sql
supabase/migrations/202607040025_client_service_rpc_hardening.sql
supabase/migrations/202607040026_email_template_library.sql
supabase/migrations/202607040027_workflow_pipeline_builder.sql
```

Do not skip migration order. Several later migrations depend on functions, tables or constraints created earlier.

## 2. Browser environment

Configure:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Never place the Supabase service-role key or third-party provider secrets in browser environment variables.

## 3. Deploy Edge Functions

Deploy every function configured in `supabase/config.toml`:

```text
capture-form-submission
quote-actions
send-invoice-email
document-actions
e-signature-actions
booking-actions
appointment-reminders
portal-actions
communications-actions
automation-engine
manual-communication
dashboard-metrics
search-console-data
analytics-data
contract-actions
contract-file-actions
adobe-sign-actions
adobe-sign-webhook
client-service-actions
walkin-checkin
```

Example:

```bash
supabase functions deploy search-console-data
```

Functions with `verify_jwt = false` contain public token-protected routes, webhook routes or cron entry points. Their privileged actions still validate tokens, secrets, roles or provider verification headers inside the function.

## 4. Required secrets

### Core capture, delivery and application URL

```text
CAPTURE_IP_SALT=<LONG_RANDOM_SECRET>
RESEND_API_KEY=<RESEND_API_KEY>
SITE_URL=https://www.creativebooks.co.za
```

### Scheduled jobs

```text
APPOINTMENT_CRON_SECRET=<LONG_RANDOM_SECRET>
COMMUNICATION_CRON_SECRET=<LONG_RANDOM_SECRET>
```

### Optional WhatsApp

```text
CALLMEBOT_API_KEY=<CALLMEBOT_API_KEY>
WHATSAPP_NOTIFY_NUMBER=<ADMIN_WHATSAPP_NUMBER>
```

### Contracts

```text
CONTRACT_FROM_EMAIL=Creative Books SA <info@creativebooks.co.za>
CONTRACT_ADMIN_EMAIL=info@creativebooks.co.za
CONTRACT_AUDIT_SALT=<LONG_RANDOM_SECRET>
```

`CAPTURE_IP_SALT` may be reused instead of `CONTRACT_AUDIT_SALT` when the same audit salt policy is acceptable.

### Client Service

```text
CLIENT_SERVICE_FROM_EMAIL=Creative Books SA <info@creativebooks.co.za>
```

### Walk-in capture

The walk-in function uses `CAPTURE_IP_SALT`. A separate secret may be supplied instead:

```text
WALKIN_IP_SALT=<LONG_RANDOM_SECRET>
```

### Google Search Console and GA4

See:

```text
docs/SEARCH_CONSOLE_SUPABASE_SETUP.md
docs/GOOGLE_ANALYTICS_SUPABASE_SETUP.md
```

Preferred credential mode:

```text
GOOGLE_SERVICE_ACCOUNT_JSON=<COMPLETE_SERVICE_ACCOUNT_JSON>
```

Alternative OAuth refresh-token secrets are documented in the integration-specific setup guides.

### Adobe Acrobat Sign

See:

```text
docs/CONTRACTS_SUPABASE_SETUP.md
```

Required values:

```text
ADOBE_SIGN_CLIENT_ID=<CLIENT_ID>
ADOBE_SIGN_CLIENT_SECRET=<CLIENT_SECRET>
ADOBE_SIGN_REFRESH_TOKEN=<REFRESH_TOKEN>
ADOBE_SIGN_API_BASE=https://api.na1.adobesign.com
```

Use the correct API base for the Acrobat Sign account shard.

## 5. Create the first administrator

Create the user in Supabase Auth, then promote the profile:

```sql
update public.profiles
set role = 'super_admin'
where id = '<USER_UUID>';
```

The migrated admin route guard uses Supabase Auth and the `profiles.role` value.

## 6. Current Supabase module coverage

### Authentication and administration

- Supabase Auth admin login
- `public.profiles`
- roles: `super_admin`, `admin`, `staff`, `client`
- protected admin routes
- database authorization helpers
- Row Level Security policies

### CRM and follow-ups

- contacts
- submissions
- leads
- activity logs
- tasks
- submission-to-lead conversion
- lead pipeline stages
- stale lead, submission, task, quote and invoice follow-up reminders
- public form capture
- phone-first office walk-in capture

### Finance

- quotes
- quote line items
- quote signatures
- invoices
- payments
- quote acceptance workflow
- quote-to-invoice conversion
- invoice and payment reconciliation
- overdue state refresh
- Finance Hub read coverage

### Documents and signatures

- documents
- document activity
- clauses
- e-signature requests
- e-signature audit events
- private document Storage
- private signature Storage
- public token-protected document actions
- admin-first and client signing
- final PDF generation
- certificate generation
- signed-document portal access

### Contracts

- legacy Contract records on Supabase
- admin CRUD
- native electronic signing
- admin-first countersigning
- expiring signing tokens
- hashed network audit fingerprints
- signed PDF linkage
- linked Document and E-signature records
- Project Contract Signed synchronization
- Acrobat Sign send and status actions
- Acrobat Sign signed-document download
- verified Acrobat Sign webhook

### Projects and production

- projects
- project stage history
- client delays
- waiting-on ownership
- print queue metadata
- revision counts and limits
- book specifications
- project workflow synchronization
- Production Board

### Appointments and booking

- booking services
- availability rules
- appointments
- Africa/Johannesburg availability logic
- duration and buffer handling
- minimum notice enforcement
- approval locking and overlap prevention
- secure cancellation and rescheduling
- appointment reminders
- optional Google Calendar synchronization fields

### Client Portal

- secure database-generated portal tokens
- expiry and revocation
- section-level visibility
- token-scoped portal data bundle
- short-lived private document URLs
- e-signature progress records

### Communications and automation

- app email settings
- automation message templates
- automation rules
- message queue
- delivery logs
- automation events
- Resend delivery
- CallMeBot WhatsApp delivery
- tokenized unsubscribe flow
- scheduled queue processing
- atomic approval and cancellation actions
- automation event claiming and retries
- daily stale-project automation
- standalone reusable Email Templates library

### Dashboard, reports and analytics

- dashboard metrics Edge Function
- pipeline projections
- recent activity
- Reports compatibility mappings
- Revenue Forecast mappings
- Google Search Console and SEO analytics
- sitemap listing and submission
- URL inspection
- Search Console response cache
- GA4 reports
- GA4 realtime analytics
- GA4 report cache

### Publishing records

- Author Library
- Book Library
- Author-to-book title synchronization
- Client Collections
- private collection signatures
- automatic Project Delivered transition after collection
- Services and pricing catalogue

### Client Service Updates

- client service projects
- stage history
- email logs
- workflow settings stored in Supabase
- backend stage update actions
- stage email deduplication
- explicit resend logging
- private welcome email attachments
- embedded sales pipelines
- pipeline templates
- pipeline deals
- automatic Project creation from Won deals
- saved workflow first-stage enforcement

### Workflow Pipeline Builder

- configurable workflow pipeline records
- stage arrays with colours and icons
- stage checklists
- stage requirements
- stage assignee metadata
- workflow type and entity scope

## 7. Migrated route coverage

The following routes are fully or materially routed through Supabase adapters and services:

```text
/admin/login
/admin/dashboard
/admin/submissions
/admin/leads
/admin/contacts
/admin/contacts/detail
/admin/settings
/admin/services
/admin/pipeline
/admin/pipeline-builder
/admin/quotes
/admin/invoices
/admin/payments
/admin/finance
/admin/tasks
/admin/documents
/admin/document-dashboard
/admin/document-builder
/admin/clause-library
/admin/esignatures
/admin/contracts
/admin/contracts/prepare/:id
/admin/signatures
/admin/projects
/admin/production-board
/admin/calendar
/admin/reports
/admin/revenue-forecast
/admin/appointments
/admin/booking-settings
/admin/client-portal
/admin/client-service
/admin/message-centre
/admin/automation-centre
/admin/communication
/admin/email-settings
/admin/email-templates
/admin/search-console
/admin/seo
/admin/analytics
/admin/authors
/admin/books
/admin/collections
/book
/walk-in
/appointment/cancel/:token
/portal/:token
/unsubscribe?token=...
/quote/view/:id/:token
/doc/view/:id/:token
/sign/esig/:requestId/:token
/sign/contract/:token
```

The older `/admin/signing` screen redirects to the migrated Contracts module.

The older `/admin/automations` screen redirects to the migrated Automation Centre.

## 8. Scheduled jobs

### Appointment reminders

Run `appointment-reminders` every 30 minutes with:

```text
x-cron-secret: <APPOINTMENT_CRON_SECRET>
```

### Automation event processing

Run `automation-engine` frequently, recommended every 5 minutes:

```json
{"action":"process_events","limit":50}
```

Send:

```text
x-cron-secret: <COMMUNICATION_CRON_SECRET>
```

### Daily stale-project automation

Run `automation-engine` once per day:

```json
{"action":"daily_run"}
```

### Scheduled communication queue

Run `communications-actions` every 5 minutes:

```json
{"action":"process_due_queue"}
```

Send the same `COMMUNICATION_CRON_SECRET` header.

## 9. Required verification pass

### CRM and finance

1. Sign in through `/admin/login` with a Supabase admin account.
2. Create and update Contacts, Leads and Tasks.
3. Submit a public enquiry and confirm Contact and Submission records.
4. Check in through `/walk-in` using phone only.
5. Create, edit and send a Quote.
6. Accept the Quote and confirm one Project and one Invoice are created.
7. Record partial and final payments and confirm invoice balances reconcile.
8. Open Finance Hub and confirm totals match the underlying migrated records.

### Documents, e-signatures and Contracts

1. Upload a private client document.
2. Open a tokenized document URL.
3. Create and complete an E-signature request.
4. Confirm the signed PDF and certificate bundle.
5. Create a Contract.
6. Send a native signing request.
7. Complete native signing and confirm linked Document and E-signature records.
8. Test Contract decline and resend.
9. Test Acrobat Sign send and webhook completion.
10. Confirm the completed Acrobat Sign PDF is stored in Supabase Storage.

### Projects and production

1. Create and edit a Project.
2. Move project stages and confirm stage history.
3. Update waiting-on owner and queue metadata.
4. Log and resolve a Client Delay.
5. Confirm Production Board stage-age display.
6. Record a Client Collection and confirm the Project advances to Delivered.

### Appointments

1. Edit availability rules and booking services.
2. Book while signed out.
3. Confirm unavailable or too-soon slots are rejected server-side.
4. Approve, decline and propose a new time.
5. Confirm overlapping approved appointments are blocked.
6. Cancel using the secure cancellation URL.

### Client Portal

1. Create a portal link.
2. Confirm only allowed sections appear.
3. Deactivate the link and confirm access is denied.
4. Regenerate the token and confirm the old URL stops working.
5. Confirm private document links are signed and time-limited.

### Communications and automation

1. Configure Email Settings and send a test message.
2. Create a message template and render a preview.
3. Create and activate an automation rule.
4. Change Project stage and process automation events.
5. Confirm immediate delivery logs and queued rows.
6. Confirm duplicate successful dedup keys are not sent twice.
7. Approve a queued message from the UI and confirm one backend-controlled send.
8. Test manual email and WhatsApp delivery.
9. Test unsubscribe behavior.
10. Confirm the legacy `/admin/automations` route redirects to Automation Centre.

### Analytics

1. Open SEO Analytics and Search Console screens.
2. Test force refresh.
3. Test URL inspection.
4. Test sitemap list and submission.
5. Open GA4 Analytics.
6. Confirm report, top pages, sources and realtime data.

### Publishing records and Client Service

1. Create an Author and linked Book Record.
2. Confirm Author book synchronization.
3. Create and edit Services pricing entries.
4. Record a Client Collection with signature.
5. Edit Client Service workflow settings and reload.
6. Create a Client Service Project and confirm saved workflow stages.
7. Update stage only.
8. Update stage and send email.
9. Confirm duplicate stage email prevention.
10. Resend from history and confirm `resent` log status.
11. Test welcome email attachments.
12. Create a sales pipeline and move a deal to Won.
13. Confirm one linked Client Service Project is created.
14. Confirm the saved workflow controls the first stage.
15. Create and edit a Workflow Pipeline Builder definition.

## 10. Integration-specific guides

See:

```text
docs/SEARCH_CONSOLE_SUPABASE_SETUP.md
docs/GOOGLE_ANALYTICS_SUPABASE_SETUP.md
docs/CONTRACTS_SUPABASE_SETUP.md
docs/PUBLISHING_RECORDS_SUPABASE_SETUP.md
docs/CLIENT_SERVICE_SUPABASE_SETUP.md
```

## 11. Remaining cutover work

The migration is broad but the final production cutover still requires:

1. audit any minor admin or public route still referencing Base44-only entities or functions;
2. reconcile and backfill production data into Supabase tables;
3. verify foreign-key mappings across Contacts, Quotes, Invoices, Projects and Documents;
4. verify Storage file migration and signed URL behavior;
5. validate scheduled jobs in the production Supabase project;
6. run the complete route and workflow verification pass;
7. remove Base44 SDK and Vite plugin dependencies only after the audit confirms no remaining runtime calls;
8. complete production cutover monitoring and rollback planning.
