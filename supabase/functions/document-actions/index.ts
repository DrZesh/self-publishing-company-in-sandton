import { createClient } from 'npm:@supabase/supabase-js@2';
import { jsPDF } from 'npm:jspdf@4.0.0';

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
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140) || 'file';
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
  const ipSalt = Deno.env.get('CAPTURE_IP_SALT') || 'creative-books-document-audit';
  const ipHash = rawIp === 'unknown' ? null : await sha256(`${rawIp}:${ipSalt}`);
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

  const getDocument = async (id: string) => {
    const { data, error } = await admin.from('documents').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  };

  const validatePublicDocument = async (documentId: string, token: string) => {
    const doc = await getDocument(documentId);
    if (!doc) throw new Error('Document not found');
    if (!token || doc.secure_token !== token) throw new Error('Invalid token');
    if (doc.access_revoked) throw new Error('Document access has been revoked');
    if (doc.expires_at && new Date(doc.expires_at) < new Date()) {
      await admin.from('documents').update({ status: 'Expired' }).eq('id', doc.id);
      throw new Error('Link expired');
    }
    return doc;
  };

  const signedUrl = async (value?: string | null, expiresIn = 3600) => {
    const parsed = parseStorageUri(value);
    if (!parsed) return value || null;
    const { data, error } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  };

  const publicDocument = async (doc: Record<string, unknown>) => ({
    ...doc,
    file_url: await signedUrl(doc.file_url as string, 3600),
    proof_url: await signedUrl(doc.proof_url as string, 3600),
    signature_url: await signedUrl(doc.signature_url as string, 3600),
    signed_document_url: await signedUrl(doc.signed_document_url as string, 3600),
  });

  const logActivity = async (
    documentId: string,
    contactId: string | null,
    action: string,
    values: Record<string, unknown> = {},
  ) => {
    const { error } = await admin.from('document_activities').insert({
      document_id: documentId,
      contact_id: contactId,
      action,
      timestamp: new Date().toISOString(),
      ...values,
    });
    if (error) throw error;
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

  const documentEmail = (doc: Record<string, unknown>, contact: Record<string, unknown>, url: string, reminder = false) => {
    const name = escapeHtml(contact.full_name || 'there');
    const category = escapeHtml(doc.category || 'Document');
    const fileName = escapeHtml(doc.document_title || doc.file_name || 'Document');
    const intro = reminder ? 'This is a reminder that a document is waiting for your attention.' : 'A document has been shared with you.';
    return `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:Arial,sans-serif;color:#1A1208"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center"><table width="100%" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="background:#1A1208;padding:28px 32px"><div style="color:#B87333;font-size:22px;font-weight:800">CREATIVE BOOKS SA</div><div style="color:#fff;opacity:.6;font-size:12px;margin-top:4px">Professional Publishing Services</div></td></tr><tr><td style="padding:32px"><h2 style="margin:0 0 12px">Hi ${name},</h2><p style="color:#555;line-height:1.6">${intro}</p><div style="background:#faf8f4;border:1px solid #ead8c7;border-radius:12px;padding:20px;margin:22px 0"><div style="font-size:11px;color:#888;text-transform:uppercase">${category}</div><div style="font-size:18px;font-weight:700;margin-top:6px">${fileName}</div></div><div style="text-align:center;margin:28px 0"><a href="${url}" style="display:inline-block;background:#B87333;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700">Open Secure Document</a></div><p style="font-size:12px;color:#999;text-align:center">This is a secure, time-limited link. Do not share it.</p></td></tr></table></td></tr></table></body></html>`;
  };

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'send' || action === 'resend') {
      const { user } = await requireAdmin();
      const doc = await getDocument(body.document_id);
      if (!doc) return json({ error: 'Document not found' }, 404);
      if (!doc.contact_id) return json({ error: 'Document has no linked client' }, 400);

      const { data: contact, error: contactError } = await admin
        .from('contacts').select('*').eq('id', doc.contact_id).maybeSingle();
      if (contactError) throw contactError;
      if (!contact?.email) return json({ error: 'Contact has no email address' }, 400);

      const secureToken = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '').slice(0, 16);
      const expiryDays = Number(body.expires_days) || doc.default_expiry_days || 30;
      const expiresAt = new Date(Date.now() + expiryDays * 86400000).toISOString();
      const actionUrl = `${siteUrl}/doc/view/${doc.id}/${secureToken}`;
      const now = new Date().toISOString();

      const updates: Record<string, unknown> = {
        secure_token: secureToken,
        expires_at: expiresAt,
        status: 'Sent to Client',
      };
      if (action === 'send') updates.sent_at = now;
      else {
        updates.reminder_sent_count = (doc.reminder_sent_count || 0) + 1;
        updates.last_reminder_at = now;
      }

      const { error: updateError } = await admin.from('documents').update(updates).eq('id', doc.id);
      if (updateError) throw updateError;

      await sendEmail(
        contact.email,
        `${action === 'resend' ? 'Reminder: ' : ''}${doc.category} | Creative Books SA`,
        documentEmail({ ...doc, expires_at: expiresAt }, contact, actionUrl, action === 'resend'),
      );

      await logActivity(doc.id, doc.contact_id, action === 'send' ? 'sent' : 'resent', {
        actor_type: 'admin',
        actor_email: user.email,
        notes: `${action === 'send' ? 'Sent' : 'Resent'} to ${contact.email}.`,
      });

      return json({ success: true, action_url: actionUrl, expires_at: expiresAt });
    }

    if (action === 'track_view') {
      let doc;
      try {
        doc = await validatePublicDocument(body.document_id, body.token);
      } catch (error) {
        const message = (error as Error).message;
        return json({ error: message }, message === 'Link expired' ? 410 : 403);
      }

      const now = new Date().toISOString();
      const firstOpen = doc.status === 'Sent to Client';
      const nextStatus = firstOpen ? 'Opened' : doc.status === 'Opened' ? 'Viewed' : doc.status;
      const { data: updated, error: updateError } = await admin
        .from('documents')
        .update({
          status: nextStatus,
          opened_at: doc.opened_at || now,
          viewed_at: now,
          open_count: (doc.open_count || 0) + 1,
        })
        .eq('id', doc.id)
        .select('*')
        .single();
      if (updateError) throw updateError;

      await logActivity(doc.id, doc.contact_id, firstOpen ? 'opened' : 'viewed', {
        actor_type: 'client',
        actor_ip_hash: ipHash,
        actor_device: device,
        actor_browser: browser,
        actor_user_agent: ua,
      });

      const { data: contact } = doc.contact_id
        ? await admin.from('contacts').select('id, full_name, email, phone, company').eq('id', doc.contact_id).maybeSingle()
        : { data: null };
      const { data: lineItems } = doc.quote_id
        ? await admin.from('quote_line_items').select('*').eq('quote_id', doc.quote_id).order('sort_order')
        : { data: [] };

      return json({ success: true, doc: await publicDocument(updated), contact, line_items: lineItems || [] });
    }

    if (action === 'track_download') {
      let doc;
      try {
        doc = await validatePublicDocument(body.document_id, body.token);
      } catch (error) {
        return json({ error: (error as Error).message }, 403);
      }
      const nextStatus = ['Sent to Client', 'Opened'].includes(doc.status) ? 'Downloaded' : doc.status;
      const { error } = await admin.from('documents').update({
        download_count: (doc.download_count || 0) + 1,
        downloaded_at: new Date().toISOString(),
        status: nextStatus,
      }).eq('id', doc.id);
      if (error) throw error;
      await logActivity(doc.id, doc.contact_id, 'downloaded', {
        actor_type: 'client', actor_ip_hash: ipHash, actor_device: device, actor_browser: browser,
      });
      return json({ success: true });
    }

    if (action === 'create_upload_url') {
      let doc;
      try {
        doc = await validatePublicDocument(body.document_id, body.token);
      } catch (error) {
        return json({ error: (error as Error).message }, 403);
      }
      const path = `public/${doc.id}/${crypto.randomUUID()}-${safeFileName(body.file_name || 'upload.bin')}`;
      const { data, error } = await admin.storage.from('document-files').createSignedUploadUrl(path);
      if (error) throw error;
      return json({ success: true, bucket: 'document-files', path, token: data.token, file_url: storageUri('document-files', path) });
    }

    if (action === 'client_action') {
      let doc;
      try {
        doc = await validatePublicDocument(body.document_id, body.token);
      } catch (error) {
        return json({ error: (error as Error).message }, 403);
      }

      const now = new Date().toISOString();
      const updates: Record<string, unknown> = { client_message: body.notes || '' };
      const activityMap: Record<string, string> = {
        approve: 'approved', reject: 'rejected', sign: 'signed',
        upload_proof: 'payment_proof_uploaded', changes_requested: 'changes_requested',
        upload_signed: 'signed',
      };

      switch (body.client_action) {
        case 'approve': updates.status = 'Approved'; updates.approved_at = now; break;
        case 'reject': updates.status = 'Rejected'; updates.rejected_at = now; break;
        case 'sign':
          updates.status = 'Signed'; updates.signed_at = now;
          if (body.signature_url) updates.signature_url = body.signature_url;
          break;
        case 'upload_proof':
          updates.status = 'Payment Proof Uploaded';
          if (body.proof_url) updates.proof_url = body.proof_url;
          break;
        case 'changes_requested': updates.status = 'Changes Requested'; break;
        case 'upload_signed':
          updates.status = 'Signed'; updates.signed_at = now;
          if (body.proof_url) updates.proof_url = body.proof_url;
          break;
        default: return json({ error: 'Unsupported client action' }, 400);
      }

      const { error: updateError } = await admin.from('documents').update(updates).eq('id', doc.id);
      if (updateError) throw updateError;

      if (doc.category === 'Quotation' && doc.quote_id && body.client_action === 'approve') {
        await admin.from('quotes').update({ status: 'Accepted', accepted_at: now }).eq('id', doc.quote_id);
        if (doc.contact_id) await admin.from('contacts').update({ pipeline_stage: 'Payment Pending' }).eq('id', doc.contact_id);
      }
      if (doc.category === 'Quotation' && doc.quote_id && body.client_action === 'reject') {
        await admin.from('quotes').update({ status: 'Declined', declined_at: now, declined_reason: body.notes || '' }).eq('id', doc.quote_id);
      }
      if (doc.project_id && (
        (doc.category === 'Unsigned Contract' && ['sign', 'upload_signed'].includes(body.client_action)) ||
        (doc.category === 'Proof Approval' && body.client_action === 'approve')
      )) {
        await admin.from('activity_logs').insert({
          entity_type: 'project',
          entity_id: null,
          action: 'project_workflow_pending',
          description: 'A migrated document action requires project synchronization when the Projects module is migrated.',
          metadata: { project_id: doc.project_id, document_id: doc.id, client_action: body.client_action },
        });
      }

      await logActivity(doc.id, doc.contact_id, activityMap[body.client_action] || 'question_asked', {
        actor_type: 'client',
        actor_email: body.identity_email || null,
        actor_ip_hash: ipHash,
        actor_device: device,
        actor_browser: browser,
        actor_user_agent: ua,
        notes: body.notes || '',
        metadata: {
          identity_name: body.identity_name || null,
          identity_company: body.identity_company || null,
          proof_url: body.proof_url || null,
          signature_url: body.signature_url || null,
        },
      });

      return json({ success: true });
    }

    if (action === 'get_activity') {
      await requireAdmin();
      const { data, error } = await admin
        .from('document_activities')
        .select('*')
        .eq('document_id', body.document_id)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      const activities = (data || []).map(item => ({
        ...item,
        actor_ip: item.actor_ip_hash ? 'Recorded securely' : null,
      }));
      return json({ activities });
    }

    if (action === 'extend_expiry') {
      const { user } = await requireAdmin();
      const doc = await getDocument(body.document_id);
      if (!doc) return json({ error: 'Document not found' }, 404);
      const days = Math.max(1, Number(body.days) || 30);
      const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
      const { error } = await admin.from('documents').update({ expires_at: expiresAt, status: 'Sent to Client' }).eq('id', doc.id);
      if (error) throw error;
      await logActivity(doc.id, doc.contact_id, 'reminder_sent', {
        actor_type: 'admin', actor_email: user.email, notes: `Expiry extended by ${days} days.`,
      });
      return json({ success: true, new_expiry: expiresAt });
    }

    if (action === 'create_version') {
      const { user } = await requireAdmin();
      const original = await getDocument(body.document_id);
      if (!original) return json({ error: 'Document not found' }, 404);
      await admin.from('documents').update({ is_latest_version: false }).eq('id', original.id);
      const { id: _id, created_date: _created, updated_date: _updated, ...copy } = original;
      const { data: newDoc, error } = await admin.from('documents').insert({
        ...copy,
        file_url: body.new_file_url,
        file_name: body.new_file_name || original.file_name,
        version: (original.version || 1) + 1,
        parent_doc_id: original.id,
        is_latest_version: true,
        status: 'Draft',
        secure_token: null,
        sent_at: null,
        opened_at: null,
        viewed_at: null,
        signed_at: null,
        approved_at: null,
        rejected_at: null,
      }).select('*').single();
      if (error) throw error;
      await logActivity(newDoc.id, original.contact_id, 'version_created', {
        actor_type: 'admin', actor_email: user.email, notes: `Version ${newDoc.version} created from version ${original.version}.`,
      });
      return json({ success: true, doc: newDoc });
    }

    if (action === 'verify_payment') {
      const { user } = await requireAdmin();
      const doc = await getDocument(body.document_id);
      if (!doc) return json({ error: 'Document not found' }, 404);
      const verified = Boolean(body.verified);
      const { error } = await admin.from('documents').update({
        status: verified ? 'Approved' : 'Rejected',
        approved_at: verified ? new Date().toISOString() : null,
        rejected_at: verified ? null : new Date().toISOString(),
        internal_notes: body.rejection_reason || doc.internal_notes,
      }).eq('id', doc.id);
      if (error) throw error;

      if (verified && doc.invoice_id && Number(body.amount_confirmed) > 0) {
        const { data: invoice } = await admin.from('invoices').select('contact_id, project_id').eq('id', doc.invoice_id).maybeSingle();
        if (invoice) {
          const { error: paymentError } = await admin.from('payments').insert({
            invoice_id: doc.invoice_id,
            contact_id: invoice.contact_id,
            project_id: invoice.project_id,
            amount: Number(body.amount_confirmed),
            payment_date: new Date().toISOString().slice(0, 10),
            payment_method: 'EFT',
            reference: `Verified proof document ${doc.id}`,
            proof_url: doc.proof_url,
            status: 'Confirmed',
            notes: 'Created from verified payment proof document.',
          });
          if (paymentError) throw paymentError;
        }
      }

      await logActivity(doc.id, doc.contact_id, verified ? 'approved' : 'rejected', {
        actor_type: 'admin', actor_email: user.email,
        notes: verified ? `Payment proof verified. Amount confirmed: R${Number(body.amount_confirmed) || 0}` : `Payment proof rejected: ${body.rejection_reason || ''}`,
      });
      return json({ success: true, status: verified ? 'Approved' : 'Rejected' });
    }

    if (action === 'generate_certificate') {
      const { user } = await requireAdmin();
      const doc = await getDocument(body.document_id);
      if (!doc) return json({ error: 'Document not found' }, 404);
      const { data: contact } = doc.contact_id
        ? await admin.from('contacts').select('full_name, email').eq('id', doc.contact_id).maybeSingle()
        : { data: null };
      const { data: approval } = await admin.from('document_activities').select('*').eq('document_id', doc.id).eq('action', 'approved').order('timestamp', { ascending: false }).limit(1).maybeSingle();

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(26, 18, 8); pdf.rect(0, 0, 210, 48, 'F');
      pdf.setFillColor(184, 115, 51); pdf.rect(0, 46, 210, 3, 'F');
      pdf.setTextColor(184, 115, 51); pdf.setFontSize(20); pdf.text('CREATIVE BOOKS SA', 15, 20);
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(11); pdf.text('APPROVAL CERTIFICATE', 15, 31);
      const fields = [
        ['Client Name', contact?.full_name || 'N/A'], ['Client Email', contact?.email || 'N/A'],
        ['Book Title', doc.book_title || 'N/A'], ['Document', doc.file_name], ['Document Type', doc.category],
        ['Version', `v${doc.version || 1}`], ['Approval Date', doc.approved_at ? new Date(doc.approved_at).toLocaleString('en-ZA') : 'N/A'],
        ['Client Audit', approval?.actor_ip_hash ? 'IP recorded securely' : 'Not recorded'], ['Approved By Admin', user.email || 'Admin'],
      ];
      let y = 68;
      for (const [label, value] of fields) {
        pdf.setFillColor(250, 248, 244); pdf.roundedRect(15, y - 5, 180, 12, 2, 2, 'F');
        pdf.setTextColor(145, 105, 65); pdf.setFontSize(8); pdf.text(label.toUpperCase(), 20, y + 1);
        pdf.setTextColor(26, 18, 8); pdf.setFontSize(10); pdf.text(String(value).slice(0, 80), 78, y + 1);
        y += 16;
      }
      const bytes = new Uint8Array(pdf.output('arraybuffer'));
      const path = `certificates/${doc.id}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await admin.storage.from('document-files').upload(path, bytes, { contentType: 'application/pdf', upsert: false });
      if (uploadError) throw uploadError;
      const uri = storageUri('document-files', path);
      await admin.from('documents').update({ signed_document_url: uri }).eq('id', doc.id);
      return json({ success: true, certificate_url: await signedUrl(uri, 3600) });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = (error as Error).message || 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    return json({ error: message }, status);
  }
});
