import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';
const TO_EMAIL = 'info@creativebooks.co.za';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get follow-up reminders
    const followUpsRes = await base44.functions.invoke('getFollowUpReminders', {});
    const { followUps, summary } = followUpsRes.data;

    if (followUps.length === 0) {
      return Response.json({ skipped: 'No follow-ups needed' });
    }

    // Build email content
    const highPriority = followUps.filter(f => f.priority === 'high');
    const mediumPriority = followUps.filter(f => f.priority === 'medium');

    const followUpRows = followUps.map(f => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E5E0D5;">
          <div style="font-weight:600;color:#2C2C2C;font-size:14px;margin-bottom:4px;">${f.title}</div>
          <div style="color:#6B6B6B;font-size:13px;">${f.description}</div>
          <div style="margin-top:6px;">
            <span style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;background:${f.priority === 'high' ? '#FEE2E2;color:#DC2626' : '#FEF3C7;color:#D97706'}">
              ${f.priority.toUpperCase()} • ${f.days_overdue || f.days_pending || f.days_until_expiry} days
            </span>
          </div>
        </td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="6" style="background:linear-gradient(90deg,#B87333,#D4A574);font-size:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 32px 8px;">
        <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" />
      </td></tr>
      <tr><td align="center" style="padding:16px 32px 8px;">
        <h1 style="font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 6px 0;">📋 Weekly Follow-up Report</h1>
        <p style="font-size:15px;color:#6B6B6B;margin:0 0 24px 0;">You have ${summary.total} follow-up${summary.total !== 1 ? 's' : ''} requiring attention</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        ${highPriority.length > 0 ? `
        <div style="margin-bottom:24px;">
          <h2 style="font-size:16px;font-weight:700;color:#DC2626;margin:0 0 12px 0;">🔴 High Priority (${highPriority.length})</h2>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid #FEE2E2;">
            ${highPriority.map(f => `
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #FEE2E2;">
                  <div style="font-weight:600;color:#2C2C2C;font-size:14px;margin-bottom:4px;">${f.title}</div>
                  <div style="color:#6B6B6B;font-size:13px;">${f.description}</div>
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        ${mediumPriority.length > 0 ? `
        <div>
          <h2 style="font-size:16px;font-weight:700;color:#D97706;margin:0 0 12px 0;">🟡 Medium Priority (${mediumPriority.length})</h2>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid #FEF3C7;">
            ${mediumPriority.map(f => `
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #FEF3C7;">
                  <div style="font-weight:600;color:#2C2C2C;font-size:14px;margin-bottom:4px;">${f.title}</div>
                  <div style="color:#6B6B6B;font-size:13px;">${f.description}</div>
                </td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        <div style="text-align:center;margin-top:28px;">
          <a href="https://creativebooks.co.za/admin/dashboard" style="display:inline-block;background:#B87333;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">View Dashboard →</a>
        </div>
      </td></tr>
      <tr><td style="padding:24px 32px;border-top:1px solid #E5E0D5;text-align:center;font-size:13px;color:#AAAAAA;line-height:1.7;">
        Creative Books SA &nbsp;|&nbsp; Prism Office Park, Fourways &nbsp;|&nbsp; info@creativebooks.co.za
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `📋 Weekly Follow-up Report: ${summary.total} action item${summary.total !== 1 ? 's' : ''}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend failed:', err);
      throw new Error(`Resend failed: ${err}`);
    }

    console.log('Weekly follow-up email sent successfully');
    return Response.json({ success: true, sent: followUps.length });
  } catch (error) {
    console.error('sendFollowUpReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});