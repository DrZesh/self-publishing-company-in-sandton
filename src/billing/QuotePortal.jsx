// PUBLIC page: the client opens /portal/q/:token from the email, reviews the quote and signs.
// Mount it OUTSIDE your CRM's login guard (see INSTALL.md).
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import cfg from './billing.config.js';
import './billing.css';
import { api } from './lib/store.js';
import { daysBetween, depositAmount, fmtDate, money, num, quoteStatus, todayISO } from './lib/rules.js';
import { Badge, ErrorNote, Modal, SignaturePad, SplitBar, StageBar } from './components.jsx';

export default function QuotePortal() {
  const { token } = useParams();
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    const previous = meta.content;
    meta.content = 'noindex, nofollow, noarchive';
    return () => { meta.content = previous; };
  }, []);
  const [data, setData] = useState(null); const [err, setErr] = useState(null);
  const [progressLink,setProgressLink]=useState(null);
  useEffect(()=>{let active=true;setProgressLink(null);if(data?.quote?.status==='accepted')api.projectLinkFromQuote(token).then(link=>{if(active)setProgressLink(link);}).catch(()=>{});return()=>{active=false;};},[token,data?.quote?.status]);
  const [name, setName] = useState(''); const [sig, setSig] = useState(null); const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(null); const [dialog, setDialog] = useState(null); const [msg, setMsg] = useState('');
  const load = () => api.portalGet(token).then((r) => { setData(r); setName((n) => n || r.client?.display_name || ''); }).catch((e) => setErr(e.message));
  useEffect(() => {
    let active = true;
    setData(null); setErr(null); setName(''); setSig(null); setDone(null);
    api.portalGet(token).then(r => { if (active) { setData(r); setName(r.client?.display_name || ''); } }).catch(e => { if (active) setErr(e.message); });
    return () => { active = false; };
  }, [token]);

  if (err && !data) return <div className="cb-root"><div className="cb-empty">{err}</div></div>;
  if (!data) return <div className="cb-root"><div className="cb-empty">Loading your quote…</div></div>;
  const { quote, items, client } = data;
  const st = quoteStatus(quote);
  const left = daysBetween(todayISO(), quote.expiry_date);
  const canAct = st === 'sent' || st === 'viewed';
  const ready = name.trim() && (sig || quote.require_signature === false) && agree;

  const accept = async () => {
    setErr(null); setBusy(true);
    try { await api.portalAccept(token, name.trim(), sig); setDone('accepted'); await load(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const submitDialog = async () => {
    setBusy(true);
    try {
      if (dialog === 'decline') { await api.portalDecline(token, msg); setDone('declined'); } else { await api.portalRequestChanges(token, msg); setDone('changes'); }
      setDialog(null); await load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="cb-root">
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: 'var(--paper)', borderBottom: '1px solid #e2e5ec' }}>
        <img src={cfg.company.logoUrl} alt={cfg.company.name} style={{ width: 120 }} />
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--paper-muted)' }}>Client portal · {client?.display_name}</span>
      </header>
      <StageBar stage={st === 'accepted' ? 5 : 4} />
      <div className="cb-portal-wrap">
        <section className="cb-card">
          <div className="hd">{quote.number} <Badge status={st} /><span className="right cb-muted" style={{ fontSize: 12 }}>{canAct ? `Valid until ${fmtDate(quote.expiry_date)} · ${left} day${left === 1 ? '' : 's'} left` : `Quote date ${fmtDate(quote.quote_date)}`}</span></div>
          {quote.subject && <div className="bd" style={{ paddingBottom: 0, fontWeight: 600 }}>{quote.subject}</div>}
          <div style={{ overflowX: 'auto' }}>
            <table className="cb-items">
              <thead><tr><th>Item</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Discount</th><th className="r">Amount</th></tr></thead>
              <tbody>{items.map((it) => (
                <tr key={it.id}><td><div className="nm">{it.name}</div>{it.description && <div className="spec">{it.description}</div>}</td>
                  <td className="r cb-num">{Number(it.qty)}</td><td className="r cb-num">{num(it.rate)}</td><td className="r cb-num">{Number(it.discount) ? (it.discount_type === 'percent' ? `${it.discount}%` : num(it.discount)) : '—'}</td><td className="r cb-num" style={{ fontWeight: 600 }}>{num(it.amount)}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bd">
            <div className="cb-sum" style={{ marginBottom: 16 }}><div className="ln grand" style={{ border: 0, margin: 0, paddingTop: 6 }}><span>Total</span><span>{money(quote.total)}</span></div></div>
            <SplitBar total={quote.total} depositState={st === 'accepted' ? 'due' : 'due'} />
            <div className="cb-help" style={{ marginTop: 12 }}>
              Payment: EFT or cash deposit only (no cheques). Banking details: {cfg.banks.map((b) => `${b.bank}, ${b.accountName}, ${b.accountNumber}`).join(' · or · ')}.
            </div>
            <details style={{ marginTop: 12, fontSize: 13 }}><summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 500 }}>Read the terms &amp; conditions</summary>
              <div className="cb-help" style={{ lineHeight: '18px' }}>{cfg.termsSummary.map((t) => <p key={t} style={{ margin: '6px 0' }}>{t}</p>)}</div></details>
          </div>
        </section>

        <section className="cb-card" style={{ alignSelf: 'start' }}>
          {st === 'accepted' ? (
            <><div className="hd">Thank you, {client?.first_name || client?.display_name}!</div>
              <div className="bd"><div className="cb-banner success" style={{ margin: 0 }}><span className="tag">Accepted</span><span>Your acceptance is recorded{done === 'accepted' ? '' : ` (${fmtDate(quote.accepted_at)})`}. Your deposit invoice for <b>{money(depositAmount(quote.total))}</b> has been created. Our team will provide the invoice. Work starts after the deposit is paid and cleared.</span></div>{progressLink&&<a className="cb-btn primary" style={{marginTop:16}} href={progressLink}>View your project progress</a>}</div></>
          ) : !canAct ? (
            <><div className="hd">This quote is {st}</div>
              <div className="bd"><div className="cb-help" style={{ margin: 0, fontSize: 13, color: 'var(--ink)' }}>
                {st === 'expired' && <>This quote was valid until {fmtDate(quote.expiry_date)}. Please contact us at {cfg.company.email} for an updated quote.</>}
                {st === 'declined' && <>You declined this quote. If you change your mind, contact us at {cfg.company.email}.</>}
                {st === 'superseded' && <>This quote has been replaced by a newer version. Please use the link in our latest email.</>}
                {st === 'draft' && <>This quote is not ready yet.</>}
              </div></div></>
          ) : (
            <><div className="hd">Accept this quote</div>
              <div className="bd">
                {done === 'changes' && <div className="cb-banner info"><span className="tag">Sent</span><span>Thanks, we've received your request and will send a revised quote.</span></div>}
                <ErrorNote error={err} />
                <div style={{ margin: '0 0 12px', fontSize: 13 }}>I accept {quote.number} and agree to be bound by the {cfg.company.name} terms and conditions (2.2).</div>
                <label><div className="cb-label" style={{ marginBottom: 4 }}>Full name</div><input className="cb-in" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 12 }} /></label>
                {quote.require_signature !== false && <><div className="cb-label" style={{ marginBottom: 4 }}>Signature</div><SignaturePad onChange={setSig} /></>}
                <div className="cb-label" style={{ marginBottom: 4 }}>Date</div><input className="cb-in" readOnly value={fmtDate(todayISO())} style={{ marginBottom: 12 }} />
                <label className="cb-check" style={{ alignItems: 'flex-start', lineHeight: '18px' }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ flex: 'none', marginTop: 1 }} />I understand the {cfg.rules.depositPercent}% deposit ({money(depositAmount(quote.total))}) is due now and work starts once it clears.</label>
                <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                  <button className="cb-btn success" style={{ height: 40, fontSize: 14 }} disabled={!ready || busy} onClick={accept}>{busy ? 'Saving…' : 'Accept & Sign'}</button>
                  <div className="cb-row" style={{ flexWrap: 'nowrap' }}>
                    <button className="cb-btn" style={{ flex: 1 }} onClick={() => { setMsg(''); setDialog('changes'); }}>Request changes</button>
                    <button className="cb-btn" style={{ flex: 1 }} onClick={() => { setMsg(''); setDialog('decline'); }}>Decline</button>
                  </div>
                </div>
              </div></>
          )}
        </section>
      </div>
      {dialog && (
        <Modal title={dialog === 'decline' ? 'Decline this quote' : 'Request changes'} onClose={() => setDialog(null)}
          footer={<><button className="cb-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button className="cb-btn primary" disabled={busy} onClick={submitDialog}>{dialog === 'decline' ? 'Decline quote' : 'Send request'}</button></>}>
          <label><div className="cb-label" style={{ marginBottom: 4 }}>{dialog === 'decline' ? 'Reason (optional)' : 'What would you like changed?'}</div><textarea className="cb-in" value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
        </Modal>
      )}
    </div>
  );
}
