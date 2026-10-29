import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

serve('weeklyRevenueDigest', async (req) => {
  try {
    const platform = createClientFromRequest(req);

    // Allow scheduled (no auth) or admin
    let isAdmin = false;
    try {
      const user = await platform.auth.me();
      isAdmin = user?.role === 'admin';
    } catch { /* scheduled call — no user */ }

    const [invoices, payments, quotes, contacts, tasks] = await Promise.all([
      platform.asServiceRole.entities.Invoice.list('-created_date', 300),
      platform.asServiceRole.entities.Payment.list('-payment_date', 300),
      platform.asServiceRole.entities.Quote.list('-created_date', 200),
      platform.asServiceRole.entities.Contact.list('-created_date', 500),
      platform.asServiceRole.entities.Task.list('-due_date', 200),
    ]);

    const companyArr = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
    const company = companyArr[0] || {};
    const companyName = company.company_name || 'Creative Books SA';
    const adminEmail = company.admin_notification_email || company.email || 'musankanyani@gmail.com';

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const fmt = (n) => `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

    const weekRevenue = payments
      .filter(p => p.status === 'Confirmed' && new Date(p.payment_date || p.created_date) >= weekAgo)
      .reduce((s, p) => s + (p.amount || 0), 0);

    const outstanding = invoices
      .filter(i => ['Sent', 'Partially Paid', 'Overdue'].includes(i.status))
      .reduce((s, i) => s + (i.balance_due || 0), 0);

    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');

    const newQuotes = quotes.filter(q => new Date(q.created_date) >= weekAgo);
    const acceptedQuotes = newQuotes.filter(q => q.status === 'Accepted');

    const overdueTasks = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < now && !['Done', 'Cancelled'].includes(t.status)
    );

    const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));
    const payByContact = {};
    payments
      .filter(p => p.status === 'Confirmed' && new Date(p.payment_date || p.created_date) >= weekAgo)
      .forEach(p => { payByContact[p.contact_id] = (payByContact[p.contact_id] || 0) + (p.amount || 0); });

    const topClients = Object.entries(payByContact)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([cid, amt]) => `${contactMap[cid]?.full_name || 'Unknown'} — ${fmt(amt)}`);

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;margin:0;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#B87333,#D4A574);padding:24px 32px;">
    <h1 style="margin:0;color:#fff;font-size:22px;">${companyName}</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Weekly Revenue Digest — w/e ${now.toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</p>
  </div>
  <div style="padding:28px 32px;">

    <h2 style="color:#B87333;font-size:16px;margin:0 0 16px;">💰 Revenue Summary</h2>
    <table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:10px 0;font-size:14px;color:#555;">Revenue This Week</td>
        <td style="padding:10px 0;font-size:14px;font-weight:700;color:#2d2d2d;text-align:right;">${fmt(weekRevenue)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:10px 0;font-size:14px;color:#555;">Outstanding Balance</td>
        <td style="padding:10px 0;font-size:14px;font-weight:700;color:${outstanding > 0 ? '#f97316' : '#10b981'};text-align:right;">${fmt(outstanding)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#555;">Overdue Invoices</td>
        <td style="padding:10px 0;font-size:14px;font-weight:700;color:${overdueInvoices.length > 0 ? '#ef4444' : '#10b981'};text-align:right;">${overdueInvoices.length}</td>
      </tr>
    </table>

    <h2 style="color:#B87333;font-size:16px;margin:0 0 16px;">📄 Quotes This Week</h2>
    <table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:10px 0;font-size:14px;color:#555;">New Quotes Created</td>
        <td style="padding:10px 0;font-size:14px;font-weight:700;color:#2d2d2d;text-align:right;">${newQuotes.length}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#555;">Quotes Accepted</td>
        <td style="padding:10px 0;font-size:14px;font-weight:700;color:#10b981;text-align:right;">${acceptedQuotes.length}</td>
      </tr>
    </table>

    ${overdueInvoices.length > 0 ? `
    <h2 style="color:#ef4444;font-size:16px;margin:0 0 12px;">⚠️ Overdue Invoices</h2>
    <ul style="margin:0 0 24px;padding-left:20px;">
      ${overdueInvoices.slice(0, 5).map(inv => `<li style="font-size:13px;color:#555;margin-bottom:6px;">${inv.invoice_number} — ${contactMap[inv.contact_id]?.full_name || 'Unknown'} — <strong style="color:#ef4444;">${fmt(inv.balance_due || 0)} due</strong></li>`).join('')}
    </ul>` : ''}

    ${topClients.length > 0 ? `
    <h2 style="color:#B87333;font-size:16px;margin:0 0 12px;">⭐ Top Clients This Week</h2>
    <ul style="margin:0 0 24px;padding-left:20px;">
      ${topClients.map(c => `<li style="font-size:13px;color:#555;margin-bottom:6px;">${c}</li>`).join('')}
    </ul>` : ''}

    ${overdueTasks.length > 0 ? `
    <h2 style="color:#f97316;font-size:16px;margin:0 0 12px;">📋 Overdue Tasks (${overdueTasks.length})</h2>
    <ul style="margin:0 0 24px;padding-left:20px;">
      ${overdueTasks.slice(0, 5).map(t => `<li style="font-size:13px;color:#555;margin-bottom:6px;">${t.title} — due ${new Date(t.due_date).toLocaleDateString('en-ZA')}</li>`).join('')}
    </ul>` : ''}

    <div style="background:#f9f5f0;border-radius:8px;padding:16px;text-align:center;margin-top:8px;">
      <a href="https://creative-books-sa.vercel.app/admin/dashboard" style="display:inline-block;background:#B87333;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Open Dashboard →</a>
    </div>
  </div>
  <div style="background:#f9f5f0;padding:16px 32px;text-align:center;font-size:11px;color:#999;">
    ${companyName} · Weekly automated digest · ${now.toLocaleDateString('en-ZA')}
  </div>
</div>
</body></html>`;

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const sendResult = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: ['musankanyani@gmail.com'],
      subject: `Weekly Revenue Digest — ${fmt(weekRevenue)} collected this week`,
      html,
    });

    console.log('Email sent:', sendResult);
    return Response.json({
      success: true,
      email_sent_to: 'musankanyani@gmail.com',
      revenue: weekRevenue,
      outstanding,
      overdue_count: overdueInvoices.length,
      new_quotes: newQuotes.length,
      accepted_quotes: acceptedQuotes.length,
    });
  } catch (error) {
    console.error('weeklyRevenueDigest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});