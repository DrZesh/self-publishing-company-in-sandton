import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('portalMessages', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { action, project_id, contact_id, message, sender_type, attachments } = body;

    // Allow admin or portal access (no user check for portal messages)
    // Admin can send messages, clients send via portal without auth check
    
    // ── LIST MESSAGES FOR PROJECT ─────────────────────────────────────────────
    if (action === 'list') {
      if (!project_id) {
        return Response.json({ error: 'project_id required' }, { status: 400 });
      }
      
      const messages = await platform.asServiceRole.entities.PortalMessage.filter({ 
        project_id 
      }, 'created_date');
      
      return Response.json({ messages });
    }

    // ── SEND MESSAGE ──────────────────────────────────────────────────────────
    if (action === 'send') {
      if (!project_id || !contact_id || !message) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }
      
      const msg = await platform.asServiceRole.entities.PortalMessage.create({
        project_id,
        contact_id,
        sender_type: sender_type || 'client',
        sender_name: sender_type === 'admin' ? 'Creative Books SA Team' : body.sender_name,
        message,
        attachments: attachments || [],
        is_read: sender_type === 'admin' ? false : false,
      });
      
      // Notify admin if client sent message
      if (sender_type === 'client') {
        await platform.entities.MessageLog.create({
          recipient_email: 'info@creativebooks.co.za',
          subject: `New Message from ${body.sender_name || 'Client'}`,
          template_used: 'admin_new_message',
          sent_at: new Date().toISOString(),
          success: true,
        });
      }
      
      return Response.json({ success: true, message: msg });
    }

    // ── ADMIN: REPLY TO MESSAGE ───────────────────────────────────────────────
    if (action === 'admin_reply') {
      const { parent_message_id, reply_message } = body;
      const parentMessages = await platform.asServiceRole.entities.PortalMessage.filter({ id: parent_message_id });
      if (!parentMessages.length) return Response.json({ error: 'Not found' }, { status: 404 });
      
      const parent = parentMessages[0];
      
      await platform.asServiceRole.entities.PortalMessage.create({
        project_id: parent.project_id,
        contact_id: parent.contact_id,
        sender_type: 'admin',
        sender_name: 'Creative Books SA Team',
        message: reply_message,
        parent_message_id: parent_message_id,
        is_read: false,
      });
      
      // Notify client by email
      const contacts = await platform.asServiceRole.entities.Contact.filter({ id: parent.contact_id });
      if (contacts.length) {
        await platform.functions.invoke('sendBrandedEmail', {
          to: contacts[0].email,
          subject: 'Re: Your Message - Creative Books SA',
          template_name: 'message_reply',
          variables: {
            client_name: contacts[0].full_name,
            message: reply_message,
          }
        });
      }
      
      return Response.json({ success: true });
    }

    // ── MARK AS READ ──────────────────────────────────────────────────────────
    if (action === 'mark_read') {
      await platform.asServiceRole.entities.PortalMessage.update(body.message_id, { is_read: true });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});