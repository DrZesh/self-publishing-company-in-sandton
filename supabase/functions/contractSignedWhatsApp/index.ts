import { serve } from '../_shared/server.ts';
const WHATSAPP_NUMBER = Deno.env.get('WHATSAPP_NOTIFY_NUMBER') || '';
const CALLMEBOT_API_KEY = Deno.env.get('CALLMEBOT_API_KEY') || '';

serve('contractSignedWhatsApp', async (req) => {
  try {
    const body = await req.json();
    const contract = body.data || {};

    const message = `✍️ *Contract Signed*

*Title:* ${contract.title || 'Unknown'}
*Type:* ${contract.document_type || 'Contract'}
*Book:* ${contract.book_title || 'N/A'}
*Signed By:* ${contract.signer_name || 'Client'}
*Status:* ✅ ${contract.status}

View: https://creative-books-sa.vercel.app/admin/contracts`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;
    
    const response = await fetch(url, { method: 'GET' });
    
    if (!response.ok) {
      const err = await response.text();
      console.error('WhatsApp notification failed:', err);
      throw new Error(`WhatsApp failed: ${err}`);
    }

    console.log('Contract signed WhatsApp notification sent successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('contractSignedWhatsApp error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});