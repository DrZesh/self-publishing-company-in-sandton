import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const CALLMEBOT_KEY  = Deno.env.get('CALLMEBOT_API_KEY');
const CALLMEBOT_NUM  = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

// Convert SAST date+time string to UTC milliseconds
function sastToMs(dateStr, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h - 2, m, 0, 0); // SAST = UTC+2
  return d.getTime();
}

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Creative Books SA <info@creativebooks.co.za>',
      to, subject, html,
    }),
  });
}

async function notifyAdmin(message) {
  if (!CALLMEBOT_KEY || !CALLMEBOT_NUM) return;
  await fetch(`https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_NUM}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_KEY}`).catch(() => {});
}

function reminderEmail(appt, label) {
  const modeLabel = appt.mode === 'zoom'
    ? 'Zoom (link was emailed to you at confirmation)'
    : 'On-site — Creative Books SA, Johannesburg';
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:#0a0806;padding:24px 32px;text-align:center;">
        <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" style="height:40px;" />
      </div>
      <div style="padding:32px;">
        <h2 style="color:#0a0806;font-size:20px;margin-bottom:4px;">Reminder: Your appointment is ${label}! ⏰</h2>
        <p style="color:#666;margin-bottom:20px;">Hi ${appt.client_name}, just a quick reminder about your upcoming consultation.</p>
        <div style="background:#f8f5f0;border-left:4px solid #B87333;padding:16px 20px;border-radius:4px;margin-bottom:20px;">
          <p style="margin:4px 0;font-size:14px;"><strong>Service:</strong> ${appt.service_name}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> ${formatDate(appt.date)}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Time:</strong> ${formatTime(appt.start_time)} SAST</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Format:</strong> ${modeLabel}</p>
        </div>
        <p style="font-size:13px;color:#999;">Need to cancel? Call us on 084 230 5393 or reply to this email.</p>
      </div>
      <div style="background:#f8f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
        Creative Books SA · Johannesburg · 084 230 5393
      </div>
    </div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user auth) but verify admin if called manually
    const isScheduled = req.headers.get('x-scheduled') === 'true';
    if (!isScheduled) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const nowMs = Date.now();
    const h24 = 24 * 60 * 60 * 1000;
    const h1  =  1 * 60 * 60 * 1000;
    const window = 30 * 60 * 1000; // 30-min check window

    // Fetch all upcoming approved appointments
    const appointments = await base44.asServiceRole.entities.Appointment.list('-date', 500);
    const upcoming = appointments.filter(a => a.status === 'approved' && a.date && a.start_time);

    let sent24 = 0, sent1 = 0;

    for (const appt of upcoming) {
      const apptMs = sastToMs(appt.date, appt.start_time);
      if (apptMs <= nowMs) continue; // already past

      const timeUntil = apptMs - nowMs;

      // 24h reminder — send if within [24h - window, 24h]
      if (!appt.reminder_24h_sent && timeUntil <= h24 && timeUntil > (h24 - window)) {
        await sendEmail(appt.client_email, `Reminder: Your ${appt.service_name} appointment is tomorrow`, reminderEmail(appt, 'tomorrow'));
        await base44.asServiceRole.entities.Appointment.update(appt.id, { reminder_24h_sent: true });
        sent24++;
      }

      // 1h reminder — send if within [1h - window, 1h]
      if (!appt.reminder_1h_sent && timeUntil <= h1 && timeUntil > (h1 - window)) {
        await sendEmail(appt.client_email, `Reminder: Your ${appt.service_name} appointment is in 1 hour`, reminderEmail(appt, 'in 1 hour'));
        await notifyAdmin(`⏰ 1h reminder sent\n${appt.client_name} — ${appt.service_name} at ${formatTime(appt.start_time)}`);
        await base44.asServiceRole.entities.Appointment.update(appt.id, { reminder_1h_sent: true });
        sent1++;
      }
    }

    return Response.json({ success: true, sent_24h: sent24, sent_1h: sent1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});