import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to_number, message, type, contact_id } = await req.json();
    if (!to_number || !message) return Response.json({ error: 'to_number and message required' }, { status: 400 });

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    // Format number — ensure it has country code
    const formattedNumber = to_number.startsWith('+') ? to_number : `+27${to_number.replace(/^0/, '')}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const formData = new URLSearchParams({
      From: 'whatsapp:+14155238886', // Twilio WhatsApp sandbox number
      To: `whatsapp:${formattedNumber}`,
      Body: message,
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    if (result.error_code) {
      return Response.json({ error: result.message, error_code: result.error_code }, { status: 400 });
    }

    // Log as email message for tracking
    if (contact_id) {
      await base44.asServiceRole.entities.EmailMessage.create({
        contact_id,
        direction: 'outbound',
        subject: `WhatsApp: ${type || 'Notification'}`,
        body_text: message,
        status: 'sent',
        sent_at: new Date().toISOString(),
        from_address: 'whatsapp',
        to_addresses: [formattedNumber],
      });
    }

    return Response.json({ success: true, sid: result.sid, to: formattedNumber });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});