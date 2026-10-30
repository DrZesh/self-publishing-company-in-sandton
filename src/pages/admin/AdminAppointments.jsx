// CRM → Appointments: one calendar for every appointment (meetings, book collections, deliveries),
// a "waiting for approval" queue, and the day's bookings with Approve / Decline / Move.
// Also: client uploads from the portal, and the full list. Data and emails are the existing ones:
// the `appointment` records and the appointmentActions function (approve, decline, propose, reminders).
// The previous page is kept at /admin/appointments-classic.
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import Calendar from '@/components/portal/journey/Calendar.jsx';
import Icon from '@/components/portal/journey/Icon.jsx';
import { fmtDay, fmtDayLong, fromYmd, todaySast, ago } from '@/components/portal/journey/dates.js';
import '@/components/portal/journey/journey.css';

const kindOf = (a) => { const n = (a?.service_name || '').toLowerCase(); return n.includes('collect') ? 'collection' : n.includes('deliver') ? 'delivery' : 'meeting'; };
const KIND = { meeting: ['Meeting', 'users'], collection: ['Collection', 'pin'], delivery: ['Delivery', 'truck'] };
const STATUS = { pending: ['amber', 'Needs approval'], approved: ['green', 'Approved'], completed: ['blue', 'Completed'], declined: ['red', 'Declined'], cancelled: ['red', 'Cancelled'], no_show: ['red', 'No-show'] };
const TIMES = Array.from({ length: 21 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const t24 = (t) => (t || '').slice(0, 5);
const addressOf = (a) => (a.client_note || '').match(/Delivery address: (.*)/)?.[1];
const noteOf = (a) => (a.client_note || '').split('\n').filter((l) => !/^Delivery address:|^Collecting at/.test(l)).join(' ').replace(/^Note: /, '');

export default function AdminAppointments() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('calendar');
  const { data: appts = [], isLoading } = useQuery({ queryKey: ['appointments'], queryFn: () => platform.entities.Appointment.list('-created_date', 500), refetchInterval: 60000 });
  const { data: docs = [] } = useQuery({ queryKey: ['portal-uploads'], queryFn: () => platform.entities.Document.list('-created_date', 200), refetchInterval: 120000 });
  const uploads = useMemo(() => docs.filter((d) => ['Client Supplied', 'Proof of Payment'].includes(d.category) && d.file_url), [docs]);
  const pending = appts.filter((a) => a.status === 'pending');
  const newUploads = uploads.filter((d) => d.status === 'Pending Review').length;
  const refresh = () => { qc.invalidateQueries({ queryKey: ['appointments'] }); qc.invalidateQueries({ queryKey: ['portal-uploads'] }); };

  const act = async (label, fn) => { try { await fn(); toast.success(label); refresh(); return true; } catch (e) { toast.error(e?.message || 'Something went wrong'); return false; } };
  const actions = {
    approve: (a) => act('Approved. The client has been emailed.', () => platform.functions.invoke('appointmentActions', { action: 'approve', appointmentId: a.id })),
    decline: (a, reason) => act('Declined. The client has been emailed.', () => platform.functions.invoke('appointmentActions', { action: 'decline', appointmentId: a.id, declineReason: reason })),
    propose: (a, date, time) => act('New time proposed. The client has been emailed.', () => platform.functions.invoke('appointmentActions', { action: 'propose', appointmentId: a.id, proposeDate: date, proposeTime: time })),
    remind: (a) => act('Reminder sent.', () => platform.functions.invoke('appointmentActions', { action: 'resend_reminder', appointmentId: a.id })),
    status: (a, status, label) => act(label, () => platform.entities.Appointment.update(a.id, { status })),
  };

  const TABS = [['calendar', 'Calendar', 'calendar', pending.length], ['uploads', 'Client uploads', 'upload', newUploads], ['all', 'All appointments', 'layers', 0]];
  return (
    <AdminLayout>
      <div className="ap-root -m-6 lg:-m-7">
        <div className="ap-head"><div><div className="ap-eyebrow">CRM</div><h1>Appointments</h1></div></div>
        <div className="ap-tabs" role="tablist">
          {TABS.map(([k, l, ic, n]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              <Icon name={ic} size={16} />{l}{n > 0 && <span className="ap-count">{n}</span>}
            </button>
          ))}
          <a className="ap-btn ghost" href="/admin/booking-settings" style={{ marginLeft: 'auto' }}><Icon name="clock" size={14} />Opening hours</a>
        </div>
        {isLoading && <p className="ap-dim">Loading appointments…</p>}
        {!isLoading && tab === 'calendar' && <CalendarTab appts={appts} pending={pending} actions={actions} />}
        {tab === 'uploads' && <UploadsTab uploads={uploads} onChecked={(d) => act('Marked as checked.', () => platform.entities.Document.update(d.id, { status: 'Reviewed' }))} />}
        {!isLoading && tab === 'all' && <AllTab appts={appts} actions={actions} />}
      </div>
    </AdminLayout>
  );
}

function CalendarTab({ appts, pending, actions }) {
  const today = todaySast();
  const [day, setDay] = useState(today);
  const [ym, setYm] = useState(() => { const d = fromYmd(today); return { y: d.getFullYear(), m: d.getMonth() }; });
  const byDay = useMemo(() => {
    const m = {};
    appts.filter((a) => a.date && !['cancelled', 'declined'].includes(a.status)).forEach((a) => { (m[a.date] = m[a.date] || []).push(a); });
    Object.values(m).forEach((l) => l.sort((x, y) => (x.start_time || '').localeCompare(y.start_time || '')));
    return m;
  }, [appts]);
  const info = (d) => {
    const l = byDay[d]; if (!l) return {};
    const dots = []; if (l.some((a) => a.status === 'pending')) dots.push('amber');
    if (l.some((a) => a.status !== 'pending' && kindOf(a) !== 'meeting')) dots.push('green');
    if (l.some((a) => a.status !== 'pending' && kindOf(a) === 'meeting')) dots.push('blue');
    return { dots, count: l.length };
  };
  const jump = (a) => { setDay(a.date); const d = fromYmd(a.date); setYm({ y: d.getFullYear(), m: d.getMonth() }); };
  const list = byDay[day] || [];
  const queue = [...pending].sort((x, y) => `${x.date}${x.start_time}`.localeCompare(`${y.date}${y.start_time}`));

  return (
    <div className="ap-cal">
      <div className="ap-panel">
        <Calendar year={ym.y} month={ym.m} onMonth={(y, m) => setYm({ y, m })} selected={day} onSelect={setDay} info={info} />
        <div className="cp-legend"><span><i className="amber" />Needs approval</span><span><i className="green" />Collection / delivery</span><span><i className="blue" />Meeting</span></div>
        <div className="ap-queue">
          <h3><Icon name="clock" size={16} />Waiting for approval · {queue.length}</h3>
          {queue.length === 0 && <p className="ap-dim sm">Nothing waiting. New requests from your website and client portal appear here.</p>}
          {queue.map((a) => (
            <button key={a.id} type="button" className={`ap-qitem ${a.date === day ? 'on' : ''}`} onClick={() => jump(a)}>
              <Icon name={KIND[kindOf(a)][1]} size={18} />
              <span><b>{a.client_name || 'Client'}</b><small>{a.service_name} · {fmtDay(a.date)}, {t24(a.start_time)}</small></span>
              <Icon name="right" size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className="ap-panel grow">
        <div className="ap-row"><h2>{fmtDayLong(day)}</h2>{day !== today && <button type="button" className="ap-btn" onClick={() => { setDay(today); const d = fromYmd(today); setYm({ y: d.getFullYear(), m: d.getMonth() }); }}>Today</button>}</div>
        {list.length === 0 && <p className="ap-dim">Nothing booked on this day.</p>}
        {list.map((a) => <ApptCard key={a.id} a={a} actions={actions} />)}
      </div>
    </div>
  );
}

function ApptCard({ a, actions }) {
  const [dialog, setDialog] = useState(null); // 'decline' | 'move'
  const k = kindOf(a); const [tone, label] = STATUS[a.status] || ['blue', a.status];
  const upcoming = a.date >= todaySast();
  const addr = addressOf(a), note = noteOf(a);
  return (
    <div className={`ap-item ${a.status === 'pending' ? 'requested' : a.status}`}>
      <div className="ap-time"><b>{t24(a.start_time)}</b><small>{t24(a.end_time)}</small></div>
      <div className="ap-body">
        <div className="ap-row tight">
          <span className="ap-kind"><Icon name={KIND[k][1]} size={14} />{k === 'meeting' ? a.service_name : KIND[k][0]}</span>
          <span className={`ap-tag ${tone}`}>{label}</span>
          {a.mode === 'zoom' && <span className="ap-dim sm">Zoom</span>}
        </div>
        <b className="ap-title">{a.client_name || 'Client'}</b>
        <span className="ap-dim sm">{[a.client_email, a.client_phone].filter(Boolean).join(' · ')}</span>
        {addr && <span className="ap-dim sm"><Icon name="pin" size={12} /> {addr}</span>}
        {note && <span className="ap-dim sm">“{note}”</span>}
        {a.proposed_date && a.status === 'pending' && <span className="ap-dim sm">You proposed {fmtDayLong(a.proposed_date)}, {t24(a.proposed_start_time)}</span>}
        {a.decline_reason && ['declined', 'cancelled'].includes(a.status) && <span className="ap-dim sm">Reason: {a.decline_reason}</span>}
        <div className="ap-acts">
          {a.status === 'pending' && <>
            <button type="button" className="ap-btn mint" onClick={() => actions.approve(a)}><Icon name="check" size={16} />Approve</button>
            <button type="button" className="ap-btn" onClick={() => setDialog('move')}>Propose new time</button>
            <button type="button" className="ap-btn red" onClick={() => setDialog('decline')}>Decline</button>
          </>}
          {a.status === 'approved' && <>
            {upcoming && <button type="button" className="ap-btn" onClick={() => actions.remind(a)}><Icon name="bell" size={14} />Send reminder</button>}
            <button type="button" className="ap-btn" onClick={() => actions.status(a, 'completed', 'Marked as completed.')}><Icon name="check" size={14} />Completed</button>
            <button type="button" className="ap-btn" onClick={() => actions.status(a, 'no_show', 'Marked as no-show.')}>No-show</button>
          </>}
          {a.zoom_link && <a className="ap-btn ghost" href={a.zoom_link} target="_blank" rel="noreferrer">Zoom link</a>}
          {a.client_email && <a className="ap-btn ghost" href={`mailto:${a.client_email}`}><Icon name="mail" size={14} />Email</a>}
        </div>
      </div>
      {dialog === 'decline' && <DeclineDialog a={a} onClose={() => setDialog(null)} onSave={async (r) => { if (await actions.decline(a, r)) setDialog(null); }} />}
      {dialog === 'move' && <MoveDialog a={a} onClose={() => setDialog(null)} onSave={async (d, t) => { if (await actions.propose(a, d, t)) setDialog(null); }} />}
    </div>
  );
}

function Modal({ title, children, onClose, footer }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="cp-root" style={{ minHeight: 0, background: 'transparent' }}>
      <div className="cp-sheet-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="cp-sheet ap-modal" role="dialog" aria-modal="true" aria-label={title}>
          <div className="cp-sheet-hd"><h2>{title}</h2><button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}><Icon name="x" /></button></div>
          <div className="cp-sheet-bd">{children}</div>
          <div className="cp-sheet-ft">{footer}</div>
        </div>
      </div>
    </div>
  );
}

function DeclineDialog({ a, onClose, onSave }) {
  const [reason, setReason] = useState('');
  return (
    <Modal title={`Decline ${a.client_name || 'request'}`} onClose={onClose} footer={<div className="cp-actions"><button type="button" className="cp-btn ghost" onClick={onClose}>Cancel</button><button type="button" className="cp-btn primary" onClick={() => onSave(reason)}>Decline and email client</button></div>}>
      <p className="cp-muted">{a.service_name} · {fmtDayLong(a.date)}, {t24(a.start_time)}</p>
      <label className="cp-field"><span className="cp-label">Reason (sent to the client)</span><textarea className="cp-in" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. We're fully booked that morning. Please choose another time." autoFocus /></label>
    </Modal>
  );
}

function MoveDialog({ a, onClose, onSave }) {
  const [d, setD] = useState(a.date); const [t, setT] = useState(TIMES.includes(t24(a.start_time)) ? t24(a.start_time) : '10:00');
  return (
    <Modal title="Propose a new time" onClose={onClose} footer={<div className="cp-actions"><button type="button" className="cp-btn ghost" onClick={onClose}>Cancel</button><button type="button" className="cp-btn primary" onClick={() => onSave(d, t)}>Send to client</button></div>}>
      <p className="cp-muted">Requested: {fmtDayLong(a.date)}, {t24(a.start_time)}. The client gets the new time by email.</p>
      <div className="cp-two">
        <label className="cp-field"><span className="cp-label">New date</span><input type="date" className="cp-in" value={d} onChange={(e) => setD(e.target.value)} /></label>
        <label className="cp-field"><span className="cp-label">Start time</span><select className="cp-in" value={t} onChange={(e) => setT(e.target.value)}>{TIMES.map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
    </Modal>
  );
}

function UploadsTab({ uploads, onChecked }) {
  return (
    <div className="ap-panel">
      <h2>Files from clients</h2>
      {uploads.length === 0 && <p className="ap-dim">No uploads yet. Files clients send from their portal appear here and are emailed to you.</p>}
      {uploads.map((d) => (
        <div key={d.id} className="ap-li">
          <span className={`ap-fic ${d.category === 'Proof of Payment' ? 'mint' : ''}`}><Icon name={d.category === 'Proof of Payment' ? 'card' : 'file'} size={18} /></span>
          <span className="ap-grow"><b>{d.file_name || d.title}</b><small>{d.category === 'Proof of Payment' ? 'Proof of payment' : 'Client file'}{d.created_date ? ` · ${ago(d.created_date)}` : ''}{d.description ? ` · “${d.description}”` : ''}</small></span>
          <a className="ap-btn" href={d.file_url} target="_blank" rel="noreferrer"><Icon name="eye" size={14} />Open</a>
          {d.status === 'Pending Review' ? <button type="button" className="ap-btn mint" onClick={() => onChecked(d)}><Icon name="check" size={14} />Mark checked</button> : <span className="ap-tag green">checked</span>}
        </div>
      ))}
    </div>
  );
}

function AllTab({ appts, actions }) {
  const [filter, setFilter] = useState('upcoming');
  const today = todaySast();
  const rows = appts.filter((a) => filter === 'all' || (filter === 'upcoming' ? a.date >= today && ['pending', 'approved'].includes(a.status) : a.date < today || !['pending', 'approved'].includes(a.status)))
    .sort((x, y) => (filter === 'upcoming' ? 1 : -1) * `${x.date}${x.start_time}`.localeCompare(`${y.date}${y.start_time}`));
  return (
    <div className="ap-panel">
      <div className="ap-row">
        {[['upcoming', 'Upcoming'], ['past', 'Past & closed'], ['all', 'Everything']].map(([k, l]) => <button key={k} type="button" className={`ap-btn ${filter === k ? 'mint' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}
        <span className="ap-dim sm" style={{ marginLeft: 'auto' }}>{rows.length} appointment{rows.length === 1 ? '' : 's'}</span>
      </div>
      {rows.length === 0 && <p className="ap-dim">Nothing here.</p>}
      {rows.map((a) => (
        <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="ap-dim sm">{a.date ? fmtDayLong(a.date) : 'No date'}</span>
          <ApptCard a={a} actions={actions} />
        </div>
      ))}
    </div>
  );
}
