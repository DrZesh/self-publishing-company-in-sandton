# Creative Books Pipeline CRM connection

The default `/admin/pipeline` board uses the new relational Supabase tables `pipeline_stages`, `clients`, `deals` and `deal_stage_history`. It displays the nine stages in their database ID order, including empty stages, and joins each deal to its client. No seed records or client details are embedded in the frontend source.

Staff can search and filter projects, move them using a stage selector, edit titles/notes/value/trim size/expected completion, and inspect stage history. Zoho contact and deal identifiers are read-only in the UI. Unknown project values remain unset rather than being shown as zero.

All reads and writes use the existing signed-in Supabase client and the database's staff RLS policies. Updates compare the original stage and timestamp; a conflicting edit or denied write displays an error rather than reporting success. Successful edits invalidate board and history queries. History is appended by the existing database trigger, not by client code.

The previous Contact-based pipeline remains accessible using the Existing sales pipeline button or `/admin/pipeline?board=legacy`. Its records and configuration are not copied into the new tables or automatically linked by name/email. No database migration is needed for this frontend release: the corrected SQL was applied and verified separately.

This connection does not activate Zoho synchronisation, email/WhatsApp notifications, invoices, portal provisioning, or other deferred automations. It also does not create an author/contact synchronisation process. The nine imported clients are shown through their linked book projects.

Validation: 47 automated tests pass, including eight new tests for validation, relational reads, stale-write handling, immutable Zoho identifiers, history scoping, filters and summary counts. Production build passes; targeted lint passes for the new board and API module. Browser verification results are recorded in the release response.
