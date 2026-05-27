import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const submission_id = payload?.event?.entity_id || payload?.submission_id;
    let submission = payload?.data;

    // If triggered by automation, data may be in payload.data; else fetch by ID
    if (!submission && submission_id) {
      submission = await base44.asServiceRole.entities.Submission.get(submission_id);
    }

    if (!submission) {
      return Response.json({ error: 'No submission data found' }, { status: 400 });
    }

    const toNumber = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!toNumber || !accountSid || !authToken) {
      return Response.json({ error: 'Missing Twilio or WhatsApp config' }, { status: 500 });
    }

    // Format a clean WhatsApp message from the submission
    const services = Array.isArray(submission.service_interest)
      ? submission.service_interest.join(', ')
      : submission.service_interest || 'Not specified';

    const message =
      `📬 *New Form Submission — Creative Books SA*\n\n` +
      `👤 *Name:* ${submission.full_name || '—'}\n` +
      `📧 *Email:* ${submission.email || '—'}\n` +
      `📞 *Phone:* ${submission.phone || '—'}\n` +
      `📖 *Book Title:* ${submission.book_title || '—'}\n` +
      `🛠️ *Services:* ${services}\n` +
      `💬 *Message:* ${submission.message || '—'}\n` +
      `🕐 *Submitted:* ${new Date(submission.created_date || Date.now()).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}\n` +
      `\n🔗 View in CRM: https://app.base44.com`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      From: 'whatsapp:+14155238886', // Twilio Sandbox number (update to your approved sender)
      To: `whatsapp:${toNumber}`,
      Body: message,
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', result);
      return Response.json({ error: result.message || 'Failed to send WhatsApp' }, { status: 500 });
    }

    console.log('WhatsApp sent, SID:', result.sid);
    return Response.json({ success: true, sid: result.sid });

  } catch (error) {
    console.error('formToWhatsApp error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});