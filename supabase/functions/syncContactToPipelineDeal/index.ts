import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('syncContactToPipelineDeal', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    // Verify admin access
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contact_id, action } = await req.json();

    if (!contact_id) {
      return Response.json({ error: 'contact_id required' }, { status: 400 });
    }

    // Fetch contact
    const contacts = await platform.entities.Contact.filter({ id: contact_id });
    if (!contacts || contacts.length === 0) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }
    const contact = contacts[0];

    // Skip if contact is not in an active pipeline stage
    const activeStages = ['New Enquiry', 'Reviewed by Admin', 'Quote Required', 'Quote Sent', 'Quote Viewed', 'Quote Accepted', 'NDA Required', 'NDA Sent', 'NDA Signed', 'Invoice Required', 'Invoice Sent', 'Payment Pending'];
    if (!activeStages.includes(contact.pipeline_stage)) {
      return Response.json({ success: true, message: 'Contact not in active pipeline stage', synced: false });
    }

    // Find existing PipelineDeal by client_email
    const existingDeals = await platform.entities.PipelineDeal.filter({ 
      client_email: contact.email 
    });

    // Map Contact pipeline_stage to PipelineDeal stage_key
    const stageMapping = {
      'New Enquiry': 'enquiry',
      'Reviewed by Admin': 'contacted',
      'Quote Required': 'quote_required',
      'Quote Sent': 'quote_sent',
      'Quote Viewed': 'quote_viewed',
      'Quote Accepted': 'won',
      'NDA Required': 'contract_required',
      'NDA Sent': 'contract_sent',
      'NDA Signed': 'contract_signed',
      'Invoice Required': 'invoice_required',
      'Invoice Sent': 'invoice_sent',
      'Payment Pending': 'payment_pending',
      'Payment Received': 'won',
      'Project Active': 'won',
      'Completed': 'won',
      'Lost': 'lost',
      'Ghosted': 'lost'
    };

    const stageKey = stageMapping[contact.pipeline_stage] || 'enquiry';

    if (existingDeals && existingDeals.length > 0) {
      // Update existing deal
      const deal = existingDeals[0];
      
      // Don't update if deal is already won/lost
      if (['won', 'lost'].includes(deal.stage_key) && !['won', 'lost'].includes(stageKey)) {
        return Response.json({ success: true, message: 'Deal already closed', synced: false });
      }

      await platform.entities.PipelineDeal.update(deal.id, {
        client_name: contact.full_name,
        client_email: contact.email,
        client_phone: contact.phone || '',
        deal_value: contact.pipeline_value || 0,
        stage_key: stageKey,
        service_type: contact.book_title ? `Book: ${contact.book_title}` : (contact.package_type || ''),
        notes: `Synced from Contact pipeline (${contact.pipeline_stage})\n${deal.notes || ''}`,
        assigned_team_member: contact.pipeline_owner || '',
        won_at: stageKey === 'won' ? new Date().toISOString() : deal.won_at,
        lost_at: stageKey === 'lost' ? new Date().toISOString() : deal.lost_at,
      });

      return Response.json({ 
        success: true, 
        message: 'PipelineDeal updated', 
        synced: true,
        deal_id: deal.id,
        action: 'update'
      });
    } else {
      // Create new PipelineDeal
      const newDeal = await platform.entities.PipelineDeal.create({
        client_name: contact.full_name,
        client_email: contact.email,
        client_phone: contact.phone || '',
        deal_value: contact.pipeline_value || 0,
        stage_key: stageKey,
        service_type: contact.book_title ? `Book: ${contact.book_title}` : (contact.package_type || ''),
        notes: `Auto-created from Contact pipeline (${contact.pipeline_stage})\nSource: ${contact.deal_source || 'Website enquiry'}`,
        assigned_team_member: contact.pipeline_owner || '',
        pipeline_id: '6a1d748cbe0fd29105a8255b', // Default pipeline
        won_at: stageKey === 'won' ? new Date().toISOString() : null,
        lost_at: stageKey === 'lost' ? new Date().toISOString() : null,
      });

      // Link contact to deal
      await platform.entities.Contact.update(contact_id, {
        _linked_pipeline_deal_id: newDeal.id
      });

      return Response.json({ 
        success: true, 
        message: 'PipelineDeal created', 
        synced: true,
        deal_id: newDeal.id,
        action: 'create'
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});