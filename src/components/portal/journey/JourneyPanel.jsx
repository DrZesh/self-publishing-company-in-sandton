// "Journey" top section of the client portal: header with progress, the book's journey,
// booking a collection/delivery time (calendar pop-up, approved by the team), and sending files.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import cfg from './journey.config.js';
import Icon from './Icon.jsx';
import BookingSheet from './BookingSheet.jsx';
import { journeyApi } from './api.js';
import { ago, fmtDayLong } from './dates.js';
import './journey.css';

const BOOKING_SERVICES = { 'Book collection': 'collection', 'Book delivery': 'delivery' };
const t12 = (t) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`; };

// The CRM's project stage → where the book is on the road
const ROAD = [
  { id: 'quote', name: 'Quote accepted', icon: 'check' },
  { id: 'files', name: 'Files & editing', icon: 'pen' },
  { id: 'design', name: 'Cover & layout', icon: 'layers' },
  { id: 'proof', name: 'Your approval', icon: 'eye' },
  { id: 'print', name: 'Printing', icon: 'printer' },
  { id: 'handover', name: 'Hand-over', icon: 'truck' },
];
function roadIndex(stage = '') {
  const s = stage.toLowerCase();
  if (/deliver(ed)?$|complete|closed|handed/.test(s)) return 6;
  if (/ready|collect|dispatch|deliver/.test(s)) return 5;
  if (/print|bind|quality|pack/.test(s)) return 4;
  if (/proof|approv/.test(s)) return 3;
  if (/cover|typeset|layout|design|format/.test(s)) return 2;
  if (/file|manuscript|edit|brief|contract|deposit|paid|kick|onboard|accepted/.test(s)) return 1;
  return 0;
}

export default function JourneyPanel({ token, contact = {}, project, appointments = [], documents = [], onOpenChat }) {
  const [bookings, setBookings] = useState(() => appointments.filter((a) => BOOKING_SERVICES[a.service_name]).map((a) => ({ ...a, kind: BOOKING_SERVICES[a.service_name] })));
  const [docs, setDocs] = useState(documents);
  const [booking, setBooking] = useState(null); // null | 'collection' | 'delivery'
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState('');
  const [purpose, setPurpose] = useState('file');
  const [note, setNote] = useState('');
  const [drag, setDrag] = useState(false);
  const fileInput = useRef(null);

  const notify = (t) => { setToast(t); setTimeout(() => setToast(null), 4500); };
  const refresh = useCallback(async () => {
    try { setBookings(await journeyApi.mine(token)); } catch { /* keep what we have */ }
  }, [token]);
  useEffect(() => { refresh(); }, [refresh]);

  const first = (contact.full_name || contact.first_name || '').split(' ')[0];
  const title = project?.book_title || project?.title || '';
  const stage = project?.stage || project?.current_stage || '';
  const active = bookings.find((b) => ['pending', 'approved'].includes(b.status));
  const lastDeclined = !active ? bookings.find((b) => b.status === 'declined') : null;
  const handedOver = bookings.some((b) => ['approved', 'completed'].includes(b.status) && b.date < new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' }));
  const at = handedOver ? ROAD.length : Math.min(roadIndex(stage), ROAD.length);
  const pct = Math.round((Math.min(at, ROAD.length) / ROAD.length) * 100);
  const readyForHandover = at >= 5;

  let next;
  if (active?.status === 'pending') next = { label: 'Your book hand-over time is waiting for approval', icon: 'clock', go: () => document.getElementById('cp-handover')?.scrollIntoView({ behavior: 'smooth' }) };
  else if (active?.status === 'approved') next = { label: `Confirmed: ${fmtDayLong(active.date)}, ${t12(active.start_time)}`, icon: 'check', go: () => document.getElementById('cp-handover')?.scrollIntoView({ behavior: 'smooth' }) };
  else if (readyForHandover) next = { label: 'Book a collection or delivery time', icon: 'calendar', go: () => setBooking('collection') };
  else next = { label: stage ? `Now: ${stage}` : 'Your project is under way', icon: 'clock' };

  const upload = async (file) => {
    if (!file) return;
    if (file.size > cfg.upload.maxMB * 1024 * 1024) { notify(`That file is over ${cfg.upload.maxMB} MB. Please email it to ${cfg.company.email}.`); return; }
    setBusy('upload');
    try {
      await journeyApi.upload(token, file, purpose, note);
      setDocs((d) => [{ id: `new-${Date.now()}`, file_name: file.name, category: purpose === 'payment' ? 'Proof of Payment' : 'Client Supplied', created_date: new Date().toISOString(), status: 'Pending Review' }, ...d]);
      setNote('');
      notify(purpose === 'payment' ? "Proof of payment sent. We'll confirm once it reflects." : `${file.name} sent to our team.`);
    } catch (e) { notify(e.message); } finally { setBusy(''); }
  };
  const cancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await journeyApi.cancel(token, active.id); await refresh(); notify('Booking cancelled. We have let the team know.'); } catch (e) { notify(e.message); }
  };
  const sent = docs.filter((d) => ['Client Supplied', 'Proof of Payment'].includes(d.category)).slice(0, 5);

  return (
    <div className="cp-root cp-embed">
      {/* Header */}
      <section className="cp-hero">
        <svg className="cp-hero-art" viewBox="0 0 160 140" aria-hidden="true">
          <rect x="18" y="98" width="124" height="22" rx="4" fill="#3546D9" />
          <rect x="26" y="102" width="108" height="3" rx="1.5" fill="#C9D0FF" opacity=".6" />
          <rect x="28" y="74" width="112" height="22" rx="4" fill="#5B6CFF" />
          <rect x="36" y="78" width="96" height="3" rx="1.5" fill="#E0E4FF" opacity=".6" />
          <rect x="12" y="50" width="118" height="22" rx="4" fill="#A9B4FF" />
          <rect x="20" y="54" width="100" height="3" rx="1.5" fill="#FFFFFF" opacity=".7" />
          <g transform="rotate(-8 104 30)"><rect x="70" y="10" width="62" height="38" rx="4" fill="#FFFFFF" /><rect x="70" y="10" width="8" height="38" rx="3" fill="#D6DAEB" /></g>
          <circle cx="140" cy="20" r="4" fill="#7EE0B5" /><circle cx="20" cy="30" r="2.5" fill="#7EE0B5" />
        </svg>
        <div className="cp-hero-txt">
          <span className="cp-eyebrow">{first ? `Hi ${first}` : 'Welcome back'}</span>
          <h1>{at >= ROAD.length ? 'Your books are with you. Thank you!' : readyForHandover ? 'Your books are ready.' : title ? `${title} is on its way.` : 'Your book is on its way.'}</h1>
          {project?.service_type && <span className="cp-hero-spec">{project.service_type}</span>}
          <div className="cp-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Project progress"><i style={{ width: `${pct}%` }} /></div>
          <span className="cp-hero-spec">{pct}% of your journey{project?.stage_changed_at ? ` · updated ${ago(project.stage_changed_at)}` : ''}</span>
        </div>
        {next.go ? <button type="button" className="cp-next" onClick={next.go}><Icon name={next.icon} />{next.label}<Icon name="right" size={16} /></button>
          : <div className="cp-next static"><Icon name={next.icon} />{next.label}</div>}
      </section>

      <div className="cp-cols">
        <div className="cp-col">
          {/* Journey */}
          <section className="cp-card">
            <h2 className="cp-h2">Your book's journey</h2>
            <div className="cp-road" style={{ gridTemplateColumns: `repeat(${ROAD.length}, minmax(0, 1fr))` }}>
              <div className="cp-road-line" aria-hidden="true"><i style={{ width: `${Math.min(1, at / (ROAD.length - 1)) * 100}%` }} /></div>
              {ROAD.map((r, i) => {
                const state = i < at ? 'done' : i === at ? 'now' : 'next';
                return (
                  <div key={r.id} className={`cp-stop ${state}`} aria-label={`${r.name}: ${state === 'done' ? 'done' : state === 'now' ? 'in progress' : 'up next'}`}>
                    <span className="dot"><Icon name={state === 'done' ? 'check' : r.icon} size={20} /></span>
                    <span className="lbl">{r.name}</span>
                  </div>
                );
              })}
            </div>
            {stage && <p className="cp-muted sm">Current stage: <b>{stage}</b></p>}
          </section>

          {/* Send files */}
          <section className="cp-card">
            <h2 className="cp-h2">Send us files</h2>
            <div className="cp-seg small" role="group" aria-label="What are you sending?">
              <button type="button" aria-pressed={purpose === 'file'} className={purpose === 'file' ? 'on' : ''} onClick={() => setPurpose('file')}>Manuscript or other file</button>
              <button type="button" aria-pressed={purpose === 'payment'} className={purpose === 'payment' ? 'on' : ''} onClick={() => setPurpose('payment')}>Proof of payment</button>
            </div>
            <div className={`cp-drop ${drag ? 'over' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}>
              <Icon name="upload" size={26} />
              <span><b>Drop a file here</b> or</span>
              <button type="button" className="cp-btn" disabled={busy === 'upload'} onClick={() => fileInput.current.click()}>{busy === 'upload' ? 'Uploading…' : 'Choose file'}</button>
              <small className="cp-muted">PDF, Word, Excel, images or ZIP · up to {cfg.upload.maxMB} MB</small>
              <input ref={fileInput} type="file" accept={cfg.upload.accept} hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
            <label className="cp-field"><span className="sr">Note</span><input className="cp-in" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note with your file (optional)" /></label>
            {sent.length > 0 && (
              <ul className="cp-list">{sent.map((d) => <li key={d.id}><Icon name="file" size={16} /><span>{d.file_name || d.title}<small>{d.category === 'Proof of Payment' ? 'Proof of payment' : 'File'}{d.created_date ? ` · ${ago(d.created_date)}` : ''}</small></span><b className={d.status === 'Pending Review' ? 'amber' : 'green'}>{d.status === 'Pending Review' ? 'Received' : 'Checked'}</b></li>)}</ul>
            )}
          </section>
        </div>

        <div className="cp-col">
          {/* Hand-over */}
          <section className={`cp-card ${readyForHandover ? 'green' : ''}`} id="cp-handover">
            <div className="cp-row"><h2 className="cp-h2">Get your books</h2>{active && <span className={`cp-pill ${active.status === 'approved' ? 'green' : 'amber'}`}>{active.status === 'approved' ? 'Confirmed' : 'Waiting for approval'}</span>}</div>
            {!active && (
              <>
                {lastDeclined && <div className="cp-note red"><Icon name="alert" /><span>We couldn't do {fmtDayLong(lastDeclined.date)}, {t12(lastDeclined.start_time)}.{lastDeclined.decline_reason ? ` “${lastDeclined.decline_reason}”` : ''} Please choose another time.</span></div>}
                <p className="cp-muted">{readyForHandover ? 'Choose how and when you want your books. Our team confirms every time.' : 'You can choose a time now. We confirm it once your books are printed.'}</p>
                <div className="cp-two">
                  <button type="button" className="cp-option" onClick={() => setBooking('collection')}><Icon name="pin" size={22} /><b>Collect</b><span>{cfg.company.collectionAddress.split(',')[0]}</span></button>
                  <button type="button" className="cp-option" onClick={() => setBooking('delivery')}><Icon name="truck" size={22} /><b>Deliver</b><span>Courier to your door</span></button>
                </div>
              </>
            )}
            {active && (
              <>
                <div className="cp-slot">
                  <span className="cp-cal-tile"><small>{fmtDayLong(active.date).slice(0, 3).toUpperCase()}</small><b>{active.date.slice(8)}</b></span>
                  <div><b>{active.kind === 'delivery' ? 'Delivery' : 'Collection'} · {fmtDayLong(active.date)}</b><br />
                    <span className="cp-muted">{t12(active.start_time)}–{t12(active.end_time)} · {active.kind === 'delivery' ? (active.client_note || '').match(/Delivery address: (.*)/)?.[1] || 'your address' : cfg.company.collectionAddress}</span></div>
                </div>
                {active.status === 'pending' && <div className="cp-note amber"><Icon name="clock" /><span>Waiting for our team to confirm. We've emailed you a copy and will email again once it's approved.</span></div>}
                {active.status === 'approved' && <div className="cp-note green"><Icon name="check" /><span>Confirmed.{active.kind === 'collection' ? ' Please bring your ID.' : ' The courier will contact you on the day.'}</span></div>}
                <div className="cp-actions">
                  <button type="button" className="cp-btn" onClick={() => setBooking(active.kind)}>Change time</button>
                  <button type="button" className="cp-btn ghost" onClick={cancel}>Cancel</button>
                </div>
              </>
            )}
          </section>

          {/* Help */}
          <section className="cp-card cp-help">
            <h2 className="cp-h2">Need help?</h2>
            <div className="cp-actions">
              {onOpenChat && <button type="button" className="cp-btn" onClick={onOpenChat}><Icon name="message" size={16} />Message us</button>}
              <a className="cp-btn" href={`mailto:${cfg.company.email}${title ? `?subject=${encodeURIComponent(title)}` : ''}`}><Icon name="mail" size={16} />Email us</a>
            </div>
          </section>
        </div>
      </div>

      {booking && (
        <BookingSheet token={token} initialKind={booking} onClose={() => setBooking(null)}
          onBooked={async ({ kind }) => { setBooking(null); await refresh(); notify(`${kind === 'delivery' ? 'Delivery' : 'Collection'} requested. We've emailed you and will confirm soon.`); }} />
      )}
      {toast && <div className="cp-toast" role="status">{toast}</div>}
    </div>
  );
}
