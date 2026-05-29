import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// SAST = UTC+2
const SAST_OFFSET = 2;
const RESEND_FROM = 'Creative Books SA <info@creativebooks.co.za>';

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDedupKey(projectId, trigger, stageOrDate) {
  const date = stageOrDate || new Date().toISOString().slice(0, 10);
  return `${projectId}__${trigger}__${date}`;
}

async function dedupExists(base44, key) {
  const existing = await base44.asServiceRole.entities.MessageLog.filter({ dedup_key: key });
  return existing.length > 0;
}

function getSASTHour() {
  return (new Date().getUTCHours() + SAST_OFFSET) % 24;
}

function isSunday() {
  const d = new Date();
  return (d.getUTCDay() + (d.getUTCHours() < 22 ? 0 : 1)) === 0; // rough SAST Sunday check
}

function isWithinSendWindow() {
  const h = getSASTHour();
  return h >= 8 && h < 18;
}

function stageContext(project) {
  const stage = project.stage || project.current_stage || 'In Progress';
  const waiting = project.waiting_on || '';

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
    nextStep = 'Visit us at Prism Office Park, Fourways, Mon–Fri 08:00–17:00.';
  } else if (['Courier Booked', 'Delivered'].includes(stage)) {
    currentStatus = 'Your books are on their way to you.';
    nextStep = 'Please ensure someone is available to receive the delivery.';
  } else if (stage === 'Completed') {
    currentStatus = 'Your project is complete.';
    nextStep = 'Thank you for choosing Creative Books SA!';
  }

  return {
    client_name: project._contact_name || 'Valued Client',
    book_title: project.book_title || 'Your Book',
    project_name: project.book_title || 'Your Project',
    project_stage: stage,
    current_status: currentStatus,
    next_step: nextStep,
    required_action: requiredAction,
    admin_name: 'Creative Books SA',
    company_name: 'Creative Books SA',
    unsubscribe_link: `https://www.creativebooks.co.za/unsubscribe?client=${project.contact_id}`,
  };
}

async function sendOrQueue(base44, { rule, project, contact, trigger, templateId, ctx }) {
  const stage = project.stage || '';
  const date = new Date().toISOString().slice(0, 10);
  const dedupKey = buildDedupKey(project.id, trigger, stage + '_' + date);

  if (await dedupExists(base44, dedupKey)) return { skipped: true, reason: 'dedup' };

  // Render template
  const tplRows = await base44.asServiceRole.entities.MessageTemplate.filter({ id: templateId });
  const template = tplRows[0];
  if (!template) return { skipped: true, reason: 'template_not_found' };

  function subVars(text) {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (m, k) => ctx[k] !== undefined ? ctx[k] : m);
  }

  const renderedSubject = subVars(template.subject || template.name);
  const renderedInner = subVars(template.content_html || '');

  // Load settings for branded shell
  const cfgRows = await base44.asServiceRole.entities.AppSettings.filter({ setting_key: 'email_settings' });
  const cfg = cfgRows[0] || {};
  const senderName = cfg.sender_name || 'Creative Books SA';
  const fromEmail = cfg.sender_email || 'info@creativebooks.co.za';
  const replyTo = cfg.reply_to || fromEmail;

  const BRAND_COLOR = '#B87333';
  const renderedBody = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head><body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background:${BRAND_COLOR};padding:24px 32px;border-radius:12px 12px 0 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="${senderName}" style="height:44px;display:block;"/></td><td align="right" style="color:rgba(255,255,255,0.75);font-size:12px;">${senderName}</td></tr></table></td></tr><tr><td style="background:#ffffff;padding:36px 32px;font-size:15px;line-height:1.7;color:#2d2d2d;">${renderedInner}</td></tr><tr><td style="background:#1a1208;padding:24px 32px;border-radius:0 0 12px 12px;"><p style="margin:0 0 6px;color:rgba(255,255,255,0.9);font-size:13px;font-weight:bold;">${senderName}</p><p style="margin:0 0 10px;color:rgba(255,255,255,0.5);font-size:12px;"><a href="mailto:info@creativebooks.co.za" style="color:${BRAND_COLOR};text-decoration:none;">info@creativebooks.co.za</a> &middot; 084 230 5393</p><p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">To unsubscribe <a href="${ctx.unsubscribe_link || '#'}" style="color:rgba(255,255,255,0.4);">click here</a>.</p></td></tr></table></td></tr></table></body></html>`;

  if (rule?.requires_approval) {
    await base44.asServiceRole.entities.MessageQueue.create({
      client_id: project.contact_id,
      project_id: project.id,
      automation_rule_id: rule?.id,
      channel: 'email',
      template_id: templateId,
      template_name: template.name,
      recipient: contact.email,
      rendered_subject: renderedSubject,
      rendered_body: renderedBody,
      status: 'pending_approval',
      dedup_key: dedupKey,
      triggered_by: 'automation',
      trigger_event: trigger,
      client_name: contact.full_name,
      project_name: project.book_title,
    });
    return { queued: true, dedupKey };
  }

  // Send immediately
  let success = false;
  let errorMessage = '';
  const provider = cfg.email_provider || 'resend';
  const resendKey = Deno.env.get('RESEND_API_KEY');

  try {
    if (provider === 'resend' && resendKey) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${senderName} <${fromEmail}>`,
          to: [contact.email],
          subject: renderedSubject,
          html: renderedBody,
          reply_to: replyTo,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Resend error');
      success = true;
    } else {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: contact.email, subject: renderedSubject, body: renderedBody, from_name: senderName });
      success = true;
    }
  } catch (e) {
    errorMessage = e.message;
  }

  await base44.asServiceRole.entities.MessageLog.create({
    client_id: project.contact_id,
    project_id: project.id,
    channel: 'email',
    template_used: template.name,
    template_id: templateId,
    recipient: contact.email,
    subject: renderedSubject,
    body: renderedBody,
    trigger,
    action_taken: 'send_email',
    sent_at: new Date().toISOString(),
    success,
    error_message: errorMessage || undefined,
    triggered_by: 'automation',
    dedup_key: dedupKey,
    automation_rule_id: rule?.id,
    provider,
    client_name: contact.full_name,
    project_name: project.book_title,
    stage_at_send: project.stage,
  });

  if (rule?.id) {
    await base44.asServiceRole.entities.AutomationRule.update(rule.id, {
      run_count: (rule.run_count || 0) + 1,
      last_run_at: new Date().toISOString(),
    });
  }

  if (success) await base44.asServiceRole.entities.Project.update(project.id, { last_update_sent_at: new Date().toISOString() });

  return { sent: success, failed: !success, error: errorMessage };
}

// ── Condition checker ─────────────────────────────────────────────────────────
function meetsConditions(rule, project, contact) {
  const c = rule.conditions || {};
  if (c.only_if_automation_enabled && !project.automation_enabled) return false;
  if (c.skip_if_do_not_contact && contact.do_not_contact) return false;
  if (c.skip_if_unsubscribed && contact.unsubscribed) return false;
  if (c.require_email_exists && !contact.email) return false;
  if (c.only_if_active && project.stage === 'Completed') return false;
  if (c.not_stage && project.stage === c.not_stage) return false;
  return true;
}

// ── Event-driven handler ──────────────────────────────────────────────────────
async function handleProjectEvent(base44, payload) {
  const { event, data: project, old_data, changed_fields = [] } = payload;
  if (!project?.id) return { skipped: true };

  // Do not contact / unsubscribed check (fast exit)
  const contacts = await base44.asServiceRole.entities.Contact.filter({ id: project.contact_id });
  const contact = contacts[0];
  if (!contact) return { skipped: true, reason: 'contact_not_found' };
  if (contact.do_not_contact || contact.unsubscribed) return { skipped: true, reason: 'do_not_contact' };

  // Determine trigger
  let triggers = [];
  if (event.type === 'create') triggers.push('project_created');
  if (event.type === 'update' && changed_fields.includes('stage') && project.stage !== old_data?.stage) {
    triggers.push('stage_changed');
    // Map specific stages to specific triggers
    if (project.stage === 'Payment Received') triggers.push('payment_confirmed');
    if (project.stage === 'Manuscript Received') triggers.push('files_received');
    if (project.stage === 'Client Approval') triggers.push('proof_sent');
    if (['Delivered', 'Completed'].includes(project.stage)) triggers.push('project_completed');
  }

  if (triggers.length === 0) return { skipped: true, reason: 'no_matching_trigger' };

  const ctx = { ...stageContext(project), client_name: contact.full_name };
  const results = [];

  for (const trigger of triggers) {
    const rules = await base44.asServiceRole.entities.AutomationRule.filter({ trigger, is_active: true });
    for (const rule of rules) {
      if (!meetsConditions(rule, project, contact)) continue;
      if (!rule.template_id) continue;
      const r = await sendOrQueue(base44, { rule, project, contact, trigger, templateId: rule.template_id, ctx });
      results.push({ trigger, rule: rule.name, ...r });
    }
  }

  // Keep current_stage in sync
  if (event.type === 'update' && changed_fields.includes('stage')) {
    await base44.asServiceRole.entities.Project.update(project.id, { current_stage: project.stage });
  }

  return { processed: results.length, results };
}

// ── Daily engine (2-day check) ────────────────────────────────────────────────
async function runDailyEngine(base44) {
  if (!isWithinSendWindow()) return { skipped: true, reason: 'outside_send_window' };
  if (isSunday()) return { skipped: true, reason: 'sunday' };

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

  // Get all active automation-enabled, non-completed, non-paused projects
  const allProjects = await base44.asServiceRole.entities.Project.list('-updated_date', 500);
  const projects = allProjects.filter(p =>
    p.automation_enabled &&
    !p.updates_paused &&
    p.stage !== 'Completed' &&
    (!p.last_update_sent_at || p.last_update_sent_at < twoDaysAgo)
  );

  const twoDayRules = await base44.asServiceRole.entities.AutomationRule.filter({ trigger: 'no_update_2_days', is_active: true });
  const results = [];

  for (const project of projects) {
    const contacts = await base44.asServiceRole.entities.Contact.filter({ id: project.contact_id });
    const contact = contacts[0];
    if (!contact || contact.do_not_contact || contact.unsubscribed) continue;

    const ctx = { ...stageContext(project), client_name: contact.full_name };
    for (const rule of twoDayRules) {
      if (!meetsConditions(rule, project, contact)) continue;
      if (!rule.template_id) continue;
      const r = await sendOrQueue(base44, { rule, project, contact, trigger: 'no_update_2_days', templateId: rule.template_id, ctx });
      results.push({ project: project.book_title, rule: rule.name, ...r });
    }
  }

  return { checked: projects.length, processed: results.length, results };
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Determine mode: daily run (scheduled) or entity event
    if (payload.action === 'daily_run' || payload.automation?.type === 'scheduled') {
      const result = await runDailyEngine(base44);
      return Response.json({ success: true, mode: 'daily', ...result });
    }

    // Entity hook (project create/update)
    const result = await handleProjectEvent(base44, payload);
    return Response.json({ success: true, mode: 'event', ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});