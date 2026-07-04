import { createClient } from 'npm:@supabase/supabase-js@2';

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

function parseStorageUri(value?: string | null) {
  const match = value?.match(/^supabase:\/\/([^/]+)\/(.+)$/);
  return match ? { bucket: match[1], path: match[2] } : null;
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

  const signedUrl = async (value?: string | null, expiresIn = 3600) => {
    const parsed = parseStorageUri(value);
    if (!parsed) return value || null;
    const { data, error } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  };

  const hydrateDocuments = async (documents: Record<string, unknown>[]) => Promise.all(
    documents.map(async doc => ({
      ...doc,
      file_url: await signedUrl(doc.file_url as string, 3600),
      proof_url: await signedUrl(doc.proof_url as string, 3600),
      signature_url: await signedUrl(doc.signature_url as string, 3600),
      signed_document_url: await signedUrl(doc.signed_document_url as string, 3600),
    })),
  );

  const contractStatus = (status: string) => {
    const map: Record<string, string> = {
      Prepared: 'Admin Fields Completed',
      'Admin Fields Completed': 'Admin Fields Completed',
      'Admin Signed': 'Admin Signed',
      Sent: 'Sent for Signature',
      Delivered: 'Sent for Signature',
      Opened: 'Opened',
      Viewed: 'Viewed',
      'Signing Started': 'Signing Started',
      'Client Signed': 'Signed',
      'Fully Signed': 'Fully Signed',
      Signed: 'Signed',
      Declined: 'Declined',
      Expired: 'Expired',
      Cancelled: 'Cancelled',
      Archived: 'Archived',
      Draft: 'Draft',
    };
    return map[status] || status;
  };

  const mapSignatureRequestToContract = async (req: Record<string, unknown>) => ({
    id: req.id,
    contact_id: req.contact_id,
    project_id: req.project_id,
    title: req.title,
    document_type: req.document_category || 'Contract',
    book_title: null,
    status: contractStatus(String(req.status || 'Draft')),
    contract_file_url: await signedUrl(req.file_url as string, 3600),
    signed_file_url: await signedUrl(req.signed_document_url as string, 3600),
    sign_token: req.sign_token,
    sign_token_expires: req.expires_at,
    admin_signature_url: await signedUrl(req.admin_signature_url as string, 3600),
    admin_signed_at: req.admin_signed_at,
    admin_signer_name: req.admin_signer_name,
    admin_signer_email: req.admin_signer_email,
    contract_field_values: req.admin_field_values || {},
    signer_name: req.signer_confirmed_name,
    signer_email: req.signer_confirmed_email,
    signature_image_url: await signedUrl(req.signature_image_url as string, 3600),
    audit_trail: req.audit_trail || [],
    sent_at: req.sent_at,
    opened_at: req.opened_at,
    viewed_at: req.viewed_at,
    signed_at: req.signed_at,
    declined_at: req.declined_at,
    declined_reason: req.decline_reason,
    expiry_date: req.expires_at ? String(req.expires_at).slice(0, 10) : null,
    reminder_sent_at: req.last_reminder_at,
    reminder_count: req.reminder_sent_count || 0,
    legal_consent_checked: Boolean(req.consent_submit),
    notes: null,
    signing_url: req.sign_token ? `/sign/esig/${req.id}/${req.sign_token}` : null,
  });

  try {
    const body = await request.json();
    if (body.action !== 'get_portal_data') return json({ error: 'Unknown action' }, 400);
    if (!body.token || typeof body.token !== 'string') return json({ error: 'Portal token is required' }, 400);

    const { data: access, error: accessError } = await admin.rpc('consume_client_portal_access', {
      p_token: body.token,
    });
    if (accessError) throw accessError;
    if (!access) return json({ error: 'This portal link is invalid, inactive or expired.' }, 403);

    const contactId = access.contact_id;
    const allowed = Array.isArray(access.allowed_sections) ? access.allowed_sections : [];

    const contactPromise = admin
      .from('contacts')
      .select('id, full_name, email, phone, company')
      .eq('id', contactId)
      .maybeSingle();

    const quotesPromise = allowed.includes('quotes')
      ? admin
          .from('quotes')
          .select('id, quote_number, book_title, status, subtotal, vat_amount, total, valid_until, sent_at, accepted_at, declined_at, pdf_url, created_date')
          .eq('contact_id', contactId)
          .order('created_date', { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const invoicesPromise = allowed.includes('invoices')
      ? admin
          .from('invoices')
          .select('id, invoice_number, quote_id, status, subtotal, vat_amount, total, amount_paid, balance_due, due_date, book_title, sent_at, paid_at, created_date')
          .eq('contact_id', contactId)
          .order('created_date', { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const projectsPromise = allowed.includes('projects')
      ? admin
          .from('projects')
          .select('id, quote_id, invoice_id, book_title, author_name, service_type, stage, stage_changed_at, waiting_on, deadline, project_value, payment_status, contract_status, client_notes, is_at_risk, risk_reason, completed_at, created_date')
          .eq('contact_id', contactId)
          .order('created_date', { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const documentsPromise = allowed.includes('documents')
      ? admin
          .from('documents')
          .select('id, document_title, category, status, file_name, file_url, proof_url, signature_url, signed_document_url, version, book_title, secure_token, expires_at, sent_at, approved_at, signed_at, created_date')
          .eq('contact_id', contactId)
          .eq('access_revoked', false)
          .order('created_date', { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const signaturesPromise = admin
      .from('e_signature_requests')
      .select('*')
      .eq('contact_id', contactId)
      .not('status', 'in', '(Draft,Archived)')
      .order('created_date', { ascending: false });

    const [contactResult, quotesResult, invoicesResult, projectsResult, documentsResult, signaturesResult] = await Promise.all([
      contactPromise,
      quotesPromise,
      invoicesPromise,
      projectsPromise,
      documentsPromise,
      signaturesPromise,
    ]);

    const firstError = [
      contactResult.error,
      quotesResult.error,
      invoicesResult.error,
      projectsResult.error,
      documentsResult.error,
      signaturesResult.error,
    ].find(Boolean);
    if (firstError) throw firstError;
    if (!contactResult.data) return json({ error: 'Client record not found' }, 404);

    const quotes = await Promise.all((quotesResult.data || []).map(async quote => ({
      ...quote,
      pdf_url: await signedUrl(quote.pdf_url, 3600),
    })));
    const documents = await hydrateDocuments(documentsResult.data || []);
    const contracts = await Promise.all((signaturesResult.data || []).map(mapSignatureRequestToContract));

    return json({
      success: true,
      access: {
        id: access.id,
        contact_id: access.contact_id,
        email: access.email,
        is_active: access.is_active,
        expires_at: access.expires_at,
        last_accessed_at: access.last_accessed_at,
        access_count: access.access_count,
        allowed_sections: access.allowed_sections,
      },
      contact: contactResult.data,
      quotes,
      invoices: invoicesResult.data || [],
      projects: projectsResult.data || [],
      documents,
      contracts,
    });
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected error' }, 500);
  }
});
