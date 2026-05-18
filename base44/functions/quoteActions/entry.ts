import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

      const viewUrl = `${req.headers.get('origin') || 'https://www.creativebooks.co.za'}/quote/view/${quote.id}/${quote.view_token}`;

      await resend.emails.send({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [contactEmail],
        subject: `Your Quote from Creative Books SA — ${quote.quote_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f7f4; padding: 40px 20px;">
            <div style="background: #1A1208; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #B87333; margin: 0; font-size: 24px;">Creative Books SA</h1>
              <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0; font-size: 14px;">Professional Publishing Services</p>
            </div>
            <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid rgba(0,0,0,0.08); border-top: none;">
              <h2 style="color: #1A1208; margin: 0 0 16px;">Hi ${quote.contact_snapshot?.full_name || 'there'},</h2>
              <p style="color: #555; line-height: 1.6;">Please find your quote <strong>${quote.quote_number}</strong> attached below. This quote is valid until <strong>${quote.valid_until || 'further notice'}</strong>.</p>
              <div style="background: #faf8f4; border: 1px solid rgba(184,115,51,0.2); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <div style="font-size: 28px; font-weight: bold; color: #B87333;">R ${Number(quote.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                <div style="color: #888; font-size: 14px; margin-top: 4px;">Total (incl. VAT)</div>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${viewUrl}" style="display: inline-block; background: #B87333; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">View & Accept Quote</a>
              </div>
              <p style="color: #888; font-size: 13px; text-align: center;">Or copy this link: <a href="${viewUrl}" style="color: #B87333;">${viewUrl}</a></p>
              ${quote.notes ? `<div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;"><strong>Notes:</strong><br><span style="color: #555;">${quote.notes}</span></div>` : ''}
              <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 24px 0;">
              <p style="color: #888; font-size: 12px; text-align: center;">Creative Books SA · info@creativebooks.co.za · 010 500 3331</p>
            </div>
          </div>
        `,
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