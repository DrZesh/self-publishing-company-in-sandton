import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import cfg from '../billing.config.js';
import { api } from '../lib/store.js';
import { buildDeal, firstName, fmtDate, money, num } from '../lib/rules.js';
import { ActionBar, Badge, Card, DocSheet, Loading, Modal, PageHead, Shell, SplitBar, Timeline, mailto, to, useBilling } from '../components.jsx';

export default function ProjectView() {
  const { id } = useParams(); const nav = useNavigate();
  const { run } = useBilling();
  const [confirm, setConfirm] = useState(false);
  return (
    <Loading>{(db) => {
      const project = db.projects.find((p) => p.id === id);
      if (!project) return <Shell><div className="cb-empty">Project not found.</div></Shell>;
      const d = buildDeal(db, db.quotes.find((q) => q.id === project.quote_id));
      const { deposit, balance } = d;
      const balancePaid = balance?.status === 'paid';
      let banner = null; let actions = null; let doc = null; const right = [];
      if (project.status === 'on_hold') {
        banner = <div className="cb-banner warning"><span className="tag">On hold</span><span>Waiting for the {cfg.rules.depositPercent}% deposit ({deposit?.number}) to be paid and cleared (T&amp;C 4.2).</span></div>;
        actions = <button className="cb-btn primary" onClick={() => nav(to(`invoices/${deposit.id}`))}>Open deposit invoice</button>;
        doc = deposit && <DocSheet kind="invoice" deal={d} invoice={deposit} compact />;
      } else if (project.status === 'in_production') {
        banner = <div className="cb-banner success"><span className="tag">In production</span><span>Deposit cleared on {fmtDate(project.started_at)}. When the work is done, mark it complete to issue the {100 - cfg.rules.depositPercent}% balance invoice (T&amp;C 4.3).</span></div>;
        actions = <button className="cb-btn primary" onClick={() => setConfirm(true)}>Mark complete → issue balance invoice</button>;
        doc = <DocSheet kind="statement" deal={d} compact />;
      } else if (project.status === 'complete' && !balancePaid) {
        banner = <div className="cb-banner info"><span className="tag">Complete</span><span>Project marked complete on {fmtDate(project.completed_at)}. Balance invoice <b>{balance?.number}</b> was created (T&amp;C 4.3).</span></div>;
        const reminder = mailto(d.client?.email, `Your balance invoice ${balance?.number}`, `Hi ${firstName(d.client)},\n\nGreat news: your project is complete. The balance of ${money(balance?.balance_due)} (invoice ${balance?.number}) is now due. We release your final files as soon as payment reflects.\n\nPay by EFT or cash deposit using ${balance?.number} as reference:\n${cfg.banks.map((b) => `${b.bank}: ${b.accountName}, ${b.accountNumber}`).join('\n')}\n\nKind regards,\n${cfg.company.name}`);
        actions = <><button className="cb-btn primary" onClick={() => nav(to(`invoices/${balance.id}/pay`))}>Record Payment</button><a className="cb-btn" href={reminder}>Email balance invoice</a><button className="cb-btn" disabled title="Unlocks after the balance is paid">Release final files</button></>;
        doc = balance && <DocSheet kind="invoice" deal={d} invoice={balance} compact />;
      } else if (project.status === 'complete' && balancePaid) {
        banner = <div className="cb-banner success"><span className="tag">Paid in full</span><span>Balance received. You can now release the final files and close the deal.</span></div>;
        actions = <button className="cb-btn primary" onClick={() => run(() => api.releaseFiles(project.id), 'Final files released, deal closed')}>Release final files &amp; close</button>;
        doc = <DocSheet kind="statement" deal={d} compact />;
      } else {
        banner = <div className="cb-banner success"><span className="tag">Closed</span><span>Paid in full. Final files released on {fmtDate(project.files_released_at)}.</span></div>;
        const statement = mailto(d.client?.email, `Statement for ${d.quote.number}`, `Hi ${firstName(d.client)},\n\nThank you for your payment. Your account for ${d.quote.number} is paid in full (${money(d.quote.total)}).\n\nIt was a pleasure working with you.\n\nKind regards,\n${cfg.company.name}`);
        actions = <><a className="cb-btn primary" href={statement}>Email statement</a></>;
        doc = <DocSheet kind="statement" deal={d} compact />;
      }
      return (
        <Shell stage={project.status === 'closed' ? 9 : d.stage} actions={<ActionBar note={`Quote total ${money(d.quote.total)} · outstanding ${money(d.outstanding)}`}>{actions}<button className="cb-btn" onClick={() => window.print()}>PDF / Print</button></ActionBar>}>
          <PageHead crumb={<Link to={to('projects')}>Projects</Link>} title={`${d.client?.display_name}: ${project.title}`} right={<><Badge status={d.status === 'closed' ? 'paid' : d.status} /><Badge status={project.status} /></>} />
          {banner}
          <div className="cb-cols side">
            <div className="cb-stack">
              <Card title="Production">
                <ul className="cb-tl">
                  <li className={project.started_at ? 'ok' : ''}><b>Deposit cleared</b>{project.started_at ? ` · ${fmtDate(project.started_at)}` : ''}</li>
                  {project.checklist.map((c, i) => {
                    const locked = project.status === 'on_hold' || project.status === 'closed';
                    return (
                      <li key={c.label} className={c.done ? 'ok' : ''}>
                        <label className="cb-check" style={{ fontSize: 12 }}><input type="checkbox" disabled={locked} checked={!!c.done} onChange={() => run(() => api.toggleChecklist(project.id, i))} /><b style={{ color: 'var(--ink)' }}>{c.label}</b></label>
                      </li>
                    );
                  })}
                </ul>
              </Card>
              <Card title="Money">
                <SplitBar compact total={d.quote.total} depositState={deposit?.status === 'paid' ? 'paid' : 'due'} balanceState={balance ? (balancePaid ? 'paid' : 'due') : 'wait'} />
                <div className="cb-sum" style={{ marginTop: 12 }}>
                  <div className="ln"><span>Quote total</span><span>{num(d.quote.total)}</span></div>
                  <div className="ln"><span>Received</span><span>{num(d.received)}</span></div>
                  <div className="ln grand" style={{ fontSize: 16 }}><span>Outstanding</span><span>{num(d.outstanding)}</span></div>
                </div>
                <div className="cb-help">{d.invoices.map((i) => <div key={i.id}><Link className="cb-link" to={to(`invoices/${i.id}`)}>{i.number}</Link> · {i.type} · {i.status === 'paid' ? 'paid' : money(i.balance_due) + ' due'}</div>)}</div>
              </Card>
              <Card title="Deal timeline"><Timeline activity={d.activity} /></Card>
            </div>
            <div className="cb-canvas" style={{ padding: 16, borderRadius: 10, border: '1px solid var(--line)' }}>{doc}</div>
          </div>
          {confirm && (
            <Modal title="Mark project complete?" onClose={() => setConfirm(false)} footer={<><button className="cb-btn ghost" onClick={() => setConfirm(false)}>Cancel</button><button className="cb-btn primary" onClick={async () => { setConfirm(false); await run(() => api.completeProject(project.id), 'Balance invoice created'); }}>Complete &amp; issue invoice</button></>}>
              <div>This issues the balance tax invoice for <b>{money(d.quote.total - d.received)}</b> to {d.client?.display_name}. Final files stay locked until it is paid (T&amp;C 4.3).</div>
            </Modal>
          )}
        </Shell>
      );
    }}</Loading>
  );
}
