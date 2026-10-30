// Project portal (/portal/p/<token>): the link clients get in Quote to Cash emails.
// Journey design: header with progress, the book's journey across its services, collection/delivery
// booking, file uploads, then each service's stages, released files, feedback and review approval.
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from './lib/store.js';
import { serviceProgress } from './lib/serviceProgress.js';
import cfg from './billing.config.js';
import JourneyPanel from '@/components/portal/journey/JourneyPanel.jsx';
import Icon from '@/components/portal/journey/Icon.jsx';
import { projectJourneyApi } from '@/components/portal/journey/api.js';
import '@/components/portal/journey/journey.css';

const ICONS = { editing: 'pen', proofreading: 'pen', typesetting: 'type', layout: 'type', cover: 'image', cover_design: 'image', printing: 'printer', ebook: 'book', isbn: 'file' };
const iconFor = (key = '') => ICONS[key] || Object.entries(ICONS).find(([k]) => key.includes(k))?.[1] || 'layers';
const activeStages = (s) => s.stages.map((_, i) => i).filter((i) => !s.skipped.includes(i));
const serviceDone = (s) => Boolean(s.handover_at) || (activeStages(s).length > 0 && activeStages(s).every((i) => s.completed.includes(i)));

export default function ProjectPortal() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');

  const load = () => api.projectPortal(token).then(setData).catch((e) => setError(e.message));
  useEffect(() => {
    let active = true;
    const robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex,nofollow,noarchive'; document.head.append(robots);
    const referrer = document.createElement('meta'); referrer.name = 'referrer'; referrer.content = 'no-referrer'; document.head.append(referrer);
    api.projectPortal(token).then((d) => { if (active) setData(d); }).catch((e) => { if (active) setError(e.message); });
    projectJourneyApi.me(token).then((m) => { if (active) setFirstName(m.first_name || ''); }).catch(() => {});
    const t = setInterval(() => { api.projectPortal(token).then((d) => { if (active) setData(d); }).catch(() => {}); }, 30000);
    return () => { active = false; clearInterval(t); robots.remove(); referrer.remove(); };
  }, [token]);

  const journey = useMemo(() => {
    if (!data) return null;
    const services = data.services || [];
    const road = [...services.map((s) => ({ id: s.key, name: s.label, icon: iconFor(s.key) })), { id: 'handover', name: 'Hand-over', icon: 'truck' }];
    const firstOpen = services.findIndex((s) => !serviceDone(s));
    const allDone = services.length > 0 && firstOpen === -1;
    const at = data.project_completed_at ? road.length : allDone ? services.length : Math.max(0, firstOpen);
    const now = services[firstOpen];
    const stageLabel = data.project_completed_at ? 'Project completed' : now ? `${now.label}: ${now.current_index === null ? 'not started yet' : now.stages[now.current_index]}` : allDone ? 'Ready for hand-over' : '';
    return { road, at, ready: allDone, stageLabel, subtitle: services.map((s) => s.label).join(' · ') };
  }, [data]);

  if (error && !data) {
    return <div className="cp-root"><main className="cp-wrap"><section className="cp-card cp-center"><Icon name="alert" size={28} /><h1 className="cp-h2">We couldn't open your project</h1><p className="cp-muted">{error}</p><a className="cp-btn" href="mailto:info@creativebooks.co.za">Email info@creativebooks.co.za</a></section></main></div>;
  }

  return (
    <div className="cp-root">
      <header className="cp-bar"><div className="cp-bar-in"><span className="cp-logo"><img src={cfg.company.logoUrl} alt="Creative Books SA" /></span></div></header>
      <main className="cp-wrap">
        {!data && <div className="cp-skel" aria-busy="true" aria-label="Loading your project"><i /><i /><i /></div>}
        {data && (
          <JourneyPanel token={token} api={projectJourneyApi} firstName={firstName} journey={journey}
            project={{ book_title: data.book_title === 'Your book' ? '' : data.book_title }}>
            {data.project_completed_at && (
              <section className="cp-card green"><div className="cp-row"><Icon name="check" /><h2 className="cp-h2">Project completed</h2></div><p className="cp-muted">All agreed services and the final delivery or collection are complete. Thank you for choosing Creative Books SA.</p></section>
            )}
            {(data.services || []).map((s) => <ServiceCard key={s.key} service={s} token={token} reload={load} />)}
          </JourneyPanel>
        )}
        <p className="cp-foot">Creative Books SA · Prism Office Park, Fourways · info@creativebooks.co.za</p>
      </main>
    </div>
  );
}

function ServiceCard({ service: s, token, reload }) {
  const [feedback, setFeedback] = useState(''), [link, setLink] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [approve, setApprove] = useState(false);
  const pct = serviceProgress(s.stages.length, s.current_index, s.completed, s.skipped);
  const done = serviceDone(s);
  const ready = s.review_open || s.deliveries.some((d) => d.status === 'sent');
  const run = async (fn) => { setBusy(true); setError(''); setNotice(''); try { await fn(); await reload(); setNotice('Sent. Thank you.'); return true; } catch (e) { setError(e.message); return false; } finally { setBusy(false); } };

  return (
    <section className="cp-card">
      <div className="cp-row"><h2 className="cp-h2">{s.label}</h2><span className={`cp-pill ${done ? 'green' : 'blue'}`}>{s.handover_at ? 'Delivered' : done ? 'Complete' : `${pct}%`}</span></div>
      <div className="cp-segs" aria-hidden="true">{s.stages.map((_, i) => <i key={i} className={s.completed.includes(i) || s.skipped.includes(i) ? 'done' : i === s.current_index ? 'now' : ''} />)}</div>
      <ol className="cp-stages">
        {s.stages.map((name, i) => {
          if (s.skipped.includes(i)) return null;
          const st = s.completed.includes(i) ? 'done' : i === s.current_index ? 'now' : 'next';
          return (
            <li key={name} className={st}>
              <span className="ic"><Icon name={st === 'done' ? 'check' : st === 'now' ? 'clock' : 'layers'} /></span>
              <div className="tx"><div className="cp-row"><b>{name}</b><span className="st">{st === 'done' ? 'Completed' : st === 'now' ? 'In progress' : 'Up next'}</span></div></div>
            </li>
          );
        })}
      </ol>
      {s.handover_at && <div className="cp-note green"><Icon name="check" /><span>Final hand-over confirmed: {String(s.handover_method || '').replaceAll('_', ' ')}.</span></div>}

      {s.files.length > 0 && (
        <>
          <h3 className="cp-label">Files from our team</h3>
          <ul className="cp-list">{s.files.map((f) => (
            <li key={f.id}><Icon name="file" size={16} /><span>{f.name}<small>{f.purpose === 'review' ? 'For your review' : 'Final delivery'}</small></span>
              <a className="cp-btn sm" target="_blank" rel="noreferrer" href={`https://cobpbsfkeewxzyprbmet.supabase.co/functions/v1/billingProjectFile?token=${encodeURIComponent(token)}&file=${encodeURIComponent(f.id)}`}><Icon name="download" size={14} />Open</a></li>
          ))}</ul>
        </>
      )}
      {s.deliveries.filter((d) => d.status === 'sent' && d.instructions).map((d) => <p key={d.id} className="cp-muted sm" style={{ whiteSpace: 'pre-wrap' }}>{d.instructions}</p>)}

      {ready && !s.handover_at && (
        <div className="cp-field">
          <h3 className="cp-label">Your feedback</h3>
          <p className="cp-muted sm">Keep your comments together where possible. You can also paste a link to your feedback document.</p>
          <label className="sr" htmlFor={`fb-${s.key}`}>{s.label} feedback</label>
          <textarea id={`fb-${s.key}`} className="cp-in" rows={4} value={feedback} maxLength={8000} onChange={(e) => setFeedback(e.target.value)} placeholder="Your comments for our team" />
          <label className="sr" htmlFor={`fl-${s.key}`}>{s.label} feedback document link</label>
          <input id={`fl-${s.key}`} className="cp-in" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Optional: https:// link to your feedback document" />
          <button type="button" className="cp-btn primary" disabled={busy || !feedback.trim()} onClick={() => run(() => api.portalFeedback(token, s.key, feedback, link)).then((ok) => { if (ok) { setFeedback(''); setLink(''); } })}>Send feedback</button>
          {s.deliveries.some((d) => d.status === 'sent') && !s.client_approved_at && (
            <>
              <label className="cp-check"><input type="checkbox" checked={approve} onChange={(e) => setApprove(e.target.checked)} /> I have reviewed the delivered version. (This does not approve artwork for printing.)</label>
              <button type="button" className="cp-btn" disabled={!approve || busy} onClick={() => run(() => api.portalApprove(token, s.key))}>Record my review approval</button>
            </>
          )}
        </div>
      )}
      {s.client_approved_at && <p className="cp-muted sm">Your review approval has been recorded.</p>}
      {error && <div className="cp-err" role="alert">{error}</div>}
      {notice && <p role="status" className="cp-muted sm">{notice}</p>}
    </section>
  );
}
