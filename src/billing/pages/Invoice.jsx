import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import cfg from '../billing.config.js';
import { api } from '../lib/store.js';
import { buildDeal, fmtDate, invoiceStatus, money, num, todayISO, firstName } from '../lib/rules.js';
import { DocumentSettings, downloadDocument } from './SendDocument.jsx';
import { ActionBar, Badge, Card, DocSheet, ErrorNote, Field, FilePick, Loading, PageHead, Shell, SplitBar, Timeline, mailto, to, useBilling } from '../components.jsx';

function ProofLink({ url, name }) {
  const [busy, setBusy] = useState(false);
  if (!url || url.startsWith('demo:')) return <span className="cb-muted">{name}</span>;
  const open = async () => { setBusy(true); try { const l = await api.fileLink(url); if (l) window.open(l, '_blank', 'noopener'); } finally { setBusy(false); } };
  return <button className="cb-link" onClick={open}>{busy ? 'Opening…' : name}</button>;
}

export function InvoiceView() {
  const { id } = useParams(); const nav = useNavigate();
  const { run } = useBilling();
  return (
    <Loading>{(db) => {
      const inv = db.invoices.find((i) => i.id === id);
      if (!inv) return <Shell><div className="cb-empty">Invoice not found.</div></Shell>;
      const d = buildDeal(db, db.quotes.find((q) => q.id === inv.quote_id));
      const st = invoiceStatus(inv);
      const pays = d.payments.filter((p) => p.invoice_id === inv.id);
      const isDep = inv.type === 'deposit';
      const reminder = mailto(d.client?.email, `Reminder: ${inv.number} from ${cfg.company.name}`,
        `Hi ${firstName(d.client)},\n\nA friendly reminder that invoice ${inv.number} (${isDep ? 'deposit' : 'balance'}) of ${money(inv.balance_due)} is outstanding.\n\nPlease pay by EFT or cash deposit using ${inv.number} as your reference:\n${cfg.banks.map((b) => `${b.bank}: ${b.accountName}, ${b.accountNumber}`).join('\n')}\n\n${isDep ? 'We start your project as soon as the deposit reflects.' : 'We release your final files as soon as the balance reflects.'}\n\nKind regards,\n${cfg.company.name}`);
      const uncleared = pays.filter((p) => !p.funds_cleared);
      return (
        <Shell stage={d.status === 'closed' ? 9 : d.stage} actions={
          <ActionBar note={isDep && d.project?.status === 'on_hold' ? 'Project is ON HOLD until the deposit clears' : null}>
            <button className="cb-btn primary" onClick={() => nav(to(`invoices/${id}/send`))}>Send Invoice</button>
            {inv.status !== 'paid' && <button className="cb-btn primary" onClick={() => nav(to(`invoices/${id}/pay`))}>Record Payment</button>}
            {inv.status !== 'paid' && <a className="cb-btn" href={reminder}>Open reminder draft</a>}
            {d.project && <button className={`cb-btn ${inv.status === 'paid' ? 'primary' : ''}`} onClick={() => nav(to(`projects/${d.project.id}`))}>Open project</button>}
            <button className="cb-btn" onClick={() => downloadDocument('invoice',id).catch(e=>window.alert(e.message))}>Download PDF</button>
          </ActionBar>}>
          <PageHead crumb={<Link to={to('invoices')}>Invoices · {isDep ? 'Deposit' : 'Balance'}</Link>} title={inv.number} right={<Badge status={st} />} />
          {isDep && d.quote.accepted_at && <div className="cb-banner success"><span className="tag">Accepted</span><span><b>{d.quote.number}</b> {d.quote.signature?.method === 'portal' ? `signed by ${d.quote.signature.name}` : 'accepted'} on {fmtDate(d.quote.accepted_at)}. Deposit invoice <b>{inv.number}</b> created automatically (T&amp;C 4.1).</span><span className="right"><Link className="cb-btn sm" to={to(`quotes/${d.quote.id}`)}>View signed quote</Link></span></div>}
          {!isDep && <div className="cb-banner info"><span className="tag">Complete</span><span>Project marked complete on {fmtDate(d.project?.completed_at)}. Balance invoice <b>{inv.number}</b> issued for the remaining amount (T&amp;C 4.3).</span></div>}
          {uncleared.length > 0 && <div className="cb-banner warning"><span className="tag">Gate</span><span>{uncleared.map((p) => p.number).join(', ')} recorded but <b>funds not cleared</b>. {isDep ? 'The project starts only when the deposit reflects as cleared (T&C 4.2).' : ''}</span>
            <span className="right">{uncleared.map((p) => <button key={p.id} className="cb-btn sm" onClick={() => run(() => api.clearPayment(p.id), `${p.number} marked cleared`)}>Mark {p.number} cleared</button>)}</span></div>}
          <div style={{ marginBottom: 16 }}><SplitBar total={d.quote.total} depositState={d.deposit?.status === 'paid' ? 'paid' : 'due'} balanceState={d.balance ? (d.balance.status === 'paid' ? 'paid' : 'due') : 'wait'} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }} className="cb-cols-r">
            <div className="cb-canvas" style={{ borderRadius: 10, border: '1px solid var(--line)' }}><div style={{ maxWidth: 780, margin: '0 auto' }}><DocSheet kind="invoice" deal={d} invoice={inv} /></div></div>
            <div className="cb-stack">
              <DocumentSettings key={inv.id} kind="invoice" document={inv} />
              <Card title="Payments">
                {pays.length === 0 ? <div className="cb-help" style={{ margin: 0 }}>No payments yet.</div> : pays.map((p) => (
                  <div key={p.id} style={{ display: 'grid', gap: 2, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                    <div className="cb-row" style={{ justifyContent: 'space-between' }}><b>{p.number}</b><span className="cb-num">{money(p.amount)}</span></div>
                    <div className="cb-help" style={{ margin: 0 }}>{fmtDate(p.paid_on)} · {p.method === 'eft' ? 'EFT' : 'Cash deposit'} · {p.funds_cleared ? 'cleared' : 'not cleared'}</div>
                    <div style={{ fontSize: 12 }}>Proof: <ProofLink url={p.proof_url} name={p.proof_name} /></div>
                  </div>
                ))}
              </Card>
              <Card title="Activity"><Timeline activity={d.activity} /></Card>
            </div>
          </div>
        </Shell>
      );
    }}</Loading>
  );
}

export function RecordPayment() {
  const { id } = useParams(); const nav = useNavigate();
  const { db, run } = useBilling();
  const [p, setP] = useState(null); const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);
  if (!db) return <Shell stage={6}><div className="cb-empty">Loading…</div></Shell>;
  const inv = db.invoices.find((i) => i.id === id);
  if (!inv) return <Shell><div className="cb-empty">Invoice not found.</div></Shell>;
  const d = buildDeal(db, db.quotes.find((q) => q.id === inv.quote_id));
  const isDep = inv.type === 'deposit';
  const f = p || { amount: inv.balance_due, paid_on: todayISO(), method: 'eft', deposit_to: cfg.banks[0]?.bank || '', reference: `${inv.number} ${(d.client?.display_name || '').toUpperCase()}`, proof: null, funds_cleared: false };
  const set = (k) => (e) => setP({ ...f, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e });
  if (inv.status === 'paid') return <Shell stage={d.stage}><PageHead title="Record Payment" /><div className="cb-banner success"><span className="tag">Paid</span><span>{inv.number} is fully paid.</span><span className="right"><Link className="cb-btn sm" to={to(`invoices/${inv.id}`)}>Open invoice</Link></span></div></Shell>;

  const save = async () => {
    setErr(null); setBusy(true);
    try {
      await run(() => api.recordPayment({ invoice_id: inv.id, amount: Number(f.amount), paid_on: f.paid_on, method: f.method, deposit_to: f.deposit_to, reference: f.reference, proof_url: f.proof?.url, proof_name: f.proof?.name, funds_cleared: f.funds_cleared }), 'Payment recorded');
      nav(d.project ? to(`projects/${d.project.id}`) : to(`invoices/${inv.id}`));
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const fullPay = Number(f.amount) >= inv.balance_due - 0.001;
  const primaryLabel = isDep ? (f.funds_cleared && fullPay ? 'Record & Start Project' : 'Record Payment') : (f.funds_cleared && fullPay ? 'Record & Unlock Final Files' : 'Record Payment');

  return (
    <Shell stage={isDep ? 6 : 8} actions={
      <ActionBar note={`A receipt number is assigned automatically`}>
        <button className="cb-btn primary" disabled={busy} onClick={save}>{primaryLabel}</button>
        <button className="cb-btn ghost" onClick={() => nav(-1)}>Cancel</button>
      </ActionBar>}>
      <PageHead crumb={`${inv.number} · ${isDep ? 'Deposit' : 'Balance'}`} title="Record Payment" right={<Badge status={invoiceStatus(inv)} />} />
      <ErrorNote error={err} />
      <div className="cb-cols">
        <Card title={`Payment for ${inv.number}`}>
          <Field label="Client"><input className="cb-in" readOnly value={d.client?.display_name || ''} /></Field>
          <Field label="Amount received" required help={`Balance due on this invoice: ${money(inv.balance_due)}`}><input className="cb-in num" type="number" min="0" step="0.01" value={f.amount} onChange={set('amount')} /></Field>
          <Field label="Payment date" required><input className="cb-in" type="date" value={f.paid_on} onChange={set('paid_on')} /></Field>
          <Field label="Method" required help="Cheques are not accepted (T&C 4.1)"><span className="cb-seg">{cfg.rules.paymentMethods.map((m) => <button type="button" key={m.value} className={f.method === m.value ? 'on' : ''} onClick={() => set('method')(m.value)}>{m.label}</button>)}</span></Field>
          <Field label="Deposit to"><select className="cb-in" value={f.deposit_to} onChange={set('deposit_to')}>{cfg.banks.map((b) => <option key={b.accountNumber} value={b.bank}>{b.bank} · {b.accountName}</option>)}</select></Field>
          <Field label="Reference"><input className="cb-in" value={f.reference} onChange={set('reference')} /></Field>
          <Field label="Proof of payment" required top><FilePick value={f.proof} onPicked={set('proof')} label="Attach proof of payment" /></Field>
          <Field label="Funds"><label className="cb-check"><input type="checkbox" checked={f.funds_cleared} onChange={set('funds_cleared')} /><span><b>Funds cleared</b>, reflected in the bank account</span></label></Field>
        </Card>
        <div className="cb-stack">
          <div className="cb-banner warning" style={{ margin: 0 }}><span className="tag">Gate</span><span>{isDep
            ? <>No work starts until the deposit reflects as cleared (T&amp;C 4.2). Ticking <b>Funds cleared</b> moves the project to In Production.</>
            : <>Final files are released only after the balance is paid with proof (T&amp;C 4.3).</>}</span></div>
          <Card title="This unlocks">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Project · {d.project?.title || d.quote.subject || d.quote.number}</div>
            <div className="cb-row" style={{ marginBottom: 16 }}>{isDep ? <><Badge status="on_hold" /><span className="cb-muted">→</span><Badge status="in_production" /></> : <><Badge status="balance_due" /><span className="cb-muted">→</span><Badge status="paid" /></>}</div>
            <SplitBar total={d.quote.total} depositState={isDep ? 'due' : 'paid'} balanceState={isDep ? 'wait' : 'due'} />
          </Card>
          <Card title="Activity"><Timeline activity={d.activity} /></Card>
        </div>
      </div>
    </Shell>
  );
}
