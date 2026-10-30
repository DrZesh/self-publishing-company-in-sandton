import { createClientFromRequest, serve } from '../_shared/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// ── Google Calendar helpers ──────────────────────────────────────────────────
function toRFC3339(dateStr, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h - 2, m, 0, 0);
  return d.toISOString();
}

async function createCalendarEvent(appt, accessToken) {
  const startRFC = toRFC3339(appt.date, appt.start_time);
  const endRFC   = toRFC3339(appt.date, appt.end_time || addMinutes(appt.start_time, appt.service_duration_minutes || 30));
  const event = {
    summary: `📅 ${appt.service_name} — ${appt.client_name}`,
    description: [
      appt.client_note ? `Client note: ${appt.client_note}` : '',
      `Email: ${appt.client_email}`,
      appt.client_phone ? `Phone: ${appt.client_phone}` : '',
      `Mode: ${appt.mode === 'zoom' ? 'Zoom' : 'On-site'}`,
    ].filter(Boolean).join('\n'),
    location: /deliver/i.test(appt.service_name || '') ? (String(appt.client_note || '').match(/Delivery address: (.*)/)?.[1] || 'Delivery to client') : appt.mode === 'zoom' ? 'Zoom (link to be sent)' : 'Creative Books SA, Sandton, Johannesburg',
    start: { dateTime: startRFC, timeZone: 'Africa/Johannesburg' },
    end:   { dateTime: endRFC,   timeZone: 'Africa/Johannesburg' },
    attendees: [{ email: appt.client_email, displayName: appt.client_name }],
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
  };
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=none', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  const data = await res.json();
  return data.id || null;
}

async function deleteCalendarEvent(eventId, accessToken) {
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=none`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
}

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
function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Creative Books SA <info@creativebooks.co.za>',
      to,
      subject,
      html,
    }),
  });
}

async function notifyAdmin(message) {
  if (!CALLMEBOT_KEY || !CALLMEBOT_NUM) return;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_NUM}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_KEY}`;
  await fetch(url).catch(() => {});
}

// ── Branded email shell — matches sendFormEmailResend design ─────────────────
function baseEmail(innerContent) {
  return '<!DOCTYPE html>' +
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Email</title></head>' +
    '<body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">' +
    '<tr><td align="center" style="padding:24px 16px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td align="center" style="padding:32px 0 24px;">' +
    '<img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="160" style="max-width:160px;height:auto;display:block;" />' +
    '</td></tr>' +
    '<tr><td style="padding:0 32px 32px;font-size:15px;line-height:1.7;color:#2C2C2C;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '<div style="padding:24px 0;">' + innerContent + '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '</td></tr>' +
    '<tr><td align="center" style="padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8;">' +
    '<strong style="color:#2C2C2C;">Creative Books SA</strong><br />' +
    'Prism Office Park, Fourways, Johannesburg<br />' +
    '<a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> &middot; 084 230 5393' +
    '</td></tr>' +
    '<tr><td align="center" style="padding:12px 32px 28px;font-size:11px;color:#AAAAAA;">You received this email because you booked an appointment with Creative Books SA.</td></tr>' +
    '</table></td></tr></table></body></html>';
}

serve('appointmentActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { action, appointmentId, declineReason, proposeDate, proposeTime, cancel_token } = body;

    // Public actions — skip admin auth
    if (action !== 'cancel_by_client' && action !== 'get_by_cancel_token') {
      const user = await platform.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (action === 'get_by_cancel_token') {
      if (!cancel_token) return Response.json({ error: 'Missing token' }, { status: 400 });
      const appts = await platform.asServiceRole.entities.Appointment.filter({ cancel_token });
      if (!appts.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const a = appts[0];
      return Response.json({ success: true, appointment: { client_name: a.client_name, service_name: a.service_name, date: a.date, start_time: a.start_time, end_time: a.end_time, mode: a.mode, status: a.status } });
    }

    if (action === 'cancel_by_client') {
      if (!cancel_token) return Response.json({ error: 'Missing token' }, { status: 400 });
      const appts = await platform.asServiceRole.entities.Appointment.filter({ cancel_token });
      if (!appts.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const a = appts[0];
      if (['cancelled', 'completed', 'no_show'].includes(a.status)) {
        return Response.json({ error: 'Already ' + a.status }, { status: 400 });
      }
      if (a.google_event_id) {
        try {
          const { accessToken } = await platform.asServiceRole.connectors.getConnection('googlecalendar');
          await deleteCalendarEvent(a.google_event_id, accessToken);
        } catch (e) { console.error('GCal delete failed:', e.message); }
      }
      await platform.asServiceRole.entities.Appointment.update(a.id, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      });
      const endTime = a.end_time || addMinutes(a.start_time, a.service_duration_minutes || 30);
      const cancelHtml = baseEmail(
        '<h1 style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 8px 0;">Appointment Cancelled</h1>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 28px 0;">Hi ' + a.client_name + ', your appointment has been successfully cancelled.</p>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px 0;">Appointment Details</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px;">' +
        '<tr><td style="background:#FAF5EE;padding:0;">' +
        '<table width="100%" cellpadding="0" cellspacing="0">' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Service</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + a.service_name + '</td></tr>' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatDate(a.date) + '</td></tr>' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;">Time</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;">' + formatTime(a.start_time) + ' – ' + formatTime(endTime) + ' SAST</td></tr>' +
        '</table></td></tr></table>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:15px;color:#2C2C2C;margin:0;">We\'d love to reschedule — <a href="https://creativebooks.co.za/book" style="color:#B87333;">book a new time here</a> or call us on <strong>084 230 5393</strong>.</p>'
      );
      await sendEmail(a.client_email, `Appointment Cancelled — ${a.service_name}`, cancelHtml);
      await notifyAdmin(`🚫 Appointment CANCELLED by client\n${a.client_name}\n${a.service_name}\n${formatDate(a.date)} at ${formatTime(a.start_time)}`);
      return Response.json({ success: true });
    }

    const appt = await platform.asServiceRole.entities.Appointment.get(appointmentId);
    if (!appt) return Response.json({ error: 'Appointment not found' }, { status: 404 });

    if (action === 'approve') {
      const endTime = appt.end_time || addMinutes(appt.start_time, appt.service_duration_minutes || 30);

      let googleEventId = null;
      try {
        const { accessToken } = await platform.asServiceRole.connectors.getConnection('googlecalendar');
        googleEventId = await createCalendarEvent({ ...appt, end_time: endTime }, accessToken);
      } catch (e) { console.error('GCal create failed:', e.message); }

      await platform.asServiceRole.entities.Appointment.update(appointmentId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        ...(googleEventId ? { google_event_id: googleEventId } : {}),
      });

      const modeLabel = /deliver/i.test(appt.service_name || '') ? 'Courier delivery to the address you gave us' : /collect/i.test(appt.service_name || '') ? 'Collect at Creative Books SA, Johannesburg' : appt.mode === 'zoom' ? 'Zoom (link will be emailed separately)' : 'On-site — Creative Books SA, Johannesburg';
      const approveHtml = baseEmail(
        '<h1 style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 8px 0;">Appointment Confirmed! 🎉</h1>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 28px 0;">Hi ' + appt.client_name + ', we\'re looking forward to seeing you.</p>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px 0;">Appointment Details</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px;">' +
        '<tr><td style="background:#FAF5EE;padding:0;">' +
        '<table width="100%" cellpadding="0" cellspacing="0">' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Service</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.service_name + '</td></tr>' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatDate(appt.date) + '</td></tr>' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Time</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatTime(appt.start_time) + ' – ' + formatTime(endTime) + ' SAST</td></tr>' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;">Format</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;">' + modeLabel + '</td></tr>' +
        '</table></td></tr></table>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:13px;color:#6B6B6B;margin:0;">Need to cancel? <a href="https://creativebooks.co.za/appointment/cancel/' + appt.cancel_token + '" style="color:#B87333;">Click here to cancel</a> or call us on 084 230 5393.</p>'
      );
      await sendEmail(appt.client_email, `✅ Appointment Confirmed — ${appt.service_name}`, approveHtml);
      await notifyAdmin(`📅 Appointment APPROVED\n${appt.client_name}\n${appt.service_name}\n${formatDate(appt.date)} at ${formatTime(appt.start_time)}`);
    }

    else if (action === 'decline') {
      if (appt.google_event_id) {
        try {
          const { accessToken } = await platform.asServiceRole.connectors.getConnection('googlecalendar');
          await deleteCalendarEvent(appt.google_event_id, accessToken);
        } catch (e) { console.error('GCal delete failed:', e.message); }
      }
      await platform.asServiceRole.entities.Appointment.update(appointmentId, {
        status: 'declined',
        decline_reason: declineReason || '',
      });
      const declineHtml = baseEmail(
        '<h1 style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 8px 0;">Appointment Request Update</h1>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 24px 0;">Hi ' + appt.client_name + ', unfortunately we were unable to accommodate your requested time slot.</p>' +
        (declineReason ? '<div style="background:#fff8f8;border-left:4px solid #e11d48;padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:14px;color:#555;">' + declineReason + '</div>' : '') +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:15px;color:#2C2C2C;margin:0;">We\'d love to find a time that works — <a href="https://creativebooks.co.za/book" style="color:#B87333;">book a new slot here</a> or call us on <strong>084 230 5393</strong>.</p>'
      );
      await sendEmail(appt.client_email, `Re: Your ${appt.service_name} appointment request`, declineHtml);
      await notifyAdmin(`❌ Appointment DECLINED\n${appt.client_name} — ${appt.service_name}`);
    }

    else if (action === 'propose') {
      const endTime = addMinutes(proposeTime, appt.service_duration_minutes || 30);
      await platform.asServiceRole.entities.Appointment.update(appointmentId, {
        proposed_date: proposeDate,
        proposed_start_time: proposeTime,
        proposed_end_time: endTime,
      });
      const proposeHtml = baseEmail(
        '<h1 style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 8px 0;">New Time Suggested</h1>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 28px 0;">Hi ' + appt.client_name + ', your original slot wasn\'t available, but we\'ve found an alternative.</p>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px 0;">Proposed Time</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px;">' +
        '<tr><td style="background:#FAF5EE;padding:0;">' +
        '<table width="100%" cellpadding="0" cellspacing="0">' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Service</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.service_name + '</td></tr>' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatDate(proposeDate) + '</td></tr>' +
        '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;">Time</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;">' + formatTime(proposeTime) + ' SAST</td></tr>' +
        '</table></td></tr></table>' +
        '<p style="font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:15px;color:#2C2C2C;margin:0;">If this works, reply <strong>"Confirmed"</strong> or call <strong>084 230 5393</strong>. Otherwise, <a href="https://creativebooks.co.za/book" style="color:#B87333;">book a different time online</a>.</p>'
      );
      await sendEmail(appt.client_email, `New time proposed for your ${appt.service_name} appointment`, proposeHtml);
      await notifyAdmin(`🔄 Appointment PROPOSED new time\n${appt.client_name}\n${formatDate(proposeDate)} at ${formatTime(proposeTime)}`);
    }

    else if (action === 'resend_reminder') {
      const endTime = appt.end_time || addMinutes(appt.start_time, appt.service_duration_minutes || 30);
      const modeLabel = /deliver/i.test(appt.service_name || '')
        ? 'Courier delivery to the address you gave us'
        : appt.mode === 'zoom'
        ? 'Zoom (link was sent in your confirmation email)'
        : 'On-site — Creative Books SA, Prism Office Park, Fourways, Johannesburg';
      const noteRow = appt.client_note
        ? `<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;">Notes</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;">${appt.client_note}</td></tr>`
        : '';
      const reminderHtml = baseEmail(
        `<h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 8px 0;">⏰ Appointment Reminder</h1>` +
        `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 28px 0;">Hi <strong>${appt.client_name}</strong>, this is a reminder about your upcoming appointment.</p>` +
        `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 10px 0;">Your Appointment Details</p>` +
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:28px;"><tr><td style="background:#FAF5EE;padding:0;"><table width="100%" cellpadding="0" cellspacing="0">` +
        `<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Service</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">${appt.service_name}</td></tr>` +
        `<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">${formatDate(appt.date)}</td></tr>` +
        `<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Time</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">${formatTime(appt.start_time)} – ${formatTime(endTime)} SAST</td></tr>` +
        `<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;${noteRow ? 'border-bottom:1px solid #E5E0D5;' : ''}">Location</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;${noteRow ? 'border-bottom:1px solid #E5E0D5;' : ''}">${modeLabel}</td></tr>` +
        noteRow +
        `</table></td></tr></table>` +
        `<div style="background:#FFF8EE;border:1px solid #F0D5A0;border-radius:10px;padding:16px 18px;margin-bottom:24px;"><p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#7A4F1E;margin:0;"><strong>Need to reschedule?</strong> Please contact us as soon as possible. Call <a href="tel:0842305393" style="color:#B87333;">084 230 5393</a> or reply to this email.</p></div>` +
        `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#6B6B6B;text-align:center;margin:0;">We look forward to seeing you! 😊</p>`
      );
      await sendEmail(appt.client_email, `Reminder: Your upcoming ${appt.service_name} appointment`, reminderHtml);
      await platform.asServiceRole.entities.Appointment.update(appointmentId, {
        reminder_5h_sent: true,
        reminder_5h_sent_at: new Date().toISOString(),
      });
    }

    else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});