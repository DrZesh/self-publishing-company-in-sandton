# Canonical billing PDF

Quote and invoice PDFs follow the supplied A4 sample: embedded Open Sans regular/bold, Creative Books logo, right-aligned document heading and reference, address / Bill To block, dark item table, grey total band, banking notes, terms and page footer. Quotation validity and the existing payment schedule remain visible. Invoice line amounts, payment figures, editable terms and saved signatures are preserved. No historical or uploaded documents are overwritten.

The single renderer is `supabase/functions/billingDocumentEmail/document.js`. The CRM's `PdfDocumentPreview` generates and embeds that actual PDF, using the same renderer, logo, embedded font data and input records as the server download/email path. Metadata dates are stable, so identical inputs produce identical PDF bytes. The Send page also previews the attachment before sending. The public signing portal keeps its responsive acceptance controls. Statements retain their existing document layout.

The preview provides Open PDF / Print and Save this PDF controls, including a direct link for browsers without embedded PDF support. The document action Download PDF continues to use the authenticated server path. Existing email attempts retain their saved attachment snapshots and idempotency keys. No automatic resends occur when installing this layout. Supporting documents still attach alongside the canonical PDF.

Open Sans is sourced from pinned @fontsource/open-sans 5.3.0, Latin normal 400 / 700, converted from WOFF to TrueType with fontTools and embedded in the checked-in font modules. SIL OFL text is included. The Edge Function's deno.json pins @pdf-lib/fontkit 1.1.1; the browser package pins the same version.

Validation: the delivery test compares the preview's bytes with the actual mocked email PDF attachment, verifies repeat rendering is deterministic, exercises long/multi-page descriptions, checks text stays within A4 bounds, and verifies editable invoice terms and supporting file delivery. No real client email is needed for these checks.
