# Pipeline Integration: Contact ↔ PipelineDeal Sync

## Overview
Bidirectional synchronization between the **Deals Pipeline** (Contact entity) and **Sales Pipeline** (PipelineDeal entity).

## How It Works

### Contact → PipelineDeal Sync
**Trigger:** Contact `pipeline_stage` field is updated  
**Function:** `syncContactToPipelineDeal`  
**Automation:** "Sync Contact to Pipeline Deal on Stage Change"

**What happens:**
1. System finds existing PipelineDeal by `client_email`
2. If found: Updates deal with Contact data (stage, value, owner)
3. If not found: Creates new PipelineDeal automatically
4. Links Contact to deal via `_linked_pipeline_deal_id` field

**Stage Mapping:**
```
New Enquiry → enquiry
Reviewed by Admin → contacted
Quote Required → quote_required
Quote Sent → quote_sent
Quote Viewed → quote_viewed
Quote Accepted → won
NDA Required → contract_required
NDA Sent → contract_sent
NDA Signed → contract_signed
Invoice Required → invoice_required
Invoice Sent → invoice_sent
Payment Pending → payment_pending
Payment Received → won
Project Active → won
Lost/Ghosted → lost
```

### PipelineDeal → Contact Sync
**Trigger:** PipelineDeal `stage_key` field is updated  
**Function:** `syncPipelineDealToContact`  
**Automation:** "Sync Pipeline Deal to Contact on Stage Change"

**What happens:**
1. Finds Contact by `client_email`
2. Updates Contact's `pipeline_stage`, `pipeline_value`, `pipeline_owner`
3. If deal is **won**: Automatically creates a Project
4. Links Contact to deal via `_linked_pipeline_deal_id` field

## Benefits

✅ **No duplicate data entry** - Update once, syncs everywhere  
✅ **Automatic Project creation** - When deal is won  
✅ **Unified view** - See both pipelines side-by-side  
✅ **Sales team visibility** - Enriched Contact data in Sales Pipeline  
✅ **Automated workflow** - Website forms → Contact → PipelineDeal → Project

## Visual Indicators

In the Deals Pipeline, you'll see:
- 📈 **Linked to Sales Pipeline** badge (purple) - Contact is synced
- ✅ **Workflow Active** badge (green) - Client workflow is active

## Manual Sync

To manually trigger a sync:
```javascript
// From Contact to PipelineDeal
await base44.functions.invoke('syncContactToPipelineDeal', {
  contact_id: 'CONTACT_ID',
  action: 'sync'
});

// From PipelineDeal to Contact
await base44.functions.invoke('syncPipelineDealToContact', {
  deal_id: 'DEAL_ID',
  action: 'sync'
});
```

## Data Flow Example

1. **Website form submission** → Creates Contact (New Enquiry)
2. **Automation triggers** → Creates PipelineDeal (enquiry stage)
3. **Admin moves Contact** to "Quote Sent" → PipelineDeal updates to "quote_sent"
4. **Sales team updates** PipelineDeal to "won" → Contact moves to "Quote Accepted"
5. **Automation creates** Project automatically
6. **Client workflow** begins with NDA, Invoice, Production stages

## Fields Synced

| Contact Field | PipelineDeal Field |
|--------------|-------------------|
| full_name | client_name |
| email | client_email |
| phone | client_phone |
| pipeline_value | deal_value |
| pipeline_stage | stage_key (mapped) |
| pipeline_owner | assigned_team_member |
| book_title | project_title / service_type |
| - | _linked_pipeline_deal_id |

## Error Handling

- Skips sync if Contact is not in active pipeline stage
- Won't overwrite closed deals (won/lost) unless closing
- Continues even if Project creation fails
- Logs all sync operations for debugging