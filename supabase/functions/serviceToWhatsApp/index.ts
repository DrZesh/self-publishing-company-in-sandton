import { serve } from '../_shared/server.ts';
const WHATSAPP_NUMBER = Deno.env.get('WHATSAPP_NOTIFY_NUMBER') || '';
const CALLMEBOT_API_KEY = Deno.env.get('CALLMEBOT_API_KEY') || '';

serve('serviceToWhatsApp', async (req) => {
  try {
    const body = await req.json();
    const service = body.data || {};

    const message = `📋 *New Service Created*

*Service:* ${service.serviceName || 'Unknown'}
*Category:* ${(service.category || 'General').charAt(0).toUpperCase() + (service.category || '').slice(1)}
*Pricing:* ${service.pricingType ? service.pricingType.replace(/_/g, ' ') : 'N/A'}
${service.price ? `*Price:* R${service.price.toFixed(2)}` : ''}
${service.basePrice ? `*Base Price:* R${service.basePrice.toFixed(2)}` : ''}
*Status:* ${service.active !== false ? '✅ Active' : '❌ Inactive'}

View in dashboard: https://creative-books-sa.vercel.app/admin/services`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;
    
    const response = await fetch(url, { method: 'GET' });
    
    if (!response.ok) {
      const err = await response.text();
      console.error('WhatsApp notification failed:', err);
      throw new Error(`WhatsApp failed: ${err}`);
    }

    console.log('WhatsApp notification sent successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('serviceToWhatsApp error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});