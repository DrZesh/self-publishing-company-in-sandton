// Adobe Acrobat Sign Webhook Handler
// Handles verification (GET) and event notifications (POST)
// Register this URL in Adobe Sign: Dashboard > Account > Webhooks
import { createClientFromRequest, serve } from '../_shared/server.ts';

const CLIENT_ID = Deno.env.get('ADOBE_SIGN_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('ADOBE_SIGN_CLIENT_SECRET');
const REFRESH_TOKEN = Deno.env.get('ADOBE_SIGN_REFRESH_TOKEN');
const API_BASE = (Deno.env.get('ADOBE_SIGN_API_BASE') || 'https://api.na1.adobesign.com').replace(/\/$/, '');
const OAUTH_BASE = API_BASE.replace('api.', 'secure.').replace(/\/api.*/, '');

const ADOBE_TO_CONTRACT_STATUS = {
  OUT_FOR_SIGNATURE: 'Sent for Signature',
  EMAIL_VIEWED:      'Viewed',
  SIGNED:            'Signing Started',
  COMPLETED:         'Signed',
  DECLINED:          'Declined',
  EXPIRED:           'Expired',
  CANCELLED:         'Cancelled',
  RECALLED:          'Cancelled',
  REJECTED:          'Declined',
};

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
  return data.access_token;
}

serve('adobeSignWebhook', async (req) => {
  // ── Adobe Sign verification challenge (GET) ──────────────────────────────
  if (req.method === 'GET') {
    const clientId = req.headers.get('x-adobesign-clientid');
    if (clientId) {
      return new Response('', {
        status: 200,
        headers: { 'x-adobesign-clientid': clientId },
      });
    }
    return new Response('OK', { status: 200 });
  }

  // ── Event notification (POST) ────────────────────────────────────────────
  if (req.method === 'POST') {
    // Acknowledge immediately so Adobe doesn't retry
    const clientId = req.headers.get('x-adobesign-clientid');
    
    const payload = await req.json().catch(() => null);
    if (!payload) return new Response('', { status: 200, headers: clientId ? { 'x-adobesign-clientid': clientId } : {} });

    try {
      const platform = createClientFromRequest(req);
      
      const event = payload.event;
      const agreementId = payload.agreement?.id || payload.agreementId;
      if (!agreementId) return new Response('', { status: 200 });

      // Find contract by adobe agreement ID stored in sign_token
      const contracts = await platform.asServiceRole.entities.Contract.filter({ sign_token: agreementId });
      if (!contracts.length) {
        console.log('No contract found for agreement:', agreementId);
        return new Response('', { status: 200 });
      }
      const contract = contracts[0];

      const newStatus = ADOBE_TO_CONTRACT_STATUS[event] || ADOBE_TO_CONTRACT_STATUS[payload.agreement?.status];
      
      const auditEntry = {
        event: event || payload.agreement?.status,
        timestamp: new Date().toISOString(),
        agreement_id: agreementId,
        details: payload.agreement?.status,
      };

      const updateData = {
        audit_trail: [...(contract.audit_trail || []), auditEntry],
      };

      if (newStatus) updateData.status = newStatus;

      // Mark specific timestamps
      if (event === 'AGREEMENT_EMAIL_VIEWED' || event === 'EMAIL_VIEWED') {
        updateData.opened_at = new Date().toISOString();
        updateData.status = 'Viewed';
      }
      if (event === 'AGREEMENT_WORKFLOW_COMPLETED' || payload.agreement?.status === 'COMPLETED') {
        updateData.signed_at = new Date().toISOString();
        updateData.status = 'Signed';

        // Download and store the signed PDF
        try {
          const accessToken = await getAccessToken();
          const pdfRes = await fetch(`${API_BASE}/api/rest/v6/agreements/${agreementId}/combinedDocument`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (pdfRes.ok) {
            const pdfBlob = await pdfRes.blob();
            const uploadRes = await platform.asServiceRole.integrations.Core.UploadFile({ file: pdfBlob });
            if (uploadRes?.file_url) {
              updateData.signed_file_url = uploadRes.file_url;
            }
          }
        } catch (pdfErr) {
          console.error('Failed to download signed PDF:', pdfErr.message);
        }
      }

      await platform.asServiceRole.entities.Contract.update(contract.id, updateData);
      console.log(`Contract ${contract.id} updated: ${newStatus || 'audit logged'} (event: ${event})`);

    } catch (err) {
      console.error('Webhook processing error:', err.message);
    }

    return new Response('', {
      status: 200,
      headers: clientId ? { 'x-adobesign-clientid': clientId } : {},
    });
  }

  return new Response('Method not allowed', { status: 405 });
});