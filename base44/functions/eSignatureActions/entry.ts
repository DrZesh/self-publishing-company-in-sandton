import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@3.2.0';
import { jsPDF } from 'npm:jspdf@4.0.0';

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let t = '';
  for (let i = 0; i < 56; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

function parseUA(ua = '') {
  let device = 'Desktop', browser = 'Unknown';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  return { device, browser };
}

function appendAudit(existing, event) {
  const trail = Array.isArray(existing) ? [...existing] : [];
  trail.push({ ...event, timestamp: new Date().toISOString() });
  return trail;
}

function getSigningEmailHtml(req, signingUrl) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f7;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1A1208 0%,#2C1E0F 100%);padding:40px;text-align:center;">
  <h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700;">Creative Books SA</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">Document Signing Request</p>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 12px;color:#1A1208;font-size:22px;">Hi ${req.recipient_name},</h2>
  <p style="color:#555;font-size:15px;line-height:1.6;">${req.email_message || 'Please review and sign the document below.'}</p>
  <div style="background:#faf8f4;border:1px solid rgba(184,115,51,0.2);border-radius:12px;padding:24px;margin:24px 0;">
    <div style="font-size:12px;color:#888;text-transform:uppercase;margin-bottom:8px;">Document to Sign</div>
    <div style="font-size:18px;font-weight:600;color:#1A1208;">${req.title}</div>
    <div style="font-size:13px;color:#888;margin-top:4px;">${req.document_category || 'Document'}</div>
    ${req.expires_at ? `<div style="font-size:12px;color:#e07b39;margin-top:8px;">⏱ Signing link expires: ${new Date(req.expires_at).toLocaleDateString('en-ZA')}</div>` : ''}
  </div>
  <div style="text-align:center;margin:32px 0;">
    <a href="${signingUrl}" style="display:inline-block;background:linear-gradient(135deg,#B87333,#D4A574);color:#fff;padding:16px 48px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 4px 16px rgba(184,115,51,0.3);">✍️ Sign Document</a>
  </div>
  <p style="color:#aaa;font-size:12px;text-align:center;">Secure link — do not share. Questions? Call 010 500 3331.</p>
</td></tr>
<tr><td style="background:#fafafa;padding:20px 40px;text-align:center;border-top:1px solid #e5e5e5;">
  <p style="margin:0;color:#999;font-size:12px;">Creative Books SA · info@creativebooks.co.za · www.creativebooks.co.za</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function generateCertificatePDF(req) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  pdf.setFillColor(26, 18, 8);
  pdf.rect(0, 0, 210, 45, 'F');
  pdf.setFillColor(184, 115, 51);
  pdf.rect(0, 43, 210, 3, 'F');

  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(18);
  pdf.text('CREATIVE BOOKS SA', 15, 18);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.text('ELECTRONIC SIGNATURE CERTIFICATE', 15, 28);
  pdf.setFontSize(9);
  pdf.text('This certificate confirms that the following document was electronically signed.', 15, 36);

  const fields = [
    { label: 'Document Title', value: req.title },
    { label: 'Document Type', value: req.document_category || 'Document' },
    { label: 'Signer Name', value: req.signer_confirmed_name || req.recipient_name },
    { label: 'Signer Email', value: req.signer_confirmed_email || req.recipient_email },
    { label: 'Signature Method', value: req.signature_method === 'drawn' ? 'Drawn (mouse/touch)' : 'Typed' },
    { label: 'Date Signed', value: req.signed_at ? new Date(req.signed_at).toLocaleString('en-ZA') : new Date().toLocaleString('en-ZA') },
    { label: 'IP Address', value: req.signer_ip || 'Not recorded' },
    { label: 'Device', value: req.signer_device || 'Not recorded' },
    { label: 'Browser', value: req.signer_browser || 'Not recorded' },
    { label: 'Consent: Read Document', value: req.consent_read ? 'Yes ✓' : 'No' },
    { label: 'Consent: Identity Confirmed', value: req.consent_identity ? 'Yes ✓' : 'No' },
    { label: 'Consent: Authorised to Sign', value: req.consent_authorised ? 'Yes ✓' : 'No' },
    { label: 'Consent: Electronic Signature', value: req.consent_electronic ? 'Yes ✓' : 'No' },
    { label: 'Sent By (Admin)', value: req.sent_by || 'System' },
  ];

  let y = 60;
  fields.forEach(({ label, value }) => {
    pdf.setFillColor(250, 248, 244);
    pdf.roundedRect(15, y - 4, 180, 11, 1, 1, 'F');
    pdf.setTextColor(140, 100, 60);
    pdf.setFontSize(7.5);
    pdf.text(label.toUpperCase(), 18, y + 2);
    pdf.setTextColor(26, 18, 8);
    pdf.setFontSize(9);
    pdf.text(String(value || '—').substring(0, 70), 80, y + 2);
    y += 14;
  });

  y += 5;
  pdf.setFillColor(26, 18, 8);
  pdf.roundedRect(15, y, 180, 20, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  const stmt = 'The above named individual has electronically signed this document. This certificate constitutes a legally binding record of that signature.';
  const lines = pdf.splitTextToSize(stmt, 170);
  pdf.text(lines, 20, y + 7);

  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text('Creative Books SA · info@creativebooks.co.za · www.creativebooks.co.za · 010 500 3331', 105, 287, { align: 'center' });
  pdf.text('This certificate was generated automatically by the Creative Books SA CRM.', 105, 292, { align: 'center' });

  // Return as Uint8Array — avoid spread which can crash on large arrays
  const pdfBytes = pdf.output('arraybuffer');
  return new Uint8Array(pdfBytes);
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

    // ── SEND ────────────────────────────────────────────────────────────────────
    if (action === 'send') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { request_id } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Request not found' }, { status: 404 });
      const esigReq = reqs[0];

      const token = generateToken();
      const signingUrl = `${origin}/sign/esig/${esigReq.id}/${token}`;
      const expiresAt = esigReq.expires_at || new Date(Date.now() + 14 * 24 * 3600000).toISOString();
      const now = new Date().toISOString();

      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
        sign_token: token,
        expires_at: expiresAt,
        status: 'Sent',
        sent_at: now,
        sent_by: user.email,
        audit_trail: appendAudit(esigReq.audit_trail, { event: 'sent', actor: user.email, signing_url: signingUrl }),
      });

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [esigReq.recipient_email],
        subject: esigReq.email_subject || `Please sign: ${esigReq.title}`,
        html: getSigningEmailHtml(esigReq, signingUrl),
      });

      // Optional WhatsApp
      if (esigReq.send_whatsapp && (esigReq.recipient_phone)) {
        const waMsg = `Hi ${esigReq.recipient_name}, you have a document to sign from Creative Books SA: "${esigReq.title}". Open your signing link: ${signingUrl}`;
        const callmebot = Deno.env.get('CALLMEBOT_API_KEY');
        const waNumber = esigReq.recipient_phone.replace(/\D/g, '');
        await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waNumber}&text=${encodeURIComponent(waMsg)}&apikey=${callmebot}`).catch(() => {});
      }

      return Response.json({ success: true, signing_url: signingUrl });
    }

    // ── TRACK OPEN ──────────────────────────────────────────────────────────────
    if (action === 'track_open') {
      const { request_id, token } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];

      if (esigReq.sign_token !== token) return Response.json({ error: 'Invalid link' }, { status: 403 });
      if (esigReq.expires_at && new Date(esigReq.expires_at) < new Date()) {
        await base44.asServiceRole.entities.ESignatureRequest.update(request_id, { status: 'Expired' });
        return Response.json({ error: 'This signing link has expired', expired: true }, { status: 410 });
      }
      if (['Signed','Cancelled','Archived'].includes(esigReq.status)) {
        return Response.json({ doc: esigReq, already_signed: esigReq.status === 'Signed' });
      }

      const isFirstOpen = esigReq.status === 'Sent' || esigReq.status === 'Delivered';
      const now = new Date().toISOString();
      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
        status: isFirstOpen ? 'Opened' : esigReq.status,
        opened_at: esigReq.opened_at || now,
        viewed_at: now,
        open_count: (esigReq.open_count || 0) + 1,
        signer_ip: ip,
        signer_device: device,
        signer_browser: browser,
        signer_user_agent: ua,
        audit_trail: appendAudit(esigReq.audit_trail, { event: 'opened', ip, device, browser }),
      });

      return Response.json({ success: true, doc: esigReq });
    }

    // ── SIGNING STARTED ─────────────────────────────────────────────────────────
    if (action === 'signing_started') {
      const { request_id, token } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];
      if (esigReq.sign_token !== token) return Response.json({ error: 'Invalid' }, { status: 403 });

      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
        status: 'Signing Started',
        signing_started_at: new Date().toISOString(),
        audit_trail: appendAudit(esigReq.audit_trail, { event: 'signing_started', ip, device, browser }),
      });
      return Response.json({ success: true });
    }

    // ── SUBMIT SIGNATURE ────────────────────────────────────────────────────────
    if (action === 'submit_signature') {
      const { request_id, token, signature_image_url, signature_method,
        confirmed_name, confirmed_email, consent_read, consent_identity,
        consent_authorised, consent_electronic, consent_submit } = body;

      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];
      if (esigReq.sign_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });
      if (esigReq.expires_at && new Date(esigReq.expires_at) < new Date()) return Response.json({ error: 'Link expired' }, { status: 410 });
      if (esigReq.status === 'Signed') return Response.json({ error: 'Already signed' }, { status: 400 });

      const now = new Date().toISOString();

      // Build updated record
      const updates = {
        status: 'Signed',
        signed_at: now,
        signature_image_url,
        signature_method,
        signer_confirmed_name: confirmed_name,
        signer_confirmed_email: confirmed_email,
        signer_ip: ip,
        signer_device: device,
        signer_browser: browser,
        signer_user_agent: ua,
        consent_read: !!consent_read,
        consent_identity: !!consent_identity,
        consent_authorised: !!consent_authorised,
        consent_electronic: !!consent_electronic,
        consent_submit: !!consent_submit,
        audit_trail: appendAudit(esigReq.audit_trail, {
          event: 'signed', actor: confirmed_email, confirmed_name,
          ip, device, browser, signature_method,
          consents: { consent_read, consent_identity, consent_authorised, consent_electronic, consent_submit },
        }),
      };

      // Generate certificate PDF and upload to storage (avoids base64 size limits in DB)
      const mergedReq = { ...esigReq, ...updates };
      let signedDocUrl = null;
      try {
        const pdfBytes = await generateCertificatePDF(mergedReq);
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfBlob });
        signedDocUrl = uploaded.file_url;
        updates.signed_document_url = signedDocUrl;
        updates.audit_trail = appendAudit(updates.audit_trail, { event: 'certificate_generated', url: signedDocUrl });
      } catch (pdfErr) {
        console.error('PDF generation/upload failed (non-fatal):', pdfErr.message);
        // Don't block the signing even if PDF fails
      }

      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, updates);

      // Update linked Document if present
      if (esigReq.document_id) {
        await base44.asServiceRole.entities.Document.update(esigReq.document_id, {
          status: 'Signed',
          signed_at: now,
          signature_url: signature_image_url,
        }).catch(() => {});
      }

      // Notify admin by email
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      const adminEmail = 'info@creativebooks.co.za';
      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [adminEmail],
        subject: `✅ Document Signed: ${esigReq.title}`,
        html: `<p><strong>${confirmed_name}</strong> (${confirmed_email}) has signed <strong>${esigReq.title}</strong>.</p><p>Signed at: ${new Date(now).toLocaleString('en-ZA')}</p>`,
      }).catch(() => {});

      // Send signed copy to recipient
      if (esigReq.allow_download_after_sign) {
        await resend.emails.send({
          from: 'Creative Books SA <info@creativebooks.co.za>',
          to: [confirmed_email],
          subject: `Your signed document: ${esigReq.title}`,
          html: `<p>Hi ${confirmed_name},</p><p>Thank you for signing <strong>${esigReq.title}</strong>. Your signed document has been saved.</p><p>Creative Books SA</p>`,
        }).catch(() => {});
      }

      return Response.json({ success: true, signed_document_url: signedDocUrl });
    }

    // ── DECLINE ─────────────────────────────────────────────────────────────────
    if (action === 'decline') {
      const { request_id, token, reason } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];
      if (esigReq.sign_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });

      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
        status: 'Declined',
        declined_at: new Date().toISOString(),
        decline_reason: reason || '',
        audit_trail: appendAudit(esigReq.audit_trail, { event: 'declined', reason, ip, device }),
      });

      return Response.json({ success: true });
    }

    // ── RESEND ──────────────────────────────────────────────────────────────────
    if (action === 'resend') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { request_id } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];

      const token = generateToken();
      const signingUrl = `${origin}/sign/esig/${esigReq.id}/${token}`;
      const expiresAt = new Date(Date.now() + 14 * 24 * 3600000).toISOString();

      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
        sign_token: token, expires_at: expiresAt,
        status: 'Sent',
        reminder_sent_count: (esigReq.reminder_sent_count || 0) + 1,
        last_reminder_at: new Date().toISOString(),
        audit_trail: appendAudit(esigReq.audit_trail, { event: 'resent', actor: user.email }),
      });

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [esigReq.recipient_email],
        subject: `Reminder: Please sign — ${esigReq.title}`,
        html: getSigningEmailHtml({ ...esigReq, expires_at: expiresAt }, signingUrl),
      });

      return Response.json({ success: true, signing_url: signingUrl });
    }

    // ── GET REQUEST (for signing page) ──────────────────────────────────────────
    if (action === 'get_request') {
      const { request_id, token } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];
      if (esigReq.sign_token !== token) return Response.json({ error: 'Invalid link' }, { status: 403 });
      return Response.json({ success: true, request: esigReq });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});