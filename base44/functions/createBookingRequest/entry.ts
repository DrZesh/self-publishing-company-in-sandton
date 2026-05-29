import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { service_id, service_name, service_duration_minutes, mode, date, start_time, end_time, client_name, client_email, client_phone, client_note } = body;

    if (!service_id || !date || !start_time || !client_name || !client_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try to find existing Contact or Lead by email
    let linked_client_id = null;
    let linked_lead_id = null;

    const contacts = await base44.asServiceRole.entities.Contact.filter({ email: client_email });
    if (contacts.length > 0) {
      linked_client_id = contacts[0].id;
    } else {
      // Check Lead
      const leads = await base44.asServiceRole.entities.Lead.filter({ email: client_email });
      if (leads.length > 0) {
        linked_lead_id = leads[0].id;
      } else {
        // Create new Contact
        const newContact = await base44.asServiceRole.entities.Contact.create({
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

    const appointment = await base44.asServiceRole.entities.Appointment.create({
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

    return Response.json({ success: true, appointment_id: appointment.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});