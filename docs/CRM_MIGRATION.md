# CRM migration status

Verified 29 October 2026. Application: https://creative-books-sa.vercel.app.
Supabase project: cobpbsfkeewxzyprbmet. This is not a declaration that every CRM function is operational.

## Restored in this migration pass

The Supabase project now contains 53 deployed function names, up from 20. Three older names remain disabled handlers: adminConfirmWorkflow, autoCreatePortalAccess and adobeSignActions. See deployed-functions.json for the exact inventory.

Restored backends include onboarding and notifications, custom pipelines, workflow templates, production jobs, materials and purchase orders, payments and receipts, credit notes, quote templates, submissions and lead conversion, lead scoring, data import/export, communication history, follow-up lists, revenue forecasts, portal access records, file requests and proof approvals. Contact/deal synchronisation and internal stage handlers are deployed; deploying a handler does not schedule it or install a database event trigger.

Quote editor load and update actions were absent from the original export and are now implemented. Quotes support blank line items without a service catalogue. Quote project titles are saved. Both billing editors stop sending if saving fails. Invoice saves preserve existing status. Receipt downloads consume the backend PDF response correctly. Payments reject invalid/nonpositive amounts. New portal capabilities use cryptographic randomness and link to the Vercel application.

Manual workflows now execute supported record updates, task creation, stage moves and assignments and persist completion/failure. Unsupported integration, delay, condition and parallel steps are rejected before any writes. They are not silently queued as though a worker exists. Automatic schedules and trigger wiring are not configured.

## Verification

- 36 local tests pass, including database access controls and billing, inventory receiving, payment/receipt balances, onboarding, pipelines, portal capabilities and manual workflow execution.
- All 106 exported function entrypoints bundle successfully. Bundling proves imports/syntax, not provider behaviour.
- Production frontend build passes.
- In the signed-in production CRM, a synthetic quote and invoice were created. Quote notes were saved. The invoice line item, VAT and R115 total survived a full page reload.
- Synthetic contact, quote and invoice records and quote line items were removed using exact test IDs. No test messages were sent to clients.
- Quotes/invoices accept CORS preflight and reject anonymous create requests with 401.
- Other restored actions have local workflow coverage; they have not all been exercised against production records.

## Left aside as requested

Automatic review rejected AI triage (submission disclosure to OpenAI), supplier purchase-order email, client chat notifications, portal appointment messages, private document delivery/audits, contract/e-signature notifications, estimate emails, arbitrary template sending and NDA/portal-invitation workflows. A subsequent billing deployment was also rejected for its client-email paths. Those paths were removed from quoteActions, invoiceActions and paymentActions before deploying their database/PDF functionality. Sending now returns a clear pending-approval response. Supplier email is likewise disabled while inventory records remain usable.

Other outbound communication, marketing and reporting integrations remain pending review/setup rather than being presented as migrated. The frontend pendingFunctions inventory explicitly reports unavailable functions; notices on affected screens explain limitations. Original exported source is retained for review, not automatically deployed.

Google Analytics/Search Console, Calendar/Gmail, Adobe Sign, Zoho Books, WhatsApp and AI require their provider connections/secrets and independent end-to-end verification. The domain-restricted Resend key is configured only for the already verified enquiry/booking notification path. CRM client delivery is pending.

## Outstanding data/configuration work

The user-supplied historical ZIP was imported on 29 October 2026: 10,440 records in 46 entity types, all exported IDs reconciled, no source records skipped, financial totals matched. All five pre-existing CRM records remained unchanged. See HISTORICAL_IMPORT.md. This resolves the historical-record access blocker for this export.

The ZIP explicitly excludes documents and file contents. Historical URLs are retained, but binary assets and the excluded Document records still require a separate export. One invoice references a contact absent from the source, and duplicate quote/invoice number groups already existed. These were preserved rather than silently merged or renumbered. Imported user profiles do not create Supabase Auth accounts.

Three booking-service records, seven availability rules, 52 services and company settings were imported. No scheduling hours, prices or banking details were fabricated. Data import did not enable communication functions, install event triggers or configure external provider secrets.

The last verified custom-domain DNS still served Base44. Use the Vercel hostname for verification until DNS cutover is independently confirmed. Auth passwords/sessions are separate from Base44 entity records and cannot be copied as ordinary rows.

Full CRM acceptance requires historical-data reconciliation, completion of the deferred provider/communication sections, automatic trigger/schedule installation where needed, and production UI/API/data verification of each remaining workflow.
