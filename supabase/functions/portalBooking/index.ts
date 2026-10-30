// Client portal: book a collection or delivery time, cancel it, and tell the team about uploads.
// Bookings are saved in the same `appointment` table as every other appointment, as "pending",
// so they appear in the CRM's Appointments calendar for approval. Approve / decline / move are
// handled by the existing appointmentActions function, which emails the client.
//
// Actions (all need the client's portal access_token; the shared server checks it):
//   month    { kind, from, to }                      → { days: { 'YYYY-MM-DD': [{ start, end, remaining }] } }
//   request  { kind, date, start_time, address, note } → creates a pending appointment, emails team + client
//   mine     {}                                       → the client's collection/delivery bookings
//   cancel   { appointment_id }                       → client cancels their own booking, emails team
//   uploaded { file_url, file_name, purpose, note }   → records the upload, emails the team with the file attached
import { createClientFromRequest, serve, adminClient } from '../_shared/server.ts';
import { required } from '../_shared/integrations.ts';

const TZ_OFFSET = '+02:00'; // South Africa has no daylight saving
const HORIZON_DAYS = 60;
const KINDS: Record<string, { service: string; slots: (open: string, close: string) => Array<[string, string]>; capacity: number }> = {
  // One-hour collection slots inside opening hours, two clients per slot
  collection: { service: 'Book collection', capacity: 2, slots: (open, close) => hourly(open, close, 60) },
  // Morning / afternoon courier windows inside opening hours, four deliveries per window
  delivery: { service: 'Book delivery', capacity: 4, slots: (open, close) => halves(open, close) },
};
// South African public holidays (observed), 2026–2027
const HOLIDAYS: Record<string, string> = {
  '2026-01-01': "New Year's Day", '2026-03-21': 'Human Rights Day', '2026-04-03': 'Good Friday', '2026-04-06': 'Family Day',
  '2026-04-27': 'Freedom Day', '2026-05-01': "Workers' Day", '2026-06-16': 'Youth Day', '2026-08-10': "National Women's Day",
  '2026-09-24': 'Heritage Day', '2026-12-16': 'Day of Reconciliation', '2026-12-25': 'Christmas Day', '2026-12-26': 'Day of Goodwill',
  '2027-01-01': "New Year's Day", '2027-03-22': 'Human Rights Day', '2027-03-26': 'Good Friday', '2027-03-29': 'Family Day',
  '2027-04-27': 'Freedom Day', '2027-05-01': "Workers' Day", '2027-06-16': 'Youth Day', '2027-08-09': "National Women's Day",
  '2027-09-24': 'Heritage Day', '2027-12-16': 'Day of Reconciliation', '2027-12-25': 'Christmas Day', '2027-12-27': 'Day of Goodwill',
};
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const mins = (t: string) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const hhmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
function hourly(open: string, close: string, len: number): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (let t = mins(open); t + len <= mins(close); t += len) out.push([hhmm(t), hhmm(t + len)]);
  return out;
}
function halves(open: string, close: string): Array<[string, string]> {
  const a = mins(open), b = mins(close);
  if (b - a < 120) return [[open, close]];
  const mid = a + Math.round((b - a) / 120) * 60;
  return [[hhmm(a), hhmm(mid)], [hhmm(mid), hhmm(b)]];
}
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const sastToday = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10);
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const fmtDate = (d: string) => new Date(`${d}T12:00:00${TZ_OFFSET}`).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' });
const fmtTime = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

const ADMIN_EMAIL = () => Deno.env.get('ADMIN_EMAIL') || 'info@creativebooks.co.za';
const SITE = () => (Deno.env.get('SITE_URL') || 'https://creativebooks.co.za').split(',')[0].trim().replace(/\/$/, '');

async function mail(to: string, subject: string, html: string, attachments?: Array<{ filename: string; content: string }>) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) { console.warn('portalBooking: RESEND_API_KEY not set, email skipped:', subject); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('EMAIL_FROM') || 'Creative Books SA <info@creativebooks.co.za>', to, subject, html, ...(attachments?.length ? { attachments } : {}) }),
  });
  if (!res.ok) console.error('portalBooking email failed:', res.status, await res.text());
}
function shell(title: string, rows: Array<[string, string]>, intro: string, button?: { href: string; label: string }) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2C2C2C">
  <div style="background:#1A2B4A;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0"><div style="font-size:12px;letter-spacing:2px;color:#D4A574">CREATIVE BOOKS SA</div><div style="font-size:20px;font-weight:bold;margin-top:6px">${esc(title)}</div></div>
  <div style="border:1px solid #E5E0D5;border-top:0;border-radius:0 0 12px 12px;padding:22px 24px">
  <p style="font-size:15px;line-height:1.5;margin:0 0 16px">${intro}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:8px 10px;border-bottom:1px solid #F0EBE3;font-weight:bold;width:38%">${esc(k)}</td><td style="padding:8px 10px;border-bottom:1px solid #F0EBE3">${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>
  ${button ? `<p style="margin:22px 0 0"><a href="${button.href}" style="background:#B87333;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;display:inline-block">${esc(button.label)}</a></p>` : ''}
  </div></div>`;
}

async function availability(platform: any, kind: string, from: string, to: string) {
  const k = KINDS[kind]; if (!k) throw Object.assign(new Error('Choose collection or delivery'), { status: 400 });
  const rules = await platform.entities.AvailabilityRule.list();
  const notice = Number(rules.find((r: any) => r.weekday === 'Monday')?.min_notice_hours ?? 24);
  const earliest = Date.now() + notice * 3600e3;
  const today = sastToday();
  const last = new Date(`${today}T12:00:00Z`); last.setUTCDate(last.getUTCDate() + HORIZON_DAYS);
  const start = from > today ? from : today, end = to < ymd(last) ? to : ymd(last);
  if (start > end) return {};
  const booked = (await platform.entities.Appointment.filter({ service_name: k.service }))
    .filter((a: any) => ['pending', 'approved'].includes(a.status) && a.date >= start && a.date <= end);
  const days: Record<string, Array<{ start: string; end: string; remaining: number }>> = {};
  for (let d = new Date(`${start}T12:00:00Z`); ymd(d) <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = ymd(d);
    if (HOLIDAYS[day]) continue;
    const rule = rules.find((r: any) => r.weekday === WEEKDAYS[d.getUTCDay()]);
    if (!rule?.is_open || !rule.start_time || !rule.end_time) continue;
    const list = k.slots(rule.start_time, rule.end_time)
      .filter(([s]) => new Date(`${day}T${s}:00${TZ_OFFSET}`).getTime() > earliest)
      .map(([s, e]) => ({ start: s, end: e, remaining: k.capacity - booked.filter((a: any) => a.date === day && mins(a.start_time) < mins(e) && mins(a.end_time || a.start_time) > mins(s)).length }));
    if (list.length) days[day] = list;
  }
  return days;
}

// Attach the uploaded file (max ~10 MB) by resolving the platform-file link to its storage path
async function attachmentFor(fileUrl: string, name: string) {
  try {
    const url = new URL(fileUrl);
    if (url.origin !== new URL(required('SUPABASE_URL')).origin || url.pathname !== '/functions/v1/platform-file') return null;
    const client = adminClient();
    const { data: path } = await client.rpc('cb_file_lookup', { capability: url.searchParams.get('token') });
    if (!path) return null;
    const file = await client.storage.from('documents').download(path);
    if (file.error || file.data.size > 10 * 1024 * 1024) return null;
    const bytes = new Uint8Array(await file.data.arrayBuffer());
    let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { filename: name || path.split('/').pop(), content: btoa(bin) };
  } catch (e) { console.error('attachment', e); return null; }
}

serve('portalBooking', async (req) => {
  const platform = createClientFromRequest(req);
  const body = await req.json();
  const contact = await platform.entities.Contact.get(body.contact_id); // set and verified by the shared portal check
  const name = contact.full_name || [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.email;
  const portalLink = `${SITE()}/portal/${body.access_token}`;
  const crmLink = `${SITE()}/admin/appointments`;

  if (body.action === 'month') {
    return Response.json({ days: await availability(platform, body.kind, String(body.from || ''), String(body.to || '')) });
  }

  if (body.action === 'mine') {
    const mine = (await platform.entities.Appointment.filter({ client_email: contact.email }))
      .filter((a: any) => Object.values(KINDS).some((k) => k.service === a.service_name))
      .sort((a: any, b: any) => `${b.date}${b.start_time}`.localeCompare(`${a.date}${a.start_time}`));
    return Response.json({ bookings: mine.map((a: any) => ({ id: a.id, kind: a.service_name === KINDS.delivery.service ? 'delivery' : 'collection', date: a.date, start_time: a.start_time, end_time: a.end_time, status: a.status, client_note: a.client_note, decline_reason: a.decline_reason, proposed_date: a.proposed_date, proposed_start_time: a.proposed_start_time })) });
  }

  if (body.action === 'request') {
    const kind = String(body.kind), k = KINDS[kind];
    const date = String(body.date || ''), start = String(body.start_time || '');
    const address = String(body.address || '').trim().slice(0, 500), note = String(body.note || '').trim().slice(0, 1000);
    if (!k) return Response.json({ error: 'Choose collection or delivery' }, { status: 400 });
    if (kind === 'delivery' && address.length < 6) return Response.json({ error: 'Please enter the delivery address' }, { status: 400 });
    const slot = (await availability(platform, kind, date, date))[date]?.find((s) => s.start === start);
    if (!slot) return Response.json({ error: 'That time is no longer available. Please pick another.' }, { status: 409 });
    if (slot.remaining <= 0) return Response.json({ error: 'That time has just been fully booked. Please pick another.' }, { status: 409 });

    // A new request replaces the client's previous open request of the same kind
    const open = (await platform.entities.Appointment.filter({ client_email: contact.email, service_name: k.service })).filter((a: any) => a.status === 'pending');
    for (const a of open) await platform.entities.Appointment.update(a.id, { status: 'cancelled', cancelled_at: new Date().toISOString(), decline_reason: 'Replaced by a new request from the client portal' });

    const token = () => crypto.randomUUID().replaceAll('-', '');
    const clientNote = [kind === 'delivery' ? `Delivery address: ${address}` : 'Collecting at the Creative Books SA office', note && `Note: ${note}`].filter(Boolean).join('\n');
    const appt = await platform.entities.Appointment.create({
      client_name: name, client_email: contact.email, client_phone: contact.phone || '', linked_client_id: contact.id,
      service_name: k.service, service_id: null, service_duration_minutes: mins(slot.end) - mins(slot.start),
      date, start_time: slot.start, end_time: slot.end, mode: 'on_site', status: 'pending', client_note: clientNote,
      cancel_token: token(), reschedule_token: token(), created_by_id: null, is_sample: false,
    });

    const when = `${fmtDate(date)}, ${fmtTime(slot.start)} – ${fmtTime(slot.end)}`;
    const rows: Array<[string, string]> = [['Client', name], ['Email', contact.email], ['Phone', contact.phone || '—'], ['Type', kind === 'delivery' ? 'Delivery' : 'Collection'], ['Requested time', when], ...(kind === 'delivery' ? [['Address', address] as [string, string]] : []), ...(note ? [['Note', note] as [string, string]] : [])];
    await mail(ADMIN_EMAIL(), `New ${kind} request: ${name}, ${fmtDate(date)}`, shell(`New ${kind} request`, rows, `${esc(name)} has asked for a book ${kind} time. Please approve, decline or move it.`, { href: crmLink, label: 'Open Appointments' }));
    await mail(contact.email, `We've received your ${kind} request`, shell(`${kind === 'delivery' ? 'Delivery' : 'Collection'} request received`, [['Requested time', when], ...(kind === 'delivery' ? [['Address', address] as [string, string]] : [['Where', 'Creative Books SA office'] as [string, string]])], `Hi ${esc(name.split(' ')[0])}, thank you. Our team will confirm this time shortly and you'll get an email either way.`, { href: portalLink, label: 'View in your portal' }));
    return Response.json({ success: true, booking: { id: appt.id, date, start_time: slot.start, end_time: slot.end, status: 'pending' } });
  }

  if (body.action === 'cancel') {
    const a = await platform.entities.Appointment.get(body.appointment_id); // ownership checked by the shared portal check
    if (!Object.values(KINDS).some((k) => k.service === a.service_name)) return Response.json({ error: 'Only collection and delivery bookings can be cancelled here' }, { status: 400 });
    if (!['pending', 'approved'].includes(a.status)) return Response.json({ error: 'This booking is already closed' }, { status: 400 });
    await platform.entities.Appointment.update(a.id, { status: 'cancelled', cancelled_at: new Date().toISOString() });
    await mail(ADMIN_EMAIL(), `Cancelled by client: ${a.service_name}, ${name}`, shell('Booking cancelled by the client', [['Client', name], ['Booking', a.service_name], ['Was', `${fmtDate(a.date)}, ${fmtTime(a.start_time)}`]], `${esc(name)} cancelled this booking from the client portal.`, { href: crmLink, label: 'Open Appointments' }));
    return Response.json({ success: true });
  }

  if (body.action === 'uploaded') {
    const fileUrl = String(body.file_url || ''), fileName = String(body.file_name || 'file').slice(0, 200);
    const purpose = body.purpose === 'payment' ? 'payment' : 'file';
    const note = String(body.note || '').trim().slice(0, 1000);
    if (!/^https:\/\//.test(fileUrl)) return Response.json({ error: 'Upload failed. Please try again.' }, { status: 400 });
    await platform.entities.Document.create({
      contact_id: contact.id, category: purpose === 'payment' ? 'Proof of Payment' : 'Client Supplied', file_url: fileUrl, file_name: fileName,
      title: fileName, status: 'Pending Review', description: note || undefined,
    });
    const label = purpose === 'payment' ? 'Proof of payment' : 'File';
    const att = await attachmentFor(fileUrl, fileName);
    await mail(ADMIN_EMAIL(), `${label} uploaded: ${name}`, shell(`${label} uploaded from the portal`, [['Client', name], ['Email', contact.email], ['File', fileName], ...(note ? [['Note', note] as [string, string]] : [])], `${esc(name)} uploaded a file in the client portal.${att ? ' It is attached to this email.' : ''}`, { href: fileUrl, label: 'Open the file' }), att ? [att] : undefined);
    await mail(contact.email, `We've received your ${purpose === 'payment' ? 'proof of payment' : 'file'}`, shell('Upload received', [['File', fileName]], `Hi ${esc(name.split(' ')[0])}, thank you. Our team has been notified and will review it shortly.`, { href: portalLink, label: 'Back to your portal' }));
    return Response.json({ success: true });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
});
