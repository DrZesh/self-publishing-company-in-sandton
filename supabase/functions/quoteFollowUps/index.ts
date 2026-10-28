import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

serve('quoteFollowUps', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const companySettings = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
    const company = companySettings[0] || { company_name: 'Creative Books SA', email: 'info@creativebooks.co.za' };

    let followUpsSent = 0;
    let expirationsProcessed = 0;

    // 1. Send follow-up reminders for quotes expiring in 3 days
    const expiringQuotes = await platform.asServiceRole.entities.Quote.filter({ status: 'Sent' });
    for (const quote of expiringQuotes) {
      if (!quote.valid_until) continue;
      const expiryDate = new Date(quote.valid_until);
      
      // Check if expires in exactly 3 days (or less, but not yet followed up)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0 && !quote.follow_up_sent) {
        const contactEmail = quote.contact_snapshot?.email;
        const contactName = quote.contact_snapshot?.full_name || 'there';
        
        if (contactEmail) {
          const viewUrl = `https://www.creativebooks.co.za/quote/view/${quote.id}/${quote.view_token}`;
          
          const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
          
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 20px; color: #1A1208; font-size: 24px; font-weight: 600; letter-spacing: -0.3px;">Hi ${contactName},</h2>
              
              <p style="margin: 0 0 24px; color: #555; font-size: 16px; line-height: 1.6;">
                This is a friendly reminder that your quote <strong>${quote.quote_number}</strong> is expiring soon.
              </p>

              <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); border: 1px solid #ffc107; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
                <div style="font-size: 13px; color: #856404; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Expiring in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}</div>
                <div style="font-size: 36px; font-weight: 700; color: #B87333; line-height: 1;">R ${Number(quote.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                <div style="font-size: 13px; color: #856404; margin-top: 8px;">Quote #${quote.quote_number}</div>
                <div style="font-size: 13px; color: #856404; margin-top: 4px;">Expires: ${new Date(quote.valid_until).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, #B87333 0%, #D4A574 100%); color: #ffffff; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(184,115,51,0.3); transition: all 0.3s ease;">
                  Review & Accept Quote
                </a>
              </div>

              <p style="margin: 32px 0 16px; color: #888; font-size: 14px; line-height: 1.6;">
                Have questions? Reply to this email or call us at <strong style="color: #1A1208;">010 500 3331</strong>. We're here to help!
              </p>
            </td>
          </tr>

          <tr>
            <td style="background: #fafafa; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">
                <strong style="color: #1A1208;">${company.company_name}</strong><br />
                Professional Publishing Services<br />
                ${company.email} · www.creativebooks.co.za<br />
                Proudly South African 🇿🇦
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          await resend.emails.send({
            from: `${company.company_name} <${company.email}>`,
            to: [contactEmail],
            subject: `Reminder: Quote ${quote.quote_number} Expiring Soon`,
            html: emailHtml,
          });

          await platform.asServiceRole.entities.Quote.update(quote.id, {
            follow_up_sent: true,
            follow_up_date: today.toISOString().split('T')[0],
          });

          followUpsSent++;
        }
      }
    }

    // 2. Mark expired quotes
    const sentQuotes = await platform.asServiceRole.entities.Quote.filter({ status: 'Sent' });
    for (const quote of sentQuotes) {
      if (quote.valid_until && new Date(quote.valid_until) < today) {
        await platform.asServiceRole.entities.Quote.update(quote.id, {
          status: 'Expired',
          cancelled_at: today.toISOString(),
          cancelled_reason: 'Quote expired without acceptance',
        });
        expirationsProcessed++;
      }
    }

    // 3. Create follow-up tasks for quotes sent 7+ days ago with no response
    const oldQuotes = await platform.asServiceRole.entities.Quote.filter({ status: 'Sent' });
    let tasksCreated = 0;
    for (const quote of oldQuotes) {
      if (quote.sent_at) {
        const sentDate = new Date(quote.sent_at);
        const daysSinceSent = Math.floor((today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceSent >= 7 && !quote.follow_up_sent) {
          await platform.asServiceRole.entities.Task.create({
            title: `Follow up: Quote ${quote.quote_number} - ${quote.contact_snapshot?.full_name || 'Client'}`,
            description: `This quote was sent ${daysSinceSent} days ago and hasn't been accepted yet. Consider following up with the client.\n\nQuote Total: R ${Number(quote.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}\nView: https://www.creativebooks.co.za/admin/quotes`,
            status: 'todo',
            priority: 'medium',
            due_date: today.toISOString().split('T')[0],
            created_by_id: user.id,
          });
          tasksCreated++;
        }
      }
    }

    return Response.json({
      success: true,
      follow_ups_sent: followUpsSent,
      expirations_processed: expirationsProcessed,
      tasks_created: tasksCreated,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});