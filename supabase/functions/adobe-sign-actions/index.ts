import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const API_BASE = (Deno.env.get('ADOBE_SIGN_API_BASE') || 'https://api.na1.adobesign.com').replace(/\/$/, '');
const OAUTH_BASE = API_BASE.replace('api.', 'secure.').replace(/\/api.*/, '');
let tokenCache = { token: null, expiresAt: 0 };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function storageUri(bucket, path) {
  return `supabase://${bucket}/${path}`;
}

function parseStorageUri(value) {
  const match = typeof value === 'string' ? value.match(/^supabase:\/\/([^/]+)\/(.+)$/) : null;
  return match ? { bucket: match[1], path: match[2] } : null;
}

function appendAudit(existing, event, details = {}) {
  const trail = Array.isArray(existing) ? [...existing] : [];
  trail.push({ event, timestamp: new Date().toISOString(), ...details });
  return trail;
}

async function requireAdmin(admin, request) {
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.replace(/^Bearer\s+/i, '');
  if (!bearer) throw new Error('Unauthorized');

  const { data: userData, error: userError } = await admin.auth.getUser(bearer);
  if (userError || !userData.user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || !['super_admin', 'admin'].includes(profile?.role)) {
    throw new Error('Admin access required');
  }
  return { ...userData.user, ...profile, email: profile.email || userData.user.email };
}

async function getAccessToken() {
  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const clientId = Deno.env.get('ADOBE_SIGN_CLIENT_ID');
  const clientSecret = Deno.env.get('ADOBE_SIGN_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ADOBE_SIGN_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Adobe Sign OAuth credentials are not configured.');
  }

  const response = await fetch(`${OAUTH_BASE}/oauth/v2/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || 'Adobe Sign token refresh failed.');
  }

  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max(60, Number(payload.expires_in || 3600) - 60) * 1000,
  };
  return tokenCache.token;
}

async function adobeRequest(accessToken, path, options = {}) {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${API_BASE}/api/rest/v6${path}`, {
      method: options.method || (options.body === undefined ? 'GET' : 'POST'),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.form ? {} : { 'Content-Type': 'application/json' }),
      },
      body: options.form || (options.body === undefined ? undefined : JSON.stringify(options.body)),
    });

    if (response.status === 429 || response.status >= 500) {
      lastError = `Adobe Sign temporarily unavailable (${response.status}).`;
      await sleep((attempt + 1) * 1200);
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      let payload = {};
      try { payload = JSON.parse(text); } catch { payload = { message: text }; }
      throw new Error(payload?.message || payload?.code || `Adobe Sign API error ${response.status}`);
    }

    return response;
  }
  throw new Error(lastError || 'Adobe Sign request failed after retries.');
}

async function resolveReadableUrl(admin, value) {
  const parsed = parseStorageUri(value);
  if (!parsed) return value;
  const { data, error } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

async function uploadTransientDocument(admin, accessToken, fileUrl, filename) {
  const readableUrl = await resolveReadableUrl(admin, fileUrl);
  const fileResponse = await fetch(readableUrl);
  if (!fileResponse.ok) throw new Error('Failed to fetch the contract document for Adobe Sign.');
  const blob = await fileResponse.blob();

  const form = new FormData();
  form.append('File-Name', filename || 'document.pdf');
  form.append('Mime-Type', 'application/pdf');
  form.append('File', blob, filename || 'document.pdf');

  const response = await adobeRequest(accessToken, '/transientDocuments', { method: 'POST', form });
  const payload = await response.json();
  if (!payload.transientDocumentId) throw new Error('Adobe Sign did not return a transient document ID.');
  return payload.transientDocumentId;
}

async function getContract(admin, contractId) {
  const { data, error } = await admin.from('contracts').select('*').eq('id', contractId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Contract not found');
  return data;
}

async function storeAdobeSignedPdf(admin, accessToken, contract, agreementId) {
  const response = await adobeRequest(accessToken, `/agreements/${encodeURIComponent(agreementId)}/combinedDocument`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const path = `contracts/adobe/${contract.id}/${Date.now()}-${crypto.randomUUID()}-signed.pdf`;
  const { error: uploadError } = await admin.storage.from('document-files').upload(path, bytes, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const fileUrl = storageUri('document-files', path);
  const now = new Date().toISOString();
  const auditTrail = appendAudit(contract.audit_trail, 'adobe_signed_pdf_stored', { agreement_id: agreementId });

  const { error: updateError } = await admin.from('contracts').update({
    signed_file_url: fileUrl,
    status: 'Signed',
    signed_at: contract.signed_at || now,
    audit_trail: auditTrail,
  }).eq('id', contract.id);
  if (updateError) throw updateError;

  if (contract.project_id) {
    const { error: projectError } = await admin.from('projects').update({
      contract_status: 'Signed',
      stage: 'Contract Signed',
      current_stage: 'Contract Signed',
      stage_changed_at: now,
    }).eq('id', contract.project_id);
    if (projectError) throw projectError;
  }

  const { data: existingDocument, error: existingError } = await admin
    .from('documents')
    .select('id')
    .eq('contact_id', contract.contact_id)
    .eq('document_title', contract.title)
    .eq('category', 'Signed Contract')
    .order('created_date', { ascending: false })
    .limit(1);
  if (existingError) throw existingError;

  if (existingDocument?.[0]?.id) {
    const { error } = await admin.from('documents').update({
      file_url: fileUrl,
      signed_document_url: fileUrl,
      status: 'Signed',
      signed_at: now,
    }).eq('id', existingDocument[0].id);
    if (error) throw error;
  } else {
    const { error } = await admin.from('documents').insert({
      contact_id: contract.contact_id,
      project_id: contract.project_id ? String(contract.project_id) : null,
      document_title: contract.title,
      category: 'Signed Contract',
      status: 'Signed',
      file_name: `${contract.title} - Adobe Signed.pdf`,
      file_url: fileUrl,
      signed_document_url: fileUrl,
      book_title: contract.book_title,
      uploaded_by: 'Adobe Acrobat Sign',
      signed_at: now,
    });
    if (error) throw error;
  }

  return fileUrl;
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
    const user = await requireAdmin(admin, request);
    const body = await request.json().catch(() => ({}));
    const action = body.action;
    const accessToken = await getAccessToken();

    if (action === 'send') {
      const contract = await getContract(admin, body.contract_id);
      const fileUrl = body.file_url || contract.contract_file_url;
      if (!fileUrl) return json({ error: 'No document file attached to contract' }, 400);
      if (!body.signer_name || !body.signer_email) return json({ error: 'Signer name and email are required' }, 400);

      const transientDocumentId = await uploadTransientDocument(
        admin,
        accessToken,
        fileUrl,
        body.filename || `${contract.title || 'Contract'}.pdf`,
      );

      const response = await adobeRequest(accessToken, '/agreements', {
        method: 'POST',
        body: {
          fileInfos: [{ transientDocumentId }],
          name: contract.title || 'Contract for Signature',
          participantSetsInfo: [{
            role: 'SIGNER',
            order: 1,
            memberInfos: [{ name: body.signer_name, email: body.signer_email }],
          }],
          signatureType: 'ESIGN',
          state: 'IN_PROCESS',
          message: body.message || 'Please review and sign the attached contract.',
        },
      });
      const payload = await response.json();
      if (!payload.id) throw new Error('Adobe Sign did not return an agreement ID.');

      const now = new Date().toISOString();
      const { error } = await admin.from('contracts').update({
        status: 'Sent for Signature',
        sign_token: payload.id,
        signer_name: body.signer_name,
        signer_email: body.signer_email,
        sent_at: now,
        audit_trail: appendAudit(contract.audit_trail, 'sent_adobe_sign', {
          agreement_id: payload.id,
          signer_name: body.signer_name,
          signer_email: body.signer_email,
          actor: user.email,
        }),
      }).eq('id', contract.id);
      if (error) throw error;

      return json({ success: true, agreement_id: payload.id });
    }

    if (action === 'get_status') {
      if (!body.agreement_id) return json({ error: 'agreement_id is required' }, 400);
      const response = await adobeRequest(accessToken, `/agreements/${encodeURIComponent(body.agreement_id)}`);
      const agreement = await response.json();
      return json({ success: true, status: agreement.status, agreement });
    }

    if (action === 'download_signed') {
      const contract = await getContract(admin, body.contract_id);
      const agreementId = body.agreement_id || contract.sign_token;
      if (!agreementId) return json({ error: 'Adobe agreement ID is missing' }, 400);
      const signedFileUrl = await storeAdobeSignedPdf(admin, accessToken, contract, agreementId);
      const parsed = parseStorageUri(signedFileUrl);
      const { data: signed, error: signedError } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, 7 * 24 * 60 * 60);
      if (signedError) throw signedError;
      return json({ success: true, signed_file_url: signed.signedUrl });
    }

    if (action === 'cancel') {
      const contract = await getContract(admin, body.contract_id);
      const agreementId = body.agreement_id || contract.sign_token;
      if (!agreementId) return json({ error: 'Adobe agreement ID is missing' }, 400);

      await adobeRequest(accessToken, `/agreements/${encodeURIComponent(agreementId)}/state`, {
        method: 'PUT',
        body: {
          state: 'CANCELLED',
          agreementCancellationInfo: { comment: body.reason || 'Cancelled by admin' },
        },
      });

      const { error } = await admin.from('contracts').update({
        status: 'Cancelled',
        audit_trail: appendAudit(contract.audit_trail, 'cancelled', {
          actor: user.email,
          reason: body.reason || '',
          agreement_id: agreementId,
        }),
      }).eq('id', contract.id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === 'register_webhook') {
      let webhookUrl;
      try { webhookUrl = new URL(body.webhook_url); } catch { return json({ error: 'Valid webhook_url is required' }, 400); }
      if (webhookUrl.protocol !== 'https:') return json({ error: 'Webhook URL must use HTTPS' }, 400);

      const response = await adobeRequest(accessToken, '/webhooks', {
        method: 'POST',
        body: {
          name: 'Creative Books SA CRM Webhook',
          scope: 'ACCOUNT',
          state: 'ACTIVE',
          webhookSubscriptionEvents: [
            'AGREEMENT_ACTION_DELEGATED',
            'AGREEMENT_ACTION_COMPLETED',
            'AGREEMENT_ACTION_REQUESTED',
            'AGREEMENT_CREATED',
            'AGREEMENT_EXPIRED',
            'AGREEMENT_MODIFIED',
            'AGREEMENT_RECALLED',
            'AGREEMENT_REJECTED',
            'AGREEMENT_SHARED',
            'AGREEMENT_VAULTED',
            'AGREEMENT_WEB_IDENTITY_AUTHENTICATED',
            'AGREEMENT_WORKFLOW_COMPLETED',
            'AGREEMENT_EMAIL_VIEWED',
            'AGREEMENT_SIGNER_COMPLETE',
          ],
          webhookUrlInfo: { url: webhookUrl.toString() },
        },
      });
      const payload = await response.json().catch(() => ({}));
      return json({ success: true, webhook: payload });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('adobe-sign-actions error:', error?.message || error);
    const message = error?.message || 'Unexpected Adobe Sign error.';
    if (message === 'Unauthorized') return json({ error: message }, 401);
    if (message === 'Admin access required') return json({ error: message }, 403);
    if (message.includes('not found')) return json({ error: message }, 404);
    return json({ error: message }, 500);
  }
});
