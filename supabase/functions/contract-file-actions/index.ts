import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function storageUri(bucket, path) {
  return `supabase://${bucket}/${path}`;
}

function parseStorageUri(value) {
  const match = typeof value === 'string' ? value.match(/^supabase:\/\/([^/]+)\/(.+)$/) : null;
  return match ? { bucket: match[1], path: match[2] } : null;
}

function safeFileName(value, fallback) {
  return String(value || fallback).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140);
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

function validateToken(contract) {
  if (!contract) throw new Error('Invalid signing link');
  if (contract.sign_token_expires && Date.parse(contract.sign_token_expires) < Date.now()) {
    throw new Error('Signing link has expired');
  }
}

async function signedUrl(admin, bucket, path, expiresIn = 7200) {
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
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
    const contract = await contractByToken(admin, body.token);
    validateToken(contract);

    if (action === 'create_upload_url') {
      const contentType = String(body.content_type || '').toLowerCase();
      const signedStatus = ['Signed', 'Fully Signed'].includes(contract.status);

      if (!signedStatus && !['image/png', 'image/jpeg', 'image/webp'].includes(contentType)) {
        return json({ error: 'Only PNG, JPEG or WebP signature images are allowed before signing.' }, 400);
      }
      if (signedStatus && contentType !== 'application/pdf') {
        return json({ error: 'Only the final signed PDF may be uploaded after signing.' }, 400);
      }

      const bucket = signedStatus ? 'document-files' : 'signature-artifacts';
      const fileName = safeFileName(body.file_name, signedStatus ? 'contract_signed.pdf' : 'signature.png');
      const folder = signedStatus ? 'contracts/signed' : 'contracts/signatures';
      const path = `${folder}/${contract.id}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
      const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
      if (error) throw error;

      return json({
        bucket,
        path,
        token: data.token,
        file_url: storageUri(bucket, path),
        read_url: await signedUrl(admin, bucket, path, 7200).catch(() => null),
        mode: signedStatus ? 'signed_pdf' : 'signature',
      });
    }

    if (action === 'attach_signed_pdf') {
      if (!['Signed', 'Fully Signed'].includes(contract.status)) {
        return json({ error: 'Contract is not signed yet.' }, 409);
      }

      const parsed = parseStorageUri(body.file_url);
      const expectedPrefix = `contracts/signed/${contract.id}/`;
      if (!parsed || parsed.bucket !== 'document-files' || !parsed.path.startsWith(expectedPrefix)) {
        return json({ error: 'Signed PDF file reference is invalid.' }, 400);
      }

      const { error: contractError } = await admin
        .from('contracts')
        .update({ signed_file_url: body.file_url })
        .eq('id', contract.id);
      if (contractError) throw contractError;

      const { data: documentRows, error: documentFetchError } = await admin
        .from('documents')
        .select('id')
        .eq('contact_id', contract.contact_id)
        .eq('document_title', contract.title)
        .eq('category', 'Signed Contract')
        .order('created_date', { ascending: false })
        .limit(1);
      if (documentFetchError) throw documentFetchError;
      if (documentRows?.[0]?.id) {
        const { error } = await admin
          .from('documents')
          .update({
            signed_document_url: body.file_url,
            file_url: body.file_url,
            status: 'Signed',
            signed_at: contract.signed_at || new Date().toISOString(),
          })
          .eq('id', documentRows[0].id);
        if (error) throw error;
      }

      const { data: signatureRows, error: signatureFetchError } = await admin
        .from('e_signature_requests')
        .select('id')
        .eq('contact_id', contract.contact_id)
        .eq('title', contract.title)
        .order('created_date', { ascending: false })
        .limit(1);
      if (signatureFetchError) throw signatureFetchError;
      if (signatureRows?.[0]?.id) {
        const { error } = await admin
          .from('e_signature_requests')
          .update({
            signed_document_url: body.file_url,
            pdf_generation_status: 'done',
          })
          .eq('id', signatureRows[0].id);
        if (error) throw error;
      }

      return json({
        success: true,
        file_url: body.file_url,
        signed_url: await signedUrl(admin, parsed.bucket, parsed.path, 7 * 24 * 60 * 60),
      });
    }

    if (action === 'get_signed_copy') {
      if (!['Signed', 'Fully Signed'].includes(contract.status)) {
        return json({ error: 'Contract is not signed yet.' }, 409);
      }
      const parsed = parseStorageUri(contract.signed_file_url || contract.contract_file_url);
      if (!parsed) return json({ signed_url: contract.signed_file_url || contract.contract_file_url || '' });
      return json({ signed_url: await signedUrl(admin, parsed.bucket, parsed.path, 7 * 24 * 60 * 60) });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('contract-file-actions error:', error?.message || error);
    const message = error?.message || 'Unexpected contract file error.';
    if (message.includes('Invalid signing link')) return json({ error: message }, 404);
    if (message.includes('expired')) return json({ error: message }, 410);
    return json({ error: message }, 500);
  }
});
