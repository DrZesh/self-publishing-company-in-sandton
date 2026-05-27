import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@3.2.0';

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 48; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

function parseUA(ua = '') {
  let device = 'Desktop';
  let browser = 'Unknown';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  return { device, browser };
}

async function logActivity(base44, documentId, contactId, action, extra = {}) {
  await base44.asServiceRole.entities.DocumentActivity.create({
    document_id: documentId,
    contact_id: contactId,
    action,
    timestamp: new Date().toISOString(),
    ...extra,
  });
}

function getDocEmailTemplate(doc, contact, actionUrl, origin) {
  const name = contact?.full_name || 'there';
  const category = doc.category || 'Document';

  const actionLabels = {
    'Quotation': { cta: 'View & Accept Quote', intro: 'Your quote is ready for review.' },
    'Unsigned Contract': { cta: 'View & Sign Contract', intro: 'Please review and sign your contract.' },
    'Invoice': { cta: 'View Invoice & Upload Proof', intro: 'Your invoice is ready.' },
    'Proof Approval': { cta: 'View & Approve Proof', intro: 'Your book proof is ready for approval before printing.' },
    'Final Print File': { cta: 'View Document', intro: 'Your final file is ready for download.' },
  };
  const { cta, intro } = actionLabels[category] || { cta: 'View Document', intro: 'A document has been shared with you.' };

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f7;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#1A1208 0%,#2C1E0F 100%);padding:40px;text-align:center;">
        <h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700;">Creative Books SA</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">Professional Publishing Services</p>
      </td></tr>
      <tr><td style="padding:40px;">
        <h2 style="margin:0 0 16px;color:#1A1208;font-size:22px;">Hi ${name},</h2>
        <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">${intro}</p>
        <div style="background:#faf8f4;border:1px solid rgba(184,115,51,0.2);border-radius:12px;padding:24px;margin:24px 0;">
          <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Document</div>
          <div style="font-size:18px;font-weight:600;color:#1A1208;">${doc.file_name}</div>
          <div style="font-size:13px;color:#888;margin-top:4px;">${category}${doc.book_title ? ' · ' + doc.book_title : ''}</div>
          ${doc.expires_at ? `<div style="font-size:12px;color:#e07b39;margin-top:8px;">⏱ Link expires: ${new Date(doc.expires_at).toLocaleDateString('en-ZA')}</div>` : ''}
        </div>
        <div style="text-align:center;margin:32px 0;">
          <a href="${actionUrl}" style="display:inline-block;background:linear-gradient(135deg,#B87333,#D4A574);color:#fff;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 16px rgba(184,115,51,0.3);">${cta}</a>
        </div>
        <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">
          This is a secure, time-limited link. Do not share it with others.<br/>
          Questions? Reply to this email or call 010 500 3331.
        </p>
      </td></tr>
      <tr><td style="background:#fafafa;padding:24px 40px;text-align:center;border-top:1px solid #e5e5e5;">
        <p style="margin:0;color:#999;font-size:12px;">Creative Books SA · info@creativebooks.co.za · www.creativebooks.co.za</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;
    const origin = req.headers.get('origin') || 'https://www.creativebooks.co.za';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ua = req.headers.get('user-agent') || '';
    const { device, browser } = parseUA(ua);

    // ─── SEND DOCUMENT ────────────────────────────────────────────────────────
    if (action === 'send') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, expires_days = 30 } = body;
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Document not found' }, { status: 404 });
      const doc = docs[0];

      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const contact = contacts[0];
      if (!contact?.email) return Response.json({ error: 'Contact has no email address' }, { status: 400 });

      const token = generateToken();
      const expiresAt = new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString();
      const actionUrl = `${origin}/doc/view/${doc.id}/${token}`;

      await base44.asServiceRole.entities.Document.update(document_id, {
        secure_token: token,
        expires_at: expiresAt,
        status: 'Sent to Client',
        sent_at: new Date().toISOString(),
      });

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [contact.email],
        subject: `${doc.category} — ${doc.file_name} | Creative Books SA`,
        html: getDocEmailTemplate(doc, contact, actionUrl, origin),
      });

      await logActivity(base44, document_id, doc.contact_id, 'sent', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `Sent to ${contact.email}. Expires: ${new Date(expiresAt).toLocaleDateString('en-ZA')}`,
      });

      return Response.json({ success: true, action_url: actionUrl });
    }

    // ─── RESEND ───────────────────────────────────────────────────────────────
    if (action === 'resend') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, expires_days = 30 } = body;
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Document not found' }, { status: 404 });
      const doc = docs[0];

      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const contact = contacts[0];
      if (!contact?.email) return Response.json({ error: 'Contact has no email' }, { status: 400 });

      const token = generateToken();
      const expiresAt = new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString();
      const actionUrl = `${origin}/doc/view/${doc.id}/${token}`;

      await base44.asServiceRole.entities.Document.update(document_id, {
        secure_token: token,
        expires_at: expiresAt,
        status: 'Sent to Client',
        reminder_sent_count: (doc.reminder_sent_count || 0) + 1,
        last_reminder_at: new Date().toISOString(),
      });

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [contact.email],
        subject: `Reminder: ${doc.category} — ${doc.file_name} | Creative Books SA`,
        html: getDocEmailTemplate(doc, contact, actionUrl, origin),
      });

      await logActivity(base44, document_id, doc.contact_id, 'resent', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `Resent to ${contact.email}`,
      });

      return Response.json({ success: true });
    }

    // ─── TRACK VIEW (called when client opens the secure link) ────────────────
    if (action === 'track_view') {
      const { document_id, token } = body;
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];

      if (doc.secure_token !== token) return Response.json({ error: 'Invalid or expired link' }, { status: 403 });
      if (doc.expires_at && new Date(doc.expires_at) < new Date()) {
        await base44.asServiceRole.entities.Document.update(document_id, { status: 'Expired' });
        return Response.json({ error: 'This link has expired' }, { status: 410 });
      }

      const now = new Date().toISOString();
      const isFirstOpen = doc.status === 'Sent to Client';
      const updates = {
        open_count: (doc.open_count || 0) + 1,
        opened_at: doc.opened_at || now,
        viewed_at: now,
      };
      if (isFirstOpen) updates.status = 'Opened';
      else if (doc.status === 'Opened') updates.status = 'Viewed';

      await base44.asServiceRole.entities.Document.update(document_id, updates);

      await logActivity(base44, document_id, doc.contact_id, isFirstOpen ? 'opened' : 'viewed', {
        actor_type: 'client',
        actor_ip: ip,
        actor_device: device,
        actor_browser: browser,
        actor_user_agent: ua,
      });

      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const lineItems = doc.quote_id
        ? await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id: doc.quote_id })
        : [];

      return Response.json({ success: true, doc, contact: contacts[0] || null, line_items: lineItems });
    }

    // ─── TRACK DOWNLOAD ────────────────────────────────────────────────────────
    if (action === 'track_download') {
      const { document_id, token } = body;
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];
      if (doc.secure_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });

      await base44.asServiceRole.entities.Document.update(document_id, {
        download_count: (doc.download_count || 0) + 1,
        downloaded_at: new Date().toISOString(),
        status: doc.status === 'Sent to Client' || doc.status === 'Opened' ? 'Downloaded' : doc.status,
      });

      await logActivity(base44, document_id, doc.contact_id, 'downloaded', {
        actor_type: 'client',
        actor_ip: ip,
        actor_device: device,
        actor_browser: browser,
      });

      return Response.json({ success: true });
    }

    // ─── CLIENT ACTIONS (approve, reject, sign, upload proof, request changes) ─
    if (action === 'client_action') {
      const { document_id, token, client_action, notes: clientNotes, proof_url, signature_url } = body;
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];
      if (doc.secure_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });
      if (doc.expires_at && new Date(doc.expires_at) < new Date()) return Response.json({ error: 'Link expired' }, { status: 410 });

      const now = new Date().toISOString();
      const updates = { client_message: clientNotes || '' };

      if (client_action === 'approve') {
        updates.status = 'Approved';
        updates.approved_at = now;
      } else if (client_action === 'reject') {
        updates.status = 'Rejected';
        updates.rejected_at = now;
      } else if (client_action === 'sign') {
        updates.status = 'Signed';
        updates.signed_at = now;
        if (signature_url) updates.signature_url = signature_url;
      } else if (client_action === 'upload_proof') {
        updates.status = 'Payment Proof Uploaded';
        if (proof_url) updates.proof_url = proof_url;
      } else if (client_action === 'changes_requested') {
        updates.status = 'Changes Requested';
      } else if (client_action === 'upload_signed') {
        updates.status = 'Signed';
        updates.signed_at = now;
        if (proof_url) updates.proof_url = proof_url;
      }

      await base44.asServiceRole.entities.Document.update(document_id, updates);

      const activityMap = {
        approve: 'approved', reject: 'rejected', sign: 'signed',
        upload_proof: 'payment_proof_uploaded', changes_requested: 'changes_requested',
        upload_signed: 'signed',
      };

      await logActivity(base44, document_id, doc.contact_id, activityMap[client_action] || client_action, {
        actor_type: 'client',
        actor_ip: ip,
        actor_device: device,
        actor_browser: browser,
        notes: clientNotes || '',
        metadata: proof_url ? { proof_url } : signature_url ? { signature_url } : {},
      });

      return Response.json({ success: true });
    }

    // ─── GET ACTIVITY LOG (admin) ──────────────────────────────────────────────
    if (action === 'get_activity') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id } = body;
      const activities = await base44.asServiceRole.entities.DocumentActivity.filter({ document_id });
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return Response.json({ activities });
    }

    // ─── EXTEND EXPIRY ─────────────────────────────────────────────────────────
    if (action === 'extend_expiry') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, days = 30 } = body;
      const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      await base44.asServiceRole.entities.Document.update(document_id, {
        expires_at: newExpiry,
        status: 'Sent to Client',
      });

      await logActivity(base44, document_id, null, 'sent', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `Expiry extended by ${days} days to ${new Date(newExpiry).toLocaleDateString('en-ZA')}`,
      });

      return Response.json({ success: true, new_expiry: newExpiry });
    }

    // ─── CREATE NEW VERSION ────────────────────────────────────────────────────
    if (action === 'create_version') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, new_file_url, new_file_name } = body;
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const original = docs[0];

      // Mark original as not latest
      await base44.asServiceRole.entities.Document.update(document_id, { is_latest_version: false });

      // Create new version
      const newDoc = await base44.asServiceRole.entities.Document.create({
        ...original,
        id: undefined,
        file_url: new_file_url,
        file_name: new_file_name || original.file_name,
        version: (original.version || 1) + 1,
        parent_doc_id: document_id,
        is_latest_version: true,
        status: 'Draft',
        secure_token: null,
        sent_at: null,
        opened_at: null,
        signed_at: null,
        approved_at: null,
      });

      await logActivity(base44, newDoc.id, original.contact_id, 'version_created', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `New version ${newDoc.version} created from v${original.version}`,
      });

      return Response.json({ success: true, doc: newDoc });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});