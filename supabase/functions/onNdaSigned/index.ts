/**
 * onNdaSigned
 *
 * Called when a Document of category "NDA" is signed by the client.
 * Can be triggered by:
 *   1. Entity automation (Document update where status=Signed and category=NDA)
 *   2. Direct invocation from documentActions after client_action=sign
 *
 * Required body: { document_id } OR entity automation payload { data: { ... }, event: { ... } }
 */
import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

function buildEmail({ preheader = '', icon = '', title = '', greeting = '', message = '', highlightHtml = '', buttonLabel = '', buttonUrl = '', secondaryButtonLabel = '', secondaryButtonUrl = '', companyName = 'Creative Books SA', companyEmail = 'info@creativebooks.co.za', logoUrl = LOGO_URL, phone = '084 230 5393', address = 'Prism Office Park, Fourways, Johannesburg', website = 'https://www.creativebooks.co.za' } = {}) {
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName}" width="160" style="max-width:160px;height:auto;display:block;margin:0 auto;" />`
    : `<span style="color:#B87333;font-size:22px;font-weight:800;font-family:Georgia,serif;">${companyName}</span>`;
  const iconHtml = icon ? `<div align="center" style="padding:24px 0 8px;font-size:40px;">${icon}</div>` : '';
  const titleHtml = title ? `<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#1a202c;font-family:Georgia,'Times New Roman',serif;text-align:center;line-height:1.3;">${title}</h1>` : '';
  const highlightBox = highlightHtml ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);"><div style="font-size:14px;color:#2d3748;line-height:1.8;">${highlightHtml}</div></td></tr></table>` : '';
  const primaryBtn = buttonLabel && buttonUrl ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td align="center"><a href="${buttonUrl}" style="display:inline-block;background:#B87333;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif;">${buttonLabel}</a></td></tr></table>` : '';
  const secondaryBtn = secondaryButtonLabel && secondaryButtonUrl ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;"><tr><td align="center"><a href="${secondaryButtonUrl}" style="display:inline-block;background:#ffffff;color:#B87333;border:2px solid #B87333;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;font-family:Helvetica,Arial,sans-serif;">${secondaryButtonLabel}</a></td></tr></table>` : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${companyName}</title><style>@media only screen and (max-width:600px){.ec{width:100%!important;border-radius:0!important;}.eb{padding:20px 16px!important;}h1{font-size:20px!important;}}</style></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Helvetica,Arial,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px 16px 0 0;overflow:hidden;"><tr><td height="10" style="background:linear-gradient(90deg,#e53e3e,#ed8936,#ecc94b,#48bb78,#4299e1,#9f7aea,#ed64a6);font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table class="ec" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">
  <tr><td align="center" style="padding:28px 32px 16px;background:#ffffff;">${logo}</td></tr>
  <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#e2e8f0;font-size:0;">&nbsp;</td></tr></table></td></tr>
  <tr><td class="eb" style="padding:20px 40px 32px;">${iconHtml}${titleHtml}${greeting ? `<p style="margin:0 0 14px;font-size:15px;color:#2d3748;line-height:1.6;">${greeting}</p>` : ''}${message ? `<div style="font-size:15px;color:#4a5568;line-height:1.7;margin-bottom:16px;">${message}</div>` : ''}${highlightBox}${primaryBtn}${secondaryBtn}</td></tr>
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

serve('onNdaSigned', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct call { document_id } and entity automation payload
    let document_id = body.document_id;
    let forceResend = body.force_resend || false;

    // Entity automation payload shape: { data: { ... }, event: { ... } }
    if (!document_id && body.data?.id) {
      document_id = body.data.id;
    }

    if (!document_id) return Response.json({ error: 'document_id required' }, { status: 400 });

    // ── Fetch document ─────────────────────────────────────────────────────────
    const docs = await platform.asServiceRole.entities.Document.filter({ id: document_id });
    const doc = docs[0];
    if (!doc) return Response.json({ error: 'Document not found' }, { status: 404 });

    // ── Guard: only NDA documents ──────────────────────────────────────────────
    if (doc.category !== 'NDA') {
      return Response.json({ skipped: true, reason: `Document category is "${doc.category}", not "NDA"` });
    }
    if (doc.status !== 'Signed') {
      return Response.json({ skipped: true, reason: `Document status is "${doc.status}", not "Signed"` });
    }

    // ── Guard: duplicate protection ────────────────────────────────────────────
    if (doc.nda_signed_client_confirmation_sent && !forceResend) {
      return Response.json({ skipped: true, already_processed: true, message: 'NDA signed confirmation already sent.' });
    }

    // ── Validate required fields ───────────────────────────────────────────────
    const missingFields = [];
    if (!doc.contact_id) missingFields.push('contact_id');
    if (!doc.signed_at) missingFields.push('signed_at');

    if (missingFields.length) {
      const msg = `NDA signed automation stopped. Missing: ${missingFields.join(', ')}`;
      console.error(msg);
      await logActivity(platform, {
        contact_id: doc.contact_id || 'unknown',
        entity_id: document_id,
        entity_type: 'contact',
        action: 'nda_signed_blocked',
        description: msg,
        metadata: { document_id, missing: missingFields },
      });
      return Response.json({ error: msg, missing: missingFields }, { status: 400 });
    }

    // ── Fetch contact & company settings ──────────────────────────────────────
    const [contacts, companyArr] = await Promise.all([
      platform.asServiceRole.entities.Contact.filter({ id: doc.contact_id }),
      platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' }),
    ]);
    const contact = contacts[0] || {};
    const company = companyArr[0] || {};
    const companyName = company.company_name || 'Creative Books SA';
    const companyEmail = company.email || 'info@creativebooks.co.za';
    const adminEmail = company.admin_notification_email || companyEmail;
    const logoUrl = company.logo_url || '';
    const clientName = contact.full_name || 'Client';
    const clientEmail = contact.email || '';
    const bookTitle = doc.book_title || contact.book_title || 'your project';

    // ── Validate client email ──────────────────────────────────────────────────
    if (!clientEmail) {
      const msg = 'NDA signed automation stopped. Client email is missing.';
      await logActivity(platform, {
        contact_id: doc.contact_id,
        entity_id: document_id,
        entity_type: 'contact',
        action: 'nda_signed_blocked',
        description: msg,
        metadata: { document_id },
      });
      return Response.json({ error: msg }, { status: 400 });
    }

    const signedAt = doc.signed_at ? new Date(doc.signed_at).toLocaleString('en-ZA') : new Date().toLocaleString('en-ZA');
    const signedNdaUrl = doc.proof_url || doc.signature_url || doc.file_url || '';
    const signatureCertUrl = doc.signature_certificate_url || '';
    const signerName = doc.signer_name || clientName;
    const signerEmail = doc.signer_email || clientEmail;

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const logs = [];

    // ── 1. Update Document with signing metadata ───────────────────────────────
    const docUpdates = {
      nda_signed: true,
      nda_signed_at: doc.signed_at || new Date().toISOString(),
      nda_signed_by: signerName,
      nda_signed_email: signerEmail,
    };
    if (signedNdaUrl) docUpdates.signed_nda_file_url = signedNdaUrl;
    if (signatureCertUrl) docUpdates.signature_certificate_url = signatureCertUrl;
    await platform.asServiceRole.entities.Document.update(document_id, docUpdates);
    logs.push('Document updated with NDA signing metadata');

    // ── 2. Update Contact record with signed NDA ───────────────────────────────
    await platform.asServiceRole.entities.Contact.update(doc.contact_id, {
      pipeline_stage: 'NDA Signed',
      pipeline_stage_changed_at: new Date().toISOString(),
    });
    logs.push('Contact pipeline updated to NDA Signed');

    // ── 3. Update ClientWorkflow ───────────────────────────────────────────────
    const workflows = await platform.asServiceRole.entities.ClientWorkflow.filter({ contact_id: doc.contact_id });
    const workflow = workflows[0];
    if (workflow) {
      await platform.asServiceRole.entities.ClientWorkflow.update(workflow.id, {
        current_stage: 'NDA Signed',
        nda_status: 'signed',
        nda_document_id: document_id,
        nda_signed: true,
        nda_signed_at: doc.signed_at || new Date().toISOString(),
        nda_signed_by: signerName,
        nda_signed_email: signerEmail,
        next_action: 'Create portal access and send portal login details',
      });
      logs.push('ClientWorkflow updated to NDA Signed');
    }

    // ── 4. Update linked Invoice automation_state ──────────────────────────────
    const invoiceId = workflow?.invoice_id || doc.invoice_id || '';
    if (invoiceId) {
      await platform.asServiceRole.entities.Invoice.update(invoiceId, {
        automation_state: 'NDA Signed',
      });
      logs.push('Invoice automation state updated to NDA Signed');
    }

    // ── 5. Update linked Project ───────────────────────────────────────────────
    if (doc.project_id) {
      await platform.asServiceRole.entities.Project.update(doc.project_id, {
        nda_status: 'Signed',
        nda_signed_at: doc.signed_at || new Date().toISOString(),
      });
      logs.push('Project updated with NDA signed status');
    } else {
      // Try to find active project by contact
      const projects = await platform.asServiceRole.entities.Project.filter({ contact_id: doc.contact_id });
      const activeProject = projects.find(p => !['Completed', 'Delivered'].includes(p.stage));
      if (activeProject) {
        await platform.asServiceRole.entities.Project.update(activeProject.id, {
          nda_status: 'Signed',
          nda_signed_at: doc.signed_at || new Date().toISOString(),
        });
        logs.push('Active project updated with NDA signed status');
      }
    }

    // ── 6. Log to activity timeline ────────────────────────────────────────────
    await logActivity(platform, {
      contact_id: doc.contact_id,
      entity_id: document_id,
      entity_type: 'contact',
      action: 'nda_signed',
      description: `NDA signed by ${signerName} (${signerEmail}) on ${signedAt}`,
      metadata: {
        document_id,
        signer_name: signerName,
        signer_email: signerEmail,
        signed_at: doc.signed_at,
        signed_nda_url: signedNdaUrl,
        signature_cert_url: signatureCertUrl,
      },
    });
    logs.push('Activity timeline updated: NDA Signed');

    // ── 7. Admin email notification ────────────────────────────────────────────
    let adminNotificationSent = false;
    if (!doc.nda_signed_admin_notification_sent || forceResend) {
      try {
        const adminHtml = buildEmail({
          preheader: `NDA signed by ${clientName}`,
          icon: '📄',
          title: `NDA Signed — ${clientName}`,
          greeting: 'Hi Admin,',
          message: `<strong>${clientName}</strong> has signed the NDA for <strong>${bookTitle}</strong>.<br/>The signed NDA and signature record have been saved under the client record and document history.`,
          highlightHtml: `
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Client</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${clientName}</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Email</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${signerEmail}</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Project</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${bookTitle}</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">NDA Status</td><td style="padding:4px 0;font-size:13px;color:#38a169;font-weight:700;text-align:right;">✓ Signed</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Signed Date</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${signedAt}</td></tr>
            </table>`,
          buttonLabel: signedNdaUrl ? 'View Signed NDA' : 'View in Dashboard',
          buttonUrl: signedNdaUrl || 'https://creative-books-sa.vercel.app/admin/documents',
          secondaryButtonLabel: signedNdaUrl ? 'View in Dashboard' : '',
          secondaryButtonUrl: signedNdaUrl ? 'https://creative-books-sa.vercel.app/admin/documents' : '',
          companyName, companyEmail, logoUrl, phone: company.phone || '084 230 5393', address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg', website: company.website_url || 'https://www.creativebooks.co.za',
        });

        await resend.emails.send({
          from: `${companyName} <${companyEmail}>`,
          to: [adminEmail],
          subject: `NDA Signed by ${clientName} — ${bookTitle}`,
          html: adminHtml,
        });

        await platform.asServiceRole.entities.Document.update(document_id, {
          nda_signed_admin_notification_sent: true,
          nda_signed_admin_notification_sent_at: new Date().toISOString(),
        });
        adminNotificationSent = true;
        logs.push('Admin notification email sent');

        await logActivity(platform, {
          contact_id: doc.contact_id,
          entity_id: document_id,
          entity_type: 'contact',
          action: 'nda_admin_notified',
          description: `Admin notified by email of NDA signing by ${clientName}`,
          metadata: { document_id },
        });
      } catch (adminEmailErr) {
        console.error('Admin NDA notification email failed:', adminEmailErr.message);
        logs.push(`Admin email failed: ${adminEmailErr.message}`);
      }
    } else {
      logs.push('Admin notification already sent — skipped');
    }

    // ── 8. Admin WhatsApp notification ────────────────────────────────────────
    let whatsappSent = false;
    if (!doc.nda_signed_whatsapp_notification_sent || forceResend) {
      const whatsappNumber = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
      if (whatsappNumber) {
        try {
          await platform.asServiceRole.functions.invoke('sendWhatsAppNotification', {
            to: whatsappNumber,
            message: `Creative Books SA Update: NDA signed by ${clientName} for ${bookTitle}. The signed NDA and signature record have been saved in the dashboard.`,
          });
          await platform.asServiceRole.entities.Document.update(document_id, {
            nda_signed_whatsapp_notification_sent: true,
          });
          whatsappSent = true;
          logs.push('Admin WhatsApp notification sent');
        } catch (waErr) {
          console.error('WhatsApp NDA notification failed (non-blocking):', waErr.message);
          logs.push(`WhatsApp failed: ${waErr.message}`);
        }
      }
    } else {
      logs.push('WhatsApp notification already sent — skipped');
    }

    // ── 9. Client confirmation email ───────────────────────────────────────────
    let clientConfirmationSent = false;
    if (!doc.nda_signed_client_confirmation_sent || forceResend) {
      try {
        const clientHtml = buildEmail({
          preheader: `Your NDA for ${bookTitle} has been signed successfully`,
          icon: '✅',
          title: 'NDA Signed Successfully',
          greeting: `Hi ${clientName},`,
          message: `Thank you for signing the NDA for <strong>${bookTitle}</strong>.<br/>A copy of the signed NDA and signature confirmation has been recorded for your reference below.`,
          highlightHtml: `
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Status</td><td style="padding:4px 0;font-size:13px;color:#38a169;font-weight:700;text-align:right;">✓ NDA Successfully Signed</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Signed On</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${signedAt}</td></tr>
              <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Project</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${bookTitle}</td></tr>
              <tr><td colspan="2" style="padding:10px 0 0;font-size:13px;color:#4a5568;">A copy has been recorded and your project is now moving forward. Our team will be in touch shortly.</td></tr>
            </table>`,
          buttonLabel: signedNdaUrl ? 'Download Signed NDA' : '',
          buttonUrl: signedNdaUrl || '',
          secondaryButtonLabel: signatureCertUrl ? 'Download Signature Certificate' : '',
          secondaryButtonUrl: signatureCertUrl || '',
          footerNote: 'Our team will be in touch with you shortly with the next steps.',
          companyName, companyEmail, logoUrl, phone: company.phone || '084 230 5393', address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg', website: company.website_url || 'https://www.creativebooks.co.za',
        });

        await resend.emails.send({
          from: `${companyName} <${companyEmail}>`,
          to: [clientEmail],
          subject: `Signed NDA Confirmation — ${bookTitle}`,
          html: clientHtml,
        });

        await platform.asServiceRole.entities.Document.update(document_id, {
          nda_signed_client_confirmation_sent: true,
          nda_signed_client_confirmation_sent_at: new Date().toISOString(),
        });
        clientConfirmationSent = true;
        logs.push('Client confirmation email sent');

        await logActivity(platform, {
          contact_id: doc.contact_id,
          entity_id: document_id,
          entity_type: 'contact',
          action: 'nda_client_confirmation_sent',
          description: `Client confirmation email sent to ${clientEmail} for signed NDA`,
          metadata: { document_id, signed_nda_url: signedNdaUrl },
        });
      } catch (clientEmailErr) {
        console.error('Client NDA confirmation email failed:', clientEmailErr.message);
        logs.push(`Client email failed: ${clientEmailErr.message}`);
      }
    } else {
      logs.push('Client confirmation already sent — skipped');
    }

    // ── 10. Trigger portal login if NDA was the last gate ─────────────────────
    // Only proceed if invoice has been confirmed by admin and portal not yet sent
    let portalTriggered = false;
    if (invoiceId) {
      const invoices = await platform.asServiceRole.entities.Invoice.filter({ id: invoiceId });
      const invoice = invoices[0];
      if (invoice && invoice.invoice_confirmed_by_admin && !invoice.portal_login_sent) {
        try {
          await platform.asServiceRole.functions.invoke('adminConfirmWorkflow', {
            invoice_id: invoiceId,
            skip_nda: true, // NDA already signed, only send portal
          });
          portalTriggered = true;
          logs.push('Portal login triggered after NDA signing');

          await logActivity(platform, {
            contact_id: doc.contact_id,
            entity_id: document_id,
            entity_type: 'contact',
            action: 'portal_triggered_after_nda',
            description: 'Portal login triggered automatically after NDA was signed',
            metadata: { invoice_id: invoiceId },
          });
        } catch (portalErr) {
          console.error('Portal trigger after NDA failed:', portalErr.message);
          logs.push(`Portal trigger failed: ${portalErr.message}`);
        }
      } else if (invoice?.portal_login_sent) {
        logs.push('Portal already sent — not triggered again');
      } else if (!invoice?.invoice_confirmed_by_admin) {
        logs.push('Invoice not yet confirmed by admin — portal will be sent after admin confirms');
      }
    }

    logs.push('Signed NDA saved under client record, document record, and workflow');

    return Response.json({
      success: true,
      logs,
      admin_notification_sent: adminNotificationSent,
      whatsapp_sent: whatsappSent,
      client_confirmation_sent: clientConfirmationSent,
      portal_triggered: portalTriggered,
    });

  } catch (error) {
    console.error('onNdaSigned error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});