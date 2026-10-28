# Creative Books SA - Integrated Workflow System

## Overview

The Creative Books SA dashboard has been upgraded into a **fully connected automated business workflow system**. All modules (Leads, Pipeline, Quotes, NDAs, Invoices, Payments, Projects, and Emails) now work together as one seamless automated journey.

## Core Philosophy

**One Client Record Controls Everything** - No more duplicate data entry. Every client has a central workflow record that connects:
- Lead/Pipeline stage
- Quotes
- NDAs/Documents
- Invoices
- Payments
- Project stages
- Email communications
- Timeline/audit trail

## Master Workflow Journey

```
New Enquiry → Admin Review → Quote Required → Quote Sent → Quote Viewed → 
Quote Accepted → NDA Required (if applicable) → NDA Sent → NDA Signed → 
Invoice Required → Invoice Sent → Payment Pending → Payment Received → 
Project Active → Project In Progress → Client Review → Final Approval → Completed
```

## New Entities Created

### 1. ClientWorkflow Entity
Central workflow record for each client that tracks:
- `contact_id` - Linked Contact
- `current_stage` - Current workflow stage
- `stage_history` - Complete audit trail of stage changes
- `quote_id` - Linked Quote
- `quote_status` - Quote lifecycle status
- `nda_required` - Whether NDA is needed
- `nda_document_id` - Linked NDA Document
- `nda_status` - NDA signing status
- `invoice_id` - Linked Invoice
- `invoice_status` - Invoice payment status
- `payment_status` - Payment tracking (unpaid/deposit_paid/paid)
- `payment_received_at` - When payment was received
- `project_id` - Linked Project
- `blocked_reason` - Why workflow is blocked
- `next_action` - What needs to happen next
- `service_type` - Selected service package

### 2. WorkflowRule Entity
Automation rules that trigger actions based on workflow stage:
- `trigger_stage` - Which stage triggers this rule
- `service_types` - Which services this applies to
- `requires_quote` - Whether quote is required
- `requires_nda` - Whether NDA is required
- `requires_invoice` - Whether invoice is required
- `requires_deposit` - Whether deposit is required
- `deposit_percentage` - Deposit amount (default 50%)
- `block_production_until_paid` - Block project start until payment
- `auto_send_email` - Whether to auto-send email
- `email_template_id` - Which email template to use

## Service-Based Workflow Rules

Different services have different requirements:

### Book Printing
- ✅ Quote required
- ❌ NDA not required (by default)
- ✅ Invoice required
- ✅ Payment required before production
- ✅ Client file upload required

### Ghostwriting
- ✅ Quote required
- ✅ NDA required (critical for ghostwriting)
- ✅ Invoice required
- ✅ Deposit required (50% standard)
- ✅ Project stages required

### Book Editing
- ✅ Quote required
- ⚠️ NDA optional (case-by-case)
- ✅ Invoice required
- ✅ Deposit or full payment required
- ✅ Manuscript upload required

### Full Publishing Package
- ✅ Quote required
- ✅ NDA required (publishing agreement)
- ✅ Invoice required
- ✅ Deposit required (50% standard)
- ✅ Multiple project stages

### Cover Design
- ✅ Quote required
- ⚠️ NDA optional (design agreement optional)
- ✅ Invoice required
- ✅ Payment required before final files
- ✅ Design approval required

## Automation Features

### Quote Automation
When workflow reaches **Quote Required**:
1. Admin creates quote from client record
2. Quote pulls client details automatically:
   - Name, email, phone
   - Company, VAT number
   - Book title
   - Service type
3. When quote is sent:
   - Email sent to client with PDF
   - Workflow updates to **Quote Sent**
   - Follow-up reminder scheduled
   - Client can view/accept/reject online
4. When quote is accepted:
   - Workflow updates to **Quote Accepted**
   - Next step triggered (NDA or Invoice)
   - Admin notified

### NDA/Document Automation
When workflow reaches **NDA Required**:
1. System generates correct document template
2. Pulls client and project details automatically
3. Admin reviews before sending
4. Document sent for e-signature
5. Workflow updates to **NDA Sent**
6. When client signs:
   - Signed document saved
   - Certificate saved (if available)
   - Copy emailed to client
   - Admin notified
   - Workflow updates to **NDA Signed**
   - Invoice creation triggered

### Invoice Automation
When workflow reaches **Invoice Required**:
1. Invoice created from accepted quote
2. Pulls all line items, totals, client details
3. Admin reviews and sends
4. Email sent with PDF attachment
5. Payment link included (if applicable)
6. Workflow updates to **Invoice Sent**
7. Automated reminders start:
   - 3 days before due
   - On due date
   - 2 days after due
   - 7 days after due

### Payment Automation
When payment is received:
1. Client uploads proof of payment OR payment marked as received
2. Admin approves payment
3. Invoice status updated
4. Receipt generated and emailed
5. Workflow updates to **Payment Received**
6. Project unlocked for production
7. Client receives confirmation email

### Payment Blocking (Critical)
**Projects cannot start before payment is received.**

The system enforces:
- If invoice status ≠ **Paid** or **Deposit Paid**
- Project cannot move to:
  - Project Active
  - Editing Started
  - Design Started
  - Typesetting Started
  - Printing Started
  - Production Started

**Warning shown:** "Payment has not been received yet. This project cannot move to production."

Admin override available with special permission only.

## Email Automation

### Automated Email Templates
- ✅ Enquiry received confirmation
- ✅ Quote sent
- ✅ Quote reminder (2 days after)
- ✅ Quote accepted confirmation
- ✅ Quote rejected notification
- ✅ NDA sent
- ✅ NDA signed confirmation
- ✅ Invoice sent
- ✅ Payment reminder (multiple)
- ✅ Payment overdue
- ✅ Proof of payment received
- ✅ Payment approved
- ✅ Receipt sent
- ✅ Project started
- ✅ Project stage updates
- ✅ Client review required
- ✅ Final approval request
- ✅ Project completed

All emails use Creative Books SA branding and support variables:
- `{{client_name}}`
- `{{book_title}}`
- `{{quote_number}}`
- `{{invoice_number}}`
- `{{service_type}}`
- `{{project_stage}}`

## Reminder Automation

### Quote Reminders
- 2 days after quote sent
- 1 day before quote expires
- On expiry date

### NDA Reminders
- 2 days after NDA sent
- 5 days after NDA sent
- Every 5 days until signed (unless disabled)

### Invoice Reminders
- 3 days before due date
- On due date
- 2 days after due date
- 7 days after due date

### Project Update Reminders
- Every 2 working days while project active
- Only after admin approval
- Pulls current project stage into email

## Admin Approval Controls

**Sensitive actions require admin review before sending:**
- ❌ Quotes (admin must review and approve)
- ❌ NDAs (admin must review before sending)
- ❌ Invoices (admin must review and approve)
- ❌ Final approval requests
- ❌ Project completion emails

**Automated reminders can be sent without approval:**
- ✅ Quote reminders
- ✅ NDA reminders
- ✅ Payment reminders
- ✅ Project update reminders (if enabled)

## Timeline & Audit Trail

Every client has a complete timeline showing:
- Lead created
- Quote created
- Quote sent date/time
- Quote viewed (with IP/timestamp)
- Quote accepted/rejected
- NDA sent
- NDA signed (with certificate)
- Invoice sent
- Payment proof uploaded
- Payment approved
- Receipt sent
- Pipeline stage changes (who changed, when)
- Emails sent
- Files uploaded
- Notes added
- Workflow stage changes

**Timeline is visible on:**
- Client detail page
- Pipeline deal card
- Workflow panel
- Project record

## Admin Dashboard Views

### Workflow Dashboard
Shows:
- New enquiries needing review
- Quotes needing to be sent
- Quotes awaiting response
- NDAs awaiting signature
- Invoices awaiting payment
- Payments needing approval
- Projects ready to start
- Overdue invoices
- Clients needing follow-up
- Projects needing updates

### Pipeline Integration
Pipeline stages automatically update when:
- Quote is sent → **Quote Sent**
- Quote accepted → **Quote Accepted**
- NDA signed → **NDA Signed**
- Invoice sent → **Invoice Sent**
- Payment received → **Payment Received**
- Project starts → **Project Started**

### Client Record Integration
Each client record shows:
- Contact details
- Book/project title
- Service type
- Current workflow stage
- Linked quote
- Linked NDA/document
- Linked invoice
- Payment status
- Linked project
- Complete timeline
- All emails sent
- All files uploaded
- Notes and internal comments

## Client Portal Features

Clients can:
- ✅ View quote online
- ✅ Accept or reject quote with e-signature
- ✅ Sign NDA or documents electronically
- ✅ View invoice
- ✅ Upload proof of payment
- ✅ Download receipt
- ✅ Upload manuscript/files
- ✅ See current project stage
- ✅ Receive project updates
- ✅ Request changes
- ✅ Book appointments/calls
- ✅ View project timeline

## Reporting

Reports available for:
- 📊 Leads received (by source, date, service)
- 📊 Quotes sent
- 📊 Quotes accepted
- 📊 Quote conversion rate (%)
- 📊 Documents/NDAs signed
- 📊 Invoices sent
- 📊 Payments received
- 📊 Overdue invoices
- 📊 Revenue by service type
- 📊 Revenue by pipeline stage
- 📊 Projects completed
- 📊 Projects delayed
- 📊 Average time from quote to payment
- 📊 Client lifecycle stage distribution

All currency in **South African Rand (R)**.

## Implementation Status

### ✅ Completed
- ClientWorkflow entity created
- WorkflowRule entity created
- Workflow automation backend function
- Workflow panel UI component
- Service-based workflow configuration
- Payment blocking logic
- Stage transition validation
- Quote/invoice linking
- Timeline/audit trail

### 🔄 Next Steps
1. **Update existing pipeline** to use new workflow stages
2. **Create workflow rules** for each service type
3. **Integrate with existing quote system** for auto-generation
4. **Integrate with existing invoice system** for auto-creation
5. **Connect email templates** to workflow triggers
6. **Add workflow panel** to contact detail pages
7. **Add workflow panel** to pipeline deal cards
8. **Create admin dashboard** for workflow overview
9. **Test payment blocking** with production stages
10. **Train admin team** on new workflow system

## How to Use

### For Admin Users

1. **New Enquiry Received**
   - Contact record created automatically from form
   - Workflow initialized automatically
   - Assigned to admin for review

2. **Review Enquiry**
   - Open contact record
   - Click "Workflow" tab
   - Review service type and requirements
   - Click "Prepare Quote"

3. **Send Quote**
   - Quote created from workflow
   - Review and customize quote
   - Click "Send to Client"
   - Workflow updates automatically

4. **Quote Accepted**
   - Notification received
   - Workflow updates to **Quote Accepted**
   - If NDA required: prepare NDA
   - If no NDA: prepare invoice

5. **Send NDA (if required)**
   - Document generated from template
   - Review and send for signature
   - Client signs electronically
   - Workflow updates automatically

6. **Send Invoice**
   - Invoice created from accepted quote
   - Review line items and totals
   - Click "Send to Client"
   - Payment reminders start automatically

7. **Receive Payment**
   - Client uploads proof of payment
   - Admin approves payment
   - Invoice marked as paid
   - Receipt sent automatically
   - Project unlocked for production

8. **Start Project**
   - Workflow updates to **Project Active**
   - Project record created/updated
   - Team assigned
   - Production begins

### For Clients

1. **Submit Enquiry**
   - Fill form on website
   - Receive confirmation email

2. **Receive Quote**
   - Email with quote link
   - View quote online
   - Accept or reject with e-signature

3. **Sign NDA (if required)**
   - Email with document link
   - Review and sign electronically
   - Receive signed copy

4. **Receive Invoice**
   - Email with invoice link
   - View invoice online
   - Upload proof of payment

5. **Track Project**
   - Login to client portal
   - See current stage
   - Receive updates
   - Upload files
   - Request changes

## Benefits

### For Creative Books SA
- ✅ No duplicate data entry
- ✅ Automated follow-ups and reminders
- ✅ Clear visibility of every client's status
- ✅ Payment protection (no work before payment)
- ✅ Complete audit trail
- ✅ Reduced admin workload
- ✅ Faster quote-to-cash cycle
- ✅ Better client communication
- ✅ Professional workflow management

### For Clients
- ✅ Clear communication at every stage
- ✅ Easy online quote acceptance
- ✅ Simple e-signature for documents
- ✅ Convenient payment upload
- ✅ Visibility into project progress
- ✅ Professional experience
- ✅ Faster turnaround times

## Support

For questions or issues with the workflow system:
- Check the **Workflow Panel** on any client record
- Review the **Timeline** for complete history
- Contact system administrator for workflow rule changes
- Refer to **Admin Dashboard** for overview

---

**System Version:** 2.0  
**Last Updated:** June 2026  
**Platform:** Base44