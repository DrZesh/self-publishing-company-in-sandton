// Calendar pop-up for booking a book collection or delivery. Requests go to the CRM Appointments calendar for approval.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import cfg from './journey.config.js';
import Calendar from './Calendar.jsx';
import Icon from './Icon.jsx';
import { journeyApi } from './api.js';
import { addDays, fmtDayLong, fromYmd, todaySast, ymd } from './dates.js';

const t12 = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`; };

// Pass `service` ({ id, name, allowed_modes, duration_minutes, prep_tips }) to book a consultation instead of a hand-over.
export default function BookingSheet({ token, onClose, onBooked, initialKind = 'collection', defaultAddress = '', service = null }) {
  const t0 = fromYmd(todaySast());
  const [kind, setKind] = useState(service ? `service:${service.id}` : initialKind);
  const [mode, setMode] = useState(service?.allowed_modes?.[0] || 'on_site');
  const [ym, setYm] = useState({ y: t0.getFullYear(), m: t0.getMonth() });
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const dialog = useRef(null);
  const autoJumps = useRef(2); // open on the first month that has free times

  useEffect(() => {
    const prev = document.activeElement; dialog.current?.focus();
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [onClose]);

  useEffect(() => {
    let live = true;
    const from = ymd(new Date(ym.y, ym.m, 1)); const to = ymd(new Date(ym.y, ym.m + 1, 0));
    setLoading(true); setErr(null);
    journeyApi.month(token, kind, from, to).then((d) => {
      if (!live) return;
      const free = Object.values(d).some((l) => l.some((x) => x.remaining > 0));
      if (!free && autoJumps.current > 0) { autoJumps.current -= 1; setYm(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })); return; }
      autoJumps.current = 0; setDays(d);
    }).catch((e) => live && setErr(e.message)).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [token, kind, ym]);

  const daySlots = day ? (days[day] || []) : [];
  const maxDay = ymd(addDays(t0, cfg.booking.horizonDays));
  const info = (d) => {
    if (cfg.holidays[d]) return { disabled: true, reason: cfg.holidays[d] };
    const s = days[d];
    if (!s) return { disabled: true, reason: d <= todaySast() ? 'Not available' : d > maxDay ? 'Too far ahead' : 'Closed' };
    const free = s.filter((x) => x.remaining > 0).length;
    return free ? { dots: [free <= 1 ? 'amber' : 'green'] } : { disabled: true, reason: 'Fully booked' };
  };
  const pickKind = (k) => { autoJumps.current = 2; setYm({ y: t0.getFullYear(), m: t0.getMonth() }); setKind(k); setDay(null); setSlot(null); };
  const ok = slot && (kind !== 'delivery' || address.trim().length > 5);
  const monthHasFree = useMemo(() => Object.values(days).some((l) => l.some((x) => x.remaining > 0)), [days]);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      await journeyApi.request(token, { kind, date: day, start_time: slot.start, address, note: notes, mode });
      onBooked({ kind, day, slot });
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="cp-sheet-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cp-sheet" role="dialog" aria-modal="true" aria-labelledby="bk-title" tabIndex={-1} ref={dialog}>
        <div className="cp-sheet-hd">
          <h2 id="bk-title">{service ? service.name : `Choose a ${kind === 'delivery' ? 'delivery' : 'collection'} time`}</h2>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="cp-sheet-bd">
          {service ? (
            <>
              {service.allowed_modes?.length > 1 && (
                <div className="cp-seg" role="group" aria-label="How would you like to meet?">
                  {service.allowed_modes.map((m) => <button key={m} type="button" aria-pressed={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}><Icon name={m === 'zoom' ? 'eye' : 'pin'} size={16} />{m === 'zoom' ? 'Zoom call' : 'At our office'}</button>)}
                </div>
              )}
              <p className="cp-muted sm">{service.duration_minutes ? `${service.duration_minutes} minutes · ` : ''}{mode === 'zoom' ? 'We email the Zoom link once your time is confirmed.' : `At ${cfg.company.collectionAddress}.`}</p>
            </>
          ) : (<>
          <div className="cp-seg" role="group" aria-label="How do you want your books?">
            <button type="button" aria-pressed={kind === 'collection'} className={kind === 'collection' ? 'on' : ''} onClick={() => pickKind('collection')}><Icon name="pin" size={16} />Collect</button>
            <button type="button" aria-pressed={kind === 'delivery'} className={kind === 'delivery' ? 'on' : ''} onClick={() => pickKind('delivery')}><Icon name="truck" size={16} />Deliver</button>
          </div>
          <p className="cp-muted sm">{kind === 'collection' ? `At ${cfg.company.collectionAddress}. One-hour slots on our open days.` : 'Courier to your door. Morning or afternoon window on our open days.'}</p>
          </>)}

          <Calendar year={ym.y} month={ym.m} onMonth={(y, m) => { setYm({ y, m }); setDay(null); setSlot(null); }} selected={day}
            onSelect={(d) => { setDay(d); setSlot(null); }} info={info} loading={loading}
            minMonth={`${t0.getFullYear()}-${String(t0.getMonth() + 1).padStart(2, '0')}`} maxMonth={maxDay.slice(0, 7)} />
          <div className="cp-legend"><span><i className="green" />Available</span><span><i className="amber" />Almost full</span><span><i className="off" />Unavailable</span></div>
          {!loading && !monthHasFree && !err && <p className="cp-muted sm">No free times this month. Try the next month.</p>}

          {day && (
            <div className="cp-times">
              <div className="cp-label">{fmtDayLong(day)}</div>
              <div className="cp-chips" role="group" aria-label="Times">
                {daySlots.map((s) => (
                  <button key={s.start} type="button" disabled={s.remaining <= 0} aria-pressed={slot?.start === s.start}
                    className={`cp-chip ${slot?.start === s.start ? 'on' : ''}`} onClick={() => setSlot(s)}>
                    <Icon name="clock" size={14} />{t12(s.start)}–{t12(s.end)}{s.remaining === 1 ? <small> · last spot</small> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {kind === 'delivery' && (
            <label className="cp-field"><span className="cp-label">Delivery address</span>
              <textarea className="cp-in" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, suburb, city, postal code" /></label>
          )}
          <label className="cp-field"><span className="cp-label">Note for our team <span className="cp-muted">(optional)</span></span>
            <input className="cp-in" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={service ? 'What would you like to discuss?' : kind === 'collection' ? 'e.g. my driver will collect' : 'e.g. gate code, contact person'} /></label>
          {service?.prep_tips && <div className="cp-note green"><Icon name="check" /><span><b>Please bring:</b> {service.prep_tips}</span></div>}
          {err && <div className="cp-err" role="alert">{err}</div>}
        </div>
        <div className="cp-sheet-ft">
          <div className="cp-summary">{slot ? <><b>{fmtDayLong(day)}</b>, {t12(slot.start)}–{t12(slot.end)}</> : 'Pick a day and time'}</div>
          <button type="button" className="cp-btn primary" disabled={!ok || busy} onClick={submit}>{busy ? 'Sending…' : 'Request this time'}</button>
          <p className="cp-muted sm">Our team confirms every request. You'll get an email either way.</p>
        </div>
      </div>
    </div>
  );
}
