import { createClientFromRequest, serve } from '../_shared/server.ts';

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

// Convert SAST date+time to UTC milliseconds
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
    body: JSON.stringify({ from: 'Creative Books SA <info@creativebooks.co.za>', to, subject, html }),
  });
}

async function notifyAdmin(message) {
  if (!CALLMEBOT_KEY || !CALLMEBOT_NUM) return;
  await fetch(`https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_NUM}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_KEY}`).catch(() => {});
}

export function buildReminderEmail(appt, label) {
  const modeLabel = appt.mode === 'zoom'
    ? 'Zoom (link was sent in your confirmation email)'
    : 'On-site — Creative Books SA, Prism Office Park, Fourways, Johannesburg';

  const noteRow = appt.client_note
    ? `<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;">Notes</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;">${appt.client_note}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Rainbow bar -->
        <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>
        <!-- Logo -->
        <tr><td align="center" style="padding:32px 0 24px;">
          <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="160" style="max-width:160px;height:auto;display:block;" />
        </td></tr>
        <!-- Divider -->
        <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table></td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px 32px;">
          <h1 style="font-family:Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 8px 0;">⏰ Appointment Reminder</h1>
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 28px 0;">
            Hi <strong>${appt.client_name}</strong>, your appointment is <strong>${label}</strong>.
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 10px 0;">Your Appointment Details</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:28px;">
            <tr><td style="background:#FAF5EE;padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Service</td>
                  <td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">${appt.service_name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date</td>
                  <td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">${formatDate(appt.date)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Time</td>
                  <td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">${formatTime(appt.start_time)} SAST</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;${noteRow ? 'border-bottom:1px solid #E5E0D5;' : ''}">Location</td>
                  <td style="padding:10px 14px;font-size:14px;color:#2C2C2C;${noteRow ? 'border-bottom:1px solid #E5E0D5;' : ''}">${modeLabel}</td>
                </tr>
                ${noteRow}
              </table>
            </td></tr>
          </table>

          <!-- Reschedule notice -->
          <div style="background:#FFF8EE;border:1px solid #F0D5A0;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
            <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#7A4F1E;margin:0;">
              <strong>Need to reschedule?</strong> Please contact us as soon as possible so we can accommodate you.
              Call <a href="tel:0842305393" style="color:#B87333;">084 230 5393</a> or reply to this email — we're happy to help.
            </p>
          </div>

          <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6B6B6B;text-align:center;margin:0;">We look forward to seeing you! 😊</p>
        </td></tr>
        <!-- Divider -->
        <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table></td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8;">
          <strong style="color:#2C2C2C;">Creative Books SA</strong><br />
          Prism Office Park, Fourways, Johannesburg<br />
          <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> &middot; 084 230 5393
        </td></tr>
        <tr><td align="center" style="padding:12px 32px 28px;font-size:11px;color:#AAAAAA;">You received this reminder because you have an upcoming appointment with Creative Books SA.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve('appointmentReminders', async (req) => {
  try {
    const platform = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));

    // Allow scheduled calls or admin manual trigger
    const isScheduled = req.headers.get('x-scheduled') === 'true';
    if (!isScheduled) {
      const user = await platform.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const nowMs = Date.now();
    const h24     = 24 * 60 * 60 * 1000;
    const h5      =  5 * 60 * 60 * 1000;
    const h1      =  1 * 60 * 60 * 1000;
    const window  = 30 * 60 * 1000; // 30-min check window

    const appointments = await platform.asServiceRole.entities.Appointment.list('-date', 500);
    const upcoming = appointments.filter(a => a.status === 'approved' && a.date && a.start_time);

    let sent24 = 0, sent5 = 0, sent1 = 0;

    for (const appt of upcoming) {
      const apptMs = sastToMs(appt.date, appt.start_time);
      if (apptMs <= nowMs) continue;

      const timeUntil = apptMs - nowMs;

      // 24h reminder
      if (!appt.reminder_24h_sent && timeUntil <= h24 && timeUntil > (h24 - window)) {
        await sendEmail(
          appt.client_email,
          `Reminder: Your ${appt.service_name} appointment is tomorrow`,
          buildReminderEmail(appt, 'tomorrow')
        );
        await platform.asServiceRole.entities.Appointment.update(appt.id, { reminder_24h_sent: true });
        sent24++;
      }

      // 5h reminder
      if (!appt.reminder_5h_sent && timeUntil <= h5 && timeUntil > (h5 - window)) {
        await sendEmail(
          appt.client_email,
          `Reminder: Your ${appt.service_name} appointment is in 5 hours`,
          buildReminderEmail(appt, 'in 5 hours')
        );
        await platform.asServiceRole.entities.Appointment.update(appt.id, {
          reminder_5h_sent: true,
          reminder_5h_sent_at: new Date().toISOString(),
        });
        await notifyAdmin(`⏰ 5h reminder sent\n${appt.client_name} — ${appt.service_name} at ${formatTime(appt.start_time)}`);
        sent5++;
      }

      // 1h reminder
      if (!appt.reminder_1h_sent && timeUntil <= h1 && timeUntil > (h1 - window)) {
        await sendEmail(
          appt.client_email,
          `Reminder: Your ${appt.service_name} appointment is in 1 hour`,
          buildReminderEmail(appt, 'in 1 hour')
        );
        await notifyAdmin(`⏰ 1h reminder sent\n${appt.client_name} — ${appt.service_name} at ${formatTime(appt.start_time)}`);
        await platform.asServiceRole.entities.Appointment.update(appt.id, { reminder_1h_sent: true });
        sent1++;
      }
    }

    return Response.json({ success: true, sent_24h: sent24, sent_5h: sent5, sent_1h: sent1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});