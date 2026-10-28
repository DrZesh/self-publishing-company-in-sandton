import { createClientFromRequest, serve } from '../_shared/server.ts';

const BRAND = {
  name: 'Creative Books SA',
  color: '#B87333',
  logo: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png',
  email: 'info@creativebooks.co.za',
  phone: '084 230 5393',
  address: 'Prism Office Park, Fourways, Johannesburg',
  website: 'https://www.creativebooks.co.za',
};

function buildShell(innerContent, senderName) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:${BRAND.color};padding:24px 32px;border-radius:12px 12px 0 0;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><img src="${BRAND.logo}" alt="${BRAND.name}" style="height:44px;display:block;"/></td>
    <td align="right" style="color:rgba(255,255,255,0.75);font-size:12px;">${senderName || BRAND.name}</td>
  </tr></table>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px;font-size:15px;line-height:1.7;color:#2d2d2d;">
  ${innerContent}
</td></tr>
<tr><td style="background:#1a1208;padding:24px 32px;border-radius:0 0 12px 12px;">
  <p style="margin:0 0 6px;color:rgba(255,255,255,0.9);font-size:13px;font-weight:bold;">${BRAND.name}</p>
  <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px;">${BRAND.address}</p>
  <p style="margin:0 0 10px;color:rgba(255,255,255,0.5);font-size:12px;">
    <a href="mailto:${BRAND.email}" style="color:${BRAND.color};text-decoration:none;">${BRAND.email}</a> &middot; ${BRAND.phone}
  </p>
  <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">
    You received this because you are a client of ${BRAND.name}.
    To unsubscribe <a href="{{unsubscribe_link}}" style="color:rgba(255,255,255,0.4);">click here</a>.
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function substituteVars(text, ctx) {
  if (!text) return '';
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return ctx[key] !== undefined ? ctx[key] : match;
  });
}

// Sample context for preview/test renders
function getSampleContext() {
  return {
    client_name: 'Jane Smith',
    client_email: 'jane@example.com',
    client_phone: '082 000 0000',
    book_title: 'My Amazing Book',
    project_name: 'My Amazing Book — Full Package',
    project_stage: 'Editing',
    current_status: 'Your manuscript is currently with our editor.',
    next_step: 'We will send you the edited manuscript for review within 5–7 business days.',
    required_action: 'No action required from you at this time.',
    quote_number: 'QUO-2026-0042',
    invoice_number: 'INV-2026-0042',
    amount_due: 'R 5,500.00',
    payment_status: 'Deposit Paid',
    document_title: 'Publishing Agreement',
    document_link: 'https://www.creativebooks.co.za/doc/view/...',
    approval_link: 'https://www.creativebooks.co.za/approve/...',
    invoice_link: 'https://www.creativebooks.co.za/invoice/...',
    admin_name: 'Creative Books SA',
    company_name: 'Creative Books SA',
    unsubscribe_link: '#unsubscribe',
  };
}

serve('renderTemplate', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { templateId, context, preview, testSendTo } = await req.json();
    if (!templateId) return Response.json({ error: 'templateId is required' }, { status: 400 });

    const templates = await platform.asServiceRole.entities.MessageTemplate.filter({ id: templateId });
    const template = templates[0];
    if (!template) return Response.json({ error: 'Template not found' }, { status: 404 });

    // Merge provided context with defaults; for preview use sample data
    const ctx = preview ? getSampleContext() : { ...getSampleContext(), ...(context || {}) };

    const renderedSubject = substituteVars(template.subject || '', ctx);
    const renderedInner = substituteVars(template.content_html || '', ctx);

    // Load email settings for sender name
    const settings = await platform.asServiceRole.entities.AppSettings.filter({ setting_key: 'email_settings' });
    const cfg = settings[0] || {};
    const senderName = cfg.sender_name || 'Creative Books SA';

    const renderedBody = buildShell(renderedInner, senderName);

    // If testSendTo is provided, send the email
    if (testSendTo) {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const provider = cfg.email_provider || 'resend';
      const fromEmail = cfg.sender_email || 'info@creativebooks.co.za';

      if (provider === 'resend' && resendKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: `${senderName} <${fromEmail}>`,
            to: [testSendTo],
            subject: `[TEST] ${renderedSubject || template.name}`,
            html: renderedBody,
          }),
        });
        const data = await res.json();
        if (!res.ok) return Response.json({ error: data.message || 'Send failed' }, { status: 500 });
        return Response.json({ success: true, sent_to: testSendTo, subject: renderedSubject, provider: 'resend' });
      } else {
        await platform.asServiceRole.integrations.Core.SendEmail({
          to: testSendTo,
          subject: `[TEST] ${renderedSubject || template.name}`,
          body: renderedBody,
          from_name: senderName,
        });
        return Response.json({ success: true, sent_to: testSendTo, subject: renderedSubject, provider: 'builtin' });
      }
    }

    return Response.json({
      success: true,
      template_name: template.name,
      rendered_subject: renderedSubject,
      rendered_body: renderedBody,
      rendered_inner: renderedInner,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});