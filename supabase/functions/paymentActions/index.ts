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

function fmtMoney(n) {
  return 'R ' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function getNextNumber(platform, entity, prefix, field) {
  const existing = await platform.asServiceRole.entities[entity].list(`-created_date`, 1);
  if (!existing.length) return `${prefix}-0001`;
  const last = existing[0][field] || `${prefix}-0000`;
  const match = last.match(/(\d+)$/);
  const num = match ? parseInt(match[1]) + 1 : 1;
  return `${prefix}-${String(num).padStart(4, '0')}`;
}

async function getCompanySettings(platform) {
  const s = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
  return s[0] || { company_name: 'Creative Books SA', email: 'info@creativebooks.co.za' };
}

async function fetchLogoBase64(logoUrl) {
  if (!logoUrl) return null;
  try {
    const resp = await fetch(logoUrl);
    if (!resp.ok) return null;
    const ab = await resp.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  } catch (err) {
    console.error('Logo fetch error:', err.message);
    return null;
  }
}

async function buildReceiptPdf(receipt, invoice, company, logoB64) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ML = 14, MR = 196, CW = MR - ML, PW = 210;

  const cn = company.company_name || 'Creative Books SA';
  const cAddr = company.physical_address || 'Prism Office Park, Fourways, 2191';
  const cPhone = company.phone || '010 500 3331';
  const cEmail = company.email || 'info@creativebooks.co.za';
  const cVat = company.vat_number || '';
  const footerT = company.document_footer_note || `${cn} · www.creativebooks.co.za`;
  const ct = receipt.contact_snapshot || (invoice ? invoice.contact_snapshot : {}) || {};

  let y = 12;

  // Logo
  if (logoB64) {
    const imgProps = doc.getImageProperties(`data:image/png;base64,${logoB64}`);
    const logoWidth = 52, logoMaxHeight = 22;
    const ratio = imgProps.width / imgProps.height;
    let fw = logoWidth, fh = logoWidth / ratio;
    if (fh > logoMaxHeight) { fh = logoMaxHeight; fw = fh * ratio; }
    doc.addImage(`data:image/png;base64,${logoB64}`, 'PNG', ML, y, fw, fh);
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 30, 30);
  doc.text('RECEIPT', MR, y + 8, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`# ${receipt.receipt_number}`, MR, y + 16, { align: 'right' });
  y += 22;

  // Company details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(cn, ML, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  let aY = y + 5;
  const aL = doc.splitTextToSize(cAddr, 90);
  doc.text(aL, ML, aY); aY += aL.length * 4.5;
  doc.text(`Tel: ${cPhone}`, ML, aY); aY += 4.5;
  doc.text(cEmail, ML, aY); aY += 4.5;
  if (cVat) { doc.text(`VAT Reg No: ${cVat}`, ML, aY); aY += 4.5; }
  y = aY + 6;

  // Divider
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(ML, y, MR, y);
  y += 7;

  // Dates / payment info (right)
  const dX = MR - 70;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100); doc.text('Payment Date:', dX, y);
  doc.setTextColor(30, 30, 30); doc.text(fmtDate(receipt.payment_date), MR, y, { align: 'right' });
  doc.setTextColor(100, 100, 100); doc.text('Payment Method:', dX, y + 5);
  doc.setTextColor(30, 30, 30); doc.text(receipt.payment_method || 'EFT', MR, y + 5, { align: 'right' });
  if (receipt.reference) {
    doc.setTextColor(100, 100, 100); doc.text('Reference:', dX, y + 10);
    doc.setTextColor(30, 30, 30); doc.text(receipt.reference, MR, y + 10, { align: 'right' });
  }

  // Invoice ref (left)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
  doc.text('Payment For Invoice', ML, y);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 30, 30);
  doc.text(invoice ? invoice.invoice_number : (receipt.invoice_number || ''), ML, y + 5);
  y += 14;

  // Received from
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(130, 130, 130);
  doc.text('Received From', ML, y);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 30, 30);
  doc.text(ct.full_name || '', ML, y + 5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(80, 80, 80);
  let bY = y + 11;
  if (ct.company) { doc.text(ct.company, ML, bY); bY += 4.5; }
  if (ct.email) { doc.text(ct.email, ML, bY); bY += 4.5; }
  y = bY + 8;

  // Amount box
  doc.setFillColor(45, 45, 45);
  doc.rect(ML, y, CW, 12, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
  doc.text('Amount Received', ML + 6, y + 7.5);
  doc.text(fmtMoney(receipt.amount_paid), MR, y + 7.5, { align: 'right' });
  y += 18;

  // Invoice summary
  const invTotal = invoice ? invoice.total : (receipt.invoice_total || 0);
  const prevBal = invoice ? (invoice.balance_due || 0) : (receipt.balance_after || 0);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.setTextColor(80, 80, 80); doc.text('Invoice Total', ML, y);
  doc.setTextColor(30, 30, 30); doc.text(fmtMoney(invTotal), MR, y, { align: 'right' }); y += 6;
  doc.setTextColor(80, 80, 80); doc.text('Previous Balance', ML, y);
  doc.setTextColor(30, 30, 30); doc.text(fmtMoney(prevBal), MR, y, { align: 'right' }); y += 6;
  doc.setTextColor(80, 80, 80); doc.text('Balance After Payment', ML, y);
  doc.setTextColor(30, 30, 30); doc.text(fmtMoney(receipt.balance_after || 0), MR, y, { align: 'right' }); y += 14;

  // Banking details
  const acct1 = [
    company.bank_name && `Bank: ${company.bank_name}`,
    company.bank_account_name && `Account Name: ${company.bank_account_name}`,
    company.bank_account_number && `Account No: ${company.bank_account_number}`,
    company.bank_branch_code && `Branch Code: ${company.bank_branch_code}`,
  ].filter(Boolean);
  const acct2 = [
    company.bank_name_2 && `Bank: ${company.bank_name_2}`,
    company.bank_account_name_2 && `Account Name: ${company.bank_account_name_2}`,
    company.bank_account_number_2 && `Account No: ${company.bank_account_number_2}`,
    company.bank_branch_code_2 && `Branch Code: ${company.bank_branch_code_2}`,
  ].filter(Boolean);
  const banking = company.banking_details || [...acct1, ...(acct2.length ? ['', ...acct2] : [])].join('\n');

  const sectionHead = (title) => {
    if (y > 265) { doc.addPage(); y = 14; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(50, 50, 50);
    doc.text(title, ML, y);
    doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
    doc.line(ML, y + 1.5, MR, y + 1.5);
    y += 7;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(70, 70, 70);
  };

  if (banking) {
    sectionHead('Banking Details');
    const bkLines = doc.splitTextToSize(banking, CW);
    bkLines.forEach(l => { if (y > 270) { doc.addPage(); y = 14; } doc.text(l, ML, y); y += 4.5; });
    y += 6;
  }

  const termsText = company.invoice_terms || '';
  if (termsText) {
    sectionHead('Terms & Conditions');
    termsText.split(/\n\n+/).forEach((para, pi, arr) => {
      const pLines = doc.splitTextToSize(para.replace(/\n/g, ' '), CW);
      pLines.forEach(l => { if (y > 270) { doc.addPage(); y = 14; } doc.text(l, ML, y); y += 4.5; });
      if (pi < arr.length - 1) y += 3;
    });
    y += 6;
  }

  // Footer
  const tp = doc.getNumberOfPages();
  for (let p = 1; p <= tp; p++) {
    doc.setPage(p);
    doc.setDrawColor(210, 210, 210); doc.setLineWidth(0.3);
    doc.line(ML, 286, MR, 286);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(160, 160, 160);
    doc.text(footerT, PW / 2, 291, { align: 'center' });
    if (tp > 1) doc.text(`Page ${p} of ${tp}`, MR, 291, { align: 'right' });
  }

  return doc;
}

serve('paymentActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── RECORD PAYMENT ────────────────────────────────────────────────────────
    if (action === 'record') {
      const { invoice_id, contact_id, amount, payment_date, payment_method, reference, notes } = body;
      const amt = parseFloat(amount) || 0;

      const [invoices, contacts] = await Promise.all([
        platform.asServiceRole.entities.Invoice.filter({ id: invoice_id }),
        platform.asServiceRole.entities.Contact.filter({ id: contact_id }),
      ]);
      const invoice = invoices[0];
      const contact = contacts[0] || {};
      if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });

      const paymentNumber = await getNextNumber(platform, 'Payment', 'PAY', 'payment_number');
      const payment = await platform.asServiceRole.entities.Payment.create({
        payment_number: paymentNumber,
        invoice_id,
        contact_id,
        amount: amt,
        payment_date: payment_date || new Date().toISOString().split('T')[0],
        payment_method: payment_method || 'EFT',
        reference: reference || '',
        notes: notes || '',
      });

      const newAmountPaid = parseFloat(((invoice.amount_paid || 0) + amt).toFixed(2));
      const newBalance = parseFloat(Math.max(0, (invoice.total || 0) - newAmountPaid).toFixed(2));
      const newStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid';
      await platform.asServiceRole.entities.Invoice.update(invoice_id, {
        amount_paid: newAmountPaid,
        balance_due: newBalance,
        status: newStatus,
        ...(newBalance <= 0 ? { paid_at: new Date().toISOString() } : {}),
      });

      const receiptNumber = await getNextNumber(platform, 'Receipt', 'REC', 'receipt_number');
      const contactSnapshot = {
        full_name: contact.full_name,
        email: contact.email,
        company: contact.company,
        billing_address: contact.billing_address,
      };
      const receipt = await platform.asServiceRole.entities.Receipt.create({
        receipt_number: receiptNumber,
        payment_id: payment.id,
        invoice_id,
        contact_id,
        contact_snapshot: contactSnapshot,
        invoice_number: invoice.invoice_number,
        amount_paid: amt,
        balance_after: newBalance,
        invoice_total: invoice.total || 0,
        payment_date: payment_date || new Date().toISOString().split('T')[0],
        payment_method: payment_method || 'EFT',
        reference: reference || '',
      });

      await platform.asServiceRole.entities.Payment.update(payment.id, { receipt_id: receipt.id });
      return Response.json({ success: true, payment, receipt, invoice_status: newStatus, balance_due: newBalance });
    }

    // ── SEND ACKNOWLEDGEMENT ──────────────────────────────────────────────────
    if (action === 'send_acknowledgement') {
      const { receipt_id } = body;
      const receipts = await platform.asServiceRole.entities.Receipt.filter({ id: receipt_id });
      if (!receipts.length) return Response.json({ error: 'Receipt not found' }, { status: 404 });
      const receipt = receipts[0];
      const contactEmail = receipt.contact_snapshot?.email;
      if (!contactEmail) return Response.json({ error: 'No email on contact' }, { status: 400 });

      const company = await getCompanySettings(platform);
      const logoB64 = await fetchLogoBase64(company.logo_url || LOGO_URL);

      // Fetch linked invoice for PDF
      let invoice = null;
      if (receipt.invoice_id) {
        const invs = await platform.asServiceRole.entities.Invoice.filter({ id: receipt.invoice_id });
        invoice = invs[0] || null;
      }

      const pdf = await buildReceiptPdf(receipt, invoice, company, logoB64);
      const uint8 = new Uint8Array(pdf.output('arraybuffer'));
      let binary = '';
      uint8.forEach(b => binary += String.fromCharCode(b));
      const pdfBase64 = btoa(binary);

      const companyName = company.company_name || 'Creative Books SA';
      const companyEmail = company.email || 'info@creativebooks.co.za';
      const contactName = receipt.contact_snapshot?.full_name || 'there';
      const balanceRow = (receipt.balance_after || 0) > 0
        ? `<tr><td colspan="2" style="padding:10px 0 0;font-size:13px;color:#92400e;font-weight:600;">⚠️ Remaining balance on ${receipt.invoice_number}: R ${Number(receipt.balance_after).toFixed(2)}</td></tr>`
        : `<tr><td colspan="2" style="padding:10px 0 0;font-size:13px;color:#065f46;font-weight:600;">✅ Invoice ${receipt.invoice_number} is now fully settled. Thank you!</td></tr>`;

      const emailHtml = buildEmail({
        preheader: `Payment Receipt ${receipt.receipt_number} from ${companyName}`,
        icon: '✅',
        title: 'Payment Received',
        greeting: `Hi ${contactName},`,
        message: `Thank you — your payment of <strong>R ${Number(receipt.amount_paid).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</strong> has been successfully received. Your official receipt is attached to this email for your records.`,
        highlightHtml: `<table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Receipt Number</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${receipt.receipt_number}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Invoice</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${receipt.invoice_number || ''}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Payment Date</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${fmtDate(receipt.payment_date)}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#718096;">Payment Method</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${receipt.payment_method || 'EFT'}</td></tr>
          ${receipt.reference ? `<tr><td style="padding:4px 0;font-size:13px;color:#718096;">Reference</td><td style="padding:4px 0;font-size:13px;color:#2d3748;font-weight:600;text-align:right;">${receipt.reference}</td></tr>` : ''}
          <tr><td style="padding:8px 0 4px;font-size:14px;color:#718096;border-top:1px solid #e2e8f0;">Amount Paid</td><td style="padding:8px 0 4px;font-size:18px;color:#10b981;font-weight:800;text-align:right;border-top:1px solid #e2e8f0;">R ${Number(receipt.amount_paid).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td></tr>
          ${balanceRow}
        </table>`,
        footerNote: 'Your receipt PDF is attached for your records. Thank you for your business!',
        companyName,
        companyEmail,
        logoUrl: company.logo_url || LOGO_URL,
        phone: company.phone || '084 230 5393',
        address: company.physical_address || 'Prism Office Park, Fourways, Johannesburg',
        website: company.website_url || 'https://www.creativebooks.co.za',
      });

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: `${companyName} <${companyEmail}>`,
        to: [contactEmail],
        subject: `Payment Receipt ${receipt.receipt_number} — Invoice ${receipt.invoice_number}`,
        html: emailHtml,
        attachments: [{ filename: `Receipt-${receipt.receipt_number}.pdf`, content: pdfBase64, contentType: 'application/pdf' }],
      });

      await platform.asServiceRole.entities.Receipt.update(receipt_id, { acknowledgement_sent_at: new Date().toISOString() });
      return Response.json({ success: true });
    }

    // ── GET RECEIPT BY INVOICE ─────────────────────────────────────────────────
    if (action === 'get_by_invoice') {
      const { invoice_id } = body;
      const receipts = await platform.asServiceRole.entities.Receipt.filter({ invoice_id }, '-created_date', 1);
      if (receipts[0]) return Response.json({ receipt: receipts[0] });

      const invoices = await platform.asServiceRole.entities.Invoice.filter({ id: invoice_id });
      const invoice = invoices[0];
      if (!invoice) return Response.json({ receipt: null });

      const receiptNumber = await getNextNumber(platform, 'Receipt', 'REC', 'receipt_number');
      const receipt = await platform.asServiceRole.entities.Receipt.create({
        receipt_number: receiptNumber,
        payment_id: '',
        invoice_id,
        contact_id: invoice.contact_id,
        contact_snapshot: invoice.contact_snapshot || {},
        invoice_number: invoice.invoice_number,
        amount_paid: invoice.amount_paid || 0,
        balance_after: invoice.balance_due || 0,
        invoice_total: invoice.total || 0,
        payment_date: invoice.paid_at ? invoice.paid_at.split('T')[0] : new Date().toISOString().split('T')[0],
        payment_method: 'EFT',
        reference: '',
      });
      return Response.json({ receipt });
    }

    // ── GET RECEIPT PDF ────────────────────────────────────────────────────────
    if (action === 'get_receipt_pdf') {
      const { receipt_id } = body;
      const receipts = await platform.asServiceRole.entities.Receipt.filter({ id: receipt_id });
      if (!receipts.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const receipt = receipts[0];
      const company = await getCompanySettings(platform);
      const logoB64 = await fetchLogoBase64(company.logo_url || LOGO_URL);

      let invoice = null;
      if (receipt.invoice_id) {
        const invs = await platform.asServiceRole.entities.Invoice.filter({ id: receipt.invoice_id });
        invoice = invs[0] || null;
      }

      const pdf = await buildReceiptPdf(receipt, invoice, company, logoB64);
      const uint8 = new Uint8Array(pdf.output('arraybuffer'));
      let binary = '';
      uint8.forEach(b => binary += String.fromCharCode(b));
      const pdfBase64 = btoa(binary);
      return Response.json({ success: true, pdf_base64: pdfBase64, receipt_number: receipt.receipt_number });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});