const BUSINESS_EMAIL = 'info@creativebooks.co.za';
const SITE_URL = 'https://creative-books-sa.vercel.app';
export function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
const BRAND_COLOR = '#B87333';
const LIGHT_COPPER = '#D4A574';
const CREAM_BG = '#FAF5EE';
const TEXT_COLOR = '#2C2C2C';
const MUTED_COLOR = '#6B6B6B';
const DIVIDER_COLOR = '#E5E0D5';
const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

function gradientBar() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
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
      You're receiving this email about a request submitted to Creative Books SA.
    </td></tr>
  </table>`;
}

function fieldsTable(fields) {
  const rows = fields.map(([label, value]) => {
    if (!value && value !== 0) return '';
    return `<tr>
      <td width="38%" style="padding:10px 12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:${TEXT_COLOR};vertical-align:top;word-break:break-word;border-bottom:1px solid ${DIVIDER_COLOR};">${escapeHtml(label)}</td>
      <td width="62%" style="padding:10px 12px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:${TEXT_COLOR};vertical-align:top;word-break:break-word;border-bottom:1px solid ${DIVIDER_COLOR};">${escapeHtml(value).replace(/\n/g, '<br/>')}</td>
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

function buildBusinessEmail({ formType, submitterName, submitterEmail, fields, submittedAt, pageUrl, dashboardUrl, heading = 'New Form Submission' }) {
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
        <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:${TEXT_COLOR};margin:0 0 8px 0;">${escapeHtml(heading)}</h1>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${MUTED_COLOR};margin:0 0 24px 0;">A new submission has been received from your website.</p>
      </td></tr>
      <tr><td style="padding:0 32px;">
        ${divider()}
        ${sectionLabel('Form Type')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${TEXT_COLOR};margin:4px 0 24px 0;">${escapeHtml(formType)}</p>
        ${divider()}
        ${sectionLabel('Submission Details')}
        <div style="margin:12px 0 24px 0;">${fieldsTable(fieldRows)}</div>
        ${divider()}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 28px;"><a href="${dashboardUrl}" style="display:inline-block;background:#B87333;color:#FFFFFF;padding:14px 28px;border-radius:8px;font-family:Helvetica,Arial,sans-serif;font-weight:700;text-decoration:none;">View in Dashboard &rarr;</a></td></tr></table>
        ${sectionLabel('Submitted At')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};margin:4px 0 16px 0;">${escapeHtml(submittedAt)}</p>
        ${sectionLabel('Page URL')}
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${BRAND_COLOR};margin:4px 0 24px 0;">${escapeHtml(pageUrl)}</p>
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
  const booking = formType === 'Booking Request';

  const bodyContent = isNewsletter ? `
    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${TEXT_COLOR};line-height:1.7;margin:0 0 24px 0;">
      Welcome to the Creative Books SA community! You'll receive helpful tips, publishing guides, and resources for South African authors — straight to your inbox.
    </p>
  ` : `
    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${TEXT_COLOR};line-height:1.7;margin:0 0 24px 0;">
      Thank you for getting in touch with Creative Books SA. ${booking ? 'Your booking request has been saved for review. This receipt does not confirm your appointment.' : 'Your enquiry has been saved for our team to review.'}
    </p>
    <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${TEXT_COLOR};line-height:1.7;margin:0 0 16px 0;">Here's a quick summary of what you sent us:</p>
    <div style="margin:0 0 32px 0;">
      ${sectionLabel('Your Submission')}
      ${fieldsTable(fieldRows)}
    </div>
    <h2 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:${BRAND_COLOR};margin:0 0 16px 0;">What happens next?</h2>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr><td style="padding:10px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};line-height:1.6;">
        <strong style="color:${BRAND_COLOR};">1.</strong>&nbsp; We'll review your ${booking ? 'booking request' : 'enquiry'} during business hours.
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
          <a href="https://creative-books-sa.vercel.app/self-publishing-packages-in-south-africa" style="display:inline-block;padding:10px 18px;background:${CREAM_BG};border:1px solid ${DIVIDER_COLOR};border-radius:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Browse Publishing Packages →</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 8px 6px 0;">
          <a href="https://creative-books-sa.vercel.app/publishingguide" style="display:inline-block;padding:10px 18px;background:${CREAM_BG};border:1px solid ${DIVIDER_COLOR};border-radius:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND_COLOR};text-decoration:none;font-weight:600;">Read the Complete Publishing Guide →</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 8px 6px 0;">
          <a href="https://creative-books-sa.vercel.app/faq" style="display:inline-block;padding:10px 18px;background:${CREAM_BG};border:1px solid ${DIVIDER_COLOR};border-radius:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:${BRAND_COLOR};text-decoration:none;font-weight:600;">View Our FAQ →</a>
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
        <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:${TEXT_COLOR};margin:0 0 8px 0;">Thanks, ${escapeHtml(firstName)}!</h1>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;color:${MUTED_COLOR};margin:0 0 24px 0;">We've received your ${booking ? 'booking request' : 'enquiry'}.</p>
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


const FORM_LABELS = { contact: 'Contact Form', quote: 'Quote Request', calculator_estimate: 'Calculator Estimate' };
const FIELD_LABELS = { address:'Address', bookSize:'Book Size', coverType:'Cover Type', printCopies:'Print Copies', paperType:'Paper Type', coverFinish:'Cover Finish', typesettingType:'Typesetting', editingWordCount:'Editing Word Count', startDate:'Start Date', howFound:'How You Found Us', notes:'Additional Notes', estimatedTotal:'Estimated Total', quoteNumber:'Quote Reference', chosenPath:'Selected Package', howHelp:'How We Can Help', contactTime:'Contact Preference', subject:'Subject', projectType:'Project Type', stage:'Manuscript Stage', pages:'Page Count', words:'Word Count', mode:'Preference', breakdown:'Estimate Breakdown' };
function readable(value) { if (Array.isArray(value)) return value.map(readable).join(', '); if(value && typeof value === 'object') return Object.entries(value).map(([key,v])=>`${FIELD_LABELS[key] || key}: ${readable(v)}`).join('\n'); return String(value ?? '').slice(0,16000); }
export function brandedNotificationHtml(kind, record) {
 const booking = kind === 'booking';
 const formType = booking ? 'Booking Request' : FORM_LABELS[record.form_type] || 'Website Enquiry';
 const fields = booking ? [ ['Full Name',record.client_name],['Email Address',record.client_email],['Phone Number',record.client_phone],['Service',record.service_name],['Date',record.date],['Time',record.start_time],['Format',record.mode === 'on_site' ? 'On-site' : record.mode === 'zoom' ? 'Zoom' : record.mode],['Note',record.client_note],['Status','Pending review'] ] : [ ['Full Name',record.full_name],['Email Address',record.email],['Phone Number',record.phone],['Services',readable(record.service_interest)],['Message',record.message],['Book Title',record.book_title],['Genre',record.book_genre],['Number of Pages',record.book_page_count],['Word Count',record.book_word_count],...Object.entries(record.additional_fields || {}).filter(([key])=> !['__proto__','constructor','prototype'].includes(key)).map(([key,value])=>[FIELD_LABELS[key] || key.replace(/([a-z])([A-Z])/g,'$1 $2'),readable(value)]) ];
 fields.push(['Reference',record.id]);
 const submittedAt = record.created_date ? new Date(record.created_date).toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg'}) + ' SAST' : 'Just received';
 return {
  business: buildBusinessEmail({ formType, fields, submittedAt, pageUrl: SITE_URL + (booking ? '/book' : '/getquote'), dashboardUrl: SITE_URL + (booking ? '/admin/appointments' : '/admin/submissions'), heading: booking ? 'New Booking Request' : 'New Form Submission' }),
  receipt: buildUserEmail({ firstName: String((booking ? record.client_name : record.full_name) || 'there').trim().split(/\s+/)[0].slice(0,60), formType, fields: [['Request Type',formType],['Reference',record.id],...(booking ? [['Status','Pending review, not yet confirmed']] : [])] }),
 };
}
