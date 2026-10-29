import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import cfg from '../billing.config.js';
import { api } from '../lib/store.js';
import { ActionBar, Card, ErrorNote, Field, PageHead, Shell, to, useBilling } from '../components.jsx';

const blank = { client_type: 'individual', first_name: '', last_name: '', display_name: '', company: '', email: '', phone: '', billing_address: '', vat_number: '', source: cfg.sources[0], service: cfg.services[0], owner: cfg.company.name, email_documents: true, portal_invite: true };

// Prefill from a CRM lead with ?first_name=…&last_name=…&email=…&phone=…&lead=Lead%20title
export default function ClientForm() {
  const { id } = useParams(); const [sp] = useSearchParams(); const nav = useNavigate();
  const { db, run } = useBilling();
  const [c, setC] = useState(null); const [err, setErr] = useState(null); const [touchedName, setTouchedName] = useState(false);
  useEffect(() => {
    if (!db || c) return;
    if (id) { const found = db.clients.find((x) => x.id === id); if (found) { setC({ ...blank, ...found }); setTouchedName(true); } return; }
    const pre = {}; ['first_name', 'last_name', 'email', 'phone', 'company'].forEach((k) => { if (sp.get(k)) pre[k] = sp.get(k); });
    setC({ ...blank, ...pre, display_name: `${pre.first_name || ''} ${pre.last_name || ''}`.trim() });
  }, [db, id, sp, c]);
  if (!c) return <Shell stage={1}><div className="cb-empty">Loading…</div></Shell>;

  const set = (k) => (e) => {
    const v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setC((p) => {
      const n = { ...p, [k]: v };
      if ((k === 'first_name' || k === 'last_name') && !touchedName) n.display_name = `${n.first_name} ${n.last_name}`.trim();
      if (k === 'company' && n.client_type === 'business' && !touchedName) n.display_name = v;
      return n;
    });
  };
  const save = async (thenQuote) => {
    setErr(null);
    try {
      const saved = await run(() => api.saveClient(c), 'Client saved');
      nav(thenQuote ? to(`quotes/new?client=${saved.id}`) : to('clients'));
    } catch (e) { setErr(e.message); }
  };
  const lead = sp.get('lead');

  return (
    <Shell stage={1} actions={
      <ActionBar note="Next: Stage 2, Build quote">
        <button className="cb-btn primary" onClick={() => save(true)}>Save and Create Quote</button>
        <button className="cb-btn" onClick={() => save(false)}>Save</button>
        <button className="cb-btn ghost" onClick={() => nav(-1)}>Cancel</button>
      </ActionBar>}>
      <PageHead crumb="Clients" title={id ? `Edit ${c.display_name}` : 'New Client'} right={lead ? <span className="cb-badge info">From CRM lead</span> : null} />
      {lead && <div className="cb-banner info"><span className="tag">Lead</span><span>Filled in from CRM lead <b>{lead}</b>. Check the details, then save and go straight to the quote.</span></div>}
      <ErrorNote error={err} />
      <div className="cb-cols">
        <Card title="Client details">
          <Field label="Client type"><span className="cb-seg">{['individual', 'business'].map((t) => <button type="button" key={t} className={c.client_type === t ? 'on' : ''} onClick={() => set('client_type')(t)}>{t === 'individual' ? 'Individual' : 'Business'}</button>)}</span></Field>
          <Field label="Name" required><span className="cb-row" style={{ flexWrap: 'nowrap' }}><input className="cb-in" placeholder="First name" value={c.first_name} onChange={set('first_name')} /><input className="cb-in" placeholder="Last name" value={c.last_name} onChange={set('last_name')} /></span></Field>
          <Field label="Display name" required help={`Used in emails ("Hi ${(c.first_name || c.display_name || 'there').split(' ')[0]},") and on every document's Bill To.`}>
            <input className="cb-in" value={c.display_name} onChange={(e) => { setTouchedName(true); set('display_name')(e); }} />
          </Field>
          <Field label="Company"><input className="cb-in" placeholder="Optional" value={c.company || ''} onChange={set('company')} /></Field>
          <Field label="Email" required><input className="cb-in" type="email" value={c.email} onChange={set('email')} /></Field>
          <Field label="Phone"><input className="cb-in" type="tel" value={c.phone || ''} onChange={set('phone')} /></Field>
          <Field label="Billing address" top><textarea className="cb-in" placeholder="Street, suburb, city, postal code" value={c.billing_address || ''} onChange={set('billing_address')} /></Field>
          <Field label="VAT number"><input className="cb-in" placeholder="Only for VAT-registered clients" value={c.vat_number || ''} onChange={set('vat_number')} /></Field>
        </Card>
        <div className="cb-stack">
          <Card title="Relationship">
            <Field label="Source"><select className="cb-in" value={c.source || ''} onChange={set('source')}>{cfg.sources.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Owner"><input className="cb-in" value={c.owner || ''} onChange={set('owner')} /></Field>
            <Field label="Service"><select className="cb-in" value={c.service || ''} onChange={set('service')}>{cfg.services.map((s) => <option key={s}>{s}</option>)}</select></Field>
          </Card>
          <Card title="Communication">
            <div style={{ display: 'grid', gap: 10 }}>
              <label className="cb-check"><input type="checkbox" checked={!!c.email_documents} onChange={set('email_documents')} />Email quotes &amp; invoices to this client</label>
              <label className="cb-check"><input type="checkbox" checked={!!c.portal_invite} onChange={set('portal_invite')} />Invite to client portal with the first quote</label>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
