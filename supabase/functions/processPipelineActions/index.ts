import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('processPipelineActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    // This is a scheduled task - run as service role
    const pipelines = await platform.asServiceRole.entities.Pipeline.list('-created_date');
    
    for (const pipeline of pipelines) {
      if (!pipeline.is_active || !pipeline.stages) continue;

      // Get all contacts in this pipeline's stages
      for (const stage of pipeline.stages) {
        if (!stage.suggested_actions || stage.suggested_actions.length === 0) continue;

        // Find contacts in this stage
        const contacts = await platform.asServiceRole.entities.Contact.filter({
          pipeline_stage: stage.name
        });

        for (const contact of contacts) {
          // Check if contact has entered this stage
          const stageEnteredAt = contact.pipeline_stage_changed_at 
            ? new Date(contact.pipeline_stage_changed_at) 
            : new Date(contact.created_date);
          
          const now = new Date();
          const daysInStage = Math.floor((now - stageEnteredAt) / (1000 * 60 * 60 * 24));

          // Check each suggested action
          for (const action of stage.suggested_actions) {
            if (!action.is_active) continue;
            if (daysInStage < action.delay_days) continue;

            // Check if action was already sent
            const existingEmails = await platform.asServiceRole.entities.EmailMessage.filter({
              contact_id: contact.id,
              email_type: action.action_type
            });

            if (existingEmails && existingEmails.length > 0) {
              // Already sent this action
              continue;
            }

            // Execute action
            if (action.action_type === 'send_email' || action.action_type === 'follow_up') {
              try {
                await platform.asServiceRole.functions.invoke('sendFollowUpWithEmailTracking', {
                  action: 'send_followup',
                  contact_id: contact.id,
                  template_id: action.template_id,
                  action_type: action.action_type,
                  delay_days: action.delay_days
                });

                console.log(`Sent ${action.action_name} to ${contact.email}`);
              } catch (error) {
                console.error(`Failed to send email to ${contact.email}:`, error);
              }
            }

            if (action.action_type === 'send_whatsapp') {
              try {
                await platform.asServiceRole.functions.invoke('sendWhatsAppNotification', {
                  to: contact.phone || contact.whatsapp_number,
                  message: `Hi ${contact.full_name}, this is a follow-up on your book project. Please let us know if you have any questions!`
                });
                console.log(`Sent WhatsApp to ${contact.phone}`);
              } catch (error) {
                console.error(`Failed to send WhatsApp to ${contact.phone}:`, error);
              }
            }

            if (action.action_type === 'create_task') {
              try {
                await platform.asServiceRole.entities.Task.create({
                  title: action.action_name,
                  description: `Follow up with ${contact.full_name} regarding ${contact.book_title || 'their project'}`,
                  status: 'todo',
                  priority: 'medium',
                  assigned_to: contact.pipeline_owner
                });
                console.log(`Created task for ${contact.full_name}`);
              } catch (error) {
                console.error(`Failed to create task:`, error);
              }
            }
          }
        }
      }
    }

    return Response.json({ success: true, message: 'Pipeline actions processed' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});