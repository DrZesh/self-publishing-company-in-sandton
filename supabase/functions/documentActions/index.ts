import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';
import { jsPDF } from 'npm:jspdf@4.0.0';

function generateToken() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
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

async function logActivity(platform, documentId, contactId, action, extra = {}) {
  await platform.asServiceRole.entities.DocumentActivity.create({
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

serve('documentActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;
    const origin = req.headers.get('origin') || 'https://www.creativebooks.co.za';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ua = req.headers.get('user-agent') || '';
    const { device, browser } = parseUA(ua);

    // ─── SEND DOCUMENT ────────────────────────────────────────────────────────
    if (action === 'send') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, expires_days = 30 } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Document not found' }, { status: 404 });
      const doc = docs[0];

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const contact = contacts[0];
      if (!contact?.email) return Response.json({ error: 'Contact has no email address' }, { status: 400 });

      const token = generateToken();
      const expiresAt = new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString();
      const actionUrl = `${origin}/doc/view/${doc.id}/${token}`;

      await platform.asServiceRole.entities.Document.update(document_id, {
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

      await logActivity(platform, document_id, doc.contact_id, 'sent', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `Sent to ${contact.email}. Expires: ${new Date(expiresAt).toLocaleDateString('en-ZA')}`,
      });

      return Response.json({ success: true, action_url: actionUrl });
    }

    // ─── RESEND ───────────────────────────────────────────────────────────────
    if (action === 'resend') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, expires_days = 30 } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Document not found' }, { status: 404 });
      const doc = docs[0];

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const contact = contacts[0];
      if (!contact?.email) return Response.json({ error: 'Contact has no email' }, { status: 400 });

      const token = generateToken();
      const expiresAt = new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString();
      const actionUrl = `${origin}/doc/view/${doc.id}/${token}`;

      await platform.asServiceRole.entities.Document.update(document_id, {
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

      await logActivity(platform, document_id, doc.contact_id, 'resent', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `Resent to ${contact.email}`,
      });

      return Response.json({ success: true });
    }

    // ─── TRACK VIEW (called when client opens the secure link) ────────────────
    if (action === 'track_view') {
      const { document_id, token } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];

      if (doc.secure_token !== token) return Response.json({ error: 'Invalid or expired link' }, { status: 403 });
      if (doc.expires_at && new Date(doc.expires_at) < new Date()) {
        await platform.asServiceRole.entities.Document.update(document_id, { status: 'Expired' });
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

      await platform.asServiceRole.entities.Document.update(document_id, updates);

      await logActivity(platform, document_id, doc.contact_id, isFirstOpen ? 'opened' : 'viewed', {
        actor_type: 'client',
        actor_ip: ip,
        actor_device: device,
        actor_browser: browser,
        actor_user_agent: ua,
      });

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const lineItems = doc.quote_id
        ? await platform.asServiceRole.entities.QuoteLineItem.filter({ quote_id: doc.quote_id })
        : [];

      return Response.json({ success: true, doc, contact: contacts[0] || null, line_items: lineItems });
    }

    // ─── TRACK DOWNLOAD ────────────────────────────────────────────────────────
    if (action === 'track_download') {
      const { document_id, token } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];
      if (doc.secure_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });

      await platform.asServiceRole.entities.Document.update(document_id, {
        download_count: (doc.download_count || 0) + 1,
        downloaded_at: new Date().toISOString(),
        status: doc.status === 'Sent to Client' || doc.status === 'Opened' ? 'Downloaded' : doc.status,
      });

      await logActivity(platform, document_id, doc.contact_id, 'downloaded', {
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
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
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

      await platform.asServiceRole.entities.Document.update(document_id, updates);

      // ─── AUTOMATIC WORKFLOW TRIGGERS ─────────────────────────────────────────
      try {
        // Quote accepted → update Quote entity status
        if (doc.category === 'Quotation' && client_action === 'approve') {
          if (doc.quote_id) {
            await platform.asServiceRole.entities.Quote.update(doc.quote_id, {
              status: 'Accepted',
              accepted_at: new Date().toISOString(),
            });
          }
          // Update contact pipeline stage
          if (doc.contact_id) {
            await platform.asServiceRole.entities.Contact.update(doc.contact_id, {
              pipeline_stage: 'Payment Pending',
            });
          }
        }
        // Quote declined → update Quote entity status
        if (doc.category === 'Quotation' && client_action === 'reject') {
          if (doc.quote_id) {
            await platform.asServiceRole.entities.Quote.update(doc.quote_id, {
              status: 'Declined',
              declined_at: new Date().toISOString(),
              declined_reason: clientNotes || '',
            });
          }
        }
        // Contract signed → update Project contract_status
        if (['Unsigned Contract'].includes(doc.category) && ['sign', 'upload_signed'].includes(client_action)) {
          if (doc.project_id) {
            await platform.asServiceRole.entities.Project.update(doc.project_id, {
              contract_status: 'Signed',
            });
          }
        }
        // NDA signed → trigger full NDA signed workflow
        if (doc.category === 'NDA' && ['sign', 'upload_signed'].includes(client_action)) {
          // Fire-and-forget: don't await so client response isn't delayed
          platform.asServiceRole.functions.invoke('onNdaSigned', { document_id }).catch(err => {
            console.error('onNdaSigned trigger failed (non-fatal):', err.message);
          });
        }
        // Proof approved → update Project stage to Final Approval Received
        if (doc.category === 'Proof Approval' && client_action === 'approve') {
          if (doc.project_id) {
            await platform.asServiceRole.entities.Project.update(doc.project_id, {
              stage: 'Final Approval Received',
              stage_changed_at: new Date().toISOString(),
            });
          }
        }
      } catch (wfErr) {
        console.error('Workflow trigger error (non-fatal):', wfErr.message);
      }

      const activityMap = {
        approve: 'approved', reject: 'rejected', sign: 'signed',
        upload_proof: 'payment_proof_uploaded', changes_requested: 'changes_requested',
        upload_signed: 'signed',
      };

      await logActivity(platform, document_id, doc.contact_id, activityMap[client_action] || client_action, {
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
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id } = body;
      const activities = await platform.asServiceRole.entities.DocumentActivity.filter({ document_id });
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return Response.json({ activities });
    }

    // ─── EXTEND EXPIRY ─────────────────────────────────────────────────────────
    if (action === 'extend_expiry') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, days = 30 } = body;
      const newExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      await platform.asServiceRole.entities.Document.update(document_id, {
        expires_at: newExpiry,
        status: 'Sent to Client',
      });

      await logActivity(platform, document_id, null, 'sent', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `Expiry extended by ${days} days to ${new Date(newExpiry).toLocaleDateString('en-ZA')}`,
      });

      return Response.json({ success: true, new_expiry: newExpiry });
    }

    // ─── CREATE NEW VERSION ────────────────────────────────────────────────────
    if (action === 'create_version') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, new_file_url, new_file_name } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const original = docs[0];

      // Mark original as not latest
      await platform.asServiceRole.entities.Document.update(document_id, { is_latest_version: false });

      // Create new version
      const newDoc = await platform.asServiceRole.entities.Document.create({
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

      await logActivity(platform, newDoc.id, original.contact_id, 'version_created', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `New version ${newDoc.version} created from v${original.version}`,
      });

      return Response.json({ success: true, doc: newDoc });
    }

    // ─── VERIFY PAYMENT PROOF (admin only) ─────────────────────────────────────
    if (action === 'verify_payment') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id, verified, rejection_reason, amount_confirmed } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];

      const newStatus = verified ? 'Approved' : 'Rejected';
      await platform.asServiceRole.entities.Document.update(document_id, {
        status: newStatus,
        approved_at: verified ? new Date().toISOString() : null,
        rejected_at: !verified ? new Date().toISOString() : null,
        internal_notes: rejection_reason || doc.internal_notes,
      });

      // Update linked invoice
      if (doc.invoice_id && verified) {
        const invs = await platform.asServiceRole.entities.Invoice.filter({ id: doc.invoice_id });
        if (invs.length) {
          const inv = invs[0];
          const amountPaid = (inv.amount_paid || 0) + (amount_confirmed || 0);
          const balanceDue = Math.max(0, (inv.total || 0) - amountPaid);
          const invStatus = balanceDue <= 0 ? 'Paid' : 'Partially Paid';
          await platform.asServiceRole.entities.Invoice.update(doc.invoice_id, {
            status: invStatus,
            amount_paid: amountPaid,
            balance_due: balanceDue,
            paid_at: invStatus === 'Paid' ? new Date().toISOString() : null,
          });
        }
      }

      await platform.asServiceRole.entities.DocumentActivity.create({
        document_id,
        contact_id: doc.contact_id,
        action: verified ? 'approved' : 'rejected',
        actor_type: 'admin',
        actor_email: user.email,
        notes: verified ? `Payment verified by admin. Amount confirmed: R${amount_confirmed || 0}` : `Payment rejected: ${rejection_reason}`,
        timestamp: new Date().toISOString(),
      });

      return Response.json({ success: true, status: newStatus });
    }

    // ─── GENERATE APPROVAL CERTIFICATE ────────────────────────────────────────
    if (action === 'generate_certificate') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];

      const contacts = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      const contactList = await platform.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const contact = contactList[0];

      const activities = await platform.asServiceRole.entities.DocumentActivity.filter({ document_id });
      const approvalActivity = activities.find(a => a.action === 'approved');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Background
      pdf.setFillColor(26, 18, 8);
      pdf.rect(0, 0, 210, 50, 'F');
      pdf.setFillColor(184, 115, 51);
      pdf.rect(0, 48, 210, 3, 'F');

      // Header
      pdf.setTextColor(184, 115, 51);
      pdf.setFontSize(20);
      pdf.text('CREATIVE BOOKS SA', 15, 20);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text('APPROVAL CERTIFICATE', 15, 30);
      pdf.setFontSize(9);
      pdf.text('This document certifies that the following approval was given electronically.', 15, 38);

      // Certificate number top right
      pdf.setTextColor(184, 115, 51);
      pdf.setFontSize(18);
      pdf.text('CERT', 195, 20, { align: 'right' });
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(new Date().getFullYear().toString(), 195, 28, { align: 'right' });

      // Body
      const fields = [
        { label: 'Client Name', value: contact?.full_name || 'N/A' },
        { label: 'Client Email', value: contact?.email || 'N/A' },
        { label: 'Book Title', value: doc.book_title || 'N/A' },
        { label: 'Document', value: doc.file_name },
        { label: 'Document Type', value: doc.category },
        { label: 'Version', value: `v${doc.version || 1}` },
        { label: 'Approval Date', value: doc.approved_at ? new Date(doc.approved_at).toLocaleString('en-ZA') : new Date().toLocaleString('en-ZA') },
        { label: 'Client IP Address', value: approvalActivity?.actor_ip || 'Not recorded' },
        { label: 'Device', value: approvalActivity?.actor_device || 'Not recorded' },
        { label: 'Approved By Admin', value: user.email },
      ];

      let y = 70;
      fields.forEach(({ label, value }) => {
        pdf.setFillColor(250, 248, 244);
        pdf.roundedRect(15, y - 5, 180, 12, 2, 2, 'F');
        pdf.setTextColor(150, 120, 80);
        pdf.setFontSize(8);
        pdf.text(label.toUpperCase(), 20, y + 1);
        pdf.setTextColor(26, 18, 8);
        pdf.setFontSize(10);
        pdf.text(String(value), 80, y + 1);
        y += 16;
      });

      // Approval statement
      y += 5;
      pdf.setFillColor(26, 18, 8);
      pdf.roundedRect(15, y, 180, 25, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      const stmt = `I, ${contact?.full_name || 'the client'}, confirm that I have reviewed and approved the above document for use. This approval is legally binding and cannot be undone.`;
      const stmtLines = pdf.splitTextToSize(stmt, 170);
      pdf.text(stmtLines, 20, y + 9);

      // Footer
      y += 40;
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text('Creative Books SA · info@creativebooks.co.za · www.creativebooks.co.za · 010 500 3331', 105, 285, { align: 'center' });
      pdf.text('This certificate was generated automatically by the Creative Books SA CRM.', 105, 290, { align: 'center' });

      const pdfBlob = pdf.output('blob');
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return Response.json({ success: true, pdf_base64: base64, filename: `ApprovalCertificate_${doc.file_name.replace(/[^a-z0-9]/gi, '_')}.pdf` });
    }

    // ─── EXPORT AUDIT TRAIL PDF ────────────────────────────────────────────────
    if (action === 'export_audit_trail') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { document_id } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const doc = docs[0];

      const contactList = await platform.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
      const contact = contactList[0];

      const activities = await platform.asServiceRole.entities.DocumentActivity.filter({ document_id });
      activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      pdf.setFillColor(26, 18, 8);
      pdf.rect(0, 0, 210, 35, 'F');
      pdf.setTextColor(184, 115, 51);
      pdf.setFontSize(16);
      pdf.text('DOCUMENT AUDIT TRAIL', 15, 15);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(`Creative Books SA · Exported: ${new Date().toLocaleString('en-ZA')}`, 15, 24);

      // Doc info
      pdf.setTextColor(26, 18, 8);
      pdf.setFontSize(11);
      pdf.text('Document Information', 15, 48);
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`File: ${doc.file_name}`, 15, 56);
      pdf.text(`Category: ${doc.category} · Version: v${doc.version || 1} · Status: ${doc.status}`, 15, 62);
      pdf.text(`Client: ${contact?.full_name || 'N/A'} (${contact?.email || 'N/A'})`, 15, 68);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, 73, 195, 73);

      // Activity rows
      pdf.setFontSize(10);
      pdf.setTextColor(26, 18, 8);
      pdf.text('Activity Timeline', 15, 82);

      let y = 90;
      activities.forEach((a, i) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFillColor(i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 244 : 255);
        pdf.rect(15, y - 4, 180, 14, 'F');
        pdf.setTextColor(184, 115, 51);
        pdf.setFontSize(8);
        pdf.text(a.action.toUpperCase().replace('_', ' '), 18, y + 2);
        pdf.setTextColor(80, 80, 80);
        pdf.text(new Date(a.timestamp).toLocaleString('en-ZA'), 60, y + 2);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`${a.actor_type || ''} ${a.actor_email || ''} ${a.actor_ip ? '· ' + a.actor_ip : ''} ${a.actor_device ? '· ' + a.actor_device : ''}`.trim(), 18, y + 8);
        if (a.notes) {
          pdf.setFontSize(7);
          pdf.text(`Note: ${a.notes}`, 18, y + 13);
        }
        y += 16;
      });

      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text('Creative Books SA · This audit trail was generated from the CRM and is for internal record-keeping purposes.', 105, 290, { align: 'center' });

      const pdfBlob = pdf.output('blob');
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return Response.json({ success: true, pdf_base64: base64, filename: `AuditTrail_${doc.file_name.replace(/[^a-z0-9]/gi, '_')}.pdf` });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});