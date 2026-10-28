import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('syncPipelineDealToContact', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    // Verify admin access
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id, action } = await req.json();

    if (!deal_id) {
      return Response.json({ error: 'deal_id required' }, { status: 400 });
    }

    // Fetch PipelineDeal
    const deals = await platform.entities.PipelineDeal.filter({ id: deal_id });
    if (!deals || deals.length === 0) {
      return Response.json({ error: 'PipelineDeal not found' }, { status: 404 });
    }
    const deal = deals[0];

    // Find Contact by email
    const contacts = await platform.entities.Contact.filter({ 
      email: deal.client_email 
    });

    if (!contacts || contacts.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No matching Contact found for this deal', 
        synced: false 
      });
    }

    const contact = contacts[0];

    // Map PipelineDeal stage_key to Contact pipeline_stage
    const reverseStageMapping = {
      'enquiry': 'New Enquiry',
      'contacted': 'Reviewed by Admin',
      'quote_required': 'Quote Required',
      'quote_sent': 'Quote Sent',
      'quote_viewed': 'Quote Viewed',
      'won': 'Quote Accepted',
      'contract_required': 'NDA Required',
      'contract_sent': 'NDA Sent',
      'contract_signed': 'NDA Signed',
      'invoice_required': 'Invoice Required',
      'invoice_sent': 'Invoice Sent',
      'payment_pending': 'Payment Pending',
      'lost': 'Lost'
    };

    const pipelineStage = reverseStageMapping[deal.stage_key] || 'New Enquiry';

    // Update Contact
    await platform.entities.Contact.update(contact.id, {
      pipeline_stage: pipelineStage,
      pipeline_stage_changed_at: new Date().toISOString(),
      pipeline_value: deal.deal_value || contact.pipeline_value,
      pipeline_owner: deal.assigned_team_member || contact.pipeline_owner,
      _linked_pipeline_deal_id: deal.id
    });

    // If deal is won, create Project
    if (deal.stage_key === 'won' && !contact._linked_project_id) {
      try {
        const project = await platform.entities.Project.create({
          contact_id: contact.id,
          book_title: deal.project_title || contact.book_title || 'New Project',
          service_type: deal.service_type || 'Full Publishing Package',
          stage: 'Project Active',
          project_value: deal.deal_value || 0,
          payment_status: 'Unpaid',
          automation_enabled: true
        });

        await platform.entities.Contact.update(contact.id, {
          _linked_project_id: project.id,
          pipeline_stage: 'Project Active',
          pipeline_stage_changed_at: new Date().toISOString()
        });

        await platform.entities.PipelineDeal.update(deal.id, {
          linked_project_id: project.id,
          project_created_at: new Date().toISOString(),
          project_created_by: user.email
        });

        return Response.json({ 
          success: true, 
          message: 'Contact updated and Project created', 
          synced: true,
          project_id: project.id
        });
      } catch (projError) {
        console.error('Failed to create project:', projError);
        // Don't fail the whole operation if project creation fails
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Contact updated from PipelineDeal', 
      synced: true 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});