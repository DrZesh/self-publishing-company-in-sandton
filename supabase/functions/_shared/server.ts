import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { createEntities, unwrap } from './entities.js';
import { accessMode, staffRoles } from './policy.js';
import { required, sendEmail, uploadFile, invokeLLM, getConnection, transcribeAudio, serverKey, publicKey, internalToken } from './integrations.ts';
const contexts = new WeakMap<Request, any>();
export function adminClient() { return createClient(required('SUPABASE_URL'), serverKey(), { auth: { persistSession: false, autoRefreshToken: false } }); }
function fail(message: string, status = 403): never { throw Object.assign(new Error(message), { status }); }
export function createClientFromRequest(req: Request) {
  const context = contexts.get(req); if (!context) fail('Request was not authorized');
  const client = context.client;
  const entities = createEntities(client);
  const api: any = {
    entities,
    auth: { me: async () => context.user || null },
    integrations: { Core: { SendEmail: sendEmail, UploadFile: (args: any) => uploadFile(client, args), InvokeLLM: invokeLLM, TranscribeAudio: (args: any) => transcribeAudio(client, args) } },
    connectors: { getConnection },
    functions: { invoke: async (name: string, body = {}) => {
      // Internal requests are authenticated independently from browser user tokens.
      const response = await fetch(`${required('SUPABASE_URL')}/functions/v1/${name}`, { method: 'POST', headers: { apikey: publicKey(), 'x-cb-internal': internalToken(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json(); if (!response.ok || data.error) throw new Error(data.error || `Function ${name} failed`); return { data };
    } },
  };
  api.asServiceRole = api;
  return api;
}
async function getUser(req: Request, client: any) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await client.from('user').select('*').eq('id', user.id).single();
  return data ? { ...data.data, id: user.id, email: user.email } : null;
}
async function record(client: any, table: string, key: string, value: any) {
  if (typeof value !== 'string' || !value || value.length > 256) fail('Invalid link', 401);
  const query = client.from(table).select('*');
  const { data, error } = await (key === 'id' ? query.eq('id', value) : query.eq(`data->>${key}`, value)).limit(1);
  if (error || !data?.[0]) fail('Invalid link', 401);
  return unwrap(data[0]);
}
function notExpired(value: any) { if (value && (!Number.isFinite(Date.parse(value)) || Date.parse(value) < Date.now())) fail('Link expired', 410); }
async function authorizeDocument(client: any, name: string, body: any) {
  const config: any = {
    appointmentActions: ['appointment',null,'cancel_token','cancel_token_expires'],
    quoteActions: ['quote','quote_id','view_token','expires_at'], invoiceActions: ['invoice','invoice_id','view_token','expires_at'],
    contractSignature: ['contract',null,'sign_token','sign_token_expires'],
    eSignatureActions: ['e_signature_request','request_id','sign_token','expires_at'],
    documentActions: ['document','document_id','secure_token','expires_at'],
  };
  const [table, idKey, tokenKey, expires] = config[name];
  const row = await record(client, table, idKey ? 'id' : tokenKey, idKey ? body[idKey] : (body.token || body.cancel_token));
  if (typeof (body.token || body.cancel_token) !== 'string' || row[tokenKey] !== (body.token || body.cancel_token)) fail('Invalid link', 401);
  notExpired(row[expires]);
}
async function authorizePortal(client: any, name: string, body: any, user: any) {
  const token = body.access_token || body.portal_token || body.token;
  let access: any;
  if (token) access = await record(client, 'client_portal_access', 'access_token', token);
  else if (user?.email) {
    const contact = await record(client, 'contact', 'email', user.email);
    const { data } = await client.from('client_portal_access').select('*').eq('data->>contact_id',contact.id);
    access = data?.map(unwrap).find((row: any) => row.is_active && (!row.expires_at || Date.parse(row.expires_at) > Date.now()));
  }
  if (!access || !access.is_active) fail('Portal access required', 401);
  notExpired(access.expires_at);
  const contact = await record(client, 'contact', 'id', access.contact_id);
  if (access.project_id) { const project = await record(client, 'project', 'id', access.project_id); if (project.contact_id !== contact.id && project.client_id !== contact.id) fail('Access denied'); }
  // Use the actual token throughout the legacy workflows, never a guessable custom slug.
  body.access_token = access.access_token; body.portal_token = access.access_token; body.token = access.access_token;
  if (body.contact_id && body.contact_id !== contact.id) fail('Access denied');
  body.contact_id = contact.id;
  const refs: any = { quote_id: 'quote', invoice_id: 'invoice', receipt_id: 'receipt', project_id: 'project', message_id: 'portal_message', proof_id: 'proof_approval', request_id: 'file_request', appointment_id: 'appointment' };
  for (const [key, table] of Object.entries(refs)) {
    if (!body[key]) continue;
    const row = await record(client, table as string, 'id', body[key]);
    if (row.contact_id !== contact.id && row.client_id !== contact.id && row.linked_client_id !== contact.id && row.client_email !== contact.email) fail('Access denied');
    if (key === 'message_id' && row.sender_type !== 'admin') fail('Access denied');
  }
  if (name === 'portalMessages') { body.sender_type = 'client'; body.sender_name = contact.full_name; }
}
export function serve(name: string, handler: (req: Request) => Promise<Response>) {
  Deno.serve(async original => {
    const origin = original.headers.get('origin');
    const allowed = (Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('SITE_URL') || 'https://www.creativebooks.co.za').split(',').map(v => v.trim());
    const cors = { ...(origin && allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}), 'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', Vary: 'Origin' };
    if (origin && !allowed.includes(origin)) return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: cors });
    if (original.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      if (name === 'platform-file' ? original.method !== 'GET' : original.method !== 'POST') fail('Method not allowed', 405);
      const client = adminClient();
      const internalSecret = internalToken();
      const internal = Boolean(internalSecret && original.headers.get('x-cb-internal') === internalSecret);
      const user = internal ? { role: 'admin', email: 'automation@creativebooks.co.za' } : await getUser(original, client);
      let body: any = {};
      const multipart = original.headers.get('content-type')?.includes('multipart/form-data');
      if (!multipart && original.method === 'POST') {
        const content = await original.text(); if (content.length > 3_000_000) fail('Request too large', 413);
        try { body = JSON.parse(content || '{}'); } catch { fail('Invalid JSON', 400); }
        if (!body || Array.isArray(body) || typeof body !== 'object') fail('Invalid request', 400);
      }
      const mode = accessMode(name, body.action, user?.role, internal);
      if (mode === 'deny') fail(user ? 'Staff access required' : 'Please sign in', user ? 403 : 401);
      if (mode === 'form' || (mode === 'file' && name === 'platform-upload')) {
        const ip = original.headers.get('x-forwarded-for')?.split(',')[0] || original.headers.get('x-real-ip') || 'unknown';
        const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${internalToken()}:${ip}:${name}`));
        const key = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2,'0')).join('');
        const { data, error } = await client.rpc('cb_rate_limit', { fingerprint: key, maximum: name === 'platform-upload' ? 20 : 30 });
        if (error) throw error; if (!data) fail('Too many requests. Please try later.', 429);
        if (name === 'captureFormSubmission') {
          if (!body.fullName || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || !body.formType) fail('Name, email and form type are required', 400);
        }
      }
      if (mode === 'client') {
        const permitted: any = { portalUploads: ['get_my_uploads','upload_file'], portalReviews: ['get_my_reviews','submit_review'] };
        if (!permitted[name]?.includes(body.action)) fail('Access denied');
        await authorizePortal(client, name, body, user);
      }
      if (mode === 'document') await authorizeDocument(client, name, body);
      if (mode === 'portal') await authorizePortal(client, name, body, user);
      const req = multipart || original.method === 'GET' ? original : new Request(original.url, { method: original.method, headers: original.headers, body: JSON.stringify(body) });
      contexts.set(req, { client, user, mode });
      const result = await handler(req);
      const headers = new Headers(result.headers); for (const [key,value] of Object.entries(cors)) headers.set(key,value);
      return new Response(result.body, { status: result.status, headers });
    } catch (error) {
      console.error(`${name}:`, error);
      return Response.json({ error: error.status ? error.message : 'The request could not be completed. Check the function logs.' }, { status: error.status || 500, headers: cors });
    }
  });
}
