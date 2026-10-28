import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { platform } from '@/api/platformClient';

/**
 * Fills AcroForm fields in a PDF (if they exist) and prepends a
 * "Contract Details" summary page with all admin-filled values.
 * Returns the URL of the new merged PDF.
 */
export async function mergePdfFields(originalPdfUrl, fieldDefs, fieldValues) {
  // Fetch original PDF
  const originalBytes = await fetch(originalPdfUrl).then(r => r.arrayBuffer());
  const originalDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });

  // Try to fill AcroForm fields if the PDF has them
  try {
    const form = originalDoc.getForm();
    const formFields = form.getFields();
    let filled = 0;
    for (const ff of formFields) {
      const name = ff.getName();
      const cleanName = name.replace(/^\{\{|\}\}$/g, '').trim();
      const value = fieldValues[name] || fieldValues[cleanName];
      if (value) {
        try {
          ff.setText(String(value));
          filled++;
        } catch { /* field may not be a text field */ }
      }
    }
    if (filled > 0) form.flatten();
  } catch { /* no AcroForm — skip silently */ }

  // Build a "Contract Details" summary page
  const detailsDoc = await PDFDocument.create();
  const page = detailsDoc.addPage([595, 842]); // A4
  const bold = await detailsDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await detailsDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  // Copper header bar
  page.drawRectangle({ x: 0, y: height - 50, width, height: 50, color: rgb(0.72, 0.44, 0.20) });
  page.drawText('CREATIVE BOOKS SA — CONTRACT DETAILS', {
    x: 30, y: height - 33, font: bold, size: 13, color: rgb(1, 1, 1),
  });

  let y = height - 80;
  page.drawText('Pre-filled Contract Information', { x: 30, y, font: bold, size: 11, color: rgb(0.3, 0.3, 0.3) });
  y -= 12;
  page.drawLine({ start: { x: 30, y }, end: { x: width - 30, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  y -= 18;

  // Admin-filled fields
  const adminDefs = fieldDefs.filter(f => f.assigned_to === 'admin' && fieldValues[f.id]);
  if (adminDefs.length > 0) {
    page.drawText('COMPANY-FILLED DETAILS (locked)', { x: 30, y, font: bold, size: 8.5, color: rgb(0.72, 0.44, 0.20) });
    y -= 14;
    for (const def of adminDefs) {
      if (y < 80) break;
      const val = String(fieldValues[def.id]);
      const display = val.length > 65 ? val.substring(0, 65) + '...' : val;
      page.drawText(def.label + ':', { x: 30, y, font: bold, size: 9, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(display, { x: 210, y, font: regular, size: 9, color: rgb(0.1, 0.1, 0.1) });
      y -= 13;
    }
    y -= 8;
  }

  // Client fields placeholder
  const clientDefs = fieldDefs.filter(f => f.assigned_to === 'client');
  if (clientDefs.length > 0 && y > 100) {
    page.drawLine({ start: { x: 30, y }, end: { x: width - 30, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    y -= 16;
    page.drawText('CLIENT-FILLED DETAILS (to be completed by client upon signing)', { x: 30, y, font: bold, size: 8.5, color: rgb(0.2, 0.4, 0.8) });
    y -= 14;
    for (const def of clientDefs) {
      if (y < 80) break;
      page.drawText(def.label + ':', { x: 30, y, font: bold, size: 9, color: rgb(0.4, 0.4, 0.4) });
      page.drawText('[To be completed by client]', { x: 210, y, font: regular, size: 9, color: rgb(0.5, 0.5, 0.7) });
      y -= 13;
    }
  }

  // Footer note
  page.drawText('This page is auto-generated. The full contract document follows on the next page(s).', {
    x: 30, y: 35, font: regular, size: 7.5, color: rgb(0.6, 0.6, 0.6),
  });

  // Merge: details page first, then original contract pages
  const merged = await PDFDocument.create();
  const [detailsPage] = await merged.copyPages(detailsDoc, [0]);
  merged.addPage(detailsPage);

  const pageCount = originalDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const [p] = await merged.copyPages(originalDoc, [i]);
    merged.addPage(p);
  }

  const mergedBytes = await merged.save();
  const blob = new Blob([mergedBytes], { type: 'application/pdf' });
  const file = new File([blob], 'contract_filled.pdf', { type: 'application/pdf' });

  const uploaded = await platform.integrations.Core.UploadFile({ file });
  return uploaded.file_url;
}

/**
 * Takes the original contract PDF and embeds both admin and client
 * signature blocks directly onto the last page of the document.
 * Returns the URL of the final signed PDF.
 */
export async function generateSignedPdf(
  pdfUrl, clientSigUrl, signerName, signerEmail, signedAt,
  adminSigUrl, adminSignerName
) {
  const originalBytes = await fetch(pdfUrl).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();
  const blockH = 120;
  const startY = 18;

  // Signature area background
  lastPage.drawRectangle({
    x: 20, y: startY, width: width - 40, height: blockH,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.82, 0.82, 0.82), borderWidth: 0.5,
  });
  // Copper top border
  lastPage.drawLine({
    start: { x: 20, y: startY + blockH },
    end: { x: width - 20, y: startY + blockH },
    thickness: 1.5, color: rgb(0.72, 0.44, 0.20),
  });
  lastPage.drawText('SIGNATURES — ELECTRONICALLY SIGNED', {
    x: 25, y: startY + blockH - 14,
    font: bold, size: 8, color: rgb(0.72, 0.44, 0.20),
  });

  const signedDateStr = signedAt
    ? new Date(signedAt).toLocaleString('en-ZA')
    : new Date().toLocaleString('en-ZA');

  const embedImg = async (url) => {
    const bytes = await fetch(url).then(r => r.arrayBuffer());
    try { return await pdfDoc.embedPng(bytes); }
    catch { return await pdfDoc.embedJpg(bytes); }
  };

  if (adminSigUrl) {
    // Two-column layout: admin left, client right
    const colW = (width - 60) / 2;
    const col2x = 30 + colW + 10;

    // Admin column
    lastPage.drawText('Creative Books SA (Company Representative):', {
      x: 25, y: startY + blockH - 28, font: bold, size: 7, color: rgb(0.4, 0.4, 0.4),
    });
    try {
      const adminImg = await embedImg(adminSigUrl);
      lastPage.drawImage(adminImg, { x: 25, y: startY + 42, width: colW - 10, height: 38 });
    } catch { /* skip if image unavailable */ }
    if (adminSignerName) {
      lastPage.drawText(adminSignerName, { x: 25, y: startY + 32, font: bold, size: 7.5, color: rgb(0.15, 0.15, 0.15) });
    }
    lastPage.drawText('Signed on behalf of Creative Books SA', { x: 25, y: startY + 22, font: regular, size: 6.5, color: rgb(0.5, 0.5, 0.5) });

    // Divider
    lastPage.drawLine({
      start: { x: 30 + colW, y: startY + 8 },
      end: { x: 30 + colW, y: startY + blockH - 18 },
      thickness: 0.5, color: rgb(0.8, 0.8, 0.8),
    });

    // Client column
    lastPage.drawText('Client / Signatory:', {
      x: col2x, y: startY + blockH - 28, font: bold, size: 7, color: rgb(0.4, 0.4, 0.4),
    });
    try {
      const clientImg = await embedImg(clientSigUrl);
      lastPage.drawImage(clientImg, { x: col2x, y: startY + 42, width: colW - 10, height: 38 });
    } catch { /* skip if image unavailable */ }
    lastPage.drawText(signerName, { x: col2x, y: startY + 32, font: bold, size: 7.5, color: rgb(0.15, 0.15, 0.15) });
    lastPage.drawText(signerEmail, { x: col2x, y: startY + 22, font: regular, size: 6.5, color: rgb(0.5, 0.5, 0.5) });
    lastPage.drawText('Signed: ' + signedDateStr, { x: col2x, y: startY + 12, font: regular, size: 6.5, color: rgb(0.5, 0.5, 0.5) });
  } else {
    // Single column — client only
    lastPage.drawText('Signed by:', { x: 25, y: startY + blockH - 28, font: bold, size: 7, color: rgb(0.4, 0.4, 0.4) });
    try {
      const clientImg = await embedImg(clientSigUrl);
      lastPage.drawImage(clientImg, { x: 25, y: startY + 38, width: 200, height: 50 });
    } catch { /* skip */ }
    lastPage.drawText(signerName, { x: 25, y: startY + 28, font: bold, size: 7.5, color: rgb(0.15, 0.15, 0.15) });
    lastPage.drawText(signerEmail, { x: 25, y: startY + 18, font: regular, size: 6.5, color: rgb(0.5, 0.5, 0.5) });
    lastPage.drawText('Signed: ' + signedDateStr, { x: 25, y: startY + 8, font: regular, size: 6.5, color: rgb(0.5, 0.5, 0.5) });
  }

  const signedBytes = await pdfDoc.save();
  const blob = new Blob([signedBytes], { type: 'application/pdf' });
  const file = new File([blob], 'contract_signed.pdf', { type: 'application/pdf' });
  const uploaded = await platform.integrations.Core.UploadFile({ file });
  return uploaded.file_url;
}