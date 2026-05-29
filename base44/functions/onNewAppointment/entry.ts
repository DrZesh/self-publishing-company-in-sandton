import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CALLMEBOT_KEY = Deno.env.get('CALLMEBOT_API_KEY');
const CALLMEBOT_NUM = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Entity automation payload
    const appt = payload.data;
    if (!appt || payload.event?.type !== 'create') {
      return Response.json({ skipped: true });
    }

    const message = `📅 NEW BOOKING REQUEST\n👤 ${appt.client_name}\n📧 ${appt.client_email}\n📌 ${appt.service_name}\n🗓 ${formatDate(appt.date)} at ${formatTime(appt.start_time)}\n💻 ${appt.mode === 'zoom' ? 'Zoom' : 'On-site'}\n\nReview at: creativebooks.co.za/admin/appointments`;

    if (CALLMEBOT_KEY && CALLMEBOT_NUM) {
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_NUM}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_KEY}`).catch(() => {});
    }

    // Also send an internal email alert to admin
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Creative Books SA Bookings <info@creativebooks.co.za>',
          to: 'info@creativebooks.co.za',
          subject: `📅 New booking request — ${appt.client_name}`,
          html: `<div style="font-family:Arial,sans-serif;padding:24px;"><h2>New Appointment Request</h2><ul style="font-size:14px;line-height:2;"><li><strong>Client:</strong> ${appt.client_name}</li><li><strong>Email:</strong> ${appt.client_email}</li><li><strong>Phone:</strong> ${appt.client_phone || '—'}</li><li><strong>Service:</strong> ${appt.service_name}</li><li><strong>Date:</strong> ${formatDate(appt.date)} at ${formatTime(appt.start_time)}</li><li><strong>Mode:</strong> ${appt.mode === 'zoom' ? 'Zoom' : 'On-site'}</li>${appt.client_note ? `<li><strong>Note:</strong> ${appt.client_note}</li>` : ''}</ul><a href="https://creativebooks.co.za/admin/appointments" style="background:#B87333;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Review Request →</a></div>`,
        }),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});