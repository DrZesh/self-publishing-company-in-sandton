import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function formatTime(hhmm: string) {
  const [hour, minute] = hhmm.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00+02:00`).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg',
  });
}

function addMinutes(hhmm: string, minutes: number) {
  const [hour, minute] = hhmm.split(':').map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function baseEmail(inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#F5F5F5;font-family:Arial,sans-serif;color:#2C2C2C"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px"><tr><td align="center"><table width="100%" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)"><tr><td style="height:10px;background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6)"></td></tr><tr><td style="background:#1A1208;padding:26px 32px"><div style="font-size:22px;font-weight:800;color:#B87333">CREATIVE BOOKS SA</div><div style="font-size:12px;color:#fff;opacity:.6;margin-top:4px">Appointments</div></td></tr><tr><td style="padding:30px 32px">${inner}</td></tr><tr><td style="padding:18px 32px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee">Creative Books SA · Fourways, Johannesburg · 084 230 5393</td></tr></table></td></tr></table></body></html>`;
}

function appointmentDetails(appt: Record<string, unknown>) {
  const modeLabel = appt.mode === 'zoom'
    ? 'Zoom'
    : 'On-site, Creative Books SA, Johannesburg';
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EE;border:1px solid #E5E0D5;border-radius:12px;margin:20px 0"><tr><td style="padding:16px;line-height:1.8"><strong>Service:</strong> ${escapeHtml(appt.service_name)}<br><strong>Date:</strong> ${escapeHtml(formatDate(String(appt.date)))}<br><strong>Time:</strong> ${escapeHtml(formatTime(String(appt.start_time)))} to ${escapeHtml(formatTime(String(appt.end_time)))} SAST<br><strong>Format:</strong> ${escapeHtml(modeLabel)}</td></tr></table>`;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function textToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function pemToBytes(pem: string) {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function googleAccessToken() {
  const email = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const rawKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
  if (!email || !rawKey) return null;

  const privateKey = rawKey.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = textToBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = textToBase64Url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBytes(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${bytesToBase64Url(new Uint8Array(signature))}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error_description || 'Google Calendar authentication failed');
  return result.access_token as string;
}

async function createGoogleCalendarEvent(appt: Record<string, unknown>) {
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
  if (!calendarId) return null;
  const accessToken = await googleAccessToken();
  if (!accessToken) return null;

  const start = `${appt.date}T${appt.start_time}:00+02:00`;
  const end = `${appt.date}T${appt.end_time}:00+02:00`;
  const event = {
    summary: `${appt.service_name} | ${appt.client_name}`,
    description: [
      appt.client_note ? `Client note: ${appt.client_note}` : '',
      `Email: ${appt.client_email}`,
      appt.client_phone ? `Phone: ${appt.client_phone}` : '',
      `Mode: ${appt.mode === 'zoom' ? 'Zoom' : 'On-site'}`,
    ].filter(Boolean).join('\n'),
    location: appt.mode === 'zoom' ? 'Zoom' : 'Creative Books SA, Fourways, Johannesburg',
    start: { dateTime: start, timeZone: 'Africa/Johannesburg' },
    end: { dateTime: end, timeZone: 'Africa/Johannesburg' },
    attendees: [{ email: appt.client_email, displayName: appt.client_name }],
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
  };
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=none`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || 'Google Calendar event creation failed');
  return result.id as string;
}

async function deleteGoogleCalendarEvent(eventId: string) {
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID');
  if (!calendarId || !eventId) return;
  const accessToken = await googleAccessToken();
  if (!accessToken) return;
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.error?.message || 'Google Calendar event deletion failed');
  }
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Supabase service environment is not configured.' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.replace(/^Bearer\s+/i, '');
  const siteUrl = (Deno.env.get('SITE_URL') || request.headers.get('origin') || 'https://www.creativebooks.co.za').replace(/\/$/, '');

  const requireAdmin = async () => {
    if (!bearer) throw new Error('Unauthorized');
    const { data: userData, error: userError } = await admin.auth.getUser(bearer);
    if (userError || !userData.user) throw new Error('Unauthorized');
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', userData.user.id)
      .single();
    if (profileError || !['super_admin', 'admin'].includes(profile?.role)) throw new Error('Admin access required');
    return { user: userData.user, profile };
  };

  const sendEmail = async (to: string, subject: string, html: string) => {
    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) return null;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [to],
        subject,
        html,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || 'Unable to send email');
    return result;
  };

  const notifyAdminWhatsApp = async (message: string) => {
    const key = Deno.env.get('CALLMEBOT_API_KEY');
    const number = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
    if (!key || !number) return;
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(number)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(key)}`).catch(() => null);
  };

  const getAppointment = async (id: string) => {
    const { data, error } = await admin.from('appointments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  };

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'get_available_slots') {
      if (!body.service_id || !body.date) return json({ error: 'service_id and date are required' }, 400);
      const { data, error } = await admin.rpc('get_available_appointment_slots', {
        p_service_id: body.service_id,
        p_date: body.date,
      });
      if (error) throw error;
      const weekday = new Date(`${body.date}T00:00:00Z`).toLocaleDateString('en-ZA', {
        weekday: 'long', timeZone: 'UTC',
      });
      return json({ slots: data || [], weekday });
    }

    if (action === 'create_booking') {
      const email = normalizeEmail(body.client_email);
      if (!body.service_id || !body.date || !body.start_time || !body.client_name || !email) {
        return json({ error: 'Missing required booking fields' }, 400);
      }

      const { data: service, error: serviceError } = await admin
        .from('booking_services')
        .select('*')
        .eq('id', body.service_id)
        .eq('is_active', true)
        .maybeSingle();
      if (serviceError) throw serviceError;
      if (!service) return json({ error: 'Booking service not found or inactive' }, 404);

      const mode = ['on_site', 'zoom'].includes(body.mode) ? body.mode : service.allowed_modes?.[0];
      if (!service.allowed_modes?.includes(mode)) return json({ error: 'Selected meeting mode is not available for this service' }, 400);

      const { data: slots, error: slotError } = await admin.rpc('get_available_appointment_slots', {
        p_service_id: service.id,
        p_date: body.date,
      });
      if (slotError) throw slotError;
      const chosenSlot = (slots || []).find((slot: Record<string, string>) => slot.start_time === body.start_time);
      if (!chosenSlot) return json({ error: 'The selected appointment time is no longer available' }, 409);

      const { data: duplicate, error: duplicateError } = await admin
        .from('appointments')
        .select('id')
        .ilike('client_email', email)
        .eq('date', body.date)
        .eq('start_time', chosenSlot.start_time)
        .in('status', ['pending', 'approved'])
        .limit(1)
        .maybeSingle();
      if (duplicateError) throw duplicateError;
      if (duplicate) return json({ error: 'A booking request already exists for this email and time' }, 409);

      let contactId: string | null = null;
      let leadId: string | null = null;
      const { data: existingContact, error: contactLookupError } = await admin
        .from('contacts')
        .select('id')
        .ilike('email', email)
        .limit(1)
        .maybeSingle();
      if (contactLookupError) throw contactLookupError;

      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const { data: newContact, error: contactCreateError } = await admin.from('contacts').insert({
          full_name: String(body.client_name).trim(),
          email,
          phone: body.client_phone || null,
          lifecycle_stage: 'lead',
          pipeline_stage: 'New Enquiry',
          description: `Booked via website: ${service.name} on ${body.date} at ${chosenSlot.start_time}`,
        }).select('id').single();
        if (contactCreateError) throw contactCreateError;
        contactId = newContact.id;
      }

      if (contactId) {
        const { data: lead, error: leadError } = await admin
          .from('leads')
          .select('id')
          .eq('contact_id', contactId)
          .not('stage', 'eq', 'lost')
          .order('created_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (leadError) throw leadError;
        leadId = lead?.id || null;
      }

      const { data: appointment, error: appointmentError } = await admin.from('appointments').insert({
        client_name: String(body.client_name).trim(),
        client_email: email,
        client_phone: body.client_phone || null,
        service_id: service.id,
        service_name: service.name,
        service_duration_minutes: service.duration_minutes,
        mode,
        date: body.date,
        start_time: chosenSlot.start_time,
        end_time: chosenSlot.end_time,
        client_note: body.client_note || null,
        status: 'pending',
        linked_client_id: contactId,
        linked_lead_id: leadId,
      }).select('*').single();
      if (appointmentError) throw appointmentError;

      const adminHtml = baseEmail(`<h1 style="font-size:24px;text-align:center;margin:0 0 8px">New Booking Request</h1><p style="text-align:center;color:#666">A new appointment request has been received.</p><p><strong>Client:</strong> ${escapeHtml(appointment.client_name)}<br><strong>Email:</strong> ${escapeHtml(appointment.client_email)}<br><strong>Phone:</strong> ${escapeHtml(appointment.client_phone || 'Not supplied')}</p>${appointmentDetails(appointment)}${appointment.client_note ? `<p><strong>Client note:</strong> ${escapeHtml(appointment.client_note)}</p>` : ''}<p style="text-align:center"><a href="${siteUrl}/admin/appointments" style="display:inline-block;background:#B87333;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700">Review Request</a></p>`);
      await sendEmail('info@creativebooks.co.za', `New booking request | ${appointment.client_name}`, adminHtml).catch(() => null);
      await notifyAdminWhatsApp(`NEW BOOKING REQUEST\n${appointment.client_name}\n${appointment.service_name}\n${formatDate(appointment.date)} at ${formatTime(appointment.start_time)}\nReview: ${siteUrl}/admin/appointments`);

      return json({ success: true, appointment_id: appointment.id });
    }

    if (action === 'get_by_cancel_token') {
      if (!body.cancel_token) return json({ error: 'Missing token' }, 400);
      const { data: appt, error } = await admin
        .from('appointments')
        .select('client_name, service_name, date, start_time, end_time, mode, status')
        .eq('cancel_token', body.cancel_token)
        .maybeSingle();
      if (error) throw error;
      if (!appt) return json({ error: 'Not found' }, 404);
      return json({ success: true, appointment: appt });
    }

    if (action === 'cancel_by_client') {
      if (!body.cancel_token) return json({ error: 'Missing token' }, 400);
      const { data: appt, error } = await admin
        .from('appointments')
        .select('*')
        .eq('cancel_token', body.cancel_token)
        .maybeSingle();
      if (error) throw error;
      if (!appt) return json({ error: 'Not found' }, 404);
      if (['cancelled', 'completed', 'no_show'].includes(appt.status)) return json({ error: `Already ${appt.status}` }, 400);

      if (appt.google_event_id) await deleteGoogleCalendarEvent(appt.google_event_id).catch(() => null);
      const { error: updateError } = await admin.from('appointments').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      }).eq('id', appt.id);
      if (updateError) throw updateError;

      const cancelHtml = baseEmail(`<h1 style="font-size:24px;text-align:center;margin:0 0 8px">Appointment Cancelled</h1><p>Hi ${escapeHtml(appt.client_name)}, your appointment has been successfully cancelled.</p>${appointmentDetails(appt)}<p>To arrange a new time, <a href="${siteUrl}/book" style="color:#B87333">book another appointment online</a> or call us on 084 230 5393.</p>`);
      await sendEmail(appt.client_email, `Appointment Cancelled | ${appt.service_name}`, cancelHtml).catch(() => null);
      await notifyAdminWhatsApp(`APPOINTMENT CANCELLED BY CLIENT\n${appt.client_name}\n${appt.service_name}\n${formatDate(appt.date)} at ${formatTime(appt.start_time)}`);
      return json({ success: true });
    }

    if (['approve', 'decline', 'propose'].includes(action)) {
      await requireAdmin();
      if (!body.appointment_id) return json({ error: 'appointment_id is required' }, 400);
      let appt = await getAppointment(body.appointment_id);
      if (!appt) return json({ error: 'Appointment not found' }, 404);

      if (action === 'approve') {
        const { data: approved, error: approveError } = await admin.rpc('approve_appointment', {
          p_appointment_id: appt.id,
        });
        if (approveError) return json({ error: approveError.message }, approveError.message.includes('overlaps') ? 409 : 400);
        appt = approved;

        try {
          const googleEventId = await createGoogleCalendarEvent(appt);
          if (googleEventId) {
            await admin.from('appointments').update({ google_event_id: googleEventId }).eq('id', appt.id);
            appt.google_event_id = googleEventId;
          }
        } catch (calendarError) {
          console.warn('Google Calendar sync skipped:', (calendarError as Error).message);
        }

        const cancellationUrl = `${siteUrl}/appointment/cancel/${appt.cancel_token}`;
        const approvalHtml = baseEmail(`<h1 style="font-size:24px;text-align:center;margin:0 0 8px">Appointment Confirmed</h1><p>Hi ${escapeHtml(appt.client_name)}, your appointment is confirmed. We look forward to meeting with you.</p>${appointmentDetails(appt)}<p style="font-size:13px;color:#666">Need to cancel? <a href="${cancellationUrl}" style="color:#B87333">Use your secure cancellation link</a> or call us on 084 230 5393.</p>`);
        await sendEmail(appt.client_email, `Appointment Confirmed | ${appt.service_name}`, approvalHtml).catch(() => null);
        await notifyAdminWhatsApp(`APPOINTMENT APPROVED\n${appt.client_name}\n${appt.service_name}\n${formatDate(appt.date)} at ${formatTime(appt.start_time)}`);
        return json({ success: true, appointment: appt });
      }

      if (action === 'decline') {
        if (appt.google_event_id) await deleteGoogleCalendarEvent(appt.google_event_id).catch(() => null);
        const { data: updated, error: updateError } = await admin.from('appointments').update({
          status: 'declined',
          decline_reason: body.decline_reason || '',
          google_event_id: null,
        }).eq('id', appt.id).select('*').single();
        if (updateError) throw updateError;
        const reason = body.decline_reason
          ? `<div style="background:#fff8f8;border-left:4px solid #e11d48;padding:12px 16px;border-radius:8px;margin:20px 0">${escapeHtml(body.decline_reason)}</div>`
          : '';
        const declineHtml = baseEmail(`<h1 style="font-size:24px;text-align:center;margin:0 0 8px">Appointment Request Update</h1><p>Hi ${escapeHtml(appt.client_name)}, unfortunately we could not accommodate your requested time.</p>${reason}<p>Please <a href="${siteUrl}/book" style="color:#B87333">choose another available time</a> or call us on 084 230 5393.</p>`);
        await sendEmail(appt.client_email, `Appointment request update | ${appt.service_name}`, declineHtml).catch(() => null);
        await notifyAdminWhatsApp(`APPOINTMENT DECLINED\n${appt.client_name} | ${appt.service_name}`);
        return json({ success: true, appointment: updated });
      }

      if (!body.propose_date || !body.propose_time) return json({ error: 'Proposed date and time are required' }, 400);
      const proposedEnd = addMinutes(body.propose_time, appt.service_duration_minutes || 30);
      const { data: updated, error: updateError } = await admin.from('appointments').update({
        proposed_date: body.propose_date,
        proposed_start_time: body.propose_time,
        proposed_end_time: proposedEnd,
      }).eq('id', appt.id).select('*').single();
      if (updateError) throw updateError;
      const proposalHtml = baseEmail(`<h1 style="font-size:24px;text-align:center;margin:0 0 8px">New Time Suggested</h1><p>Hi ${escapeHtml(appt.client_name)}, your original requested slot was not available, but we have suggested an alternative.</p><table width="100%" style="background:#FAF5EE;border:1px solid #E5E0D5;border-radius:12px;margin:20px 0"><tr><td style="padding:16px;line-height:1.8"><strong>Service:</strong> ${escapeHtml(appt.service_name)}<br><strong>Date:</strong> ${escapeHtml(formatDate(body.propose_date))}<br><strong>Time:</strong> ${escapeHtml(formatTime(body.propose_time))} SAST</td></tr></table><p>Please reply to this email to confirm, or <a href="${siteUrl}/book" style="color:#B87333">book another available time</a>.</p>`);
      await sendEmail(appt.client_email, `New time proposed | ${appt.service_name}`, proposalHtml).catch(() => null);
      await notifyAdminWhatsApp(`APPOINTMENT NEW TIME PROPOSED\n${appt.client_name}\n${formatDate(body.propose_date)} at ${formatTime(body.propose_time)}`);
      return json({ success: true, appointment: updated });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = (error as Error).message || 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    return json({ error: message }, status);
  }
});
