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
  var name = senderName || BRAND.name;
  return '<!DOCTYPE html>' +
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Email</title></head>' +
    '<body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">' +
    '<tr><td align="center" style="padding:24px 16px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td height="8" style="background:linear-gradient(90deg,#8B5E3C,#B87333,#D4A574,#B87333,#8B5E3C);font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td align="center" style="padding:32px 0 24px;">' +
    '<img src="' + BRAND.logo + '" alt="' + BRAND.name + '" width="160" style="max-width:160px;height:auto;display:block;" />' +
    '</td></tr>' +
    '<tr><td style="padding:0 32px 32px;font-size:15px;line-height:1.7;color:#2C2C2C;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '<div style="padding:24px 0;">' + innerContent + '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '</td></tr>' +
    '<tr><td align="center" style="padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8;">' +
    '<strong style="color:#2C2C2C;">' + name + '</strong><br />' +
    BRAND.address + '<br />' +
    '<a href="mailto:' + BRAND.email + '" style="color:#B87333;text-decoration:none;">' + BRAND.email + '</a> &middot; ' + BRAND.phone +
    '</td></tr>' +
    '<tr><td align="center" style="padding:12px 32px 28px;font-size:11px;color:#AAAAAA;">You received this email because you are in contact with Creative Books SA.</td></tr>' +
    '</table></td></tr></table></body></html>';
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