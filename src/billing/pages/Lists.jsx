import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Badge, Card, Loading, PageHead, Shell, StageDots, to } from '../components.jsx';
import { DEAL_TABS, buildDeal, fmtDate, invoiceStatus, listDeals, num, quoteStatus } from '../lib/rules.js';

// where clicking a deal row takes you
export function dealHome(d) {
  if (d.stage <= 4 || !d.project) return to(`quotes/${d.quote.id}`);
  if (d.stage === 5 && d.deposit) return to(`invoices/${d.deposit.id}`);
  return to(`projects/${d.project.id}`);
}

export function DealsList() {
  const nav = useNavigate();
  const [tab, setTab] = useState('all');
  return (
    <Shell>
      <Loading>{(db) => {
        const deals = listDeals(db);
        const shown = deals.filter(DEAL_TABS.find((t) => t.key === tab).test);
        return (
          <>
            <PageHead title="Deals" right={<button className="cb-btn primary" onClick={() => nav(to('clients/new'))}>+ New Client &amp; Quote</button>} />
            <div className="cb-tabs" role="tablist">
              {DEAL_TABS.map((t) => <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>{t.label} ({deals.filter(t.test).length})</button>)}
            </div>
            <div className="cb-card" style={{ overflow: 'auto' }}>
              {shown.length === 0 ? <div className="cb-empty">Nothing here yet.</div> : (
                <table className="cb-list">
                  <thead><tr><th>Client · document</th><th className="hide-sm">Stage</th><th>Status</th><th className="r">Quote total (R)</th><th className="r hide-sm">Outstanding (R)</th><th>Next step</th></tr></thead>
                  <tbody>{shown.map((d) => (
                    <tr key={d.quote.id} onClick={() => nav(dealHome(d))}>
                      <td><div className="who">{d.client?.display_name}</div><div className="sub">{d.quote.number} · {d.quote.subject || fmtDate(d.quote.quote_date)}</div></td>
                      <td className="hide-sm" style={{ whiteSpace: 'nowrap' }}><StageDots stage={d.status === 'closed' ? 9 : d.stage} danger={d.status === 'overdue' || d.status === 'expired'} /><div className="sub">{d.status === 'closed' ? 'Done' : `Stage ${d.stage} of 8`}</div></td>
                      <td><Badge status={d.status} /></td>
                      <td className="r">{num(d.quote.total)}</td>
                      <td className="r hide-sm">{d.quote.status === 'accepted' ? num(d.outstanding) : '—'}</td>
                      <td>{d.next ? <Link className="cb-list next" style={{ color: 'var(--primary)', fontWeight: 500 }} to={d.nextTo} onClick={(e) => e.stopPropagation()}>{d.next}</Link> : '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </>
        );
      }}</Loading>
    </Shell>
  );
}

export function ClientsList() {
  const nav = useNavigate();
  return (
    <Shell>
      <Loading>{(db) => (
        <>
          <PageHead title="Clients" right={<button className="cb-btn primary" onClick={() => nav(to('clients/new'))}>+ New Client</button>} />
          <div className="cb-card" style={{ overflow: 'auto' }}>
            <table className="cb-list"><thead><tr><th>Name</th><th>Email</th><th className="hide-sm">Phone</th><th className="r">Quotes</th><th /></tr></thead>
              <tbody>{[...db.clients].sort((a, b) => a.display_name.localeCompare(b.display_name)).map((c) => (
                <tr key={c.id} onClick={() => nav(to(`clients/${c.id}/edit`))}>
                  <td><div className="who">{c.display_name}</div>{c.company && <div className="sub">{c.company}</div>}</td><td>{c.email}</td><td className="hide-sm">{c.phone}</td>
                  <td className="r">{db.quotes.filter((q) => q.client_id === c.id && q.status !== 'superseded').length}</td>
                  <td className="r"><Link className="cb-link" to={to(`quotes/new?client=${c.id}`)} onClick={(e) => e.stopPropagation()}>New quote</Link></td>
                </tr>))}</tbody></table>
          </div>
        </>
      )}</Loading>
    </Shell>
  );
}

export function QuotesList() {
  const nav = useNavigate();
  return (
    <Shell>
      <Loading>{(db) => (
        <>
          <PageHead title="All Quotes" right={<button className="cb-btn primary" onClick={() => nav(to('quotes/new'))}>+ New Quote</button>} />
          <div className="cb-card" style={{ overflow: 'auto' }}>
            <table className="cb-list"><thead><tr><th>Quote#</th><th>Client</th><th className="hide-sm">Date</th><th className="hide-sm">Valid until</th><th>Status</th><th className="r">Amount (R)</th></tr></thead>
              <tbody>{[...db.quotes].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map((q) => (
                <tr key={q.id} onClick={() => nav(to(`quotes/${q.id}`))}>
                  <td className="who">{q.number}</td><td>{db.clients.find((c) => c.id === q.client_id)?.display_name}</td>
                  <td className="hide-sm">{fmtDate(q.quote_date)}</td><td className="hide-sm">{fmtDate(q.expiry_date)}</td><td><Badge status={quoteStatus(q)} /></td><td className="r">{num(q.total)}</td>
                </tr>))}</tbody></table>
          </div>
        </>
      )}</Loading>
    </Shell>
  );
}

export function InvoicesList() {
  const nav = useNavigate();
  return (
    <Shell>
      <Loading>{(db) => (
        <>
          <PageHead title="Invoices" />
          <div className="cb-card" style={{ overflow: 'auto' }}>
            {db.invoices.length === 0 ? <div className="cb-empty">Invoices are created automatically when a client accepts a quote.</div> : (
              <table className="cb-list"><thead><tr><th>Invoice#</th><th>Client</th><th>Type</th><th className="hide-sm">Date</th><th>Status</th><th className="r">Total (R)</th><th className="r">Balance (R)</th></tr></thead>
                <tbody>{[...db.invoices].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map((i) => (
                  <tr key={i.id} onClick={() => nav(to(`invoices/${i.id}`))}>
                    <td className="who">{i.number}</td><td>{db.clients.find((c) => c.id === i.client_id)?.display_name}</td><td>{i.type === 'deposit' ? `Deposit ${i.percent}%` : `Balance ${i.percent}%`}</td>
                    <td className="hide-sm">{fmtDate(i.invoice_date)}</td><td><Badge status={invoiceStatus(i)} /></td><td className="r">{num(i.total)}</td><td className="r">{num(i.balance_due)}</td>
                  </tr>))}</tbody></table>
            )}
          </div>
        </>
      )}</Loading>
    </Shell>
  );
}

export function PaymentsList() {
  const nav = useNavigate();
  return (
    <Shell>
      <Loading>{(db) => (
        <>
          <PageHead title="Payments Received" />
          <div className="cb-card" style={{ overflow: 'auto' }}>
            {db.payments.length === 0 ? <div className="cb-empty">No payments recorded yet.</div> : (
              <table className="cb-list"><thead><tr><th>Payment#</th><th>Invoice</th><th>Client</th><th className="hide-sm">Date</th><th>Method</th><th>Funds</th><th className="r">Amount (R)</th></tr></thead>
                <tbody>{[...db.payments].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map((p) => {
                  const inv = db.invoices.find((i) => i.id === p.invoice_id);
                  return (
                    <tr key={p.id} onClick={() => nav(to(`invoices/${inv.id}`))}>
                      <td className="who">{p.number}</td><td>{inv?.number}</td><td>{db.clients.find((c) => c.id === inv?.client_id)?.display_name}</td>
                      <td className="hide-sm">{fmtDate(p.paid_on)}</td><td>{p.method === 'eft' ? 'EFT' : 'Cash deposit'}</td>
                      <td>{p.funds_cleared ? <span className="cb-badge success">Cleared</span> : <span className="cb-badge warning">Not cleared</span>}</td><td className="r">{num(p.amount)}</td>
                    </tr>);
                })}</tbody></table>
            )}
          </div>
        </>
      )}</Loading>
    </Shell>
  );
}

export function ProjectsList() {
  const nav = useNavigate();
  return (
    <Shell>
      <Loading>{(db) => (
        <>
          <PageHead title="Projects" />
          <div className="cb-card" style={{ overflow: 'auto' }}>
            {db.projects.length === 0 ? <div className="cb-empty">Projects are created when a quote is accepted.</div> : (
              <table className="cb-list"><thead><tr><th>Project</th><th>Client</th><th>Account status</th><th>Final project stage</th><th className="r">Outstanding (R)</th></tr></thead>
                <tbody>{[...db.projects].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map((p) => {
                  const d = buildDeal(db, db.quotes.find((q) => q.id === p.quote_id));
                  return (
                    <tr key={p.id} onClick={() => nav(to(`projects/${p.id}`))}>
                      <td><div className="who">{p.title}</div><div className="sub">{d.quote.number}</div></td><td>{d.client?.display_name}</td><td><Badge status={p.status} /></td><td>{p.review_requested_at?<span className="cb-badge success">Google review requested</span>:p.project_completed_at?<span className="cb-badge success">Delivered / collected</span>:<span className="cb-help">Awaiting service completion / final handover</span>}</td><td className="r">{num(d.outstanding)}</td>
                    </tr>);
                })}</tbody></table>
            )}
          </div>
        </>
      )}</Loading>
    </Shell>
  );
}
