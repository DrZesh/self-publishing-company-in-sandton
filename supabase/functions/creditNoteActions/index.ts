import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';
import { jsPDF } from 'npm:jspdf@4.0.0';

async function getNextNumber(platform) {
  const existing = await platform.asServiceRole.entities.CreditNote.list('-created_date', 1);
  if (!existing.length) return 'CN-0001';
  const last = existing[0].credit_note_number || 'CN-0000';
  const match = last.match(/(\d+)$/);
  const num = match ? parseInt(match[1]) + 1 : 1;
  return `CN-${String(num).padStart(4, '0')}`;
}

async function getCompanySettings(platform) {
  const s = await platform.asServiceRole.entities.CompanySettings.filter({ setting_key: 'main' });
  return s[0] || { company_name: 'Creative Books SA', email: 'info@creativebooks.co.za' };
}

function R(n) { return `R ${Number(n || 0).toFixed(2)}`; }

function buildCreditNotePdf(cn, company) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const companyName = company.company_name || 'Creative Books SA';
  const companyEmail = company.email || 'info@creativebooks.co.za';
  const companyVat = company.vat_number || '';
  const companyAddr = company.physical_address || '';
  const footer = company.document_footer_note || `${companyName} · www.creativebooks.co.za`;
  const contact = cn.contact_snapshot || {};
  const lineItems = (cn.line_items || []).filter(i => i.description?.trim());

  // ── Dark header ──
  pdf.setFillColor(26, 18, 8);
  pdf.rect(0, 0, 210, 46, 'F');
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(companyName.toUpperCase(), 15, 16);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(200, 190, 175);
  if (companyAddr) pdf.text(companyAddr, 15, 23);
  pdf.text(companyEmail, 15, 29);
  if (companyVat) pdf.text(`VAT Reg No: ${companyVat}`, 15, 35);

  // CN number top right
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(cn.credit_note_number, 195, 15, { align: 'right' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(184, 115, 51);
  pdf.text('CREDIT NOTE', 195, 23, { align: 'right' });
  pdf.setTextColor(200, 190, 175);
  pdf.setFontSize(8);
  if (cn.date) pdf.text(`Date: ${cn.date}`, 195, 30, { align: 'right' });
  pdf.text(`Re Invoice: ${cn.invoice_number || '—'}`, 195, 37, { align: 'right' });

  // ── Bill to ──
  let y = 54;
  pdf.setFillColor(250, 248, 244);
  pdf.rect(0, y, 210, 32, 'F');
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(7.5);
  pdf.setFont(undefined, 'bold');
  pdf.text('CREDIT ISSUED TO', 15, y + 8);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(26, 18, 8);
  pdf.setFontSize(13);
  pdf.text(contact.full_name || '', 15, y + 16);
  pdf.setFontSize(9);
  pdf.setTextColor(90, 80, 70);
  if (contact.company) pdf.text(contact.company, 15, y + 22);
  if (contact.billing_address) pdf.text(contact.billing_address, 15, y + 28);
  if (contact.vat_number) {
    pdf.text(`VAT Reg: ${contact.vat_number}`, 120, y + 16);
  }

  // ── Reason ──
  y = 94;
  if (cn.reason) {
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(147, 197, 253);
    pdf.setLineWidth(0.5);
    pdf.rect(15, y, 180, 14, 'FD');
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text('Reason:', 20, y + 6);
    pdf.setFont(undefined, 'normal');
    pdf.text(cn.reason, 45, y + 6);
    y += 20;
  }

  // ── Line items table ──
  if (lineItems.length > 0) {
    pdf.setFillColor(248, 247, 244);
    pdf.rect(15, y, 180, 10, 'F');
    pdf.setTextColor(120, 110, 100);
    pdf.setFontSize(7.5);
    pdf.setFont(undefined, 'bold');
    pdf.text('DESCRIPTION', 20, y + 7);
    pdf.text('QTY', 130, y + 7, { align: 'right' });
    pdf.text('UNIT PRICE (EXCL. VAT)', 165, y + 7, { align: 'right' });
    pdf.text('LINE TOTAL', 193, y + 7, { align: 'right' });
    pdf.setFont(undefined, 'normal');
    y += 12;

    lineItems.forEach((item, i) => {
      if (i % 2 === 1) { pdf.setFillColor(253, 252, 250); pdf.rect(15, y - 2, 180, 11, 'F'); }
      pdf.setTextColor(26, 18, 8);
      pdf.setFontSize(9);
      pdf.text(item.description, 20, y + 5);
      pdf.text(String(item.quantity || 1), 130, y + 5, { align: 'right' });
      pdf.text(R(item.unit_price), 165, y + 5, { align: 'right' });
      pdf.setFont(undefined, 'bold');
      pdf.text(R(item.line_total), 193, y + 5, { align: 'right' });
      pdf.setFont(undefined, 'normal');
      y += 11;
    });
    y += 4;
  }

  // ── Totals block ──
  pdf.setDrawColor(220, 210, 195);
  pdf.setLineWidth(0.4);
  pdf.line(110, y, 195, y);
  y += 6;

  const totals = [
    ['Subtotal (excl. VAT)', R(cn.subtotal)],
    [`VAT (${cn.vat_rate || 15}%)`, R(cn.vat_amount)],
  ];
  totals.forEach(([label, val]) => {
    pdf.setFontSize(9);
    pdf.setTextColor(100, 90, 80);
    pdf.text(label, 150, y, { align: 'right' });
    pdf.setTextColor(26, 18, 8);
    pdf.text(val, 193, y, { align: 'right' });
    y += 7;
  });
  // Grand total
  pdf.setFillColor(26, 18, 8);
  pdf.rect(110, y - 2, 85, 12, 'F');
  pdf.setTextColor(184, 115, 51);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text('TOTAL CREDITED (INCL. VAT)', 150, y + 6, { align: 'right' });
  pdf.text(R(cn.total), 193, y + 6, { align: 'right' });
  pdf.setFont(undefined, 'normal');

  // ── Footer ──
  pdf.setFillColor(248, 247, 244);
  pdf.rect(0, 280, 210, 17, 'F');
  pdf.setTextColor(150, 150, 150);
  pdf.setFontSize(8);
  pdf.text(footer, 105, 289, { align: 'center' });

  return pdf;
}

serve('creditNoteActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── ISSUE CREDIT NOTE ────────────────────────────────────────────────────
    if (action === 'issue') {
      const { invoice_id, reason, line_items, subtotal, vat_rate, vat_amount, total } = body;

      const invoices = await platform.asServiceRole.entities.Invoice.filter({ id: invoice_id });
      if (!invoices.length) return Response.json({ error: 'Invoice not found' }, { status: 404 });
      const invoice = invoices[0];

      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: invoice.contact_id });
      const contact = contacts[0] || {};

      const creditNoteNumber = await getNextNumber(platform);

      const contactSnapshot = {
        full_name: contact.full_name,
        email: contact.email,
        company: contact.company,
        billing_address: contact.billing_address,
        vat_number: contact.vat_number,
      };

      const creditNote = await platform.asServiceRole.entities.CreditNote.create({
        credit_note_number: creditNoteNumber,
        invoice_id,
        invoice_number: invoice.invoice_number,
        contact_id: invoice.contact_id,
        contact_snapshot: contactSnapshot,
        date: new Date().toISOString().split('T')[0],
        reason: reason || '',
        line_items: line_items || [],
        subtotal: parseFloat(subtotal) || 0,
        vat_rate: parseFloat(vat_rate) || 15,
        vat_amount: parseFloat(vat_amount) || 0,
        total: parseFloat(total) || 0,
      });

      // Adjust invoice: reduce effective total, recalculate balance & status
      const creditTotal = parseFloat(total) || 0;
      const newEffectiveTotal = Math.max(0, (invoice.total || 0) - creditTotal);
      const newBalance = Math.max(0, newEffectiveTotal - (invoice.amount_paid || 0));
      let newStatus = invoice.status;
      if (newEffectiveTotal <= 0) {
        newStatus = 'Voided';
      } else if (newBalance <= 0) {
        newStatus = 'Paid';
      } else if (invoice.status === 'Paid') {
        newStatus = 'Partially Paid';
      }

      await platform.asServiceRole.entities.Invoice.update(invoice_id, {
        total: newEffectiveTotal,
        balance_due: newBalance,
        status: newStatus,
      });

      return Response.json({ success: true, credit_note: creditNote, new_invoice_status: newStatus, new_balance: newBalance });
    }

    // ── GET PDF ──────────────────────────────────────────────────────────────
    if (action === 'get_pdf') {
      const { credit_note_id } = body;
      const cns = await platform.asServiceRole.entities.CreditNote.filter({ id: credit_note_id });
      if (!cns.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const cn = cns[0];
      const company = await getCompanySettings(platform);
      const pdf = buildCreditNotePdf(cn, company);
      const uint8 = new Uint8Array(pdf.output('arraybuffer'));
      let binary = '';
      uint8.forEach(b => binary += String.fromCharCode(b));
      return Response.json({ success: true, pdf_base64: btoa(binary), credit_note_number: cn.credit_note_number });
    }

    // ── SEND EMAIL ───────────────────────────────────────────────────────────
    if (action === 'send_email') {
      const { credit_note_id } = body;
      const cns = await platform.asServiceRole.entities.CreditNote.filter({ id: credit_note_id });
      if (!cns.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const cn = cns[0];
      const contactEmail = cn.contact_snapshot?.email;
      if (!contactEmail) return Response.json({ error: 'No email on contact' }, { status: 400 });

      const company = await getCompanySettings(platform);
      const pdf = buildCreditNotePdf(cn, company);
      const uint8 = new Uint8Array(pdf.output('arraybuffer'));
      let binary = '';
      uint8.forEach(b => binary += String.fromCharCode(b));
      const pdfBase64 = btoa(binary);

      const companyName = company.company_name || 'Creative Books SA';
      const companyEmail = company.email || 'info@creativebooks.co.za';
      const contactName = cn.contact_snapshot?.full_name || 'there';

      const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f7;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td height="6" style="background:linear-gradient(90deg,#B87333,#d4944a);font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 8px;color:#1A1208;font-size:20px;">Credit Note ${cn.credit_note_number}</h2>
  <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Re Invoice: ${cn.invoice_number}</p>
  <p style="color:#374151;font-size:15px;">Hi ${contactName},</p>
  <p style="color:#374151;font-size:15px;line-height:1.6;">
    Please find attached your credit note for <strong style="color:#1A1208;">R ${Number(cn.total).toFixed(2)}</strong> (incl. VAT).
  </p>
  ${cn.reason ? `<p style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:12px;border-radius:0 8px 8px 0;color:#1e40af;font-size:13px;">Reason: ${cn.reason}</p>` : ''}
  <div style="background:#f9f7f4;border-radius:12px;padding:16px;margin:20px 0;">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;"><span style="color:#6b7280;">Subtotal (excl. VAT)</span><span>R ${Number(cn.subtotal).toFixed(2)}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;"><span style="color:#6b7280;">VAT (${cn.vat_rate || 15}%)</span><span>R ${Number(cn.vat_amount).toFixed(2)}</span></div>
    <div style="display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:10px;font-weight:700;font-size:15px;"><span>Total Credited</span><span style="color:#B87333;">R ${Number(cn.total).toFixed(2)}</span></div>
  </div>
  <p style="color:#9ca3af;font-size:13px;">The credit note PDF is attached to this email.</p>
</td></tr>
<tr><td style="background:#fafafa;padding:20px 40px;text-align:center;border-top:1px solid #e5e5e5;">
  <p style="margin:0;color:#9ca3af;font-size:12px;"><strong style="color:#1A1208;">${companyName}</strong> · ${companyEmail}</p>
</td></tr>
</table></td></tr></table></body></html>`;

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      await resend.emails.send({
        from: `${companyName} <${companyEmail}>`,
        to: [contactEmail],
        subject: `Credit Note ${cn.credit_note_number} — Re Invoice ${cn.invoice_number} | ${companyName}`,
        html: emailHtml,
        attachments: [{ filename: `CreditNote-${cn.credit_note_number}.pdf`, content: pdfBase64, contentType: 'application/pdf' }],
      });

      await platform.asServiceRole.entities.CreditNote.update(credit_note_id, { acknowledgement_sent_at: new Date().toISOString() });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});