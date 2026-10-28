import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('portalAppointments', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { action, appointment_id, contact_id, project_id, portal_token } = body;

    // ── PORTAL AUTHENTICATION ─────────────────────────────────────────────────
    // For portal users, use portal_token to find contact instead of app user auth
    let contact = null;
    
    if (portal_token) {
      // Find portal access by token
      const allAccess = await platform.asServiceRole.entities.ClientPortalAccess.filter({});
      const portalAccess = allAccess.find(p => 
        p.access_token === portal_token || p.custom_slug === portal_token
      );
      
      if (!portalAccess || !portalAccess.is_active) {
        return Response.json({ error: 'Invalid portal token' }, { status: 403 });
      }
      
      if (portalAccess.expires_at && new Date(portalAccess.expires_at) < new Date()) {
        return Response.json({ error: 'Portal token expired' }, { status: 403 });
      }
      
      // Get contact from portal access
      contact = await platform.asServiceRole.entities.Contact.get(portalAccess.contact_id);
      if (!contact) {
        return Response.json({ error: 'Contact not found' }, { status: 404 });
      }
    } else {
      // Fallback to app user auth (for admin testing)
      const user = await platform.auth.me();
      if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
      
      const contacts = await platform.asServiceRole.entities.Contact.filter({ email: user.email });
      if (!contacts.length) return Response.json({ error: 'Contact not found' }, { status: 404 });
      contact = contacts[0];
    }

    // ── GET AVAILABLE SLOTS ───────────────────────────────────────────────────
    if (action === 'get_available_slots') {
      const { service_id, date } = body;
      
      // Get service duration
      const services = await platform.asServiceRole.entities.BookingService.filter({ id: service_id, is_active: true });
      if (!services.length) return Response.json({ error: 'Service not found' }, { status: 404 });
      const service = services[0];
      
      // Get availability rules
      const dayOfWeek = new Date(date).toLocaleDateString('en-ZA', { weekday: 'long' });
      const rules = await platform.asServiceRole.entities.AvailabilityRule.filter({ weekday: dayOfWeek, is_open: true });
      
      if (!rules.length) {
        return Response.json({ available_slots: [] });
      }
      
      const rule = rules[0];
      const startHour = parseInt(rule.start_time.split(':')[0]);
      const endHour = parseInt(rule.end_time.split(':')[0]);
      
      // Get existing appointments for this date
      const existing = await platform.asServiceRole.entities.Appointment.filter({ 
        date, 
        status: ['pending', 'approved'] 
      });
      
      const slots = [];
      const duration = service.duration_minutes;
      const buffer = service.buffer_minutes || 15;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += duration + buffer) {
          const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          const endTimeMinutes = minute + duration;
          const endHourVal = hour + Math.floor(endTimeMinutes / 60);
          const endMinuteVal = endTimeMinutes % 60;
          const endTime = `${String(endHourVal).padStart(2, '0')}:${String(endMinuteVal).padStart(2, '0')}`;
          
          if (endHourVal > endHour) continue;
          
          // Check if slot is taken
          const isTaken = existing.some(apt => apt.start_time === startTime);
          if (!isTaken) {
            slots.push({ start_time: startTime, end_time: endTime, available: true });
          }
        }
      }
      
      return Response.json({ available_slots: slots, service });
    }

    // ── CREATE APPOINTMENT ────────────────────────────────────────────────────
    if (action === 'create_appointment') {
      let { service_id, service_name, date, start_time, end_time, mode, client_note, booking_type } = body;
      
      // Contact already resolved from portal_token or user auth above
      
      // If service_id not provided, get the first active BookingService
      if (!service_id) {
        const services = await platform.asServiceRole.entities.BookingService.filter({ is_active: true });
        if (services.length) {
          service_id = services[0].id;
          service_name = service_name || services[0].name;
        }
      }
      
      const cancelToken = `cancel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const rescheduleToken = `reschedule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const appointmentData = {
        client_name: contact.full_name,
        client_email: contact.email,
        client_phone: contact.phone || '',
        service_name: service_name || 'Discovery Call',
        date,
        start_time,
        mode: mode || 'zoom',
        client_note: client_note || '',
        status: 'pending',
        cancel_token: cancelToken,
        reschedule_token: rescheduleToken,
        linked_client_id: contact.id,
        linked_lead_id: project_id || null,
      };
      
      // Add service_id if available
      if (service_id) {
        appointmentData.service_id = service_id;
      }
      
      const appointment = await platform.asServiceRole.entities.Appointment.create(appointmentData);
      
      // Admin notification is handled by the onNewAppointment automation (WhatsApp + email)
      // Client confirmation will be sent after admin approves
      
      return Response.json({ success: true, appointment });
    }

    // ── GET MY APPOINTMENTS ───────────────────────────────────────────────────
    if (action === 'get_my_appointments') {
      // Contact already resolved from portal_token or user auth above
      
      const appointments = await platform.asServiceRole.entities.Appointment.filter({ 
        linked_client_id: contact.id 
      }, '-date');
      
      return Response.json({ appointments });
    }

    // ── CANCEL APPOINTMENT ────────────────────────────────────────────────────
    if (action === 'cancel_appointment') {
      const { token, reason } = body;
      const appointments = await platform.asServiceRole.entities.Appointment.filter({ cancel_token: token });
      if (!appointments.length) return Response.json({ error: 'Invalid token' }, { status: 404 });
      
      const apt = appointments[0];
      await platform.asServiceRole.entities.Appointment.update(apt.id, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        decline_reason: reason || '',
      });
      
      // Notify client
      await platform.asServiceRole.functions.invoke('sendBrandedEmail', {
        to: apt.client_email,
        subject: 'Appointment Cancelled - Creative Books SA',
        template_name: 'appointment_cancelled',
        variables: {
          client_name: apt.client_name,
          service_name: apt.service_name,
          date: apt.date,
        }
      });
      
      return Response.json({ success: true });
    }

    // ── ADMIN: APPROVE APPOINTMENT ────────────────────────────────────────────
    if (action === 'admin_approve') {
      const { zoom_link } = body;
      const appointments = await platform.asServiceRole.entities.Appointment.filter({ id: appointment_id });
      if (!appointments.length) return Response.json({ error: 'Not found' }, { status: 404 });
      
      const apt = appointments[0];
      await platform.asServiceRole.entities.Appointment.update(appointment_id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        zoom_link: zoom_link || '',
      });
      
      // Notify client
      await platform.asServiceRole.functions.invoke('sendBrandedEmail', {
        to: apt.client_email,
        subject: 'Appointment Confirmed - Creative Books SA',
        template_name: 'appointment_confirmed',
        variables: {
          client_name: apt.client_name,
          service_name: apt.service_name,
          date: apt.date,
          start_time: apt.start_time,
          zoom_link: zoom_link || 'Will be sent closer to date',
        }
      });
      
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});