import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('migrateWorkflows', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    
    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all contacts with pipeline stages
    const contacts = await platform.entities.Contact.filter({
      pipeline_stage: { $exists: true }
    });

    let created = 0;
    let skipped = 0;
    let errors = [];

    // Map pipeline stages to workflow stages
    const stageMap: Record<string, string> = {
      'New Enquiry': 'New Enquiry',
      'Information Requested': 'Reviewed by Admin',
      'Quote in Progress': 'Quote Required',
      'Quote Sent': 'Quote Sent',
      'Payment Pending': 'Invoice Sent',
      'Project Started': 'Payment Received',
      'Editing': 'Project In Progress',
      'Cover Design': 'Project In Progress',
      'Typesetting': 'Project In Progress',
      'Sample Queued': 'Project In Progress',
      'Sample Approved': 'Client Review',
      'Mass Production': 'Ready for Production',
      'Completed': 'Completed',
      'Delivered': 'Completed',
      'Lost': 'Completed',
    };

    // Service type mapping based on package type
    const serviceMap: Record<string, string> = {
      'Full publishing': 'Full Publishing Package',
      'Editing only': 'Book Editing',
      'Cover + layout': 'Cover Design',
      'Typesetting': 'Typesetting',
      'Print run': 'Book Printing',
      'Other': 'Custom Service',
    };

    for (const contact of contacts) {
      try {
        // Check if workflow already exists
        const existing = await platform.entities.ClientWorkflow.filter({ contact_id: contact.id });
        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Determine service type
        const serviceType = serviceMap[contact.package_type || ''] || 'Full Publishing Package';

        // Determine if NDA is required
        const ndaRequiredServices = ['Ghostwriting', 'Full Publishing Package', 'Manuscript Evaluation'];
        const ndaRequired = ndaRequiredServices.includes(serviceType);

        // Determine workflow stage
        const workflowStage = stageMap[contact.pipeline_stage || 'New Enquiry'] || 'New Enquiry';

        // Check if quote exists
        const quotes = await platform.entities.Quote.filter({ contact_id: contact.id });
        const quote = quotes.length > 0 ? quotes[0] : null;

        // Check if invoice exists
        const invoices = await platform.entities.Invoice.filter({ contact_id: contact.id });
        const invoice = invoices.length > 0 ? invoices[0] : null;

        // Determine payment status
        let paymentStatus = 'unpaid';
        if (invoice) {
          if (invoice.status === 'Paid') paymentStatus = 'paid';
          else if (invoice.status === 'Partially Paid') paymentStatus = 'deposit_paid';
          else if (invoice.balance_due < invoice.total) paymentStatus = 'partially_paid';
        }

        // Create workflow
        await platform.entities.ClientWorkflow.create({
          contact_id: contact.id,
          current_stage: workflowStage,
          service_type: serviceType,
          nda_required: ndaRequired,
          quote_id: quote?.id || undefined,
          quote_status: quote?.status || 'not_required',
          invoice_id: invoice?.id || undefined,
          invoice_status: invoice?.status || 'not_required',
          payment_status: paymentStatus,
          payment_received_at: invoice?.paid_at || undefined,
          automation_enabled: true,
          next_action: getNextAction(workflowStage),
          stage_history: [{
            stage: workflowStage,
            entered_at: contact.pipeline_stage_changed_at || contact.created_date,
            changed_by: 'System Migration',
          }],
        });

        created++;
      } catch (err) {
        errors.push({
          contact_id: contact.id,
          contact_name: contact.full_name,
          error: err.message,
        });
      }
    }

    return Response.json({
      success: true,
      created,
      skipped,
      total: contacts.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Migration complete: ${created} workflows created, ${skipped} skipped (already exist)`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getNextAction(stage: string): string {
  const actions: Record<string, string> = {
    'New Enquiry': 'Review enquiry and prepare quote',
    'Reviewed by Admin': 'Prepare quote for client',
    'Quote Required': 'Create and send quote',
    'Quote Sent': 'Await client response',
    'Quote Viewed': 'Follow up with client',
    'Quote Accepted': 'Prepare next steps (NDA or Invoice)',
    'NDA Required': 'Prepare and send NDA',
    'NDA Sent': 'Await NDA signature',
    'NDA Signed': 'Create invoice',
    'Invoice Required': 'Create and send invoice',
    'Invoice Sent': 'Await payment',
    'Payment Pending': 'Follow up on payment',
    'Payment Received': 'Start project production',
    'Project Active': 'Begin work on project',
    'Project In Progress': 'Update client on progress',
    'Client Review': 'Await client feedback',
    'Final Approval': 'Prepare final deliverables',
    'Ready for Production': 'Begin mass production',
    'Completed': 'Archive and follow up',
  };
  return actions[stage] || 'Review next steps';
}