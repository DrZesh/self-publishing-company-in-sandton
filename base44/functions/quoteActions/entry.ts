import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@3.2.0';
import { jsPDF } from 'npm:jspdf@4.0.0';

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

async function getNextQuoteNumber(base44) {
  const existing = await base44.asServiceRole.entities.Quote.list('-created_date', 1);
  if (!existing.length) return 'CB-0001';
  const last = existing[0].quote_number || 'CB-0000';
  const num = parseInt(last.replace('CB-', '')) + 1;
  return `CB-${String(num).padStart(4, '0')}`;
}

async function saveLineItems(base44, quoteId, lineItems) {
  // Delete existing
  const existing = await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id: quoteId });
  for (const item of existing) {
    await base44.asServiceRole.entities.QuoteLineItem.delete(item.id);
  }
  // Create new
  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    if (!item.description) continue;
    await base44.asServiceRole.entities.QuoteLineItem.create({
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

function calcTotals(lineItems, discountAmount, includeVat, vatRate = 15) {
  const subtotal = lineItems.reduce((s, i) => s + (Number(i.line_total) || 0), 0);
  const discount = Number(discountAmount) || 0;
  const taxable = subtotal - discount;
  const vatAmount = includeVat ? parseFloat((taxable * (vatRate / 100)).toFixed(2)) : 0;
  const total = parseFloat((taxable + vatAmount).toFixed(2));
  return { subtotal: parseFloat(subtotal.toFixed(2)), discount_amount: discount, vat_amount: vatAmount, total };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // CREATE
    if (action === 'create') {
      const { contact_id, valid_until, include_vat, discount_amount, notes, terms, line_items } = body;
      const contact = await base44.asServiceRole.entities.Contact.filter({ id: contact_id });
      const contactData = contact[0] || {};
      const quoteNumber = await getNextQuoteNumber(base44);
      const totals = calcTotals(line_items || [], discount_amount, include_vat);

      const quote = await base44.asServiceRole.entities.Quote.create({
        quote_number: quoteNumber,
        contact_id,
        contact_snapshot: {
          full_name: contactData.full_name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
        },
        status: 'Draft',
        valid_until,
        include_vat: include_vat !== false,
        vat_rate: 15,
        discount_amount: totals.discount_amount,
        subtotal: totals.subtotal,
        vat_amount: totals.vat_amount,
        total: totals.total,
        notes: notes || '',
        terms: terms || '',
        view_token: generateToken(),
      });

      await saveLineItems(base44, quote.id, line_items || []);
      return Response.json({ quote });
    }

    // UPDATE
    if (action === 'update') {
      const { quote_id, contact_id, valid_until, include_vat, discount_amount, notes, terms, line_items } = body;
      const contact = await base44.asServiceRole.entities.Contact.filter({ id: contact_id });
      const contactData = contact[0] || {};
      const totals = calcTotals(line_items || [], discount_amount, include_vat);

      const quote = await base44.asServiceRole.entities.Quote.update(quote_id, {
        contact_id,
        contact_snapshot: {
          full_name: contactData.full_name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
        },
        valid_until,
        include_vat: include_vat !== false,
        discount_amount: totals.discount_amount,
        subtotal: totals.subtotal,
        vat_amount: totals.vat_amount,
        total: totals.total,
        notes: notes || '',
        terms: terms || '',
      });

      await saveLineItems(base44, quote_id, line_items || []);
      const updated = await base44.asServiceRole.entities.Quote.filter({ id: quote_id });
      return Response.json({ quote: updated[0] });
    }

    // SEND
    if (action === 'send') {
      const { quote_id } = body;
      const quotes = await base44.asServiceRole.entities.Quote.filter({ id: quote_id });
      if (!quotes.length) return Response.json({ error: 'Quote not found' }, { status: 404 });
      const quote = quotes[0];

      const contactEmail = quote.contact_snapshot?.email;
      if (!contactEmail) return Response.json({ error: 'Contact has no email address' }, { status: 400 });

      const viewUrl = `https://www.creativebooks.co.za/quote/view/${quote.id}/${quote.view_token}`;
      const contactName = quote.contact_snapshot?.full_name || 'there';

      // Generate PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // PDF Header
      pdf.setFillColor(26, 18, 8);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setTextColor(184, 115, 51);
      pdf.setFontSize(22);
      pdf.text('CREATIVE BOOKS SA', 15, 18);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text('Professional Publishing Services', 15, 26);
      pdf.text('info@creativebooks.co.za · www.creativebooks.co.za', 15, 32);

      // Quote info
      pdf.setTextColor(26, 18, 8);
      pdf.setFontSize(24);
      pdf.text(quote.quote_number, 140, 18);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text('Quote Number', 140, 24);
      pdf.text(`Valid until ${quote.valid_until || 'further notice'}`, 140, 32);

      // Client info
      pdf.setFillColor(250, 248, 244);
      pdf.rect(0, 45, 210, 25, 'F');
      pdf.setTextColor(184, 115, 51);
      pdf.setFontSize(9);
      pdf.text('PREPARED FOR', 15, 52);
      pdf.setTextColor(26, 18, 8);
      pdf.setFontSize(14);
      pdf.text(contactName, 15, 60);
      if (quote.contact_snapshot?.email) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(quote.contact_snapshot.email, 15, 66);
      }

      // Line items table
      const lineItems = await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id });
      lineItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      let yPos = 85;
      // Table header
      pdf.setFillColor(248, 247, 244);
      pdf.rect(0, yPos - 8, 210, 8, 'F');
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.text('DESCRIPTION', 15, yPos - 3);
      pdf.text('QTY', 140, yPos - 3, { align: 'center' });
      pdf.text('UNIT PRICE', 165, yPos - 3, { align: 'right' });
      pdf.text('TOTAL', 195, yPos - 3, { align: 'right' });

      // Table rows
      pdf.setTextColor(26, 18, 8);
      lineItems.forEach((item) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(10);
        pdf.text(item.description || '', 15, yPos);
        pdf.text(String(item.quantity || 1), 140, yPos, { align: 'center' });
        pdf.text(`R ${(Number(item.unit_price) || 0).toFixed(2)}`, 165, yPos, { align: 'right' });
        pdf.text(`R ${(Number(item.line_total) || 0).toFixed(2)}`, 195, yPos, { align: 'right' });
        yPos += 10;
      });

      // Totals
      yPos += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(140, yPos - 3, 205, yPos - 3);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.text('Subtotal:', 140, yPos + 3);
      pdf.text(`R ${(Number(quote.subtotal) || 0).toFixed(2)}`, 195, yPos + 3, { align: 'right' });
      
      if (quote.discount_amount > 0) {
        yPos += 8;
        pdf.setTextColor(200, 50, 50);
        pdf.text('Discount:', 140, yPos + 3);
        pdf.text(`- R ${(Number(quote.discount_amount) || 0).toFixed(2)}`, 195, yPos + 3, { align: 'right' });
      }
      
      if (quote.include_vat) {
        yPos += 8;
        pdf.setTextColor(100, 100, 100);
        pdf.text(`VAT (15%):`, 140, yPos + 3);
        pdf.text(`R ${(Number(quote.vat_amount) || 0).toFixed(2)}`, 195, yPos + 3, { align: 'right' });
      }
      
      yPos += 10;
      pdf.setDrawColor(184, 115, 51);
      pdf.setLineWidth(1);
      pdf.line(140, yPos - 3, 205, yPos - 3);
      pdf.setTextColor(26, 18, 8);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('TOTAL:', 140, yPos + 4);
      pdf.setTextColor(184, 115, 51);
      pdf.text(`R ${(Number(quote.total) || 0).toFixed(2)}`, 195, yPos + 4, { align: 'right' });

      // Notes
      if (quote.notes) {
        yPos += 20;
        pdf.setTextColor(184, 115, 51);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('NOTES:', 15, yPos);
        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        const splitNotes = pdf.splitTextToSize(quote.notes, 180);
        pdf.text(splitNotes, 15, yPos + 6);
      }

      // Terms
      if (quote.terms) {
        yPos += 30;
        pdf.setTextColor(184, 115, 51);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('TERMS & CONDITIONS:', 15, yPos);
        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        const splitTerms = pdf.splitTextToSize(quote.terms, 180);
        pdf.text(splitTerms, 15, yPos + 6);
      }

      // Footer
      pdf.setFillColor(248, 247, 244);
      pdf.rect(0, 280, 210, 15, 'F');
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(9);
      pdf.text('Creative Books SA · Proudly South African · www.creativebooks.co.za', 105, 289, { align: 'center' });

      const pdfArrayBuffer = pdf.output('arraybuffer');
      const uint8 = new Uint8Array(pdfArrayBuffer);
      let binary = '';
      uint8.forEach(b => binary += String.fromCharCode(b));
      const pdfBase64 = btoa(binary);

      // Modern high-end email HTML
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 20px; color: #1A1208; font-size: 24px; font-weight: 600; letter-spacing: -0.3px;">Hi ${contactName},</h2>
              
              <p style="margin: 0 0 24px; color: #555; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in Creative Books SA! We're excited to present your custom quote for your publishing project.
              </p>

              <!-- Quote Summary Card -->
              <div style="background: linear-gradient(135deg, #faf8f4 0%, #f5f0e8 100%); border: 1px solid rgba(184,115,51,0.15); border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
                <div style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Quote Total</div>
                <div style="font-size: 42px; font-weight: 700; color: #B87333; line-height: 1;">R ${Number(quote.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                <div style="font-size: 13px; color: #999; margin-top: 8px;">${quote.include_vat ? 'Including VAT (15%)' : 'Excluding VAT'}</div>
                <div style="font-size: 13px; color: #999; margin-top: 4px;">Quote #${quote.quote_number} · Valid until ${quote.valid_until || 'further notice'}</div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, #B87333 0%, #D4A574 100%); color: #ffffff; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(184,115,51,0.3); transition: all 0.3s ease;">
                  View & Accept Quote
                </a>
              </div>

              ${quote.notes ? `
              <div style="background: #f9f9f9; border-left: 3px solid #B87333; border-radius: 8px; padding: 20px; margin: 32px 0;">
                <div style="font-size: 12px; color: #B87333; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Personal Notes</div>
                <div style="color: #555; font-size: 14px; line-height: 1.6;">${quote.notes}</div>
              </div>
              ` : ''}

              <p style="margin: 32px 0 16px; color: #888; font-size: 14px; line-height: 1.6;">
                Your detailed quote PDF is attached to this email for your records. You can also view, accept, and download it anytime using the link above.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0;" />

              <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6;">
                Questions? Reply to this email or call us at <strong style="color: #1A1208;">010 500 3331</strong>.<br />
                We're here to help bring your book to life.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #fafafa; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">
                <strong style="color: #1A1208;">Creative Books SA</strong><br />
                Professional Publishing Services<br />
                info@creativebooks.co.za · www.creativebooks.co.za<br />
                Proudly South African 🇿🇦
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [contactEmail],
        subject: `Your Custom Quote — ${quote.quote_number} | Creative Books SA`,
        html: emailHtml,
        attachments: [
          {
            filename: `Quote-${quote.quote_number}.pdf`,
            content: pdfBase64,
            contentType: 'application/pdf',
          },
        ],
      });

      const updated = await base44.asServiceRole.entities.Quote.update(quote_id, {
        status: 'Sent',
        sent_at: new Date().toISOString(),
      });

      return Response.json({ success: true, quote: updated });
    }

    // GET PUBLIC (for client view page)
    if (action === 'get_public') {
      const { quote_id, token } = body;
      const quotes = await base44.asServiceRole.entities.Quote.filter({ id: quote_id });
      if (!quotes.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const quote = quotes[0];
      if (quote.view_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });

      // Mark as viewed if first time
      if (quote.status === 'Sent') {
        await base44.asServiceRole.entities.Quote.update(quote_id, {
          status: 'Viewed',
          viewed_at: new Date().toISOString(),
        });
        quote.status = 'Viewed';
      }

      const lineItems = await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id });
      lineItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return Response.json({ quote, line_items: lineItems });
    }

    // RESPOND (accept/decline)
    if (action === 'respond') {
      const { quote_id, token, response } = body;
      const quotes = await base44.asServiceRole.entities.Quote.filter({ id: quote_id });
      if (!quotes.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const quote = quotes[0];
      if (quote.view_token !== token) return Response.json({ error: 'Invalid token' }, { status: 403 });

      const updateData = response === 'accept'
        ? { status: 'Accepted', accepted_at: new Date().toISOString() }
        : { status: 'Declined', declined_at: new Date().toISOString() };

      const updated = await base44.asServiceRole.entities.Quote.update(quote_id, updateData);

      // Send confirmation email if accepted
      if (response === 'accept') {
        const contactEmail = quote.contact_snapshot?.email;
        const contactName = quote.contact_snapshot?.full_name || 'there';
        
        const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>
        <tr><td style="padding:48px 40px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="width:64px;height:64px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 style="margin:0 0 16px;color:#1A1208;font-size:24px;font-weight:600;">Quote Accepted!</h2>
            <p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6;">
              Thank you, ${contactName}! Your quote <strong>${quote.quote_number}</strong> has been successfully accepted.
            </p>
          </div>
          
          <div style="background:#faf8f4;border:1px solid rgba(184,115,51,0.15);border-radius:16px;padding:32px;margin:32px 0;">
            <div style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Contract Signed</div>
            <div style="font-size:14px;color:#555;line-height:1.8;">
              Your electronic signature has been recorded and this agreement is now legally binding.<br/>
              A member of our team will contact you within <strong>24-48 hours</strong> to discuss next steps and begin your project.
            </div>
          </div>

          <div style="background:#f0f9ff;border:1px solid #0ea5e9;border-radius:12px;padding:20px;margin:24px 0;">
            <div style="font-size:13px;color:#0369a1;font-weight:600;margin-bottom:8px;">📋 What Happens Next?</div>
            <ul style="margin:0;padding-left:20px;color:#0c4a6e;font-size:14px;line-height:1.8;">
              <li>Our team will review your project requirements</li>
              <li>We'll schedule a kick-off call to align on timelines</li>
              <li>You'll receive a project brief before work begins</li>
              <li>Regular updates throughout the production process</li>
            </ul>
          </div>

          <p style="margin:32px 0 16px;color:#888;font-size:14px;line-height:1.6;">
            Questions? Reply to this email or call us at <strong style="color:#1A1208;">010 500 3331</strong>.
          </p>
        </td></tr>
        <tr><td style="background:#fafafa;padding:32px 40px;text-align:center;border-top:1px solid #e5e5e5;">
          <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
            <strong style="color:#1A1208;">Creative Books SA</strong><br/>
            info@creativebooks.co.za · www.creativebooks.co.za<br/>
            Proudly South African 🇿🇦
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
        `;

        try {
          await resend.emails.send({
            from: 'Creative Books SA <info@creativebooks.co.za>',
            to: [contactEmail],
            subject: `Quote Accepted - ${quote.quote_number} | Creative Books SA`,
            html: confirmHtml,
          });
          console.log('Acceptance confirmation email sent to:', contactEmail);
        } catch (emailErr) {
          console.error('Failed to send confirmation email:', emailErr);
        }
      }

      return Response.json({ success: true, quote: updated });
    }

    // DUPLICATE
    if (action === 'duplicate') {
      const { quote_id } = body;
      const quotes = await base44.asServiceRole.entities.Quote.filter({ id: quote_id });
      if (!quotes.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const original = quotes[0];
      const quoteNumber = await getNextQuoteNumber(base44);

      const newQuote = await base44.asServiceRole.entities.Quote.create({
        ...original,
        id: undefined,
        quote_number: quoteNumber,
        status: 'Draft',
        view_token: generateToken(),
        sent_at: null,
        viewed_at: null,
        accepted_at: null,
        declined_at: null,
      });

      const items = await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id });
      await saveLineItems(base44, newQuote.id, items);
      return Response.json({ quote: newQuote });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});