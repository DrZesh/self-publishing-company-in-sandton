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

function brandedShell(innerHtml: string, senderName: string, senderEmail: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center"><table width="100%" style="max-width:600px"><tr><td style="background:#B87333;padding:24px 32px;border-radius:12px 12px 0 0;color:#fff;font-size:22px;font-weight:800">${senderName}</td></tr><tr><td style="background:#fff;padding:36px 32px;font-size:15px;line-height:1.7;color:#2d2d2d">${innerHtml}</td></tr><tr><td style="background:#1a1208;padding:24px 32px;border-radius:0 0 12px 12px;color:rgba(255,255,255,.65);font-size:12px">${senderName} · ${senderEmail} · 084 230 5393</td></tr></table></td></tr></table></body></html>`;
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

  try {
    if (!bearer) return json({ error: 'Unauthorized' }, 401);
    const { data: userData, error: userError } = await admin.auth.getUser(bearer);
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);
    const { data: profile } = await admin.from('profiles').select('role, email').eq('id', userData.user.id).maybeSingle();
    if (!['super_admin', 'admin'].includes(profile?.role)) return json({ error: 'Admin access required' }, 403);

    const body = await request.json();
    const action = body.action;
    const { data: settings } = await admin
      .from('app_settings')
      .select('*')
      .eq('setting_key', 'email_settings')
      .maybeSingle();
    const cfg = settings || {
      sender_name: 'Creative Books SA',
      sender_email: 'info@creativebooks.co.za',
      reply_to: 'info@creativebooks.co.za',
    };

    const resolveContact = async (contactId?: string | null, email?: string | null) => {
      if (contactId) {
        const { data, error } = await admin
          .from('contacts')
          .select('id, full_name, email')
          .eq('id', contactId)
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      }

      if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await admin
          .from('contacts')
          .select('id, full_name, email')
          .ilike('email', normalizedEmail)
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return data;
      }

      return null;
    };

    if (action === 'send_email') {
      if (!body.to || !body.subject || !body.body_html) return json({ error: 'to, subject and body_html are required' }, 400);
      const key = Deno.env.get('RESEND_API_KEY');
      if (!key) return json({ error: 'RESEND_API_KEY is not configured' }, 500);
      const html = brandedShell(body.body_html, cfg.sender_name, cfg.sender_email);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${cfg.sender_name} <${cfg.sender_email}>`,
          to: [body.to],
          subject: body.subject,
          html,
          reply_to: cfg.reply_to || cfg.sender_email,
        }),
      });
      const result = await response.json();
      if (!response.ok) return json({ error: result?.message || 'Email delivery failed' }, 502);

      const contact = await resolveContact(body.contact_id, body.to);
      if (contact) {
        const { error: logError } = await admin.from('message_logs').insert({
          client_id: contact.id,
          project_id: body.project_id || null,
          channel: 'email',
          recipient: body.to,
          subject: body.subject,
          body: html,
          action_taken: 'send_email',
          sent_at: new Date().toISOString(),
          success: true,
          triggered_by: 'admin',
          dedup_key: `manual_email__${crypto.randomUUID()}`,
          provider: 'resend',
          provider_message_id: result?.id || null,
          client_name: contact.full_name || null,
        });
        if (logError) console.warn('Manual email delivered but log insert failed:', logError.message);
      }

      return json({ success: true, provider: 'resend', id: result?.id || null });
    }

    if (action === 'send_whatsapp') {
      if (!body.to_number || !body.message) return json({ error: 'to_number and message are required' }, 400);
      const key = Deno.env.get('CALLMEBOT_API_KEY');
      if (!key) return json({ error: 'CALLMEBOT_API_KEY is not configured' }, 500);
      const phone = String(body.to_number).replace(/\D/g, '');
      const response = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(body.message)}&apikey=${encodeURIComponent(key)}`);
      if (!response.ok) return json({ error: `WhatsApp delivery failed with HTTP ${response.status}` }, 502);

      const contact = await resolveContact(body.contact_id, null);
      if (contact) {
        const { error: logError } = await admin.from('message_logs').insert({
          client_id: contact.id,
          project_id: body.project_id || null,
          channel: 'whatsapp',
          recipient: body.to_number,
          subject: body.type || 'WhatsApp Message',
          body: body.message,
          action_taken: 'send_whatsapp',
          sent_at: new Date().toISOString(),
          success: true,
          triggered_by: 'admin',
          dedup_key: `manual_whatsapp__${crypto.randomUUID()}`,
          provider: 'callmebot',
          client_name: contact.full_name || null,
        });
        if (logError) console.warn('Manual WhatsApp delivered but log insert failed:', logError.message);
      }

      return json({ success: true, provider: 'callmebot', to: body.to_number });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected error' }, 500);
  }
});
