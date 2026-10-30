// Mission Control — the admin dashboard (concept A).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cfg from './dashboard.config.js';
import Icon from './Icons.jsx';
import { PERIODS, ago, computeDashboard, rand, shortDate } from './lib/compute.js';

const STATUS_LABEL = { draft: 'Draft', sent: 'Sent', viewed: 'Viewed', accepted: 'Accepted', declined: 'Declined', expired: 'Expired', overdue: 'Overdue', paid: 'Paid', partially_paid: 'Part paid' };
const FUNNEL_TONE = { draft: 'slate', sent: 'blue', viewed: 'violet', accepted: 'mint', declined: 'red', expired: 'amber' };
const SERVICE_TONES = ['c-red', 'c-orange', 'c-green', 'c-blue', 'c-pink'];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000 * 30); return () => clearInterval(t); }, []);
  return now;
}
function greeting(h) { return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
const timeStr = (d) => d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: cfg.timezone });
const dateStr = (d) => d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: cfg.timezone }).toUpperCase();

export default function MissionControl({ source, isDemo = false, onAsk, onDraftFollowUp, onSearch, firstName = cfg.ownerFirstName, onCounts }) {
  const nav = useNavigate();
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(() => { try { return localStorage.getItem('mc-period') || 'month'; } catch { return 'month'; } });
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [ask, setAsk] = useState('');
  const now = useClock();

  const load = useCallback(async () => {
    setBusy(true);
    try { setRaw(await source()); setError(null); } catch (e) { setError(e.message || String(e)); } finally { setBusy(false); }
  }, [source]);
  useEffect(() => { load(); const t = setInterval(load, cfg.refreshSeconds * 1000); return () => clearInterval(t); }, [load]);
  useEffect(() => { try { localStorage.setItem('mc-period', period); } catch { /* ignore */ } }, [period]);

  const m = useMemo(() => (raw ? computeDashboard(raw, period, new Date()) : null), [raw, period]);
  useEffect(() => { if (m && onCounts) onCounts(m.counts); }, [m, onCounts]);
  const periodLabel = { today: 'TODAY', week: 'THIS WEEK', month: now.toLocaleDateString('en-ZA', { month: 'short' }).toUpperCase(), year: String(now.getFullYear()) }[period];

  const submitSearch = (e) => { e.preventDefault(); if (!q.trim()) return; onSearch ? onSearch(q.trim()) : nav(`${cfg.routes.clients}?q=${encodeURIComponent(q.trim())}`); };
  const submitAsk = (text) => { const t = (text ?? ask).trim(); if (!t) return; if (onAsk) onAsk(t); else window.alert('Connect onAsk in DashboardPage to your AI assistant.'); };

  return (
    <main className="mc-main">
      {/* Top bar */}
      <div className="mc-top">
        <form className="mc-search" onSubmit={submitSearch} role="search">
          <Icon name="search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients, quotes, invoices…" aria-label="Search" />
          <kbd>⌘K</kbd>
        </form>
        <div className="mc-period" role="group" aria-label="Period">
          {PERIODS.map((p) => <button key={p.key} type="button" aria-pressed={period === p.key} className={period === p.key ? 'on' : ''} onClick={() => setPeriod(p.key)}>{p.label}</button>)}
        </div>
        <span className="mc-live"><i className={busy ? 'busy' : ''} />{isDemo ? 'DEMO DATA' : 'LIVE'} · {timeStr(now)} SAST</span>
        <button type="button" className="mc-icon-btn" aria-label="Refresh" onClick={load}><Icon name="refresh" /></button>
      </div>

      {error && <div className="mc-error" role="alert">Couldn't load dashboard data: {error} <button type="button" onClick={load}>Try again</button></div>}

      {!m ? <Skeleton /> : (
        <>
          {/* Greeting + focus */}
          <header className="mc-hello">
            <div className="mc-mono mc-dim">{dateStr(now)}</div>
            <h1>{greeting(Number(timeStr(now).slice(0, 2)))}{firstName ? `, ${firstName}` : ''}.<br />
              <span className="mc-dim">{m.focus.length ? `${['Nothing', 'One thing', 'Two things', '3 things'][m.focus.length]} need${m.focus.length === 1 ? 's' : ''} you today.` : 'All clear today.'}</span></h1>
          </header>
          {m.focus.length > 0 && (
            <div className="mc-grid">
              {m.focus.map((f) => (
                <Link key={f.key} to={f.to} className={`mc-focus ${f.tone}`} style={{ gridColumn: `span ${12 / m.focus.length}` }}>
                  <span className="mc-mono k">{f.n} · {f.label}</span>
                  <span className="v mc-mono">{f.value}</span>
                  <span className="t">{f.text}</span>
                  <span className="cta">{f.cta} →</span>
                </Link>
              ))}
            </div>
          )}

          {/* KPIs */}
          <div className="mc-grid">
            <Kpi label="OUTSTANDING" value={rand(m.money.outstanding)} note={`${m.money.overdueCount} overdue invoice${m.money.overdueCount === 1 ? '' : 's'}`} />
            <Kpi label={`COLLECTED · ${periodLabel}`} value={rand(m.money.collected)} note={m.money.target ? `${m.money.targetPct}% of ${rand(m.money.target).replace('.00', '')} target` : 'Payments received'} bar={m.money.target ? m.money.targetPct : null} />
            <Kpi label="ACCEPTED QUOTE VALUE" value={rand(m.quotes.acceptedValue)} tone="mint" note={`${m.quotes.acceptedCount} quote${m.quotes.acceptedCount === 1 ? '' : 's'} accepted`} />
            <Kpi label="WIN RATE" value={m.quotes.winRate == null ? '—' : `${m.quotes.winRate}%`} note={m.quotes.decided ? `${m.quotes.acceptedCount} won · ${m.quotes.declined} declined · ${m.quotes.expired} expired` : 'No decided quotes yet'} />
          </div>

          {/* Funnel + trend */}
          <div className="mc-grid">
            <section className="mc-card" style={{ gridColumn: 'span 7' }}>
              <div className="mc-card-hd"><h2>Quote funnel</h2><span className="mc-mono mc-dim sm">{m.quotes.total} QUOTES · {m.quotes.conversion}% CONVERSION</span><Link to={cfg.routes.quotes}>All quotes →</Link></div>
              <div className="mc-funnel">
                {m.quotes.funnel.map((f) => (
                  <React.Fragment key={f.status}>
                    <Link to={`${cfg.routes.quotes}?status=${f.status}`} className="lbl">{STATUS_LABEL[f.status]}</Link>
                    <div className="track"><div className={`bar ${FUNNEL_TONE[f.status]}`} style={{ width: `${Math.max(f.count ? 2 : 0, f.pct)}%` }} /></div>
                    <span className="mc-mono r">{f.count}</span>
                  </React.Fragment>
                ))}
              </div>
              {m.quotes.sentOrViewed > 5 && m.quotes.viewed / m.quotes.sentOrViewed < 0.1 && (
                <p className="mc-note">Only {m.quotes.viewed} of {m.quotes.sentOrViewed} sent quotes have been opened. Online accept &amp; sign links show who actually reads them.</p>
              )}
            </section>
            <section className="mc-card" style={{ gridColumn: 'span 5' }}>
              <div className="mc-card-hd"><h2>Enquiries</h2><span className="mc-mono mc-dim sm">6 MONTHS</span></div>
              <svg viewBox="0 0 600 230" className="mc-chart" role="img" aria-label={`Enquiries per month: ${m.trend.points.map((p) => `${p.label} ${p.count}`).join(', ')}`}>
                <g className="grid">{[10, 60, 110, 160, 200].map((y) => <line key={y} x1="0" y1={y} x2="600" y2={y} />)}</g>
                <path d={m.trend.area} className="area" />
                <path d={m.trend.line} className="line" />
                <circle cx={m.trend.end[0]} cy={m.trend.end[1]} r="5" className="dot" />
                <g className="lbls">{m.trend.points.map((p, i) => <text key={p.label} x={i === 5 ? 600 : (i / 5) * 600} y="224" textAnchor={i === 0 ? 'start' : i === 5 ? 'end' : 'middle'}>{p.label}</text>)}</g>
              </svg>
              <div className="mc-row sm"><span>{m.trend.points[5].label.charAt(0) + m.trend.points[5].label.slice(1).toLowerCase()}: <b className="mc-mono">{m.trend.last}</b></span><span className="mc-dim">{m.trend.note}</span></div>
            </section>
          </div>

          {/* Money */}
          <div className="mc-grid">
            <section className="mc-card flush" style={{ gridColumn: 'span 7' }}>
              <div className="mc-card-hd pad"><h2>Receivables</h2><Link to={cfg.routes.invoices}>All invoices →</Link></div>
              <div className="mc-scroll">
                <table className="mc-table">
                  <thead><tr><th>INVOICE</th><th>CLIENT</th><th>STATUS</th><th className="r">BALANCE</th></tr></thead>
                  <tbody>{m.invoices.map((i) => (
                    <tr key={i.id} onClick={() => nav(i.href || `${cfg.routes.invoices}/${i.id}`)}>
                      <td className="mc-mono">{i.number}</td><td>{i.client_name}</td>
                      <td><span className={`mc-pill ${i.shownStatus}`}>{STATUS_LABEL[i.shownStatus] || i.shownStatus}</span></td>
                      <td className="r mc-mono">{rand(i.balance)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
            <section className="mc-card flush" style={{ gridColumn: 'span 5' }}>
              <div className="mc-card-hd pad"><h2>Payments in</h2><Link to={cfg.routes.payments}>All payments →</Link></div>
              {m.payments.map((p) => (
                <div key={p.id} className="mc-li">
                  <span className="col"><span className="mc-mono">{p.number}</span><small>{shortDate(p.paid_on)} · {p.method}</small></span>
                  <span className="mc-mono mint">+{rand(p.amount)}</span>
                </div>
              ))}
              {m.lastPaymentDays != null && m.lastPaymentDays > 30 && <div className="mc-li warn">No payments recorded for {m.lastPaymentDays} days. Check the bank feed.</div>}
              {!m.payments.length && <div className="mc-li mc-dim">No payments recorded yet.</div>}
            </section>
          </div>

          {/* Follow-ups / projects / services */}
          <div className="mc-grid">
            <section className="mc-card flush" style={{ gridColumn: 'span 5' }}>
              <div className="mc-card-hd pad"><h2>Follow-ups</h2>{m.followUps.length > 0 && <span className="mc-tag red">{m.followUps.length} URGENT</span>}<Link to={cfg.routes.followUps}>All →</Link></div>
              {m.followUps.slice(0, 4).map((f) => (
                <div key={f.id} className="mc-li">
                  <span className="mc-ini">{f.initials}</span>
                  <span className="col"><b>{f.name}</b><small>{f.reason}</small></span>
                  <button type="button" className="mc-btn ghost" onClick={() => (onDraftFollowUp ? onDraftFollowUp(f) : nav(cfg.routes.followUps))}>AI draft</button>
                </div>
              ))}
              {!m.followUps.length && <div className="mc-li mc-dim">Nobody is waiting on you.</div>}
            </section>
            <section className="mc-card" style={{ gridColumn: 'span 3' }}>
              <div className="mc-card-hd"><h2>Projects</h2><Link to={cfg.routes.projects}>All →</Link></div>
              <div className="mc-big"><span className="mc-mono">{m.projects.active}</span><span className="mc-dim">active</span></div>
              <div className="mc-split" aria-hidden="true"><div className="ok" style={{ flex: Math.max(0, m.projects.active - m.projects.late) }} /><div className="late" style={{ flex: m.projects.late }} /></div>
              <div className="mc-row sm"><span className="mint">{m.projects.active - m.projects.late} on track</span><span className="red">{m.projects.late} overdue</span></div>
              {m.projects.untitled > 0 && <p className="mc-note">{m.projects.untitled} project{m.projects.untitled === 1 ? ' is' : 's are'} called “Untitled Book”. Name them from the quote subject.</p>}
            </section>
            <section className="mc-card" style={{ gridColumn: 'span 4' }}>
              <div className="mc-card-hd"><h2>Services requested</h2><span className="mc-mono mc-dim sm">{periodLabel}</span></div>
              {m.services.length ? (
                <div className="mc-bars">
                  {m.services.map((s, i) => (
                    <React.Fragment key={s.name}>
                      <span className={s.other ? 'mc-dim' : ''}>{s.name}</span>
                      <div className="track sm"><div className={`bar ${s.other ? 'c-pink' : SERVICE_TONES[i]}`} style={{ width: `${s.pct}%` }} /></div>
                      <span className="mc-mono r">{s.count}</span>
                    </React.Fragment>
                  ))}
                </div>
              ) : <p className="mc-dim">No enquiries in this period.</p>}
            </section>
          </div>

          {/* Ask + activity */}
          <div className="mc-grid">
            {onAsk && <section className="mc-card" style={{ gridColumn: 'span 7' }}>
              <div className="mc-card-hd"><span className="mint"><Icon name="spark" size={20} /></span><h2>Ask the CRM</h2></div>
              <form className="mc-ask" onSubmit={(e) => { e.preventDefault(); submitAsk(); }}>
                <input type="text" value={ask} onChange={(e) => setAsk(e.target.value)} aria-label="Ask about your CRM data" placeholder="Which clients owe more than R5,000?" />
                <button type="submit" className="mc-btn mint">Ask</button>
              </form>
              <div className="mc-chips">
                {[m.money.collected === 0 ? `Why is collected R0 ${period === 'today' ? 'today' : `this ${period}`}?` : 'How does collection compare to last month?', 'Draft reminders for overdue invoices', `Top 5 ${(m.services[0]?.name || 'printing').toLowerCase()} leads`].map((c) => (
                  <button key={c} type="button" className="mc-chip" onClick={() => submitAsk(c)}>{c}</button>
                ))}
              </div>
            </section>}
            <section className="mc-card flush" style={{ gridColumn: onAsk ? 'span 5' : '1 / -1' }}>
              <div className="mc-card-hd pad"><h2>Live activity</h2><Link to={cfg.routes.activity}>View all →</Link></div>
              <ul className="mc-feed">
                {m.activity.map((a) => <li key={a.id}><span className="mc-mono mc-dim">{ago(a.at)}</span><span>{a.title}{a.subtitle ? <small> · {a.subtitle}</small> : null}</span></li>)}
                {!m.activity.length && <li className="mc-dim">Nothing yet.</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </main>
  );
}

function Kpi({ label, value, note, tone, bar }) {
  return (
    <div className="mc-card kpi" style={{ gridColumn: 'span 3' }}>
      <span className="mc-mono mc-dim k">{label}</span>
      <span className={`mc-mono v ${tone || ''}`}>{value}</span>
      {bar != null && <div className="track xs"><div className="bar mint" style={{ width: `${Math.max(1, bar)}%` }} /></div>}
      <span className="mc-dim sm">{note}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mc-skel" aria-busy="true" aria-label="Loading dashboard">
      <div className="b h1" /><div className="mc-grid">{[0, 1, 2].map((i) => <div key={i} className="b" style={{ gridColumn: 'span 4', height: 140 }} />)}</div>
      <div className="mc-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="b" style={{ gridColumn: 'span 3', height: 110 }} />)}</div>
    </div>
  );
}
