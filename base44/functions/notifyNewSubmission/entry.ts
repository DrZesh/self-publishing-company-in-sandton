const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';
const TO_EMAIL = 'info@creativebooks.co.za';
const TO_CC = 'draubreyzesh@gmail.com';

// Twilio WhatsApp config
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const WHATSAPP_FROM = 'whatsapp:+14155238886'; // Twilio sandbox sender (update if you have an approved sender)
const WHATSAPP_TO = 'whatsapp:+27625891937';   // Your WhatsApp number

console.log('Twilio env check:', {
  has_sid: !!TWILIO_ACCOUNT_SID,
  sid_preview: TWILIO_ACCOUNT_SID?.substring(0, 10),
  has_token: !!TWILIO_AUTH_TOKEN,
  token_preview: TWILIO_AUTH_TOKEN?.substring(0, 10),
});

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const sub = body.data || {};

    const services = Array.isArray(sub.service_interest) && sub.service_interest.length
      ? sub.service_interest.join(', ')
      : '—';

    const rows = [
      ['Name', sub.full_name],
      ['Email', sub.email],
      ['Phone', sub.phone],
      ['Form Type', (sub.form_type || '').replace(/_/g, ' ')],
      ['Services', services],
      ['Book Title', sub.book_title],
      ['Source Page', sub.source_page],
      ['Message', sub.message],
    ].filter(([, v]) => v).map(([label, value]) => `
      <tr>
        <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">${label}</td>
        <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${String(value).replace(/\n/g, '<br/>')}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="6" style="background:linear-gradient(90deg,#B87333,#D4A574);font-size:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 32px 8px;">
        <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" />
      </td></tr>
      <tr><td align="center" style="padding:16px 32px 8px;">
        <h1 style="font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 6px 0;">📬 New Form Submission</h1>
        <p style="font-size:15px;color:#6B6B6B;margin:0 0 24px 0;">A new enquiry has been received from your website.</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;">
          <tbody>${rows}</tbody>
        </table>
        <div style="text-align:center;margin-top:28px;">
          <a href="https://creativebooks.co.za/admin/submissions" style="display:inline-block;background:#B87333;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">View in Dashboard →</a>
        </div>
      </td></tr>
      <tr><td style="padding:24px 32px;border-top:1px solid #E5E0D5;text-align:center;font-size:13px;color:#AAAAAA;line-height:1.7;">
        Creative Books SA &nbsp;|&nbsp; Prism Office Park, Fourways &nbsp;|&nbsp; info@creativebooks.co.za
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL, TO_CC],
        subject: `📬 New Submission: ${sub.full_name || 'Unknown'} — ${(sub.form_type || 'enquiry').replace(/_/g, ' ')}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend failed:', err);
      throw new Error(`Resend failed: ${err}`);
    }

    console.log('Resend successful, proceeding to WhatsApp');
    // Send WhatsApp notification via Twilio
    console.log('Attempting WhatsApp send to:', WHATSAPP_TO);
    try {
      const msgLines = [
        `📬 *New Enquiry — Creative Books SA*`,
        ``,
        `*Name:* ${sub.full_name || '—'}`,
        `*Email:* ${sub.email || '—'}`,
        `*Phone:* ${sub.phone || '—'}`,
        `*Services:* ${services}`,
        sub.book_title ? `*Book Title:* ${sub.book_title}` : null,
        sub.message ? `*Message:* ${sub.message.substring(0, 200)}` : null,
        ``,
        `View: https://creativebooks.co.za/admin/submissions`,
      ].filter(Boolean).join('\n');

      console.log('Twilio request:', {
        url: `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        from: WHATSAPP_FROM,
        to: WHATSAPP_TO,
        body_preview: msgLines.substring(0, 100),
      });

      // Use TextEncoder for base64 in Deno
      const credentials = `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`;
      const encoded = btoa(
        new TextEncoder().encode(credentials).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + encoded,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: WHATSAPP_FROM,
            To: WHATSAPP_TO,
            Body: msgLines,
          }).toString(),
        }
      );

      const twilioBody = await twilioRes.text();
      console.log('Twilio response:', {
        status: twilioRes.status,
        statusText: twilioRes.statusText,
        body: twilioBody,
      });

      if (!twilioRes.ok) {
        console.error('WhatsApp send failed:', twilioRes.status, twilioBody);
      } else {
        const parsed = JSON.parse(twilioBody);
        console.log('WhatsApp sent, SID:', parsed.sid, 'Status:', parsed.status, 'Direction:', parsed.direction);
      }
    } catch (waErr) {
      console.error('WhatsApp error:', waErr.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyNewSubmission error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});