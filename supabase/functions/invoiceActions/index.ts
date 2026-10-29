import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';
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

async function getNextInvoiceNumber(platform) {
  const existing = await platform.asServiceRole.entities.Invoice.list('-created_date', 1);
  if (!existing.length) return 'INV-0001';
  const last = existing[0].invoice_number || 'INV-0000';
  const match = last.match(/(\d+)$/);
  const num = match ? parseInt(match[1]) + 1 : 1;
  return `INV-${String(num).padStart(4, '0')}`;
}

function calcTotals(lineItems, includeVat, vatRate = 15) {
  const items = (lineItems || []).filter(i => i.description?.trim());
  const subtotal = parseFloat(items.reduce((s, i) => s + (Number(i.line_total) || 0), 0).toFixed(2));
  const vatAmount = includeVat !== false ? parseFloat((subtotal * vatRate / 100).toFixed(2)) : 0;
  const total = parseFloat((subtotal + vatAmount).toFixed(2));
  return { subtotal, vat_amount: vatAmount, total };
}

async function getCompanySettings(platform) {
  const settings = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
  const s = settings[0];
  if (!s) {
    console.log('No company settings found, using defaults');
  } else {
    console.log('Company settings loaded, logo_url:', s.logo_url ? 'PRESENT' : 'MISSING');
  }
  return s || {
    company_name: 'Creative Books SA',
    email: 'info@creativebooks.co.za',
    vat_number: '',
    currency_symbol: 'R',
    default_vat_rate: 15,
    document_footer_note: 'Creative Books SA · www.creativebooks.co.za',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_branch_code: '',
    logo_url: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5bdcd5def_creativelogo.png',
  };
}

async function fetchLogoBase64(logoUrl) {
  if (!logoUrl) {
    console.log('No logo URL provided');
    return null;
  }
  try {
    console.log('Fetching logo from:', logoUrl);
    const resp = await fetch(logoUrl);
    console.log('Logo response status:', resp.status);
    if (!resp.ok) {
      console.log('Logo fetch failed:', resp.status, resp.statusText);
      return null;
    }
    const ab = await resp.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    console.log('Logo fetched successfully, size:', ab.byteLength, 'bytes');
    return b64;
  } catch (err) {
    console.log('Logo fetch error:', err.message);
    return null;
  }
}

async function fetchSignatureBase64(sigUrl) {
  if (!sigUrl) {
    console.log('No signature URL provided');
    return null;
  }
  try {
    const resp = await fetch(sigUrl);
    if (!resp.ok) return null;
    const ab = await resp.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.log('Signature fetch error:', err.message);
    return null;
  }
}

async function buildDocumentPdf(doc, company, type, logoB64) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210; const ML = 14; const MR = 196; const CW = MR - ML;

  const companyName = company.company_name || 'Creative Books SA';
  const companyAddr = company.physical_address || '';
  const companyEmail = company.email || '';
  const companyPhone = company.phone || '';
  const companyVat = company.vat_number || '';
  const _acct1 = [
    company.bank_name && `Bank: ${company.bank_name}`,
    company.bank_account_name && `Account Name: ${company.bank_account_name}`,
    company.bank_account_number && `Account No: ${company.bank_account_number}`,
    company.bank_branch_code && `Branch Code: ${company.bank_branch_code}`,
  ].filter(Boolean);
  const _acct2 = [
    company.bank_name_2 && `Bank: ${company.bank_name_2}`,
    company.bank_account_name_2 && `Account Name: ${company.bank_account_name_2}`,
    company.bank_account_number_2 && `Account No: ${company.bank_account_number_2}`,
    company.bank_branch_code_2 && `Branch Code: ${company.bank_branch_code_2}`,
  ].filter(Boolean);
  const bankingDetails = company.banking_details || [..._acct1, ...(_acct2.length ? ['', ..._acct2] : [])].join('\n');
  const termsText = type === 'invoice' ? (company.invoice_terms || '') : (company.quote_terms || '');
  const signatureLabel = company.signature_label || 'Authorized Signature';
  const footer = company.document_footer_note || `${companyName} · www.creativebooks.co.za`;

  const contact = doc.contact_snapshot || {};
  const lineItems = (doc.line_items || []).filter(i => i.description?.trim());
  const includeVat = doc.include_vat !== false;

  const fmtDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const fmtMoney = (n) => {
    const num = Number(n || 0);
    return 'R ' + num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const docTitle  = type === 'invoice' ? 'INVOICE' : 'QUOTE';
  const docNumber = type === 'invoice' ? doc.invoice_number : doc.quote_number;
  const dateLabel1 = type === 'invoice' ? 'Invoice Date:' : 'Quote Date:';
  const dateVal1   = fmtDate(doc.issue_date || doc.created_date);
  const dateLabel2 = type === 'invoice' ? 'Due Date:' : 'Valid Until:';
  const dateVal2   = fmtDate(type === 'invoice' ? doc.due_date : doc.valid_until);

  let y = 12;

  // ── Logo (left) ──
  if (logoB64) {
    // Get image dimensions to preserve aspect ratio
    const imgProps = pdf.getImageProperties(`data:image/png;base64,${logoB64}`);
    const logoWidth = 52; // max width in mm
    const logoMaxHeight = 22; // max height in mm
    const imgRatio = imgProps.width / imgProps.height;
    let finalWidth = logoWidth;
    let finalHeight = logoWidth / imgRatio;
    // If height exceeds max, scale down
    if (finalHeight > logoMaxHeight) {
      finalHeight = logoMaxHeight;
      finalWidth = finalHeight * imgRatio;
    }
    pdf.addImage(`data:image/png;base64,${logoB64}`, 'PNG', ML, y, finalWidth, finalHeight);
  }

  // ── Title (right) ──
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(30, 30, 30);
  pdf.text(docTitle, MR, y + 8, { align: 'right' });
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`# ${docNumber}`, MR, y + 16, { align: 'right' });

  y += 22;

  // ── Company details (left) ──
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 30, 30);
  pdf.text(companyName, ML, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(90, 90, 90);
  let addrY = y + 5;
  const coAddr = companyAddr || 'Prism Office Park, Fourways, 2191';
  const coPhone = companyPhone || '010 500 3331';
  const coEmail2 = companyEmail || 'info@creativebooks.co.za';
  const aL = pdf.splitTextToSize(coAddr, 90);
  pdf.text(aL, ML, addrY); addrY += aL.length * 4.5;
  pdf.text(`Tel: ${coPhone}`, ML, addrY); addrY += 4.5;
  pdf.text(coEmail2, ML, addrY); addrY += 4.5;

  y = addrY + 6;

  // ── Divider ──
  pdf.setDrawColor(210, 210, 210);
  pdf.setLineWidth(0.3);
  pdf.line(ML, y, MR, y);
  y += 7;

  // ── Dates (right) + Attention To (left) ──
  const datesX = MR - 70;
  if (dateVal1) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100);
    pdf.text(dateLabel1, datesX, y);
    pdf.setTextColor(30, 30, 30); pdf.text(dateVal1, MR, y, { align: 'right' });
  }
  if (dateVal2) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100);
    pdf.text(dateLabel2, datesX, y + 5);
    pdf.setTextColor(30, 30, 30); pdf.text(dateVal2, MR, y + 5, { align: 'right' });
  }

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(130, 130, 130);
  pdf.text('Attention To', ML, y);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(30, 30, 30);
  pdf.text(contact.full_name || '', ML, y + 5);

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(80, 80, 80);
  let bY = y + 11;
  if (contact.company) { pdf.text(contact.company, ML, bY); bY += 4.5; }
  if (contact.phone) { pdf.text(`Tel: ${contact.phone}`, ML, bY); bY += 4.5; }
  if (contact.email) { pdf.text(contact.email, ML, bY); bY += 4.5; }
  if (contact.billing_address) { const bAdL = pdf.splitTextToSize(contact.billing_address, 80); pdf.text(bAdL, ML, bY); bY += bAdL.length * 4.5; }

  y = bY + 8;

  // ── Table Header ──
  pdf.setFillColor(45, 45, 45);
  pdf.rect(ML, y, CW, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  const hY = y + 5.5;
  pdf.text('#', ML + 4, hY, { align: 'center' });
  pdf.text('Item & Description', ML + 10, hY);
  pdf.text('Qty', ML + 115, hY, { align: 'right' });
  pdf.text('Rate', ML + 143, hY, { align: 'right' });
  pdf.text('Amount', MR, hY, { align: 'right' });
  y += 8;

  // ── Line Items ──
  lineItems.forEach((item, idx) => {
    if (y > 255) { pdf.addPage(); y = 14; }
    const fullDesc = (item.description || '').trim();
    const nl = fullDesc.indexOf('\n');
    const titleTxt = nl >= 0 ? fullDesc.substring(0, nl).trim() : fullDesc;
    const bodyTxt  = nl >= 0 ? fullDesc.substring(nl + 1).trim() : '';
    const tLines = pdf.splitTextToSize(titleTxt, CW - 42);
    const bLines = bodyTxt ? pdf.splitTextToSize(bodyTxt, CW - 42) : [];
    const rowH = Math.max(tLines.length * 5 + (bLines.length > 0 ? bLines.length * 4 + 2 : 0) + 8, 12);

    if (idx % 2 === 0) { pdf.setFillColor(250, 250, 250); pdf.rect(ML, y, CW, rowH, 'F'); }

    const rY = y + 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text(String(idx + 1), ML + 4, rY, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 30, 30);
    pdf.text(tLines, ML + 10, rY);

    if (bLines.length > 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(110, 110, 110);
      pdf.text(bLines, ML + 10, rY + tLines.length * 5 + 1);
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 30, 30);
    pdf.text(Number(item.quantity || 1).toFixed(2), ML + 115, rY, { align: 'right' });
    pdf.text(fmtMoney(item.unit_price), ML + 143, rY, { align: 'right' });
    pdf.text(fmtMoney(item.line_total), MR, rY, { align: 'right' });

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.2);
    pdf.line(ML, y + rowH, MR, y + rowH);
    y += rowH;
  });

  y += 6;

  // ── Total ──
  const totX = MR - 78;
  pdf.setFillColor(242, 242, 242);
  pdf.rect(totX - 2, y - 3, MR - totX + 4, 10, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 30, 30);
  pdf.text('Total', totX, y + 4);
  pdf.text(fmtMoney(doc.total), MR, y + 4, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  y += 18;

  // ── Footer sections ──
  const sectionHead = (title) => {
    if (y > 265) { pdf.addPage(); y = 14; }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(50, 50, 50);
    pdf.text(title, ML, y);
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(ML, y + 1.5, MR, y + 1.5);
    y += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(70, 70, 70);
  };

  if (doc.notes) {
    sectionHead('Notes');
    const nLines = pdf.splitTextToSize(doc.notes, CW);
    nLines.forEach(l => { if (y > 270) { pdf.addPage(); y = 14; } pdf.text(l, ML, y); y += 4.5; });
    y += 6;
  }

  // Banking Details (first)
  if (bankingDetails) {
    sectionHead('Banking Details');
    const bkLines = pdf.splitTextToSize(bankingDetails, CW);
    bkLines.forEach(l => { if (y > 270) { pdf.addPage(); y = 14; } pdf.text(l, ML, y); y += 4.5; });
    y += 6;
  }

  // Terms & Conditions (second - for quotes)
  if (termsText) {
    sectionHead('Terms & Conditions');
    termsText.split(/\n\n+/).forEach((para, pi, arr) => {
      const pLines = pdf.splitTextToSize(para.replace(/\n/g, ' '), CW);
      pLines.forEach(l => { if (y > 270) { pdf.addPage(); y = 14; } pdf.text(l, ML, y); y += 4.5; });
      if (pi < arr.length - 1) y += 3;
    });
    y += 6;
  }

  // Authorized Signature (last)
  y += 10;
  if (y > 252) { pdf.addPage(); y = 14; y += 10; }
  const sigY = y;
  
  // Add admin signature image if uploaded
  let sigB64 = null;
  if (company.admin_signature_url) {
    sigB64 = await fetchSignatureBase64(company.admin_signature_url);
  }
  
  if (sigB64) {
    // Get image dimensions to preserve aspect ratio - make signature bigger
    const imgProps = pdf.getImageProperties(`data:image/png;base64,${sigB64}`);
    const sigWidth = 70; // wider signature
    const sigMaxHeight = 35; // taller signature
    const imgRatio = imgProps.width / imgProps.height;
    let finalWidth = sigWidth;
    let finalHeight = sigWidth / imgRatio;
    if (finalHeight > sigMaxHeight) {
      finalHeight = sigMaxHeight;
      finalWidth = finalHeight * imgRatio;
    }
    // Position signature ABOVE the signature line
    const sigImageY = sigY;
    pdf.addImage(`data:image/png;base64,${sigB64}`, 'PNG', ML, sigImageY, finalWidth, finalHeight);
    y += finalHeight + 3;
  }
  
  // Signature line (below the signature image)
  pdf.setDrawColor(80, 80, 80);
  pdf.setLineWidth(0.4);
  pdf.line(ML, y, ML + 70, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text(signatureLabel, ML, y);

  // Page footer
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(210, 210, 210);
    pdf.setLineWidth(0.3);
    pdf.line(ML, 286, MR, 286);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(160, 160, 160);
    pdf.text(footer, PW / 2, 291, { align: 'center' });
    if (totalPages > 1) pdf.text(`Page ${p} of ${totalPages}`, MR, 291, { align: 'right' });
  }

  return pdf;
}

async function buildInvoicePdf(invoice, company, logoB64) {
  return await buildDocumentPdf(invoice, company, 'invoice', logoB64);
}

serve('invoiceActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // Public actions don't require auth
    if (action !== 'get_public' && action !== 'check_overdue') {
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    if (action === 'create') {
      const { contact_id, issue_date, due_date, include_vat, notes, payment_terms, banking_details, book_title, line_items, quote_id } = body;
      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: contact_id });
      const c = contacts[0] || {};
      const invoiceNumber = await getNextInvoiceNumber(platform);
      const computed = calcTotals(line_items, include_vat);
      const totalVal = computed.total;

      const company = await getCompanySettings(platform);
      const account1Lines = [
        company.bank_name && `Bank: ${company.bank_name}`,
        company.bank_account_name && `Account Name: ${company.bank_account_name}`,
        company.bank_account_number && `Account No: ${company.bank_account_number}`,
        company.bank_branch_code && `Branch Code: ${company.bank_branch_code}`,
      ].filter(Boolean);
      const account2Lines = [
        company.bank_name_2 && `Bank: ${company.bank_name_2}`,
        company.bank_account_name_2 && `Account Name: ${company.bank_account_name_2}`,
        company.bank_account_number_2 && `Account No: ${company.bank_account_number_2}`,
        company.bank_branch_code_2 && `Branch Code: ${company.bank_branch_code_2}`,
      ].filter(Boolean);
      const autoBuilt = [...account1Lines, ...(account2Lines.length ? ['', ...account2Lines] : [])].join('\n');
      const bankingStr = banking_details || company.banking_details || autoBuilt;

      const invoice = await platform.asServiceRole.entities.Invoice.create({
        invoice_number: invoiceNumber,
        contact_id,
        quote_id: quote_id || null,
        contact_snapshot: { full_name: c.full_name, email: c.email, phone: c.phone, company: c.company, billing_address: c.billing_address, vat_number: c.vat_number },
        status: 'Draft',
        issue_date: issue_date || new Date().toISOString().split('T')[0],
        due_date: due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        include_vat: include_vat !== false,
        vat_rate: 15,
        line_items: (line_items || []).filter(i => i.description?.trim()).map(i => ({
          description: i.description,
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          line_total: Number(i.line_total) || 0,
        })),
        subtotal: computed.subtotal,
        vat_amount: computed.vat_amount,
        total: totalVal,
        amount_paid: 0,
        balance_due: totalVal,
        notes: notes || '',
        payment_terms: payment_terms || 'Payment due within 7 days of invoice date.',
        banking_details: bankingStr,
        book_title: book_title || '',
        view_token: generateToken(),
      });
      return Response.json({ invoice });
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    if (action === 'update') {
      const { invoice_id, contact_id, issue_date, due_date, include_vat, notes, payment_terms, banking_details, book_title, line_items, amount_paid } = body;
      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: contact_id });
      const c = contacts[0] || {};
      const computed = calcTotals(line_items, include_vat);
      const totalVal = computed.total;
      const paid = Number(amount_paid) || 0;
      const balance = parseFloat((totalVal - paid).toFixed(2));

      const existing = (await platform.entities.Invoice.filter({ id: invoice_id }))[0];
      if (!existing) return Response.json({ error: 'Invoice not found' }, { status: 404 });
      let status = body.status || existing.status || 'Draft';
      if (paid >= totalVal && totalVal > 0) status = 'Paid';
      else if (paid > 0 && paid < totalVal) status = 'Partially Paid';
      else if (due_date && new Date(due_date) < new Date() && balance > 0 && status !== 'Draft') status = 'Overdue';

      const invoice = await platform.asServiceRole.entities.Invoice.update(invoice_id, {
        contact_id,
        contact_snapshot: { full_name: c.full_name, email: c.email, phone: c.phone, company: c.company, billing_address: c.billing_address, vat_number: c.vat_number },
        issue_date,
        due_date,
        include_vat: include_vat !== false,
        line_items: (line_items || []).filter(i => i.description?.trim()).map(i => ({
          description: i.description,
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          line_total: Number(i.line_total) || 0,
        })),
        subtotal: computed.subtotal,
        vat_amount: computed.vat_amount,
        total: totalVal,
        amount_paid: paid,
        balance_due: balance,
        notes: notes || '',
        payment_terms: payment_terms || '',
        banking_details: banking_details || '',
        book_title: book_title || '',
        status,
        ...(paid >= totalVal && totalVal > 0 ? { paid_at: new Date().toISOString() } : {}),
      });
      return Response.json({ invoice });
    }

    // ── SEND EMAIL ────────────────────────────────────────────────────────────
    if (['send', 'resend'].includes(action)) return Response.json({ error: 'Invoice email sending is pending approval. You can create and save invoice drafts.' }, { status: 503 });

    if (action === 'generate_pdf') {
      const invoice = (await platform.entities.Invoice.filter({ id: body.invoice_id }))[0];
      if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
      const company = await getCompanySettings(platform);
      const logo = await fetchLogoBase64(company.logo_url);
      const pdf = await buildInvoicePdf(invoice, company, logo);
      const bytes = new Uint8Array(pdf.output('arraybuffer'));
      let binary = '';
      bytes.forEach(byte => binary += String.fromCharCode(byte));
      return Response.json({ pdf_base64: btoa(binary), invoice_number: invoice.invoice_number });
    }

    // ── GET PUBLIC (invoice view page) ────────────────────────────────────────
    if (action === 'get_public') {
      const { invoice_id, token } = body;
      if (!invoice_id || !token) return Response.json({ error: 'Invalid link' }, { status: 400 });
      let invoices = [];
      try { invoices = await platform.asServiceRole.entities.Invoice.filter({ id: invoice_id }); } catch (e) { /* invalid id */ }
      if (!invoices.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const invoice = invoices[0];
      if (invoice.view_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });
      const company = await getCompanySettings(platform);
      return Response.json({ invoice, company });
    }

    // ── RESEND EMAIL (with new design) ────────────────────────────────────────
    if (['send', 'resend'].includes(action)) return Response.json({ error: 'Invoice email sending is pending approval. You can create and save invoice drafts.' }, { status: 503 });

    // ── MARK OVERDUE (scheduled / manual check) ───────────────────────────────
    if (action === 'check_overdue') {
      const today = new Date().toISOString().split('T')[0];
      const pending = await platform.asServiceRole.entities.Invoice.filter({ status: 'Sent' });
      const partials = await platform.asServiceRole.entities.Invoice.filter({ status: 'Partially Paid' });
      let count = 0;
      for (const inv of [...pending, ...partials]) {
        if (inv.due_date && inv.due_date < today && (inv.balance_due || 0) > 0) {
          await platform.asServiceRole.entities.Invoice.update(inv.id, { status: 'Overdue' });
          count++;
        }
      }
      return Response.json({ success: true, marked_overdue: count });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});