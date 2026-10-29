import { serve } from '../_shared/server.ts';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';
const TO_EMAIL = 'info@creativebooks.co.za';
const TO_CC = 'draubreyzesh@gmail.com';

serve('notifyClientMessage', async (req) => {
  try {
    const body = await req.json();
    const message = body.data || {};

    // Only notify for client messages (not admin or system)
    if (message.sender_type !== 'client') {
      return Response.json({ skipped: true, reason: 'Not a client message' });
    }

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
        <h1 style="font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 6px 0;">💬 New Client Message</h1>
        <p style="font-size:15px;color:#6B6B6B;margin:0 0 24px 0;">A client has sent a new message in the portal.</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;">
          <tbody>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">From</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${message.sender_name || 'Client'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Message</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${message.message || '—'}</td>
            </tr>
            ${message.attachments && message.attachments.length > 0 ? `<tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Attachments</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${message.attachments.map(a => a.file_name).join(', ')}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Sent At</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${new Date().toLocaleString('en-ZA')}</td>
            </tr>
          </tbody>
        </table>
        <div style="text-align:center;margin-top:28px;">
          <a href="https://creative-books-sa.vercel.app/admin/chat" style="display:inline-block;background:#B87333;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">View in Chat →</a>
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
        subject: `💬 New Client Message: ${message.sender_name || 'Client'} — ${message.message?.substring(0, 50) || 'New message'}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend failed:', err);
      throw new Error(`Resend failed: ${err}`);
    }

    console.log('Client message notification sent successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyClientMessage error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});