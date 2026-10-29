import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import cfg from '../billing.config.js';
import { api } from '../lib/store.js';
import { buildDeal, daysBetween, depositAmount, firstName, fmtDate, money, todayISO } from '../lib/rules.js';
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
        <Shell stage={d.status === 'closed' ? 9 : d.stage} actions={<ActionBar note={`${quote.number} · ${money(quote.total)}`}>{actions}<button className="cb-btn" onClick={() => window.print()}>PDF / Print</button></ActionBar>}>
          <PageHead crumb={<Link to={to('quotes')}>Quotes</Link>} title={`${quote.number} · ${d.client?.display_name}`} right={<Badge status={st} />} />
          {banner}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }} className="cb-cols-r">
            <div className="cb-canvas" style={{ borderRadius: 10, border: '1px solid var(--line)' }}><div style={{ maxWidth: 820, margin: '0 auto' }}><DocSheet kind="quote" deal={d} /></div></div>
            <Card title="Activity"><Timeline activity={d.activity} /></Card>
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

export function SendQuote() {
  const { id } = useParams(); const nav = useNavigate();
  const { db, run, notify } = useBilling();
  const [emailOpened, setEmailOpened] = useState(false);
  const [form, setForm] = useState(null); const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);
  if (!db) return <Shell stage={3}><div className="cb-empty">Loading…</div></Shell>;
  const quote = db.quotes.find((q) => q.id === id);
  if (!quote) return <Shell><div className="cb-empty">Quote not found.</div></Shell>;
  const d = buildDeal(db, quote);
  const link = portalUrl(quote.public_token);
  const f = form || {
    to: d.client?.email || '', cc: cfg.company.email, subject: `Your quote ${quote.number} from ${cfg.company.name}`,
    message: `Hi ${firstName(d.client) || 'there'},\n\nThank you for choosing ${cfg.company.name.replace(/ SA$/, '')}. Your quote${quote.subject ? ` for ${quote.subject}` : ''} is ready. You can review it and accept it online. It takes a minute, and you can sign on your phone.`,
  };
  const set = (k) => (e) => setForm({ ...f, [k]: e.target.value });
  const fullText = `${f.message}\n\nQuote amount: ${money(quote.total)}\nValid until: ${fmtDate(quote.expiry_date)}\nA ${cfg.rules.depositPercent}% deposit (${money(depositAmount(quote.total))}) is due on acceptance.\n\nReview & accept your quote: ${link}\n\nKind regards,\n${cfg.company.name}`;

  const send = async () => {
    setErr(null); setBusy(true);
    try {
      if (!f.to) throw new Error('Add the client\'s email address');
      if (cfg.sendEmail) await cfg.sendEmail({ to: f.to, cc: f.cc, subject: f.subject, text: fullText, quote, link });
      else if (!emailOpened) { window.location.href = mailto(f.to, f.subject, fullText, f.cc); setEmailOpened(true); return; }
      await run(() => api.markSent(quote.id), cfg.sendEmail ? 'Quote sent' : 'Marked as sent after your confirmation');
      nav(to(`quotes/${quote.id}`));
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Shell stage={3} actions={
      <ActionBar note="After you confirm sending: status SENT, then VIEWED when the client opens the link">
        <button className="cb-btn primary" disabled={busy} onClick={send}>{cfg.sendEmail ? 'Send' : emailOpened ? 'I have sent the email' : 'Open email draft'}</button>
        <button className="cb-btn" onClick={() => copy(link, notify)}>Copy acceptance link</button>
        <button className="cb-btn ghost" onClick={() => nav(-1)}>Cancel</button>
      </ActionBar>}>
      <PageHead crumb={quote.number} title={`Email to ${d.client?.display_name}`} right={<Badge status={d.quoteStatus} />} />
      <ErrorNote error={err} />
      {!cfg.sendEmail && <div className="cb-banner info"><span className="tag">Mail app</span><span><b>Open email draft</b> opens your email app with this message and the acceptance link filled in. To attach the PDF, use <b>PDF / Print → Save as PDF</b> on the quote first. Return here and confirm only after you have sent the email. Automatic sending is not enabled.</span></div>}
      <div className="cb-mail">
        <div className="f"><span className="k">From</span><span>{cfg.company.name} &lt;{cfg.company.email}&gt;</span></div>
        <div className="f"><span className="k">To</span><input className="cb-in" value={f.to} onChange={set('to')} /></div>
        <div className="f"><span className="k">Cc</span><input className="cb-in" value={f.cc} onChange={set('cc')} /></div>
        <div className="f"><span className="k">Subject</span><input className="cb-in" value={f.subject} onChange={set('subject')} /></div>
        <div className="cb-mailbody">
          <div className="cb-mailcard">
            <div className="lg"><img src={cfg.company.logoUrl} alt={cfg.company.name} /></div>
            <div className="band">{quote.number}</div>
            <div className="tx"><textarea className="cb-in" style={{ background: '#fff', color: '#1f2330', minHeight: 120, border: '1px dashed #c9ceda' }} value={f.message} onChange={set('message')} aria-label="Message" /></div>
            <div className="amt"><div className="k">QUOTE AMOUNT</div><div className="v">{money(quote.total)}</div><div className="d">Valid until {fmtDate(quote.expiry_date)} · {cfg.rules.depositPercent}% deposit ({money(depositAmount(quote.total))}) on acceptance</div></div>
            <a className="cta" href={link} target="_blank" rel="noreferrer">Review &amp; Accept Quote</a>
            <div className="tx" style={{ paddingTop: 0 }}>Kind regards,<br />{cfg.company.name}</div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
