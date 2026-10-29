import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import cfg from '../billing.config.js';
import { api } from '../lib/store.js';
import { addDays, fmtDate, lineAmount, num, quoteTotals, todayISO } from '../lib/rules.js';
import { ActionBar, Badge, Card, ErrorNote, Field, PageHead, Shell, SplitBar, to, useBilling } from '../components.jsx';

const emptyLine = () => ({ key: Math.random().toString(36).slice(2), item_id: null, name: '', description: '', qty: 1, rate: 0, discount: 0, discount_type: 'amount' });

function ItemPicker({ value, items, onText, onPick }) {
  const [open, setOpen] = useState(false); const [hi, setHi] = useState(0);
  const matches = items.filter((i) => i.name.toLowerCase().includes((value || '').toLowerCase())).slice(0, 8);
  const key = (e) => {
    if (!open || !matches.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, matches.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); onPick(matches[hi]); setOpen(false); }
  };
  return (
    <div style={{ position: 'relative' }}>
      <input className="cb-in" placeholder="Type or click to select an item." value={value} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => { onText(e.target.value); setOpen(true); setHi(0); }} onKeyDown={key} style={{ fontWeight: 600 }} aria-label="Item" />
      {open && matches.length > 0 && (
        <div className="cb-picker">{matches.map((m, i) => (
          <button type="button" key={m.id} className={i === hi ? 'hi' : ''} onMouseDown={(e) => { e.preventDefault(); onPick(m); setOpen(false); }}>{m.name}<small>Rate: R{num(m.rate)}</small></button>
        ))}</div>
      )}
    </div>
  );
}

export default function QuoteEditor() {
  const { id } = useParams(); const [sp] = useSearchParams(); const nav = useNavigate();
  const { db, run } = useBilling();
  const [q, setQ] = useState(null); const [lines, setLines] = useState([emptyLine()]); const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);

  const loadedKey = useRef(null);
  useEffect(() => {
    const key = id || `new:${sp.get('client') || ''}`;
    if (!db || loadedKey.current === key) return;
    loadedKey.current = key;
    if (id) {
      const found = db.quotes.find((x) => x.id === id); if (!found) return;
      setQ({ ...found });
      const its = db.quote_items.filter((i) => i.quote_id === id).sort((a, b) => a.position - b.position).map((i) => ({ ...i, key: i.id }));
      setLines(its.length ? its : [emptyLine()]);
    } else {
      setQ({ client_id: sp.get('client') || '', quote_date: todayISO(), subject: '', salesperson: cfg.company.name, notes: '', require_signature: true });
    }
  }, [db, id, sp, q]);

  const totals = useMemo(() => quoteTotals(lines), [lines]);
  if (!db || !q) return <Shell stage={2}><div className="cb-empty">Loading…</div></Shell>;
  if (id && q.status && q.status !== 'draft') {
    return <Shell stage={2}><PageHead title={q.number} /><div className="cb-banner warning"><span className="tag">Locked</span><span>This quote has been {q.status}. To change it, open the quote and use <b>Revise quote</b> (T&amp;C 3.3).</span><span className="right"><Link className="cb-btn sm" to={to(`quotes/${id}`)}>Open quote</Link></span></div></Shell>;
  }
  const setLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const client = db.clients.find((c) => c.id === q.client_id);

  const save = async (andSend) => {
    setErr(null); setBusy(true);
    try {
      const saved = await run(() => api.saveQuote({ ...q, id: id || undefined }, lines.map(({ key, ...l }) => l)), 'Quote saved');
      nav(andSend ? to(`quotes/${saved.id}/send`) : to(`quotes/${saved.id}`));
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Shell stage={2} actions={
      <ActionBar note={`Next: Stage 3, Send quote`}>
        <button className="cb-btn" disabled={busy} onClick={() => save(false)}>Save as Draft</button>
        <button className="cb-btn primary" disabled={busy} onClick={() => save(true)}>Save and Send</button>
        <button className="cb-btn ghost" onClick={() => nav(-1)}>Cancel</button>
      </ActionBar>}>
      <PageHead crumb="Quotes" title={id ? `Edit ${q.number}` : 'New Quote'} right={<Badge status="draft" />} />
      <ErrorNote error={err} />
      <Card style={{ marginBottom: 16 }}>
        <div className="cb-grid2" style={{ gap: '0 32px' }}>
          <Field label="Client" required>
            <span className="cb-row" style={{ flexWrap: 'nowrap' }}>
              <select className="cb-in" value={q.client_id} onChange={(e) => setQ({ ...q, client_id: e.target.value })}>
                <option value="">Select a client</option>
                {[...db.clients].sort((a, b) => a.display_name.localeCompare(b.display_name)).map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
              </select>
              <Link className="cb-btn sm" to={to('clients/new')}>+ New</Link>
            </span>
          </Field>
          <Field label="Salesperson"><input className="cb-in" value={q.salesperson || ''} onChange={(e) => setQ({ ...q, salesperson: e.target.value })} /></Field>
          <Field label="Quote#" required help={id ? null : 'Numbered automatically when saved'}><input className="cb-in" readOnly value={q.number || 'Auto'} /></Field>
          <Field label="Subject"><input className="cb-in" placeholder="Let your client know what this quote is for" value={q.subject || ''} onChange={(e) => setQ({ ...q, subject: e.target.value })} /></Field>
          <Field label="Quote date" required><input className="cb-in" type="date" value={q.quote_date} onChange={(e) => setQ({ ...q, quote_date: e.target.value })} /></Field>
          <Field label="Valid until" help={`Set automatically: quote date + ${cfg.rules.quoteValidityDays} days (T&C 3.1)`}><input className="cb-in" readOnly value={fmtDate(addDays(q.quote_date || todayISO(), cfg.rules.quoteValidityDays))} /></Field>
        </div>
      </Card>

      <Card title="Item Table" pad={false} style={{ marginBottom: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="cb-items" style={{ minWidth: 720 }}>
            <thead><tr><th style={{ width: '42%' }}>Item details</th><th className="r">Quantity</th><th className="r">Rate</th><th className="r">Discount</th><th className="r">Amount</th><th /></tr></thead>
            <tbody>{lines.map((l) => (
              <tr key={l.key}>
                <td>
                  <ItemPicker value={l.name} items={db.items} onText={(name) => setLine(l.key, { name, item_id: null })}
                    onPick={(m) => setLine(l.key, { item_id: m.id, name: m.name, rate: Number(m.rate), description: m.description || '' })} />
                  <textarea className="cb-in sm" style={{ marginTop: 6, minHeight: 44, fontSize: 12 }} placeholder="Spec lines, e.g. - 570 pages" value={l.description} onChange={(e) => setLine(l.key, { description: e.target.value })} />
                </td>
                <td className="r"><input className="cb-in num sm" type="number" min="0" step="1" value={l.qty} onChange={(e) => setLine(l.key, { qty: e.target.value })} aria-label="Quantity" /></td>
                <td className="r"><input className="cb-in num sm" type="number" min="0" step="0.01" value={l.rate} onChange={(e) => setLine(l.key, { rate: e.target.value })} aria-label="Rate" /></td>
                <td className="r">
                  <span className="cb-row" style={{ flexWrap: 'nowrap', gap: 4 }}>
                    <input className="cb-in num sm" type="number" min="0" step="0.01" value={l.discount} onChange={(e) => setLine(l.key, { discount: e.target.value })} aria-label="Discount" />
                    <select className="cb-in sm" style={{ width: 62, paddingRight: 20 }} value={l.discount_type} onChange={(e) => setLine(l.key, { discount_type: e.target.value })} aria-label="Discount type"><option value="amount">R</option><option value="percent">%</option></select>
                  </span>
                </td>
                <td className="r cb-num" style={{ fontWeight: 600, paddingTop: 18 }}>{num(lineAmount(l))}</td>
                <td><button type="button" className="cb-btn ghost sm" aria-label="Remove line" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.key !== l.key) : [emptyLine()]))}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="bd" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,360px)', gap: 24, alignItems: 'start' }}>
          <div><button type="button" className="cb-btn sm" onClick={() => setLines((ls) => [...ls, emptyLine()])}>+ Add row</button></div>
          <div className="cb-sum">
            <div className="ln"><span>Sub Total</span><span>{num(totals.sub_total)}</span></div>
            {totals.discount_total > 0 && <div className="ln cb-muted"><span>Includes discount</span><span>{num(totals.discount_total)}</span></div>}
            <div className="ln grand"><span>Total (R)</span><span>{num(totals.total)}</span></div>
          </div>
        </div>
      </Card>

      <div className="cb-grid2">
        <Card title={<>Payment schedule <span className="cb-muted" style={{ fontWeight: 400, fontSize: 12 }}>T&amp;C 4.1 / 4.3</span></>}>
          <SplitBar total={totals.total} />
          <div className="cb-help" style={{ marginTop: 8 }}>The deposit invoice is created automatically when {client ? client.first_name || client.display_name : 'the client'} signs. The balance is invoiced when the project is marked complete.</div>
        </Card>
        <Card title="Notes & terms">
          <Field label="Customer notes" top help="Banking details and T&Cs are added to the quote automatically."><textarea className="cb-in" value={q.notes || ''} onChange={(e) => setQ({ ...q, notes: e.target.value })} placeholder="Optional note to the client" /></Field>
          <label className="cb-check"><input type="checkbox" checked={q.require_signature !== false} onChange={(e) => setQ({ ...q, require_signature: e.target.checked })} />Client must sign to accept (T&amp;C 3.7)</label>
        </Card>
      </div>
    </Shell>
  );
}
