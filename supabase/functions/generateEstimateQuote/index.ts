import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('generateEstimateQuote', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { services, formData, clientInfo } = body;

    // Calculate totals based on selected services
    let breakdown = [];
    let grandTotal = 0;

    // Process each service
    for (const service of services) {
      let serviceTotal = 0;
      let serviceDetails = '';

      switch (service.type) {
        case 'printing':
          serviceTotal = service.estimatedCost;
          serviceDetails = `${service.copies} copies, ${service.pages}p, ${service.size}`;
          break;
        case 'editing':
          serviceTotal = Math.ceil(service.wordCount * service.ratePerWord);
          serviceDetails = `${service.wordCount} words @ R${service.ratePerWord}/word`;
          break;
        case 'design':
          serviceTotal = service.price;
          serviceDetails = service.packageName || service.description;
          break;
        default:
          serviceTotal = service.price || 0;
      }

      breakdown.push({
        service: service.name,
        details: serviceDetails,
        amount: serviceTotal,
      });

      grandTotal += serviceTotal;
    }

    // Add 15% estimate adjustment disclaimer
    const estimateNote = 'This is an automated estimate based on website pricing. Final quotation will be confirmed after file review.';

    const quoteData = {
      referenceNumber: `EST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      clientInfo,
      breakdown,
      subtotal: grandTotal,
      estimatedTotal: grandTotal,
      estimateNote,
      timestamp: new Date().toISOString(),
    };

    // Send confirmation email to client
    await platform.integrations.Core.SendEmail({
      to: clientInfo.email,
      subject: `Your Publishing Estimate from Creative Books SA - Ref: ${quoteData.referenceNumber}`,
      body: `Hi ${clientInfo.name},\n\nThank you for using our calculator. Your estimated total is R${quoteData.estimatedTotal.toLocaleString()}.\n\nThis is an automated estimate. Our team will review your files and confirm final pricing within 24 hours.\n\nBest regards,\nCreative Books SA`,
    });

    // Send copy to admin
    await platform.integrations.Core.SendEmail({
      to: 'info@creativebookssa.co.za',
      subject: `New Estimate Generated - ${clientInfo.name} - Ref: ${quoteData.referenceNumber}`,
      body: `New estimate generated:\n\nClient: ${clientInfo.name}\nEmail: ${clientInfo.email}\nTotal: R${quoteData.estimatedTotal}\n\nServices selected: ${services.map(s => s.name).join(', ')}`,
    });

    return Response.json(quoteData);
  } catch (error) {
    console.error('Quote generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});