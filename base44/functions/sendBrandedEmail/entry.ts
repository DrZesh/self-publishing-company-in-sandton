import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BRAND = {
  name: 'Creative Books SA',
  color: '#B87333',
  logo: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png',
  website: 'https://www.creativebooks.co.za',
  email: 'info@creativebooks.co.za',
  phone: '084 230 5393',
  address: 'Prism Office Park, Fourways, Johannesburg',
};

function buildBrandedHtml(innerContent, senderName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Email</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <!-- Header -->
      <tr>
        <td style="background:${BRAND.color};padding:24px 32px;border-radius:12px 12px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td><img src="${BRAND.logo}" alt="${BRAND.name}" style="height:44px;display:block;" /></td>
              <td align="right" style="color:rgba(255,255,255,0.75);font-size:12px;">${senderName || BRAND.name}</td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="background:#ffffff;padding:36px 32px;font-size:15px;line-height:1.7;color:#2d2d2d;">
          ${innerContent}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#1a1208;padding:24px 32px;border-radius:0 0 12px 12px;">
          <p style="margin:0 0 6px;color:rgba(255,255,255,0.9);font-size:13px;font-weight:bold;">${BRAND.name}</p>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px;">${BRAND.address}</p>
          <p style="margin:0 0 10px;color:rgba(255,255,255,0.5);font-size:12px;">
            <a href="mailto:${BRAND.email}" style="color:${BRAND.color};text-decoration:none;">${BRAND.email}</a> &middot; ${BRAND.phone}
          </p>
          <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">
            You received this email because you are a client of Creative Books SA.
            <br/>To unsubscribe, <a href="{{unsubscribe_link}}" style="color:rgba(255,255,255,0.4);">click here</a>.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, htmlBody, replyTo, senderName, senderEmail, skipBranding } = await req.json();

    if (!to || !subject || !htmlBody) {
      return Response.json({ error: 'to, subject, and htmlBody are required' }, { status: 400 });
    }

    // Load email settings
    const settings = await base44.asServiceRole.entities.AppSettings.filter({ setting_key: 'email_settings' });
    const cfg = settings[0] || {};
    const provider = cfg.email_provider || 'resend';
    const fromName = senderName || cfg.sender_name || BRAND.name;
    const fromEmail = senderEmail || cfg.sender_email || BRAND.email;
    const replyToEmail = replyTo || cfg.reply_to || BRAND.email;

    const finalHtml = skipBranding ? htmlBody : buildBrandedHtml(htmlBody, fromName);

    if (provider === 'resend') {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (!resendKey) return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: finalHtml,
          reply_to: replyToEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.message || 'Resend error', details: data }, { status: 500 });
      return Response.json({ success: true, provider: 'resend', id: data.id });
    } else {
      // Built-in fallback
      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject,
        body: finalHtml,
        from_name: fromName,
      });
      return Response.json({ success: true, provider: 'builtin' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});