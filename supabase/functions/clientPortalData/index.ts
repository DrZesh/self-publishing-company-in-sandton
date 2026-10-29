import { createClientFromRequest, serve } from '../_shared/server.ts';
import { jsPDF } from 'npm:jspdf@4.0.0';

async function getCompanySettings(platform) {
  const s = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
  return s[0] || { company_name: 'Creative Books SA', email: 'info@creativebooks.co.za' };
}

function buildInvoicePdfBase64(invoice, company) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const companyName = company.company_name || 'Creative Books SA';
  const footer = company.document_footer_note || `${companyName} · www.creativebooks.co.za`;
  const banking = [
    company.bank_name && `Bank: ${company.bank_name}`,
    company.bank_account_name && `Account Name: ${company.bank_account_name}`,
    company.bank_account_number && `Account No: ${company.bank_account_number}`,
    company.bank_branch_code && `Branch Code: ${company.bank_branch_code}`,
  ].filter(Boolean).join('\n');

  pdf.setFillColor(26, 18, 8);
  pdf.rect(0, 0, 210, 42, 'F');
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(20);
  pdf.text(companyName.toUpperCase(), 15, 16);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.text(company.email || '', 15, 24);
  if (company.vat_number) pdf.text(`VAT Reg: ${company.vat_number}`, 15, 30);
  pdf.setFontSize(22);
  pdf.text(invoice.invoice_number, 195, 16, { align: 'right' });
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(9);
  pdf.text('INVOICE', 195, 23, { align: 'right' });
  if (invoice.issue_date) pdf.text(`Issue: ${invoice.issue_date}`, 195, 30, { align: 'right' });
  if (invoice.due_date) pdf.text(`Due: ${invoice.due_date}`, 195, 36, { align: 'right' });

  const contact = invoice.contact_snapshot || {};
  pdf.setFillColor(250, 248, 244);
  pdf.rect(0, 47, 210, 28, 'F');
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(8);
  pdf.text('BILL TO', 15, 54);
  pdf.setTextColor(26, 18, 8);
  pdf.setFontSize(13);
  pdf.text(contact.full_name || '', 15, 62);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  if (contact.company) pdf.text(contact.company, 15, 68);

  let yPos = 90;
  pdf.setFillColor(248, 247, 244);
  pdf.rect(0, yPos - 7, 210, 8, 'F');
  pdf.setTextColor(130, 130, 130);
  pdf.setFontSize(8);
  pdf.text('DESCRIPTION', 15, yPos - 2);
  pdf.text('QTY', 135, yPos - 2, { align: 'center' });
  pdf.text('UNIT PRICE', 165, yPos - 2, { align: 'right' });
  pdf.text('TOTAL', 198, yPos - 2, { align: 'right' });

  const lineItems = (invoice.line_items || []).filter(i => i.description?.trim());
  pdf.setTextColor(26, 18, 8);
  lineItems.forEach(item => {
    if (yPos > 245) { pdf.addPage(); yPos = 20; }
    pdf.setFontSize(10);
    const descLines = pdf.splitTextToSize(item.description || '', 110);
    pdf.text(descLines, 15, yPos + 1);
    pdf.text(String(item.quantity || 1), 135, yPos + 1, { align: 'center' });
    pdf.text(`R ${Number(item.unit_price || 0).toFixed(2)}`, 165, yPos + 1, { align: 'right' });
    pdf.text(`R ${Number(item.line_total || 0).toFixed(2)}`, 198, yPos + 1, { align: 'right' });
    yPos += Math.max(descLines.length * 6, 9);
    pdf.setDrawColor(235, 230, 220);
    pdf.line(15, yPos - 1, 200, yPos - 1);
  });

  yPos += 6;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Subtotal:', 150, yPos);
  pdf.setTextColor(26, 18, 8);
  pdf.text(`R ${Number(invoice.subtotal || 0).toFixed(2)}`, 198, yPos, { align: 'right' });
  if (invoice.include_vat !== false) {
    yPos += 8;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`VAT (${invoice.vat_rate || 15}%):`, 150, yPos);
    pdf.setTextColor(26, 18, 8);
    pdf.text(`R ${Number(invoice.vat_amount || 0).toFixed(2)}`, 198, yPos, { align: 'right' });
  }
  yPos += 4;
  pdf.setDrawColor(184, 115, 51);
  pdf.setLineWidth(0.8);
  pdf.line(130, yPos, 200, yPos);
  yPos += 7;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(26, 18, 8);
  pdf.text('TOTAL DUE:', 140, yPos);
  pdf.setTextColor(184, 115, 51);
  pdf.text(`R ${Number(invoice.total || 0).toFixed(2)}`, 198, yPos, { align: 'right' });
  pdf.setFont(undefined, 'normal');

  if ((invoice.amount_paid || 0) > 0) {
    yPos += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Amount Paid:', 140, yPos);
    pdf.setTextColor(34, 197, 94);
    pdf.text(`R ${Number(invoice.amount_paid).toFixed(2)}`, 198, yPos, { align: 'right' });
    yPos += 7;
    pdf.setTextColor(26, 18, 8);
    pdf.text('Balance Due:', 140, yPos);
    pdf.setTextColor(184, 115, 51);
    pdf.text(`R ${Number(invoice.balance_due || 0).toFixed(2)}`, 198, yPos, { align: 'right' });
  }

  if (banking) {
    yPos += 14;
    pdf.setFillColor(239, 246, 255);
    const bankLines = pdf.splitTextToSize(banking, 80);
    pdf.rect(15, yPos - 5, 90, bankLines.length * 5 + 12, 'F');
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text('BANKING DETAILS', 20, yPos);
    pdf.setFont(undefined, 'normal');
    pdf.text(bankLines, 20, yPos + 6);
  }

  if (invoice.payment_terms) {
    yPos += 26;
    pdf.setTextColor(130, 130, 130);
    pdf.setFontSize(8);
    pdf.text(pdf.splitTextToSize(invoice.payment_terms, 180), 15, yPos);
  }

  pdf.setFillColor(248, 247, 244);
  pdf.rect(0, 280, 210, 15, 'F');
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text(footer, 105, 289, { align: 'center' });

  const uint8 = new Uint8Array(pdf.output('arraybuffer'));
  let binary = '';
  uint8.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

function buildReceiptPdfBase64(receipt, company) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const companyName = company.company_name || 'Creative Books SA';
  const footer = company.document_footer_note || `${companyName} · www.creativebooks.co.za`;
  const contact = receipt.contact_snapshot || {};

  pdf.setFillColor(26, 18, 8);
  pdf.rect(0, 0, 210, 42, 'F');
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(20);
  pdf.text(companyName.toUpperCase(), 15, 16);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.text(company.email || '', 15, 24);
  if (company.vat_number) pdf.text(`VAT Reg: ${company.vat_number}`, 15, 30);
  pdf.setFontSize(22);
  pdf.text(receipt.receipt_number, 195, 16, { align: 'right' });
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(9);
  pdf.text('RECEIPT', 195, 23, { align: 'right' });
  if (receipt.payment_date) pdf.text(`Date: ${receipt.payment_date}`, 195, 30, { align: 'right' });

  pdf.setFillColor(16, 185, 129);
  pdf.rect(0, 47, 210, 12, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('✓  PAYMENT RECEIVED', 105, 55, { align: 'center' });
  pdf.setFont(undefined, 'normal');

  pdf.setFillColor(250, 248, 244);
  pdf.rect(0, 64, 210, 28, 'F');
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(8);
  pdf.text('RECEIVED FROM', 15, 71);
  pdf.setTextColor(26, 18, 8);
  pdf.setFontSize(13);
  pdf.text(contact.full_name || '', 15, 79);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  if (contact.company) pdf.text(contact.company, 15, 85);

  let yPos = 104;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(235, 230, 220);
  pdf.setLineWidth(0.5);
  pdf.rect(15, yPos, 180, 50, 'FD');

  const fields = [
    ['Invoice', receipt.invoice_number || '—'],
    ['Method', receipt.payment_method || '—'],
    ['Reference', receipt.reference || '—'],
    ['Invoice Total', `R ${Number(receipt.invoice_total || 0).toFixed(2)}`],
  ];
  fields.forEach(([label, value], i) => {
    const y = yPos + 10 + i * 10;
    pdf.setTextColor(130, 130, 130);
    pdf.setFontSize(8);
    pdf.text(label + ':', 22, y);
    pdf.setTextColor(26, 18, 8);
    pdf.setFont(undefined, 'bold');
    pdf.text(String(value), 80, y);
    pdf.setFont(undefined, 'normal');
  });

  yPos += 60;
  pdf.setFillColor(250, 248, 244);
  pdf.rect(15, yPos, 180, 32, 'F');
  pdf.setTextColor(130, 130, 130);
  pdf.setFontSize(9);
  pdf.text('AMOUNT PAID', 105, yPos + 9, { align: 'center' });
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(28);
  pdf.setFont(undefined, 'bold');
  pdf.text(`R ${Number(receipt.amount_paid || 0).toFixed(2)}`, 105, yPos + 24, { align: 'center' });
  pdf.setFont(undefined, 'normal');

  yPos += 40;
  if ((receipt.balance_after || 0) > 0) {
    pdf.setFillColor(255, 247, 237);
    pdf.rect(15, yPos, 180, 16, 'F');
    pdf.setTextColor(180, 90, 20);
    pdf.setFontSize(10);
    pdf.text(`Remaining balance: R ${Number(receipt.balance_after).toFixed(2)}`, 105, yPos + 10, { align: 'center' });
  } else {
    pdf.setFillColor(236, 253, 245);
    pdf.rect(15, yPos, 180, 16, 'F');
    pdf.setTextColor(5, 150, 105);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Invoice fully settled — Thank you!', 105, yPos + 10, { align: 'center' });
    pdf.setFont(undefined, 'normal');
  }

  pdf.setFillColor(248, 247, 244);
  pdf.rect(0, 280, 210, 15, 'F');
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text(footer, 105, 289, { align: 'center' });

  const uint8 = new Uint8Array(pdf.output('arraybuffer'));
  let binary = '';
  uint8.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

serve('clientPortalData', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { action, access_token } = body;

    // Admin action: list all chats
    if (action === 'list_chats') {
      const user = await platform.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }

      // Get all projects with messages
      const projects = await platform.asServiceRole.entities.Project.filter({});
      const chatProjects = [];

      for (const project of projects) {
        const messages = await platform.asServiceRole.entities.PortalMessage.filter({ project_id: project.id });
        if (messages.length > 0) {
          const contact = await platform.asServiceRole.entities.Contact.get(project.contact_id);
          const lastMessage = messages[messages.length - 1];
          const hasUnread = messages.some(m => !m.is_read && m.sender_type === 'client');

          chatProjects.push({
            id: project.id,
            book_title: project.book_title,
            service_type: project.service_type,
            stage: project.stage,
            contact_id: project.contact_id,
            contact_name: contact?.full_name || 'Unknown',
            contact_company: contact?.company || '',
            last_message: lastMessage?.message || '',
            last_message_time: lastMessage?.created_date,
            has_unread: hasUnread,
            message_count: messages.length,
          });
        }
      }

      // Sort by last message time (newest first)
      chatProjects.sort((a, b) => {
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time) - new Date(a.last_message_time);
      });

      return Response.json({ projects: chatProjects });
    }

    // Validate portal access token
    if (!access_token) {
      return Response.json({ error: 'Access token required' }, { status: 401 });
    }

    // Find portal access by token (supports both access_token and custom_slug)
    const allAccess = await platform.asServiceRole.entities.ClientPortalAccess.filter({});
    const portalAccess = allAccess.find(p => 
      p.access_token === access_token || p.custom_slug === access_token
    );

    if (!portalAccess) {
      return Response.json({ error: 'Invalid or expired portal access' }, { status: 403 });
    }

    // Check if portal is active and not expired
    if (!portalAccess.is_active) {
      return Response.json({ error: 'Portal access is inactive' }, { status: 403 });
    }

    if (portalAccess.expires_at && new Date(portalAccess.expires_at) < new Date()) {
      return Response.json({ error: 'Portal access has expired' }, { status: 403 });
    }

    // Increment access count on load
    if (action === 'load') {
      await platform.asServiceRole.entities.ClientPortalAccess.update(portalAccess.id, {
        access_count: (portalAccess.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      });
    }

    const contactId = portalAccess.contact_id;
    const projectId = portalAccess.project_id;
    const allowedSections = portalAccess.allowed_sections || [];

    // Get contact details
    const contact = await platform.asServiceRole.entities.Contact.get(contactId);
    if (!contact) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (['accept_quote','decline_quote'].includes(action)) {
      const quote = await platform.entities.Quote.get(body.quote_id);
      if (quote.contact_id !== contactId) return Response.json({ error: 'Access denied' }, { status: 403 });
      const result = await platform.functions.invoke('quoteActions', { action: 'respond', quote_id: quote.id, token: quote.view_token, response: action === 'accept_quote' ? 'accept' : 'reject', signer_name: contact.full_name, signer_email: contact.email });
      return Response.json(result.data);
    }
    if (action === 'download_invoice' || action === 'download_receipt') {
      const receipt = action === 'download_receipt';
      const row = await platform.entities[receipt ? 'Receipt' : 'Invoice'].get(receipt ? body.receipt_id : body.invoice_id);
      if (row.contact_id !== contactId) return Response.json({ error: 'Access denied' }, { status: 403 });
      const fileUrl = row.pdf_url || row.file_url || row.receipt_pdf_url || row.invoice_pdf_url;
      if (!fileUrl) return Response.json({ error: 'The PDF has not been generated yet. Please contact the team.' }, { status: 404 });
      const file = await fetch(fileUrl);
      if (!file.ok) return Response.json({ error: 'PDF unavailable' }, { status: 404 });
      const bytes = new Uint8Array(await file.arrayBuffer()); let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
      return Response.json({ pdf_base64: btoa(binary), filename: `${receipt ? 'Receipt' : 'Invoice'}-${row.id}.pdf` });
    }

    // Load data based on allowed sections
    const results = { contact, portalAccess, allowedSections };

    if (allowedSections.includes('quotes')) {
      const quotes = await platform.asServiceRole.entities.Quote.filter({ contact_id: contactId });
      results.quotes = quotes.map(q => ({
        id: q.id, quote_number: q.quote_number, status: q.status,
        book_title: q.book_title, total: q.total, subtotal: q.subtotal,
        vat_amount: q.vat_amount, include_vat: q.include_vat, vat_rate: q.vat_rate,
        valid_until: q.valid_until, created_date: q.created_date, notes: q.notes,
        terms: q.terms, line_items: q.line_items,
        accepted_at: q.accepted_at, declined_at: q.declined_at,
      }));
    }

    if (allowedSections.includes('invoices')) {
      const invoices = await platform.asServiceRole.entities.Invoice.filter({ contact_id: contactId });
      results.invoices = invoices.map(i => ({
        id: i.id, invoice_number: i.invoice_number, status: i.status,
        book_title: i.book_title, total: i.total, subtotal: i.subtotal,
        vat_amount: i.vat_amount, amount_paid: i.amount_paid, balance_due: i.balance_due,
        issue_date: i.issue_date, due_date: i.due_date, line_items: i.line_items,
        payment_terms: i.payment_terms, banking_details: i.banking_details,
        include_vat: i.include_vat, vat_rate: i.vat_rate, notes: i.notes,
        contact_snapshot: i.contact_snapshot, created_date: i.created_date,
      }));
    }

    if (allowedSections.includes('projects')) {
      const projects = await platform.asServiceRole.entities.Project.filter({ 
        $or: [{ contact_id: contactId }, ...(projectId ? [{ id: projectId }] : [])] 
      });
      results.projects = projects;
    }

    if (allowedSections.includes('documents')) {
      const documents = await platform.asServiceRole.entities.Document.filter({ 
        $or: [{ contact_id: contactId }, ...(projectId ? [{ project_id: projectId }] : [])] 
      });
      results.documents = documents.filter(d => !d.access_revoked);
    }

    // Load receipts
    const receipts = await platform.asServiceRole.entities.Receipt.filter({ contact_id: contactId });
    results.receipts = receipts;

    // Load appointments (always available for all portal users)
    const appointments = await platform.asServiceRole.entities.Appointment.filter({ linked_client_id: contactId }, '-created_date');
    results.appointments = appointments.map(a => ({
      id: a.id,
      service_name: a.service_name,
      date: a.date,
      start_time: a.start_time,
      end_time: a.end_time,
      mode: a.mode,
      status: a.status,
      client_note: a.client_note,
      zoom_link: a.zoom_link,
      created_date: a.created_date,
    }));

    // Load messages for chat
    if (projectId) {
      const messages = await platform.asServiceRole.entities.PortalMessage.filter({ 
        $or: [{ project_id: projectId }, { contact_id: contactId }] 
      }, 'created_date');
      results.messages = messages;
    }

    // Mark messages as read (admin viewing client messages)
    if (action === 'mark_messages_read') {
      if (projectId) {
        const unreadMessages = await platform.asServiceRole.entities.PortalMessage.filter({ 
          project_id: projectId,
          sender_type: 'client',
          is_read: false
        });
        
        await Promise.all(unreadMessages.map(msg => 
          platform.asServiceRole.entities.PortalMessage.update(msg.id, { is_read: true })
        ));
      }
    }

    // List projects with messages (for admin chat panel)
    if (action === 'list_projects_with_messages') {
      const projects = await platform.asServiceRole.entities.Project.list();
      const projectsWithMessages = await Promise.all(projects.map(async (project) => {
        const contact = await platform.asServiceRole.entities.Contact.get(project.contact_id);
        const messages = await platform.asServiceRole.entities.PortalMessage.filter({ project_id: project.id }, '-created_date');
        const lastMessage = messages[0];
        const unreadCount = messages.filter(m => !m.is_read && m.sender_type === 'client').length;
        
        return {
          id: project.id,
          book_title: project.book_title,
          contact_id: project.contact_id,
          contact_name: contact?.full_name || contact?.company || 'Unknown',
          profile_photo_url: contact?.profile_photo_url,
          last_message: lastMessage?.message,
          last_message_at: lastMessage?.created_date,
          unread_count: unreadCount,
        };
      }).filter(p => p.last_message)); // Only include projects with messages
      
      return Response.json({ projects: projectsWithMessages });
    }

    return Response.json(results);
  } catch (error) {
    console.error('Portal data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});