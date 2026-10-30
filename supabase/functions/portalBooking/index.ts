// Client portal (/portal/<access token>): bookings, cancellations and upload notices.
// The logic lives in _shared/booking-core.ts, shared with projectPortalBooking (/portal/p/<project token>).
import { createClientFromRequest, serve, adminClient } from '../_shared/server.ts';
import { handleBooking } from '../_shared/booking-core.ts';

async function contactForToken(platform: any, token: string) {
  if (!token || token.length > 256) return null;
  const access = (await platform.entities.ClientPortalAccess.filter({ access_token: token }))[0];
  if (!access?.is_active || (access.expires_at && Date.parse(access.expires_at) < Date.now())) return null;
  const { data } = await adminClient().from('contact').select('*').eq('id', access.contact_id).maybeSingle();
  return data ? { ...data.data, id: data.id } : null;
}

serve('portalBooking', async (req) => {
  const platform = createClientFromRequest(req);
  const body = await req.json();
  // Always resolve the client from the portal link itself. (Signed-in staff skip the shared portal
  // check, so we can't rely on it having set contact_id.)
  const contact = await contactForToken(platform, String(body.access_token || body.portal_token || ''));
  if (!contact) return Response.json({ error: 'This portal link is not valid or has expired. Please ask us for a new link.' }, { status: 401 });
  const site = (Deno.env.get('SITE_URL') || 'https://creativebooks.co.za').split(',')[0].trim().replace(/\/$/, '');
  return handleBooking(platform, contact, body, `${site}/portal/${body.access_token}`);
});
