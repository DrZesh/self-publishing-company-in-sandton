import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const messageIds = body.data?.new_message_ids ?? [];

    if (messageIds.length === 0) {
      return Response.json({ skipped: true, reason: 'no new messages' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    let saved = 0;

    for (const messageId of messageIds) {
      // Skip if already captured (idempotent)
      const existing = await base44.asServiceRole.entities.EmailMessage.filter({ external_id: messageId });
      if (existing.length > 0) continue;

      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: authHeader }
      );
      if (!res.ok) continue;
      const message = await res.json();

      // Extract headers
      const headers = message.payload?.headers || [];
      const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('From');
      const subject = getHeader('Subject');
      const date = getHeader('Date');
      const to = getHeader('To');

      // Extract sender email
      const emailMatch = from.match(/<([^>]+)>/) || [null, from.trim()];
      const senderEmail = emailMatch[1]?.trim().toLowerCase() || '';

      // Skip if sent by us (from our own Gmail account)
      const meRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: authHeader });
      if (meRes.ok) {
        const me = await meRes.json();
        if (senderEmail === me.emailAddress?.toLowerCase()) continue;
      }

      // Extract plain text body
      let bodyText = '';
      const extractBody = (part) => {
        if (!part) return;
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyText = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (part.parts) {
          part.parts.forEach(extractBody);
        }
      };
      extractBody(message.payload);

      // Match to a contact by email
      const contacts = await base44.asServiceRole.entities.Contact.filter({ email: senderEmail });
      const contact = contacts[0];

      await base44.asServiceRole.entities.EmailMessage.create({
        contact_id: contact?.id || '',
        direction: 'inbound',
        from_address: senderEmail,
        to_addresses: [to],
        subject: subject || '(no subject)',
        body_text: bodyText,
        body_html: bodyText,
        sent_at: date ? new Date(date).toISOString() : new Date().toISOString(),
        read_status: 'unread',
        status: 'sent',
        external_id: messageId,
      });

      saved++;
    }

    return Response.json({ success: true, saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});