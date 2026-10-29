# Service production stages and transactional notifications

The billing project screen supports Editing, Typesetting / Layout, Book Cover Design and Printing / Delivery. New projects infer applicable services from quote item names and descriptions. Staff may select multiple services and save them on the project. Completed checklist entries survive service changes; a service with completed stages cannot be removed. Existing projects retain their previous status and completed printing checks.

Editing: manuscript received, assessment, first editorial pass, author revisions, second pass, final checks and approval. Typesetting: brief, sample layout, interior layout, author proof, corrections, final checks and print-ready approval. Cover: brief, concepts, author review, refinement, spine and back cover, final proof and export. Printing retains the five original stages.

The current client acceptance flow signs the quote, then creates the deposit invoice. A deferred database trigger queues one admin email to info@creativebooks.co.za and draubreyzesh@gmail.com and creates one in-app notification after acceptance. It records the signer and acceptance method, including manually recorded acceptance without falsely calling it a portal signature. Invoice signing is not a separate signing workflow.

Clearing the deposit, moving the current stage, checking or reopening a stage, completing production and closing the project queue client updates. Merely choosing services, refreshing a page or saving an unchanged stage does not send an update. The server requires a cleared deposit before progress updates; final Delivery completion also requires a cleared balance. Completion and closure preserve the existing invoice/payment gates.

Messages reuse the established Creative Books logo, rainbow header, copper colours, detail tables and footer from the shared email template. Client emails state the saved current stage and operational update. They never include an admin-only dashboard link. Admin acceptance messages link to the protected quote screen.

Notifications use an RLS-protected transactional outbox and a private Vault token. A pg_cron job calls the billingWorkflowNotifications worker every minute through pg_net. The endpoint validates its private token before claiming work; it is not a public email sender. No service key or private dispatcher token is shipped to the browser. Only the backend can claim or acknowledge notifications.

Workers claim five rows at a time with row locks, expiring leases and unique claim tokens. They persist an immutable email snapshot, use stable provider idempotency keys and retry temporary failures with backoff. Uncertain attempts stop before the provider's 24-hour idempotency window expires. Staff can see pending / sending / provider-accepted / failed state and request a safe retry from the project. Provider acceptance does not guarantee inbox delivery. Historical acceptances are not emailed retroactively.

Validation: 61 automated tests cover the payment workflow, new service detection and 26 combined stages, preservation of completed steps, stale edit rejection, clearance gates, notification creation without duplication, staff boundaries, recipient resolution, HTML escaping, immutable retry payloads and provider errors. Production build and lint checks pass.
