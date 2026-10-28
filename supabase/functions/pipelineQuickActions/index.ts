import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('pipelineQuickActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, contact_id, template_id } = body;

    if (!contact_id) {
      return Response.json({ error: 'Contact ID required' }, { status: 400 });
    }

    const contacts = await platform.entities.Contact.filter({ id: contact_id });
    if (!contacts || contacts.length === 0) {
      return Response.json({ error: `Entity Contact with ID ${contact_id} not found` }, { status: 404 });
    }
    const contact = contacts[0];
    if (!contact) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Validate user can access this contact
    if (user.role !== 'admin' && contact.created_by_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    switch (action) {
      case 'send_followup_email': {
        const subject = `Following up on your quotation${contact.book_title ? `: ${contact.book_title}` : ''}`;
        const body_html = `
          <p>Dear ${contact.full_name || 'there'},</p>
          <p>I hope you are well.</p>
          <p>We are following up on the quotation we sent for your publishing project${contact.book_title ? ` "${contact.book_title}"` : ''}. Kindly confirm if you have received it and whether you have any questions regarding the services, pricing or next steps.</p>
          <p>Should you wish to proceed, we will guide you through the process and advise on what will be required to begin your project.</p>
          <p>Please note that our quotations are valid for 30 days from the date of issue.</p>
          <p><strong>Would you like to discuss your project with us?</strong> You're welcome to schedule a free consultation at our offices or via video call — whichever works best for you.</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="https://creativebooks.co.za/book" style="display: inline-block; background-color: #B87333; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Book Your Free Consultation</a>
          </p>
          <p style="font-size: 12px; color: #666;">Choose between an in-person meeting at our Johannesburg office or a virtual consultation via video call.</p>
          <p>Warm regards,<br/>Creative Books SA<br/>084 230 5393 | 010 500 3331</p>
        `;
        
        await platform.functions.invoke('sendBrandedEmail', {
          to: contact.email,
          subject,
          htmlBody: body_html,
        });

        // Record follow-up sent and reset response tracking
        await platform.entities.Contact.update(contact.id, {
          last_followup_sent_at: new Date().toISOString(),
          followup_response_received: false,
          followup_response_received_at: null,
        });

        await platform.entities.ActivityLog.create({
          entity_type: 'contact',
          entity_id: contact.id,
          action: 'email_sent',
          actor_id: user.id,
          description: 'Follow-up email sent from pipeline quick action',
          metadata: { contact_id: contact.id, action_type: 'followup' }
        });

        return Response.json({ success: true, message: 'Follow-up email sent' });
      }

      case 'mark_followup_response': {
        await platform.entities.Contact.update(contact.id, {
          followup_response_received: true,
          followup_response_received_at: new Date().toISOString(),
        });

        await platform.entities.ActivityLog.create({
          entity_type: 'contact',
          entity_id: contact.id,
          action: 'followup_response',
          actor_id: user.id,
          description: 'Follow-up response marked as received',
          metadata: { contact_id: contact.id, action_type: 'response' }
        });

        return Response.json({ success: true, message: 'Response recorded' });
      }

      case 'send_welcome_email': {
        const subject = `Welcome to Creative Books SA${contact.book_title ? ` - ${contact.book_title}` : ''}`;
        const body_html = `
          <p>Dear ${contact.full_name || 'there'},</p>
          <p>Thank you for your interest in Creative Books SA! We're excited to help you publish your book${contact.book_title ? ` "${contact.book_title}"` : ''}.</p>
          <p>Our team specializes in full-service publishing including:</p>
          <ul>
            <li>Professional editing and proofreading</li>
            <li>Custom cover design</li>
            <li>Typesetting and layout</li>
            <li>Printing and distribution</li>
            <li>ISBN registration</li>
          </ul>
          <p>Would you be available for a discovery call this week? We'd love to learn more about your project.</p>
          <p>Warm regards,<br/>Creative Books SA<br/>084 230 5393</p>
        `;

        await platform.functions.invoke('sendBrandedEmail', {
          to: contact.email,
          subject,
          htmlBody: body_html,
        });

        await platform.entities.Contact.update(contact.id, {
          welcome_email_sent_at: new Date().toISOString(),
        });

        await platform.entities.ActivityLog.create({
          entity_type: 'contact',
          entity_id: contact.id,
          action: 'email_sent',
          actor_id: user.id,
          description: 'Welcome email sent from pipeline quick action',
          metadata: { contact_id: contact.id, action_type: 'welcome' }
        });

        return Response.json({ success: true, message: 'Welcome email sent' });
      }

      case 'send_whatsapp': {
        const number = contact.whatsapp_number || contact.phone;
        if (!number) {
          return Response.json({ error: 'No WhatsApp number available' }, { status: 400 });
        }

        const message = `Hi ${contact.full_name || 'there'}! This is Creative Books SA. Regarding your publishing project${contact.book_title ? ` "${contact.book_title}"` : ''} - how are you doing? Would you like to chat about next steps? 📚`;

        await platform.functions.invoke('sendWhatsAppNotification', {
          to_number: number,
          message,
          contact_id: contact.id,
          type: 'Pipeline Quick Action',
        });

        await platform.entities.ActivityLog.create({
          entity_type: 'contact',
          entity_id: contact.id,
          action: 'whatsapp_sent',
          actor_id: user.id,
          description: 'Quick action WhatsApp sent',
          metadata: { contact_id: contact.id, action_type: 'whatsapp' }
        });

        return Response.json({ success: true, message: 'WhatsApp sent' });
      }

      case 'move_to_quote': {
        await platform.entities.Contact.update(contact_id, {
          pipeline_stage: 'Quote Sent',
          pipeline_stage_changed_at: new Date().toISOString(),
        });

        await platform.entities.ActivityLog.create({
          entity_type: 'contact',
          entity_id: contact.id,
          action: 'stage_changed',
          actor_id: user.id,
          description: 'Moved to Quote Sent stage via quick action',
          metadata: { contact_id: contact.id, new_stage: 'Quote Sent' }
        });

        return Response.json({ success: true, message: 'Moved to Quote Sent' });
      }

      case 'move_to_project': {
        await platform.entities.Contact.update(contact_id, {
          pipeline_stage: 'Project Started',
          pipeline_stage_changed_at: new Date().toISOString(),
        });

        await platform.entities.ActivityLog.create({
          entity_type: 'contact',
          entity_id: contact.id,
          action: 'stage_changed',
          actor_id: user.id,
          description: 'Moved to Project Started via quick action',
          metadata: { contact_id: contact.id, new_stage: 'Project Started' }
        });

        return Response.json({ success: true, message: 'Moved to Project Started' });
      }

      case 'schedule_call': {
        // Create a task for scheduling a call
        await platform.entities.Task.create({
          title: `Call ${contact.full_name} - ${contact.book_title || 'Book project'}`,
          description: `Follow up on publishing project. Contact: ${contact.email}${contact.phone ? ` | ${contact.phone}` : ''}`,
          status: 'todo',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          created_by_id: user.id,
        });

        await platform.entities.ActivityLog.create({
          entity_type: 'contact',
          entity_id: contact.id,
          action: 'task_created',
          actor_id: user.id,
          description: 'Call scheduled via quick action',
          metadata: { contact_id: contact.id, task_type: 'call' }
        });

        return Response.json({ success: true, message: 'Call task created for tomorrow' });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pipeline quick action error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});