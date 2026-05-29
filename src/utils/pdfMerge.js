import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { base44 } from '@/api/base44Client';

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

  const uploaded = await base44.integrations.Core.UploadFile({ file });
  return uploaded.file_url;
}