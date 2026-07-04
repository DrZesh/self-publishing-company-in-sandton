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

function substituteVariables(text: string, variables: Record<string, unknown>) {
  return String(text || '').replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] === undefined || variables[key] === null
      ? match
      : String(variables[key]);
  });
}

function brandedShell(innerHtml: string, settings: Record<string, unknown>, unsubscribeLink: string) {
  const senderName = String(settings.sender_name || 'Creative Books SA');
  const senderEmail = String(settings.sender_email || 'info@creativebooks.co.za');
  return `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 16px"><tr><td align="center"><table width="100%" style="max-width:600px"><tr><td style="background:#B87333;padding:24px 32px;border-radius:12px 12px 0 0"><div style="color:#fff;font-size:22px;font-weight:800">${senderName}</div></td></tr><tr><td style="background:#fff;padding:36px 32px;font-size:15px;line-height:1.7;color:#2d2d2d">${innerHtml}</td></tr><tr><td style="background:#1a1208;padding:24px 32px;border-radius:0 0 12px 12px"><p style="margin:0 0 6px;color:#fff;font-size:13px;font-weight:bold">${senderName}</p><p style="margin:0 0 10px;color:rgba(255,255,255,.55);font-size:12px">${senderEmail} · 084 230 5393</p><p style="margin:0;color:rgba(255,255,255,.35);font-size:11px">To unsubscribe from automated updates <a href="${unsubscribeLink}" style="color:#B87333">click here</a>.</p></td></tr></table></td></tr></table></body></html>`;
}

function withinSendWindow() {
  const parts = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'short',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const weekday = parts.find(part => part.type === 'weekday')?.value;
  const hour = Number(parts.find(part => part.type === 'hour')?.value || 0);
  return weekday !== 'Sun' && hour >= 8 && hour < 18;
}

function mappedTriggers(event: Record<string, unknown>) {
  const triggers = new Set<string>();
  if (event.event_type === 'project_created') triggers.add('project_created');
  if (event.event_type === 'stage_changed') {
    triggers.add('stage_changed');
    const stage = String(event.new_stage || '');
    if (stage === 'Payment Received') triggers.add('payment_confirmed');
    if (stage === 'Manuscript Received') triggers.add('files_received');
    if (stage === 'Client Approval') triggers.add('proof_sent');
    if (stage === 'Final Approval Received') triggers.add('proof_approved');
    if (['Delivered', 'Completed'].includes(stage)) triggers.add('project_completed');
  }
  return [...triggers];
}

function stageContext(project: Record<string, unknown>, contact: Record<string, unknown>, siteUrl: string) {
  const stage = String(project.stage || project.current_stage || 'In Progress');
  const waiting = String(project.waiting_on || '');
  let currentStatus = `Your project is currently at stage: ${stage}.`;
  let requiredAction = 'No action required from you at this time.';
  let nextStep = 'We will update you when there is progress.';

  if (['Editing', 'Proofreading', 'Typesetting', 'Cover Design'].includes(stage)) {
    currentStatus = `Your manuscript is currently in the ${stage} phase and our team is working on it.`;
    nextStep = 'We will send you a proof for review once this phase is complete.';
  } else if (['Client Approval', 'Final Approval Received'].includes(stage)) {
    currentStatus = 'Your proof is ready for review.';
    requiredAction = 'Please review the proof and provide your approval or change requests.';
    nextStep = 'Once you approve, we will proceed to the next stage.';
  } else if (waiting === 'Payment' || stage === 'Quote Accepted') {
    currentStatus = 'We are awaiting payment confirmation before we can proceed.';
    requiredAction = 'Please complete payment to allow us to begin your project.';
    nextStep = 'Once payment is confirmed, your project will begin immediately.';
  } else if (waiting === 'Approval' || stage === 'Changes Requested') {
    currentStatus = 'We are awaiting your approval of the proof sent to you.';
    requiredAction = 'Please review the proof and let us know if it is approved or if changes are needed.';
    nextStep = 'Once you approve, we will proceed to printing.';
  } else if (['Mass Production Started', 'Sample Print Queued', 'Sample Print Completed'].includes(stage)) {
    currentStatus = 'Your book is currently in production and we will continue updating you.';
    nextStep = 'We will notify you when your copies are ready for collection or delivery.';
  } else if (stage === 'Ready for Collection') {
    currentStatus = 'Your printed copies are ready and waiting at our Fourways office.';
    requiredAction = 'Please arrange to collect your books at your earliest convenience.';
    nextStep = 'Visit us at Prism Office Park, Fourways, Monday to Friday between 08:00 and 17:00.';
  } else if (['Courier Booked', 'Delivered'].includes(stage)) {
    currentStatus = 'Your books are on their way to you.';
    nextStep = 'Please ensure someone is available to receive the delivery.';
  } else if (stage === 'Completed') {
    currentStatus = 'Your project is complete.';
    nextStep = 'Thank you for choosing Creative Books SA.';
  }

  return {
    client_name: contact.full_name || 'Valued Client',
    book_title: project.book_title || 'Your Book',
    project_name: project.book_title || 'Your Project',
    project_stage: stage,
    current_status: currentStatus,
    next_step: nextStep,
    required_action: requiredAction,
    admin_name: 'Creative Books SA',
    company_name: 'Creative Books SA',
    unsubscribe_link: `${siteUrl}/unsubscribe?token=${contact.unsubscribe_token || ''}`,
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
  const siteUrl = (Deno.env.get('SITE_URL') || request.headers.get('origin') || 'https://www.creativebooks.co.za').replace(/\/$/, '');
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.replace(/^Bearer\s+/i, '');

  const requireAdminOrCron = async () => {
    const configured = Deno.env.get('COMMUNICATION_CRON_SECRET');
    const supplied = request.headers.get('x-cron-secret');
    if (configured && supplied && configured === supplied) return;
    if (!bearer) throw new Error('Unauthorized');
    const { data: userData, error: userError } = await admin.auth.getUser(bearer);
    if (userError || !userData.user) throw new Error('Unauthorized');
    const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).maybeSingle();
    if (!['super_admin', 'admin'].includes(profile?.role)) throw new Error('Admin access required');
  };

  const getSettings = async () => {
    const { data, error } = await admin.from('app_settings').select('*').eq('setting_key', 'email_settings').maybeSingle();
    if (error) throw error;
    return data || {
      sender_name: 'Creative Books SA',
      sender_email: 'info@creativebooks.co.za',
      reply_to: 'info@creativebooks.co.za',
      email_provider: 'resend',
    };
  };

  const sendEmail = async (to: string, subject: string, html: string, settings: Record<string, unknown>) => {
    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) throw new Error('RESEND_API_KEY is not configured');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
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

  const sendWhatsApp = async (to: string, message: string) => {
    const key = Deno.env.get('CALLMEBOT_API_KEY');
    if (!key) throw new Error('CALLMEBOT_API_KEY is not configured');
    const phone = to.replace(/\D/g, '');
    const response = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(key)}`);
    if (!response.ok) throw new Error(`WhatsApp delivery failed with HTTP ${response.status}`);
    return `callmebot-${Date.now()}`;
  };

  const dedupExists = async (dedupKey: string) => {
    const [{ data: sent }, { data: queued }] = await Promise.all([
      admin.from('message_logs').select('id').eq('dedup_key', dedupKey).eq('success', true).limit(1),
      admin.from('message_queue').select('id').eq('dedup_key', dedupKey).in('status', ['pending_approval', 'scheduled', 'sending', 'sent']).limit(1),
    ]);
    return Boolean(sent?.length || queued?.length);
  };

  const conditionsPass = (rule: Record<string, unknown>, project: Record<string, unknown>, contact: Record<string, unknown>) => {
    const conditions = (rule.conditions || {}) as Record<string, unknown>;
    if (conditions.only_if_automation_enabled && !project.automation_enabled) return false;
    if (conditions.skip_if_do_not_contact && contact.do_not_contact) return false;
    if (conditions.skip_if_unsubscribed && contact.unsubscribed) return false;
    if (conditions.require_email_exists && !contact.email) return false;
    if (conditions.only_if_active && project.stage === 'Completed') return false;
    if (conditions.not_stage && project.stage === conditions.not_stage) return false;
    if (rule.trigger === 'stage_changed' && rule.trigger_stage && project.stage !== rule.trigger_stage) return false;
    return true;
  };

  const processRule = async (
    rule: Record<string, unknown>,
    trigger: string,
    project: Record<string, unknown>,
    contact: Record<string, unknown>,
  ) => {
    if (!conditionsPass(rule, project, contact)) return { skipped: true, reason: 'conditions' };

    if (rule.action === 'stop_automation') {
      await admin.from('projects').update({ automation_enabled: false, automation_stop_reason: `Rule: ${rule.name}` }).eq('id', project.id);
      await admin.rpc('increment_automation_rule_run', { p_rule_id: rule.id });
      return { updated: true, action: 'stop_automation' };
    }

    if (rule.action === 'create_task') {
      const dueDate = new Date(Date.now() + Math.max(1, Number(rule.delay_minutes) || 0) * 60000).toISOString();
      await admin.from('tasks').insert({
        title: String(rule.name),
        description: `Created automatically for ${project.book_title || 'project'} after ${trigger}.`,
        contact_id: project.contact_id,
        status: 'Open',
        priority: 'Medium',
        due_date: dueDate,
      });
      await admin.rpc('increment_automation_rule_run', { p_rule_id: rule.id });
      return { created: true, action: 'create_task' };
    }

    if (!['send_email', 'send_whatsapp', 'send_reminder', 'notify_admin'].includes(String(rule.action))) {
      return { skipped: true, reason: 'unsupported_action' };
    }

    if (!rule.template_id) return { skipped: true, reason: 'template_not_found' };
    const { data: template, error: templateError } = await admin.from('message_templates').select('*').eq('id', rule.template_id).eq('is_active', true).maybeSingle();
    if (templateError) throw templateError;
    if (!template) return { skipped: true, reason: 'template_not_found' };

    const ctx = stageContext(project, contact, siteUrl);
    const renderedSubject = substituteVariables(String(template.subject || template.name || ''), ctx);
    const renderedInner = substituteVariables(String(template.content_html || ''), ctx);
    const settings = await getSettings();
    const channel = rule.action === 'send_whatsapp' || template.channel === 'whatsapp' ? 'whatsapp' : 'email';
    const renderedBody = channel === 'email'
      ? brandedShell(renderedInner, settings, String(ctx.unsubscribe_link))
      : renderedInner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const recipient = rule.action === 'notify_admin'
      ? 'info@creativebooks.co.za'
      : channel === 'whatsapp'
        ? String(contact.phone || '')
        : String(contact.email || '');

    if (!recipient) return { skipped: true, reason: 'recipient_missing' };

    const date = new Date().toISOString().slice(0, 10);
    const stage = String(project.stage || '');
    const dedupKey = `${project.id}__${trigger}__${stage}_${date}__${rule.id}`;
    if (await dedupExists(dedupKey)) return { skipped: true, reason: 'dedup' };

    const delayMinutes = Math.max(0, Number(rule.delay_minutes) || 0);
    if (rule.requires_approval || delayMinutes > 0) {
      const status = rule.requires_approval ? 'pending_approval' : 'scheduled';
      const scheduledFor = delayMinutes > 0
        ? new Date(Date.now() + delayMinutes * 60000).toISOString()
        : null;
      const { error } = await admin.from('message_queue').insert({
        client_id: project.contact_id,
        project_id: project.id,
        automation_rule_id: rule.id,
        channel,
        template_id: template.id,
        template_name: template.name,
        recipient,
        rendered_subject: renderedSubject,
        rendered_body: renderedBody,
        status,
        scheduled_for: scheduledFor,
        dedup_key: dedupKey,
        triggered_by: 'automation',
        trigger_event: trigger,
        client_name: contact.full_name,
        project_name: project.book_title,
      });
      if (error && !String(error.message).includes('duplicate key')) throw error;
      return { queued: true, status, scheduled_for: scheduledFor };
    }

    let success = false;
    let errorMessage = '';
    let providerMessageId: string | null = null;
    const provider = channel === 'whatsapp' ? 'callmebot' : 'resend';

    try {
      providerMessageId = channel === 'whatsapp'
        ? await sendWhatsApp(recipient, renderedBody)
        : await sendEmail(recipient, renderedSubject, renderedBody, settings);
      success = true;
    } catch (error) {
      errorMessage = (error as Error).message;
    }

    const logDedupKey = success ? dedupKey : `${dedupKey}__failed__${Date.now()}`;
    await admin.from('message_logs').insert({
      client_id: project.contact_id,
      project_id: project.id,
      channel,
      template_used: template.name,
      template_id: template.id,
      recipient,
      subject: renderedSubject,
      body: renderedBody,
      trigger,
      action_taken: rule.action,
      sent_at: new Date().toISOString(),
      success,
      error_message: errorMessage || null,
      triggered_by: 'automation',
      dedup_key: logDedupKey,
      automation_rule_id: rule.id,
      provider,
      client_name: contact.full_name,
      project_name: project.book_title,
      stage_at_send: project.stage,
      provider_message_id: providerMessageId,
    });

    if (success) {
      await admin.rpc('increment_automation_rule_run', { p_rule_id: rule.id });
      await admin.from('projects').update({ last_update_sent_at: new Date().toISOString() }).eq('id', project.id);
    }

    return success ? { sent: true } : { failed: true, error: errorMessage };
  };

  const processProjectTriggers = async (projectId: string, triggers: string[]) => {
    const { data: project, error: projectError } = await admin.from('projects').select('*').eq('id', projectId).maybeSingle();
    if (projectError) throw projectError;
    if (!project) return [];

    const { data: contact, error: contactError } = await admin.from('contacts').select('*').eq('id', project.contact_id).maybeSingle();
    if (contactError) throw contactError;
    if (!contact || contact.do_not_contact || contact.unsubscribed) return [];

    const results = [];
    for (const trigger of triggers) {
      const { data: rules, error } = await admin.from('automation_rules').select('*').eq('trigger', trigger).eq('is_active', true).order('sort_order');
      if (error) throw error;
      for (const rule of rules || []) {
        results.push({ trigger, rule: rule.name, ...(await processRule(rule, trigger, project, contact)) });
      }
    }
    return results;
  };

  try {
    await requireAdminOrCron();
    const body = await request.json();
    const action = body.action || 'process_events';

    if (action === 'process_events') {
      const { data: events, error } = await admin.rpc('claim_pending_automation_events', {
        p_limit: Math.max(1, Math.min(Number(body.limit) || 50, 200)),
      });
      if (error) throw error;

      const processed = [];
      for (const event of events || []) {
        try {
          const results = await processProjectTriggers(event.project_id, mappedTriggers(event));
          await admin.rpc('mark_automation_event_result', {
            p_event_id: event.id,
            p_success: true,
            p_error: null,
          });
          processed.push({ event_id: event.id, success: true, results });
        } catch (error) {
          const message = (error as Error).message;
          await admin.rpc('mark_automation_event_result', {
            p_event_id: event.id,
            p_success: false,
            p_error: message,
          });
          processed.push({ event_id: event.id, success: false, error: message });
        }
      }

      return json({ success: true, mode: 'events', processed: processed.length, results: processed });
    }

    if (action === 'daily_run') {
      if (!withinSendWindow()) return json({ success: true, skipped: true, reason: 'outside_send_window_or_sunday' });
      const cutoff = new Date(Date.now() - 2 * 86400000).toISOString();
      const { data: projects, error } = await admin
        .from('projects')
        .select('id')
        .eq('automation_enabled', true)
        .eq('updates_paused', false)
        .neq('stage', 'Completed')
        .or(`last_update_sent_at.is.null,last_update_sent_at.lt.${cutoff}`)
        .limit(500);
      if (error) throw error;

      const results = [];
      for (const project of projects || []) {
        results.push({ project_id: project.id, results: await processProjectTriggers(project.id, ['no_update_2_days']) });
      }
      return json({ success: true, mode: 'daily', checked: projects?.length || 0, results });
    }

    if (action === 'run_project') {
      if (!body.project_id || !body.trigger) return json({ error: 'project_id and trigger are required' }, 400);
      const results = await processProjectTriggers(body.project_id, [body.trigger]);
      return json({ success: true, mode: 'manual', results });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = (error as Error).message || 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    return json({ error: message }, status);
  }
});
