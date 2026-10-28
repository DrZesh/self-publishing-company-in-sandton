import { serve } from '../_shared/server.ts';
/**
 * Shared PDF builder for Quotes and Invoices.
 * Called from invoiceActions and quoteActions backend functions.
 * Import with: import { buildDocumentPdf } from './buildDocumentPdf.js';
 * NOTE: Cannot import this from Deno — inline the function in each backend function instead.
 * This file is the canonical reference; copy buildDocumentPdf into each function file.
 */

import { jsPDF } from 'npm:jspdf@4.0.0';

/**
 * @param {object} doc  - Invoice or Quote record (with line_items array on it)
 * @param {object} company - CompanySettings record
 * @param {'invoice'|'quote'} type
 */
export function buildDocumentPdf(doc, company, type) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PW = 210;       // page width
  const ML = 14;        // left margin
  const MR = 196;       // right margin
  const CW = MR - ML;  // content width

  const companyName = company.company_name || 'Creative Books SA';
  const companyAddr = company.physical_address || '';
  const companyEmail = company.email || '';
  const companyPhone = company.phone || '';
  const companyVat = company.vat_number || '';
  const bankingDetails = company.banking_details || [
    company.bank_name && `Bank: ${company.bank_name}`,
    company.bank_account_name && `Account Name: ${company.bank_account_name}`,
    company.bank_account_number && `Account No: ${company.bank_account_number}`,
    company.bank_branch_code && `Branch Code: ${company.bank_branch_code}`,
  ].filter(Boolean).join('\n');
  const termsText = type === 'invoice' ? (company.invoice_terms || '') : (company.quote_terms || '');
  const signatureLabel = company.signature_label || 'Authorized Signature';
  const footer = company.document_footer_note || `${companyName} · www.creativebooks.co.za`;

  const contact = doc.contact_snapshot || {};
  const lineItems = (doc.line_items || []).filter(i => i.description?.trim());
  const includeVat = doc.include_vat !== false;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const fmtMoney = (n) => {
    const num = Number(n || 0);
    return 'R ' + num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const docTitle = type === 'invoice' ? 'TAX INVOICE' : 'QUOTE';
  const docNumber = type === 'invoice' ? doc.invoice_number : doc.quote_number;
  const dateLabel1 = type === 'invoice' ? 'Invoice Date:' : 'Estimate Date:';
  const dateVal1 = type === 'invoice' ? fmtDate(doc.issue_date) : fmtDate(doc.created_date || doc.issue_date);
  const dateLabel2 = type === 'invoice' ? 'Due Date:' : 'Valid Until:';
  const dateVal2 = type === 'invoice' ? fmtDate(doc.due_date) : fmtDate(doc.valid_until);

  let y = 14;

  // ── TOP ROW: logo left, title right ──────────────────────────────────────
  // Logo (left) — company.logo_url
  const logoUrl = company.logo_url;
  if (logoUrl) {
    try {
      // Add logo image at top-left (40x20mm)
      pdf.addImage(logoUrl, 'PNG', ML, y, 40, 20);
    } catch (e) {
      // Logo failed to load, skip
    }
  }

  // Title block (right)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(30, 30, 30);
  pdf.text(docTitle, MR, y + 8, { align: 'right' });

  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`# ${docNumber}`, MR, y + 16, { align: 'right' });

  // After logo/title area, position company details below
  let addrY = y + 24;
  
  // Company name (left, below logo)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 30, 30);
  pdf.text(companyName, ML, addrY);
  addrY += 5;

  // Company address lines
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(90, 90, 90);
  const addrLines = companyAddr ? pdf.splitTextToSize(companyAddr, 90) : [];
  addrLines.forEach(line => { pdf.text(line, ML, addrY); addrY += 4.5; });
  if (companyEmail) { pdf.text(companyEmail, ML, addrY); addrY += 4.5; }
  if (companyPhone) { pdf.text(companyPhone, ML, addrY); addrY += 4.5; }
  if (companyVat) { pdf.text(`VAT Reg No: ${companyVat}`, ML, addrY); addrY += 4.5; }

  y = addrY + 6;

  // ── Divider ───────────────────────────────────────────────────────────────
  pdf.setDrawColor(210, 210, 210);
  pdf.setLineWidth(0.3);
  pdf.line(ML, y, MR, y);
  y += 7;

  // ── BILL TO (left) + DATES (right) ────────────────────────────────────────
  const billToX = ML;
  const datesX = MR - 70;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(130, 130, 130);
  pdf.text('Bill To', billToX, y);
  y += 5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 30, 30);
  pdf.text(contact.full_name || '', billToX, y);

  // Dates right-side (aligned to the right column)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 100, 100);
  if (dateVal1) {
    pdf.text(dateLabel1, datesX, y - 5);
    pdf.setTextColor(30, 30, 30);
    pdf.text(dateVal1, MR, y - 5, { align: 'right' });
  }
  if (dateVal2) {
    pdf.setTextColor(100, 100, 100);
    pdf.text(dateLabel2, datesX, y);
    pdf.setTextColor(30, 30, 30);
    pdf.text(dateVal2, MR, y, { align: 'right' });
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  let bY = y + 5;
  if (contact.company) { pdf.text(contact.company, billToX, bY); bY += 4.5; }
  if (contact.billing_address) {
    const bAddrLines = pdf.splitTextToSize(contact.billing_address, 80);
    bAddrLines.forEach(l => { pdf.text(l, billToX, bY); bY += 4.5; });
  }
  if (contact.vat_number) { pdf.text(`VAT: ${contact.vat_number}`, billToX, bY); bY += 4.5; }

  y = bY + 8;

  // ── TABLE HEADER ─────────────────────────────────────────────────────────
  const COL = {
    num:  { x: ML,       w: 8,  align: 'center' },
    desc: { x: ML + 9,   w: 95, align: 'left'   },
    qty:  { x: ML + 105, w: 20, align: 'right'  },
    rate: { x: ML + 130, w: 28, align: 'right'  },
    amt:  { x: MR,       w: 28, align: 'right'  },
  };

  pdf.setFillColor(45, 45, 45);
  pdf.rect(ML, y, CW, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);

  const hY = y + 5.5;
  pdf.text('#', COL.num.x + COL.num.w / 2, hY, { align: 'center' });
  pdf.text('Item & Description', COL.desc.x, hY);
  pdf.text('Qty', COL.qty.x + COL.qty.w, hY, { align: 'right' });
  pdf.text('Rate', COL.rate.x + COL.rate.w, hY, { align: 'right' });
  pdf.text('Amount', COL.amt.x, hY, { align: 'right' });

  y += 8;

  // ── LINE ITEMS ────────────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'normal');
  lineItems.forEach((item, idx) => {
    if (y > 255) { pdf.addPage(); y = 14; }

    // Split description into title (first line) + body (rest)
    const fullDesc = (item.description || '').trim();
    const firstNewline = fullDesc.indexOf('\n');
    const titleText = firstNewline >= 0 ? fullDesc.substring(0, firstNewline).trim() : fullDesc;
    const bodyText  = firstNewline >= 0 ? fullDesc.substring(firstNewline + 1).trim() : '';

    const titleLines = pdf.splitTextToSize(titleText, COL.desc.w);
    const bodyLines  = bodyText ? pdf.splitTextToSize(bodyText, COL.desc.w) : [];
    const descH = titleLines.length * 5 + (bodyLines.length > 0 ? bodyLines.length * 4 + 2 : 0);
    const rowH = Math.max(descH + 8, 12);

    // Alternating row background
    if (idx % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(ML, y, CW, rowH, 'F');
    }

    const rY = y + 5;

    // # centred
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text(String(idx + 1), COL.num.x + COL.num.w / 2, rY, { align: 'center' });

    // Title bold
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 30, 30);
    pdf.text(titleLines, COL.desc.x, rY);

    // Body grey
    if (bodyLines.length > 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(110, 110, 110);
      pdf.text(bodyLines, COL.desc.x, rY + titleLines.length * 5 + 1);
    }

    // Qty, Rate, Amount — right-aligned, decimal-aligned
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 30, 30);
    pdf.text(Number(item.quantity || 1).toFixed(2), COL.qty.x + COL.qty.w, rY, { align: 'right' });
    pdf.text(fmtMoney(item.unit_price), COL.rate.x + COL.rate.w, rY, { align: 'right' });
    pdf.text(fmtMoney(item.line_total), COL.amt.x, rY, { align: 'right' });

    // Row divider
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.2);
    pdf.line(ML, y + rowH, MR, y + rowH);

    y += rowH;
  });

  y += 6;

  // ── TOTALS BLOCK (right-aligned) ──────────────────────────────────────────
  const totW = 80;
  const totX = MR - totW;
  const totLabelX = totX + 2;
  const totValX = MR;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  pdf.text('Sub Total', totLabelX, y);
  pdf.setTextColor(30, 30, 30);
  pdf.text(fmtMoney(doc.subtotal), totValX, y, { align: 'right' });
  y += 7;

  if (includeVat && (doc.vat_amount || 0) > 0) {
    pdf.setTextColor(80, 80, 80);
    pdf.text(`VAT (${doc.vat_rate || 15}%)`, totLabelX, y);
    pdf.setTextColor(30, 30, 30);
    pdf.text(fmtMoney(doc.vat_amount), totValX, y, { align: 'right' });
    y += 7;
  }

  // Total row — shaded box
  pdf.setFillColor(242, 242, 242);
  pdf.rect(totX, y - 3, totW, 10, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 30, 30);
  pdf.text('Total', totLabelX, y + 4);
  pdf.text(fmtMoney(doc.total), totValX, y + 4, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  y += 18;

  // ── FOOTER SECTIONS ───────────────────────────────────────────────────────
  const sectionHeading = (title) => {
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

  const docNotes = doc.notes || '';
  if (docNotes) {
    sectionHeading('Notes');
    const nLines = pdf.splitTextToSize(docNotes, CW);
    nLines.forEach(l => {
      if (y > 270) { pdf.addPage(); y = 14; }
      pdf.text(l, ML, y); y += 4.5;
    });
    y += 6;
  }

  if (bankingDetails) {
    sectionHeading('Banking Details');
    const bLines = pdf.splitTextToSize(bankingDetails, CW);
    bLines.forEach(l => {
      if (y > 270) { pdf.addPage(); y = 14; }
      pdf.text(l, ML, y); y += 4.5;
    });
    y += 6;
  }

  if (termsText) {
    sectionHeading('Terms & Conditions');
    // Preserve paragraph breaks (\n\n)
    const paras = termsText.split(/\n\n+/);
    paras.forEach((para, pi) => {
      const pLines = pdf.splitTextToSize(para.replace(/\n/g, ' '), CW);
      pLines.forEach(l => {
        if (y > 270) { pdf.addPage(); y = 14; }
        pdf.text(l, ML, y); y += 4.5;
      });
      if (pi < paras.length - 1) y += 3;
    });
    y += 6;
  }

  // Signature block
  if (y > 250) { pdf.addPage(); y = 14; }
  y += 6;
  pdf.setDrawColor(80, 80, 80);
  pdf.setLineWidth(0.4);
  pdf.line(ML, y, ML + 70, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text(signatureLabel, ML, y);

  // ── PAGE FOOTER ───────────────────────────────────────────────────────────
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
    if (totalPages > 1) {
      pdf.text(`Page ${p} of ${totalPages}`, MR, 291, { align: 'right' });
    }
  }

  return pdf;
}