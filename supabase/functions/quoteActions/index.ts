import { createClientFromRequest, serve } from '../_shared/server.ts';
import { jsPDF } from 'npm:jspdf@4.0.0';

const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

function buildEmail({ preheader='',icon='',title='',greeting='',message='',highlightHtml='',buttonLabel='',buttonUrl='',footerNote='',companyName='Creative Books SA',companyEmail='info@creativebooks.co.za',logoUrl=LOGO_URL,phone='084 230 5393',address='Prism Office Park, Fourways, Johannesburg',website='https://www.creativebooks.co.za' }={}) {
  const logo = logoUrl ? `<img src="${logoUrl}" alt="${companyName}" width="160" style="max-width:160px;height:auto;display:block;margin:0 auto;" />` : `<span style="color:#B87333;font-size:22px;font-weight:800;font-family:Georgia,serif;">${companyName}</span>`;
  const iconHtml = icon ? `<div align="center" style="padding:24px 0 8px;font-size:40px;">${icon}</div>` : '';
  const titleHtml = title ? `<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#1a202c;font-family:Georgia,'Times New Roman',serif;text-align:center;line-height:1.3;">${title}</h1>` : '';
  const highlightBox = highlightHtml ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);"><div style="font-size:14px;color:#2d3748;line-height:1.8;">${highlightHtml}</div></td></tr></table>` : '';
  const primaryBtn = buttonLabel && buttonUrl ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td align="center"><a href="${buttonUrl}" style="display:inline-block;background:#B87333;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;font-family:Helvetica,Arial,sans-serif;">${buttonLabel}</a></td></tr></table>` : '';
  const footerNoteHtml = footerNote ? `<p style="margin:16px 0 0;font-size:12px;color:#a0aec0;text-align:center;">${footerNote}</p>` : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${companyName}</title><style>@media only screen and (max-width:600px){.ec{width:100%!important;border-radius:0!important;}.eb{padding:20px 16px!important;}h1{font-size:20px!important;}}</style></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px 16px 0 0;overflow:hidden;"><tr><td height="10" style="background:linear-gradient(90deg,#e53e3e,#ed8936,#ecc94b,#48bb78,#4299e1,#9f7aea,#ed64a6);font-size:0;line-height:0;">&nbsp;</td></tr></table>
<table class="ec" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">
  <tr><td align="center" style="padding:28px 32px 16px;background:#ffffff;">${logo}</td></tr>
  <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#e2e8f0;font-size:0;">&nbsp;</td></tr></table></td></tr>
  <tr><td class="eb" style="padding:20px 40px 32px;">${iconHtml}${titleHtml}${greeting ? `<p style="margin:0 0 14px;font-size:15px;color:#2d3748;line-height:1.6;">${greeting}</p>` : ''}${message ? `<div style="font-size:15px;color:#4a5568;line-height:1.7;margin-bottom:16px;">${message}</div>` : ''}${highlightBox}${primaryBtn}${footerNoteHtml}</td></tr>
  <tr><td style="background:#f7fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2d3748;">${companyName}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#718096;">${address}</p>
    <p style="margin:0 0 4px;font-size:12px;color:#718096;"><a href="mailto:${companyEmail}" style="color:#B87333;text-decoration:none;">${companyEmail}</a> · ${phone}</p>
    <p style="margin:0 0 6px;font-size:12px;"><a href="${website}" style="color:#B87333;text-decoration:none;">${website}</a></p>
    <p style="margin:0;font-size:11px;color:#a0aec0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function generateToken() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
}

async function getNextQuoteNumber(platform) {
  const year = new Date().getFullYear();
  const existing = await platform.asServiceRole.entities.Quote.filter({ quote_number: { $regex: `CBSA-QT-${year}-` } });
  const prefix = `CBSA-QT-${year}-`;
  const nextNum = existing.reduce((highest, row) => {
    const suffix = String(row.quote_number || '').slice(prefix.length);
    return /^\d+$/.test(suffix) ? Math.max(highest, Number(suffix)) : highest;
  }, 0) + 1;
  return `CBSA-QT-${year}-${String(nextNum).padStart(4, '0')}`;
}

async function getCompanySettings(platform) {
  const settings = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
  return settings[0] || {
    company_name: 'Creative Books SA',
    email: 'info@creativebooks.co.za',
    phone: '010 500 3331',
    physical_address: 'Prism Office Park, Fourways, 2191',
    brand_color_primary: '#B87333',
    brand_color_secondary: '#D4A574',
    quote_validity_days: 30,
    quote_terms: '',
    invoice_terms: '',
    signature_label: 'Authorized Signature',
  };
}

async function saveLineItems(platform, quoteId, lineItems) {
  const existing = await platform.asServiceRole.entities.QuoteLineItem.filter({ quote_id: quoteId });
  for (const item of existing) {
    await platform.asServiceRole.entities.QuoteLineItem.delete(item.id);
  }
  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    if (!item.description) continue;
    await platform.asServiceRole.entities.QuoteLineItem.create({
      quote_id: quoteId,
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      line_total: Number(item.line_total) || 0,
      service_id: item.service_id || null,
      sort_order: i,
    });
  }
}

function calcTotals(lineItems, discountAmount, discountPercentage, includeVat, vatRate = 15) {
  const subtotal = lineItems.reduce((s, i) => s + (Number(i.line_total) || 0), 0);
  const discount = discountPercentage ? (subtotal * discountPercentage / 100) : (Number(discountAmount) || 0);
  const taxable = subtotal - discount;
  const vatAmount = includeVat ? parseFloat((taxable * (vatRate / 100)).toFixed(2)) : 0;
  const total = parseFloat((taxable + vatAmount).toFixed(2));
  return { 
    subtotal: parseFloat(subtotal.toFixed(2)), 
    discount_amount: discount,
    discount_percentage: discountPercentage || 0,
    vat_amount: vatAmount, 
    total 
  };
}

async function buildQuotePdf(platform, quote, company, lineItems) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210, ML = 14, MR = 196, CW = MR - ML;
  
  // Fetch logo
  let logoB64 = null;
  if (company.logo_url) {
    try {
      let logoUrl = company.logo_url;
      if (logoUrl.includes('base44.app/api/apps')) {
        const match = logoUrl.match(/\/([^\/]+_[^\/]+)$/);
        if (match) logoUrl = `https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/${match[1]}`;
      }
      const r = await fetch(logoUrl);
      if (r.ok) {
        const ab = await r.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin = '';
        for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
        logoB64 = btoa(bin);
      }
    } catch (err) { console.error('Logo fetch failed:', err.message); }
  }

  const ct = quote.contact_snapshot || {};
  const items = lineItems.filter(i => i.description?.trim());
  const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const fmtM = (n) => 'R ' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });

  let y = 12;
  
  // Logo
  if (logoB64) {
    doc.addImage(`data:image/png;base64,${logoB64}`, 'PNG', ML, y, 52, 18);
  }
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 30, 30);
  doc.text('QUOTATION', MR, y + 8, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`# ${quote.quote_number}`, MR, y + 16, { align: 'right' });
  y += 22;

  // Company details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(company.company_name || 'Creative Books SA', ML, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  let aY = y + 5;
  const coAddr = company.physical_address || 'Prism Office Park, Fourways, 2191';
  const coPhone = company.phone || '010 500 3331';
  const coEmail = company.email || 'info@creativebooks.co.za';
  const aLines = doc.splitTextToSize(coAddr, 90);
  doc.text(aLines, ML, aY);
  aY += aLines.length * 4.5;
  doc.text(`Tel: ${coPhone}`, ML, aY);
  aY += 4.5;
  doc.text(coEmail, ML, aY);
  aY += 4.5;
  if (company.vat_number) {
    doc.text(`VAT Reg No: ${company.vat_number}`, ML, aY);
    aY += 4.5;
  }
  y = aY + 6;

  // Line
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y);
  y += 7;

  // Dates
  const dX = MR - 70;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Quote Date:', dX, y);
  doc.setTextColor(30, 30, 30);
  doc.text(fmtD(quote.created_date), MR, y, { align: 'right' });
  if (quote.valid_until) {
    doc.setTextColor(100, 100, 100);
    doc.text('Valid Until:', dX, y + 5);
    doc.setTextColor(30, 30, 30);
    doc.text(fmtD(quote.valid_until), MR, y + 5, { align: 'right' });
  }

  // Client details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text('Attention To', ML, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(ct.full_name || '', ML, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  let bY = y + 11;
  if (ct.company) { doc.text(ct.company, ML, bY); bY += 4.5; }
  if (ct.phone) { doc.text(`Tel: ${ct.phone}`, ML, bY); bY += 4.5; }
  if (ct.email) { doc.text(ct.email, ML, bY); bY += 4.5; }
  if (ct.billing_address) {
    const bLines = doc.splitTextToSize(ct.billing_address, 80);
    doc.text(bLines, ML, bY);
    bY += bLines.length * 4.5;
  }
  y = bY + 8;

  // Table header
  doc.setFillColor(45, 45, 45);
  doc.rect(ML, y, CW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const hY = y + 5.5;
  doc.text('#', ML + 4, hY, { align: 'center' });
  doc.text('Item & Description', ML + 10, hY);
  doc.text('Qty', ML + 115, hY, { align: 'right' });
  doc.text('Rate', ML + 143, hY, { align: 'right' });
  doc.text('Amount', MR, hY, { align: 'right' });
  y += 8;

  // Line items
  items.forEach((item, idx) => {
    if (y > 255) { doc.addPage(); y = 14; }
    const fd = (item.description || '').trim();
    const nl = fd.indexOf('\n');
    const tTxt = nl >= 0 ? fd.substring(0, nl).trim() : fd;
    const bTxt = nl >= 0 ? fd.substring(nl + 1).trim() : '';
    const tLines = doc.splitTextToSize(tTxt, CW - 42);
    const bLines2 = bTxt ? doc.splitTextToSize(bTxt, CW - 42) : [];
    const rH = Math.max(tLines.length * 5 + (bLines2.length > 0 ? bLines2.length * 4 + 2 : 0) + 8, 12);
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(ML, y, CW, rH, 'F');
    }
    const rY = y + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(String(idx + 1), ML + 4, rY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(tLines, ML + 10, rY);
    if (bLines2.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(bLines2, ML + 10, rY + tLines.length * 5 + 1);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(Number(item.quantity || 1).toFixed(2), ML + 115, rY, { align: 'right' });
    doc.text(fmtM(item.unit_price), ML + 143, rY, { align: 'right' });
    doc.text(fmtM(item.line_total), MR, rY, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(ML, y + rH, MR, y + rH);
    y += rH;
  });

  y += 6;
  const tX = MR - 78;

  // Total
  doc.setFillColor(242, 242, 242);
  doc.rect(tX - 2, y - 3, MR - tX + 4, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Total', tX, y + 4);
  doc.text(fmtM(quote.total), MR, y + 4, { align: 'right' });

  y += 18;

  // Notes, Banking, Terms
  const addSection = (title, text) => {
    if (!text) return;
    if (y > 265) { doc.addPage(); y = 14; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(title, ML, y);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, MR, y + 1.5);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(text, CW);
    lines.forEach(l => {
      if (y > 270) { doc.addPage(); y = 14; }
      doc.text(l, ML, y);
      y += 4.5;
    });
    y += 6;
  };

  addSection('Notes', quote.notes);
  
  // Banking
  const banking = company.banking_details || [
    company.bank_name && `Bank: ${company.bank_name}`,
    company.bank_account_name && `Account Name: ${company.bank_account_name}`,
    company.bank_account_number && `Account No: ${company.bank_account_number}`,
    company.bank_branch_code && `Branch Code: ${company.bank_branch_code}`,
  ].filter(Boolean).join('\n');
  addSection('Banking Details', banking);

  // Terms
  const termsText = quote.terms || company.quote_terms || '';
  addSection('Terms & Conditions', termsText);

  // Signature
  if (y > 252) { doc.addPage(); y = 14; }
  const sigY = y + 6;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.4);
  doc.line(ML, y, ML + 70, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(company.signature_label || 'Authorized Signature', ML, y);

  // Admin signature image
  let sigB64 = null;
  if (company.admin_signature_url) {
    try {
      const sigResp = await fetch(company.admin_signature_url);
      if (sigResp.ok) {
        const sigAb = await sigResp.arrayBuffer();
        const bytes = new Uint8Array(sigAb);
        let bin = '';
        for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
        sigB64 = btoa(bin);
      }
    } catch (err) { console.error('Signature fetch failed:', err.message); }
  }
  
  if (sigB64) {
    const imgProps = doc.getImageProperties(`data:image/png;base64,${sigB64}`);
    const sigWidth = 70;
    const sigMaxHeight = 35;
    const imgRatio = imgProps.width / imgProps.height;
    let finalWidth = sigWidth;
    let finalHeight = sigWidth / imgRatio;
    if (finalHeight > sigMaxHeight) {
      finalHeight = sigMaxHeight;
      finalWidth = finalHeight * imgRatio;
    }
    const sigImageY = sigY;
    doc.addImage(`data:image/png;base64,${sigB64}`, 'PNG', ML, sigImageY, finalWidth, finalHeight);
  }

  // Signature name and role
  if (company.signature_name) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(company.signature_name, ML, y + 6);
    if (company.signature_role) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(company.signature_role, ML, y + 10);
    }
  }

  // Footer
  const tp = doc.getNumberOfPages();
  const footerText = company.document_footer_note || `${company.company_name} | ${company.phone} | ${company.email}`;
  for (let p = 1; p <= tp; p++) {
    doc.setPage(p);
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(ML, 286, MR, 286);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(footerText, PW / 2, 291, { align: 'center' });
    if (tp > 1) doc.text(`Page ${p} of ${tp}`, MR, 291, { align: 'right' });
  }

  return doc;
}

serve('quoteActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;
    const company = await getCompanySettings(platform);
    // Only fetch user for admin actions
    const user = (action === 'load' || action === 'update' || action === 'create' || action === 'send' || action === 'generate_pdf' || action === 'duplicate' || action === 'convert_to_invoice') ? await platform.auth.me() : null;

    // GET PUBLIC (client view)
    if (action === 'get_public') {
      const { quote_id, token } = body;
      if (!quote_id || !token) return Response.json({ error: 'Invalid link' }, { status: 400 });
      let quotes = [];
      try { quotes = await platform.asServiceRole.entities.Quote.filter({ id: quote_id, view_token: token }); } catch (e) { /* invalid id */ }
      if (!quotes.length) return Response.json({ error: 'Quote not found' }, { status: 404 });
      
      const quote = quotes[0];
      const lineItems = await platform.asServiceRole.entities.QuoteLineItem.filter({ quote_id });
      lineItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      
      // Track view
      if (['Sent', 'Delivered'].includes(quote.status)) {
        await platform.asServiceRole.entities.Quote.update(quote_id, {
          status: 'Viewed',
          viewed_at: new Date().toISOString(),
        });
      }

      return Response.json({ 
        quote, 
        line_items: lineItems,
        company 
      });
    }

    // CLIENT RESPOND (accept/reject/request changes)
    if (action === 'respond') {
      const { quote_id, token, response, rejection_reason, changes_message, signature_image_url, signature_method, signer_name, signer_email } = body;
      if (!quote_id || !token) return Response.json({ error: 'Invalid link' }, { status: 400 });
      let quotes = [];
      try { quotes = await platform.asServiceRole.entities.Quote.filter({ id: quote_id, view_token: token }); } catch (e) { /* invalid id */ }
      if (!quotes.length) return Response.json({ error: 'Quote not found' }, { status: 404 });
      
      const quote = quotes[0];
      const contact = quote.contact_snapshot || {};
      
      let updates = {};
      let clientMessage = '';

      if (response === 'accept') {
        updates = {
          status: 'Accepted',
          accepted_at: new Date().toISOString(),
          accepted_signature_url: signature_image_url || null,
          signature_method: signature_method || null,
          signed_by_name: signer_name || contact.full_name,
          signed_by_email: signer_email || contact.email,
        };
        clientMessage = '';
      } else if (response === 'reject') {
        updates = {
          status: 'Rejected',
          rejected_at: new Date().toISOString(),
          declined_at: new Date().toISOString(),
          rejected_reason: rejection_reason || 'No reason provided',
          declined_reason: rejection_reason || 'No reason provided',
        };
        clientMessage = rejection_reason || '';
      } else if (response === 'request_changes') {
        updates = {
          status: 'Changes Requested',
          changes_requested_at: new Date().toISOString(),
          client_message: changes_message || '',
        };
        clientMessage = changes_message || '';
      }

      const updatedQuote = await platform.asServiceRole.entities.Quote.update(quote_id, updates);

      // Move contact pipeline
      const pipelineStage = response === 'accept' ? 'Quote Accepted' : response === 'reject' ? 'Lost' : 'Quote in Progress';
      await platform.asServiceRole.entities.Contact.update(quote.contact_id, {
        pipeline_stage: pipelineStage,
        pipeline_stage_changed_at: new Date().toISOString(),
        lost_reason: response === 'reject' ? (rejection_reason || 'Declined quote') : null,
      });

      return Response.json({ success: true, quote: updatedQuote });
    }

    // Staff editor actions used by AdminQuoteBuilder.
    if (action === 'load' && user) {
      const quote = (await platform.entities.Quote.filter({ id: body.quote_id }))[0];
      if (!quote) return Response.json({ error: 'Quote not found' }, { status: 404 });
      const line_items = await platform.entities.QuoteLineItem.filter({ quote_id: quote.id });
      line_items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return Response.json({ quote, line_items });
    }

    if (action === 'update' && user) {
      const existing = (await platform.entities.Quote.filter({ id: body.quote_id }))[0];
      if (!existing) return Response.json({ error: 'Quote not found' }, { status: 404 });
      const items = body.line_items || [];
      const vatRate = body.vat_rate ?? existing.vat_rate ?? company.default_vat_rate ?? 15;
      const totals = calcTotals(items, body.discount_amount, body.discount_percentage, body.include_vat !== false, vatRate);
      const contactId = body.contact_id || existing.contact_id;
      const contact = (await platform.entities.Contact.filter({ id: contactId }))[0];
      if (!contact) return Response.json({ error: 'Contact not found' }, { status: 400 });
      const quote = await platform.entities.Quote.update(existing.id, {
        ...totals, contact_id: contactId,
        contact_snapshot: { full_name: contact.full_name, email: contact.email, phone: contact.phone, company: contact.company, billing_address: contact.billing_address },
        valid_until: body.valid_until || existing.valid_until,
        include_vat: body.include_vat !== false, vat_rate: vatRate,
        book_title: body.book_title ?? existing.book_title, notes: body.notes ?? existing.notes, terms: body.terms ?? existing.terms,
      });
      await saveLineItems(platform, quote.id, items);
      return Response.json({ quote });
    }

    // ADMIN: CREATE
    if (action === 'create' && user) {
      const { contact_id, contact_snapshot, valid_until, include_vat, vat_rate, discount_amount, discount_percentage, notes, terms, line_items, service_category } = body;
      const contactData = contact_id ? (await platform.asServiceRole.entities.Contact.filter({ id: contact_id }))[0] || {} : {};
      const quoteNumber = await getNextQuoteNumber(platform);
      const totals = calcTotals(line_items || [], discount_amount, discount_percentage, include_vat, vat_rate ?? company.default_vat_rate ?? 15);
      const expiryDate = valid_until || new Date(Date.now() + (company.quote_validity_days || 30) * 86400000).toISOString().split('T')[0];

      const quote = await platform.asServiceRole.entities.Quote.create({
        quote_number: quoteNumber,
        contact_id: contact_id || '',
        contact_snapshot: contact_snapshot || {
          full_name: contactData.full_name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          billing_address: contactData.billing_address,
        },
        status: 'Draft',
        service_category: service_category || '',
        valid_until: expiryDate,
        include_vat: include_vat !== false,
        vat_rate: vat_rate ?? company.default_vat_rate ?? 15,
        discount_amount: totals.discount_amount,
        discount_percentage: totals.discount_percentage,
        subtotal: totals.subtotal,
        vat_amount: totals.vat_amount,
        total: totals.total,
        notes: notes || '',
        terms: terms || company.quote_terms || '',
        view_token: generateToken(),
        book_title: contactData.book_title || '',
      });

      await saveLineItems(platform, quote.id, line_items || []);

      return Response.json({ quote });
    }

    // ADMIN: SEND
    if (action === 'send') return Response.json({ error: 'Quote email sending is pending approval. You can create, edit and download quotes.' }, { status: 503 });

    // GENERATE PDF
    if (action === 'generate_pdf') {
      const { quote_id, token } = body;
      const quotes = token 
        ? await platform.asServiceRole.entities.Quote.filter({ id: quote_id, view_token: token })
        : await platform.asServiceRole.entities.Quote.filter({ id: quote_id });
      
      if (!quotes.length) return Response.json({ error: 'Quote not found' }, { status: 404 });
      const quote = quotes[0];
      const lineItems = await platform.asServiceRole.entities.QuoteLineItem.filter({ quote_id });
      lineItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const pdf = await buildQuotePdf(platform, quote, company, lineItems);
      const pdfArrayBuffer = pdf.output('arraybuffer');
      const uint8 = new Uint8Array(pdfArrayBuffer);
      let binary = '';
      uint8.forEach(b => binary += String.fromCharCode(b));
      const pdfBase64 = btoa(binary);

      // Upload to temporary storage
      const uploadResp = await platform.asServiceRole.integrations.Core.UploadFile({
        file: new Blob([pdfArrayBuffer], { type: 'application/pdf' }),
      });

      return Response.json({ pdf_url: uploadResp.file_url });
    }

    // ADMIN: DUPLICATE
    if (action === 'duplicate' && user) {
      const { quote_id } = body;
      const quotes = await platform.asServiceRole.entities.Quote.filter({ id: quote_id });
      if (!quotes.length) return Response.json({ error: 'Quote not found' }, { status: 404 });
      const src = quotes[0];

      const newNumber = await getNextQuoteNumber(platform);
      const expiryDate = new Date(Date.now() + (company.quote_validity_days || 30) * 86400000).toISOString().split('T')[0];

      const dup = await platform.asServiceRole.entities.Quote.create({
        quote_number: newNumber,
        contact_id: src.contact_id || '',
        contact_snapshot: src.contact_snapshot || {},
        status: 'Draft',
        service_category: src.service_category || '',
        valid_until: expiryDate,
        include_vat: src.include_vat !== false,
        vat_rate: src.vat_rate ?? company.default_vat_rate ?? 15,
        discount_amount: src.discount_amount || 0,
        discount_percentage: src.discount_percentage || 0,
        subtotal: src.subtotal || 0,
        vat_amount: src.vat_amount || 0,
        total: src.total || 0,
        notes: src.notes || '',
        terms: src.terms || company.quote_terms || '',
        view_token: generateToken(),
        book_title: src.book_title || '',
      });

      const srcItems = await platform.asServiceRole.entities.QuoteLineItem.filter({ quote_id });
      srcItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      await saveLineItems(platform, dup.id, srcItems);

      return Response.json({ quote: dup });
    }

    // ADMIN: CONVERT TO INVOICE
    if (action === 'convert_to_invoice') return Response.json({ error: 'Automatic invoice conversion and delivery are pending approval. Create a draft invoice from the invoice screen.' }, { status: 503 });

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});