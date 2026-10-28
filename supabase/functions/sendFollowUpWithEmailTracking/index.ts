import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('sendFollowUpWithEmailTracking', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, contact_id, quote_id, template_id, action_type, delay_days } = await req.json();

    // SEND follow-up email
    if (action === 'send_followup') {
      const contacts = await platform.entities.Contact.filter({ id: contact_id });
      if (!contacts || contacts.length === 0) {
        return Response.json({ error: 'Contact not found' }, { status: 404 });
      }
      const contact = contacts[0];

      // Get email template
      let template;
      if (template_id) {
        const templates = await platform.entities.MessageTemplate.filter({ id: template_id });
        if (templates && templates.length > 0) {
          template = templates[0];
        }
      }

      if (!template) {
        // Default follow-up template
        template = {
          subject: `Following up on your quote - {{contact.full_name}}`,
          body_html: `<p>Hi {{contact.full_name}},</p><p>I hope this email finds you well. I wanted to follow up on the quote we sent for your book project.</p><p>If you have any questions or would like to discuss further, please don't hesitate to reach out.</p><p>Best regards,<br>Creative Books SA Team</p>`
        };
      }

      // Replace placeholders
      let subject = template.subject.replace('{{contact.full_name}}', contact.full_name);
      let body = template.body_html
        .replace(/{{contact\.full_name}}/g, contact.full_name)
        .replace(/{{contact\.email}}/g, contact.email)
        .replace(/{{contact\.book_title}}/g, contact.book_title || 'your project');

      // Send email
      const emailData = {
        to: contact.email,
        subject: subject,
        body: body,
        track_opens: true,
        track_clicks: true
      };

      const res = await platform.functions.invoke('sendBrandedEmail', emailData);
      
      if (!res.data?.success) {
        return Response.json({ error: res.data?.error || 'Failed to send email' }, { status: 500 });
      }

      // Create EmailMessage record for tracking
      const emailMessage = await platform.entities.EmailMessage.create({
        contact_id: contact_id,
        quote_id: quote_id || null,
        template_id: template_id || null,
        subject: subject,
        body: body,
        sent_at: new Date().toISOString(),
        sent_by: user.email,
        email_type: action_type || 'follow_up',
        status: 'sent',
        opened: false,
        opened_at: null,
        clicked: false,
        clicked_at: null
      });

      // Update contact's last follow-up
      await platform.entities.Contact.update(contact_id, {
        last_followup_sent_at: new Date().toISOString(),
        followup_response_received: false
      });

      // Log in ServiceEmailLog
      await platform.entities.ServiceEmailLog.create({
        contact_id: contact_id,
        email_type: action_type || 'follow_up',
        sent_at: new Date().toISOString(),
        template_used: template_id,
        opened: false,
        clicked: false,
        opened_at: null,
        clicked_at: null
      });

      return Response.json({ 
        success: true, 
        message: 'Follow-up email sent',
        email_id: emailMessage.id,
        tracking_enabled: true
      });
    }

    // RECORD email open
    if (action === 'track_open') {
      const { email_id, ip_address, user_agent } = await req.json();
      
      if (email_id) {
        const emails = await platform.entities.EmailMessage.filter({ id: email_id });
        if (emails && emails.length > 0) {
          await platform.entities.EmailMessage.update(email_id, {
            opened: true,
            opened_at: new Date().toISOString(),
            last_opened_ip: ip_address,
            user_agent: user_agent
          });

          // Update ServiceEmailLog
          const logs = await platform.entities.ServiceEmailLog.filter({ 
            contact_id: emails[0].contact_id 
          });
          if (logs && logs.length > 0) {
            await platform.entities.ServiceEmailLog.update(logs[0].id, {
              opened: true,
              opened_at: new Date().toISOString()
            });
          }

          // Update Contact
          await platform.entities.Contact.update(emails[0].contact_id, {
            followup_response_received: true,
            followup_response_received_at: new Date().toISOString()
          });
        }
      }

      // Return tracking pixel
      return new Response('', {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // RECORD link click
    if (action === 'track_click') {
      const { email_id, link_url, ip_address, user_agent } = await req.json();
      
      if (email_id) {
        await platform.entities.EmailMessage.update(email_id, {
          clicked: true,
          clicked_at: new Date().toISOString(),
          clicked_link: link_url,
          last_clicked_ip: ip_address,
          user_agent: user_agent
        });

        const logs = await platform.entities.ServiceEmailLog.filter({ 
          contact_id: (await platform.entities.EmailMessage.filter({ id: email_id }))[0]?.contact_id 
        });
        if (logs && logs.length > 0) {
          await platform.entities.ServiceEmailLog.update(logs[0].id, {
            clicked: true,
            clicked_at: new Date().toISOString()
          });
        }
      }

      return Response.json({ success: true });
    }

    // GET email tracking stats
    if (action === 'get_tracking_stats') {
      const { contact_id } = await req.json();
      
      const emails = await platform.entities.EmailMessage.filter({ contact_id });
      const stats = {
        total_sent: emails.length,
        total_opened: emails.filter(e => e.opened).length,
        total_clicked: emails.filter(e => e.clicked).length,
        open_rate: emails.length > 0 ? (emails.filter(e => e.opened).length / emails.length * 100).toFixed(1) : 0,
        click_rate: emails.length > 0 ? (emails.filter(e => e.clicked).length / emails.length * 100).toFixed(1) : 0,
        recent_emails: emails.slice(-5).map(e => ({
          id: e.id,
          subject: e.subject,
          sent_at: e.sent_at,
          opened: e.opened,
          opened_at: e.opened_at,
          clicked: e.clicked,
          clicked_at: e.clicked_at,
          email_type: e.email_type
        }))
      };

      return Response.json({ stats });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});