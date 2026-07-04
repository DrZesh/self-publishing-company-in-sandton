import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FROM_EMAIL = Deno.env.get('CONTRACT_FROM_EMAIL') || 'Creative Books SA <info@creativebooks.co.za>';
const ADMIN_EMAIL = Deno.env.get('CONTRACT_ADMIN_EMAIL') || 'info@creativebooks.co.za';
const SITE_URL = (Deno.env.get('SITE_URL') || 'https://creativebooks.co.za').replace(/\/$/, '');
const BRAND = '#B87333';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function addAuditEvent(existing, event, extra = {}) {
  const trail = Array.isArray(existing) ? [...existing] : [];
  trail.push({ event, timestamp: new Date().toISOString(), ...extra });
  return trail;
}

function clientIp(request) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '';
}

async function hashValue(value) {
  if (!value) return null;
  const salt = Deno.env.get('CAPTURE_IP_SALT') || Deno.env.get('CONTRACT_AUDIT_SALT');
  if (!salt) throw new Error('CAPTURE_IP_SALT or CONTRACT_AUDIT_SALT is required for contract audit hashing.');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${value}`));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function parseStorageUri(value) {
  const match = typeof value === 'string' ? value.match(/^supabase:\/\/([^/]+)\/(.+)$/) : null;
  return match ? { bucket: match[1], path: match[2] } : null;
}

async function signedStorageUrl(admin, value, expiresIn = 3600) {
  const parsed = parseStorageUri(value);
  if (!parsed) return value || '';
  const { data, error } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

async function sendEmail(to, subject, html) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'Contract email delivery failed.');
  return payload;
}

function emailShell(title, content) {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#222"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px"><table width="600" style="width:100%;max-width:600px;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="height:8px;background:${BRAND}"></td></tr><tr><td style="padding:32px"><h1 style="font-size:24px;margin:0 0 18px">${title}</h1>${content}</td></tr><tr><td style="padding:18px 32px;border-top:1px solid #eee;font-size:12px;color:#888">Creative Books SA · info@creativebooks.co.za · 084 230 5393</td></tr></table></td></tr></table></body></html>`;
}

function signingEmailHtml({ contactName, contractTitle, signingUrl, expiryDate }) {
  return emailShell('Your Contract is Ready to Sign', `
    <p>Hi ${escapeHtml(contactName)},</p>
    <p>Your contract <strong>${escapeHtml(contractTitle)}</strong> is ready for your electronic signature.</p>
    <p style="text-align:center;margin:28px 0"><a href="${escapeHtml(signingUrl)}" style="display:inline-block;background:${BRAND};color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold">Sign Contract</a></p>
    ${expiryDate ? `<p style="font-size:13px;color:#777;text-align:center">This signing link expires on ${escapeHtml(expiryDate)}.</p>` : ''}
    <p>Read the full document carefully, complete the required fields, provide your signature and submit your consent.</p>
  `);
}

function signedEmailHtml({ signerName, contractTitle, signedAt, contractFileUrl }) {
  return emailShell('Contract Signed Successfully', `
    <p>Hi ${escapeHtml(signerName)},</p>
    <p>Thank you for signing <strong>${escapeHtml(contractTitle)}</strong>.</p>
    <p><strong>Signed on:</strong> ${escapeHtml(signedAt)}</p>
    ${contractFileUrl ? `<p style="text-align:center;margin:28px 0"><a href="${escapeHtml(contractFileUrl)}" style="display:inline-block;background:#1a4a2a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Download Contract</a></p>` : ''}
    <p>Your signed record has been captured and the linked project workflow has been updated.</p>
  `);
}

function adminSignedNoticeHtml({ signerName, signerEmail, contractTitle, signedAt, ipHash }) {
  return emailShell('Contract Signed', `
    <p>A client has electronically signed a contract.</p>
    <p><strong>Contract:</strong> ${escapeHtml(contractTitle)}<br><strong>Signer:</strong> ${escapeHtml(signerName)} &lt;${escapeHtml(signerEmail)}&gt;<br><strong>Signed:</strong> ${escapeHtml(signedAt)}${ipHash ? `<br><strong>Audit fingerprint:</strong> ${escapeHtml(ipHash.slice(0, 16))}…` : ''}</p>
    <p><a href="${SITE_URL}/admin/contracts">Open Contracts in the CRM</a></p>
  `);
}

async function requireAdmin(admin, request) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('Unauthorized');

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || !['super_admin', 'admin'].includes(profile?.role)) throw new Error('Admin access required');
  return { ...userData.user, ...profile, email: profile.email || userData.user.email };
}

async function contractByToken(admin, token) {
  if (!token || typeof token !== 'string') return null;
  const { data, error } = await admin
    .from('contracts')
    .select('*')
    .eq('sign_token', token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function ensureTokenActive(contract) {
  if (!contract) throw new Error('Invalid signing link');
  if (contract.sign_token_expires && Date.parse(contract.sign_token_expires) < Date.now()) {
    throw new Error('Signing link has expired');
  }
  if (['Signed', 'Fully Signed', 'Declined', 'Cancelled', 'Archived'].includes(contract.status)) {
    throw new Error(`This contract has already been ${contract.status.toLowerCase()}.`);
  }
}

async function loadContractAndContact(admin, contractId) {
  const { data: contract, error: contractError } = await admin
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .maybeSingle();
  if (contractError) throw contractError;
  if (!contract) throw new Error('Contract not found');

  const { data: contact, error: contactError } = await admin
    .from('contacts')
    .select('id, full_name, email')
    .eq('id', contract.contact_id)
    .maybeSingle();
  if (contactError) throw contactError;
  if (!contact) throw new Error('Contact not found');
  return { contract, contact };
}

async function sendForSignature(admin, user, contractId, resend = false) {
  const { contract, contact } = await loadContractAndContact(admin, contractId);
  if (!contact.email) throw new Error('Contact email is missing');
  if (!contract.contract_file_url) throw new Error('Attach a contract document before sending it for signature.');

  const token = resend && contract.sign_token
    ? contract.sign_token
    : `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const signingUrl = `${SITE_URL}/sign/contract/${token}`;
  const event = resend ? 'resent' : 'sent';
  const auditTrail = addAuditEvent(contract.audit_trail, event, {
    actor: user.email,
    recipient: contact.email,
  });

  const updates = {
    status: resend ? 'Resent' : 'Sent for Signature',
    sign_token: token,
    sign_token_expires: expires.toISOString(),
    audit_trail: auditTrail,
    ...(resend
      ? { reminder_count: Number(contract.reminder_count || 0) + 1, reminder_sent_at: new Date().toISOString() }
      : { sent_at: new Date().toISOString() }),
  };

  const { error: updateError } = await admin.from('contracts').update(updates).eq('id', contract.id);
  if (updateError) throw updateError;

  await sendEmail(
    contact.email,
    resend ? `Reminder: Please Sign Your Contract - ${contract.title}` : `Action Required: Sign Your Contract - ${contract.title}`,
    signingEmailHtml({
      contactName: contact.full_name,
      contractTitle: contract.title,
      signingUrl,
      expiryDate: expires.toLocaleDateString('en-ZA'),
    }),
  );

  return { success: true, signingUrl };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Supabase service environment is not configured.' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action;
    if (!action) return json({ error: 'action is required' }, 400);

    if (action === 'send' || action === 'resend') {
      const user = await requireAdmin(admin, request);
      const result = await sendForSignature(admin, user, body.contract_id, action === 'resend');
      return json(result);
    }

    if (action === 'admin_sign') {
      const user = await requireAdmin(admin, request);
      const { data: contract, error: fetchError } = await admin
        .from('contracts')
        .select('*')
        .eq('id', body.contract_id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!contract) return json({ error: 'Contract not found' }, 404);

      const now = new Date().toISOString();
      const { error } = await admin.from('contracts').update({
        status: 'Admin Signed',
        admin_signed_at: now,
        admin_signature_url: body.admin_signature_url || null,
        contract_field_values: body.contract_field_values || {},
        admin_signer_name: body.admin_signer_name || user.full_name || user.email,
        admin_signer_email: user.email,
        audit_trail: addAuditEvent(contract.audit_trail, 'admin_signed', {
          actor: user.email,
          admin_name: body.admin_signer_name || user.full_name || user.email,
        }),
      }).eq('id', contract.id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === 'get_by_token') {
      const contract = await contractByToken(admin, body.token);
      if (!contract) return json({ error: 'Invalid or expired link' }, 404);

      if (contract.sign_token_expires && Date.parse(contract.sign_token_expires) < Date.now()) {
        await admin.from('contracts').update({ status: 'Expired' }).eq('id', contract.id);
        return json({ error: 'This signing link has expired. Please contact Creative Books SA.' }, 410);
      }
      if (['Signed', 'Fully Signed', 'Declined', 'Cancelled', 'Archived'].includes(contract.status)) {
        return json({ error: `This contract has already been ${contract.status.toLowerCase()}.` }, 409);
      }

      if (['opened', 'viewed'].includes(body.event)) {
        const ipHash = await hashValue(clientIp(request));
        const now = new Date().toISOString();
        const updates = {
          audit_trail: addAuditEvent(contract.audit_trail, body.event, {
            ip_hash: ipHash,
            user_agent: request.headers.get('user-agent') || body.user_agent || '',
          }),
        };
        if (body.event === 'opened' && !contract.opened_at) updates.opened_at = now;
        if (body.event === 'viewed' && !contract.viewed_at) updates.viewed_at = now;
        if (body.event === 'opened' && ['Sent for Signature', 'Resent'].includes(contract.status)) updates.status = 'Opened';
        if (body.event === 'viewed' && ['Sent for Signature', 'Resent', 'Opened'].includes(contract.status)) updates.status = 'Viewed';
        const { error: updateError } = await admin.from('contracts').update(updates).eq('id', contract.id);
        if (updateError) throw updateError;
      }

      const { data: contact, error: contactError } = await admin
        .from('contacts')
        .select('full_name, email')
        .eq('id', contract.contact_id)
        .maybeSingle();
      if (contactError) throw contactError;

      return json({
        contract: {
          id: contract.id,
          title: contract.title,
          book_title: contract.book_title,
          contract_file_url: await signedStorageUrl(admin, contract.contract_file_url, 7200),
          status: contract.status,
          admin_signature_url: await signedStorageUrl(admin, contract.admin_signature_url, 7200),
          admin_signed_at: contract.admin_signed_at,
          admin_signer_name: contract.admin_signer_name,
          contract_field_values: contract.contract_field_values || {},
        },
        contact: contact || null,
      });
    }

    if (action === 'create_upload_url') {
      const contract = await contractByToken(admin, body.token);
      ensureTokenActive(contract);
      const contentType = String(body.content_type || '').toLowerCase();
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(contentType)) {
        return json({ error: 'Only PNG, JPEG or WebP signature images are allowed.' }, 400);
      }
      const safeName = String(body.file_name || 'signature.png').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
      const path = `contracts/${contract.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { data, error } = await admin.storage.from('signature-artifacts').createSignedUploadUrl(path);
      if (error) throw error;
      return json({
        bucket: 'signature-artifacts',
        path,
        token: data.token,
        file_url: `supabase://signature-artifacts/${path}`,
      });
    }

    if (action === 'signing_started') {
      const contract = await contractByToken(admin, body.token);
      if (!contract) return json({ ok: false });
      ensureTokenActive(contract);
      const { error } = await admin.from('contracts').update({
        status: 'Signing Started',
        audit_trail: addAuditEvent(contract.audit_trail, 'signing_started'),
      }).eq('id', contract.id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === 'sign') {
      const contract = await contractByToken(admin, body.token);
      ensureTokenActive(contract);
      const ipHash = await hashValue(clientIp(request));
      const userAgent = request.headers.get('user-agent') || body.user_agent || '';

      if (body.declined) {
        const { data, error } = await admin.rpc('decline_legacy_contract', {
          p_contract_id: contract.id,
          p_signer_name: body.signer_name || '',
          p_signer_email: body.signer_email || '',
          p_declined_reason: body.declined_reason || '',
          p_signer_ip_hash: ipHash,
          p_signer_user_agent: userAgent,
        });
        if (error) throw error;

        await sendEmail(
          ADMIN_EMAIL,
          `Contract Declined - ${contract.title}`,
          emailShell('Contract Declined', `<p>${escapeHtml(body.signer_name)} (${escapeHtml(body.signer_email)}) declined <strong>${escapeHtml(contract.title)}</strong>.</p><p><strong>Reason:</strong> ${escapeHtml(body.declined_reason || 'Not provided')}</p>`),
        ).catch(error => console.error('Decline email failed:', error.message));

        return json({ success: true, status: 'declined', contract: data });
      }

      const { data: completed, error: completeError } = await admin.rpc('complete_legacy_contract_signature', {
        p_contract_id: contract.id,
        p_signer_name: body.signer_name,
        p_signer_email: body.signer_email,
        p_signature_image_url: body.signature_image_url || body.signature_image_data || '',
        p_signature_method: body.sign_mode || 'draw',
        p_legal_consent: Boolean(body.legal_consent),
        p_signer_ip_hash: ipHash,
        p_signer_user_agent: userAgent,
        p_client_field_values: body.client_field_values || {},
      });
      if (completeError) throw completeError;

      const signedAtIso = completed.signed_at || new Date().toISOString();
      const signedAtDisplay = new Date(signedAtIso).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
      const contractFileUrl = await signedStorageUrl(admin, completed.signed_file_url || completed.contract_file_url, 7 * 24 * 60 * 60);

      const notifications = [
        sendEmail(
          ADMIN_EMAIL,
          `Contract Signed - ${contract.title}`,
          adminSignedNoticeHtml({
            signerName: body.signer_name,
            signerEmail: body.signer_email,
            contractTitle: contract.title,
            signedAt: signedAtDisplay,
            ipHash,
          }),
        ),
      ];
      if (body.signer_email) {
        notifications.push(sendEmail(
          body.signer_email,
          `Signed: ${contract.title} - Creative Books SA`,
          signedEmailHtml({
            signerName: body.signer_name,
            contractTitle: contract.title,
            signedAt: signedAtDisplay,
            contractFileUrl,
          }),
        ));
      }
      const notificationResults = await Promise.allSettled(notifications);
      notificationResults.forEach(result => {
        if (result.status === 'rejected') console.error('Contract notification failed:', result.reason?.message || result.reason);
      });

      return json({
        success: true,
        signed_at: signedAtIso,
        contract_file_url: contractFileUrl,
        contract_id: contract.id,
        sent_at: completed.sent_at || '',
        opened_at: completed.opened_at || '',
      });
    }

    if (action === 'resend_signed_copy') {
      if (!body.contract_id || !body.signer_email) return json({ error: 'Missing fields' }, 400);
      const { data: contract, error } = await admin.from('contracts').select('*').eq('id', body.contract_id).maybeSingle();
      if (error) throw error;
      if (!contract || contract.signer_email?.toLowerCase() !== String(body.signer_email).toLowerCase()) {
        return json({ error: 'Not authorized' }, 403);
      }
      if (!['Signed', 'Fully Signed'].includes(contract.status)) return json({ error: 'Contract not yet signed' }, 400);

      const contractFileUrl = await signedStorageUrl(admin, contract.signed_file_url || contract.contract_file_url, 7 * 24 * 60 * 60);
      const signedAt = new Date(contract.signed_at).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
      await sendEmail(
        body.signer_email,
        `Your Signed Copy: ${contract.title} - Creative Books SA`,
        signedEmailHtml({
          signerName: contract.signer_name,
          contractTitle: contract.title,
          signedAt,
          contractFileUrl,
        }),
      );
      return json({ success: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('contract-actions error:', error?.message || error);
    const message = error?.message || 'Unexpected contract workflow error.';
    if (message === 'Unauthorized') return json({ error: message }, 401);
    if (message === 'Admin access required') return json({ error: message }, 403);
    if (message.includes('not found')) return json({ error: message }, 404);
    if (message.includes('expired')) return json({ error: message }, 410);
    if (message.includes('already been')) return json({ error: message }, 409);
    if (message.includes('required') || message.includes('missing') || message.includes('allowed')) return json({ error: message }, 400);
    return json({ error: message }, 500);
  }
});
