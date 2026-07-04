import { createClient } from 'npm:@supabase/supabase-js@2';

const API_BASE = (Deno.env.get('ADOBE_SIGN_API_BASE') || 'https://api.na1.adobesign.com').replace(/\/$/, '');
const OAUTH_BASE = API_BASE.replace('api.', 'secure.').replace(/\/api.*/, '');
const EXPECTED_CLIENT_ID = Deno.env.get('ADOBE_SIGN_CLIENT_ID') || '';
let tokenCache = { token: null, expiresAt: 0 };

const STATUS_MAP = {
  OUT_FOR_SIGNATURE: 'Sent for Signature',
  AGREEMENT_EMAIL_VIEWED: 'Viewed',
  EMAIL_VIEWED: 'Viewed',
  AGREEMENT_SIGNER_COMPLETE: 'Signing Started',
  SIGNED: 'Signing Started',
  AGREEMENT_WORKFLOW_COMPLETED: 'Signed',
  COMPLETED: 'Signed',
  AGREEMENT_REJECTED: 'Declined',
  DECLINED: 'Declined',
  REJECTED: 'Declined',
  AGREEMENT_EXPIRED: 'Expired',
  EXPIRED: 'Expired',
  AGREEMENT_RECALLED: 'Cancelled',
  CANCELLED: 'Cancelled',
  RECALLED: 'Cancelled',
};

function storageUri(bucket, path) {
  return `supabase://${bucket}/${path}`;
}

function appendAudit(existing, event, details = {}) {
  const trail = Array.isArray(existing) ? [...existing] : [];
  trail.push({ event, timestamp: new Date().toISOString(), ...details });
  return trail;
}

function adobeResponse(clientId, body = '') {
  return new Response(body, {
    status: 200,
    headers: clientId ? { 'x-adobesign-clientid': clientId } : {},
  });
}

function validAdobeClientId(request) {
  const clientId = request.headers.get('x-adobesign-clientid') || '';
  return {
    clientId,
    valid: Boolean(clientId) && Boolean(EXPECTED_CLIENT_ID) && clientId === EXPECTED_CLIENT_ID,
  };
}

async function getAccessToken() {
  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const clientSecret = Deno.env.get('ADOBE_SIGN_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ADOBE_SIGN_REFRESH_TOKEN');
  if (!EXPECTED_CLIENT_ID || !clientSecret || !refreshToken) {
    throw new Error('Adobe Sign OAuth credentials are not configured.');
  }

  const response = await fetch(`${OAUTH_BASE}/oauth/v2/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: EXPECTED_CLIENT_ID,
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

async function downloadSignedPdf(admin, contract, agreementId) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${API_BASE}/api/rest/v6/agreements/${encodeURIComponent(agreementId)}/combinedDocument`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`Adobe signed PDF download failed (${response.status}).`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  const path = `contracts/adobe/${contract.id}/${Date.now()}-${crypto.randomUUID()}-signed.pdf`;
  const { error } = await admin.storage.from('document-files').upload(path, bytes, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (error) throw error;
  return storageUri('document-files', path);
}

async function upsertSignedDocument(admin, contract, fileUrl, signedAt) {
  const { data: existing, error: fetchError } = await admin
    .from('documents')
    .select('id')
    .eq('contact_id', contract.contact_id)
    .eq('document_title', contract.title)
    .eq('category', 'Signed Contract')
    .order('created_date', { ascending: false })
    .limit(1);
  if (fetchError) throw fetchError;

  if (existing?.[0]?.id) {
    const { error } = await admin.from('documents').update({
      file_url: fileUrl,
      signed_document_url: fileUrl,
      status: 'Signed',
      signed_at: signedAt,
    }).eq('id', existing[0].id);
    if (error) throw error;
    return;
  }

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
    uploaded_by: 'Adobe Acrobat Sign webhook',
    signed_at: signedAt,
  });
  if (error) throw error;
}

Deno.serve(async request => {
  const verification = validAdobeClientId(request);
  if (!verification.valid) {
    return new Response('Invalid Adobe Sign client ID', { status: 401 });
  }

  if (request.method === 'GET') {
    return adobeResponse(verification.clientId);
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Supabase service environment is not configured.', { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const payload = await request.json().catch(() => null);
    if (!payload) return adobeResponse(verification.clientId);

    const event = payload.event || payload.webhookNotification?.event || '';
    const agreementId = payload.agreement?.id
      || payload.agreementId
      || payload.webhookNotification?.agreement?.id
      || '';
    if (!agreementId) return adobeResponse(verification.clientId);

    const { data: contract, error: contractError } = await admin
      .from('contracts')
      .select('*')
      .eq('sign_token', agreementId)
      .maybeSingle();
    if (contractError) throw contractError;
    if (!contract) {
      console.log('No Supabase contract found for Adobe agreement:', agreementId);
      return adobeResponse(verification.clientId);
    }

    const adobeStatus = payload.agreement?.status
      || payload.webhookNotification?.agreement?.status
      || '';
    const mappedStatus = STATUS_MAP[event] || STATUS_MAP[adobeStatus] || null;
    const now = new Date().toISOString();
    const updates = {
      audit_trail: appendAudit(contract.audit_trail, event || adobeStatus || 'adobe_webhook', {
        agreement_id: agreementId,
        adobe_status: adobeStatus,
      }),
    };

    if (mappedStatus) updates.status = mappedStatus;
    if (['AGREEMENT_EMAIL_VIEWED', 'EMAIL_VIEWED'].includes(event)) {
      updates.opened_at = contract.opened_at || now;
      updates.viewed_at = contract.viewed_at || now;
      updates.status = 'Viewed';
    }
    if (mappedStatus === 'Declined') {
      updates.declined_at = contract.declined_at || now;
    }

    const completed = event === 'AGREEMENT_WORKFLOW_COMPLETED' || adobeStatus === 'COMPLETED';
    if (completed) {
      const signedFileUrl = await downloadSignedPdf(admin, contract, agreementId);
      updates.status = 'Signed';
      updates.signed_at = contract.signed_at || now;
      updates.signed_file_url = signedFileUrl;
      await upsertSignedDocument(admin, contract, signedFileUrl, updates.signed_at);

      if (contract.project_id) {
        const { error: projectError } = await admin.from('projects').update({
          contract_status: 'Signed',
          stage: 'Contract Signed',
          current_stage: 'Contract Signed',
          stage_changed_at: now,
        }).eq('id', contract.project_id);
        if (projectError) throw projectError;
      }
    }

    const { error: updateError } = await admin.from('contracts').update(updates).eq('id', contract.id);
    if (updateError) throw updateError;
  } catch (error) {
    console.error('adobe-sign-webhook processing error:', error?.message || error);
  }

  return adobeResponse(verification.clientId);
});
