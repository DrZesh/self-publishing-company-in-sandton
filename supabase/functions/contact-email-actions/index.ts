import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FROM_EMAIL = Deno.env.get('CONTACT_EMAIL_FROM') || 'Creative Books SA <info@creativebooks.co.za>';
const BUSINESS_EMAIL = Deno.env.get('CONTACT_EMAIL_ADDRESS') || 'info@creativebooks.co.za';
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function storageUri(bucket: string, path: string) {
  return `supabase://${bucket}/${path}`;
}

function parseStorageUri(value: unknown) {
  const match = typeof value === 'string' ? value.match(/^supabase:\/\/([^/]+)\/(.+)$/) : null;
  return match ? { bucket: match[1], path: match[2] } : null;
}

function cleanEmailList(value: unknown): string[] {
  const input = Array.isArray(value) ? value : value ? [value] : [];
  return input
    .filter(item => typeof item === 'string')
    .map(item => item.trim().toLowerCase())
    .filter(item => /\S+@\S+\.\S+/.test(item))
    .slice(0, 50);
}

function base64ToBytes(input: string) {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function requireAdmin(admin: ReturnType<typeof createClient>, request: Request) {
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.replace(/^Bearer\s+/i, '');
  if (!bearer) throw new Error('Unauthorized');

  const { data: userData, error: userError } = await admin.auth.getUser(bearer);
  if (userError || !userData.user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role, email, full_name')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || !['super_admin', 'admin'].includes(profile?.role)) {
    throw new Error('Admin access required');
  }

  return {
    id: userData.user.id,
    email: profile.email || userData.user.email || 'admin',
    fullName: profile.full_name || userData.user.email || 'Admin',
  };
}

async function hydrateAttachmentUrls(admin: ReturnType<typeof createClient>, attachments: unknown) {
  const list = Array.isArray(attachments) ? attachments : [];
  const hydrated = [];

  for (const item of list) {
    const attachment = item && typeof item === 'object' ? { ...item } : null;
    if (!attachment) continue;
    const parsed = parseStorageUri(attachment.url);
    if (parsed) {
      const { data, error } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, 3600);
      if (!error && data?.signedUrl) attachment.url = data.signedUrl;
    }
    hydrated.push(attachment);
  }

  return hydrated;
}

async function attachmentForResend(admin: ReturnType<typeof createClient>, attachment: Record<string, unknown>) {
  const parsed = parseStorageUri(attachment.url);
  let bytes: Uint8Array;

  if (parsed) {
    const { data, error } = await admin.storage.from(parsed.bucket).download(parsed.path);
    if (error) throw error;
    bytes = new Uint8Array(await data.arrayBuffer());
  } else if (typeof attachment.url === 'string') {
    const response = await fetch(attachment.url);
    if (!response.ok) throw new Error(`Unable to load attachment ${attachment.name || 'file'}.`);
    bytes = new Uint8Array(await response.arrayBuffer());
  } else {
    throw new Error('Attachment file reference is missing.');
  }

  if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error(`Attachment ${attachment.name || 'file'} exceeds the 10 MB limit.`);
  }

  return {
    filename: String(attachment.name || 'attachment'),
    content: bytesToBase64(bytes),
  };
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
    const actor = await requireAdmin(admin, request);
    const body = await request.json().catch(() => ({}));
    const action = body.action;

    if (action === 'list') {
      if (!body.contact_id) return json({ error: 'contact_id is required' }, 400);
      const { data, error } = await admin
        .from('email_messages')
        .select('*')
        .eq('contact_id', body.contact_id)
        .order('sent_at', { ascending: false, nullsFirst: false })
        .order('created_date', { ascending: false })
        .limit(500);
      if (error) throw error;

      const emails = [];
      for (const row of data || []) {
        emails.push({
          ...row,
          attachments: await hydrateAttachmentUrls(admin, row.attachments),
        });
      }
      return json({ emails });
    }

    if (action === 'upload_attachment') {
      const fileName = String(body.file_name || 'attachment').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-160);
      const mimeType = String(body.mime_type || 'application/octet-stream').toLowerCase();
      const fileData = typeof body.file_data === 'string' ? body.file_data : '';
      if (!fileData) return json({ error: 'file_data is required' }, 400);
      if (!ALLOWED_ATTACHMENT_TYPES.has(mimeType)) return json({ error: 'This attachment type is not allowed.' }, 400);

      const bytes = base64ToBytes(fileData);
      if (bytes.byteLength > MAX_ATTACHMENT_BYTES) return json({ error: 'Attachment exceeds the 10 MB limit.' }, 400);

      const path = `email-attachments/${actor.id}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
      const { error: uploadError } = await admin.storage.from('document-files').upload(path, bytes, {
        contentType: mimeType,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      return json({
        url: storageUri('document-files', path),
        name: fileName,
      });
    }

    if (action === 'send') {
      const to = cleanEmailList(body.to);
      const cc = cleanEmailList(body.cc);
      const bcc = cleanEmailList(body.bcc);
      const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 500) : '';
      const bodyHtml = typeof body.body_html === 'string' ? body.body_html : '';
      const bodyText = typeof body.body_text === 'string' ? body.body_text : '';
      const attachments = Array.isArray(body.attachments) ? body.attachments.slice(0, 10) : [];

      if (!to.length || !subject || !bodyHtml) {
        return json({ error: 'Recipient, subject and HTML body are required.' }, 400);
      }

      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (!resendKey) throw new Error('RESEND_API_KEY is not configured.');

      const resendAttachments = [];
      for (const attachment of attachments) {
        if (attachment && typeof attachment === 'object') {
          resendAttachments.push(await attachmentForResend(admin, attachment));
        }
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to,
          subject,
          html: bodyHtml,
          ...(cc.length ? { cc } : {}),
          ...(bcc.length ? { bcc } : {}),
          ...(resendAttachments.length ? { attachments: resendAttachments } : {}),
        }),
      });
      const provider = await response.json().catch(() => ({}));

      const sentAt = new Date().toISOString();
      const status = response.ok ? 'sent' : 'failed';
      const { data: message, error: logError } = await admin
        .from('email_messages')
        .insert({
          contact_id: body.contact_id || null,
          direction: 'outbound',
          from_address: BUSINESS_EMAIL,
          to_addresses: to,
          cc_addresses: cc,
          bcc_addresses: bcc,
          subject,
          body_html: bodyHtml,
          body_text: bodyText,
          attachments,
          thread_id: body.thread_id || null,
          template_id: body.template_id || null,
          external_id: response.ok ? provider?.id || null : null,
          resend_id: response.ok ? provider?.id || null : null,
          read_status: 'read',
          status,
          sent_at: sentAt,
        })
        .select('*')
        .single();
      if (logError) throw logError;

      if (!response.ok) {
        return json({ error: provider?.message || 'Email delivery failed.', message }, 502);
      }

      return json({
        success: true,
        message: {
          ...message,
          attachments: await hydrateAttachmentUrls(admin, message.attachments),
        },
      });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('contact-email-actions error:', error?.message || error);
    const message = error?.message || 'Unexpected email workflow error.';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    return json({ error: message }, status);
  }
});
