import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientInfo, breakdown, total, quoteNumber } = await req.json();

    if (!clientInfo || !breakdown || !total || !quoteNumber) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email to admin
    const breakdownDetails = breakdown
      .map((item, idx) => `${idx + 1}. ${item.name}: R${item.amount.toLocaleString()}`)
      .join('\n');

    const adminEmailBody = `
New Estimate Request - Quote #${quoteNumber}

CLIENT DETAILS:
Name: ${clientInfo.name}
Email: ${clientInfo.email}
Phone: ${clientInfo.phone || 'Not provided'}

QUOTE SUMMARY:
${breakdownDetails}

Total: R${total.toLocaleString()}

---
This client has been sent the estimate PDF. They will receive it at ${clientInfo.email}.
Please review and follow up within 24 hours with a formal quotation.
    `;

    await base44.integrations.Core.SendEmail({
      to: 'info@creativebookssa.co.za',
      subject: `New Estimate Request - Quote #${quoteNumber} from ${clientInfo.name}`,
      body: adminEmailBody,
      from_name: 'Creative Books SA - Automated Estimate System',
    });

    // Send email to client
    const clientEmailBody = `
Hello ${clientInfo.name},

Thank you for using the Creative Books SA Publishing Calculator!

Your estimate has been generated and is attached to this email.

Quote Number: #${quoteNumber}
Estimated Total: R${total.toLocaleString()}

Our team will review your requirements and send a formal quotation within 24 hours.

If you have any questions in the meantime, please reply to this email or contact us at info@creativebookssa.co.za.

Best regards,
Creative Books SA Team
Johannesburg, South Africa
    `;

    await base44.integrations.Core.SendEmail({
      to: clientInfo.email,
      subject: `Your Publishing Estimate - Quote #${quoteNumber}`,
      body: clientEmailBody,
      from_name: 'Creative Books SA',
    });

    return Response.json({
      success: true,
      message: 'Estimate sent to both client and admin',
      quoteNumber,
    });
  } catch (error) {
    console.error('Error in sendEstimateNotification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});