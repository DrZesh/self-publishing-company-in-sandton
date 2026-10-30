// Date helpers. Everything is shown in South African time (UTC+2, no daylight saving).
import cfg from './journey.config.js';

const OFFSET = '+02:00';
export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// SAST wall-clock → ISO instant
export const sastIso = (day, hhmm) => new Date(`${day}T${hhmm}:00${OFFSET}`).toISOString();
// ISO instant → SAST parts
export function sastParts(iso) {
  const d = new Date(new Date(iso).getTime() + 2 * 3600 * 1000);
  return { day: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`, dow: d.getUTCDay() };
}
export const todaySast = () => sastParts(new Date().toISOString()).day;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthName = (m) => MONTHS[m];
export const fmtDay = (day) => { const d = fromYmd(day); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`; };
export const fmtDayLong = (day) => { const d = fromYmd(day); return `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const fmtWhen = (iso) => { const p = sastParts(iso); return `${fmtDay(p.day)}, ${p.time}`; };
export const fmtRange = (s, e) => `${sastParts(s).time}–${sastParts(e).time}`;
export const ago = (iso) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24); return d === 1 ? 'yesterday' : `${d} days ago`;
};

// 6-week month grid, Monday first
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => { const d = addDays(start, i); return { day: ymd(d), date: d.getDate(), inMonth: d.getMonth() === month, dow: d.getDay() }; });
}

// Demo-mode slot generation (Supabase mode asks the database instead)
export function generateSlots(kind, fromDay, toDay, appointments = []) {
  const r = cfg.booking[kind]; const out = [];
  const tomorrow = ymd(addDays(fromYmd(todaySast()), 1));
  const last = ymd(addDays(fromYmd(todaySast()), cfg.booking.horizonDays));
  for (let d = fromYmd(fromDay < tomorrow ? tomorrow : fromDay); ymd(d) <= toDay && ymd(d) <= last; d = addDays(d, 1)) {
    const day = ymd(d);
    if (!r.weekdays.includes(d.getDay()) || cfg.holidays[day]) continue;
    const [oh, om] = r.open.split(':').map(Number); const [ch, cm] = r.close.split(':').map(Number);
    for (let t = oh * 60 + om; t + r.slotMinutes <= ch * 60 + cm; t += r.slotMinutes) {
      const s = sastIso(day, `${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
      const e = sastIso(day, `${pad(Math.floor((t + r.slotMinutes) / 60))}:${pad((t + r.slotMinutes) % 60)}`);
      const used = appointments.filter((a) => a.kind === kind && ['requested', 'approved'].includes(a.status) && new Date(a.starts_at).getTime() === new Date(s).getTime()).length;
      out.push({ starts_at: s, ends_at: e, remaining: r.capacity - used });
    }
  }
  return out;
}
