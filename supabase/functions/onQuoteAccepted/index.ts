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

serve('onQuoteAccepted', async (req) => {
  try {
    const body = await req.json();
    const platform = createClientFromRequest(req);
    const { data: quote } = body;

    if (!quote || quote.status !== 'Accepted') {
      return Response.json({ skipped: true, reason: 'Quote not accepted' });
    }

    // ── Fetch contact & company settings ──────────────────────────────────────
    const [contacts, companyArr] = await Promise.all([
      platform.asServiceRole.entities.Contact.filter({ id: quote.contact_id }),
      platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' }),
    ]);
    const contact = contacts[0] || {};
    const company = companyArr[0] || {};
    const companyName = company.company_name || 'Creative Books SA';
    const companyEmail = company.email || 'info@creativebooks.co.za';
    const adminEmail = company.admin_notification_email || companyEmail;
    const logoUrl = company.logo_url || '';
    const clientName = contact.full_name || quote.contact_snapshot?.full_name || 'Client';
    const clientEmail = contact.email || quote.contact_snapshot?.email || '';
    const bookTitle = quote.book_title || 'your project';
    const total = `R ${Number(quote.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

    // ── 1. Send branded thank-you email to client (NOT "Contract Signed") ─────
    if (clientEmail) {
      const thankYouHtml = buildEmail({
        preheader: `Thank you for accepting your quote for ${bookTitle}`,
        icon: '✅',
        title: 'Quote Accepted Successfully',
        greeting: `Hi ${clientName},`,
        message: `Thank you for accepting your quote for <strong>${bookTitle}</strong>.<br/><br/>Your invoice has now been generated and sent to you with the relevant payment details. Please review the invoice and follow the payment instructions provided.<br/><br/>Please note that work will only begin once payment has been received and confirmed.`,
        highlightHtml: `
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Quote Accepted On</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${new Date().toLocaleString('en-ZA')}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Quote Number</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${quote.quote_number || '—'}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Total Amount</td><td style="padding:4px 0;font-size:16px;color:#B87333;font-weight:800;text-align:right;">${total}</td></tr>
            <tr><td colspan="2" style="padding:10px 0 0;font-size:13px;color:#4a5568;">Your invoice has been generated and sent to your email. Please review the invoice and follow the payment instructions provided.</td></tr>
          </table>`,
        companyName, companyEmail, logoUrl, phone: company.phone || '084 230 5393', address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg', website: company.website_url || 'https://www.creativebooks.co.za',
      });
      try {
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
        await resend.emails.send({
          from: `${companyName} <${companyEmail}>`,
          to: [clientEmail],
          subject: `Thank You for Accepting Your Quote — ${bookTitle}`,
          html: thankYouHtml,
        });
        console.log(`Thank-you email sent to ${clientEmail}`);
      } catch (emailErr) {
        console.error('Failed to send thank-you email:', emailErr.message);
      }
    }

    // ── 2. Convert quote to invoice (if not already done) ─────────────────────
    let newInvoice = null;
    let invoiceError = null;

    if (!quote.converted_to_invoice_id) {
      try {
        const lineItems = await platform.asServiceRole.entities.QuoteLineItem.filter({ quote_id: quote.id });
        lineItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        const invoiceLineItems = lineItems.map(item => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          line_total: Number(item.line_total) || 0,
        }));

        // Generate next invoice number
        const existingInvoices = await platform.asServiceRole.entities.Invoice.list('-created_date', 1);
        const nextInvNum = !existingInvoices.length ? 'INV-0001' : (() => {
          const last = existingInvoices[0].invoice_number || 'INV-0000';
          const match = last.match(/(\d+)$/);
          const num = match ? parseInt(match[1]) + 1 : 1;
          return `INV-${String(num).padStart(4, '0')}`;
        })();

        // Build banking details from company settings
        let bankingDetails = company.banking_details || '';
        if (!bankingDetails && company.bank_name) {
          bankingDetails = `Bank: ${company.bank_name}\nAccount Name: ${company.bank_account_name || ''}\nAccount Number: ${company.bank_account_number || ''}\nBranch Code: ${company.bank_branch_code || ''}`;
        }

        newInvoice = await platform.asServiceRole.entities.Invoice.create({
          invoice_number: nextInvNum,
          contact_id: quote.contact_id,
          quote_id: quote.id,
          contact_snapshot: quote.contact_snapshot,
          status: 'Draft', // will be updated to Sent after email
          automation_state: 'Invoice Generated',
          invoice_email_sent: false,
          invoice_confirmed_by_admin: false,
          nda_sent: false,
          portal_login_sent: false,
          acceptance_email_sent: !!clientEmail,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          include_vat: quote.include_vat !== false,
          vat_rate: quote.vat_rate || 15,
          line_items: invoiceLineItems,
          subtotal: quote.subtotal || 0,
          vat_amount: quote.vat_amount || 0,
          total: quote.total || 0,
          amount_paid: 0,
          balance_due: quote.total || 0,
          notes: `Generated from accepted quotation ${quote.quote_number}`,
          payment_terms: company.invoice_terms || 'Payment due within 7 days of invoice date.',
          banking_details: bankingDetails,
          book_title: quote.book_title || '',
          view_token: Math.random().toString(36).substring(2, 34),
        });

        // Link invoice back to quote
        await platform.asServiceRole.entities.Quote.update(quote.id, {
          converted_to_invoice_id: newInvoice.id,
          converted_at: new Date().toISOString(),
        });

        await logActivity(platform, {
          contact_id: quote.contact_id,
          entity_type: 'contact',
          entity_id: quote.contact_id,
          action: 'invoice_generated',
          description: `Invoice ${nextInvNum} generated from accepted quote ${quote.quote_number}`,
          metadata: { quote_id: quote.id, invoice_id: newInvoice.id },
        });

        // ── Send invoice email immediately ────────────────────────────────────
        let invoiceSent = false;
        try {
          const sendRes = await platform.asServiceRole.functions.invoke('invoiceActions', {
            action: 'send',
            invoice_id: newInvoice.id,
          });
          if (sendRes?.success !== false) {
            invoiceSent = true;
          }
        } catch (sendErr) {
          console.error('Failed to send invoice:', sendErr.message);
          invoiceError = sendErr.message;
        }

        // ── Update invoice status to Sent (or keep Draft if send failed) ──────
        if (invoiceSent) {
          await platform.asServiceRole.entities.Invoice.update(newInvoice.id, {
            status: 'Sent',
            sent_at: new Date().toISOString(),
            invoice_email_sent: true,
            automation_state: 'Awaiting Admin Confirmation',
          });
          await logActivity(platform, {
            contact_id: quote.contact_id,
            entity_type: 'contact',
            entity_id: quote.contact_id,
            action: 'invoice_sent',
            description: `Invoice ${nextInvNum} sent to client. Workflow is now awaiting admin confirmation.`,
            metadata: { invoice_id: newInvoice.id },
          });
        } else {
          await platform.asServiceRole.entities.Invoice.update(newInvoice.id, {
            automation_state: 'Invoice Generated',
          });
          await logActivity(platform, {
            contact_id: quote.contact_id,
            entity_type: 'contact',
            entity_id: quote.contact_id,
            action: 'invoice_send_failed',
            description: `Invoice ${nextInvNum} generated but email failed to send. Admin action required.`,
            metadata: { invoice_id: newInvoice.id, error: invoiceError },
          });
        }
      } catch (invoiceErr) {
        invoiceError = invoiceErr.message;
        console.error('Failed to create invoice:', invoiceErr.message);
        await logActivity(platform, {
          contact_id: quote.contact_id,
          entity_type: 'contact',
          entity_id: quote.contact_id,
          action: 'invoice_generation_failed',
          description: `Invoice generation failed: ${invoiceErr.message}. Portal login will NOT be sent.`,
          metadata: { error: invoiceErr.message },
        });
      }
    } else {
      // Invoice already existed — fetch it
      const existing = await platform.asServiceRole.entities.Invoice.filter({ id: quote.converted_to_invoice_id });
      newInvoice = existing[0] || null;
    }

    // ── 2b. Create onboarding checklist ───────────────────────────────────────
    try {
      await platform.asServiceRole.functions.invoke('onboardingActions', {
        action: 'create_checklist',
        contact_id: quote.contact_id,
        invoice_id: newInvoice?.id || '',
        quote_id: quote.id,
        client_name: contact.full_name || quote.contact_snapshot?.full_name || '',
        book_title: quote.book_title || '',
        service_type: quote.service_category || '',
      });
      // Auto-mark first two steps as done
      const checklistRes = await platform.asServiceRole.functions.invoke('onboardingActions', {
        action: 'get_checklist', contact_id: quote.contact_id,
      });
      const checklist = checklistRes?.checklist;
      if (checklist?.id) {
        await platform.asServiceRole.functions.invoke('onboardingActions', {
          action: 'update_step', checklist_id: checklist.id, step_key: 'quote_accepted', status: 'done',
        });
        if (newInvoice?.id) {
          await platform.asServiceRole.functions.invoke('onboardingActions', {
            action: 'update_step', checklist_id: checklist.id, step_key: 'invoice_sent', status: 'done',
          });
        }
      }
    } catch (obErr) {
      console.error('Onboarding checklist creation failed (non-blocking):', obErr.message);
    }

    // ── 2c. Create system notification ────────────────────────────────────────
    try {
      await platform.asServiceRole.functions.invoke('onboardingActions', {
        action: 'create_notification',
        title: `Quote Accepted — ${contact.full_name || 'Client'}`,
        message: `${contact.full_name || 'A client'} accepted quote ${quote.quote_number} for ${quote.book_title || 'their project'}. Invoice ${newInvoice?.invoice_number || ''} generated. Awaiting your confirmation.`,
        type: 'action_required',
        category: 'quote',
        priority: 'high',
        action_label: 'Confirm Invoice',
        action_url: '/admin/invoices',
        entity_type: 'Quote',
        entity_id: quote.id,
        contact_id: quote.contact_id,
        expires_in_hours: 72,
      });
    } catch (notifErr) {
      console.error('Notification creation failed (non-blocking):', notifErr.message);
    }

    // ── 3. Update contact pipeline stage ──────────────────────────────────────
    await platform.asServiceRole.entities.Contact.update(quote.contact_id, {
      pipeline_stage: 'Invoice Sent',
      pipeline_stage_changed_at: new Date().toISOString(),
    });

    // ── 4. Create or update ClientWorkflow ────────────────────────────────────
    const existingWorkflows = await platform.asServiceRole.entities.ClientWorkflow.filter({ contact_id: quote.contact_id });
    if (existingWorkflows.length === 0) {
      await platform.asServiceRole.entities.ClientWorkflow.create({
        contact_id: quote.contact_id,
        current_stage: 'Awaiting Admin Confirmation',
        quote_id: quote.id,
        quote_status: 'accepted',
        invoice_id: newInvoice?.id || '',
        invoice_status: 'sent',
        payment_status: 'unpaid',
        service_type: quote.service_category || 'Full Publishing Package',
        nda_required: false,
        next_action: 'Admin to confirm invoice before NDA and portal details are sent',
        automation_enabled: true,
      });
    } else {
      await platform.asServiceRole.entities.ClientWorkflow.update(existingWorkflows[0].id, {
        current_stage: 'Awaiting Admin Confirmation',
        quote_status: 'accepted',
        invoice_id: newInvoice?.id || existingWorkflows[0].invoice_id,
        invoice_status: 'sent',
        next_action: 'Admin to confirm invoice before NDA and portal details are sent',
      });
    }

    // ── 5. Notify admin by email ──────────────────────────────────────────────
    const invoiceNum = newInvoice?.invoice_number || 'pending';
    const adminHtml = buildEmail({
      preheader: `Quote ${quote.quote_number} accepted by ${clientName}`,
      icon: '📋',
      title: 'Quote Accepted — Action Required',
      greeting: 'Hi Admin,',
      message: `<strong>${clientName}</strong> has accepted quote <strong>${quote.quote_number}</strong>. The invoice has been generated and sent to the client.`,
      highlightHtml: `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Client</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${clientName}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Email</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${clientEmail}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Book Title</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${bookTitle}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Quote</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${quote.quote_number}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Invoice</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${invoiceNum}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Total</td><td style="padding:4px 0;font-size:16px;color:#B87333;font-weight:800;text-align:right;">${total}</td></tr>
          <tr><td colspan="2" style="padding:10px 0 0;font-size:13px;color:#d97706;font-weight:600;">⏳ Awaiting Admin Confirmation — The NDA and portal login will NOT be sent until you click Confirm Invoice and Continue in the dashboard.</td></tr>
        </table>`,
      buttonLabel: 'Confirm Invoice in Dashboard',
      buttonUrl: 'https://creativebooks.co.za/admin/invoices',
      companyName, companyEmail, logoUrl, phone: company.phone || '084 230 5393', address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg', website: company.website_url || 'https://www.creativebooks.co.za',
    });
    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: `${companyName} <${companyEmail}>`,
        to: [adminEmail],
        subject: `Quote Accepted — ${clientName} (${bookTitle}) — Awaiting Your Confirmation`,
        html: adminHtml,
      });
    } catch (adminEmailErr) {
      console.error('Failed to send admin notification email:', adminEmailErr.message);
    }

    // ── 6. WhatsApp admin notification ────────────────────────────────────────
    const whatsappNumber = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
    if (whatsappNumber) {
      try {
        await platform.asServiceRole.functions.invoke('sendWhatsAppNotification', {
          to: whatsappNumber,
          message: `Creative Books SA Update: Quote ${quote.quote_number} has been accepted by ${clientName}. The invoice ${invoiceNum} has been generated and sent. Workflow is now awaiting admin confirmation before NDA and portal details are sent.`,
        });
      } catch (waErr) {
        console.error('WhatsApp notification failed (non-blocking):', waErr.message);
      }
    }

    return Response.json({
      success: true,
      invoice_id: newInvoice?.id,
      invoice_number: newInvoice?.invoice_number,
      automation_state: 'Awaiting Admin Confirmation',
      portal_sent: false,
      nda_sent: false,
    });
  } catch (error) {
    console.error('onQuoteAccepted error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});