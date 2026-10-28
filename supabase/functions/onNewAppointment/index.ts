import { createClientFromRequest, serve } from '../_shared/server.ts';

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

serve('onNewAppointment', async (req) => {
  try {
    const platform = createClientFromRequest(req);
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
          html: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 16px;"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr><tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr><tr><td style="padding:0 32px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table><div style="padding:24px 0;"><h1 style="font-size:24px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 6px 0;">📅 New Booking Request</h1><p style="font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 24px 0;">A new appointment request has been received.</p><p style="font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 10px 0;">Booking Details</p><table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px;"><tr><td style="background:#FAF5EE;padding:0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Client</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.client_name + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Email</td><td style="padding:10px 14px;font-size:14px;color:#B87333;border-bottom:1px solid #E5E0D5;">' + appt.client_email + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Phone</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + (appt.client_phone || '—') + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Service</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.service_name + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date &amp; Time</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatDate(appt.date) + ' at ' + formatTime(appt.start_time) + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;' + (appt.client_note ? 'border-bottom:1px solid #E5E0D5;' : '') + '">Format</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;' + (appt.client_note ? 'border-bottom:1px solid #E5E0D5;' : '') + '">' + (appt.mode === 'zoom' ? 'Zoom' : 'On-site') + '</td></tr>' + (appt.client_note ? '<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;">Note</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;">' + appt.client_note + '</td></tr>' : '') + '</table></td></tr></table><div style="text-align:center;"><a href="https://creativebooks.co.za/admin/appointments" style="display:inline-block;background:#B87333;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Review Request →</a></div></div><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table></td></tr><tr><td align="center" style="padding:16px 32px 24px;font-size:12px;color:#AAAAAA;">Creative Books SA · Prism Office Park, Fourways · 084 230 5393</td></tr></table></td></tr></table></body></html>',
        }),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});