# Historical CRM import: 29 October 2026

Destination: Supabase project `cobpbsfkeewxzyprbmet` (Creative Books SA Database).
Source: the user-supplied `6cad686f8_CreativeBooks-CRM-export-2026-10-29.zip`.
Archive SHA-256: `86ce38e14270ba78eeec69b71a8fed654d7bc16ff7692d53d4d360f4304f2af6`.

## Result

10,440 records were inserted across 46 record types in 26 atomic SQL batches. No records were skipped. Every exported ID was reconciled against the destination; no dates were missing. Quote, invoice, payment and receipt aggregate financial values matched the export. The five pre-existing CRM records were verified unchanged. The Supabase Auth user count remained one; no login credentials were imported or created.

| Record type | Imported |
| --- | ---: |
| Contacts | 563 |
| Submissions | 366 |
| Quotes | 256 |
| Invoices | 89 |
| Payments | 7 |
| Receipts | 7 |
| Email history | 7,162 |
| Pipeline deals | 402 |
| Lead scores | 455 |
| Projects | 14 |
| Appointments | 38 |
| Services | 52 |
| Booking services | 3 |
| Availability rules | 7 |
| Contracts (record metadata) | 22 |
| Signature requests (record metadata) | 14 |
| Other records | 983 |
| **Total** | **10,440** |

The original record IDs, JSON fields, creation/update timestamps and author references were retained. CSV files are companions to the JSON files and were not imported a second time. Existing IDs use `ON CONFLICT DO NOTHING`, allowing interrupted batches to be retried without overwriting current records. The new `cover_template_lead` table uses RLS with administrator/staff-only access, following the existing CRM policy.

## Source limitations retained for review

- The export expressly excludes documents and file contents. URLs were retained, but their target files were not copied. Document metadata that was excluded from the export cannot be reconstructed from it.
- One invoice references a contact missing from the export. The same single unresolved contact reference exists after import. Checked quote/contact, invoice/quote, payment/invoice, receipt/invoice, project/contact and portal/project/contact relationships otherwise match the source.
- Four quote-number groups and four invoice-number groups were already duplicated in the source. A newly created CRM quote also overlaps a historical number. Records were not merged or renumbered. Future quote/invoice numbering now advances above the highest existing numeric suffix rather than relying on row counts or the newest record.
- Three repeated normalized contact-email entries already existed in the source. Distinct contact IDs and relationships were retained.
- Three legacy User profiles were imported as historical CRM records. They are not Supabase Auth users and cannot log in automatically.
- Importing historical automation/settings rows does not enable blocked communication workflows or install schedules/triggers. No emails, WhatsApp messages or signing requests were sent by this import.

The original ZIP and generated private import payloads are not committed to GitHub. Only the preparation script, schema changes, aggregate results and application fixes are versioned.
