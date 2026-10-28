import { createClientFromRequest, serve } from '../_shared/server.ts';

// SAST = UTC+2
const SAST_OFFSET_HOURS = 2;

function toSastNow() {
  const now = new Date();
  now.setHours(now.getHours() + SAST_OFFSET_HOURS);
  return now;
}

function parseHHMM(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function addMinutes(hhmm, mins) {
  const total = parseHHMM(hhmm) + mins;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function slotsOverlap(startA, endA, startB, endB) {
  return parseHHMM(startA) < parseHHMM(endB) && parseHHMM(endA) > parseHHMM(startB);
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

serve('getAvailableSlots', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const body = await req.json();
    const { serviceId, date } = body;

    if (!serviceId || !date) {
      return Response.json({ error: 'serviceId and date required' }, { status: 400 });
    }

    // Load service
    const service = await platform.asServiceRole.entities.BookingService.get(serviceId);
    if (!service) return Response.json({ error: 'Service not found' }, { status: 404 });

    // date = 'YYYY-MM-DD'
    const dateObj = new Date(date + 'T00:00:00');
    const weekdayName = WEEKDAY_NAMES[dateObj.getDay()];

    // Load availability rules
    const rules = await platform.asServiceRole.entities.AvailabilityRule.list();
    const rule = rules.find(r => r.weekday === weekdayName);

    if (!rule || !rule.is_open || !rule.start_time || !rule.end_time) {
      return Response.json({ slots: [], reason: 'Not a working day' });
    }

    // Get min_notice_hours from Monday rule (global setting) or default 24
    const mondayRule = rules.find(r => r.weekday === 'Monday');
    const minNoticeHours = mondayRule?.min_notice_hours ?? 24;

    const duration = service.duration_minutes || 30;
    const buffer = service.buffer_minutes || 0;
    const step = duration + buffer;

    // Generate all possible slots
    const allSlots = [];
    let cursor = rule.start_time;
    while (true) {
      const slotEnd = addMinutes(cursor, duration);
      if (parseHHMM(slotEnd) > parseHHMM(rule.end_time)) break;
      allSlots.push({ start: cursor, end: slotEnd });
      cursor = addMinutes(cursor, step);
    }

    // Compute cutoff: SAST now + minNoticeHours
    const sastNow = toSastNow();
    const cutoffMs = sastNow.getTime() + minNoticeHours * 3600 * 1000;

    // Load approved appointments on that date to block slots
    const approvedAppts = await platform.asServiceRole.entities.Appointment.filter({
      date: date,
      status: 'approved',
    });

    // Filter slots
    const openSlots = allSlots.filter(slot => {
      // Check if slot is past or inside notice window
      const slotDateTimeStr = `${date}T${slot.start}:00+02:00`;
      const slotMs = new Date(slotDateTimeStr).getTime();
      if (slotMs <= cutoffMs) return false;

      // Check overlap with approved appointments
      for (const appt of approvedAppts) {
        if (slotsOverlap(slot.start, slot.end, appt.start_time, appt.end_time)) {
          return false;
        }
      }
      return true;
    });

    return Response.json({ slots: openSlots, weekday: weekdayName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});