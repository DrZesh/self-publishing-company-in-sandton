import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ============================================================
// ADMIN EMAIL RECIPIENTS
// To add a second admin email, add it to this array:
// ============================================================
const ADMIN_EMAILS = [
  'info@creativebooks.co.za',
  // '[SECOND_ADMIN_EMAIL_HERE]'  <-- Add second admin email here
];

const BRAND_COLOR = '#B87333';
const CREAM_BG = '#FAF5EE';
const TEXT_COLOR = '#2C2C2C';
const MUTED_COLOR = '#6B6B6B';
const DIVIDER = '#E5E0D5';
const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';
const SITE_URL = 'https://www.creativebooks.co.za';

function bar() {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="5" style="background:linear-gradient(90deg,${BRAND_COLOR},#D4A574);font-size:0;">&nbsp;</td></tr></table>`;
}
function logoRow() {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 0 20px;"><img src="${LOGO_URL}" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;" /></td></tr></table>`;
}
function footer() {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:${DIVIDER};">&nbsp;</td></tr><tr><td align="center" style="padding:24px;font-family:sans-serif;font-size:13px;color:${MUTED_COLOR};line-height:1.8;">
    <strong style="color:${TEXT_COLOR};">Creative Books SA</strong><br/>
    010 500 3331 &nbsp;|&nbsp; 084 230 5393<br/>
    info@creativebooks.co.za &nbsp;|&nbsp; www.creativebooks.co.za<br/>
    Prism Office Park, 1 Ruby Cl, Fourways, 2191
  </td></tr></table>`;
}

function row(label, value) {
  return `<tr><td style="padding:8px 12px;font-family:sans-serif;font-size:14px;font-weight:600;color:${TEXT_COLOR};width:38%;border-bottom:1px solid ${DIVIDER};">${label}</td><td style="padding:8px 12px;font-family:sans-serif;font-size:14px;color:${MUTED_COLOR};border-bottom:1px solid ${DIVIDER};">${value || '–'}</td></tr>`;
}

const PROJECT_LABELS = { adult_fiction:'Adult Fiction', adult_nonfiction:'Adult Non-Fiction', memoir:'Memoir/Biography', poetry:'Poetry', academic:'Academic/Educational', childrens:"Children's Book", christian:'Christian/Spiritual', other:'Other' };
const STAGE_LABELS = { idea:'Just an idea', in_progress:'Writing in progress', first_draft:'First draft complete', already_edited:'Already edited', fully_designed:'Fully designed', ebook_only_ready:'Ebook only' };
const TIMELINE_LABELS = { asap:'ASAP (fast-track)', '2_3_months':'Within 2–3 months', '3_6_months':'Within 3–6 months', '6_plus':'6 months or longer', exploring:'Just exploring' };

function buildUserEmail({ clientInfo, breakdown, total, quoteNumber, answers, chosenPath, pathA, pathATotal, pathBTotal }) {
  const firstName = clientInfo.name.split(' ')[0];
  const deposit = Math.round(total * 0.75);
  const balance = total - deposit;
  const validUntil = new Date(Date.now() + 30*24*3600*1000).toLocaleDateString('en-ZA');

  const lineRows = (breakdown || []).map(l =>
    `<tr><td style="padding:8px 12px;font-size:14px;font-family:sans-serif;color:${TEXT_COLOR};border-bottom:1px solid ${DIVIDER};">${l.label}</td><td style="padding:8px 12px;font-size:13px;color:${MUTED_COLOR};border-bottom:1px solid ${DIVIDER};">${l.sub||''}</td><td style="padding:8px 12px;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid ${DIVIDER};color:${BRAND_COLOR};">${l.custom ? 'Custom Quote' : 'R'+Math.round(l.amount||0).toLocaleString()}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td>${bar()}</td></tr>
  <tr><td>${logoRow()}</td></tr>
  <tr><td style="padding:0 32px 8px;text-align:center;">
    <h1 style="font-family:sans-serif;font-size:26px;font-weight:700;color:${TEXT_COLOR};margin:0 0 8px;">Hi ${firstName}, here's your quote</h1>
    <p style="font-family:sans-serif;font-size:15px;color:${MUTED_COLOR};margin:0 0 24px;">Your publishing estimate is below. Valid for 30 days from today.</p>
  </td></tr>
  <tr><td style="padding:0 32px;">
    <p style="font-family:sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Quote Reference</p>
    <p style="font-family:monospace;font-size:18px;font-weight:700;color:${TEXT_COLOR};margin:0 0 24px;">${quoteNumber}</p>
    
    ${answers ? `
    <p style="font-family:sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Your Book Project</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid ${DIVIDER};margin-bottom:24px;">
      ${row('Book Type', PROJECT_LABELS[answers.projectType] || answers.projectType)}
      ${row('Stage', STAGE_LABELS[answers.stage] || answers.stage)}
      ${row('Length', `${answers.pages} pages / ${(answers.words||0).toLocaleString()} words`)}
      ${row('Book Size', answers.bookSize?.toUpperCase() || '–')}
      ${row('Timeline', TIMELINE_LABELS[answers.timeline] || answers.timeline)}
    </table>
    ` : ''}

    <p style="font-family:sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Selected Option: ${chosenPath === 'A' && pathA ? pathA.label : 'À La Carte'}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid ${DIVIDER};margin-bottom:24px;">
      <tr style="background:${CREAM_BG};"><th style="padding:10px 12px;font-family:sans-serif;font-size:12px;text-align:left;color:${MUTED_COLOR};">Service</th><th style="padding:10px 12px;font-family:sans-serif;font-size:12px;text-align:left;color:${MUTED_COLOR};">Details</th><th style="padding:10px 12px;font-family:sans-serif;font-size:12px;text-align:right;color:${MUTED_COLOR};">Price</th></tr>
      ${chosenPath === 'A' && pathA ? `<tr><td colspan="2" style="padding:12px;font-family:sans-serif;font-size:14px;color:${TEXT_COLOR};">${pathA.label} — Complete publishing package</td><td style="padding:12px;font-family:sans-serif;font-size:14px;font-weight:700;text-align:right;color:${BRAND_COLOR};">R${Math.round(pathATotal||0).toLocaleString()}</td></tr>` : lineRows}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:12px 16px;background:${CREAM_BG};border-radius:12px;">
        <div style="display:flex;justify-content:space-between;font-family:sans-serif;font-size:22px;font-weight:700;color:${BRAND_COLOR};">TOTAL: R${Math.round(total).toLocaleString()}</div>
        <div style="font-family:sans-serif;font-size:13px;color:${MUTED_COLOR};margin-top:8px;">75% deposit to start: <strong>R${deposit.toLocaleString()}</strong> &nbsp;·&nbsp; 25% on completion: <strong>R${balance.toLocaleString()}</strong></div>
        <div style="font-family:sans-serif;font-size:12px;color:${MUTED_COLOR};margin-top:4px;">Valid until: ${validUntil}</div>
      </td></tr>
    </table>

    <p style="font-family:sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">What Happens Next?</p>
    <ol style="font-family:sans-serif;font-size:14px;color:${TEXT_COLOR};line-height:1.8;margin:0 0 24px;padding-left:20px;">
      <li>Our team reviews your selections and sends a refined formal quote within 24 hours.</li>
      <li>You confirm and pay the 75% deposit to secure your project slot.</li>
      <li>We kick off your project with our team.</li>
      <li>You receive your completed book within the estimated timeline.</li>
    </ol>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center" style="padding:16px;background:${BRAND_COLOR};border-radius:12px;">
        <a href="mailto:info@creativebooks.co.za?subject=Re: My Quote ${quoteNumber} — R${Math.round(total).toLocaleString()}" style="font-family:sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">📧 Reply to discuss this quote →</a>
      </td></tr>
    </table>

    <p style="font-family:sans-serif;font-size:12px;color:${MUTED_COLOR};margin:0 0 32px;">Estimate valid for 30 days. Final pricing confirmed after consultation. All prices in ZAR.</p>
  </td></tr>
  <tr><td>${footer()}</td></tr>
</table></td></tr></table></body></html>`;
}

function buildAdminEmail({ clientInfo, breakdown, total, quoteNumber, answers, chosenPath, pathA, pathATotal, pathBTotal }) {
  const deposit = Math.round(total * 0.75);
  const replySubject = encodeURIComponent(`Re: Your Creative Books Quote ${quoteNumber} — R${Math.round(total).toLocaleString()}`);
  const replyBody = encodeURIComponent(`Hi ${clientInfo.name.split(' ')[0]},\n\nThanks for using our calculator. I've reviewed your selections — here's a refined quote:\n\n[REFINED QUOTE DETAILS]\n\nOriginal estimate: R${Math.round(total).toLocaleString()}\nQuote ref: ${quoteNumber}\n\nLooking forward to working with you.\n\nBest regards,\n[Your Name]\nCreative Books SA\n010 500 3331`);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td>${bar()}</td></tr>
  <tr><td>${logoRow()}</td></tr>
  <tr><td style="padding:0 32px 8px;text-align:center;">
    <h1 style="font-family:sans-serif;font-size:24px;font-weight:700;color:${TEXT_COLOR};margin:0 0 8px;">🔔 New Quote Submitted</h1>
    <p style="font-family:sans-serif;font-size:14px;color:${MUTED_COLOR};margin:0 0 20px;">${clientInfo.name} just generated an estimate via the calculator.</p>
  </td></tr>
  <tr><td style="padding:0 32px;">

    <!-- Reply CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${BRAND_COLOR};border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px;text-align:center;">
        <div style="font-family:sans-serif;font-size:13px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">📤 REPLY TO AUTHOR</div>
        <div style="font-family:sans-serif;font-size:13px;color:${MUTED_COLOR};margin-bottom:16px;">The author has received an automated quote. Send a personalised follow-up.</div>
        <a href="mailto:${clientInfo.email}?subject=${replySubject}&body=${replyBody}" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:#FFFFFF;font-family:sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:50px;">Reply to ${clientInfo.name.split(' ')[0]} →</a>
      </td></tr>
    </table>

    <p style="font-family:sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Client Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid ${DIVIDER};margin-bottom:24px;">
      ${row('Name', clientInfo.name)}
      ${row('Email', `<a href="mailto:${clientInfo.email}" style="color:${BRAND_COLOR};">${clientInfo.email}</a>`)}
      ${row('Phone', clientInfo.phone ? `<a href="tel:${clientInfo.phone}">${clientInfo.phone}</a>` : 'Not provided')}
      ${row('How we can help', clientInfo.howHelp || '–')}
      ${row('Contact preference', clientInfo.contactTime || '–')}
      ${row('Submitted', new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }))}
    </table>

    ${answers ? `
    <p style="font-family:sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Book Project Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid ${DIVIDER};margin-bottom:24px;">
      ${row('Project type', PROJECT_LABELS[answers.projectType] || answers.projectType)}
      ${row('Stage', STAGE_LABELS[answers.stage] || answers.stage)}
      ${row('Length', `${answers.pages} pages / ${(answers.words||0).toLocaleString()} words`)}
      ${row('Book size', answers.bookSize?.toUpperCase() || '–')}
      ${row('Copies', answers.copies || '–')}
      ${row('Editing', answers.editingType || (answers.ghostwriting ? 'Ghostwriting' : '–'))}
      ${row('Cover', answers.coverTier || '–')}
      ${row('Layout', answers.layoutTier || '–')}
      ${row('Ebook', answers.wantEbook ? 'Yes' : 'No')}
      ${row('Extras', (answers.extras||[]).join(', ') || 'None')}
      ${row('Timeline', TIMELINE_LABELS[answers.timeline] || answers.timeline)}
      ${row('Priorities', (answers.priorities||[]).join(', ') || '–')}
      ${answers.notes ? row('Notes', answers.notes) : ''}
    </table>
    ` : ''}

    <p style="font-family:sans-serif;font-size:11px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Quote Comparison</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid ${DIVIDER};margin-bottom:24px;">
      ${pathA ? row('Option A (Package)', `${pathA.label} — R${Math.round(pathATotal||0).toLocaleString()}`) : row('Option A', 'No package fit')}
      ${row('Option B (À La Carte)', `R${Math.round(pathBTotal||0).toLocaleString()}`)}
      ${row('USER CHOSE', `${chosenPath === 'A' ? 'Package' : chosenPath === 'B' ? 'À La Carte' : 'Custom Quote'} — R${Math.round(total).toLocaleString()}`)}
      ${row('75% Deposit', `R${deposit.toLocaleString()}`)}
    </table>

  </td></tr>
  <tr><td>${footer()}</td></tr>
</table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { clientInfo, breakdown, total, quoteNumber, answers, chosenPath, pathA, pathATotal, pathBTotal } = body;

    if (!clientInfo?.email || !clientInfo?.name || !total || !quoteNumber) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = clientInfo.name.split(' ')[0];
    const userHtml = buildUserEmail({ clientInfo, breakdown, total, quoteNumber, answers, chosenPath, pathA, pathATotal, pathBTotal });
    const adminHtml = buildAdminEmail({ clientInfo, breakdown, total, quoteNumber, answers, chosenPath, pathA, pathATotal, pathBTotal });

    // User email
    const r1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: clientInfo.email,
        subject: `Your Creative Books SA Quote — R${Math.round(total).toLocaleString()}`,
        html: userHtml,
      }),
    });
    if (!r1.ok) throw new Error(`User email failed: ${await r1.text()}`);

    // Admin emails
    for (const adminEmail of ADMIN_EMAILS) {
      const r2 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Creative Books SA <info@creativebooks.co.za>',
          to: adminEmail,
          'reply_to': clientInfo.email,
          subject: `🔔 New Quote — ${clientInfo.name} — R${Math.round(total).toLocaleString()}`,
          html: adminHtml,
        }),
      });
      if (!r2.ok) console.error(`Admin email to ${adminEmail} failed: ${await r2.text()}`);
    }

    return Response.json({ success: true, quoteNumber });
  } catch (error) {
    console.error('sendEstimateNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});