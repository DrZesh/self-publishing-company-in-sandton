# Quote and invoice delivery

Document actions now appear above long documents, with a sticky toolbar in the CRM. Save and Send opens the real sender. Invoice screens include Send Invoice, Download PDF, and editable invoice terms with supporting attachments.

The authenticated billingDocumentEmail function verifies the session with Auth and loads documents with the staff user’s RLS context. PDFs are generated from stored financial records using pdf-lib. The email always includes the generated PDF and all saved supporting documents. Word, PDF, PNG, JPEG and text attachments are stored in a separate private bucket, limited to ten files, 5 MB each and 12 MB combined. Browser supplied totals and external attachment URLs are never trusted.

Each invoice stores its own editable terms. Blank terms intentionally omit the text; null uses the configured default summary. Save terms and attachments before sending or downloading. Concurrent settings edits are rejected using document_version. Quote acceptance terms remain fixed; editing invoice terms does not alter the signed quotation or payment gates.

Emails use the existing server-only RESEND_API_KEY and send from info@creativebooks.co.za. Clicking Send is an explicit manual action, not an automatic billing campaign. The provider acknowledgement, request UUID, immutable email/PDF snapshot and idempotency key are recorded in cb_document_emails. Retries reuse the exact payload, and acknowledged attempts return without resending. Uncertain attempts older than 23 hours cannot be replayed automatically. A successful provider response is not a guarantee of inbox delivery. Quote status changes only after provider acknowledgement, preserving viewed/accepted states. Failed sends leave quote status unchanged.

Validation: 55 automated tests, including the complete database payment workflow, invoice term permissions and optimistic concurrency, PDF generation and pagination, actual attachment payloads, provider rejection, timeout retry, idempotency, recipient validation and HTML escaping. Production Vite build passes. The changes do not modify legacy financial documents.
