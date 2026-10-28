import { requireAdmin, AuthError } from './supabase-auth.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireAdmin(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { invoice_id } = await req.json();
    if (!invoice_id) return Response.json({ error: 'invoice_id required' }, { status: 400 });

    const invoices = await base44.asServiceRole.entities.Invoice.filter({ id: invoice_id });
    const invoice = invoices[0];
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });

    const contacts = await base44.asServiceRole.entities.Contact.filter({ id: invoice.contact_id });
    const contact = contacts[0];
    if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });

    const lineItemsHtml = (invoice.line_items || []).map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${item.description}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;">R ${(item.unit_price || 0).toLocaleString()}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;">R ${(item.line_total || 0).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:Georgia,serif;color:#1a1a1a;margin:0;padding:0;background:#f9f7f2}</style></head>
<body>
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
  <div style="height:10px;background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);"></div>
  <div style="text-align:center;padding:28px 0 8px;">
    <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;margin:0 auto;" />
  </div>
  <div style="text-align:center;padding:0 32px 12px;">
    <p style="font-family:sans-serif;color:#B87333;margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;">INVOICE</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1a1a1a;margin:0 0 4px;font-size:20px">${invoice.invoice_number}</h2>
    <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Dear ${contact.full_name},</p>
    <p style="color:#374151;line-height:1.6;margin-bottom:24px">
      Please find your invoice details below${invoice.book_title ? ` for <strong>${invoice.book_title}</strong>` : ''}. 
      ${invoice.due_date ? `Payment is due by <strong>${new Date(invoice.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.` : ''}
    </p>
    
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#f9f7f2">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Description</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Unit Price</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Total</th>
        </tr>
      </thead>
      <tbody>${lineItemsHtml}</tbody>
    </table>

    <div style="background:#f9f7f2;border-radius:8px;padding:16px;margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="color:#6b7280">Subtotal</span><span style="font-weight:600">R ${(invoice.subtotal || 0).toLocaleString()}</span>
      </div>
      ${invoice.include_vat ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="color:#6b7280">VAT (${invoice.vat_rate || 15}%)</span><span>R ${(invoice.vat_amount || 0).toLocaleString()}</span>
      </div>` : ''}
      <div style="display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px">
        <span style="font-weight:700;font-size:16px">Total Due</span>
        <span style="font-weight:700;font-size:18px;color:#B87333">R ${(invoice.total || 0).toLocaleString()}</span>
      </div>
    </div>

    ${invoice.banking_details ? `<div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px">
      <p style="font-weight:700;color:#1e40af;margin:0 0 8px;font-size:13px">BANKING DETAILS</p>
      <p style="color:#1d4ed8;margin:0;font-size:13px;white-space:pre-line">${invoice.banking_details}</p>
    </div>` : ''}

    ${invoice.payment_terms ? `<p style="color:#6b7280;font-size:13px;font-style:italic">${invoice.payment_terms}</p>` : ''}
    
    <p style="color:#374151;margin-top:24px">Kind regards,<br><strong>Creative Books SA Team</strong></p>
  </div>
  <div style="background:#f9f7f2;padding:16px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0">Creative Books SA · info@creativebookssa.co.za · www.creativebookssa.co.za</p>
  </div>
</div>
</body>
</html>`;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [contact.email],
        subject: `Invoice ${invoice.invoice_number} – Creative Books SA`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResp.json();

    // Update invoice status to Sent
    await base44.asServiceRole.entities.Invoice.update(invoice_id, { status: 'Sent', sent_at: new Date().toISOString() });

    return Response.json({ success: true, resend_id: emailResult.id });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: error.message }, { status: 500 });
  }
});