// Project portal (/portal/p/<project token>, the link in Quote to Cash emails):
// collection/delivery booking, consultations, cancellations and upload notices.
// Same logic as portalBooking (see _shared/booking-core.ts); only the way the client is identified differs:
// the project's portal_token → cb_projects → cb_clients. No sign-in; the token is the key, like the portal page itself.
import { adminClient } from '../_shared/server.ts';
import { createEntities } from '../_shared/entities.js';
import { handleBooking } from '../_shared/booking-core.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = ['me', 'services', 'month', 'request', 'mine', 'cancel', 'uploaded'];

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('SITE_URL') || 'https://www.creativebooks.co.za,https://creativebooks.co.za,https://creative-books-sa.vercel.app').split(',').map((v) => v.trim());
  const cors: Record<string, string> = { ...(origin && allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}), 'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
  const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: cors });
  if (origin && !allowed.includes(origin)) return reply({ error: 'Origin not allowed' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  try {
    const text = await req.text();
    if (text.length > 100_000) return reply({ error: 'Request too large' }, 413);
    const body = JSON.parse(text || '{}');
    if (!ACTIONS.includes(body.action)) return reply({ error: 'Unknown action' }, 400);
    const token = String(body.project_token || '');
    if (!UUID.test(token)) return reply({ error: 'Invalid project link' }, 401);

    const db = adminClient();
    const { data: project } = await db.from('cb_projects').select('id,client_id,book_title,title').eq('portal_token', token).maybeSingle();
    if (!project) return reply({ error: 'Invalid project link' }, 401);
    const { data: client } = await db.from('cb_clients').select('id,display_name,first_name,last_name,email,phone').eq('id', project.client_id).maybeSingle();
    if (!client?.email) return reply({ error: 'This project has no client email. Please contact us.' }, 400);
    const contact = { id: client.id, full_name: client.display_name || [client.first_name, client.last_name].filter(Boolean).join(' '), first_name: client.first_name, email: client.email, phone: client.phone };

    if (body.action === 'me') return reply({ first_name: client.first_name || (contact.full_name || '').split(' ')[0] || '', name: contact.full_name });

    const platform = { entities: createEntities(db) };
    const site = (Deno.env.get('SITE_URL') || 'https://creativebooks.co.za').split(',')[0].trim().replace(/\/$/, '');
    const res = await handleBooking(platform, contact, body, `${site}/portal/p/${token}`);
    const headers = new Headers(res.headers); for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(res.body, { status: res.status, headers });
  } catch (error: any) {
    console.error('projectPortalBooking:', error);
    return reply({ error: error?.status ? error.message : 'Something went wrong. Please try again.' }, error?.status || 500);
  }
});
