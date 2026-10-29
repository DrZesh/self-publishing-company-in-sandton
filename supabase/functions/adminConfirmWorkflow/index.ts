/**
 * adminConfirmWorkflow
 *
 * Called when admin clicks "Confirm Invoice and Continue" on an invoice.
 * Only AFTER this runs should the NDA and portal login be sent.
 *
 * Required body: { invoice_id }
 */
import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

function buildEmail({ preheader = '', icon = '', title = '', greeting = '', message = '', highlightHtml = '', buttonLabel = '', buttonUrl = '', secondaryButtonLabel = '', secondaryButtonUrl = '', footerNote = '', companyName = 'Creative Books SA', companyEmail = 'info@creativebooks.co.za', logoUrl = LOGO_URL, phone = '084 230 5393', address = 'Prism Office Park, Fourways, Johannesburg', website = 'https://www.creativebooks.co.za' } = {}) {
  const logo = logoUrl ? `<img src="${logoUrl}" alt="${companyName}" width="160" style="max-width:160px;height:auto;display:block;margin:0 auto;" />` : `<span style="color:#B87333;font-size:22px;font-weight:800;font-family:Georgia,serif;">${companyName}</span>`;
  const iconHtml = icon ? `<div align="center" style="padding:24px 0 8px;font-size:40px;">${icon}</div>` : '';
  const titleHtml = title ? `<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#1a202c;font-family:Georgia,'Times New Roman',serif;text-align:center;line-height:1.3;">${title}</h1>` : '';
  const highlightBox = highlightHtml ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);"><div style="font-size:14px;color:#2d3748;line-height:1.8;">${highlightHtml}</div></td></tr></table>` : '';
  const primaryBtn = buttonLabel && buttonUrl ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td align="center"><a href="${buttonUrl}" style="display:inline-block;background:#B87333;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif;">${buttonLabel}</a></td></tr></table>` : '';
  const secondaryBtn = secondaryButtonLabel && secondaryButtonUrl ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;"><tr><td align="center"><a href="${secondaryButtonUrl}" style="display:inline-block;background:#ffffff;color:#B87333;border:2px solid #B87333;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;font-family:Helvetica,Arial,sans-serif;">${secondaryButtonLabel}</a></td></tr></table>` : '';
  const footerNoteHtml = footerNote ? `<p style="margin:16px 0 0;font-size:12px;color:#a0aec0;text-align:center;">${footerNote}</p>` : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${companyName}</title><style>@media only screen and (max-width:600px){.ec{width:100%!important;border-radius:0!important;}.eb{padding:20px 16px!important;}h1{font-size:20px!important;}}</style></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Helvetica,Arial,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px 16px 0 0;overflow:hidden;"><tr><td height="10" style="background:linear-gradient(90deg,#e53e3e,#ed8936,#ecc94b,#48bb78,#4299e1,#9f7aea,#ed64a6);font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table class="ec" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">
  <tr><td align="center" style="padding:28px 32px 16px;background:#ffffff;">${logo}</td></tr>
  <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#e2e8f0;font-size:0;">&nbsp;</td></tr></table></td></tr>
  <tr><td class="eb" style="padding:20px 40px 32px;">${iconHtml}${titleHtml}${greeting ? `<p style="margin:0 0 14px;font-size:15px;color:#2d3748;line-height:1.6;">${greeting}</p>` : ''}${message ? `<div style="font-size:15px;color:#4a5568;line-height:1.7;margin-bottom:16px;">${message}</div>` : ''}${highlightBox}${primaryBtn}${secondaryBtn}${footerNoteHtml}</td></tr>
  <tr><td style="background:#f7fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2d3748;">${companyName}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#718096;">${address}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#718096;"><a href="mailto:${companyEmail}" style="color:#B87333;text-decoration:none;">${companyEmail}</a> · ${phone}</p>
    <p style="margin:0 0 6px;font-size:12px;"><a href="${website}" style="color:#B87333;text-decoration:none;">${website}</a></p>
    <p style="margin:0;font-size:11px;color:#a0aec0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

async function logActivity(platform, { contact_id, entity_type, entity_id, action, description, metadata }) {
  try {
    await platform.asServiceRole.entities.ActivityLog.create({
      entity_type: entity_type || 'contact',
      entity_id: entity_id || contact_id,
      action,
      actor_id: 'system',
      description,
      metadata: metadata || {},
    });
  } catch (e) {
    console.error('ActivityLog error:', e.message);
  }
}

serve('adminConfirmWorkflow', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const authorizedAdmin = await platform.auth.me();
    if (!authorizedAdmin || !['admin', 'super_user'].includes(authorizedAdmin.role)) return Response.json({ error: 'Administrator access required' }, { status: 403 });
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { invoice_id, skip_nda = false } = await req.json();
    if (!invoice_id) return Response.json({ error: 'invoice_id required' }, { status: 400 });

    // ── Fetch invoice ──────────────────────────────────────────────────────────
    const invoices = await platform.asServiceRole.entities.Invoice.filter({ id: invoice_id });
    const invoice = invoices[0];
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });

    // ── Guard: check conditions ────────────────────────────────────────────────
    // When called with skip_nda=true (from onNdaSigned), we only want to send the portal.
    // In this case we skip the status check and the "already confirmed" check.
    if (!skip_nda) {
      if (!['Sent', 'Partially Paid'].includes(invoice.status)) {
        const msg = `Admin confirmation blocked: invoice status is "${invoice.status}", expected "Sent". Please send the invoice first.`;
        await logActivity(platform, { contact_id: invoice.contact_id, entity_id: invoice.id, entity_type: 'contact', action: 'admin_confirm_blocked', description: msg, metadata: { invoice_id } });
        return Response.json({ error: msg }, { status: 400 });
      }
      if (invoice.invoice_confirmed_by_admin) {
        return Response.json({ success: true, already_confirmed: true, message: 'Invoice was already confirmed.' });
      }
    }

    // ── Fetch related data ─────────────────────────────────────────────────────
    const [contacts, companyArr] = await Promise.all([
      platform.asServiceRole.entities.Contact.filter({ id: invoice.contact_id }),
      platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' }),
    ]);
    const contact = contacts[0] || {};
    const company = companyArr[0] || {};
    const companyName = company.company_name || 'Creative Books SA';
    const companyEmail = company.email || 'info@creativebooks.co.za';
    const adminEmail = company.admin_notification_email || companyEmail;
    const logoUrl = company.logo_url || '';
    const clientName = contact.full_name || invoice.contact_snapshot?.full_name || 'Client';
    const clientEmail = contact.email || invoice.contact_snapshot?.email || '';
    const bookTitle = invoice.book_title || 'your project';
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const logs = [];

    // ── Mark invoice as confirmed (skip if this is a portal-only call after NDA) ─
    if (!skip_nda) {
      await platform.asServiceRole.entities.Invoice.update(invoice_id, {
        invoice_confirmed_by_admin: true,
        invoice_confirmed_at: new Date().toISOString(),
        invoice_confirmed_by: user.id,
        automation_state: 'Admin Confirmed',
      });
    }

    // ── Update contact pipeline stage ─────────────────────────────────────────
    if (!skip_nda) {
      await platform.asServiceRole.entities.Contact.update(invoice.contact_id, {
        pipeline_stage: 'Admin Confirmed',
        pipeline_stage_changed_at: new Date().toISOString(),
      });

      await logActivity(platform, {
        contact_id: invoice.contact_id,
        entity_id: invoice.id,
        entity_type: 'contact',
        action: 'admin_confirmed',
        description: `Admin ${user.full_name || user.email} confirmed invoice ${invoice.invoice_number}. Proceeding with NDA and portal login.`,
        metadata: { invoice_id, confirmed_by: user.id },
      });
      logs.push('Admin confirmation saved');
    } else {
      logs.push('Skip_nda mode: bypassing admin confirmation steps, going straight to portal');
    }

    // ── Check if NDA is required from ClientWorkflow ──────────────────────────
    const workflows = await platform.asServiceRole.entities.ClientWorkflow.filter({ contact_id: invoice.contact_id });
    const workflow = workflows[0];
    const ndaRequired = workflow?.nda_required || false;
    let ndaSentNow = false;
    let portalSentNow = false;

    // ── Send NDA if required and not already sent ─────────────────────────────
    if (ndaRequired && !invoice.nda_sent && clientEmail) {
      try {
        const ndaHtml = buildEmail({
          preheader: `NDA sent for your Creative Books SA project`,
          icon: '📄',
          title: 'NDA Sent for Signature',
          greeting: `Hi ${clientName},`,
          message: `Please find the NDA for your project below. Kindly review and sign the document so that we may proceed with the next stage of your project.`,
          highlightHtml: `
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Book Title</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${bookTitle}</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Invoice</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${invoice.invoice_number}</td></tr>
            </table>`,
          footerNote: 'Our team will be in contact with the NDA signing link shortly.',
          companyName, companyEmail, logoUrl, phone: company.phone || '084 230 5393', address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg', website: company.website_url || 'https://www.creativebooks.co.za',
        });
        await resend.emails.send({
          from: `${companyName} <${companyEmail}>`,
          to: [clientEmail],
          subject: `NDA for Your Creative Books SA Project`,
          html: ndaHtml,
        });
        await platform.asServiceRole.entities.Invoice.update(invoice_id, {
          nda_sent: true,
          nda_sent_at: new Date().toISOString(),
          automation_state: 'NDA Sent',
        });
        await platform.asServiceRole.entities.Contact.update(invoice.contact_id, {
          pipeline_stage: 'NDA Sent',
          pipeline_stage_changed_at: new Date().toISOString(),
        });
        await logActivity(platform, {
          contact_id: invoice.contact_id,
          entity_id: invoice.id,
          entity_type: 'contact',
          action: 'nda_sent',
          description: `NDA sent to ${clientEmail}`,
          metadata: { invoice_id },
        });
        ndaSentNow = true;
        logs.push('NDA sent');
      } catch (ndaErr) {
        console.error('Failed to send NDA:', ndaErr.message);
        logs.push(`NDA failed: ${ndaErr.message}`);
      }
    } else if (ndaRequired && invoice.nda_sent) {
      logs.push('NDA already sent — skipped');
    }

    // ── Create portal access & send login details ─────────────────────────────
    // GATE: Do not send portal if NDA is required but not yet signed
    const ndaActuallySigned = workflow?.nda_status === 'signed';
    const ndaGatePassed = !ndaRequired || ndaActuallySigned || skip_nda;

    if (!ndaGatePassed && !invoice.portal_login_sent) {
      logs.push(`Portal login blocked: NDA is required but not yet signed (nda_status: ${workflow?.nda_status || 'unknown'}). Will be sent automatically after client signs NDA.`);
      await logActivity(platform, {
        contact_id: invoice.contact_id,
        entity_id: invoice.id,
        entity_type: 'contact',
        action: 'portal_blocked_nda_pending',
        description: 'Portal login not sent: NDA required but not yet signed. Portal will be sent automatically after NDA is signed.',
        metadata: { invoice_id, nda_status: workflow?.nda_status },
      });
    }

    if (ndaGatePassed && !invoice.portal_login_sent && clientEmail) {
      try {
        // Check for existing portal access
        const existingPortal = await platform.asServiceRole.entities.ClientPortalAccess.filter({
          contact_id: invoice.contact_id,
          is_active: true,
        });

        let portal = existingPortal[0];
        if (!portal) {
          portal = await platform.asServiceRole.entities.ClientPortalAccess.create({
            contact_id: invoice.contact_id,
            project_id: null,
            email: clientEmail,
            is_active: true,
            allowed_sections: ['overview', 'projects', 'documents', 'invoices', 'messages'],
          });
          logs.push('Portal account created');
        } else {
          logs.push('Portal account already existed — reused');
        }

        const portalUrl = `https://creative-books-sa.vercel.app/portal/${portal.access_token}`;
        const accessCode = (portal.access_token || '').substring(0, 8).toUpperCase();

        const portalHtml = buildEmail({
          preheader: `Your Creative Books SA Client Portal Details`,
          icon: '🔑',
          title: 'Your Client Portal Details',
          greeting: `Hi ${clientName},`,
          message: `Your project has now been set up on the Creative Books SA client portal. You can access your portal using the secure details below. Through the portal you will be able to view project updates, upload files, review progress, and communicate with us directly.`,
          highlightHtml: `
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Portal Link</td><td style="padding:4px 0;font-size:13px;text-align:right;"><a href="${portalUrl}" style="color:#B87333;font-weight:600;word-break:break-all;">${portalUrl}</a></td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Email</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${clientEmail}</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Access Code</td><td style="padding:4px 0;font-size:16px;color:#2d3748;font-weight:800;letter-spacing:3px;text-align:right;">${accessCode}</td></tr>
            </table>`,
          buttonLabel: 'Access My Portal',
          buttonUrl: portalUrl,
          footerNote: 'Keep your access code secure. Do not share it with others.',
          companyName, companyEmail, logoUrl, phone: company.phone || '084 230 5393', address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg', website: company.website_url || 'https://www.creativebooks.co.za',
        });

        await resend.emails.send({
          from: `${companyName} <${companyEmail}>`,
          to: [clientEmail],
          subject: `Your Creative Books SA Client Portal Details`,
          html: portalHtml,
        });

        // Mark portal login sent on invoice
        await platform.asServiceRole.entities.Invoice.update(invoice_id, {
          portal_login_sent: true,
          portal_login_sent_at: new Date().toISOString(),
          automation_state: 'Portal Login Sent',
        });

        // Update contact pipeline
        await platform.asServiceRole.entities.Contact.update(invoice.contact_id, {
          pipeline_stage: 'Portal Login Sent',
          pipeline_stage_changed_at: new Date().toISOString(),
        });

        await logActivity(platform, {
          contact_id: invoice.contact_id,
          entity_id: invoice.id,
          entity_type: 'contact',
          action: 'portal_login_sent',
          description: `Portal login details sent to ${clientEmail}`,
          metadata: { invoice_id, portal_id: portal.id },
        });

        portalSentNow = true;
        logs.push('Portal login email sent');
      } catch (portalErr) {
        console.error('Failed to send portal login:', portalErr.message);
        logs.push(`Portal login failed: ${portalErr.message}`);
      }
    } else if (invoice.portal_login_sent) {
      logs.push('Portal login already sent — skipped');
    }
    // (if ndaGatePassed is false, the block above already logged the reason)

    // ── Admin confirmation WhatsApp ────────────────────────────────────────────
    const whatsappNumber = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
    if (whatsappNumber) {
      try {
        await platform.asServiceRole.functions.invoke('sendWhatsAppNotification', {
          to: whatsappNumber,
          message: `Creative Books SA Update: Invoice ${invoice.invoice_number} has been confirmed by admin. ${ndaSentNow ? 'NDA sent. ' : ''}${portalSentNow ? 'Portal login details sent to ' + clientName + '.' : ''}`,
        });
      } catch (waErr) {
        console.error('WhatsApp admin confirm failed (non-blocking):', waErr.message);
      }
    }

    // Update ClientWorkflow
    if (workflow) {
      await platform.asServiceRole.entities.ClientWorkflow.update(workflow.id, {
        current_stage: 'Portal Login Sent',
        nda_status: ndaSentNow ? 'sent' : (ndaRequired ? workflow.nda_status : 'not_required'),
      });
    }

    return Response.json({
      success: true,
      logs,
      nda_sent: ndaSentNow,
      portal_sent: portalSentNow,
    });
  } catch (error) {
    console.error('adminConfirmWorkflow error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});