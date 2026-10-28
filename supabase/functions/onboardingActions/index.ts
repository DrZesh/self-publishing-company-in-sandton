/**
 * onboardingActions
 * Manages client onboarding checklists and lead scoring.
 * Actions: create_checklist, update_step, get_checklist, list_active,
 *          calculate_score, get_scores, create_notification, get_notifications,
 *          mark_read, mark_all_read
 */
import { createClientFromRequest, serve } from '../_shared/server.ts';

const DEFAULT_STEPS = [
  { key: 'quote_accepted', label: 'Quote Accepted', status: 'pending' },
  { key: 'invoice_sent', label: 'Invoice Sent', status: 'pending' },
  { key: 'payment_received', label: 'Payment Received', status: 'pending' },
  { key: 'nda_sent', label: 'NDA Sent', status: 'pending' },
  { key: 'nda_signed', label: 'NDA Signed', status: 'pending' },
  { key: 'portal_access_sent', label: 'Portal Access Sent', status: 'pending' },
  { key: 'project_kickoff', label: 'Project Kicked Off', status: 'pending' },
  { key: 'first_update_sent', label: 'First Update Sent', status: 'pending' },
];

function calcProgress(steps) {
  if (!steps?.length) return 0;
  const done = steps.filter(s => ['done', 'skipped'].includes(s.status)).length;
  return Math.round((done / steps.length) * 100);
}

function calcGrade(score) {
  if (score >= 75) return 'Qualified';
  if (score >= 50) return 'Hot';
  if (score >= 25) return 'Warm';
  return 'Cold';
}

serve('onboardingActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── create_checklist ──────────────────────────────────────────────────────
    if (action === 'create_checklist') {
      const { contact_id, invoice_id, quote_id, client_name, book_title, service_type } = body;
      if (!contact_id) return Response.json({ error: 'contact_id required' }, { status: 400 });

      // Check if one already exists
      const existing = await platform.asServiceRole.entities.OnboardingChecklist.filter({ contact_id });
      if (existing.length > 0) {
        return Response.json({ success: true, checklist: existing[0], already_existed: true });
      }

      const checklist = await platform.asServiceRole.entities.OnboardingChecklist.create({
        contact_id,
        invoice_id: invoice_id || '',
        quote_id: quote_id || '',
        client_name: client_name || '',
        book_title: book_title || '',
        service_type: service_type || '',
        status: 'Active',
        steps: DEFAULT_STEPS,
        progress_percent: 0,
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      });
      return Response.json({ success: true, checklist });
    }

    // ── update_step ───────────────────────────────────────────────────────────
    if (action === 'update_step') {
      const { checklist_id, step_key, status, notes } = body;
      const checklists = await platform.asServiceRole.entities.OnboardingChecklist.filter({ id: checklist_id });
      const checklist = checklists[0];
      if (!checklist) return Response.json({ error: 'Checklist not found' }, { status: 404 });

      const steps = (checklist.steps || DEFAULT_STEPS).map(s => {
        if (s.key === step_key) {
          return {
            ...s,
            status,
            notes: notes || s.notes,
            completed_at: status === 'done' ? new Date().toISOString() : s.completed_at,
          };
        }
        return s;
      });

      const progress = calcProgress(steps);
      const allDone = progress === 100;

      await platform.asServiceRole.entities.OnboardingChecklist.update(checklist_id, {
        steps,
        progress_percent: progress,
        last_activity_at: new Date().toISOString(),
        status: allDone ? 'Completed' : 'Active',
        completed_at: allDone ? new Date().toISOString() : checklist.completed_at,
      });

      return Response.json({ success: true, progress, completed: allDone });
    }

    // ── get_checklist ─────────────────────────────────────────────────────────
    if (action === 'get_checklist') {
      const { contact_id, checklist_id } = body;
      let checklist = null;
      if (checklist_id) {
        const results = await platform.asServiceRole.entities.OnboardingChecklist.filter({ id: checklist_id });
        checklist = results[0] || null;
      } else if (contact_id) {
        const results = await platform.asServiceRole.entities.OnboardingChecklist.filter({ contact_id });
        checklist = results[0] || null;
      }
      return Response.json({ success: true, checklist });
    }

    // ── list_active ───────────────────────────────────────────────────────────
    if (action === 'list_active') {
      const checklists = await platform.asServiceRole.entities.OnboardingChecklist.filter({ status: 'Active' });
      checklists.sort((a, b) => (b.last_activity_at || '').localeCompare(a.last_activity_at || ''));
      return Response.json({ success: true, checklists });
    }

    // ── calculate_score ───────────────────────────────────────────────────────
    if (action === 'calculate_score') {
      const { contact_id } = body;
      if (!contact_id) return Response.json({ error: 'contact_id required' }, { status: 400 });

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: contact_id });
      const contact = contacts[0];
      if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });

      const breakdown = { recency: 0, engagement: 0, deal_value: 0, completeness: 0, pipeline_stage: 0 };

      // Recency: last_activity_at within 7 days = 20 pts, 14 days = 10, 30 days = 5
      if (contact.last_activity_at) {
        const daysSince = (Date.now() - new Date(contact.last_activity_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince <= 7) breakdown.recency = 20;
        else if (daysSince <= 14) breakdown.recency = 10;
        else if (daysSince <= 30) breakdown.recency = 5;
      }

      // Pipeline stage scoring
      const stageScores = {
        'New Enquiry': 5, 'Information Requested': 8, 'Quote in Progress': 12,
        'Quote Sent': 15, 'Payment Pending': 20, 'Project Started': 25,
        'Editing': 28, 'Cover Design': 28, 'Typesetting': 28,
        'Sample Queued': 30, 'Sample Approved': 32, 'Mass Production': 35,
        'Completed': 40, 'Delivered': 40,
      };
      breakdown.pipeline_stage = stageScores[contact.pipeline_stage] || 0;

      // Completeness: email + phone + company + book title
      let completeness = 0;
      if (contact.email) completeness += 5;
      if (contact.phone) completeness += 5;
      if (contact.company) completeness += 5;
      if (contact.book_title) completeness += 5;
      breakdown.completeness = completeness;

      // Deal value: pipeline_value > 10k = 15, > 5k = 10, > 1k = 5
      const val = contact.pipeline_value || 0;
      if (val >= 10000) breakdown.deal_value = 15;
      else if (val >= 5000) breakdown.deal_value = 10;
      else if (val >= 1000) breakdown.deal_value = 5;

      // Engagement: quote views via quotes
      const quotes = await platform.asServiceRole.entities.Quote.filter({ contact_id });
      const viewed = quotes.filter(q => ['Viewed', 'Accepted', 'Converted'].includes(q.status)).length;
      if (viewed >= 3) breakdown.engagement = 15;
      else if (viewed >= 1) breakdown.engagement = 10;
      else if (quotes.length > 0) breakdown.engagement = 5;

      const score = Math.min(100, Object.values(breakdown).reduce((s, v) => s + v, 0));
      const grade = calcGrade(score);

      // Upsert LeadScore
      const existing = await platform.asServiceRole.entities.LeadScore.filter({ contact_id });
      if (existing.length > 0) {
        await platform.asServiceRole.entities.LeadScore.update(existing[0].id, {
          score, grade, score_breakdown: breakdown, last_calculated_at: new Date().toISOString(),
        });
      } else {
        await platform.asServiceRole.entities.LeadScore.create({
          contact_id, score, grade, score_breakdown: breakdown, last_calculated_at: new Date().toISOString(),
        });
      }

      return Response.json({ success: true, score, grade, breakdown });
    }

    // ── get_scores: bulk scores for contacts list ─────────────────────────────
    if (action === 'get_scores') {
      const scores = await platform.asServiceRole.entities.LeadScore.list('-score', 200);
      return Response.json({ success: true, scores });
    }

    // ── create_notification ───────────────────────────────────────────────────
    if (action === 'create_notification') {
      const { title, message, type, category, priority, action_label, action_url, entity_type, entity_id, contact_id, expires_in_hours } = body;
      const notif = await platform.asServiceRole.entities.Notification.create({
        title, message,
        type: type || 'info',
        category: category || 'system',
        priority: priority || 'medium',
        action_label: action_label || '',
        action_url: action_url || '',
        entity_type: entity_type || '',
        entity_id: entity_id || '',
        contact_id: contact_id || '',
        is_read: false,
        expires_at: expires_in_hours ? new Date(Date.now() + expires_in_hours * 3600000).toISOString() : undefined,
      });
      return Response.json({ success: true, notification: notif });
    }

    // ── get_notifications ─────────────────────────────────────────────────────
    if (action === 'get_notifications') {
      const { unread_only = false } = body;
      let notifs = await platform.asServiceRole.entities.Notification.list('-created_date', 100);
      // Filter expired
      const now = new Date().toISOString();
      notifs = notifs.filter(n => !n.expires_at || n.expires_at > now);
      // Filter snoozed
      notifs = notifs.filter(n => !n.is_snoozed || !n.snoozed_until || n.snoozed_until < now);
      if (unread_only) notifs = notifs.filter(n => !n.is_read);
      return Response.json({ success: true, notifications: notifs, unread_count: notifs.filter(n => !n.is_read).length });
    }

    // ── mark_read ─────────────────────────────────────────────────────────────
    if (action === 'mark_read') {
      const { notification_id } = body;
      await platform.asServiceRole.entities.Notification.update(notification_id, {
        is_read: true, read_at: new Date().toISOString(),
      });
      return Response.json({ success: true });
    }

    // ── mark_all_read ─────────────────────────────────────────────────────────
    if (action === 'mark_all_read') {
      const notifs = await platform.asServiceRole.entities.Notification.filter({ is_read: false });
      await Promise.all(notifs.map(n =>
        platform.asServiceRole.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() })
      ));
      return Response.json({ success: true, marked: notifs.length });
    }

    // ── snooze ────────────────────────────────────────────────────────────────
    if (action === 'snooze') {
      const { notification_id, hours = 24 } = body;
      await platform.asServiceRole.entities.Notification.update(notification_id, {
        is_snoozed: true,
        snoozed_until: new Date(Date.now() + hours * 3600000).toISOString(),
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (error) {
    console.error('onboardingActions error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});