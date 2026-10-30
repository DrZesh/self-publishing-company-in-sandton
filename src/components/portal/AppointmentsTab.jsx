// Client portal "Book an Appointment" tab: pick a consultation type from Booking Settings and choose a time
// in the same calendar pop-up used for collections/deliveries. Requests go to the CRM Appointments tab for approval.
import React, { useEffect, useState } from 'react';
import Icon from '@/components/portal/journey/Icon.jsx';
import BookingSheet from '@/components/portal/journey/BookingSheet.jsx';
import { journeyApi } from '@/components/portal/journey/api.js';
import { fmtDayLong } from '@/components/portal/journey/dates.js';
import '@/components/portal/journey/journey.css';

const t12 = (t) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`; };
const STATUS = { pending: ['amber', 'Waiting for approval'], approved: ['green', 'Confirmed'], completed: ['green', 'Completed'], declined: ['red', 'Not possible'], cancelled: ['', 'Cancelled'], no_show: ['', 'Missed'] };

export default function AppointmentsTab({ appointments = [], portalToken }) {
  const [services, setServices] = useState(null);
  const [err, setErr] = useState(null);
  const [list, setList] = useState(appointments);
  const [sheet, setSheet] = useState(null); // { service } | { kind }
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let live = true;
    journeyApi.services(portalToken).then((s) => live && setServices(s)).catch((e) => live && setErr(e.message));
    return () => { live = false; };
  }, [portalToken]);

  const notify = (t) => { setToast(t); setTimeout(() => setToast(null), 4500); };
  const sorted = [...list].sort((a, b) => `${b.date}${b.start_time}`.localeCompare(`${a.date}${a.start_time}`));

  const cancel = async (a) => {
    if (!window.confirm(`Cancel ${a.service_name} on ${fmtDayLong(a.date)}?`)) return;
    try { await journeyApi.cancel(portalToken, a.id); setList((l) => l.map((x) => (x.id === a.id ? { ...x, status: 'cancelled' } : x))); notify('Cancelled. We have let the team know.'); } catch (e) { notify(e.message); }
  };

  return (
    <div className="cp-root cp-embed">
      <section className="cp-card">
        <h2 className="cp-h2">Book an appointment</h2>
        <p className="cp-muted">Choose what you'd like to meet about, then pick a time. Our team confirms every request by email.</p>
        {err && <div className="cp-err" role="alert">{err}</div>}
        {!services && !err && <p className="cp-muted sm">Loading appointment types…</p>}
        {services && (
          <div className="cp-two">
            {services.map((s) => (
              <button key={s.id} type="button" className="cp-option" onClick={() => setSheet({ service: s })}>
                <Icon name="calendar" size={22} /><b>{s.name}</b>
                <span>{s.duration_minutes} min · {s.allowed_modes.map((m) => (m === 'zoom' ? 'Zoom' : 'At our office')).join(' or ')}</span>
              </button>
            ))}
            <button type="button" className="cp-option" onClick={() => setSheet({ kind: 'collection' })}>
              <Icon name="truck" size={22} /><b>Collect or deliver my books</b><span>Choose a hand-over time</span>
            </button>
          </div>
        )}
      </section>

      <section className="cp-card">
        <h2 className="cp-h2">Your appointments</h2>
        {sorted.length === 0 ? <p className="cp-muted">No appointments yet.</p> : (
          <ul className="cp-list">
            {sorted.map((a) => {
              const [tone, label] = STATUS[a.status] || ['', a.status];
              const open = ['pending', 'approved'].includes(a.status);
              return (
                <li key={a.id}>
                  <Icon name="calendar" size={16} />
                  <span>{a.service_name}<small>{a.date ? `${fmtDayLong(a.date)}, ${t12(a.start_time)}` : ''}{a.mode === 'zoom' ? ' · Zoom' : ''}</small></span>
                  {a.status === 'approved' && a.zoom_link
                    ? <a className="cp-btn sm" href={a.zoom_link} target="_blank" rel="noreferrer">Join call</a>
                    : <b className={tone}>{label}</b>}
                  {open && !String(a.id).startsWith('new-') && <button type="button" className="cp-btn ghost sm" onClick={() => cancel(a)}>Cancel</button>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {sheet && (
        <BookingSheet token={portalToken} service={sheet.service || null} initialKind={sheet.kind || 'collection'} onClose={() => setSheet(null)}
          onBooked={({ kind, day, slot }) => {
            const name = sheet.service ? sheet.service.name : kind === 'delivery' ? 'Book delivery' : 'Book collection';
            setList((l) => [{ id: `new-${Date.now()}`, service_name: name, date: day, start_time: slot.start, end_time: slot.end, status: 'pending' }, ...l]);
            setSheet(null);
            notify("Request sent. We've emailed you and will confirm soon.");
          }} />
      )}
      {toast && <div className="cp-toast" role="status">{toast}</div>}
    </div>
  );
}
