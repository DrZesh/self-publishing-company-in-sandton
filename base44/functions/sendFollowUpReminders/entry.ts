import { requireAdmin, AuthError } from './supabase-auth.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';
const TO_EMAIL = 'info@creativebooks.co.za';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    await requireAdmin(req, { allowScheduled: true });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // ── 1. Overdue invoices ───────────────────────────────────────────────────
    const invoices = await base44.asServiceRole.entities.Invoice.list('-due_date', 200);
    const overdueInvoices = invoices.filter(inv =>
      inv.due_date &&
      inv.due_date < todayStr &&
      !['Paid', 'Cancelled'].includes(inv.status) &&
      (inv.balance_due || 0) > 0
    );

    // ── 2. Quotes expiring within 7 days ─────────────────────────────────────
    const quotes = await base44.asServiceRole.entities.Quote.list('-created_date', 200);
    const expiringQuotes = quotes.filter(q =>
      q.valid_until &&
      q.valid_until >= todayStr &&
      q.valid_until <= in7Days &&
      ['Sent', 'Viewed', 'Delivered'].includes(q.status)
    );

    // ── 3. Overdue pending tasks ──────────────────────────────────────────────
    const tasks = await base44.asServiceRole.entities.Task.list('-due_date', 200);
    const overdueTasks = tasks.filter(t =>
      t.due_date &&
      t.due_date < today.toISOString() &&
      t.status === 'Pending'
    );

    // ── 4. Projects stalled (waiting on Client > 3 days) ─────────────────────
    const projects = await base44.asServiceRole.entities.Project.list('-updated_date', 200);
    const stalledProjects = projects.filter(p => {
      if (p.waiting_on !== 'Client' || !p.stage_changed_at) return false;
      const daysSince = (today - new Date(p.stage_changed_at)) / (1000 * 60 * 60 * 24);
      return daysSince > 3 && !['Completed', 'Delivered', 'Cancelled'].includes(p.stage);
    });

    const followUps = [
      ...overdueInvoices.map(inv => ({
        priority: 'high',
        title: `Overdue Invoice: ${inv.invoice_number}`,
        description: `Balance R ${(inv.balance_due || 0).toLocaleString()} — due ${inv.due_date}`,
        category: 'Invoice',
      })),
      ...expiringQuotes.map(q => ({
        priority: 'high',
        title: `Quote Expiring: ${q.quote_number}`,
        description: `Total R ${(q.total || 0).toLocaleString()} — expires ${q.valid_until}`,
        category: 'Quote',
      })),
      ...overdueTasks.slice(0, 10).map(t => ({
        priority: t.priority === 'Urgent' || t.priority === 'High' ? 'high' : 'medium',
        title: `Overdue Task: ${t.title}`,
        description: `Due ${new Date(t.due_date).toLocaleDateString('en-ZA')} — Priority: ${t.priority}`,
        category: 'Task',
      })),
      ...stalledProjects.slice(0, 5).map(p => ({
        priority: 'medium',
        title: `Project Stalled: ${p.book_title}`,
        description: `Waiting on client since ${new Date(p.stage_changed_at).toLocaleDateString('en-ZA')} — Stage: ${p.stage}`,
        category: 'Project',
      })),
    ];

    if (followUps.length === 0) {
      return Response.json({ skipped: 'No follow-ups needed today' });
    }

    const highPriority = followUps.filter(f => f.priority === 'high');
    const mediumPriority = followUps.filter(f => f.priority === 'medium');

    const buildSection = (items, color, border, label) => items.length === 0 ? '' : `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:700;color:${color};margin:0 0 12px 0;">${label} (${items.length})</h2>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid ${border};">
          ${items.map(f => `
            <tr><td style="padding:12px 16px;border-bottom:1px solid ${border};">
              <div style="font-weight:600;color:#2C2C2C;font-size:14px;margin-bottom:2px;">${f.title}</div>
              <div style="color:#6B6B6B;font-size:13px;">${f.description}</div>
              <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:${color}22;color:${color};">${f.category}</span>
            </td></tr>
          `).join('')}
        </table>
      </div>`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="6" style="background:linear-gradient(90deg,#B87333,#D4A574);font-size:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 32px 8px;">
        <h1 style="font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 6px 0;">📋 Follow-up Report</h1>
        <p style="font-size:15px;color:#6B6B6B;margin:0 0 24px 0;">You have <strong>${followUps.length}</strong> item${followUps.length !== 1 ? 's' : ''} requiring attention</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        ${buildSection(highPriority, '#DC2626', '#FEE2E2', '🔴 High Priority')}
        ${buildSection(mediumPriority, '#D97706', '#FEF3C7', '🟡 Medium Priority')}
        <div style="text-align:center;margin-top:24px;">
          <a href="https://creativebooks.co.za/admin/dashboard" style="display:inline-block;background:#B87333;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">View Dashboard →</a>
        </div>
      </td></tr>
      <tr><td style="padding:24px 32px;border-top:1px solid #E5E0D5;text-align:center;font-size:13px;color:#AAAAAA;">
        Creative Books SA &nbsp;|&nbsp; info@creativebooks.co.za
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `📋 Follow-up Report: ${followUps.length} action item${followUps.length !== 1 ? 's' : ''}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend failed: ${err}`);
    }

    return Response.json({ success: true, sent: followUps.length, high: highPriority.length, medium: mediumPriority.length });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('sendFollowUpReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});