import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const ADMIN_EMAIL = 'info@creativebooks.co.za';
const BRAND = '#B87333';
const logoUrl = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

function fmtMoney(n) {
  return 'R ' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

function generateReportHtml(data, gscData) {
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  
  const m = data.metrics;
  const ai = data.aiInsights || [];
  const followUps = data.followUps || [];
  const activity = data.activity || [];
  
  // Calculate changes
  const subChange = m.lastMonthSubmissions > 0 ? Math.round(((m.monthSubmissions - m.lastMonthSubmissions) / m.lastMonthSubmissions) * 100) : 0;
  const revChange = m.revenueLastMonth > 0 ? Math.round(((m.revenueThisMonth - m.revenueLastMonth) / m.revenueLastMonth) * 100) : 0;
  const leadChange = m.lastMonthLeads > 0 ? Math.round(((m.monthLeads - m.lastMonthLeads) / m.lastMonthLeads) * 100) : 0;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 800px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:28px 0 16px;"><img src="${logoUrl}" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h1 style="margin: 0 0 8px; color: #1A1208; font-size: 28px; font-weight: 700;">Good Morning! ☀️</h1>
              <p style="margin: 0; color: #666; font-size: 15px;">Your daily dashboard report for ${today}</p>
            </td>
          </tr>
          
          <!-- KPI Cards -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="vertical-align: top;">
                    <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%); border: 2px solid rgba(148,163,184,0.2); border-radius: 20px; padding: 24px 16px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9); position: relative; overflow: hidden;">
                      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #d946ef);"></div>
                      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; font-weight: 600;">Submissions</div>
                      <div style="font-size: 40px; font-weight: 800; color: #1e293b; line-height: 1; letter-spacing: -1px;">${m.monthSubmissions}</div>
                      <div style="display: inline-flex; align-items: center; gap: 4px; background: ${subChange >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; padding: 6px 12px; border-radius: 20px; margin-top: 12px;">
                        <span style="font-size: 16px; font-weight: 700; color: ${subChange >= 0 ? '#10b981' : '#ef4444'};">${subChange >= 0 ? '↑' : '↓'} ${Math.abs(subChange)}%</span>
                      </div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">vs last month</div>
                    </div>
                  </td>
                  <td width="33%" style="vertical-align: top; padding: 0 12px;">
                    <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.9) 100%); border: 2px solid rgba(59,130,246,0.2); border-radius: 20px; padding: 24px 16px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9); position: relative; overflow: hidden;">
                      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #10b981, #3b82f6, #06b6d4);"></div>
                      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; font-weight: 600;">Revenue (MTD)</div>
                      <div style="font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -1px;">${fmtMoney(m.revenueThisMonth)}</div>
                      <div style="display: inline-flex; align-items: center; gap: 4px; background: ${revChange >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; padding: 6px 12px; border-radius: 20px; margin-top: 12px;">
                        <span style="font-size: 16px; font-weight: 700; color: ${revChange >= 0 ? '#10b981' : '#ef4444'};">${revChange >= 0 ? '↑' : '↓'} ${Math.abs(revChange)}%</span>
                      </div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">vs last month</div>
                    </div>
                  </td>
                  <td width="33%" style="vertical-align: top;">
                    <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,243,199,0.9) 100%); border: 2px solid rgba(245,158,11,0.2); border-radius: 20px; padding: 24px 16px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9); position: relative; overflow: hidden;">
                      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #f59e0b, #f97316, #ef4444);"></div>
                      <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; font-weight: 600;">New Leads</div>
                      <div style="font-size: 40px; font-weight: 800; color: #1e293b; line-height: 1; letter-spacing: -1px;">${m.monthLeads}</div>
                      <div style="display: inline-flex; align-items: center; gap: 4px; background: ${leadChange >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; padding: 6px 12px; border-radius: 20px; margin-top: 12px;">
                        <span style="font-size: 16px; font-weight: 700; color: ${leadChange >= 0 ? '#10b981' : '#ef4444'};">${leadChange >= 0 ? '↑' : '↓'} ${Math.abs(leadChange)}%</span>
                      </div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">vs last month</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Pipeline Value -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%); border: 2px solid rgba(99,102,241,0.2); border-radius: 20px; padding: 28px; box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);"></div>
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; font-weight: 600;">Total Pipeline Value</div>
                <div style="font-size: 42px; font-weight: 800; color: #0f172a; line-height: 1; letter-spacing: -2px; margin-bottom: 8px;">${fmtMoney(m.totalPipelineValue)}</div>
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.1); padding: 8px 16px; border-radius: 12px;">
                  <span style="font-size: 24px;">💼</span>
                  <span style="font-size: 13px; color: #475569; font-weight: 600;">Across ${m.openLeadsCount} active deals</span>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Quotes Section -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #1A1208; font-size: 20px; font-weight: 600;">📋 Quotes Overview</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 10px; overflow: hidden; border: 1px solid #e5e5e5;">
                <tr style="background: #fafafa;">
                  <td style="padding: 12px 16px; font-weight: 600; color: #333; font-size: 13px;">Status</td>
                  <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #333; font-size: 13px;">Count</td>
                  <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #333; font-size: 13px;">Value</td>
                </tr>
                <tr><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px;">Draft</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">${m.pendingQuotes}</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">-</td></tr>
                <tr style="background: #f9fafb;"><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px;">Sent/Viewed</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">${m.sentQuotes}</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">-</td></tr>
                <tr><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #10b981;">Accepted</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px; color: #10b981;">${m.acceptedQuotes}</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px; color: #10b981;">${fmtMoney(m.acceptedQuoteValue)}</td></tr>
                <tr style="background: #f9fafb;"><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #ef4444;">Declined</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px; color: #ef4444;">${m.declinedQuotes}</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px; color: #ef4444;">-</td></tr>
                <tr><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #6b7280;">Expired</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; text-align: right; font-size: 14px; color: #6b7280;">${m.expiredQuotes}</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; text-align: right; font-size: 14px; color: #6b7280;">-</td></tr>
              </table>
              <div style="margin-top: 12px; font-size: 13px; color: #666;">
                <strong>Conversion Rate:</strong> ${m.quoteConversionRate}% (${m.acceptedQuotes} accepted out of ${m.totalQuotesSent} sent)
              </div>
            </td>
          </tr>
          
          <!-- AI Insights -->
          ${ai.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #1A1208; font-size: 20px; font-weight: 600;">🤖 AI Insights</h2>
              ${ai.slice(0, 5).map(insight => `
              <div style="background: ${insight.priority === 'Urgent' ? '#fef2f2' : insight.priority === 'High' ? '#fff7ed' : '#f0f9ff'}; border-left: 4px solid ${insight.priority === 'Urgent' ? '#ef4444' : insight.priority === 'High' ? '#f97316' : '#0ea5e9'}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <div style="font-size: 14px; font-weight: 600; color: #1A1208; margin-bottom: 4px;">${insight.title}</div>
                <div style="font-size: 13px; color: #666; margin-bottom: 8px;">${insight.reason}</div>
                <div style="font-size: 12px; color: #888;">Priority: <strong style="color: ${insight.priority === 'Urgent' ? '#ef4444' : insight.priority === 'High' ? '#f97316' : '#0ea5e9'};">${insight.priority}</strong></div>
              </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}
          
          <!-- Follow-ups Needed -->
          ${followUps.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #1A1208; font-size: 20px; font-weight: 600;">⏰ Follow-ups Needed</h2>
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px;">
                <div style="font-size: 14px; color: #92400e;">${followUps.length} submission${followUps.length > 1 ? 's' : ''} waiting for response (${followUps.map(f => f.daysAgo + 'd').join(', ')})</div>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Google Search Console -->
          ${gscData ? `
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #1A1208; font-size: 20px; font-weight: 600;">🔍 SEO Performance (Last 28 Days)</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 10px; overflow: hidden; border: 1px solid #e5e5e5;">
                <tr style="background: #fafafa;">
                  <td style="padding: 12px 16px; font-weight: 600; color: #333; font-size: 13px;">Metric</td>
                  <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #333; font-size: 13px;">Value</td>
                </tr>
                <tr><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px;">Total Clicks</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">${gscData.totalClicks || 0}</td></tr>
                <tr style="background: #f9fafb;"><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px;">Total Impressions</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">${gscData.totalImpressions || 0}</td></tr>
                <tr><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px;">Avg. CTR</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">${gscData.avgCtr || 0}%</td></tr>
                <tr style="background: #f9fafb;"><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; font-size: 14px;">Avg. Position</td><td style="padding: 12px 16px; border-top: 1px solid #e5e5e5; text-align: right; font-size: 14px;">${gscData.avgPosition || 0}</td></tr>
              </table>
              ${gscData.topQueries && gscData.topQueries.length > 0 ? `
              <div style="margin-top: 16px;">
                <div style="font-size: 13px; color: #888; margin-bottom: 8px;">Top Queries:</div>
                <div style="font-size: 14px; color: #333;">${gscData.topQueries.slice(0, 5).map(q => q.query).join(', ')}</div>
              </div>
              ` : ''}
            </td>
          </tr>
          ` : ''}
          
          <!-- Recent Activity -->
          ${activity.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #1A1208; font-size: 20px; font-weight: 600;">📊 Recent Activity</h2>
              <div style="max-height: 300px; overflow-y: auto;">
                ${activity.slice(0, 8).map(act => `
                <div style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                  <div style="font-size: 14px; color: #333;">${act.label}</div>
                  <div style="font-size: 12px; color: #888; margin-top: 2px;">${act.sub || fmtDate(act.date)}</div>
                </div>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="background: #fafafa; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">
                <strong style="color: #1A1208;">Creative Books SA</strong><br />
                Professional Publishing Services<br />
                <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> · www.creativebooks.co.za<br />
                Proudly South African 🇿🇦
              </p>
              <p style="margin: 16px 0 0; color: #bbb; font-size: 11px;">
                This automated report is sent every morning at 7:00 AM SAST
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve('morningDashboardReport', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const recipient = body.customRecipient || ADMIN_EMAIL;
    
    // Fetch all data directly using service role
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    const [submissions, leads, contacts, quotes, invoices, tasks] = await Promise.all([
      platform.asServiceRole.entities.Submission.list(),
      platform.asServiceRole.entities.Lead.list(),
      platform.asServiceRole.entities.Contact.list(),
      platform.asServiceRole.entities.Quote.list(),
      platform.asServiceRole.entities.Invoice.list(),
      platform.asServiceRole.entities.Task.list(),
    ]);
    
    // Calculate metrics
    const monthSubmissions = submissions.filter(s => new Date(s.created_date) >= startOfMonth).length;
    const lastMonthSubmissions = submissions.filter(s => {
      const d = new Date(s.created_date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    }).length;
    
    const monthLeads = leads.filter(l => new Date(l.created_date) >= startOfMonth).length;
    const lastMonthLeads = leads.filter(l => {
      const d = new Date(l.created_date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    }).length;
    
    const wonLeads = leads.filter(l => l.stage === 'won');
    const wonThisMonth = wonLeads.filter(l => new Date(l.stage_changed_at || l.updated_date) >= startOfMonth);
    const revenueThisMonth = wonThisMonth.reduce((s, l) => s + (l.estimated_value || 0), 0);
    const wonLastMonth = wonLeads.filter(l => {
      const d = new Date(l.stage_changed_at || l.updated_date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });
    const revenueLastMonth = wonLastMonth.reduce((s, l) => s + (l.estimated_value || 0), 0);
    
    const openLeads = leads.filter(l => ['new', 'contacted', 'qualified', 'quoted', 'negotiating'].includes(l.stage));
    const totalPipelineValue = openLeads.reduce((s, l) => s + (l.weighted_value || 0), 0);
    
    const pendingQuotes = quotes.filter(q => q.status === 'Draft').length;
    const sentQuotes = quotes.filter(q => ['Sent', 'Delivered', 'Opened', 'Viewed'].includes(q.status)).length;
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted').length;
    const declinedQuotes = quotes.filter(q => q.status === 'Declined').length;
    const expiredQuotes = quotes.filter(q => q.status === 'Expired').length;
    const totalQuotesSent = sentQuotes + acceptedQuotes + declinedQuotes + expiredQuotes;
    const quoteConversionRate = totalQuotesSent > 0 ? Math.round((acceptedQuotes / totalQuotesSent) * 100) : 0;
    const acceptedQuoteValue = quotes.filter(q => q.status === 'Accepted').reduce((s, q) => s + (q.total || 0), 0);
    
    // Outstanding invoices
    const outstandingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue' || i.status === 'Partially Paid');
    const outstandingAmount = outstandingInvoices.reduce((s, i) => s + (i.balance_due || 0), 0);
    
    // Outstanding tasks
    const outstandingTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'completed');
    
    // Recent activity
    const recentActivity = [
      ...submissions.slice(0, 5).map(s => ({ type: 'submission', label: `New submission from ${s.full_name}`, date: s.created_date })),
      ...leads.filter(l => l.updated_date && new Date(l.updated_date) >= new Date(now - 48 * 60 * 60 * 1000)).slice(0, 5).map(l => ({ type: 'lead', label: `Lead moved to ${l.stage}`, date: l.updated_date })),
      ...quotes.filter(q => q.updated_date && new Date(q.updated_date) >= new Date(now - 48 * 60 * 60 * 1000)).slice(0, 3).map(q => ({ type: 'quote', label: `Quote ${q.quote_number} ${q.status}`, date: q.updated_date })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    
    // AI Insights (simplified)
    const aiInsights = [];
    const overdueQuotes = quotes.filter(q => (q.status === 'Sent' || q.status === 'Viewed') && q.valid_until && new Date(q.valid_until) < now);
    overdueQuotes.slice(0, 3).forEach(quote => {
      aiInsights.push({
        priority: 'High',
        title: `Quote ${quote.quote_number} expired`,
        reason: `Expired on ${new Date(quote.valid_until).toLocaleDateString()}`,
      });
    });
    
    const followUps = submissions.filter(s => s.status === 'new' && new Date(s.created_date) < new Date(now - 2 * 24 * 60 * 60 * 1000)).slice(0, 5);
    
    const dashboardData = {
      metrics: {
        monthSubmissions,
        lastMonthSubmissions,
        monthLeads,
        lastMonthLeads,
        revenueThisMonth,
        revenueLastMonth,
        totalPipelineValue,
        openLeadsCount: openLeads.length,
        pendingQuotes,
        sentQuotes,
        acceptedQuotes,
        declinedQuotes,
        expiredQuotes,
        quoteConversionRate,
        totalQuotesSent,
        acceptedQuoteValue,
        outstandingAmount,
        outstandingTasksCount: outstandingTasks.length,
      },
      aiInsights,
      followUps,
      activity: recentActivity,
    };
    
    // Fetch Google Search Console data
    let gscData = null;
    try {
      const gscResponse = await platform.functions.invoke('searchConsoleData', {
        action: 'performance',
        days: 28,
      });
      
      if (gscResponse.rows && gscResponse.rows.length > 0) {
        // Aggregate data
        const totalClicks = gscResponse.rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
        const totalImpressions = gscResponse.rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
        const avgPosition = gscResponse.rows.reduce((sum, row) => sum + (row.position || 0), 0) / gscResponse.rows.length;
        
        // Get top queries
        const topQueriesResponse = await platform.functions.invoke('searchConsoleData', {
          action: 'top_queries',
          days: 28,
          rowLimit: 10,
        });
        
        gscData = {
          totalClicks: Math.round(totalClicks),
          totalImpressions: Math.round(totalImpressions),
          avgCtr: parseFloat(avgCtr).toFixed(2),
          avgPosition: avgPosition.toFixed(1),
          topQueries: topQueriesResponse.rows || [],
        };
      }
    } catch (gscErr) {
      console.warn('GSC data fetch failed:', gscErr.message);
      // Continue without GSC data
    }

    // Generate HTML report
    const html = generateReportHtml(dashboardData, gscData);

    // Send email
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    await resend.emails.send({
      from: 'Creative Books SA <info@creativebooks.co.za>',
      to: [recipient],
      subject: `📊 Morning Dashboard Report - ${new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}`,
      html,
    });

    return Response.json({ 
      success: true, 
      sentTo: recipient,
      metrics: dashboardData.metrics,
    });
  } catch (error) {
    console.error('Morning report error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});