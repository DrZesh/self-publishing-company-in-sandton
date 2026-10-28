import { requireAdmin, AuthError } from './supabase-auth.ts';
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
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">' +
    '<tr><td align="center" style="padding:24px 16px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr>' +
    '<tr><td style="padding:0 32px 32px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '<div style="padding:24px 0;">' +
    '<h1 style="font-family:Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 6px 0;">Appointment Reminder ⏰</h1>' +
    '<p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 24px 0;">Your appointment is <strong>' + label + '</strong></p>' +
    '<p style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 10px 0;">Appointment Details</p>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;">' +
    '<tr><td style="background:#FAF5EE;padding:0;">' +
    '<table width="100%" cellpadding="0" cellspacing="0">' +
    '<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Name</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.client_name + '</td></tr>' +
    '<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Service</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.service_name + '</td></tr>' +
    '<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatDate(appt.date) + '</td></tr>' +
    '<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Time</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatTime(appt.start_time) + ' SAST</td></tr>' +
    '<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;">Format</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;">' + modeLabel + '</td></tr>' +
    '</table></td></tr></table>' +
    '<p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6B6B6B;margin:20px 0 0 0;text-align:center;">Need to cancel? Call us on <a href="tel:0842305393" style="color:#B87333;">084 230 5393</a> or reply to this email.</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '</td></tr>' +
    '<tr><td align="center" style="padding:16px 32px 24px;font-size:12px;color:#AAAAAA;">Creative Books SA · Prism Office Park, Fourways · 084 230 5393</td></tr>' +
    '</table></td></tr></table></body></html>';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    await requireAdmin(req, { allowScheduled: true });

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
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: error.message }, { status: 500 });
  }
});