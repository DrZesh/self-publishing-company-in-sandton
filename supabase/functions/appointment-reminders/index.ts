import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
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

function formatTime(hhmm: string) {
  const [hour, minute] = hhmm.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00+02:00`).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg',
  });
}

function appointmentTimeMs(dateValue: string, timeValue: string) {
  return new Date(`${dateValue}T${timeValue}:00+02:00`).getTime();
}

function reminderEmail(appt: Record<string, unknown>, label: string) {
  const modeLabel = appt.mode === 'zoom'
    ? 'Zoom'
    : 'On-site, Creative Books SA, Johannesburg';
  return `<!doctype html><html><body style="margin:0;background:#F5F5F5;font-family:Arial,sans-serif;color:#2C2C2C"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px"><tr><td align="center"><table width="100%" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)"><tr><td style="height:10px;background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6)"></td></tr><tr><td style="background:#1A1208;padding:26px 32px"><div style="font-size:22px;font-weight:800;color:#B87333">CREATIVE BOOKS SA</div><div style="font-size:12px;color:#fff;opacity:.6;margin-top:4px">Appointment Reminder</div></td></tr><tr><td style="padding:30px 32px"><h1 style="font-size:24px;text-align:center;margin:0 0 8px">Appointment Reminder</h1><p style="text-align:center;color:#666">Your appointment is <strong>${escapeHtml(label)}</strong>.</p><table width="100%" style="background:#FAF5EE;border:1px solid #E5E0D5;border-radius:12px;margin:22px 0"><tr><td style="padding:16px;line-height:1.8"><strong>Name:</strong> ${escapeHtml(appt.client_name)}<br><strong>Service:</strong> ${escapeHtml(appt.service_name)}<br><strong>Date:</strong> ${escapeHtml(formatDate(String(appt.date)))}<br><strong>Time:</strong> ${escapeHtml(formatTime(String(appt.start_time)))} SAST<br><strong>Format:</strong> ${escapeHtml(modeLabel)}</td></tr></table><p style="font-size:13px;color:#666;text-align:center">Questions or changes? Call 084 230 5393 or reply to this email.</p></td></tr><tr><td style="padding:18px 32px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee">Creative Books SA · Fourways, Johannesburg · 084 230 5393</td></tr></table></td></tr></table></body></html>`;
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

  const cronSecret = Deno.env.get('APPOINTMENT_CRON_SECRET');
  const requestCronSecret = request.headers.get('x-cron-secret');
  const cronAuthorized = Boolean(cronSecret && requestCronSecret && requestCronSecret === cronSecret);

  if (!cronAuthorized) {
    const authorization = request.headers.get('authorization') || '';
    const bearer = authorization.replace(/^Bearer\s+/i, '');
    if (!bearer) return json({ error: 'Unauthorized' }, 401);
    const { data: userData, error: userError } = await admin.auth.getUser(bearer);
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (!['super_admin', 'admin'].includes(profile?.role)) return json({ error: 'Admin access required' }, 403);
  }

  const sendEmail = async (to: string, subject: string, html: string) => {
    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) return false;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [to], subject, html,
      }),
    });
    return response.ok;
  };

  const notifyAdminWhatsApp = async (message: string) => {
    const key = Deno.env.get('CALLMEBOT_API_KEY');
    const number = Deno.env.get('WHATSAPP_NOTIFY_NUMBER');
    if (!key || !number) return;
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(number)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(key)}`).catch(() => null);
  };

  try {
    const nowMs = Date.now();
    const h24 = 24 * 60 * 60 * 1000;
    const h1 = 60 * 60 * 1000;
    const windowMs = 30 * 60 * 1000;
    const localToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    const { data: appointments, error } = await admin
      .from('appointments')
      .select('*')
      .eq('status', 'approved')
      .gte('date', localToday)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(500);
    if (error) throw error;

    let sent24 = 0;
    let sent1 = 0;

    for (const appt of appointments || []) {
      const apptMs = appointmentTimeMs(appt.date, appt.start_time);
      if (apptMs <= nowMs) continue;
      const until = apptMs - nowMs;

      if (!appt.reminder_24h_sent && until <= h24 && until > h24 - windowMs) {
        const sent = await sendEmail(
          appt.client_email,
          `Reminder: Your ${appt.service_name} appointment is tomorrow`,
          reminderEmail(appt, 'tomorrow'),
        );
        if (sent) {
          await admin.from('appointments').update({ reminder_24h_sent: true }).eq('id', appt.id);
          sent24 += 1;
        }
      }

      if (!appt.reminder_1h_sent && until <= h1 && until > h1 - windowMs) {
        const sent = await sendEmail(
          appt.client_email,
          `Reminder: Your ${appt.service_name} appointment is in 1 hour`,
          reminderEmail(appt, 'in 1 hour'),
        );
        if (sent) {
          await admin.from('appointments').update({ reminder_1h_sent: true }).eq('id', appt.id);
          await notifyAdminWhatsApp(`1 HOUR APPOINTMENT REMINDER SENT\n${appt.client_name} | ${appt.service_name} at ${formatTime(appt.start_time)}`);
          sent1 += 1;
        }
      }
    }

    return json({ success: true, sent_24h: sent24, sent_1h: sent1 });
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected error' }, 500);
  }
});
