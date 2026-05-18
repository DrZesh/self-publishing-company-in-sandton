import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@3.2.0';

const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';
const BUSINESS_EMAIL = 'info@creativebooks.co.za';

function applyMergeFields(text, contact) {
  if (!text || !contact) return text || '';
  return text
    .replace(/\{first_name\}/g, contact.full_name?.split(' ')[0] || '')
    .replace(/\{full_name\}/g, contact.full_name || '')
    .replace(/\{email\}/g, contact.email || '')
    .replace(/\{phone\}/g, contact.phone || '')
    .replace(/\{book_title\}/g, contact.book_title || '')
    .replace(/\{company\}/g, contact.company || '')
    .replace(/\{quote_number\}/g, ''); // filled by caller if needed
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ── SEND EMAIL ─────────────────────────────────────────────────────────
  if (action === 'send') {
    const { contact_id, to, cc, bcc, subject, body_html, body_text, attachments, thread_id, template_id } = body;

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Build Resend payload
    const emailPayload = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: body_html,
    };
    if (cc?.length) emailPayload.cc = Array.isArray(cc) ? cc : [cc];
    if (bcc?.length) emailPayload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    if (attachments?.length) {
      emailPayload.attachments = attachments.map(a => ({ filename: a.name, path: a.url }));
    }

    const result = await resend.emails.send(emailPayload);
    const resendId = result?.data?.id || null;

    // Log to EmailMessage
    const msg = await base44.entities.EmailMessage.create({
      contact_id: contact_id || null,
      direction: 'outbound',
      from_address: BUSINESS_EMAIL,
      to_addresses: Array.isArray(to) ? to : [to],
      cc_addresses: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
      bcc_addresses: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
      subject,
      body_html,
      body_text: body_text || '',
      attachments: attachments || [],
      thread_id: thread_id || null,
      template_id: template_id || null,
      external_id: resendId,
      resend_id: resendId,
      read_status: 'read',
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return Response.json({ success: true, message: msg });
  }

  // ── LIST EMAILS FOR CONTACT ────────────────────────────────────────────
  if (action === 'list') {
    const { contact_id } = body;
    const emails = await base44.entities.EmailMessage.filter({ contact_id });
    emails.sort((a, b) => new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date));
    return Response.json({ emails });
  }

  // ── UPLOAD ATTACHMENT ──────────────────────────────────────────────────
  if (action === 'upload_attachment') {
    // Expects base64 encoded file in body.file_data, body.file_name, body.mime_type
    const { file_data, file_name, mime_type } = body;
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({
      file: `data:${mime_type};base64,${file_data}`,
    });
    return Response.json({ url: file_url, name: file_name });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
});