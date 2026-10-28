# Quick Start: Custom Pipelines & Email Tracking

## 🎯 What You Can Do Now

1. **Create custom deal pipelines** with automated actions
2. **Send follow-up emails** that track opens and clicks
3. **See exactly when** clients open your quotes and emails
4. **Automate follow-ups** based on pipeline stage and timing

## 🚀 Getting Started

### Step 1: Create Your First Custom Pipeline

1. Go to **Admin → Pipeline**
2. Click **"Custom Pipeline"** button (purple)
3. Enter pipeline name: e.g., "Book Publishing Follow-up"
4. Add stages:
   - **Quote Sent** (blue)
   - **Follow-up Required** (orange)
   - **Contract Sent** (green)
5. Add suggested actions:
   - On "Quote Sent": Add action "Send Follow-up Email" with **2 days delay**
   - On "Follow-up Required": Add action "Send WhatsApp" with **1 day delay**
6. Click **"Create Pipeline"**

### Step 2: Test Email Tracking

1. Go to **Admin → Contacts**
2. Select any contact
3. Click **"Tracking"** tab
4. Click **"Send Follow-up Email"** (or use the email button)
5. Send a test email to yourself
6. **Open the email** → Watch the tracking update in real-time!

### Step 3: View Analytics

**In Contact Detail → Tracking Tab:**
- 📊 **Open rate** percentage
- 🖱️ **Click rate** percentage  
- ⏰ **Exact timestamps** of opens/clicks
- 📧 **Email history** with status badges

## 📋 Example Workflow

```
Day 0: Contact moves to "Quote Sent" stage
  ↓
Day 2: Automation sends branded follow-up email
  ↓
Day 2, 14:32: Client OPENS email (you see this instantly!)
  ↓
Day 2, 14:35: Client CLICKS quote link (tracked!)
  ↓
Day 2, 15:00: You call client: "Did you receive my email?" 
            → They're impressed you know! 😊
  ↓
Day 3: Move to "Follow-up Required" 
  ↓
Day 4: WhatsApp reminder sent automatically
```

## 🎨 Email Template Features

**All emails include:**
- ✅ Your company branding and colors
- ✅ Professional HTML design
- ✅ Personalization (client name, book title)
- ✅ Invisible tracking pixel
- ✅ Click tracking on all links

**Template variables you can use:**
- `{{contact.full_name}}` - Client name
- `{{contact.email}}` - Client email
- `{{contact.book_title}}` - Book/project title
- `{{contact.company}}` - Company name

## 🔍 Where to Find Features

| Feature | Location |
|---------|----------|
| Create custom pipeline | Admin Pipeline → "Custom Pipeline" button |
| View email tracking | Contact Detail → "Tracking" tab |
| Send manual follow-up | Contact Detail → "Emails" tab |
| See all email stats | Contact Detail → "Tracking" tab |
| Edit email templates | Admin → Email Templates |
| View automation logs | Admin → Automations |

## 💡 Pro Tips

1. **Set realistic delays** - Don't follow up too quickly (2-3 days minimum)
2. **Use tracking data** - Call clients right after they open emails
3. **A/B test templates** - Try different subject lines
4. **Monitor open rates** - Low rates? Improve subject lines
5. **Check click rates** - Low clicks? Make CTAs clearer

## ⚙️ Automation Schedule

- **Runs:** Every hour
- **Checks:** All contacts in all pipeline stages
- **Executes:** Actions where days-in-stage >= delay
- **Prevents:** Duplicate sends of same action

## 🛠️ Troubleshooting

**Emails not sending?**
- Check Admin → Automations → "Process Pipeline Suggested Actions Daily" is active
- Verify email templates exist
- Check contact has valid email address

**Tracking not working?**
- Tracking pixel must load (images must be enabled in email client)
- Some email providers block tracking (Gmail shows partial data)
- Check EmailMessage entity for records

**Actions not triggering?**
- Verify stage name matches exactly
- Check delay_days is set correctly
- Ensure action is_active=true
- Check automation logs for errors

## 📊 What Gets Tracked

**Email Opens:**
- ✅ When opened (timestamp)
- ✅ How many times opened
- ✅ IP address (approximate location)
- ✅ Device type (from user agent)

**Link Clicks:**
- ✅ Which links clicked
- ✅ When clicked
- ✅ Click frequency
- ✅ Last click timestamp

**Contact Responses:**
- ✅ Follow-up response received flag
- ✅ Response timestamp
- ✅ Updated in Contact entity

## 🎉 Success Metrics

Track these to measure improvement:
- **Open rate** → Target: 40%+
- **Click rate** → Target: 10%+
- **Response rate** → Target: 25%+
- **Time to response** → Target: <24 hours

---

**Need help?** Check `CUSTOM_PIPELINE_EMAIL_TRACKING.md` for full documentation.