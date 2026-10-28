# Phase 9 & 10: Marketing Automation + Business Intelligence

## Phase 9: Marketing Campaigns ✅

### New Entities
- **EmailCampaign** — stores campaigns with audience filters, stats, status
- **NurtureSequence** — drip/nurture sequence templates
- **CampaignRecipient** — per-send recipient tracking

### New Backend Function
- **campaignActions** — handles: `get_audience`, `preview`, `send`, `get_stats`
  - Builds branded HTML emails with unsubscribe links
  - Personalises with `{{name}}` merge tags
  - Sends in batches of 10 for reliability
  - Respects unsubscribed/do_not_contact flags
  - Audience filters by lifecycle stage, pipeline stage, tags

### New Admin Page: `/admin/marketing`
- Campaign list with KPI cards (total, sent, avg open rate)
- Create/Edit modal with audience preview
- One-click "Send Now" per campaign
- Stats panel (opens, clicks, bounces, per-recipient status)
- Status badges: Draft, Scheduled, Sending, Sent

---

## Phase 10: Business Intelligence ✅

### New Admin Page: `/admin/bi`
- **Monthly Revenue chart** (last 6 months, area chart)
- **Quote Conversion Funnel** (Created → Sent → Viewed → Accepted, bar chart)
- **Invoice Health pie** (Paid / Outstanding / Overdue)
- **Pipeline Stage Breakdown** (horizontal bar chart)
- **Contact Lifecycle pie** (lead, customer, repeat, etc.)
- **KPI cards**: Total Revenue, Outstanding Balance, Quote Conversion Rate, Avg Deal Size, New Contacts this month, Overdue Invoices

### Data Sources
- All data pulled directly from entities (Invoice, Quote, Contact, Payment)
- No external API needed — fully self-contained
- Cached for 60 seconds with TanStack Query

---

## Sidebar Updates
- New **Marketing** group with Campaigns link
- Reports group renamed **Reports & Analytics**
- **Business Intelligence** added as first item in analytics group

## Routes Added
- `/admin/marketing` — Email Campaigns
- `/admin/bi` — Business Intelligence Dashboard