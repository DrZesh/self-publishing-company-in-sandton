import { requireAdmin, AuthError } from './supabase-auth.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

function signingEmailHtml({ contactName, contractTitle, signingUrl, expiryDate }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
      <tr><td align="center" style="padding:32px 32px 8px;">
        <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" />
      </td></tr>
      <tr><td style="padding:24px 40px 40px;">
        <h1 style="font-size:26px;font-weight:700;color:#1a1a1a;margin:0 0 8px;">Your Contract is Ready to Sign</h1>
        <p style="font-size:15px;color:#555;margin:0 0 24px;">Hi ${contactName},<br><br>Your contract <strong>"${contractTitle}"</strong> from Creative Books SA is ready for your electronic signature.</p>
        <div style="background:#FDF8F2;border:1px solid #E8D9C0;border-radius:12px;padding:20px;margin:0 0 28px;">
          <p style="font-size:14px;color:#555;margin:0 0 8px;">📄 What you need to do:</p>
          <ol style="font-size:14px;color:#333;margin:0;padding-left:20px;line-height:1.9;">
            <li>Click the button below to open your contract</li>
            <li>Read the full contract carefully</li>
            <li>Enter your full name and confirm your email</li>
            <li>Draw or type your electronic signature</li>
            <li>Tick the consent checkboxes</li>
            <li>Submit — you'll receive a signed copy instantly</li>
          </ol>
        </div>
        <div style="text-align:center;margin:0 0 28px;">
          <a href="${signingUrl}" style="display:inline-block;background:${BRAND};color:#fff;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;">✍️ Sign Contract Now</a>
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

function adminNotifyHtml({ contactName, contactEmail, contractTitle, signedAt, signerIp }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
      <tr><td style="padding:32px 40px;">
        <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 6px;">✅ Contract Signed</h1>
        <p style="font-size:15px;color:#555;margin:0 0 24px;">A client has just electronically signed a contract.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #E5E0D5;margin:0 0 24px;">
          <tr><td style="padding:10px 14px;font-weight:600;color:#333;border-bottom:1px solid #E5E0D5;background:#FAFAFA;font-size:14px;">Contract</td><td style="padding:10px 14px;color:#555;border-bottom:1px solid #E5E0D5;font-size:14px;">${contractTitle}</td></tr>
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

function signedConfirmHtml({ signerName, contractTitle, signedAt, contractFileUrl }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
      <tr><td style="padding:32px 40px;text-align:center;">
        <div style="width:64px;height:64px;background:#F0FDF4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:32px;">✅</div>
        <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 8px;">Contract Signed Successfully</h1>
        <p style="font-size:15px;color:#555;margin:0 0 24px;">Hi ${signerName}, thank you for signing <strong>"${contractTitle}"</strong>.</p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:16px;margin:0 0 24px;text-align:left;">
          <p style="font-size:14px;color:#166534;margin:0;"><strong>Signed on:</strong> ${signedAt}</p>
          <p style="font-size:14px;color:#166534;margin:8px 0 0;">A copy has been recorded and your project is now moving forward. Our team will be in touch shortly.</p>
          </div>
          <div style="text-align:center;margin:0 0 24px;">
          <a href="${contractFileUrl}" style="display:inline-block;background:#1a4a2a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">📄 Download Original Contract</a>
          </div>
          <p style="font-size:13px;color:#888;margin:0;">Questions? Reply to this email or call <strong>084 230 5393</strong>.</p>
          </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #E5E0D5;text-align:center;font-size:13px;color:#AAAAAA;">
        Creative Books SA &nbsp;|&nbsp; info@creativebooks.co.za
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action } = body;
    const base44 = createClientFromRequest(req);

    // ── SEND FOR SIGNATURE ──────────────────────────────────────────────────
    if (action === 'send') {
      const user = await requireAdmin(req);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { contract_id } = body;
      const contracts = await base44.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });

      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
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

      await base44.asServiceRole.entities.Contract.update(contract_id, {
        status: 'Sent for Signature',
        sign_token: token,
        sign_token_expires: expires.toISOString(),
        sent_at: new Date().toISOString(),
        audit_trail: auditTrail,
      });

      await sendEmail(contact.email, `Action Required: Sign Your Contract — ${contract.title}`,
        signingEmailHtml({
          contactName: contact.full_name,
          contractTitle: contract.title,
          signingUrl,
          expiryDate: expires.toLocaleDateString('en-ZA'),
        })
      );

      return Response.json({ success: true, signingUrl });
    }

    // ── RESEND SIGNING LINK ─────────────────────────────────────────────────
    if (action === 'resend') {
      const user = await requireAdmin(req);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { contract_id } = body;
      const contracts = await base44.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });

      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
      const contact = contacts[0];

      const token = contract.sign_token || (crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''));
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const signingUrl = `${SITE_URL}/sign/contract/${token}`;

      const auditTrail = addAuditEvent(contract.audit_trail, 'resent', { actor: user.email });

      await base44.asServiceRole.entities.Contract.update(contract_id, {
        status: 'Resent',
        sign_token: token,
        sign_token_expires: expires.toISOString(),
        reminder_count: (contract.reminder_count || 0) + 1,
        reminder_sent_at: new Date().toISOString(),
        audit_trail: auditTrail,
      });

      await sendEmail(contact.email, `Reminder: Please Sign Your Contract — ${contract.title}`,
        signingEmailHtml({
          contactName: contact.full_name,
          contractTitle: contract.title,
          signingUrl,
          expiryDate: expires.toLocaleDateString('en-ZA'),
        })
      );

      return Response.json({ success: true });
    }

    // ── GET CONTRACT BY TOKEN (public) ────────────────────────────────────
    if (action === 'get_by_token') {
      const { token, event: trackEvent, ip, user_agent } = body;
      if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

      const all = await base44.asServiceRole.entities.Contract.list('-created_date', 500);
      const contract = all.find(c => c.sign_token === token);
      if (!contract) return Response.json({ error: 'Invalid or expired link' }, { status: 404 });

      if (contract.sign_token_expires && new Date(contract.sign_token_expires) < new Date()) {
        await base44.asServiceRole.entities.Contract.update(contract.id, { status: 'Expired' });
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
        await base44.asServiceRole.entities.Contract.update(contract.id, updates);
      }

      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
      const contact = contacts[0];

      return Response.json({
        contract: {
          id: contract.id,
          title: contract.title,
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

      const all = await base44.asServiceRole.entities.Contract.list('-created_date', 500);
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
        await base44.asServiceRole.entities.Contract.update(contract.id, {
          status: 'Declined',
          declined_at: now,
          declined_reason: declined_reason || '',
          signer_name,
          signer_email,
          audit_trail: auditTrail,
        });
        // Notify admin
        await sendEmail(ADMIN_EMAIL, `⚠️ Contract Declined — ${contract.title}`, `<p>Client ${signer_name} (${signer_email}) declined the contract "<strong>${contract.title}</strong>" on ${new Date().toLocaleString('en-ZA')}.</p><p>Reason: ${declined_reason || 'Not provided'}</p>`);
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

      await base44.asServiceRole.entities.Contract.update(contract.id, {
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
      await base44.asServiceRole.entities.Document.create({
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
        await base44.asServiceRole.entities.ESignatureRequest.create({
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
        await base44.asServiceRole.entities.Project.update(contract.project_id, {
          contract_status: 'Signed',
          stage: 'Contract Signed',
          stage_changed_at: now,
        });
      }

      // Get contact info
      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: contract.contact_id });
      const contact = contacts[0];

      // Notify admin
      await sendEmail(ADMIN_EMAIL, `✅ Contract Signed — ${contract.title}`,
        adminNotifyHtml({
          contactName: signer_name,
          contactEmail: signer_email,
          contractTitle: contract.title,
          signedAt,
          signerIp: ip || '',
        })
      );

      // Confirm to signer
      if (signer_email) {
        await sendEmail(signer_email, `Signed: ${contract.title} — Creative Books SA`,
          signedConfirmHtml({ signerName: signer_name, contractTitle: contract.title, signedAt, contractFileUrl: contract.contract_file_url || '' })
        );
      }

      return Response.json({ success: true, signed_at: now, contract_file_url: contract.contract_file_url || '', contract_id: contract.id, sent_at: contract.sent_at || '', opened_at: contract.opened_at || '' });
    }

    // ── ADMIN SIGN (authenticated) ───────────────────────────────────────────────
    if (action === 'admin_sign') {
      const user = await requireAdmin(req);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { contract_id, admin_signature_url, contract_field_values, admin_signer_name } = body;
      const contracts = await base44.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract) return Response.json({ error: 'Contract not found' }, { status: 404 });

      const now = new Date().toISOString();
      await base44.asServiceRole.entities.Contract.update(contract_id, {
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
      const all = await base44.asServiceRole.entities.Contract.list('-created_date', 500);
      const contract = all.find(c => c.sign_token === token);
      if (!contract) return Response.json({ ok: false });
      await base44.asServiceRole.entities.Contract.update(contract.id, {
        status: 'Signing Started',
        audit_trail: addAuditEvent(contract.audit_trail, 'signing_started'),
      });
      return Response.json({ ok: true });
    }

    // ── RESEND SIGNED COPY (public) ───────────────────────────────────────────────
    if (action === 'resend_signed_copy') {
      const { contract_id, signer_email } = body;
      if (!contract_id || !signer_email) return Response.json({ error: 'Missing fields' }, { status: 400 });
      const contracts = await base44.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0];
      if (!contract || contract.signer_email !== signer_email) return Response.json({ error: 'Not authorized' }, { status: 403 });
      if (!['Signed','Fully Signed'].includes(contract.status)) return Response.json({ error: 'Contract not yet signed' }, { status: 400 });
      const signedAt = new Date(contract.signed_at).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
      await sendEmail(signer_email, `Your Signed Copy: ${contract.title} — Creative Books SA`,
        signedConfirmHtml({ signerName: contract.signer_name, contractTitle: contract.title, signedAt, contractFileUrl: contract.contract_file_url || '' })
      );
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('contractSignature error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});