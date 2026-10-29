import { serve } from '../_shared/server.ts';
const WHATSAPP_NUMBER = Deno.env.get('WHATSAPP_NOTIFY_NUMBER') || '';
const CALLMEBOT_API_KEY = Deno.env.get('CALLMEBOT_API_KEY') || '';

serve('clientMessageWhatsApp', async (req) => {
  try {
    const body = await req.json();
    const message = body.data || {};

    // Only notify for client messages
    if (message.sender_type !== 'client') {
      return Response.json({ skipped: true, reason: 'Not a client message' });
    }

    const msgText = message.message || 'New message';
    const truncatedMsg = msgText.length > 80 ? msgText.substring(0, 80) + '...' : msgText;

    const whatsappMsg = `💬 *New Client Message*

*From:* ${message.sender_name || 'Client'}
*Message:* ${truncatedMsg}

View: https://creative-books-sa.vercel.app/admin/chat`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(whatsappMsg)}&apikey=${CALLMEBOT_API_KEY}`;
    
    const response = await fetch(url, { method: 'GET' });
    
    if (!response.ok) {
      const err = await response.text();
      console.error('WhatsApp notification failed:', err);
      throw new Error(`WhatsApp failed: ${err}`);
    }

    console.log('Client message WhatsApp notification sent successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('clientMessageWhatsApp error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});