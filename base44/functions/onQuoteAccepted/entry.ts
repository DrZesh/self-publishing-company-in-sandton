import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const { data: quote } = body;

    if (!quote || quote.status !== 'Accepted') {
      return Response.json({ skipped: true });
    }

    // 1. Auto-create Project if none exists for this quote
    const existingProjects = await base44.asServiceRole.entities.Project.filter({ quote_id: quote.id });
    if (existingProjects.length === 0) {
      const contacts = await base44.asServiceRole.entities.Contact.filter({ id: quote.contact_id });
      const contact = contacts[0];
      await base44.asServiceRole.entities.Project.create({
        contact_id: quote.contact_id,
        quote_id: quote.id,
        book_title: quote.book_title || contact?.book_title || 'Untitled Book',
        author_name: contact?.full_name || '',
        stage: 'Quote Accepted',
        project_value: quote.total || 0,
        payment_status: 'Unpaid',
        contract_status: 'Not Sent',
        stage_changed_at: new Date().toISOString(),
      });
    }

    // 2. Auto-create Invoice if none exists for this quote
    const existingInvoices = await base44.asServiceRole.entities.Invoice.filter({ quote_id: quote.id });
    if (existingInvoices.length === 0) {
      const lineItems = await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id: quote.id });
      const invoiceLineItems = lineItems.map(li => ({
        description: li.description,
        quantity: li.quantity || 1,
        unit_price: li.unit_price || 0,
        line_total: li.line_total || 0,
      }));

      const allInvoices = await base44.asServiceRole.entities.Invoice.list('-created_date', 1);
      const lastNum = allInvoices[0]?.invoice_number?.match(/\d+$/)?.[0] || '0000';
      const nextNum = String(parseInt(lastNum) + 1).padStart(4, '0');
      const year = new Date().getFullYear();

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      await base44.asServiceRole.entities.Invoice.create({
        contact_id: quote.contact_id,
        quote_id: quote.id,
        invoice_number: `INV-${year}-${nextNum}`,
        status: 'Draft',
        line_items: invoiceLineItems,
        subtotal: quote.subtotal || 0,
        vat_rate: quote.vat_rate || 15,
        vat_amount: quote.vat_amount || 0,
        include_vat: quote.include_vat !== false,
        total: quote.total || 0,
        balance_due: quote.total || 0,
        amount_paid: 0,
        book_title: quote.book_title || '',
        due_date: dueDate.toISOString().split('T')[0],
        contact_snapshot: quote.contact_snapshot || {},
      });
    }

    // 3. Update contact pipeline stage
    if (quote.contact_id) {
      await base44.asServiceRole.entities.Contact.update(quote.contact_id, {
        pipeline_stage: 'Project Started',
        pipeline_stage_changed_at: new Date().toISOString(),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});