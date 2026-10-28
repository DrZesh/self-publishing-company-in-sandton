import { requireAdmin, AuthError } from './supabase-auth.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLIENT_ID     = Deno.env.get('ADOBE_SIGN_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('ADOBE_SIGN_CLIENT_SECRET');
const REFRESH_TOKEN = Deno.env.get('ADOBE_SIGN_REFRESH_TOKEN');
// API base may include shard, e.g. https://api.na1.adobesign.com
const API_BASE      = (Deno.env.get('ADOBE_SIGN_API_BASE') || 'https://api.na1.adobesign.com').replace(/\/$/, '');
// OAuth base is always secure.na1 unless overridden
const OAUTH_BASE    = API_BASE.replace('api.', 'secure.').replace(/\/api.*/, '');

async function getAccessToken() {
  const res = await fetch(`${OAUTH_BASE}/oauth/v2/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Adobe Sign token refresh failed: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function uploadTransientDoc(accessToken, fileUrl, filename) {
  // Fetch the file from the stored URL
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) throw new Error('Failed to fetch document from URL');
  const fileBlob = await fileRes.blob();

  const form = new FormData();
  form.append('File-Name', filename || 'document.pdf');
  form.append('Mime-Type', 'application/pdf');
  form.append('File', fileBlob, filename || 'document.pdf');

  const res = await fetch(`${API_BASE}/api/rest/v6/transientDocuments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const data = await res.json();
  if (!data.transientDocumentId) throw new Error('Transient document upload failed: ' + JSON.stringify(data));
  return data.transientDocumentId;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireAdmin(req);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const accessToken = await getAccessToken();

    // ── SEND ─────────────────────────────────────────────────────────────────
    if (action === 'send') {
      const { contract_id, signer_name, signer_email, file_url, filename, message } = body;

      const contracts = await base44.asServiceRole.entities.Contract.filter({ id: contract_id });
      if (!contracts.length) return Response.json({ error: 'Contract not found' }, { status: 404 });
      const contract = contracts[0];

      const docUrl = file_url || contract.contract_file_url;
      if (!docUrl) return Response.json({ error: 'No document file attached to contract' }, { status: 400 });

      const transientDocId = await uploadTransientDoc(accessToken, docUrl, filename || `${contract.title || 'Contract'}.pdf`);

      const agreementBody = {
        fileInfos: [{ transientDocumentId: transientDocId }],
        name: contract.title || 'Contract for Signature',
        participantSetsInfo: [
          {
            role: 'SIGNER',
            order: 1,
            memberInfos: [{ name: signer_name, email: signer_email }],
          },
        ],
        signatureType: 'ESIGN',
        state: 'IN_PROCESS',
        message: message || 'Please review and sign the attached contract.',
      };

      const res = await fetch(`${API_BASE}/api/rest/v6/agreements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agreementBody),
      });
      const data = await res.json();
      if (!data.id) throw new Error('Adobe Sign agreement creation failed: ' + JSON.stringify(data));

      const auditEntry = {
        event: 'sent_adobe_sign',
        agreement_id: data.id,
        signer_name,
        signer_email,
        timestamp: new Date().toISOString(),
        by: user.email,
      };

      await base44.asServiceRole.entities.Contract.update(contract_id, {
        status: 'Sent for Signature',
        sign_token: data.id, // store Adobe agreement ID
        signer_name,
        signer_email,
        sent_at: new Date().toISOString(),
        audit_trail: [...(contract.audit_trail || []), auditEntry],
      });

      return Response.json({ success: true, agreement_id: data.id });
    }

    // ── GET STATUS ────────────────────────────────────────────────────────────
    if (action === 'get_status') {
      const { agreement_id } = body;
      const res = await fetch(`${API_BASE}/api/rest/v6/agreements/${agreement_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return Response.json({ success: true, status: data.status, agreement: data });
    }

    // ── DOWNLOAD SIGNED PDF ───────────────────────────────────────────────────
    if (action === 'download_signed') {
      const { contract_id, agreement_id } = body;
      const res = await fetch(`${API_BASE}/api/rest/v6/agreements/${agreement_id}/combinedDocument`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to download signed document from Adobe Sign');

      const pdfBlob = await res.blob();
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfBlob });

      await base44.asServiceRole.entities.Contract.update(contract_id, {
        signed_file_url: file_url,
        status: 'Signed',
        signed_at: new Date().toISOString(),
      });

      return Response.json({ success: true, signed_file_url: file_url });
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────
    if (action === 'cancel') {
      const { contract_id, agreement_id, reason } = body;
      await fetch(`${API_BASE}/api/rest/v6/agreements/${agreement_id}/state`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: 'CANCELLED', agreementCancellationInfo: { comment: reason || 'Cancelled by admin' } }),
      });

      const contracts = await base44.asServiceRole.entities.Contract.filter({ id: contract_id });
      const contract = contracts[0] || {};
      await base44.asServiceRole.entities.Contract.update(contract_id, {
        status: 'Cancelled',
        audit_trail: [...(contract.audit_trail || []), { event: 'cancelled', timestamp: new Date().toISOString(), by: user.email, reason }],
      });

      return Response.json({ success: true });
    }

    // ── REGISTER WEBHOOK ──────────────────────────────────────────────────────
    if (action === 'register_webhook') {
      const { webhook_url } = body;
      const res = await fetch(`${API_BASE}/api/rest/v6/webhooks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          webhookUrlInfo: { url: webhook_url },
        }),
      });
      const data = await res.json();
      return Response.json({ success: true, webhook: data });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('Adobe Sign error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});