import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

serve('dailyTasksDigest', async (req) => {
  try {
    const platform = createClientFromRequest(req);

    const [tasks, quotes, companyArr] = await Promise.all([
      platform.asServiceRole.entities.Task.list('-due_date', 500),
      platform.asServiceRole.entities.Quote.list('-valid_until', 200),
      platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' }),
    ]);

    const company = companyArr[0] || {};
    const adminEmail = company.admin_notification_email || company.email || 'info@creativebooks.co.za';
    const companyName = company.company_name || 'Creative Books SA';

    const now = new Date();

    // Overdue tasks (Pending/In Progress, past due date)
    const overdueTasks = tasks.filter(t =>
      ['Pending', 'In Progress'].includes(t.status) &&
      t.due_date && new Date(t.due_date) < now
    ).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    // Tasks due today
    const todayStr = now.toISOString().split('T')[0];
    const dueTodayTasks = tasks.filter(t =>
      ['Pending', 'In Progress'].includes(t.status) &&
      t.due_date?.startsWith(todayStr)
    );

    // Quotes expiring in <=5 days
    const in5 = new Date(now.getTime() + 5 * 86400000);
    const expiringQuotes = quotes.filter(q =>
      ['Sent', 'Delivered', 'Opened', 'Viewed'].includes(q.status) &&
      q.valid_until && new Date(q.valid_until) >= now && new Date(q.valid_until) <= in5
    ).sort((a, b) => new Date(a.valid_until) - new Date(b.valid_until));

    // Skip sending if nothing to report
    if (overdueTasks.length === 0 && dueTodayTasks.length === 0 && expiringQuotes.length === 0) {
      return Response.json({ success: true, skipped: true, reason: 'Nothing urgent to report' });
    }

    const fmtDate = d => new Date(d).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
    const daysLeft = d => Math.ceil((new Date(d) - now) / 86400000);
    const daysOverdue = d => Math.floor((now - new Date(d)) / 86400000);

    const taskRow = (t, isOverdue = false) => `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:10px 12px;font-size:13px;color:${isOverdue ? '#ef4444' : '#1a202c'};">${t.title}</td>
        <td style="padding:10px 12px;font-size:12px;color:#718096;">${t.priority || 'Medium'}</td>
        <td style="padding:10px 12px;font-size:12px;color:${isOverdue ? '#ef4444' : '#718096'};">
          ${isOverdue ? `${daysOverdue(t.due_date)}d overdue` : 'Due today'}
        </td>
      </tr>`;

    const quoteRow = q => `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:10px 12px;font-size:13px;color:#1a202c;">${q.quote_number}</td>
        <td style="padding:10px 12px;font-size:13px;color:#1a202c;">${q.book_title || q.contact_snapshot?.full_name || '—'}</td>
        <td style="padding:10px 12px;font-size:12px;color:#f59e0b;font-weight:600;">
          ${daysLeft(q.valid_until) === 0 ? 'Expires TODAY' : `${daysLeft(q.valid_until)}d left`}
        </td>
        <td style="padding:10px 12px;font-size:12px;color:#B87333;font-weight:600;">
          R${Number(q.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
        </td>
      </tr>`;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      <tr><td height="6" style="background:linear-gradient(90deg,#f59e0b,#ef4444,#B87333);font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px 8px;">
        <h1 style="margin:0 0 4px;font-size:22px;color:#1a202c;">⏰ Daily Digest</h1>
        <p style="margin:0;font-size:13px;color:#718096;">${new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </td></tr>

      ${overdueTasks.length > 0 ? `
      <tr><td style="padding:20px 32px 0;">
        <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#ef4444;">🚨 Overdue Tasks (${overdueTasks.length})</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fee2e2;border-radius:10px;overflow:hidden;">
          <tr style="background:#fef2f2;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Task</th><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Priority</th><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Due</th></tr>
          ${overdueTasks.slice(0, 10).map(t => taskRow(t, true)).join('')}
        </table>
      </td></tr>` : ''}

      ${dueTodayTasks.length > 0 ? `
      <tr><td style="padding:20px 32px 0;">
        <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#f59e0b;">📋 Due Today (${dueTodayTasks.length})</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fef3c7;border-radius:10px;overflow:hidden;">
          <tr style="background:#fffbeb;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Task</th><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Priority</th><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Status</th></tr>
          ${dueTodayTasks.slice(0, 10).map(t => taskRow(t, false)).join('')}
        </table>
      </td></tr>` : ''}

      ${expiringQuotes.length > 0 ? `
      <tr><td style="padding:20px 32px 0;">
        <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#B87333;">💬 Quotes Expiring Soon (${expiringQuotes.length})</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:10px;overflow:hidden;">
          <tr style="background:#fffbeb;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Quote</th><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Client/Title</th><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Expires</th><th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase;">Value</th></tr>
          ${expiringQuotes.map(q => quoteRow(q)).join('')}
        </table>
      </td></tr>` : ''}

      <tr><td style="padding:28px 32px;">
        <a href="https://creative-books-sa.vercel.app/admin/tasks" style="display:inline-block;background:#B87333;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-right:10px;">View Tasks</a>
        <a href="https://creative-books-sa.vercel.app/admin/quotes" style="display:inline-block;background:#fff;color:#B87333;border:2px solid #B87333;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">View Quotes</a>
      </td></tr>

      <tr><td style="background:#f7fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#a0aec0;">${companyName} · Daily Digest · Sent automatically at 8:00 AM SAST</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    await resend.emails.send({
      from: `${companyName} <${company.email || 'info@creativebooks.co.za'}>`,
      to: [adminEmail],
      subject: `⏰ Daily Digest — ${overdueTasks.length} overdue tasks, ${expiringQuotes.length} expiring quotes`,
      html,
    });

    return Response.json({
      success: true,
      overdueTasks: overdueTasks.length,
      dueTodayTasks: dueTodayTasks.length,
      expiringQuotes: expiringQuotes.length,
      sentTo: adminEmail,
    });
  } catch (error) {
    console.error('dailyTasksDigest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});