# Data Import/Export Implementation

## Overview
Added CSV import/export functionality for bulk data management across Contacts, Invoices, Quotes, and other entities.

## Features

### Import
- **Template Download** - Pre-formatted CSV templates for each entity type
- **CSV Upload** - Drag-and-drop or file browser upload
- **Validation** - Checks required fields before import
- **Error Reporting** - Shows success/failure counts with detailed error messages
- **Bulk Create** - Creates multiple records in a single operation

### Export
- **Full Export** - Export all records for an entity
- **CSV Format** - Compatible with Excel, Google Sheets
- **Smart Formatting** - Handles dates, numbers, and nested objects

## Supported Entities

### Contact
**Template Fields:**
- `full_name`* (required)
- `email`* (required)
- `phone`
- `company`
- `billing_address`
- `vat_number`
- `role` (author, publisher, agent, other)
- `lifecycle_stage` (subscriber, lead, customer, repeat_customer, past_customer)
- `city`, `province`
- `book_title`
- `pipeline_stage`
- `pipeline_value`

### Invoice
**Template Fields:**
- `contact_id`* (required)
- `invoice_number`* (required)
- `total`
- `status` (Draft, Sent, Partially Paid, Paid, Overdue)
- `issue_date` (YYYY-MM-DD)
- `due_date` (YYYY-MM-DD)
- `book_title`
- `notes`

### Quote
**Template Fields:**
- `contact_id`* (required)
- `quote_number`* (required)
- `subtotal`
- `vat_rate`
- `total`
- `valid_until` (YYYY-MM-DD)
- `status` (Draft, Sent, Accepted, Declined, Expired)

### Payment
**Template Fields:**
- `invoice_id`* (required)
- `contact_id`* (required)
- `amount`* (required)
- `payment_date` (YYYY-MM-DD)
- `payment_method` (EFT, Card, Cash, Other)
- `reference`
- `notes`

## Usage

### In Admin Panel

**Contacts** (`/admin/contacts`):
- Import button in top-right corner
- Export all contacts to CSV
- Download template for bulk import

**Invoices** (`/admin/invoices`):
- Import/Export buttons in header
- Supports bulk invoice creation

**Quotes** (`/admin/quotes`):
- Import/Export functionality
- Template includes all quote fields

### Example CSV (Contacts)
```csv
full_name,email,phone,company,billing_address,role,lifecycle_stage
John Doe,john@example.com,+27820000000,Acme Corp,"123 Main St, Johannesburg",author,lead
Jane Smith,jane@example.com,+27830000000,Publisher XYZ,"456 Oak Ave, Cape Town",publisher,customer
```

### Example CSV (Invoices)
```csv
contact_id,invoice_number,total,status,issue_date,due_date,book_title
abc123,INV-2024-001,5000,Sent,2024-01-01,2024-01-08,My Book Title
def456,INV-2024-002,7500,Sent,2024-01-02,2024-01-09,Another Book
```

## Backend Function

**Function:** `importExportActions`

**Actions:**
1. `import` - Bulk create records from CSV data
   - Parameters: `entity_name`, `data` (array)
   - Returns: `success_count`, `error_count`, `errors`

2. `export` - Export records to CSV
   - Parameters: `entity_name`, `format` (csv/json)
   - Returns: `csv` (string), `count`

**Security:**
- Admin-only access
- Validates required fields per entity
- Limits error messages to first 20

## Components

### SimpleImportExport (`components/admin/SimpleImportExport`)
Lightweight component for import/export:
- Template download button
- Export to CSV button
- Import CSV file upload
- Loading states
- Toast notifications

### CsvImportExport (`components/admin/CsvImportExport`)
Advanced component with:
- Drag-and-drop upload
- Preview before import
- Success/error summary
- Field mapping
- Deduplication options

## Error Handling

**Import Validation:**
- Required fields checked
- Email format validation
- Date format validation
- Duplicate detection (by email for contacts)
- Entity reference validation (contact_id must exist)

**Error Messages:**
```
Row 3: Missing full_name or email
Row 5: Invalid date format for due_date
Row 7: contact_id not found
```

## Best Practices

1. **Backup First** - Export existing data before bulk imports
2. **Test Small** - Import 2-3 records first to validate format
3. **Use Templates** - Download official templates for correct format
4. **Clean Data** - Remove special characters, extra quotes
5. **Check IDs** - Ensure contact_id, invoice_id references exist

## Future Enhancements

1. **Update Existing** - Upsert mode (create or update by email/ID)
2. **Field Mapping UI** - Map CSV columns to entity fields
3. **Scheduled Exports** - Auto-export reports weekly/monthly
4. **Advanced Filters** - Export only filtered/selected records
5. **PDF Import** - Parse invoices from PDF files
6. **Integration Imports** - Import from Xero, QuickBooks, etc.

## Files Created/Modified

**Created:**
- `functions/importExportActions` - Backend import/export logic
- `components/admin/SimpleImportExport` - Lightweight UI component
- `components/admin/CsvImportExport` - Advanced UI component
- `DATA_IMPORT_EXPORT.md` - This documentation

**Modified:**
- `pages/admin/AdminContacts` - Already has import/export
- `pages/admin/AdminInvoices` - Already has import/export
- `pages/admin/AdminQuotes` - Add import/export button

## Testing

**Test Import (Contacts):**
1. Download template from Contacts page
2. Fill in 3-5 test contacts
3. Upload CSV
4. Verify success count
5. Check contacts list for new entries

**Test Export:**
1. Go to Contacts/Invoices/Quotes
2. Click Export button
3. Open downloaded CSV in Excel/Sheets
4. Verify all fields present

## Support

For issues with import/export:
1. Check CSV format matches template
2. Verify required fields are present
3. Check error messages in toast notifications
4. Review console logs for detailed errors
5. Contact admin for backend function logs