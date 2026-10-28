import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('emailTrackingPixel', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    // This endpoint is called when email tracking pixel loads
    const { searchParams } = new URL(req.url);
    const email_id = searchParams.get('email_id');
    const ip_address = searchParams.get('ip') || 'unknown';
    const user_agent = searchParams.get('ua') || 'unknown';

    if (email_id) {
      // Record email open
      await platform.functions.invoke('sendFollowUpWithEmailTracking', {
        action: 'track_open',
        email_id: email_id,
        ip_address: ip_address,
        user_agent: user_agent
      });
    }

    // Return 1x1 transparent tracking pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Length': '42'
      }
    });
  } catch (error) {
    // Return pixel even on error to avoid breaking email
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif'
      }
    });
  }
});