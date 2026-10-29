import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import cfg from '../billing.config.js';
import { api } from '../lib/store.js';
import { buildDeal, daysBetween, depositAmount, firstName, fmtDate, money, todayISO } from '../lib/rules.js';
import { DocumentSettings, downloadDocument } from './SendDocument.jsx';
import { ActionBar, Badge, Card, DocSheet, ErrorNote, Field, FilePick, Loading, Modal, PageHead, Shell, Timeline, mailto, portalUrl, to, useBilling } from '../components.jsx';

function copy(text, notify) {
  (navigator.clipboard?.writeText(text) || Promise.reject()).then(() => notify('Acceptance link copied'), () => window.prompt('Copy this link:', text));
}

export function QuoteView() {
  const { id } = useParams(); const nav = useNavigate();
  const { run, notify } = useBilling();
  const [accepting, setAccepting] = useState(false);
  return (
    <Loading>{(db) => {
      const quote = db.quotes.find((q) => q.id === id);
      if (!quote) return <Shell><div className="cb-empty">Quote not found.</div></Shell>;
      const d = buildDeal(db, quote); const st = d.quoteStatus;
      const left = daysBetween(todayISO(), quote.expiry_date);
      const revise = async () => { const r = await run(() => api.reviseQuote(quote.id), 'Revision created'); nav(to(`quotes/${r.id}/edit`)); };
      let banner = null; let actions;
      if (st === 'draft') {
        banner = <div className="cb-banner info"><span className="tag">Draft</span><span>Not sent yet. Valid for {cfg.rules.quoteValidityDays} days from the quote date once sent.</span></div>;
        actions = <><button className="cb-btn primary" onClick={() => nav(to(`quotes/${id}/send`))}>Send Quote</button><button className="cb-btn" onClick={() => nav(to(`quotes/${id}/edit`))}>Edit</button></>;
      } else if (st === 'sent' || st === 'viewed') {
        banner = <div className="cb-banner info"><span className="tag">{st === 'sent' ? 'Sent' : 'Viewed'}</span><span>{st === 'sent' ? 'Sent' : `Opened by ${d.client?.display_name}`}. Waiting for the client to accept and sign. Valid until <b>{fmtDate(quote.expiry_date)}</b> ({left} day{left === 1 ? '' : 's'} left).</span><span className="right"><button className="cb-btn sm" onClick={() => copy(portalUrl(quote.public_token), notify)}>Copy acceptance link</button></span></div>;
        actions = <><button className="cb-btn primary" onClick={() => setAccepting(true)}>Mark as Accepted…</button><button className="cb-btn" onClick={() => nav(to(`quotes/${id}/send`))}>Resend</button><button className="cb-btn" onClick={revise}>Revise quote</button></>;
      } else if (st === 'expired') {
        banner = <div className="cb-banner warning"><span className="tag">Expired</span><span>No acceptance by {fmtDate(quote.expiry_date)}. The client can no longer accept this quote (T&amp;C 3.1). Revise it to send a fresh {cfg.rules.quoteValidityDays}-day quote.</span></div>;
        actions = <button className="cb-btn primary" onClick={revise}>Revise quote</button>;
      } else if (st === 'declined') {
        banner = <div className="cb-banner warning"><span className="tag">Declined</span><span>Declined by the client{quote.decline_reason ? `: "${quote.decline_reason}"` : ''}.</span></div>;
        actions = <button className="cb-btn primary" onClick={revise}>Revise quote</button>;
      } else if (st === 'superseded') {
        const n = db.quotes.find((x) => x.id === quote.superseded_by);
        banner = <div className="cb-banner warning"><span className="tag">Replaced</span><span>Replaced by <b>{n?.number}</b> (T&amp;C 3.3). This version is no longer valid.</span><span className="right"><Link className="cb-btn sm" to={to(`quotes/${n?.id}`)}>Open {n?.number}</Link></span></div>;
        actions = null;
      } else if (st === 'accepted') {
        const s = quote.signature || {};
        banner = <div className="cb-banner success"><span className="tag">Accepted</span><span>{s.method === 'portal' ? `Signed by ${s.name}` : s.method === 'upload' ? 'Signed copy uploaded' : 'Marked accepted'} on {fmtDate(quote.accepted_at)}. Deposit invoice <b>{d.deposit?.number}</b> was created automatically (T&amp;C 4.1).</span></div>;
        actions = <>{d.deposit && <button className="cb-btn primary" onClick={() => nav(to(`invoices/${d.deposit.id}`))}>Open deposit invoice</button>}{d.project && <button className="cb-btn" onClick={() => nav(to(`projects/${d.project.id}`))}>Open project</button>}</>;
      }
      return (
        <Shell stage={d.status === 'closed' ? 9 : d.stage} actions={<ActionBar note={`${quote.number} · ${money(quote.total)}`}>{actions}<button className="cb-btn" onClick={() => downloadDocument('quote',id).catch(e=>notify(e.message))}>Download PDF</button><button className="cb-btn" onClick={() => window.print()}>Print</button></ActionBar>}>
          <PageHead crumb={<Link to={to('quotes')}>Quotes</Link>} title={`${quote.number} · ${d.client?.display_name}`} right={<Badge status={st} />} />
          {banner}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }} className="cb-cols-r">
            <div className="cb-canvas" style={{ borderRadius: 10, border: '1px solid var(--line)' }}><div style={{ maxWidth: 820, margin: '0 auto' }}><DocSheet kind="quote" deal={d} /></div></div>
            <div className="cb-stack"><DocumentSettings key={quote.id} kind="quote" document={quote} /><Card title="Activity"><Timeline activity={d.activity} /></Card></div>
          </div>
          {accepting && <AcceptModal quote={quote} client={d.client} onClose={() => setAccepting(false)} onDone={(r) => { setAccepting(false); nav(to(`invoices/${r.invoice_id || r.invoice?.id}`)); }} />}
        </Shell>
      );
    }}</Loading>
  );
}

function AcceptModal({ quote, client, onClose, onDone }) {
  const { run } = useBilling();
  const [method, setMethod] = useState('upload'); const [name, setName] = useState(client?.display_name || ''); const [file, setFile] = useState(null); const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const ok = name.trim() && (method === 'manual' || file);
  const submit = async () => {
    setErr(null);
    setBusy(true);
    try { onDone(await run(() => api.acceptManually(quote.id, method, name, file?.url), 'Quote accepted: deposit invoice created')); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Mark ${quote.number} as accepted`} onClose={onClose} footer={<><button className="cb-btn ghost" onClick={onClose}>Cancel</button><button className="cb-btn primary" disabled={!ok || busy} onClick={submit}>Accept &amp; create deposit invoice</button></>}>
      <ErrorNote error={err} />
      <div className="cb-help" style={{ marginTop: 0, fontSize: 13, color: 'var(--ink)' }}>Use this when the client signed outside the portal. The client portal is the normal way to accept.</div>
      <span className="cb-seg"><button className={method === 'upload' ? 'on' : ''} onClick={() => setMethod('upload')}>Signed copy</button><button className={method === 'manual' ? 'on' : ''} onClick={() => setMethod('manual')}>Accepted in writing</button></span>
      <label><div className="cb-label" style={{ marginBottom: 4 }}>Signed by</div><input className="cb-in" value={name} onChange={(e) => setName(e.target.value)} /></label>
      {method === 'upload' ? <FilePick value={file} onPicked={setFile} label="Attach the signed quote" /> : <div className="cb-help">Recorded in the activity log as a manual acceptance (T&amp;C 3.7 asks for written acceptance: keep the email).</div>}
      <div className="cb-help">This creates deposit invoice for {money(depositAmount(quote.total))} ({cfg.rules.depositPercent}%).</div>
    </Modal>
  );
}

