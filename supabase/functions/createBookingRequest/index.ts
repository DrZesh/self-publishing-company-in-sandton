import { queueRecordEmails } from '../_shared/notifications.js';
import { createClientFromRequest, serve } from '../_shared/server.ts';

function generateToken() { return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', ''); }

serve('createBookingRequest', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { service_id, service_name, service_duration_minutes, mode, date, start_time, end_time, client_name, client_email, client_phone, client_note } = body;

    if (!service_id || !date || !start_time || !client_name || !client_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof client_email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email) || typeof client_name !== 'string' || !client_name.trim() || client_name.length > 200 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(start_time)) {
      return Response.json({ error: 'Please provide valid contact details, date and time.' }, { status: 400 });
    }

    let service;
    try { service = await platform.asServiceRole.entities.BookingService.get(service_id); }
    catch { return Response.json({ error: 'Please select an available booking service.' }, { status: 400 }); }
    if (!service || service.is_active === false) return Response.json({ error: 'This booking service is unavailable.' }, { status: 400 });

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
      service_name: service.name,
      service_duration_minutes: service.duration_minutes || 30,
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

    queueRecordEmails(platform, 'booking', appointment.id);

    return Response.json({ success: true, appointment_id: appointment.id });
  } catch (error) {
    console.error('Booking save failed:', error);
    return Response.json({ error: 'Your booking request could not be saved. Please try again.' }, { status: 500 });
  }
});