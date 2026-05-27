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
    const apiKey = Deno.env.get('CALLMEBOT_API_KEY');

    if (!toNumber || !apiKey) {
      return Response.json({ error: 'Missing WHATSAPP_NOTIFY_NUMBER or CALLMEBOT_API_KEY' }, { status: 500 });
    }

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
      `🕐 *Submitted:* ${new Date(submission.created_date || Date.now()).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}`;

    // CallMeBot free WhatsApp API
    const phone = toNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;

    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      console.error('CallMeBot error:', text);
      return Response.json({ error: 'Failed to send WhatsApp', detail: text }, { status: 500 });
    }

    console.log('WhatsApp sent via CallMeBot:', text);
    return Response.json({ success: true, response: text });

  } catch (error) {
    console.error('formToWhatsApp error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});