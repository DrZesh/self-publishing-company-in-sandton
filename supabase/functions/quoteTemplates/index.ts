import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('quoteTemplates', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // GENERATE PAYMENT LINK
    if (action === 'generate_payment_link') {
      const { quote_id, payment_type = 'full' } = body;
      
      const quotes = await platform.asServiceRole.entities.Quote.filter({ id: quote_id });
      if (!quotes.length) return Response.json({ error: 'Quote not found' }, { status: 404 });
      
      const quote = quotes[0];
      if (quote.status !== 'Accepted') {
        return Response.json({ error: 'Only accepted quotes can generate payment links' }, { status: 400 });
      }

      // Calculate amount based on payment type
      let amount = quote.total;
      if (payment_type === 'deposit' && quote.deposit_amount) {
        amount = quote.deposit_amount;
      } else if (payment_type === 'balance' && quote.balance_due) {
        amount = quote.balance_due;
      }

      // Create a payment link reference (in production, integrate with PayFast/Yoco/Stripe)
      const paymentRef = `PAY-${quote.quote_number}-${payment_type.toUpperCase()}`;
      const paymentLink = `https://www.creativebooks.co.za/pay/${quote.id}/${payment_type}`;

      await platform.asServiceRole.entities.Quote.update(quote_id, {
        payment_link: paymentLink,
        payment_type: payment_type,
      });

      return Response.json({
        success: true,
        payment_link: paymentLink,
        payment_ref: paymentRef,
        amount: amount,
      });
    }

    // CREATE QUOTE TEMPLATE
    if (action === 'create_template') {
      const { template_name, service_category, line_items, notes, terms } = body;
      
      // Store as a QuoteTemplate entity or reuse existing structure
      const template = await platform.asServiceRole.entities.Service.create({
        category: 'template',
        serviceName: template_name,
        description: notes || '',
        active: true,
      });

      // Store line items as QuoteLineItem with template_id reference
      if (line_items && line_items.length > 0) {
        for (const item of line_items) {
          await platform.asServiceRole.entities.QuoteLineItem.create({
            quote_id: `template_${template.id}`,
            description: item.description,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            line_total: item.line_total || 0,
            service_id: template.id,
          });
        }
      }

      return Response.json({ success: true, template_id: template.id });
    }

    // GET TEMPLATES
    if (action === 'get_templates') {
      const templates = await platform.asServiceRole.entities.Service.filter({ 
        category: 'template',
        active: true 
      });
      
      return Response.json({ templates });
    }

    // APPLY TEMPLATE TO QUOTE
    if (action === 'apply_template') {
      const { quote_id, template_id } = body;
      
      const template = await platform.asServiceRole.entities.Service.filter({ id: template_id });
      if (!template.length) return Response.json({ error: 'Template not found' }, { status: 404 });
      
      const templateItems = await platform.asServiceRole.entities.QuoteLineItem.filter({ 
        quote_id: `template_${template_id}` 
      });

      return Response.json({ 
        success: true, 
        line_items: templateItems,
        notes: template[0].description,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});