# Client Service Updates and Sales Pipeline on Supabase

The Client Service migration covers the complete `/admin/client-service` route, including Projects, project stage updates, email history, workflow settings and the embedded sales pipeline.

## Database migrations

Apply migrations through:

```text
202607040024_walkin_email_optional.sql
```

Client Service and pipeline storage is introduced by:

```text
202607040022_client_service_pipeline.sql
202607040023_pipeline_template_id_compat.sql
```

The phase adds:

- `public.client_service_projects`
- `public.service_email_logs`
- `public.client_service_workflows`
- `public.sales_pipelines`
- `public.pipeline_templates`
- `public.pipeline_deals`

All business tables use admin-only Row Level Security.

## Deploy Edge Functions

Deploy:

```bash
supabase functions deploy client-service-actions
supabase functions deploy walkin-checkin
```

`client-service-actions` requires a valid Supabase JWT and verifies the caller against `profiles.role`.

`walkin-checkin` is public because it is used by the office check-in screen. It performs its own validation and writes through the Supabase service role.

## Required secrets

Client Service email delivery:

```bash
supabase secrets set RESEND_API_KEY="..."
supabase secrets set CLIENT_SERVICE_FROM_EMAIL="Creative Books SA <info@creativebooks.co.za>"
```

Walk-in audit hashing:

```bash
supabase secrets set CAPTURE_IP_SALT="use-a-long-random-secret"
```

`WALKIN_IP_SALT` may be used instead when the walk-in workflow requires a separate audit salt.

## Client Service Projects

Route:

```text
/admin/client-service
```

The route is intercepted by the layered `clientServiceSupabaseBridge.js` adapter. It preserves the existing entity contract for:

- `ClientServiceProject`
- `ServiceEmailLog`
- `ClientServiceWorkflow`
- `SalesPipeline`
- `PipelineTemplate`
- `PipelineDeal`

Payment receipt and invoice files are stored in the private `document-files` bucket and displayed through short-lived signed URLs.

## Stage updates and email delivery

The server action supports:

- `update_stage`
- `send_stage_email`
- `mark_stage_email_sent`
- `update_stage_and_send`

The normal Update and Send Email button uses `update_stage_and_send`, which performs the stage update, sends the message, writes the email log and marks the stage history entry as emailed through backend-controlled actions.

Successful stage emails are deduplicated. Resends are allowed explicitly and logged with `resent` status.

Welcome emails may include the private payment receipt and invoice files. The Edge Function retrieves those files server-side before passing attachments to Resend.

## Workflow settings

Workflow changes are stored in `client_service_workflows` instead of browser localStorage.

Saved workflows control:

- stage labels
- stage order
- email subjects
- email bodies
- welcome stage metadata

Manual project creation and automatic project creation from a Won pipeline deal both resolve the first stage from the saved Supabase workflow. Static workflow definitions are used only as fallback defaults when no saved configuration exists.

## Embedded sales pipeline

The Client Service Pipeline tab stores:

- pipeline definitions and stage arrays
- custom pipeline templates
- deals and deal stage positions
- Won and Lost timestamps
- project creation linkage
- project creation failure diagnostics

The legacy default template keys such as `tpl_standard` remain compatible through a text `template_id` field.

## Walk-in check-in

Route:

```text
/walk-in
```

The public screen now calls `walkin-checkin` once. It no longer creates Contacts, Submissions or Notes directly from the browser.

Phone number is required. Email is optional for walk-in visitors. The function:

1. finds an existing Contact by email when available;
2. otherwise finds the most recently updated Contact with the same phone number;
3. updates or creates the Contact;
4. creates a CRM Submission;
5. records a `walk_in_checkin` activity log event;
6. stores only a salted hash of the network address.

## Functional verification

### Projects and workflows

1. Open Workflow Settings and edit a stage label or email subject.
2. Reload the page and confirm the change persists.
3. Create a new Client Service Project and confirm the saved workflow stages appear.
4. Update a stage without sending email.
5. Update another stage with email and confirm one email log is created.
6. Try the same normal send again and confirm duplicate delivery is blocked.
7. Use Resend from email history and confirm a `resent` log is created.
8. Test a welcome email with receipt and invoice attachments.

### Pipeline

1. Create a pipeline.
2. Add, reorder and edit stages.
3. Create and move a deal.
4. Move a deal to Won.
5. Confirm one Client Service Project is created and linked to the deal.
6. Confirm the new Project starts on the first stage of the saved Supabase workflow.
7. Test retry behavior after a simulated project creation failure.

### Walk-in

1. Check in with name, phone and no email.
2. Confirm a Contact and Submission are created.
3. Check in again with the same phone number and confirm the existing Contact is reused.
4. Add an email on a later check-in and confirm the Contact is enriched.
5. Confirm the activity log records `walk_in_checkin`.
