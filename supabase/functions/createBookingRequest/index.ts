import { createClientFromRequest, serve } from '../_shared/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function generateToken() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

async function sendAdminAlert(appt) {
  if (!RESEND_API_KEY) return;
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 16px;"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr><tr><td align="center" style="padding:28px 0 16px;"><img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" /></td></tr><tr><td style="padding:0 32px 32px;"><div style="padding:24px 0;"><h1 style="font-size:24px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 6px 0;">📅 New Booking Request</h1><p style="font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 24px 0;">A new appointment request has been received.</p><table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px;"><tr><td style="background:#FAF5EE;padding:0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Client</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.client_name + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Email</td><td style="padding:10px 14px;font-size:14px;color:#B87333;border-bottom:1px solid #E5E0D5;">' + appt.client_email + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Phone</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + (appt.client_phone || '—') + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Service</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + appt.service_name + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Date &amp; Time</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + formatDate(appt.date) + ' at ' + formatTime(appt.start_time) + '</td></tr><tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;' + (appt.client_note ? 'border-bottom:1px solid #E5E0D5;' : '') + '">Format</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;' + (appt.client_note ? 'border-bottom:1px solid #E5E0D5;' : '') + '">' + (appt.mode === 'zoom' ? 'Zoom' : 'On-site') + '</td></tr>' + (appt.client_note ? '<tr><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;">Note</td><td style="padding:10px 14px;font-size:14px;color:#2C2C2C;">' + appt.client_note + '</td></tr>' : '') + '</table></td></tr></table><div style="text-align:center;"><a href="https://creativebooks.co.za/admin/appointments" style="display:inline-block;background:#B87333;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Review Request →</a></div></div></td></tr><tr><td align="center" style="padding:16px 32px 24px;font-size:12px;color:#AAAAAA;">Creative Books SA · Prism Office Park, Fourways · 084 230 5393</td></tr></table></td></tr></table></body></html>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Creative Books SA Bookings <info@creativebooks.co.za>',
      to: ['info@creativebooks.co.za', 'draubreyzesh@gmail.com'],
      subject: `📅 New booking request — ${appt.client_name}`,
      html,
    }),
  });
  const result = await res.json().catch(() => ({}));
  console.log('Admin booking alert Resend response:', res.status, JSON.stringify(result));
}

serve('createBookingRequest', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { service_id, service_name, service_duration_minutes, mode, date, start_time, end_time, client_name, client_email, client_phone, client_note } = body;

    if (!service_id || !date || !start_time || !client_name || !client_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try to find existing Contact or Lead by email
    let linked_client_id = null;
    let linked_lead_id = null;

    const contacts = await platform.asServiceRole.entities.Contact.filter({ email: client_email });
    if (contacts.length > 0) {
      linked_client_id = contacts[0].id;
    } else {
      // Check Lead
      const leads = await platform.asServiceRole.entities.Lead.filter({ email: client_email });
      if (leads.length > 0) {
        linked_lead_id = leads[0].id;
      } else {
        // Create new Contact
        const newContact = await platform.asServiceRole.entities.Contact.create({
          full_name: client_name,
          email: client_email,
          phone: client_phone || '',
          how_heard: 'other',
          lifecycle_stage: 'lead',
          pipeline_stage: 'New Enquiry',
          description: `Booked via website: ${service_name} on ${date} at ${start_time}`,
        });
        linked_client_id = newContact.id;
      }
    }

    const appointment = await platform.asServiceRole.entities.Appointment.create({
      client_name,
      client_email,
      client_phone: client_phone || '',
      service_id,
      service_name,
      service_duration_minutes,
      mode,
      date,
      start_time,
      end_time,
      client_note: client_note || '',
      status: 'pending',
      linked_client_id,
      linked_lead_id,
      cancel_token: generateToken(),
      reschedule_token: generateToken(),
    });

    // Send admin alert email synchronously so notification is guaranteed
    await sendAdminAlert(appointment).catch((e) => console.error('Admin alert failed:', e.message));

    return Response.json({ success: true, appointment_id: appointment.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});