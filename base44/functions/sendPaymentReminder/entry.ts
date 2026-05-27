import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { invoice_id, channel } = await req.json(); // channel: 'email' | 'whatsapp' | 'both'
    if (!invoice_id) return Response.json({ error: 'invoice_id required' }, { status: 400 });

    const invoices = await base44.asServiceRole.entities.Invoice.filter({ id: invoice_id });
    const invoice = invoices[0];
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });

    const contacts = await base44.asServiceRole.entities.Contact.filter({ id: invoice.contact_id });
    const contact = contacts[0];
    if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });

    const balanceDue = invoice.balance_due || invoice.total || 0;
    const daysOverdue = invoice.due_date ? Math.floor((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24)) : 0;
    const results = {};

    // Send email reminder
    if (!channel || channel === 'email' || channel === 'both') {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#f9f7f2;margin:0;padding:0">
<div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
  <div style="background:#dc2626;padding:24px 32px">
    <h2 style="color:#fff;margin:0;font-size:18px">Payment Reminder — Creative Books SA</h2>
  </div>
  <div style="padding:32px">
    <p style="color:#374151">Dear <strong>${contact.full_name}</strong>,</p>
    <p style="color:#374151;line-height:1.7">
      This is a friendly reminder that your invoice <strong>${invoice.invoice_number}</strong> 
      ${invoice.book_title ? `for <strong>${invoice.book_title}</strong>` : ''} 
      ${daysOverdue > 0 ? `is <strong style="color:#dc2626">${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue</strong>` : 'is due'}.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin:20px 0;text-align:center">
      <p style="color:#991b1b;margin:0 0 4px;font-size:13px">Amount Outstanding</p>
      <p style="color:#dc2626;font-size:28px;font-weight:700;margin:0">R ${balanceDue.toLocaleString()}</p>
      ${invoice.due_date ? `<p style="color:#9ca3af;font-size:12px;margin:8px 0 0">Due: ${new Date(invoice.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
    </div>
    ${invoice.banking_details ? `
    <div style="background:#f9f7f2;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="font-weight:700;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px">Banking Details</p>
      <p style="color:#374151;margin:0;font-size:13px;white-space:pre-line">${invoice.banking_details}</p>
    </div>` : ''}
    <p style="color:#374151;line-height:1.6">Please use reference: <strong>${invoice.invoice_number}</strong> when making payment. If you have already paid, please disregard this reminder.</p>
    <p style="color:#374151;margin-top:20px">Kind regards,<br><strong>Creative Books SA Team</strong></p>
  </div>
</div>
</body>
</html>`;

      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Creative Books SA <invoices@creativebookssa.co.za>',
          to: [contact.email],
          subject: `Payment Reminder: ${invoice.invoice_number} — R ${balanceDue.toLocaleString()} Outstanding`,
          html: emailHtml,
        }),
      });
      results.email = await emailResp.json();
    }

    // Send WhatsApp reminder
    if ((channel === 'whatsapp' || channel === 'both') && (contact.whatsapp_number || contact.phone)) {
      const number = contact.whatsapp_number || contact.phone;
      const formattedNumber = number.startsWith('+') ? number : `+27${number.replace(/^0/, '')}`;
      const waMessage = `Hi ${contact.full_name.split(' ')[0]}, this is a friendly reminder from Creative Books SA. Invoice ${invoice.invoice_number}${invoice.book_title ? ` for "${invoice.book_title}"` : ''} has an outstanding balance of *R ${balanceDue.toLocaleString()}*${daysOverdue > 0 ? ` (${daysOverdue} days overdue)` : ''}. Please use reference ${invoice.invoice_number} when paying. Contact us at info@creativebookssa.co.za if you have any questions.`;

      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const waResp = await fetch(twilioUrl, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ From: 'whatsapp:+14155238886', To: `whatsapp:${formattedNumber}`, Body: waMessage }),
      });
      results.whatsapp = await waResp.json();
    }

    // Log the reminder activity
    await base44.asServiceRole.entities.Task.create({
      title: `Payment reminder sent — ${invoice.invoice_number}`,
      task_type: 'Payment Follow-up',
      entity_type: 'invoice',
      entity_id: invoice_id,
      contact_id: invoice.contact_id,
      due_date: new Date().toISOString(),
      priority: 'Medium',
      status: 'Done',
      notes: `Reminder sent via ${channel || 'email'} on ${new Date().toLocaleDateString('en-ZA')}. Balance: R ${balanceDue.toLocaleString()}`,
    });

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});