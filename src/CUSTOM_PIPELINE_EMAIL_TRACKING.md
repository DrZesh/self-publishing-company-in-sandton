# Custom Pipeline & Email Tracking System

## Features Implemented

### 1. Custom Pipeline Builder ✅
**Create custom deal pipelines with:**
- Custom pipeline names and descriptions
- Color-coded stages
- Suggested actions per stage (email, WhatsApp, tasks, quotes)
- Delay timing for automated actions

**Access:** Admin Pipeline → "Custom Pipeline" button

### 2. Automated Follow-up Emails ✅
**Suggested Actions trigger automatically:**
- **Send Email** - Uses branded email templates
- **Send WhatsApp** - WhatsApp notifications
- **Create Task** - Admin task reminders
- **Send Quote** - Quote follow-ups

**Automation runs:** Every hour checking for actions to execute

### 3. Email Tracking ✅
**Track every email with:**
- 📧 **Open tracking** - Records when email is opened
- 🖱️ **Click tracking** - Records link clicks
- ⏰ **Timestamps** - Exact open/click times
- 📊 **Analytics** - Open rate, click rate, response rate

**View tracking:** Contact Detail → "Tracking" tab

### 4. Email Templates with Branding ✅
**Uses existing email template system:**
- Branded colors and design
- HTML formatting
- Personalization with {{contact.full_name}}, {{contact.book_title}}, etc.
- Professional templates for follow-ups, quotes, NDAs

## How It Works

### Creating a Custom Pipeline

1. **Click "Custom Pipeline"** in Admin Pipeline header
2. **Enter pipeline details:**
   - Name (e.g., "Book Publishing Pipeline")
   - Description
   - Color theme
3. **Add stages:**
   - Stage name (e.g., "Quote Sent", "NDA Required")
   - Color for each stage
   - Click "Add Stage" button
4. **Add suggested actions to each stage:**
   - Click "Add Action" on any stage
   - Choose action type (Email, WhatsApp, Task, Quote)
   - Set action name and delay (e.g., "Send Follow-up" after 3 days)
5. **Save pipeline**

### Automated Follow-up Flow

```
Contact enters stage "Quote Sent"
  ↓
Automation checks every hour
  ↓
Days in stage >= delay_days? (e.g., 3 days)
  ↓
YES → Execute action:
  - Send branded email with tracking pixel
  - OR send WhatsApp
  - OR create task
  ↓
Record in EmailMessage entity
  ↓
Track opens/clicks automatically
```

### Email Tracking Implementation

**When email is sent:**
1. Invisible tracking pixel embedded in email
2. Unique email_id assigned
3. EmailMessage record created with opened=false

**When recipient opens email:**
1. Tracking pixel loads from `emailTrackingPixel` function
2. Records: opened=true, opened_at=timestamp, IP, user_agent
3. Updates Contact.followup_response_received=true
4. Updates ServiceEmailLog

**When recipient clicks link:**
1. Click tracked via `sendFollowUpWithEmailTracking` function
2. Records: clicked=true, clicked_at, link_url, IP
3. Updates EmailMessage and ServiceEmailLog

### Viewing Email Analytics

**Contact Detail Page → "Tracking" Tab:**
- **Stats Cards:**
  - Total Sent
  - Opened (with open rate %)
  - Clicked (with click rate %)
  - Responded status

- **Recent Emails List:**
  - Subject line
  - Email type badge
  - Sent timestamp
  - Open/Click status indicators
  - Detailed timeline showing:
    - When sent
    - When opened (green)
    - When clicked (purple)

## Backend Functions

### `manageCustomPipeline`
**Actions:**
- `create_pipeline` - Create new custom pipeline
- `update_pipeline` - Update existing pipeline
- `add_suggested_action` - Add action to stage
- `remove_suggested_action` - Remove action from stage

### `sendFollowUpWithEmailTracking`
**Actions:**
- `send_followup` - Send tracked email
- `track_open` - Record email open (via pixel)
- `track_click` - Record link click
- `get_tracking_stats` - Get analytics for contact

### `emailTrackingPixel`
- Serves 1x1 transparent GIF
- Triggered when email is opened
- Calls `track_open` automatically

### `processPipelineActions`
- Scheduled automation (runs hourly)
- Checks all pipelines and stages
- Executes suggested actions based on delay
- Prevents duplicate sends

## Entity: EmailMessage

**Fields:**
- contact_id, quote_id, template_id
- subject, body, sent_at, sent_by
- email_type (follow_up, quote, nda, etc.)
- opened, opened_at, last_opened_ip
- clicked, clicked_at, clicked_link
- user_agent

## Automation: "Process Pipeline Suggested Actions Daily"

**Schedule:** Every 1 hour at 09:00 SAST

**Logic:**
1. Fetch all active pipelines
2. For each stage with suggested actions:
   - Find contacts in that stage
   - Calculate days since stage entry
   - Check if action already sent
   - Execute action if delay reached
3. Log all actions

## Usage Example

**Scenario:** Follow up on quote after 2 days

1. **Create pipeline** with stage "Quote Sent"
2. **Add action:** "Send Follow-up Email" with 2 days delay
3. **Contact moves** to "Quote Sent" stage
4. **Wait 2 days**
5. **Automation runs** → Sends branded email
6. **Client opens email** → Tracking recorded
7. **Admin sees** green "Opened" badge in Tracking tab
8. **Follow-up response** marked as received

## Benefits

✅ **No manual follow-ups** - Automated based on pipeline stage  
✅ **Professional branding** - Branded email templates  
✅ **Complete visibility** - See exactly when emails are opened  
✅ **Better timing** - Know the best time to call after open  
✅ **Higher conversion** - Timely follow-ups increase close rate  
✅ **Analytics** - Track open/click rates per template  
✅ **Custom workflows** - Build pipelines for any service type  

## Next Steps (Optional Enhancements)

- A/B testing for email templates
- Multi-channel sequences (email → WhatsApp → call)
- Smart timing (send at optimal time of day)
- Reply detection (Gmail API integration)
- Unsubscribe management
- Email deliverability monitoring