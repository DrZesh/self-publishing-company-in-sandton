import { serve } from '../_shared/server.ts';
const WHATSAPP_NUMBER = Deno.env.get('WHATSAPP_NOTIFY_NUMBER') || '';
const CALLMEBOT_API_KEY = Deno.env.get('CALLMEBOT_API_KEY') || '';

serve('documentSignedWhatsApp', async (req) => {
  try {
    const body = await req.json();
    const doc = body.data || {};

    const message = `📄 *Document Signed*

*Name:* ${doc.file_name || 'Unknown'}
*Category:* ${doc.category || 'General'}
*Book:* ${doc.book_title || 'N/A'}
*Status:* ✅ ${doc.status}

View: https://creativebooks.co.za/admin/documents`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;
    
    const response = await fetch(url, { method: 'GET' });
    
    if (!response.ok) {
      const err = await response.text();
      console.error('WhatsApp notification failed:', err);
      throw new Error(`WhatsApp failed: ${err}`);
    }

    console.log('Document signed WhatsApp notification sent successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('documentSignedWhatsApp error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});