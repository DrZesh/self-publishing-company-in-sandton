import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
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

function substituteVariables(text: string, variables: Record<string, unknown>) {
  return String(text || '').replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] === undefined || variables[key] === null
      ? match
      : String(variables[key]);
  });
}

function brandedShell(innerHtml: string, settings: Record<string, unknown>, unsubscribeLink = '#') {
  const senderName = escapeHtml(settings.sender_name || 'Creative Books SA');
  const senderEmail = escapeHtml(settings.sender_email || 'info@creativebooks.co.za');
  const safeUnsubscribe = escapeHtml(unsubscribeLink);
  return `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 16px"><tr><td align="center"><table width="100%" style="max-width:600px"><tr><td style="background:#B87333;padding:24px 32px;border-radius:12px 12px 0 0"><div style="color:#fff;font-size:22px;font-weight:800">${senderName}</div></td></tr><tr><td style="background:#fff;padding:36px 32px;font-size:15px;line-height:1.7;color:#2d2d2d">${innerHtml}</td></tr><tr><td style="background:#1a1208;padding:24px 32px;border-radius:0 0 12px 12px"><p style="margin:0 0 6px;color:#fff;font-size:13px;font-weight:bold">${senderName}</p><p style="margin:0 0 10px;color:rgba(255,255,255,.55);font-size:12px">${senderEmail} · 084 230 5393</p><p style="margin:0;color:rgba(255,255,255,.35);font-size:11px">To unsubscribe from automated updates <a href="${safeUnsubscribe}" style="color:#B87333">click here</a>.</p></td></tr></table></td></tr></table></body></html>`;
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

  const cronAuthorized = () => {
    const configured = Deno.env.get('COMMUNICATION_CRON_SECRET');
    const supplied = request.headers.get('x-cron-secret');
    return Boolean(configured && supplied && configured === supplied);
  };

  const getSettings = async () => {
    const { data, error } = await admin
      .from('app_settings')
      .select('*')
      .eq('setting_key', 'email_settings')
      .maybeSingle();
    if (error) throw error;
    return data || {
      email_provider: 'resend',
      sender_name: 'Creative Books SA',
      sender_email: 'info@creativebooks.co.za',
      reply_to: 'info@creativebooks.co.za',
    };
  };

  const sendEmail = async (to: string, subject: string, html: string, settings: Record<string, unknown>) => {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY is not configured');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${settings.sender_name || 'Creative Books SA'} <${settings.sender_email || 'info@creativebooks.co.za'}>`,
        to: [to],
        subject,
        html,
        reply_to: settings.reply_to || settings.sender_email || 'info@creativebooks.co.za',
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || 'Email delivery failed');
    return result?.id || null;
  };

  const sendWhatsApp = async (recipient: string, message: string) => {
    const key = Deno.env.get('CALLMEBOT_API_KEY');
    if (!key) throw new Error('CALLMEBOT_API_KEY is not configured');
    const phone = recipient.replace(/\D/g, '');
    const response = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(key)}`);
    if (!response.ok) throw new Error(`WhatsApp delivery failed with HTTP ${response.status}`);
    return `callmebot-${Date.now()}`;
  };

  const renderTemplate = async (
    template: Record<string, unknown>,
    variables: Record<string, unknown>,
    skipBranding = false,
  ) => {
    const settings = await getSettings();
    const subject = substituteVariables(String(template.subject || template.name || ''), variables);
    const inner = substituteVariables(String(template.content_html || ''), variables);
    const body = template.channel === 'email' && !skipBranding
      ? brandedShell(inner, settings, String(variables.unsubscribe_link || '#'))
      : inner;
    return { subject, body, settings };
  };

  const logMessage = async (payload: Record<string, unknown>) => {
    const { error } = await admin.from('message_logs').insert(payload);
    if (error && !String(error.message).includes('duplicate key')) throw error;
  };

  const deliverQueueItem = async (item: Record<string, unknown>, approvedBy?: string | null) => {
    const { data: claimed, error: claimError } = await admin
      .from('message_queue')
      .update({
        status: 'sending',
        approved_by: approvedBy || item.approved_by || null,
        approved_at: approvedBy ? new Date().toISOString() : item.approved_at,
        last_error: null,
      })
      .eq('id', item.id)
      .in('status', ['pending_approval', 'scheduled', 'failed'])
      .select('*')
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return { skipped: true, reason: 'already_claimed' };

    const settings = await getSettings();
    let providerMessageId: string | null = null;
    let provider = claimed.channel === 'whatsapp' ? 'callmebot' : String(settings.email_provider || 'resend');

    try {
      if (claimed.channel === 'whatsapp') {
        providerMessageId = await sendWhatsApp(claimed.recipient, claimed.rendered_body);
      } else {
        providerMessageId = await sendEmail(claimed.recipient, claimed.rendered_subject, claimed.rendered_body, settings);
      }

      const now = new Date().toISOString();
      await admin.from('message_queue').update({ status: 'sent', sent_at: now, last_error: null }).eq('id', claimed.id);
      await logMessage({
        client_id: claimed.client_id,
        project_id: claimed.project_id,
        channel: claimed.channel,
        template_used: claimed.template_name,
        template_id: claimed.template_id,
        recipient: claimed.recipient,
        subject: claimed.rendered_subject,
        body: claimed.rendered_body,
        trigger: claimed.trigger_event,
        action_taken: claimed.channel === 'whatsapp' ? 'send_whatsapp' : 'send_email',
        sent_at: now,
        success: true,
        triggered_by: approvedBy ? 'admin' : claimed.triggered_by,
        dedup_key: claimed.dedup_key,
        automation_rule_id: claimed.automation_rule_id,
        provider,
        client_name: claimed.client_name,
        project_name: claimed.project_name,
        provider_message_id: providerMessageId,
      });
      if (claimed.automation_rule_id) {
        await admin.rpc('increment_automation_rule_run', { p_rule_id: claimed.automation_rule_id }).catch(() => null);
      }
      if (claimed.project_id) {
        await admin.from('projects').update({ last_update_sent_at: now }).eq('id', claimed.project_id);
      }
      return { success: true, provider, provider_message_id: providerMessageId };
    } catch (error) {
      const message = (error as Error).message;
      await admin.from('message_queue').update({
        status: 'failed',
        retry_count: (claimed.retry_count || 0) + 1,
        last_error: message,
      }).eq('id', claimed.id);
      await logMessage({
        client_id: claimed.client_id,
        project_id: claimed.project_id,
        channel: claimed.channel,
        template_used: claimed.template_name,
        template_id: claimed.template_id,
        recipient: claimed.recipient,
        subject: claimed.rendered_subject,
        body: claimed.rendered_body,
        trigger: claimed.trigger_event,
        action_taken: claimed.channel === 'whatsapp' ? 'send_whatsapp' : 'send_email',
        sent_at: new Date().toISOString(),
        success: false,
        error_message: message,
        triggered_by: approvedBy ? 'admin' : claimed.triggered_by,
        dedup_key: `${claimed.dedup_key}__failed__${Date.now()}`,
        automation_rule_id: claimed.automation_rule_id,
        provider,
        client_name: claimed.client_name,
        project_name: claimed.project_name,
      });
      throw error;
    }
  };

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'render_template') {
      await requireAdmin();
      const templateId = body.template_id || body.templateId;
      const { data: template, error } = await admin.from('message_templates').select('*').eq('id', templateId).maybeSingle();
      if (error) throw error;
      if (!template) return json({ error: 'Template not found' }, 404);

      const previewVariables = {
        client_name: 'Nompumelelo',
        book_title: 'My Book Project',
        project_name: 'My Book Project',
        project_stage: 'Editing',
        current_status: 'Your manuscript is currently in the Editing phase.',
        next_step: 'We will send you a proof for review once this phase is complete.',
        required_action: 'No action required from you at this time.',
        admin_name: 'Creative Books SA',
        company_name: 'Creative Books SA',
        unsubscribe_link: `${siteUrl}/unsubscribe?token=preview`,
        ...(body.variables || {}),
      };
      const rendered = await renderTemplate(template, previewVariables);

      if (body.test_send_to || body.testSendTo) {
        const recipient = body.test_send_to || body.testSendTo;
        const providerMessageId = await sendEmail(recipient, rendered.subject, rendered.body, rendered.settings);
        return json({ success: true, rendered_subject: rendered.subject, rendered_body: rendered.body, provider: 'resend', provider_message_id: providerMessageId });
      }

      return json({ success: true, rendered_subject: rendered.subject, rendered_body: rendered.body });
    }

    if (action === 'send_branded_email') {
      await requireAdmin();
      if (!body.to || !body.subject || !body.html_body) return json({ error: 'to, subject and html_body are required' }, 400);
      const settings = await getSettings();
      const html = body.skip_branding ? body.html_body : brandedShell(body.html_body, settings, '#');
      const providerMessageId = await sendEmail(body.to, body.subject, html, settings);
      return json({ success: true, provider: 'resend', provider_message_id: providerMessageId });
    }

    if (action === 'approve_queue') {
      const { user } = await requireAdmin();
      const { data: item, error } = await admin.from('message_queue').select('*').eq('id', body.queue_id).maybeSingle();
      if (error) throw error;
      if (!item) return json({ error: 'Queue item not found' }, 404);
      const result = await deliverQueueItem(item, user.email || 'admin');
      return json(result);
    }

    if (action === 'cancel_queue') {
      await requireAdmin();
      const { error } = await admin
        .from('message_queue')
        .update({ status: 'cancelled' })
        .eq('id', body.queue_id)
        .in('status', ['pending_approval', 'scheduled', 'failed']);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === 'process_due_queue') {
      if (!cronAuthorized()) await requireAdmin();
      const now = new Date().toISOString();
      const { data: items, error } = await admin
        .from('message_queue')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_for', now)
        .order('scheduled_for')
        .limit(100);
      if (error) throw error;
      const results = [];
      for (const item of items || []) {
        try {
          results.push({ id: item.id, ...(await deliverQueueItem(item)) });
        } catch (error) {
          results.push({ id: item.id, success: false, error: (error as Error).message });
        }
      }
      return json({ success: true, processed: results.length, results });
    }

    if (action === 'unsubscribe_lookup') {
      if (!body.token) return json({ error: 'Token is required' }, 400);
      const { data: contact, error } = await admin
        .from('contacts')
        .select('id, email, full_name, unsubscribed')
        .eq('unsubscribe_token', body.token)
        .maybeSingle();
      if (error) throw error;
      if (!contact) return json({ error: 'Invalid unsubscribe link' }, 404);
      return json({ success: true, contact });
    }

    if (action === 'unsubscribe') {
      if (!body.token) return json({ error: 'Token is required' }, 400);
      const { data: contact, error } = await admin
        .from('contacts')
        .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
        .eq('unsubscribe_token', body.token)
        .select('id, email, full_name, unsubscribed')
        .maybeSingle();
      if (error) throw error;
      if (!contact) return json({ error: 'Invalid unsubscribe link' }, 404);
      return json({ success: true, contact });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = (error as Error).message || 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    return json({ error: message }, status);
  }
});
