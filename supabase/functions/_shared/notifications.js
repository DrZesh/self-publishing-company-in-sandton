import { brandedNotificationHtml } from './email-templates.js';
const FROM = 'Creative Books SA <info@creativebooks.co.za>';
const BUSINESS_EMAIL = 'info@creativebooks.co.za';
const ENDPOINT = 'https://api.resend.com/emails';
const text = (value, maximum = 1000) => String(value ?? '').slice(0, maximum);

export function notificationMessages(kind, record) {
  if (!['enquiry', 'booking'].includes(kind)) throw new Error('Unsupported notification');
  const booking = kind === 'booking';
  const recipient = booking ? record.client_email : record.email;
  if (typeof recipient !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error('Invalid saved email address');
  const details = booking
    ? `Name: ${text(record.client_name, 200)}\nEmail: ${recipient}\nPhone: ${text(record.client_phone, 100)}\nService: ${text(record.service_name, 200)}\nDate: ${text(record.date, 30)}\nTime: ${text(record.start_time, 30)}\nFormat: ${text(record.mode, 100)}\nNote: ${text(record.client_note, 8000)}\nStatus: pending review`
    : `Name: ${text(record.full_name, 200)}\nEmail: ${recipient}\nPhone: ${text(record.phone, 100)}\nForm: ${text(record.form_type, 100)}\nMessage: ${text(record.message, 8000)}\nServices: ${text(JSON.stringify(record.service_interest || []))}\nProject details: ${text(JSON.stringify({ book_title: record.book_title, book_genre: record.book_genre, book_page_count: record.book_page_count, book_word_count: record.book_word_count, additional_fields: record.additional_fields }), 16000)}`;
  const html = brandedNotificationHtml(kind, record);
  return [
    { audience: 'business', html: html.business, from: FROM, to: BUSINESS_EMAIL, reply_to: recipient, subject: booking ? 'New booking request | Creative Books SA' : 'New website enquiry | Creative Books SA', text: `A new ${booking ? 'booking request' : 'enquiry'} has been saved.\n\nReference: ${record.id}\n${details}` },
    { audience: 'receipt', html: html.receipt, from: FROM, to: recipient, reply_to: BUSINESS_EMAIL, subject: booking ? 'Booking request received | Creative Books SA' : 'Enquiry received | Creative Books SA', text: booking
      ? `Thank you for your booking request. It has been saved for our team to review.\n\nThis is a receipt, not an appointment confirmation. Please call 084 230 5393 if you need to follow up.\n\nReference: ${record.id}\n\nCreative Books SA\ninfo@creativebooks.co.za`
      : `Thank you for contacting Creative Books SA. Your enquiry has been saved for our team to review.\n\nPlease call 084 230 5393 if you need to follow up.\n\nReference: ${record.id}\n\nCreative Books SA\ninfo@creativebooks.co.za` },
  ];
}

export async function sendRecordEmails(platform, kind, id, options = {}) {
  const getEnv = options.getEnv || (name => Deno.env.get(name));
  const key = getEnv('RESEND_API_KEY');
  if (!key) return { status: 'disabled' };
  const transport = options.transport || fetch;
  const entity = kind === 'booking' ? platform.asServiceRole.entities.Appointment : kind === 'enquiry' ? platform.asServiceRole.entities.Submission : null;
  if (!entity) throw new Error('Unsupported notification');
  const record = await entity.get(id);
  const delivery = { ...record.email_delivery };
  for (const { audience, ...message } of notificationMessages(kind, record)) {
    if (delivery[audience]?.status === 'accepted') continue;
    try {
      const response = await transport(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `cbsa-${kind}-${record.id}-${audience}` },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(8000),
      });
      const result = await response.json();
      if (!response.ok || !result.id) throw new Error('Email provider did not accept the message');
      delivery[audience] = { status: 'accepted', provider_id: result.id, accepted_at: new Date().toISOString() };
    } catch {
      delivery[audience] = { status: 'failed', attempted_at: new Date().toISOString() };
      console.error(`Email notification failed: ${kind}/${id}/${audience}`);
    }
    await entity.update(id, { email_delivery: delivery });
  }
  return { status: Object.values(delivery).every(value => value.status === 'accepted') ? 'accepted' : 'partial' };
}

export function queueRecordEmails(platform, kind, id) {
  const work = sendRecordEmails(platform, kind, id).catch(() => console.error(`Email notification could not be completed: ${kind}/${id}`));
  if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(work);
  return work;
}
