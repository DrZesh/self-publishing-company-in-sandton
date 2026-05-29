import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// ── Google Calendar helpers ───────────────────────────────────────────────────
function toRFC3339(dateStr, timeStr) {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM (SAST = UTC+2)
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
    location: appt.mode === 'zoom' ? 'Zoom (link to be sent)' : 'Creative Books SA, Sandton, Johannesburg',
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

function baseEmail(body) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:#0a0806;padding:24px 32px;text-align:center;">
        <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" style="height:40px;" />
      </div>
      <div style="padding:32px;">${body}</div>
      <div style="background:#f8f5f0;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
        Creative Books SA · Johannesburg · 084 230 5393 · info@creativebooks.co.za
      </div>
    </div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, appointmentId, declineReason, proposeDate, proposeTime, cancel_token } = body;

    // Public actions — skip admin auth
    if (action !== 'cancel_by_client' && action !== 'get_by_cancel_token') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const appt = await base44.asServiceRole.entities.Appointment.get(appointmentId);
    if (!appt) return Response.json({ error: 'Appointment not found' }, { status: 404 });

    if (action === 'approve') {
      const endTime = appt.end_time || addMinutes(appt.start_time, appt.service_duration_minutes || 30);

      // Create Google Calendar event
      let googleEventId = null;
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
        googleEventId = await createCalendarEvent({ ...appt, end_time: endTime }, accessToken);
      } catch (e) { console.error('GCal create failed:', e.message); }

      await base44.asServiceRole.entities.Appointment.update(appointmentId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        ...(googleEventId ? { google_event_id: googleEventId } : {}),
      });

      const modeLabel = appt.mode === 'zoom' ? 'Zoom (link will be emailed separately)' : 'On-site — Creative Books SA, Johannesburg';
      const html = baseEmail(`
        <h2 style="color:#0a0806;font-size:22px;margin-bottom:4px;">Your appointment is confirmed! 🎉</h2>
        <p style="color:#666;margin-bottom:24px;">Hi ${appt.client_name}, we're looking forward to seeing you.</p>
        <div style="background:#f8f5f0;border-left:4px solid #B87333;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
          <p style="margin:4px 0;font-size:14px;"><strong>Service:</strong> ${appt.service_name}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> ${formatDate(appt.date)}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Time:</strong> ${formatTime(appt.start_time)} – ${formatTime(endTime)} SAST</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Format:</strong> ${modeLabel}</p>
        </div>
        ${appt.service_name?.toLowerCase().includes('prep') || appt.prep_tips ? `
        <p style="font-size:14px;color:#333;"><strong>Preparation tip:</strong> ${appt.prep_tips || 'Please bring any relevant manuscript notes or questions you\'d like to discuss.'}</p>` : ''}
        <p style="font-size:13px;color:#999;margin-top:24px;">Need to cancel? <a href="https://creativebooks.co.za/appointment/cancel/${appt.cancel_token}" style="color:#B87333;">Click here to cancel your appointment</a> or call us on 084 230 5393.</p>
      `);
      await sendEmail(appt.client_email, `✅ Appointment Confirmed — ${appt.service_name}`, html);
      await notifyAdmin(`📅 Appointment APPROVED\n${appt.client_name}\n${appt.service_name}\n${formatDate(appt.date)} at ${formatTime(appt.start_time)}`);
    }

    else if (action === 'decline') {
      // Delete Google Calendar event if it exists
      if (appt.google_event_id) {
        try {
          const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
          await deleteCalendarEvent(appt.google_event_id, accessToken);
        } catch (e) { console.error('GCal delete failed:', e.message); }
      }
      await base44.asServiceRole.entities.Appointment.update(appointmentId, {
        status: 'declined',
        decline_reason: declineReason || '',
      });
      const html = baseEmail(`
        <h2 style="color:#0a0806;font-size:22px;margin-bottom:4px;">Appointment Request Update</h2>
        <p style="color:#666;margin-bottom:16px;">Hi ${appt.client_name}, unfortunately we were unable to accommodate your requested time slot.</p>
        ${declineReason ? `<div style="background:#fff8f8;border-left:4px solid #e11d48;padding:12px 16px;border-radius:4px;margin-bottom:16px;font-size:14px;color:#555;">${declineReason}</div>` : ''}
        <p style="font-size:14px;color:#333;">We'd love to find a time that works — please visit <a href="https://creativebooks.co.za/book" style="color:#B87333;">creativebooks.co.za/book</a> to choose a new slot, or call us on <strong>084 230 5393</strong>.</p>
      `);
      await sendEmail(appt.client_email, `Re: Your ${appt.service_name} appointment request`, html);
      await notifyAdmin(`❌ Appointment DECLINED\n${appt.client_name} — ${appt.service_name}`);
    }

    else if (action === 'propose') {
      const endTime = addMinutes(proposeTime, appt.service_duration_minutes || 30);
      await base44.asServiceRole.entities.Appointment.update(appointmentId, {
        proposed_date: proposeDate,
        proposed_start_time: proposeTime,
        proposed_end_time: endTime,
      });
      const html = baseEmail(`
        <h2 style="color:#0a0806;font-size:22px;margin-bottom:4px;">We'd like to suggest a new time</h2>
        <p style="color:#666;margin-bottom:16px;">Hi ${appt.client_name}, your original slot wasn't available, but we've found an alternative:</p>
        <div style="background:#f8f5f0;border-left:4px solid #B87333;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
          <p style="margin:4px 0;font-size:14px;"><strong>Service:</strong> ${appt.service_name}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Proposed Date:</strong> ${formatDate(proposeDate)}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Proposed Time:</strong> ${formatTime(proposeTime)} SAST</p>
        </div>
        <p style="font-size:14px;color:#333;">If this works for you, simply reply <strong>"Confirmed"</strong> or call us on <strong>084 230 5393</strong>. If not, you can also <a href="https://creativebooks.co.za/book" style="color:#B87333;">book a different time online</a>.</p>
      `);
      await sendEmail(appt.client_email, `New time proposed for your ${appt.service_name} appointment`, html);
      await notifyAdmin(`🔄 Appointment PROPOSED new time\n${appt.client_name}\n${formatDate(proposeDate)} at ${formatTime(proposeTime)}`);
    }

    else if (action === 'get_by_cancel_token') {
      if (!cancel_token) return Response.json({ error: 'Missing token' }, { status: 400 });
      const appts = await base44.asServiceRole.entities.Appointment.filter({ cancel_token });
      if (!appts.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const a = appts[0];
      return Response.json({ success: true, appointment: { client_name: a.client_name, service_name: a.service_name, date: a.date, start_time: a.start_time, end_time: a.end_time, mode: a.mode, status: a.status } });
    }

    else if (action === 'cancel_by_client') {
      if (!cancel_token) return Response.json({ error: 'Missing token' }, { status: 400 });
      const appts = await base44.asServiceRole.entities.Appointment.filter({ cancel_token });
      if (!appts.length) return Response.json({ error: 'Not found' }, { status: 404 });
      const a = appts[0];
      if (['cancelled', 'completed', 'no_show'].includes(a.status)) {
        return Response.json({ error: 'Already ' + a.status }, { status: 400 });
      }
      // Remove from Google Calendar
      if (a.google_event_id) {
        try {
          const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
          await deleteCalendarEvent(a.google_event_id, accessToken);
        } catch (e) { console.error('GCal delete failed:', e.message); }
      }
      await base44.asServiceRole.entities.Appointment.update(a.id, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      });
      const endTime = a.end_time || addMinutes(a.start_time, a.service_duration_minutes || 30);
      const html = baseEmail(`
        <h2 style="color:#0a0806;font-size:22px;margin-bottom:4px;">Appointment Cancelled</h2>
        <p style="color:#666;margin-bottom:16px;">Hi ${a.client_name}, your appointment has been successfully cancelled.</p>
        <div style="background:#f8f5f0;border-left:4px solid #B87333;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
          <p style="margin:4px 0;font-size:14px;"><strong>Service:</strong> ${a.service_name}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> ${formatDate(a.date)}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Time:</strong> ${formatTime(a.start_time)} – ${formatTime(endTime)} SAST</p>
        </div>
        <p style="font-size:14px;color:#333;">We'd love to reschedule — visit <a href="https://creativebooks.co.za/book" style="color:#B87333;">creativebooks.co.za/book</a> to choose a new time.</p>
      `);
      await sendEmail(a.client_email, `Appointment Cancelled — ${a.service_name}`, html);
      await notifyAdmin(`🚫 Appointment CANCELLED by client\n${a.client_name}\n${a.service_name}\n${formatDate(a.date)} at ${formatTime(a.start_time)}`);
      return Response.json({ success: true });
    }

    else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});