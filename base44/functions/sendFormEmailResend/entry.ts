// Public form email function — no Base44 auth needed, calls Resend directly

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const BUSINESS_EMAIL = 'info@creativebooks.co.za';
const BUSINESS_EMAIL_CC = 'draubreyzesh@gmail.com';
const SITE_URL = 'https://creativebooks.co.za';
const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';

const BRAND_COLOR = '#B87333';
const LIGHT_COPPER = '#D4A574';
const CREAM_BG = '#FAF5EE';
const TEXT_COLOR = '#2C2C2C';
const MUTED_COLOR = '#6B6B6B';
const DIVIDER_COLOR = '#E5E0D5';
const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

function gradientBar() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="8" style="background:linear-gradient(90deg,#8B5E3C,#B87333,#D4A574,#B87333,#8B5E3C);font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function logoRow() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:32px 0 24px;">
    <img src="${LOGO_URL}" alt="Creative Books SA" width="160" style="max-width:160px;height:auto;display:block;" />
  </td></tr></table>`;
}

function footer() {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td height="1" style="background:${DIVIDER_COLOR};font-size:0;">&nbsp;</td></tr>
    <tr><td align="center" style="padding:28px 24px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:${MUTED_COLOR};line-height:1.8;">
      <strong style="color:${TEXT_COLOR};">Creative Books SA</strong><br />
      Prism Office Park, 1 Ruby Cl, Fourways, 2191<br />
      ${BUSINESS_EMAIL}<br />
      Landline: 010 500 3331 &nbsp;|&nbsp; Mobile: 084 230 5393<br />
      <span style="color:${BRAND_COLOR};font-style:italic;">#1 Self Publishing Company in South Africa &amp; Abroad</span>
    </td></tr>
    <tr><td align="center" style="padding:16px 24px 32px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#AAAAAA;line-height:1.6;">
      You're receiving this email because you submitted a form on our website.<br />We will not share your email address with third parties.
    </td></tr>
  </table>`;
}

function fieldsTable(fields) {
  const rows = fields.map(([label, value]) => {
    if (!value && value !== 0) return '';
    return `<tr>
      <td width="38%" style="padding:10px 12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:${TEXT_COLOR};vertical-align:top;border-bottom:1px solid ${DIVIDER_COLOR};">${label}</td>
      <td width="62%" style="padding:10px 12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:${TEXT_COLOR};vertical-align:top;border-bottom:1px solid ${DIVIDER_COLOR};">${String(value).replace(/\n/g, '<br/>')}</td>
    </tr>`;
  }).join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid ${DIVIDER_COLOR};">
    <tr><td style="background:${CREAM_BG};padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>
  </table>`;
}

function sectionLabel(text) {
  return `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px 0;">${text}</p>`;
}

function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" style="background:${DIVIDER_COLOR};font-size:0;margin:24px 0;">&nbsp;</td></tr></table>`;
}

function buildBusinessEmail({ formType, submitterName, submitterEmail, fields, submittedAt, pageUrl }) {
  const fieldRows = fields.filter(([, v]) => v !== '' && v !== undefined && v !== null);

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New Form Submission</title></head>
<body style="margin:0;padding:0;background:#F5F5F5;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td>${gradientBar()}</td></tr>
      <tr><td>${logoRow()}</td></tr>
      <tr><td align="center" style="padding:0 32px 8px;">
        <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:${TEXT_COLOR};margin:0 0 8px 0;">New Form Submission</h1>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${MUTED_COLOR};margin:0 0 24px 0;">A new submission has been received from your website.</p>
      </td></tr>
      <tr><td style="padding:0 32px;">
        ${divider()}
        ${sectionLabel('Form Type')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${TEXT_COLOR};margin:4px 0 24px 0;">${formType}</p>
        ${divider()}
        ${sectionLabel('Submission Details')}
        <div style="margin:12px 0 24px 0;">${fieldsTable(fieldRows)}</div>
        ${divider()}
        ${sectionLabel('Submitted At')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};margin:4px 0 16px 0;">${submittedAt}</p>
        ${sectionLabel('Page URL')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND_COLOR};margin:4px 0 24px 0;">${pageUrl}</p>
        ${divider()}
      </td></tr>
      <tr><td>${footer()}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildUserEmail({ firstName, formType, submitterEmail, fields }) {
  const fieldRows = fields.filter(([, v]) => v !== '' && v !== undefined && v !== null);
  const isNewsletter = formType === 'Newsletter Signup';

  const bodyContent = isNewsletter ? `
    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${TEXT_COLOR};line-height:1.7;margin:0 0 24px 0;">
      Welcome to the Creative Books SA community! You'll receive helpful tips, publishing guides, and resources for South African authors — straight to your inbox.
    </p>
  ` : `
    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${TEXT_COLOR};line-height:1.7;margin:0 0 24px 0;">
      Thank you for getting in touch with Creative Books SA. Your message has been received, and a member of our team will be in touch within 24 hours during business days (Monday to Friday).
    </p>
    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${TEXT_COLOR};line-height:1.7;margin:0 0 16px 0;">Here's a quick summary of what you sent us:</p>
    <div style="margin:0 0 32px 0;">
      ${sectionLabel('Your Submission')}
      ${fieldsTable(fieldRows)}
    </div>
    <h2 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND_COLOR};margin:0 0 16px 0;">What happens next?</h2>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr><td style="padding:10px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">
        <strong style="color:${BRAND_COLOR};">1.</strong>&nbsp; We'll review your enquiry within 24 hours (business days).
      </td></tr>
      <tr><td style="padding:10px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">
        <strong style="color:${BRAND_COLOR};">2.</strong>&nbsp; A member of our team will reach out via email with a personalised response.
      </td></tr>
      <tr><td style="padding:10px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">
        <strong style="color:${BRAND_COLOR};">3.</strong>&nbsp; If your enquiry is urgent, email us at <a href="mailto:${BUSINESS_EMAIL}" style="color:${BRAND_COLOR};">${BUSINESS_EMAIL}</a> directly.
      </td></tr>
    </table>
    <h2 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND_COLOR};margin:0 0 12px 0;">While you wait</h2>
    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${TEXT_COLOR};margin:0 0 16px 0;">Feel free to explore our resources for South African authors:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 8px 6px 0;">
          <a href="https://creativebooks.co.za/selfpublishingpackagesinsouthafrica" style="display:inline-block;padding:10px 18px;background:${CREAM_BG};border:1px solid ${DIVIDER_COLOR};border-radius:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Browse Publishing Packages →</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 8px 6px 0;">
          <a href="https://creativebooks.co.za/publishingguide" style="display:inline-block;padding:10px 18px;background:${CREAM_BG};border:1px solid ${DIVIDER_COLOR};border-radius:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Read the Complete Publishing Guide →</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 8px 6px 0;">
          <a href="https://creativebooks.co.za/faq" style="display:inline-block;padding:10px 18px;background:${CREAM_BG};border:1px solid ${DIVIDER_COLOR};border-radius:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND_COLOR};text-decoration:none;font-weight:600;">View Our FAQ →</a>
        </td>
      </tr>
    </table>
  `;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Thanks for reaching out</title></head>
<body style="margin:0;padding:0;background:#F5F5F5;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td>${gradientBar()}</td></tr>
      <tr><td>${logoRow()}</td></tr>
      <tr><td align="center" style="padding:0 32px 16px;">
        <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:${TEXT_COLOR};margin:0 0 8px 0;">Thanks, ${firstName}!</h1>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${MUTED_COLOR};margin:0 0 24px 0;">We've received your enquiry.</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        ${divider()}
        ${bodyContent}
        ${divider()}
      </td></tr>
      <tr><td>${footer()}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const {
      formType,
      submitterName,
      submitterEmail,
      businessSubject,
      userSubject,
      fields,
      pageUrl,
      honeypot,
      loadedAt,
    } = body;

    // Spam protection
    if (honeypot) {
      return Response.json({ success: true });
    }
    if (loadedAt && Date.now() - loadedAt < 3000) {
      return Response.json({ success: true });
    }

    // Basic validation
    if (!submitterEmail || !/\S+@\S+\.\S+/.test(submitterEmail)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (!submitterName || !formType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = submitterName.split(' ')[0] || submitterName;
    const now = new Date();
    const submittedAt = now.toLocaleString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).replace(',', ' at');

    // Build WhatsApp message (fire in parallel with emails)
    const waNumber = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
    const waApiKey = Deno.env.get('CALLMEBOT_API_KEY');
    let waPromise = Promise.resolve();
    if (waNumber && waApiKey) {
      const fieldLines = (fields || [])
        .filter(([, v]) => v !== '' && v !== undefined && v !== null)
        .map(([label, value]) => `• *${label}:* ${value}`)
        .join('\n');
      const waMessage =
        `📬 *New ${formType} — Creative Books SA*\n` +
        `🕐 ${submittedAt}\n` +
        `🌐 ${pageUrl || SITE_URL}\n\n` +
        fieldLines;
      const phone = waNumber.replace(/[^0-9]/g, '');
      waPromise = fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(waMessage)}&apikey=${waApiKey}`)
        .catch(waErr => console.error('WhatsApp notification failed:', waErr.message));
    }

    // Build email bodies
    const businessHtml = buildBusinessEmail({
      formType, submitterName, submitterEmail, fields, submittedAt,
      pageUrl: pageUrl || SITE_URL,
    });

    const userHtml = buildUserEmail({
      firstName, formType, submitterEmail, fields,
    });

    // Send via Resend in parallel with WhatsApp
    const [resendRes1, resendRes2] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [BUSINESS_EMAIL, BUSINESS_EMAIL_CC],
          subject: businessSubject || `New ${formType} from ${submitterName}`,
          html: businessHtml,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: submitterEmail,
          subject: userSubject || 'Thanks for reaching out to Creative Books SA',
          html: userHtml,
        }),
      }),
      waPromise,
    ]);

    if (!resendRes1.ok) throw new Error(`Resend business email failed: ${await resendRes1.text()}`);
    if (!resendRes2.ok) throw new Error(`Resend user email failed: ${await resendRes2.text()}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});