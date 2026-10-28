import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const BRAND = {
  name: 'Creative Books SA',
  color: '#B87333',
  logo: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png',
  website: 'https://www.creativebooks.co.za',
  email: 'info@creativebooks.co.za',
  phone: '084 230 5393',
  address: 'Prism Office Park, Fourways, Johannesburg',
};

/**
 * Master Creative Books SA branded email template.
 * Matches the screenshot: rainbow top strip, white card, logo, icon, heading, body, highlight box, footer.
 *
 * @param {object} opts
 * @param {string} opts.preheader        - Hidden preview text
 * @param {string} opts.icon             - Emoji or HTML icon (e.g. '✅', '📄', '🔑')
 * @param {string} opts.title            - Main email heading
 * @param {string} opts.greeting         - e.g. "Hi John,"
 * @param {string} opts.message          - Main body paragraphs (HTML allowed)
 * @param {string} [opts.highlightHtml]  - HTML content for the white highlight box
 * @param {string} [opts.buttonLabel]    - CTA button text
 * @param {string} [opts.buttonUrl]      - CTA button URL
 * @param {string} [opts.secondaryButtonLabel]
 * @param {string} [opts.secondaryButtonUrl]
 * @param {string} [opts.footerNote]     - Extra footer note
 * @param {string} [opts.companyName]
 * @param {string} [opts.companyEmail]
 * @param {string} [opts.logoUrl]
 * @param {string} [opts.phone]
 * @param {string} [opts.address]
 * @param {string} [opts.website]
 */
export function buildMasterEmailTemplate(opts = {}) {
  const {
    preheader = '',
    icon = '',
    title = '',
    greeting = '',
    message = '',
    highlightHtml = '',
    buttonLabel = '',
    buttonUrl = '',
    secondaryButtonLabel = '',
    secondaryButtonUrl = '',
    footerNote = '',
    companyName = BRAND.name,
    companyEmail = BRAND.email,
    logoUrl = BRAND.logo,
    phone = BRAND.phone,
    address = BRAND.address,
    website = BRAND.website,
  } = opts;

  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName}" width="160" style="max-width:160px;height:auto;display:block;margin:0 auto;" />`
    : `<span style="color:#B87333;font-size:22px;font-weight:800;letter-spacing:1px;font-family:Georgia,serif;">${companyName}</span>`;

  const iconBlock = icon
    ? `<tr><td align="center" style="padding:28px 0 8px;"><div style="display:inline-block;width:60px;height:60px;line-height:60px;text-align:center;font-size:36px;">${icon}</div></td></tr>`
    : '';

  const titleBlock = title
    ? `<tr><td align="center" style="padding:0 32px 8px;"><h1 style="margin:0;font-size:24px;font-weight:800;color:#1a202c;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">${title}</h1></td></tr>`
    : '';

  const greetingBlock = greeting
    ? `<p style="margin:0 0 14px;font-size:15px;color:#2d3748;line-height:1.6;">${greeting}</p>`
    : '';

  const messageBlock = message
    ? `<div style="font-size:15px;color:#4a5568;line-height:1.7;margin-bottom:20px;">${message}</div>`
    : '';

  const highlightBlock = highlightHtml ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr><td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <div style="font-size:14px;color:#2d3748;line-height:1.8;">${highlightHtml}</div>
      </td></tr>
    </table>` : '';

  const primaryBtn = buttonLabel && buttonUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
      <tr><td align="center">
        <a href="${buttonUrl}" style="display:inline-block;background:#B87333;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif;letter-spacing:0.3px;">
          ${buttonLabel}
        </a>
      </td></tr>
    </table>` : '';

  const secondaryBtn = secondaryButtonLabel && secondaryButtonUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
      <tr><td align="center">
        <a href="${secondaryButtonUrl}" style="display:inline-block;background:#ffffff;color:#B87333;border:2px solid #B87333;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;font-family:Helvetica,Arial,sans-serif;">
          ${secondaryButtonLabel}
        </a>
      </td></tr>
    </table>` : '';

  const footerNoteBlock = footerNote
    ? `<p style="margin:16px 0 0;font-size:12px;color:#a0aec0;text-align:center;line-height:1.6;">${footerNote}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${companyName}</title>
  <style>
    @media only screen and (max-width:600px){
      .email-container{width:100%!important;border-radius:0!important;}
      .email-body{padding:24px 16px!important;}
      .highlight-box{padding:16px!important;}
      h1{font-size:20px!important;}
      .btn-cta{padding:12px 24px!important;font-size:14px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f0f4f8;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
  <tr><td align="center">

    <!-- Rainbow bar above card -->
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px 16px 0 0;overflow:hidden;">
      <tr><td height="10" style="background:linear-gradient(90deg,#e53e3e,#ed8936,#ecc94b,#48bb78,#4299e1,#9f7aea,#ed64a6);font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- Email card -->
    <table class="email-container" width="600" cellpadding="0" cellspacing="0"
      style="max-width:600px;width:100%;background:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

      <!-- Logo area -->
      <tr><td align="center" style="padding:28px 32px 20px;background:#ffffff;">
        ${logoBlock}
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#e2e8f0;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- Icon -->
      ${iconBlock}

      <!-- Title -->
      ${titleBlock}

      <!-- Body content -->
      <tr><td class="email-body" style="padding:20px 40px 32px;">
        ${greetingBlock}
        ${messageBlock}
        ${highlightBlock}
        ${primaryBtn}
        ${secondaryBtn}
        ${footerNoteBlock}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f7fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2d3748;">${companyName}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#718096;">${address}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#718096;">
          <a href="mailto:${companyEmail}" style="color:#B87333;text-decoration:none;">${companyEmail}</a>
          &nbsp;·&nbsp;${phone}
        </p>
        <p style="margin:0;font-size:12px;"><a href="${website}" style="color:#B87333;text-decoration:none;">${website}</a></p>
        <p style="margin:10px 0 0;font-size:11px;color:#a0aec0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      </td></tr>

    </table>
    <!-- /Email card -->

  </td></tr>
</table>
</body>
</html>`;
}

serve('sendBrandedEmail', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Support two call modes:
    // 1. Legacy: { to, subject, htmlBody, skipBranding, ... }
    // 2. New master template: { to, subject, templateOpts: { icon, title, greeting, ... } }
    const { to, subject, htmlBody, skipBranding, replyTo, senderName, senderEmail, templateOpts } = body;

    if (!to || !subject) {
      return Response.json({ error: 'to and subject are required' }, { status: 400 });
    }

    // Load company settings
    const [settingsArr, companyArr] = await Promise.all([
      platform.asServiceRole.entities.AppSettings.filter({ setting_key: 'email_settings' }),
      platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' }),
    ]);
    const cfg = settingsArr[0] || {};
    const company = companyArr[0] || {};
    const fromName = senderName || cfg.sender_name || company.company_name || BRAND.name;
    const fromEmail = senderEmail || cfg.sender_email || company.email || BRAND.email;
    const replyToEmail = replyTo || cfg.reply_to || fromEmail;

    let finalHtml;
    if (templateOpts) {
      // Use master template with company branding injected
      finalHtml = buildMasterEmailTemplate({
        ...templateOpts,
        companyName: company.company_name || BRAND.name,
        companyEmail: company.email || BRAND.email,
        logoUrl: company.logo_url || BRAND.logo,
        phone: company.phone || BRAND.phone,
        address: company.physical_address || BRAND.address,
        website: company.website_url || BRAND.website,
      });
    } else if (skipBranding) {
      finalHtml = htmlBody;
    } else {
      // Legacy: wrap provided htmlBody in master template
      finalHtml = buildMasterEmailTemplate({
        message: htmlBody || '',
        companyName: company.company_name || BRAND.name,
        companyEmail: company.email || BRAND.email,
        logoUrl: company.logo_url || BRAND.logo,
        phone: company.phone || BRAND.phone,
        address: company.physical_address || BRAND.address,
        website: company.website_url || BRAND.website,
      });
    }

    const provider = cfg.email_provider || 'resend';

    if (provider === 'resend') {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (!resendKey) return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });

      const resend = new Resend(resendKey);
      const res = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: finalHtml,
        reply_to: replyToEmail,
      });
      if (res.error) return Response.json({ error: res.error.message, details: res.error }, { status: 500 });
      return Response.json({ success: true, provider: 'resend', id: res.data?.id });
    } else {
      await platform.asServiceRole.integrations.Core.SendEmail({
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