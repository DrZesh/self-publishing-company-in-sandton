import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import cfg from './billing.config.js';
import { api } from './lib/store.js';
import { BADGE, STAGES, fmtDate, money, num, todayISO, balanceAmount, depositAmount, invoiceStatus } from './lib/rules.js';

/* ================= data context ================= */
const Ctx = createContext(null);
export function BillingProvider({ children }) {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const refresh = useCallback(async () => {
    try { setDb(await api.load()); setError(null); } catch (e) { setError(e.message); throw e; }
  }, []);
  useEffect(() => { refresh().catch(() => {}); }, [refresh]);
  const notify = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); }, []);
  // run an action, refresh data, surface errors
  const run = useCallback(async (fn, okMsg) => {
    try { const r = await fn(); await refresh(); if (okMsg) notify(okMsg); return r; } catch (e) { notify(e.message); throw e; }
  }, [refresh, notify]);
  return <Ctx.Provider value={{ db, error, refresh, run, notify }}>{children}{toast && <div className="cb-toast" role="status">{toast}</div>}</Ctx.Provider>;
}
export const useBilling = () => useContext(Ctx);
export const to = (p = '') => `${cfg.basePath}${p ? `/${p}` : ''}`;
export const portalUrl = (token) => `${cfg.portalOrigin || window.location.origin}${cfg.portalPath}/${token}`;
export const mailto = (to_, subject, body, cc) => `mailto:${encodeURIComponent(to_ || '')}?subject=${encodeURIComponent(subject)}${cc ? `&cc=${encodeURIComponent(cc)}` : ''}&body=${encodeURIComponent(body)}`;

/* ================= small parts ================= */
export function Badge({ status }) {
  const [tone, word] = BADGE[status] || ['neutral', status];
  return <span className={`cb-badge ${tone}`}>{word}</span>;
}

export function StageBar({ stage }) {
  return (
    <div className="cb-stagebar" aria-label={`Stage ${stage} of 8`}>
      {STAGES.map((s, i) => {
        const n = i + 1; const cls = n < stage ? 'done' : n === stage ? 'now' : '';
        return <span key={s} className={`st ${cls}`}><span className="n">{n < stage ? '✓' : n}</span>{s}</span>;
      })}
    </div>
  );
}

export function StageDots({ stage, danger }) {
  return <span className="cb-dots">{Array.from({ length: 8 }, (_, i) => <i key={i} className={i + 1 < stage ? 'd' : i + 1 === stage ? (danger ? 'x' : 'c') : ''} />)}</span>;
}

export function SplitBar({ total, depositState = 'due', balanceState = 'wait', compact }) {
  const dep = depositAmount(total); const bal = balanceAmount(total);
  const pct = cfg.rules.depositPercent;
  return (
    <div className="cb-split">
      <div className={`dep ${depositState === 'paid' ? '' : 'due'}`}><span>{compact ? `${pct}%` : `Deposit ${pct}% ${depositState === 'paid' ? '· paid' : 'on acceptance'}`}</span><span>{money(dep)}</span></div>
      <div className={`bal ${balanceState === 'paid' ? 'paid' : balanceState === 'due' ? '' : 'wait'}`}><span>{100 - pct}%</span><span>{money(bal)}</span></div>
    </div>
  );
}

export function Timeline({ activity }) {
  if (!activity?.length) return <div className="cb-help">No activity yet.</div>;
  return (
    <ul className="cb-tl">
      {activity.map((a) => <li key={a.id} className="ok"><b>{a.text}</b> · {fmtDate(a.at)}</li>)}
    </ul>
  );
}

export function Card({ title, right, children, pad = true, style }) {
  return (
    <section className="cb-card" style={style}>
      {title && <div className="hd">{title}{right && <span className="right">{right}</span>}</div>}
      {pad ? <div className="bd">{children}</div> : children}
    </section>
  );
}

export function Field({ label, required, help, children, top }) {
  return (
    <label className={`cb-field ${top ? 'top' : ''}`}>
      <span className={`cb-label ${required ? 'req' : ''}`}>{label}</span>
      <span>{children}{help && <div className="cb-help">{help}</div>}</span>
    </label>
  );
}

export function Modal({ title, children, onClose, footer }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="cb-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cb-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="hd">{title}</div><div className="bd">{children}</div>{footer && <div className="ft">{footer}</div>}
      </div>
    </div>
  );
}

export function ErrorNote({ error }) { return error ? <div className="cb-err" role="alert">{error}</div> : null; }

export function SignaturePad({ onChange }) {
  const ref = useRef(null); const drawing = useRef(false); const dirty = useRef(false);
  useEffect(() => {
    const c = ref.current; const r = c.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
    c.width = r.width * dpr; c.height = r.height * dpr;
    const g = c.getContext('2d'); g.scale(dpr, dpr); g.lineWidth = 2.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1f2330';
  }, []);
  const pos = (e) => { const r = ref.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const down = (e) => { drawing.current = true; ref.current.setPointerCapture(e.pointerId); const g = ref.current.getContext('2d'); g.beginPath(); g.moveTo(...pos(e)); };
  const move = (e) => { if (!drawing.current) return; const g = ref.current.getContext('2d'); g.lineTo(...pos(e)); g.stroke(); dirty.current = true; };
  const up = () => { if (!drawing.current) return; drawing.current = false; if (dirty.current) onChange(ref.current.toDataURL('image/png')); };
  const clear = () => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); dirty.current = false; onChange(null); };
  return (
    <>
      <div className="cb-sigpad"><canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} aria-label="Signature pad" /></div>
      <div className="cb-row" style={{ justifyContent: 'space-between', margin: '4px 0 12px' }}>
        <span className="cb-help" style={{ margin: 0 }}>Draw with your finger or mouse</span>
        <button type="button" className="cb-btn ghost sm" onClick={clear}>Clear</button>
      </div>
    </>
  );
}

export function FilePick({ value, onPicked, accept = 'application/pdf,image/*', label = 'Attach file' }) {
  const { notify } = useBilling() || {};
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try { onPicked(await api.uploadFile(f)); } catch (err) { notify ? notify(err.message) : alert(err.message); } finally { setBusy(false); e.target.value = ''; }
  };
  return value ? (
    <span className="cb-file"><span className="ext">{(value.name.split('.').pop() || 'FILE').slice(0, 4).toUpperCase()}</span>
      <span>{value.name}<div className="cb-help" style={{ margin: 0 }}>uploaded</div></span>
      <label className="cb-btn ghost sm" style={{ marginLeft: 'auto' }}>Replace<input type="file" accept={accept} hidden onChange={pick} /></label></span>
  ) : (
    <label className="cb-drop" style={{ display: 'block', cursor: 'pointer' }}>{busy ? 'Uploading…' : `${label} (PDF or photo)`}<input type="file" accept={accept} hidden onChange={pick} /></label>
  );
}

/* ================= app shell ================= */
const NAV = [['', 'Deals'], ['clients', 'Clients'], ['quotes', 'Quotes'], ['invoices', 'Invoices'], ['payments', 'Payments Received'], ['projects', 'Projects']];
export function Shell({ children, stage, actions, enabled = false }) {
  if (!enabled) return <div className="cb-screen"><nav className="cb-tabs" aria-label="Billing sections">{NAV.map(([p,label])=><NavLink key={p} end={p===''} to={to(p)}>{label}</NavLink>)}</nav>{stage ? <StageBar stage={stage} /> : null}{actions}<div className="cb-main full">{children}</div></div>;
  return (
    <div className="cb-screen" style={{ borderRadius: 0, border: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="cb-topbar">
        <Link className="brand" to={to()}>Creative Books CRM</Link>
        <span className="org">{cfg.company.name}</span>
      </header>
      {stage ? <StageBar stage={stage} /> : null}
      <div className="cb-body" style={{ flex: 1 }}>
        <nav className="cb-side">
          {NAV.map(([p, label], i) => (
            <React.Fragment key={p}>
              {i === 1 && <div className="grp">Sales</div>}
              <NavLink end={p === ''} to={to(p)} className={({ isActive }) => `i ${i ? 'sub' : ''} ${isActive ? 'on' : ''}`}>{label}</NavLink>
            </React.Fragment>
          ))}
        </nav>
        <main className="cb-main full">{children}</main>
      </div>
      {actions}
    </div>
  );
}
export const ActionBar = ({ children, note }) => <div className="cb-actions" role="toolbar" aria-label="Document actions">{children}{note && <span className="right">{note}</span>}</div>;

export function PageHead({ crumb, title, right }) {
  return <div className="cb-head"><div>{crumb && <div className="cb-crumb">{crumb}</div>}<h1 className="cb-title">{title}</h1></div>{right && <div className="right">{right}</div>}</div>;
}

export function Loading({ children }) {
  const { db, error } = useBilling();
  if (error) return <div className="cb-main"><div role="alert" className="cb-err">Could not load billing data: {error}</div></div>;
  if (!db) return <div className="cb-empty">Loading…</div>;
  return children(db);
}

/* ================= the document sheet (quote / invoice / statement) ================= */
export function DocSheet({ kind, deal, invoice, compact }) {
  const { quote, client, items } = deal;
  const C = cfg.company;
  const ribbonOf = { quote: { draft: null, sent: ['info', 'Sent'], viewed: ['info', 'Viewed'], accepted: ['success', 'Accepted'], expired: ['warning', 'Expired'], declined: ['warning', 'Declined'], superseded: ['warning', 'Superseded'] } };
  let title; let number; let ribbon = null; let balance = null; let dates; let head; let rows; let totals; let after = null;
  if (kind === 'quote') {
    title = 'QUOTE'; number = quote.number; ribbon = ribbonOf.quote[deal.quoteStatus] || null;
    dates = [['Estimate Date', fmtDate(quote.quote_date)], ['Valid Until', fmtDate(quote.expiry_date)]];
    head = ['Qty', 'Rate', 'Discount', 'Amount'];
    rows = items.map((it, i) => [i + 1, it.name, it.description, [num(it.qty), num(it.rate), it.discount ? (it.discount_type === 'percent' ? `${it.discount}%` : num(it.discount)) : '0.00', num(it.amount)]]);
    totals = [['Sub Total', num(quote.sub_total)], ['Total', money(quote.total), 'band']];
    after = (
      <>
        <h4>Payment schedule</h4>
        <table><thead><tr><th>Stage</th><th>When</th><th className="r">%</th><th className="r">Amount</th></tr></thead><tbody>
          <tr><td>Deposit</td><td>On acceptance. Work starts once funds clear (4.2)</td><td className="r">{cfg.rules.depositPercent}%</td><td className="r">{money(depositAmount(quote.total))}</td></tr>
          <tr><td>Balance</td><td>On completion, before final delivery (4.3)</td><td className="r">{100 - cfg.rules.depositPercent}%</td><td className="r">{money(balanceAmount(quote.total))}</td></tr>
        </tbody></table>
        <h4>Notes</h4><BankBlock note={quote.notes} />
        <h4>Terms &amp; Conditions</h4>
        <div className="small">{cfg.termsSummary.map((t) => <div key={t}>{t}</div>)}</div>
        <div className="sig">
          <div>{quote.signature?.image && quote.signature.image.startsWith('data:image') && <div className="img"><img src={quote.signature.image} alt="Client signature" /></div>}
            Client signature &amp; date{quote.signature ? `: ${quote.signature.name || ''} ${fmtDate(quote.signature.signed_at)}` : ''}</div>
          <div>Authorized Signature</div>
        </div>
      </>
    );
  } else if (kind === 'invoice') {
    const st = invoiceStatus(invoice);
    title = C.vatNumber ? 'TAX INVOICE' : 'INVOICE'; number = invoice.number;
    ribbon = invoice.status === 'paid' ? ['success', 'Paid'] : ['warning', invoice.type === 'deposit' ? 'Deposit due' : 'Balance due'];
    if (st === 'overdue') ribbon = ['warning', 'Overdue'];
    balance = ['Balance Due', money(invoice.balance_due)];
    dates = [['Invoice Date', fmtDate(invoice.invoice_date)], ['Terms', cfg.rules.invoiceTermsLabel], ['Reference', quote.number]];
    head = ['Qty', 'Rate', 'Amount'];
    const first = items[0]; const spec = `${first ? `${first.name}${items.length > 1 ? ` + ${items.length - 1} more` : ''}` : ''}\nQuote total ${money(quote.total)}`;
    const label = invoice.type === 'deposit' ? `Deposit (${invoice.percent}%) on ${quote.number}` : `Balance (${invoice.percent}%) on ${quote.number}`;
    rows = [[1, label, spec, ['1.00', num(invoice.total), num(invoice.total)]]];
    if (invoice.type === 'deposit') totals = [['Sub Total', num(invoice.total)], ['Total', money(invoice.total), 'band'], ['Paid', num(invoice.amount_paid)], ['Balance Due', money(invoice.balance_due), 'strong']];
    else {
      const prior = deal.payments.filter((p) => p.invoice_id !== invoice.id).reduce((s, p) => s + Number(p.amount), 0);
      totals = [['Quote total', num(quote.total)], [`Deposit received${deal.deposit ? ` (${deal.deposit.number})` : ''}`, `−${num(prior)}`], ['Paid on this invoice', num(invoice.amount_paid)], ['Balance Due', money(invoice.balance_due), 'band']];
    }
    after = (
      <>
        <h4>Payment</h4>
        <div className="small" style={{ color: 'var(--paper-ink)' }}>
          Pay by EFT or cash deposit only. Cheques are not accepted (4.1). Use <b>{invoice.number}</b> as your reference.<br />
          {cfg.banks.map((b) => `${b.bank} · ${b.accountName} · ${b.accountNumber}`).join('  |  ')}<br />
          {invoice.type === 'deposit' ? 'No work will start until this deposit reflects as cleared (4.2).' : 'Final files and delivery are released once this balance and proof of payment are received (4.3).'}
        </div>
        <h4>Terms &amp; Conditions</h4><div className="small" style={{whiteSpace:'pre-wrap'}}>{invoice.terms ?? cfg.termsSummary.join('\n')}</div>
      </>
    );
  } else {
    title = 'STATEMENT'; number = quote.number; ribbon = deal.outstanding <= 0 ? ['success', 'Paid'] : null;
    balance = ['Balance', money(deal.outstanding)];
    dates = [['Statement Date', fmtDate(todayISO())], ['Reference', quote.number]];
    head = ['Payment', 'Method', 'Amount'];
    rows = deal.payments.map((p, i) => {
      const inv = deal.invoices.find((x) => x.id === p.invoice_id);
      return [i + 1, `${inv?.number}: ${inv?.type === 'deposit' ? 'Deposit' : 'Balance'} (${inv?.percent}%)`, '', [`${p.number} · ${fmtDate(p.paid_on)}`, p.method === 'eft' ? 'EFT' : 'Cash deposit', num(p.amount)]];
    });
    totals = [[`${quote.number} total`, num(quote.total)], ['Total received', num(deal.received)], ['Balance', money(deal.outstanding), 'band']];
    after = deal.outstanding <= 0 ? <div className="small" style={{ marginTop: 16, color: 'var(--paper-ink)' }}>Thank you, {client?.first_name || client?.display_name}. It was a pleasure working with you.</div> : null;
  }
  return (
    <div className={`cb-sheet ${compact ? 'compact' : ''}`}>
      {ribbon && <div className={`ribbon ${ribbon[0]}`}>{ribbon[1]}</div>}
      <div className="top">
        <img className="logo" src={C.logoUrl} alt={C.name} />
        <div><div className="dtitle">{title}</div><div className="dnum"># {number}</div>{balance && <div className="bal">{balance[0]}<b>{balance[1]}</b></div>}</div>
      </div>
      <div className="from"><b>{C.name}</b>{C.addressLines.map((l) => <React.Fragment key={l}><br />{l}</React.Fragment>)}{C.vatNumber && <><br />VAT No. {C.vatNumber}</>}</div>
      <div className="meta">
        <div><div className="lbl">Bill To</div><div className="to">{client?.display_name}</div>{client?.company && <div>{client.company}</div>}{client?.billing_address && <div style={{ whiteSpace: 'pre-line' }}>{client.billing_address}</div>}{client?.vat_number && <div>VAT No. {client.vat_number}</div>}</div>
        <div className="dates">{dates.flatMap(([k, v]) => [<span key={`k${k}`}>{k} :</span>, <span key={`v${k}`}>{v}</span>])}</div>
      </div>
      <table>
        <thead><tr><th style={{ width: 32 }}>#</th><th>Item &amp; Description</th>{head.map((h, i) => <th key={h} className={i === head.length - 1 || kind !== 'statement' ? 'r' : ''}>{h}</th>)}</tr></thead>
        <tbody>{rows.map(([n, name, spec, cells]) => (
          <tr key={n}><td>{n}</td><td><b>{name}</b>{spec && <div className="spec">{spec}</div>}</td>{cells.map((c, i) => <td key={i} className={i === cells.length - 1 || kind !== 'statement' ? 'r' : ''}>{c}</td>)}</tr>
        ))}</tbody>
      </table>
      <div className="tot">{totals.map(([k, v, cls]) => <div key={k} className={`ln ${cls === 'band' ? 'band' : ''}`} style={cls === 'strong' ? { fontWeight: 700, color: 'var(--paper-warning)' } : undefined}><span>{k}</span><span>{v}</span></div>)}</div>
      {after}
    </div>
  );
}

function BankBlock({ note }) {
  return (
    <div>
      {note && <div style={{ whiteSpace: 'pre-line', marginBottom: 8 }}>{note}</div>}
      Banking Details<br />
      {cfg.banks.map((b, i) => (
        <React.Fragment key={b.accountNumber}>
          {i > 0 && <><br />OR<br /></>}
          <br /><b>{b.bank}</b><br />Account Name: {b.accountName}{b.accountType && <><br />{b.accountType}</>}<br />Account Number: {b.accountNumber}<br />
        </React.Fragment>
      ))}
    </div>
  );
}
