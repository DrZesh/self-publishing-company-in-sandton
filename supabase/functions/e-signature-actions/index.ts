import { createClient } from 'npm:@supabase/supabase-js@2';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140) || 'signature.png';
}

function storageUri(bucket: string, path: string) {
  return `supabase://${bucket}/${path}`;
}

function parseStorageUri(value?: string | null) {
  const match = value?.match(/^supabase:\/\/([^/]+)\/(.+)$/);
  return match ? { bucket: match[1], path: match[2] } : null;
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

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function appendAudit(existing: unknown, event: Record<string, unknown>) {
  const trail = Array.isArray(existing) ? [...existing] : [];
  trail.push({ ...event, timestamp: new Date().toISOString() });
  return trail;
}

function signingEmailHtml(req: Record<string, unknown>, signingUrl: string) {
  const adminSigned = Boolean(req.admin_signed_at);
  const intro = adminSigned
    ? 'Creative Books SA has already signed this document. Please review it and complete your signature.'
    : String(req.email_message || 'Please review and sign the document below.');
  return `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:Arial,sans-serif;color:#1A1208"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center"><table width="100%" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="height:8px;background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6)"></td></tr><tr><td style="background:#1A1208;padding:28px 32px"><div style="color:#B87333;font-size:22px;font-weight:800">CREATIVE BOOKS SA</div><div style="color:#fff;opacity:.6;font-size:12px;margin-top:4px">Secure Document Signing</div></td></tr><tr><td style="padding:32px"><h2 style="margin:0 0 12px">Hi ${escapeHtml(req.recipient_name || 'there')},</h2><p style="color:#555;line-height:1.6">${escapeHtml(intro)}</p><div style="background:#faf8f4;border:1px solid #ead8c7;border-radius:12px;padding:20px;margin:22px 0"><div style="font-size:11px;color:#888;text-transform:uppercase">${escapeHtml(req.document_category || 'Document')}</div><div style="font-size:18px;font-weight:700;margin-top:6px">${escapeHtml(req.title)}</div></div><div style="text-align:center;margin:28px 0"><a href="${signingUrl}" style="display:inline-block;background:#B87333;color:white;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:700">Review and Sign</a></div><p style="font-size:12px;color:#999;text-align:center">Secure link. Do not share it with anyone else.</p></td></tr></table></td></tr></table></body></html>`;
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

  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.replace(/^Bearer\s+/i, '');
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const rawIp = request.headers.get('cf-connecting-ip') || forwardedFor || request.headers.get('x-real-ip') || 'unknown';
  const ua = request.headers.get('user-agent') || '';
  const { device, browser } = parseUA(ua);
  const salt = Deno.env.get('CAPTURE_IP_SALT') || 'creative-books-signature-audit';
  const ipHash = rawIp === 'unknown' ? null : await sha256(`${rawIp}:${salt}`);
  const siteUrl = (Deno.env.get('SITE_URL') || request.headers.get('origin') || 'https://www.creativebooks.co.za').replace(/\/$/, '');

  const requireAdmin = async () => {
    if (!bearer) throw new Error('Unauthorized');
    const { data: userData, error: userError } = await admin.auth.getUser(bearer);
    if (userError || !userData.user) throw new Error('Unauthorized');
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', userData.user.id)
      .single();
    if (profileError || !['super_admin', 'admin'].includes(profile?.role)) throw new Error('Admin access required');
    return { user: userData.user, profile };
  };

  const getRequest = async (id: string) => {
    const { data, error } = await admin.from('e_signature_requests').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  };

  const signedUrl = async (value?: string | null, expiresIn = 3600) => {
    const parsed = parseStorageUri(value);
    if (!parsed) return value || null;
    const { data, error } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  };

  const hydrateRequest = async (req: Record<string, unknown>) => ({
    ...req,
    file_url: await signedUrl(req.file_url as string, 3600),
    admin_signature_url: await signedUrl(req.admin_signature_url as string, 3600),
    signature_image_url: await signedUrl(req.signature_image_url as string, 3600),
    signed_document_url: await signedUrl(req.signed_document_url as string, 3600),
    signer_ip: req.signer_ip_hash ? 'Recorded securely' : null,
  });

  const validateToken = async (requestId: string, token: string, allowSigned = true) => {
    const req = await getRequest(requestId);
    if (!req) throw new Error('Request not found');
    if (!token || req.sign_token !== token) throw new Error('Invalid token');
    const signedStatuses = ['Signed', 'Client Signed', 'Fully Signed'];
    if (allowSigned && signedStatuses.includes(req.status)) return req;
    if (req.expires_at && new Date(req.expires_at) < new Date()) {
      await admin.from('e_signature_requests').update({ status: 'Expired' }).eq('id', req.id);
      throw new Error('Link expired');
    }
    if (['Cancelled', 'Archived', 'Declined'].includes(req.status)) throw new Error(`Signing request is ${req.status.toLowerCase()}`);
    return req;
  };

  const recordAudit = async (
    req: Record<string, unknown>,
    event: string,
    actorType: 'admin' | 'client' | 'system',
    values: Record<string, unknown> = {},
  ) => {
    const legacyEvent = {
      event,
      actor: values.actor_email || null,
      ip: values.ip_hash ? 'recorded_securely' : null,
      device: values.device || null,
      browser: values.browser || null,
      ...(values.metadata as Record<string, unknown> || {}),
    };
    const nextTrail = appendAudit(req.audit_trail, legacyEvent);
    const { error: updateError } = await admin.from('e_signature_requests').update({ audit_trail: nextTrail }).eq('id', req.id);
    if (updateError) throw updateError;
    const { error: auditError } = await admin.from('signature_audit_events').insert({
      request_id: req.id,
      event,
      actor_type: actorType,
      actor_email: values.actor_email || null,
      ip_hash: values.ip_hash || null,
      device: values.device || null,
      browser: values.browser || null,
      user_agent: values.user_agent || null,
      metadata: values.metadata || {},
    });
    if (auditError) throw auditError;
    return nextTrail;
  };

  const sendEmail = async (to: string, subject: string, html: string) => {
    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) throw new Error('Email service is not configured');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [to],
        subject,
        html,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || 'Unable to send email');
    return result;
  };

  const certificateBytes = (req: Record<string, unknown>) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setFillColor(26, 18, 8); pdf.rect(0, 0, 210, 45, 'F');
    pdf.setFillColor(184, 115, 51); pdf.rect(0, 43, 210, 3, 'F');
    pdf.setTextColor(184, 115, 51); pdf.setFontSize(18); pdf.text('CREATIVE BOOKS SA', 15, 18);
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(11); pdf.text('ELECTRONIC SIGNATURE CERTIFICATE', 15, 29);
    pdf.setFontSize(8); pdf.text('Audit-backed confirmation of electronic signature completion', 15, 37);

    const fullySigned = Boolean(req.admin_signed_at && req.signed_at);
    const fields: Array<[string, string]> = [
      ['Document Title', String(req.title || 'Document')],
      ['Document Type', String(req.document_category || 'Document')],
      ['Status', fullySigned ? 'FULLY SIGNED BY BOTH PARTIES' : String(req.status || 'SIGNED')],
      ['Reference', String(req.id || '').slice(-12).toUpperCase()],
      ['Client Signer', String(req.signer_confirmed_name || req.recipient_name || 'N/A')],
      ['Client Email', String(req.signer_confirmed_email || req.recipient_email || 'N/A')],
      ['Client Signed At', req.signed_at ? new Date(String(req.signed_at)).toLocaleString('en-ZA') : 'N/A'],
      ['Signature Method', String(req.signature_method || 'N/A')],
      ['Client Network Audit', req.signer_ip_hash ? 'IP fingerprint recorded securely' : 'Not recorded'],
      ['Device', String(req.signer_device || 'Not recorded')],
      ['Browser', String(req.signer_browser || 'Not recorded')],
      ['Consent: Document Read', req.consent_read ? 'Yes' : 'No'],
      ['Consent: Identity Confirmed', req.consent_identity ? 'Yes' : 'No'],
      ['Consent: Authorised', req.consent_authorised ? 'Yes' : 'No'],
      ['Consent: Electronic Signature', req.consent_electronic ? 'Yes' : 'No'],
    ];
    if (req.admin_signed_at) {
      fields.splice(4, 0,
        ['Admin Signer', String(req.admin_signer_name || 'Creative Books SA')],
        ['Admin Email', String(req.admin_signer_email || 'info@creativebooks.co.za')],
        ['Admin Signed At', new Date(String(req.admin_signed_at)).toLocaleString('en-ZA')],
      );
    }

    let y = 58;
    for (const [label, value] of fields) {
      if (y > 272) { pdf.addPage(); y = 20; }
      pdf.setFillColor(250, 248, 244); pdf.roundedRect(15, y - 4, 180, 10, 1, 1, 'F');
      pdf.setTextColor(145, 105, 65); pdf.setFontSize(7); pdf.text(label.toUpperCase(), 18, y + 1);
      pdf.setTextColor(26, 18, 8); pdf.setFontSize(8.5); pdf.text(String(value).slice(0, 90), 80, y + 1);
      y += 12;
    }
    return new Uint8Array(pdf.output('arraybuffer'));
  };

  const generateSignedBundle = async (req: Record<string, unknown>) => {
    const certBytes = certificateBytes(req);
    let output = certBytes;

    let sourceValue = req.file_url as string;
    if (req.document_id) {
      const { data: doc } = await admin.from('documents').select('file_url, file_type, file_name').eq('id', req.document_id).maybeSingle();
      if (doc?.file_url) sourceValue = doc.file_url;
    }

    try {
      const sourceUrl = await signedUrl(sourceValue, 600);
      const looksPdf = /\.pdf($|\?)/i.test(sourceUrl || '') || /\.pdf$/i.test(String(req.file_name || ''));
      if (sourceUrl && looksPdf) {
        const sourceResponse = await fetch(sourceUrl);
        if (sourceResponse.ok) {
          const sourcePdf = await PDFDocument.load(await sourceResponse.arrayBuffer());
          const certPdf = await PDFDocument.load(certBytes);
          const certPages = await sourcePdf.copyPages(certPdf, certPdf.getPageIndices());
          certPages.forEach(page => sourcePdf.addPage(page));
          output = new Uint8Array(await sourcePdf.save());
        }
      }
    } catch (error) {
      console.warn('Source PDF merge skipped:', (error as Error).message);
    }

    const path = `signed/${req.id}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await admin.storage.from('signature-artifacts').upload(path, output, {
      contentType: 'application/pdf', upsert: false,
    });
    if (uploadError) throw uploadError;
    return storageUri('signature-artifacts', path);
  };

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'send' || action === 'resend') {
      const { user } = await requireAdmin();
      const req = await getRequest(body.request_id);
      if (!req) return json({ error: 'Request not found' }, 404);
      const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '').slice(0, 24);
      const expiresAt = action === 'send' && req.expires_at
        ? req.expires_at
        : new Date(Date.now() + 14 * 86400000).toISOString();
      const signingUrl = `${siteUrl}/sign/esig/${req.id}/${token}`;
      const now = new Date().toISOString();
      const updates: Record<string, unknown> = {
        sign_token: token,
        expires_at: expiresAt,
        status: 'Sent',
      };
      if (action === 'send') {
        updates.sent_at = now;
        updates.sent_by = user.email;
      } else {
        updates.reminder_sent_count = (req.reminder_sent_count || 0) + 1;
        updates.last_reminder_at = now;
      }
      const nextTrail = appendAudit(req.audit_trail, { event: action === 'send' ? 'sent' : 'resent', actor: user.email, timestamp: now });
      updates.audit_trail = nextTrail;
      const { error: updateError } = await admin.from('e_signature_requests').update(updates).eq('id', req.id);
      if (updateError) throw updateError;
      const { error: auditError } = await admin.from('signature_audit_events').insert({
        request_id: req.id, event: action === 'send' ? 'sent' : 'resent', actor_type: 'admin', actor_email: user.email,
        metadata: { expires_at: expiresAt },
      });
      if (auditError) throw auditError;

      await sendEmail(
        req.recipient_email,
        req.email_subject || `${action === 'resend' ? 'Reminder: ' : ''}Please sign: ${req.title}`,
        signingEmailHtml({ ...req, expires_at: expiresAt }, signingUrl),
      );

      if (req.send_whatsapp && req.recipient_phone && Deno.env.get('CALLMEBOT_API_KEY')) {
        const phone = String(req.recipient_phone).replace(/\D/g, '');
        const message = `Hi ${req.recipient_name || ''}, please sign "${req.title}" for Creative Books SA: ${signingUrl}`;
        await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${Deno.env.get('CALLMEBOT_API_KEY')}`).catch(() => null);
      }

      return json({ success: true, signing_url: signingUrl, expires_at: expiresAt });
    }

    if (action === 'track_open') {
      let req;
      try {
        req = await validateToken(body.request_id, body.token, true);
      } catch (error) {
        const message = (error as Error).message;
        return json({ error: message, expired: message === 'Link expired' }, message === 'Link expired' ? 410 : 403);
      }
      const signedStatuses = ['Signed', 'Client Signed', 'Fully Signed'];
      if (signedStatuses.includes(req.status)) {
        return json({ success: true, doc: await hydrateRequest(req), already_signed: true });
      }
      const now = new Date().toISOString();
      const firstOpen = ['Sent', 'Delivered'].includes(req.status);
      const { data: updated, error } = await admin.from('e_signature_requests').update({
        status: firstOpen ? 'Opened' : req.status,
        opened_at: req.opened_at || now,
        viewed_at: now,
        open_count: (req.open_count || 0) + 1,
        signer_ip_hash: ipHash,
        signer_device: device,
        signer_browser: browser,
        signer_user_agent: ua,
        audit_trail: appendAudit(req.audit_trail, { event: 'opened', ip: ipHash ? 'recorded_securely' : null, device, browser, timestamp: now }),
      }).eq('id', req.id).select('*').single();
      if (error) throw error;
      await admin.from('signature_audit_events').insert({
        request_id: req.id, event: 'opened', actor_type: 'client', ip_hash: ipHash,
        device, browser, user_agent: ua,
      });
      return json({ success: true, doc: await hydrateRequest(updated) });
    }

    if (action === 'signing_started') {
      let req;
      try { req = await validateToken(body.request_id, body.token, false); }
      catch (error) { return json({ error: (error as Error).message }, 403); }
      const now = new Date().toISOString();
      const trail = appendAudit(req.audit_trail, { event: 'signing_started', ip: ipHash ? 'recorded_securely' : null, device, browser, timestamp: now });
      const { error } = await admin.from('e_signature_requests').update({
        status: 'Signing Started', signing_started_at: now, audit_trail: trail,
      }).eq('id', req.id);
      if (error) throw error;
      await admin.from('signature_audit_events').insert({
        request_id: req.id, event: 'signing_started', actor_type: 'client', ip_hash: ipHash,
        device, browser, user_agent: ua,
      });
      return json({ success: true });
    }

    if (action === 'create_upload_url') {
      let req;
      try { req = await validateToken(body.request_id, body.token, false); }
      catch (error) { return json({ error: (error as Error).message }, 403); }
      const path = `public/${req.id}/${crypto.randomUUID()}-${safeFileName(body.file_name || 'signature.png')}`;
      const { data, error } = await admin.storage.from('signature-artifacts').createSignedUploadUrl(path);
      if (error) throw error;
      return json({ success: true, bucket: 'signature-artifacts', path, token: data.token, file_url: storageUri('signature-artifacts', path) });
    }

    if (action === 'submit_signature') {
      let req;
      try { req = await validateToken(body.request_id, body.token, false); }
      catch (error) { return json({ error: (error as Error).message }, 403); }
      if (!body.signature_image_url) return json({ error: 'Signature is required' }, 400);
      if (!body.confirmed_name || !body.confirmed_email) return json({ error: 'Signer name and email are required' }, 400);
      if (![body.consent_read, body.consent_identity, body.consent_authorised, body.consent_electronic, body.consent_submit].every(Boolean)) {
        return json({ error: 'All signing consents are required' }, 400);
      }

      const now = new Date().toISOString();
      const finalStatus = req.admin_signed_at ? 'Fully Signed' : 'Client Signed';
      const signedAudit = appendAudit(req.audit_trail, {
        event: 'signed', actor: body.confirmed_email, confirmed_name: body.confirmed_name,
        ip: ipHash ? 'recorded_securely' : null, device, browser,
        signature_method: body.signature_method, timestamp: now,
      });
      const updatePayload = {
        status: finalStatus,
        signed_at: now,
        signature_image_url: body.signature_image_url,
        signature_method: body.signature_method,
        signer_confirmed_name: body.confirmed_name,
        signer_confirmed_email: body.confirmed_email,
        signer_ip_hash: ipHash,
        signer_device: device,
        signer_browser: browser,
        signer_user_agent: ua,
        consent_read: true,
        consent_identity: true,
        consent_authorised: true,
        consent_electronic: true,
        consent_submit: true,
        pdf_generation_status: 'processing',
        audit_trail: signedAudit,
      };
      const { data: signedReq, error: updateError } = await admin
        .from('e_signature_requests').update(updatePayload).eq('id', req.id).select('*').single();
      if (updateError) throw updateError;
      await admin.from('signature_audit_events').insert({
        request_id: req.id, event: 'signed', actor_type: 'client', actor_email: body.confirmed_email,
        ip_hash: ipHash, device, browser, user_agent: ua,
        metadata: {
          confirmed_name: body.confirmed_name,
          signature_method: body.signature_method,
          consents: ['read', 'identity', 'authorised', 'electronic', 'submit'],
        },
      });

      if (req.document_id) {
        await admin.from('documents').update({
          status: 'Signed', signed_at: now, signature_url: body.signature_image_url,
        }).eq('id', req.document_id);
        const { data: linkedDoc } = await admin.from('documents').select('contact_id').eq('id', req.document_id).maybeSingle();
        await admin.from('document_activities').insert({
          document_id: req.document_id, contact_id: linkedDoc?.contact_id || null,
          action: 'signed', actor_type: 'client', actor_email: body.confirmed_email,
          actor_ip_hash: ipHash, actor_device: device, actor_browser: browser,
          notes: `Signed electronically by ${body.confirmed_name}.`,
        });
      }

      let bundleUri: string | null = null;
      try {
        bundleUri = await generateSignedBundle(signedReq);
        const bundleAudit = appendAudit(signedAudit, { event: 'certificate_generated', actor: 'system', timestamp: new Date().toISOString() });
        await admin.from('e_signature_requests').update({
          signed_document_url: bundleUri,
          pdf_generation_status: 'done',
          audit_trail: bundleAudit,
        }).eq('id', req.id);
        await admin.from('signature_audit_events').insert({
          request_id: req.id, event: 'certificate_generated', actor_type: 'system',
          metadata: { bundle_created: true },
        });
      } catch (error) {
        await admin.from('e_signature_requests').update({ pdf_generation_status: 'failed' }).eq('id', req.id);
        await admin.from('signature_audit_events').insert({
          request_id: req.id, event: 'certificate_failed', actor_type: 'system',
          metadata: { error: (error as Error).message },
        });
      }

      const signingUrl = `${siteUrl}/sign/esig/${req.id}/${body.token}`;
      await sendEmail(
        'info@creativebooks.co.za',
        `${finalStatus === 'Fully Signed' ? 'Fully Signed' : 'Client Signed'}: ${req.title}`,
        `<p><strong>${escapeHtml(body.confirmed_name)}</strong> (${escapeHtml(body.confirmed_email)}) signed <strong>${escapeHtml(req.title)}</strong>.</p><p>Status: ${escapeHtml(finalStatus)}</p><p>Signed: ${escapeHtml(new Date(now).toLocaleString('en-ZA'))}</p>`,
      ).catch(() => null);
      if (req.allow_download_after_sign) {
        await sendEmail(
          body.confirmed_email,
          `Your signed document: ${req.title}`,
          `<p>Hi ${escapeHtml(body.confirmed_name)},</p><p>Thank you for signing <strong>${escapeHtml(req.title)}</strong>.</p><p>Your signed document and electronic signature certificate are available through the secure link below.</p><p><a href="${signingUrl}">Open signed document</a></p>`,
        ).catch(() => null);
      }

      return json({
        success: true,
        final_status: finalStatus,
        signed_document_url: bundleUri ? await signedUrl(bundleUri, 3600) : null,
      });
    }

    if (action === 'generate_pdf') {
      await requireAdmin();
      const req = await getRequest(body.request_id);
      if (!req) return json({ error: 'Request not found' }, 404);
      if (!['Signed', 'Client Signed', 'Fully Signed'].includes(req.status)) return json({ error: 'Document has not been signed yet' }, 400);
      await admin.from('e_signature_requests').update({ pdf_generation_status: 'processing' }).eq('id', req.id);
      try {
        const bundleUri = await generateSignedBundle(req);
        const trail = appendAudit(req.audit_trail, { event: 'certificate_generated', actor: 'system', timestamp: new Date().toISOString() });
        await admin.from('e_signature_requests').update({
          signed_document_url: bundleUri, pdf_generation_status: 'done', audit_trail: trail,
        }).eq('id', req.id);
        await admin.from('signature_audit_events').insert({
          request_id: req.id, event: 'certificate_generated', actor_type: 'system', metadata: { manual_retry: true },
        });
        return json({ success: true, signed_document_url: await signedUrl(bundleUri, 3600) });
      } catch (error) {
        await admin.from('e_signature_requests').update({ pdf_generation_status: 'failed' }).eq('id', req.id);
        return json({ error: `PDF generation failed: ${(error as Error).message}` }, 500);
      }
    }

    if (action === 'decline') {
      let req;
      try { req = await validateToken(body.request_id, body.token, false); }
      catch (error) { return json({ error: (error as Error).message }, 403); }
      const now = new Date().toISOString();
      const trail = appendAudit(req.audit_trail, { event: 'declined', reason: body.reason || '', ip: ipHash ? 'recorded_securely' : null, device, timestamp: now });
      const { error } = await admin.from('e_signature_requests').update({
        status: 'Declined', declined_at: now, decline_reason: body.reason || '', audit_trail: trail,
      }).eq('id', req.id);
      if (error) throw error;
      await admin.from('signature_audit_events').insert({
        request_id: req.id, event: 'declined', actor_type: 'client', ip_hash: ipHash,
        device, browser, user_agent: ua, metadata: { reason: body.reason || '' },
      });
      return json({ success: true });
    }

    if (action === 'get_request') {
      let req;
      try { req = await validateToken(body.request_id, body.token, true); }
      catch (error) { return json({ error: (error as Error).message }, 403); }
      return json({ success: true, request: await hydrateRequest(req) });
    }

    if (action === 'admin_sign') {
      const { user, profile } = await requireAdmin();
      const req = await getRequest(body.request_id);
      if (!req) return json({ error: 'Request not found' }, 404);
      const now = new Date().toISOString();
      const trail = appendAudit(req.audit_trail, {
        event: 'admin_signed', actor: user.email, admin_name: body.admin_signer_name || profile.full_name || user.email, timestamp: now,
      });
      const { error } = await admin.from('e_signature_requests').update({
        status: 'Admin Signed',
        admin_signed_at: now,
        admin_signature_url: body.admin_signature_url,
        admin_field_values: body.admin_field_values || {},
        admin_signer_name: body.admin_signer_name || profile.full_name || user.email,
        admin_signer_email: user.email,
        signing_order: 'admin_first',
        audit_trail: trail,
      }).eq('id', req.id);
      if (error) throw error;
      await admin.from('signature_audit_events').insert({
        request_id: req.id, event: 'admin_signed', actor_type: 'admin', actor_email: user.email,
        metadata: { admin_signer_name: body.admin_signer_name || profile.full_name || user.email },
      });
      return json({ success: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = (error as Error).message || 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    return json({ error: message }, status);
  }
});
