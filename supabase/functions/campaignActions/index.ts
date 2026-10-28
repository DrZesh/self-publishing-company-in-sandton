/**
 * campaignActions
 * Handles email campaign creation, sending, scheduling, and stats.
 * Actions: create, update, delete, send, schedule, get_stats, preview, get_audience
 */
import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

function buildCampaignEmail({ preheader = '', title = '', body_html = '', companyName = 'Creative Books SA', companyEmail = 'info@creativebooks.co.za', logoUrl = LOGO_URL, phone = '084 230 5393', address = 'Prism Office Park, Fourways, Johannesburg', website = 'https://www.creativebooks.co.za', unsubscribeUrl = '' } = {}) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${companyName}</title><style>@media only screen and (max-width:600px){.ec{width:100%!important;border-radius:0!important;}.eb{padding:20px 16px!important;}}</style></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Helvetica,Arial,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px 16px 0 0;overflow:hidden;"><tr><td height="10" style="background:linear-gradient(90deg,#e53e3e,#ed8936,#ecc94b,#48bb78,#4299e1,#9f7aea,#ed64a6);font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table class="ec" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">
  <tr><td align="center" style="padding:28px 32px 16px;background:#ffffff;"><img src="${logoUrl}" alt="${companyName}" width="160" style="max-width:160px;height:auto;display:block;margin:0 auto;" /></td></tr>
  <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#e2e8f0;font-size:0;">&nbsp;</td></tr></table></td></tr>
  <tr><td class="eb" style="padding:28px 40px 32px;">
    ${title ? `<h1 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#1a202c;font-family:Georgia,'Times New Roman',serif;">${title}</h1>` : ''}
    <div style="font-size:15px;color:#4a5568;line-height:1.7;">${body_html}</div>
  </td></tr>
  <tr><td style="background:#f7fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2d3748;">${companyName}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#718096;">${address}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#718096;"><a href="mailto:${companyEmail}" style="color:#B87333;text-decoration:none;">${companyEmail}</a> · ${phone}</p>
    <p style="margin:0 0 6px;font-size:12px;"><a href="${website}" style="color:#B87333;text-decoration:none;">${website}</a></p>
    ${unsubscribeUrl ? `<p style="margin:8px 0 0;font-size:11px;color:#a0aec0;"><a href="${unsubscribeUrl}" style="color:#a0aec0;">Unsubscribe</a></p>` : ''}
    <p style="margin:4px 0 0;font-size:11px;color:#a0aec0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

serve('campaignActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── Load company settings ─────────────────────────────────────────────────
    const companyArr = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
    const company = companyArr[0] || {};
    const companyName = company.company_name || 'Creative Books SA';
    const companyEmail = company.email || 'info@creativebooks.co.za';
    const logoUrl = company.logo_url || LOGO_URL;

    // ── get_audience: preview who would receive a campaign ────────────────────
    if (action === 'get_audience') {
      const { audience_filter = {} } = body;
      let contacts = await platform.asServiceRole.entities.Contact.list('-created_date', 500);

      if (audience_filter.exclude_unsubscribed !== false) {
        contacts = contacts.filter(c => !c.unsubscribed && !c.do_not_contact);
      }
      if (audience_filter.lifecycle_stages?.length) {
        contacts = contacts.filter(c => audience_filter.lifecycle_stages.includes(c.lifecycle_stage));
      }
      if (audience_filter.pipeline_stages?.length) {
        contacts = contacts.filter(c => audience_filter.pipeline_stages.includes(c.pipeline_stage));
      }
      if (audience_filter.tags?.length) {
        contacts = contacts.filter(c => (c.tags || []).some(t => audience_filter.tags.includes(t)));
      }
      contacts = contacts.filter(c => c.email);

      return Response.json({
        success: true,
        count: contacts.length,
        sample: contacts.slice(0, 5).map(c => ({ id: c.id, full_name: c.full_name, email: c.email })),
      });
    }

    // ── preview: render the email HTML ────────────────────────────────────────
    if (action === 'preview') {
      const { campaign_id } = body;
      const campaigns = await platform.asServiceRole.entities.EmailCampaign.filter({ id: campaign_id });
      const campaign = campaigns[0];
      if (!campaign) return Response.json({ error: 'Campaign not found' }, { status: 404 });

      const html = buildCampaignEmail({
        preheader: campaign.preview_text || '',
        title: campaign.subject,
        body_html: campaign.body_html || '',
        companyName, companyEmail, logoUrl,
        phone: company.phone || '084 230 5393',
        address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg',
        website: company.website_url || 'https://www.creativebooks.co.za',
      });

      return Response.json({ success: true, html });
    }

    // ── send: dispatch campaign to audience ───────────────────────────────────
    if (action === 'send') {
      const { campaign_id } = body;
      const campaigns = await platform.asServiceRole.entities.EmailCampaign.filter({ id: campaign_id });
      const campaign = campaigns[0];
      if (!campaign) return Response.json({ error: 'Campaign not found' }, { status: 404 });
      if (!['Draft', 'Scheduled'].includes(campaign.status)) {
        return Response.json({ error: `Campaign cannot be sent in status "${campaign.status}"` }, { status: 400 });
      }

      // Build audience
      let contacts = await platform.asServiceRole.entities.Contact.list('-created_date', 1000);
      const af = campaign.audience_filter || {};
      if (af.exclude_unsubscribed !== false) contacts = contacts.filter(c => !c.unsubscribed && !c.do_not_contact);
      if (af.lifecycle_stages?.length) contacts = contacts.filter(c => af.lifecycle_stages.includes(c.lifecycle_stage));
      if (af.pipeline_stages?.length) contacts = contacts.filter(c => af.pipeline_stages.includes(c.pipeline_stage));
      if (af.tags?.length) contacts = contacts.filter(c => (c.tags || []).some(t => af.tags.includes(t)));
      contacts = contacts.filter(c => c.email);

      if (!contacts.length) return Response.json({ error: 'No valid recipients found' }, { status: 400 });

      // Mark campaign sending
      await platform.asServiceRole.entities.EmailCampaign.update(campaign_id, {
        status: 'Sending',
        sent_at: new Date().toISOString(),
        total_recipients: contacts.length,
        total_sent: 0,
      });

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      const fromName = campaign.from_name || companyName;
      const fromEmail = campaign.from_email || companyEmail;
      let sent = 0;
      let failed = 0;

      // Send in batches of 10
      for (let i = 0; i < contacts.length; i += 10) {
        const batch = contacts.slice(i, i + 10);
        await Promise.all(batch.map(async (contact) => {
          const unsubUrl = `https://www.creativebooks.co.za/unsubscribe?email=${encodeURIComponent(contact.email)}`;
          const html = buildCampaignEmail({
            preheader: campaign.preview_text || '',
            title: campaign.subject,
            body_html: (campaign.body_html || '').replace(/\{\{name\}\}/gi, contact.full_name || 'there'),
            companyName, companyEmail, logoUrl,
            phone: company.phone || '084 230 5393',
            address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg',
            website: company.website_url || 'https://www.creativebooks.co.za',
            unsubscribeUrl: unsubUrl,
          });

          let recipStatus = 'sent';
          let errMsg = '';
          try {
            await resend.emails.send({
              from: `${fromName} <${fromEmail}>`,
              to: [contact.email],
              subject: campaign.subject,
              html,
              reply_to: campaign.reply_to || fromEmail,
            });
            sent++;
          } catch (e) {
            failed++;
            recipStatus = 'failed';
            errMsg = e.message;
          }

          await platform.asServiceRole.entities.CampaignRecipient.create({
            campaign_id,
            contact_id: contact.id,
            email: contact.email,
            full_name: contact.full_name,
            status: recipStatus,
            sent_at: new Date().toISOString(),
            error_message: errMsg || undefined,
          });
        }));
      }

      await platform.asServiceRole.entities.EmailCampaign.update(campaign_id, {
        status: 'Sent',
        total_sent: sent,
        total_recipients: contacts.length,
      });

      return Response.json({ success: true, sent, failed, total: contacts.length });
    }

    // ── get_stats: fetch recipient breakdown ──────────────────────────────────
    if (action === 'get_stats') {
      const { campaign_id } = body;
      const recipients = await platform.asServiceRole.entities.CampaignRecipient.filter({ campaign_id });
      const stats = {
        total: recipients.length,
        sent: recipients.filter(r => r.status === 'sent').length,
        opened: recipients.filter(r => r.status === 'opened').length,
        clicked: recipients.filter(r => r.status === 'clicked').length,
        bounced: recipients.filter(r => r.status === 'bounced').length,
        failed: recipients.filter(r => r.status === 'failed').length,
        unsubscribed: recipients.filter(r => r.status === 'unsubscribed').length,
      };
      stats.open_rate = stats.sent ? Math.round((stats.opened / stats.sent) * 100) : 0;
      stats.click_rate = stats.sent ? Math.round((stats.clicked / stats.sent) * 100) : 0;
      return Response.json({ success: true, stats, recipients: recipients.slice(0, 100) });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (error) {
    console.error('campaignActions error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});