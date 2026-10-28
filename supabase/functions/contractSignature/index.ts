import { createClientFromRequest, serve } from '../_shared/server.ts';

const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';
const ADMIN_EMAIL = 'info@creativebooks.co.za';
const SITE_URL = 'https://creativebooks.co.za';
const BRAND = '#B87333';

function addAuditEvent(existing, event, extra = {}) {
  const trail = Array.isArray(existing) ? [...existing] : [];
  trail.push({ event, timestamp: new Date().toISOString(), ...extra });
  return trail;
}

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to: Array.isArray(to) ? to : [to], subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Email failed: ${err}`);
  }
  return await res.json();
}

function signingEmailHtml({ contactName, contractTitle, signingUrl, expiryDate, documentType }) {
  const companyName = 'Creative Books SA';
  const logoUrl = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';
  const docLabel = documentType && documentType !== 'Document' ? documentType : 'Document';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:32px 0 16px;"><img src="${logoUrl}" alt="${companyName}" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
      <tr><td style="padding:24px 40px 40px;">
        <h1 style="font-size:26px;font-weight:700;color:#1a1a1a;margin:0 0 8px;">${contractTitle} — Ready to Sign</h1>
        <p style="font-size:15px;color:#555;margin:0 0 24px;">Hi ${contactName},<br><br>Please find <strong>${contractTitle}</strong> available through the secure signing link below. Kindly review and sign the document so that we may proceed with the next stage of your project.</p>
        <div style="background:#FDF8F2;border:1px solid #E8D9C0;border-radius:12px;padding:20px;margin:0 0 28px;">
          <p style="font-size:14px;color:#555;margin:0 0 8px;">📄 What you need to do:</p>
          <ol style="font-size:14px;color:#333;margin:0;padding-left:20px;line-height:1.9;">
            <li>Click the button below to open your ${docLabel.toLowerCase()}</li>
            <li>Read the full document carefully</li>
            <li>Enter your full name and confirm your email</li>
            <li>Draw or type your electronic signature</li>
            <li>Tick the consent checkboxes</li>
            <li>Submit — you'll receive a signed copy instantly</li>
          </ol>
        </div>
        <div style="text-align:center;margin:0 0 28px;">
          <a href="${signingUrl}" style="display:inline-block;background:${BRAND};color:#fff;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;">✍️ Sign ${docLabel} Now</a>
        </div>
        ${expiryDate ? `<p style="font-size:13px;color:#999;text-align:center;">This signing link expires on ${expiryDate}. After expiry, please contact us to request a new link.</p>` : ''}
        <hr style="border:none;border-top:1px solid #E5E0D5;margin:24px 0;">
        <p style="font-size:13px;color:#888;margin:0;">If you have any questions, reply to this email or call us on <strong>084 230 5393</strong>.</p>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #E5E0D5;text-align:center;font-size:13px;color:#AAAAAA;">
        Creative Books SA &nbsp;|&nbsp; Prism Office Park, Fourways &nbsp;|&nbsp; info@creativebooks.co.za
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function adminNotifyHtml({ contactName, contactEmail, contractTitle, signedAt, signerIp, documentType }) {
  const companyName = 'Creative Books SA';
  const logoUrl = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';
  const docLabel = documentType && documentType !== 'Document' ? documentType : 'Document';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 0 16px;"><img src="${logoUrl}" alt="${companyName}" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
      <tr><td style="padding:32px 40px;">
        <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 6px;">✅ ${docLabel} Signed</h1>
        <p style="font-size:15px;color:#555;margin:0 0 24px;">${contactName} has signed <strong>${contractTitle}</strong>. The signed document and signature record have been saved under the client record and document history.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #E5E0D5;margin:0 0 24px;">
          <tr><td style="padding:10px 14px;font-weight:600;color:#333;border-bottom:1px solid #E5E0D5;background:#FAFAFA;font-size:14px;">Document</td><td style="padding:10px 14px;color:#555;border-bottom:1px solid #E5E0D5;font-size:14px;">${contractTitle}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#333;border-bottom:1px solid #E5E0D5;background:#FAFAFA;font-size:14px;">Type</td><td style="padding:10px 14px;color:#555;border-bottom:1px solid #E5E0D5;font-size:14px;">${docLabel}</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#333;border-bottom:1px solid #E5E0D5;background:#FAFAFA;font-size:14px;">Signer</td><td style="padding:10px 14px;color:#555;border-bottom:1px solid #E5E0D5;font-size:14px;">${contactName} &lt;${contactEmail}&gt;</td></tr>
          <tr><td style="padding:10px 14px;font-weight:600;color:#333;border-bottom:1px solid #E5E0D5;background:#FAFAFA;font-size:14px;">Signed At</td><td style="padding:10px 14px;color:#555;border-bottom:1px solid #E5E0D5;font-size:14px;">${signedAt}</td></tr>
          ${signerIp ? `<tr><td style="padding:10px 14px;font-weight:600;color:#333;background:#FAFAFA;font-size:14px;">IP Address</td><td style="padding:10px 14px;color:#555;font-size:14px;">${signerIp}</td></tr>` : ''}
        </table>
        <div style="text-align:center;">
          <a href="${SITE_URL}/admin/contracts" style="display:inline-block;background:${BRAND};color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">View in CRM →</a>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function signedConfirmHtml({ signerName, contractTitle, signedAt, contractFileUrl, documentType }) {
  const docLabel = documentType && documentType !== 'Document' ? documentType : 'Document';
  const companyName = 'Creative Books SA';
  const companyEmail = 'info@creativebooks.co.za';
  const logoUrl = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:28px 0 16px;"><img src="${logoUrl}" alt="${companyName}" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <div style="text-align:center;margin-bottom:32px;">
                <div style="width:64px;height:64px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h2 style="margin:0 0 16px;color:#1A1208;font-size:24px;font-weight:600;">${contractTitle} — Signed Successfully!</h2>
                <p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6;">
                  Thank you, <strong>${signerName}</strong>! <strong>${contractTitle}</strong> has been successfully signed and a copy is available below for your records.
                </p>
              </div>
              
              <div style="background:#faf8f4;border:1px solid rgba(184,115,51,0.15);border-radius:16px;padding:32px;margin:32px 0;">
                <div style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Signed On</div>
                <div style="font-size:14px;color:#555;line-height:1.8;">${signedAt}</div>
              </div>

              <div style="background:#f0f9ff;border:1px solid #0ea5e9;border-radius:12px;padding:20px;margin:24px 0;">
                <div style="font-size:13px;color:#0369a1;font-weight:600;margin-bottom:8px;">📋 What Happens Next?</div>
                <ul style="margin:0;padding-left:20px;color:#0c4a6e;font-size:14px;line-height:1.8;">
                  <li>Our team will review your signed ${docLabel.toLowerCase()}</li>
                  <li>A member of our team will contact you within <strong>24-48 hours</strong> to discuss next steps</li>
                  <li>You'll receive a project brief before work begins</li>
                  <li>Regular updates throughout the production process</li>
                </ul>
              </div>

              ${contractFileUrl ? `
              <div style="text-align:center;margin:32px 0;">
                <a href="${contractFileUrl}" style="display:inline-block;background:linear-gradient(135deg,#B87333 0%,#D4A574 100%);color:#ffffff;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 16px rgba(184,115,51,0.3);">
                  📄 Download Your Signed ${docLabel} Copy
                </a>
              </div>
              ` : ''}

              <p style="margin:32px 0 16px;color:#888;font-size:14px;line-height:1.6;">
                Questions? Reply to this email or call us at <strong style="color:#1A1208;">084 230 5393</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #fafafa; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">
                <strong style="color: #1A1208;">${companyName}</strong><br />
                Professional Publishing Services<br />
                <a href="mailto:${companyEmail}" style="color:#B87333;text-decoration:none;">${companyEmail}</a> · www.creativebooks.co.za<br />
                Proudly South African 🇿🇦
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve('contractSignature', async (req) => {
  try {
    const body = await req.json();
    const { action } = body;
    const platform = createClientFromRequest(req);

    // ── SEND FOR SIGNATURE ──────────────────────────────────────────────────
    if (action === 'send') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { contract_id } = body;
      const contracts = await platform.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
      const contact = contacts[0];
      if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });

      // Generate secure token
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const signingUrl = `${SITE_URL}/sign/contract/${token}`;

      const auditTrail = addAuditEvent(contract.audit_trail, 'sent', {
        actor: user.email,
        recipient: contact.email,
      });

      await platform.asServiceRole.entities.Contract.update(contract_id, {
        status: 'Sent for Signature',
        sign_token: token,
        sign_token_expires: expires.toISOString(),
        sent_at: new Date().toISOString(),
        audit_trail: auditTrail,
      });

      await sendEmail(contact.email, `${contract.title} — Sent for Signature`,
        signingEmailHtml({
          contactName: contact.full_name,
          contractTitle: contract.title,
          signingUrl,
          expiryDate: expires.toLocaleDateString('en-ZA'),
          documentType: contract.document_type,
        })
      );

      return Response.json({ success: true, signingUrl });
    }

    // ── RESEND SIGNING LINK ─────────────────────────────────────────────────
    if (action === 'resend') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { contract_id } = body;
      const contracts = await platform.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
      const contact = contacts[0];

      const token = contract.sign_token || (crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''));
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const signingUrl = `${SITE_URL}/sign/contract/${token}`;

      const auditTrail = addAuditEvent(contract.audit_trail, 'resent', { actor: user.email });

      await platform.asServiceRole.entities.Contract.update(contract_id, {
        status: 'Resent',
        sign_token: token,
        sign_token_expires: expires.toISOString(),
        reminder_count: (contract.reminder_count || 0) + 1,
        reminder_sent_at: new Date().toISOString(),
        audit_trail: auditTrail,
      });

      await sendEmail(contact.email, `Reminder: ${contract.title} — Please Sign`,
        signingEmailHtml({
          contactName: contact.full_name,
          contractTitle: contract.title,
          signingUrl,
          expiryDate: expires.toLocaleDateString('en-ZA'),
          documentType: contract.document_type,
        })
      );

      return Response.json({ success: true });
    }

    // ── GET CONTRACT BY TOKEN (public) ────────────────────────────────────
    if (action === 'get_by_token') {
      const { token, event: trackEvent, ip, user_agent } = body;
      if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

      const all = await platform.asServiceRole.entities.Contract.list('-created_date', 500);
      const contract = all.find(c => c.sign_token === token);
      if (!contract) return Response.json({ error: 'Invalid or expired link' }, { status: 404 });

      if (contract.sign_token_expires && new Date(contract.sign_token_expires) < new Date()) {
        await platform.asServiceRole.entities.Contract.update(contract.id, { status: 'Expired' });
        return Response.json({ error: 'This signing link has expired. Please contact Creative Books SA.' }, { status: 410 });
      }

      if (['Signed', 'Fully Signed', 'Declined'].includes(contract.status)) {
        return Response.json({ error: 'This contract has already been ' + contract.status.toLowerCase() + '.' }, { status: 409 });
      }

      if (trackEvent) {
        const updates = { audit_trail: addAuditEvent(contract.audit_trail, trackEvent, { ip, user_agent }) };
        if (trackEvent === 'opened' && !contract.opened_at) updates.opened_at = new Date().toISOString();
        if (trackEvent === 'viewed' && !contract.viewed_at) {
          updates.viewed_at = new Date().toISOString();
          if (['Sent for Signature', 'Resent', 'Opened'].includes(contract.status)) updates.status = 'Viewed';
        }
        if (trackEvent === 'opened' && ['Sent for Signature', 'Resent'].includes(contract.status)) updates.status = 'Opened';
        await platform.asServiceRole.entities.Contract.update(contract.id, updates);
      }

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
      const contact = contacts[0];

      return Response.json({
        contract: {
          id: contract.id,
          title: contract.title,
          document_type: contract.document_type || 'Document',
          book_title: contract.book_title,
          contract_file_url: contract.contract_file_url,
          status: contract.status,
          admin_signature_url: contract.admin_signature_url || null,
          admin_signed_at: contract.admin_signed_at || null,
          admin_signer_name: contract.admin_signer_name || null,
          contract_field_values: contract.contract_field_values || {},
        },
        contact: contact ? { full_name: contact.full_name, email: contact.email } : null,
      });
    }

    // ── SIGN CONTRACT (public) ──────────────────────────────────────────────
    if (action === 'sign') {
      const { token, signer_name, signer_email, signature_image_data, legal_consent, ip, user_agent, declined, declined_reason } = body;
      if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

      const all = await platform.asServiceRole.entities.Contract.list('-created_date', 500);
      const contract = all.find(c => c.sign_token === token);
      if (!contract) return Response.json({ error: 'Invalid signing link' }, { status: 404 });

      if (contract.sign_token_expires && new Date(contract.sign_token_expires) < new Date()) {
        return Response.json({ error: 'Signing link has expired' }, { status: 410 });
      }
      if (['Signed', 'Declined'].includes(contract.status)) {
        return Response.json({ error: 'Already processed' }, { status: 409 });
      }

      const now = new Date().toISOString();

      // DECLINED
      if (declined) {
        const auditTrail = addAuditEvent(contract.audit_trail, 'declined', { ip, user_agent, reason: declined_reason, signer: signer_email });
        await platform.asServiceRole.entities.Contract.update(contract.id, {
          status: 'Declined',
          declined_at: now,
          declined_reason: declined_reason || '',
          signer_name,
          signer_email,
          audit_trail: auditTrail,
        });
        // Notify admin
        await sendEmail(ADMIN_EMAIL, `⚠️ ${contract.title} — Declined by ${signer_name}`, `<p>Client ${signer_name} (${signer_email}) declined <strong>${contract.title}</strong> on ${new Date().toLocaleString('en-ZA')}.</p><p>Reason: ${declined_reason || 'Not provided'}</p>`);
        return Response.json({ success: true, status: 'declined' });
      }

      const signature_image_url = body.signature_image_url || signature_image_data || '';
      const client_field_values = body.client_field_values || {};

      const signedAt = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
      const adminAlreadySigned = !!contract.admin_signed_at;
      const finalStatus = adminAlreadySigned ? 'Fully Signed' : 'Signed';

      const auditTrail = addAuditEvent(contract.audit_trail, 'signed', {
        ip, user_agent, signer_name, signer_email, signed_at: now, legal_consent,
      });

      // Merge client field values into contract_field_values
      const updatedFieldValues = {
        ...(contract.contract_field_values || {}),
        _client: client_field_values,
      };

      await platform.asServiceRole.entities.Contract.update(contract.id, {
        status: finalStatus,
        signed_at: now,
        signer_name,
        signer_email,
        signer_ip: ip || '',
        signer_user_agent: user_agent || '',
        signature_image_url,
        legal_consent_checked: legal_consent || false,
        audit_trail: auditTrail,
        sign_token: null,
        contract_field_values: updatedFieldValues,
      });

      // Create Document record (signed copy)
      await platform.asServiceRole.entities.Document.create({
        contact_id: contract.contact_id,
        project_id: contract.project_id || '',
        category: 'Signed Contract',
        file_name: `${contract.title} — Signed.pdf`,
        file_url: contract.contract_file_url || '',
        status: 'Signed',
        signed_at: now,
        book_title: contract.book_title || '',
        notes: `Electronically signed by ${signer_name} (${signer_email}) on ${signedAt}`,
        uploaded_by: signer_email,
      });

      // Save ESignatureRequest record
      try {
        await platform.asServiceRole.entities.ESignatureRequest.create({
          title: contract.title,
          file_url: contract.contract_file_url || '',
          file_name: `${contract.title}.pdf`,
          contact_id: contract.contact_id,
          project_id: contract.project_id || '',
          status: 'Signed',
          recipient_name: signer_name,
          recipient_email: signer_email,
          signature_image_url,
          signature_method: body.sign_mode || 'drawn',
          signer_confirmed_name: signer_name,
          signer_confirmed_email: signer_email,
          signer_ip: ip || '',
          signer_user_agent: user_agent || '',
          consent_electronic: legal_consent || false,
          consent_submit: legal_consent || false,
          consent_read: true,
          consent_identity: true,
          consent_authorised: true,
          signed_at: now,
          sent_at: contract.sent_at || now,
          opened_at: contract.opened_at || now,
          signed_document_url: contract.contract_file_url || '',
          audit_trail: auditTrail,
          sent_by: 'Creative Books SA',
          open_count: 1,
        });
      } catch (e) {
        console.warn('ESignatureRequest log failed:', e.message);
      }

      // Update project stage if linked
      if (contract.project_id) {
        await platform.asServiceRole.entities.Project.update(contract.project_id, {
          contract_status: 'Signed',
          stage: 'Contract Signed',
          stage_changed_at: now,
        });
      }

      // Get contact info
      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
      const contact = contacts[0];

      const docTypeLabel = contract.document_type || 'Document';

      // Notify admin
      await sendEmail(ADMIN_EMAIL, `✅ ${contract.title} — Signed by ${signer_name}`,
        adminNotifyHtml({
          contactName: signer_name,
          contactEmail: signer_email,
          contractTitle: contract.title,
          signedAt,
          signerIp: ip || '',
          documentType: docTypeLabel,
        })
      );

      // Confirm to signer
      if (signer_email) {
        await sendEmail(signer_email, `${contract.title} — Signed Successfully`,
          signedConfirmHtml({ signerName: signer_name, contractTitle: contract.title, signedAt, contractFileUrl: contract.contract_file_url || '', documentType: docTypeLabel })
        );
      }

      return Response.json({ success: true, signed_at: now, contract_file_url: contract.contract_file_url || '', contract_id: contract.id, sent_at: contract.sent_at || '', opened_at: contract.opened_at || '' });
    }

    // ── ADMIN SIGN (authenticated) ───────────────────────────────────────────────
    if (action === 'admin_sign') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { contract_id, admin_signature_url, contract_field_values, admin_signer_name } = body;
      const contracts = await platform.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });

      const now = new Date().toISOString();
      await platform.asServiceRole.entities.Contract.update(contract_id, {
        status: 'Admin Signed',
        admin_signed_at: now,
        admin_signature_url,
        contract_field_values: contract_field_values || {},
        admin_signer_name: admin_signer_name || user.full_name || user.email,
        admin_signer_email: user.email,
        audit_trail: addAuditEvent(contract.audit_trail, 'admin_signed', {
          actor: user.email,
          admin_name: admin_signer_name,
        }),
      });

      return Response.json({ success: true });
    }

    // ── LOG SIGNING STARTED ───────────────────────────────────────────────
    if (action === 'signing_started') {
      const { token } = body;
      const all = await platform.asServiceRole.entities.Contract.list('-created_date', 500);
      const contract = all.find(c => c.sign_token === token);
      if (!contract) return Response.json({ ok: false });
      await platform.asServiceRole.entities.Contract.update(contract.id, {
        status: 'Signing Started',
        audit_trail: addAuditEvent(contract.audit_trail, 'signing_started'),
      });
      return Response.json({ ok: true });
    }

    // ── RESEND SIGNED COPY (public) ───────────────────────────────────────────────
    if (action === 'resend_signed_copy') {
      const { contract_id, signer_email } = body;
      if (!contract_id || !signer_email) return Response.json({ error: 'Missing fields' }, { status: 400 });
      const contracts = await platform.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract || contract.signer_email !== signer_email) return Response.json({ error: 'Not authorized' }, { status: 403 });
      if (!['Signed','Fully Signed'].includes(contract.status)) return Response.json({ error: 'Contract not yet signed' }, { status: 400 });
      const signedAt = new Date(contract.signed_at).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
      await sendEmail(signer_email, `${contract.title} — Signed Copy`,
        signedConfirmHtml({ signerName: contract.signer_name, contractTitle: contract.title, signedAt, contractFileUrl: contract.contract_file_url || '', documentType: contract.document_type })
      );
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('contractSignature error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});