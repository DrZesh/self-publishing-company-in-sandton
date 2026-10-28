import { requireAdmin, AuthError } from './supabase-auth.ts';
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
<tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td align="center" style="padding:28px 0 8px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
<tr><td align="center" style="padding:0 32px 16px;font-family:sans-serif;font-size:12px;font-weight:700;color:#888;letter-spacing:0.1em;">DOCUMENT SIGNING REQUEST</td></tr>
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

  const isFullySigned = req.admin_signed_at && req.signed_at;

  const fields = [
    { label: 'Document Title', value: req.title },
    { label: 'Document Type', value: req.document_category || 'Document' },
    { label: 'Contract Status', value: isFullySigned ? 'FULLY SIGNED — Both Parties' : 'SIGNED' },
    { label: 'Reference', value: req.id?.slice(-8).toUpperCase() || '—' },
  ];

  let y = 56;

  // Admin signature block
  if (req.admin_signed_at) {
    pdf.setFillColor(240, 248, 255);
    pdf.roundedRect(15, y - 2, 180, 6, 1, 1, 'F');
    pdf.setTextColor(30, 80, 140);
    pdf.setFontSize(8);
    pdf.text('CREATIVE BOOKS SA — ADMIN SIGNATURE', 18, y + 2);
    y += 9;
    [
      { label: 'Admin Signer Name', value: req.admin_signer_name || '—' },
      { label: 'Admin Signer Email', value: req.admin_signer_email || '—' },
      { label: 'Admin Signed At', value: req.admin_signed_at ? new Date(req.admin_signed_at).toLocaleString('en-ZA') : '—' },
    ].forEach(({ label, value }) => {
      pdf.setFillColor(245, 250, 255);
      pdf.roundedRect(15, y - 4, 180, 11, 1, 1, 'F');
      pdf.setTextColor(100, 130, 180);
      pdf.setFontSize(7.5);
      pdf.text(label.toUpperCase(), 18, y + 2);
      pdf.setTextColor(26, 18, 8);
      pdf.setFontSize(9);
      pdf.text(String(value || '—').substring(0, 70), 85, y + 2);
      y += 13;
    });
    y += 3;
  }

  // Client signature block
  pdf.setFillColor(240, 255, 245);
  pdf.roundedRect(15, y - 2, 180, 6, 1, 1, 'F');
  pdf.setTextColor(20, 110, 60);
  pdf.setFontSize(8);
  pdf.text('CLIENT SIGNATURE', 18, y + 2);
  y += 9;

  [
    { label: 'Client Signer Name', value: req.signer_confirmed_name || req.recipient_name },
    { label: 'Client Signer Email', value: req.signer_confirmed_email || req.recipient_email },
    { label: 'Signature Method', value: req.signature_method === 'drawn' ? 'Drawn (mouse/touch)' : 'Typed' },
    { label: 'Client Signed At', value: req.signed_at ? new Date(req.signed_at).toLocaleString('en-ZA') : new Date().toLocaleString('en-ZA') },
    { label: 'IP Address', value: req.signer_ip || 'Not recorded' },
    { label: 'Device', value: req.signer_device || 'Not recorded' },
    { label: 'Consent: Read Document', value: req.consent_read ? 'Yes ✓' : 'No' },
    { label: 'Consent: Authorised to Sign', value: req.consent_authorised ? 'Yes ✓' : 'No' },
    { label: 'Sent By (Admin)', value: req.sent_by || 'System' },
  ].forEach(({ label, value }) => {
    pdf.setFillColor(250, 248, 244);
    pdf.roundedRect(15, y - 4, 180, 11, 1, 1, 'F');
    pdf.setTextColor(140, 100, 60);
    pdf.setFontSize(7.5);
    pdf.text(label.toUpperCase(), 18, y + 2);
    pdf.setTextColor(26, 18, 8);
    pdf.setFontSize(9);
    pdf.text(String(value || '—').substring(0, 70), 85, y + 2);
    y += 13;
  });

  // Contract fields summary
  if (req.admin_field_values && Object.keys(req.admin_field_values).length > 0) {
    y += 4;
    if (y > 240) { pdf.addPage(); y = 20; }
    pdf.setFillColor(255, 248, 230);
    pdf.roundedRect(15, y - 2, 180, 6, 1, 1, 'F');
    pdf.setTextColor(140, 80, 20);
    pdf.setFontSize(8);
    pdf.text('CONTRACT FIELDS', 18, y + 2);
    y += 9;
    Object.entries(req.admin_field_values).forEach(([key, val]) => {
      if (!val) return;
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFillColor(255, 252, 242);
      pdf.roundedRect(15, y - 4, 180, 11, 1, 1, 'F');
      pdf.setTextColor(160, 110, 50);
      pdf.setFontSize(7.5);
      pdf.text(key.replace(/_/g, ' ').toUpperCase(), 18, y + 2);
      pdf.setTextColor(26, 18, 8);
      pdf.setFontSize(9);
      pdf.text(String(val).substring(0, 70), 85, y + 2);
      y += 12;
    });
  }

  y += 5;
  if (y < 260) {
    pdf.setFillColor(26, 18, 8);
    pdf.roundedRect(15, y, 180, 16, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    const stmt = isFullySigned
      ? 'This document has been signed by both Creative Books SA and the client. This certificate is legally binding.'
      : 'The above named individual has electronically signed this document.';
    const lines = pdf.splitTextToSize(stmt, 170);
    pdf.text(lines, 20, y + 6);
  }

  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text('Creative Books SA · info@creativebooks.co.za · www.creativebooks.co.za · 010 500 3331', 105, 287, { align: 'center' });
  pdf.text('This certificate was generated automatically by the Creative Books SA CRM.', 105, 292, { align: 'center' });

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
      const user = await requireAdmin(req);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { request_id } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Request not found' }, { status: 404 });
      const esigReq = reqs[0];

      const token = generateToken();
      const signingUrl = `${origin}/sign/esig/${esigReq.id}/${token}`;
      const expiresAt = esigReq.expires_at || new Date(Date.now() + 14 * 24 * 3600000).toISOString();
      const now = new Date().toISOString();

      // Build status: if admin already signed, label as 'Sent' (awaiting client)
      const newStatus = 'Sent';

      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
        sign_token: token,
        expires_at: expiresAt,
        status: newStatus,
        sent_at: now,
        sent_by: user.email,
        audit_trail: appendAudit(esigReq.audit_trail, { event: 'sent', actor: user.email, signing_url: signingUrl }),
      });

      // Build email subject/message based on whether admin signed first
      const adminSignedFirst = !!esigReq.admin_signed_at;
      const emailSubject = esigReq.email_subject || `Please countersign: ${esigReq.title}`;
      const emailIntro = adminSignedFirst
        ? `Creative Books SA has already signed this contract. Please review our signature and complete yours.`
        : (esigReq.email_message || 'Please review and sign the document below.');

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [esigReq.recipient_email],
        subject: emailSubject,
        html: getSigningEmailHtml({ ...esigReq, email_message: emailIntro }, signingUrl),
      });

      if (esigReq.send_whatsapp && esigReq.recipient_phone) {
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

      // Determine final status
      const adminAlreadySigned = !!esigReq.admin_signed_at;
      const finalStatus = adminAlreadySigned ? 'Fully Signed' : 'Client Signed';

      updates.status = finalStatus;
      updates.pdf_generation_status = 'pending';

      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, updates);

      if (esigReq.document_id) {
        await base44.asServiceRole.entities.Document.update(esigReq.document_id, {
          status: 'Signed',
          signed_at: now,
          signature_url: signature_image_url,
        }).catch(() => {});
      }

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      const adminEmail = 'info@creativebooks.co.za';
      const statusLabel = finalStatus === 'Fully Signed' ? '✅ Fully Signed (Both Parties)' : '✅ Document Signed';
      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [adminEmail],
        subject: `${statusLabel}: ${esigReq.title}`,
        html: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 16px;"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr><tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr><tr><td style="padding:0 32px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table><div style="padding:24px 0;text-align:center;"><h1 style="font-size:22px;font-weight:700;color:#2C2C2C;margin:0 0 8px 0;">✅ ' + statusLabel + '</h1><p style="font-size:15px;color:#6B6B6B;margin:0 0 24px 0;"><strong>' + confirmed_name + '</strong> (' + confirmed_email + ') has signed <strong>' + esigReq.title + '</strong>.</p><div style="background:#FAF5EE;border-radius:12px;border:1px solid #E5E0D5;padding:16px;text-align:left;"><p style="font-size:14px;color:#2C2C2C;margin:0 0 6px 0;"><strong>Status:</strong> ' + finalStatus + '</p><p style="font-size:14px;color:#2C2C2C;margin:0;"><strong>Signed:</strong> ' + new Date(now).toLocaleString('en-ZA') + '</p></div></div><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table></td></tr><tr><td align="center" style="padding:16px 32px 24px;font-size:12px;color:#AAAAAA;">Creative Books SA · info@creativebooks.co.za · 084 230 5393</td></tr></table></td></tr></table></body></html>',
      }).catch(() => {});

      if (esigReq.allow_download_after_sign) {
        await resend.emails.send({
          from: 'Creative Books SA <info@creativebooks.co.za>',
          to: [confirmed_email],
          subject: `Your signed document: ${esigReq.title}`,
          html: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 16px;"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr><tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr><tr><td style="padding:0 32px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table><div style="padding:24px 0;text-align:center;"><div style="width:64px;height:64px;background:#F0FDF4;border-radius:50%;display:inline-block;line-height:64px;font-size:32px;margin-bottom:16px;">✅</div><h1 style="font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 8px 0;">Document Signed Successfully</h1><p style="font-size:15px;color:#6B6B6B;margin:0 0 24px 0;">Hi ' + confirmed_name + ', thank you for signing <strong>' + esigReq.title + '</strong>.</p><div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;text-align:left;"><p style="font-size:14px;color:#166534;margin:0 0 6px 0;"><strong>Signed on:</strong> ' + new Date(now).toLocaleString('en-ZA') + '</p><p style="font-size:14px;color:#166534;margin:0;">Your signature has been recorded. Our team will be in touch shortly.</p></div></div><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table></td></tr><tr><td align="center" style="padding:16px 32px 24px;font-size:12px;color:#AAAAAA;">Creative Books SA · info@creativebooks.co.za · 084 230 5393</td></tr></table></td></tr></table></body></html>',
        }).catch(() => {});
      }

      return Response.json({ success: true, signed_document_url: null, final_status: finalStatus });
    }

    // ── GENERATE PDF (separate action, called by admin after signing) ─────────────
    if (action === 'generate_pdf') {
      const user = await requireAdmin(req);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { request_id } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];

      if (esigReq.status !== 'Signed') return Response.json({ error: 'Document has not been signed yet' }, { status: 400 });

      try {
        const pdfBytes = await generateCertificatePDF(esigReq);
        // Convert Uint8Array to base64 safely (no spread to avoid stack overflow)
        let binary = '';
        for (let i = 0; i < pdfBytes.length; i++) binary += String.fromCharCode(pdfBytes[i]);
        const base64 = btoa(binary);
        const dataUrl = `data:application/pdf;base64,${base64}`;

        // Try to upload via integration; fall back to data URL
        let pdfUrl = dataUrl;
        try {
          const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({
            file: new Blob([pdfBytes], { type: 'application/pdf' })
          });
          if (uploaded?.file_url) pdfUrl = uploaded.file_url;
        } catch (uploadErr) {
          console.warn('Upload failed, storing as data URL:', uploadErr.message);
        }

        await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
          signed_document_url: pdfUrl,
          pdf_generation_status: 'done',
          audit_trail: appendAudit(esigReq.audit_trail, { event: 'certificate_generated', actor: user.email }),
        });

        return Response.json({ success: true, signed_document_url: pdfUrl });
      } catch (pdfErr) {
        console.error('PDF generation failed:', pdfErr.message);
        await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
          pdf_generation_status: 'failed',
          audit_trail: appendAudit(esigReq.audit_trail, { event: 'certificate_failed', error: pdfErr.message }),
        });
        return Response.json({ error: 'PDF generation failed: ' + pdfErr.message }, { status: 500 });
      }
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
      const user = await requireAdmin(req);
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

    // ── ADMIN SIGN ──────────────────────────────────────────────────────────────
    if (action === 'admin_sign') {
      const user = await requireAdmin(req);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { request_id, admin_signature_url, admin_field_values, admin_signer_name } = body;
      const reqs = await base44.asServiceRole.entities.ESignatureRequest.filter({ id: request_id });
      if (!reqs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const esigReq = reqs[0];

      const now = new Date().toISOString();
      await base44.asServiceRole.entities.ESignatureRequest.update(request_id, {
        status: 'Admin Signed',
        admin_signed_at: now,
        admin_signature_url,
        admin_field_values: admin_field_values || {},
        admin_signer_name: admin_signer_name || user.full_name || user.email,
        admin_signer_email: user.email,
        signing_order: 'admin_first',
        audit_trail: appendAudit(esigReq.audit_trail, {
          event: 'admin_signed',
          actor: user.email,
          admin_name: admin_signer_name,
        }),
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ error: err.message }, { status: err.status });
    return Response.json({ error: err.message }, { status: 500 });
  }
});