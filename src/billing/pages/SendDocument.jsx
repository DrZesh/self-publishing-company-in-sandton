import React, { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import cfg from '../billing.config.js';
import { api } from '../lib/store.js';
import {money,buildDeal} from '../lib/rules.js';
import PdfDocumentPreview from '../PdfDocumentPreview.jsx';
import { ActionBar, Card, ErrorNote, Field, PageHead, Shell, to, useBilling } from '../components.jsx';

export async function downloadDocument(kind,id) {
  const data=await api.documentAction({action:'preview',kind,id});
  const bytes=Uint8Array.from(atob(data.content),c=>c.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download=data.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}

export function DocumentSettings({kind,document:doc,onSaved}) {
  const {run}=useBilling();
  const [terms,setTerms]=useState(doc.terms ?? cfg.termsSummary.join('\n'));
  const [files,setFiles]=useState(doc.attachments || []);
  const [version,setVersion]=useState(doc.document_version || 0);
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [dirty,setDirty]=useState(false);
  const pick=async e=>{
    const selected=Array.from(e.target.files||[]);e.target.value='';setError('');setBusy(true);
    try{
      if(files.length+selected.length>10)throw new Error('Attach up to 10 supporting documents.');
      if([...files,...selected].reduce((n,f)=>n+f.size,0)>12*1024*1024)throw new Error('Supporting documents must total 12 MB or less.');
      // Save each successful upload in local state so a later upload failure never hides earlier files.
      for(const f of selected){const uploaded=await api.uploadAttachment(f);setFiles(old=>[...old,uploaded]);setDirty(true);}
    }catch(e){setError(e.message);}finally{setBusy(false);}
  };
  const save=async()=>{
    setBusy(true);setError('');
    try{const r=await run(()=>api.saveDocumentSettings(kind,doc.id,kind==='invoice'?terms:null,files,version),'Document settings saved');setVersion(r.document_version);setDirty(false);onSaved?.();}catch(e){setError(e.message);}finally{setBusy(false);}
  };
  return <Card title={kind==='invoice'?'Invoice terms & attachments':'Supporting documents'}>
    <ErrorNote error={error}/>
    {kind==='invoice'&&<label><span className="cb-label">Terms &amp; Conditions</span><textarea aria-label="Invoice terms and conditions" className="cb-in cb-terms-input" value={terms} maxLength={30000} onChange={e=>{setTerms(e.target.value);setDirty(true);}}/></label>}
    <p className="cb-help">The {kind} PDF is attached automatically when you send. Add PDF, Word, PNG, JPEG or text files, up to 5 MB each and 12 MB combined.</p>
    <ul className="cb-document-files">{files.map((f,i)=><li key={f.path}><span>{f.name}</span><button className="cb-btn ghost sm" disabled={busy} onClick={()=>{setFiles(files.filter((_,j)=>j!==i));setDirty(true);}}>Remove</button></li>)}</ul>
    <label className="cb-btn"><span>{busy?'Please wait…':'Attach supporting documents'}</span><input aria-label="Attach supporting documents" type="file" multiple disabled={busy} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" onChange={pick} hidden/></label>
    <button className="cb-btn primary" style={{marginTop:12}} disabled={busy||!dirty} onClick={save}>Save {kind==='invoice'?'terms & attachments':'attachments'}</button>
    {dirty&&<p role="status" className="cb-help">Unsaved changes. Save before sending or downloading the PDF.</p>}
  </Card>;
}

export function SendDocument({kind}) {
  const {id}=useParams();const nav=useNavigate();const {db,error:loadError,refresh,notify}=useBilling();
  if(loadError)return <Shell><ErrorNote error={loadError}/></Shell>;
  if(!db)return <Shell><div className="cb-empty">Loading…</div></Shell>;
  const doc=db[kind==='quote'?'quotes':'invoices'].find(d=>d.id===id);
  if(!doc)return <Shell><ErrorNote error="Document not found."/></Shell>;
  const client=db.clients.find(c=>c.id===doc.client_id);
  return <DocumentComposer key={`${kind}:${id}`} {...{kind,doc,client,nav,refresh,notify}} deal={buildDeal(db,db.quotes.find(q=>q.id===(kind==='quote'?id:doc.quote_id)))}/>;
}
function DocumentComposer({kind,doc,client,nav,refresh,notify,deal}) {
  const request=useRef(crypto.randomUUID());
  const [form,setForm]=useState({to:client?.email||'',cc:cfg.company.email,subject:`Your ${kind} ${doc.number} from ${cfg.company.name}`,message:`Hi ${client?.first_name||client?.display_name||'there'},\n\nPlease find your ${kind} attached.${kind==='quote'?' You can review and accept it using the link below.':' Please use the invoice number as your payment reference.'}\n\nKind regards,\n${cfg.company.name}`});
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [sent,setSent]=useState(null);const [attempted,setAttempted]=useState(false);
  const set=k=>e=>setForm({...form,[k]:e.target.value});
  const send=async()=>{
    setError('');setBusy(true);setAttempted(true);
    try{const result=await api.documentAction({action:'send',kind,id:doc.id,request_id:request.current,document_version:doc.document_version||0,...form});setSent(result);notify(`${kind==='quote'?'Quote':'Invoice'} submitted to email provider`);await refresh().catch(()=>{});}
    catch(e){setError(e.message);}finally{setBusy(false);}
  };
  return <Shell stage={kind==='quote'?3:undefined} actions={<ActionBar note="PDF and saved supporting documents are included automatically">
    <button className="cb-btn primary" disabled={busy||!!sent} onClick={send}>{busy?'Sending…':sent?'Sent':`Send ${kind==='quote'?'Quote':'Invoice'}`}</button>
    <button className="cb-btn" disabled={busy} onClick={()=>downloadDocument(kind,doc.id).catch(e=>setError(e.message))}>Download PDF</button>
    <button className="cb-btn ghost" disabled={busy} onClick={()=>nav(to(`${kind}s/${doc.id}`))}>Back to {kind}</button>
  </ActionBar>}>
    <PageHead crumb={doc.number} title={`Send ${kind} to ${client?.display_name}`} />
    <ErrorNote error={error}/>
    {sent&&<div className="cb-banner success" role="status"><b>Email accepted by the provider.</b><span>The {kind} PDF and {doc.attachments?.length||0} supporting document(s) were attached. Delivery to the recipient’s inbox is handled by the email provider.</span></div>}
    <div className="cb-cols-r" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 320px',gap:16}}>
      <Card title="Email">
        <Field label="From"><span>{cfg.company.name} &lt;{cfg.company.email}&gt;</span></Field>
        <Field label="To" required><input aria-label="To" className="cb-in" type="email" value={form.to} disabled={busy||attempted} onChange={set('to')}/></Field>
        <Field label="Cc"><input aria-label="Cc" className="cb-in" value={form.cc} disabled={busy||attempted} onChange={set('cc')}/></Field>
        <Field label="Subject" required><input aria-label="Subject" className="cb-in" maxLength={200} value={form.subject} disabled={busy||attempted} onChange={set('subject')}/></Field>
        <label><span className="cb-label">Message</span><textarea aria-label="Message" className="cb-in" style={{minHeight:220}} maxLength={10000} value={form.message} disabled={busy||attempted} onChange={set('message')}/></label>
        <p className="cb-help">{doc.number} · {money(doc.total)}. {kind==='quote'?'The acceptance link is included in the email.':''}</p>
        {attempted&&!sent&&<p className="cb-help">Retry sends the same email safely. To change the message after a failed attempt, return to the document and reopen Send.</p>}
      </Card>
      <Card title="Attachments">
        <p><b>{doc.number}.pdf</b> · Automatically attached</p>
        <ul className="cb-document-files">{(doc.attachments||[]).map(f=><li key={f.path}>{f.name}</li>)}</ul>
        <Link className="cb-btn" to={to(`${kind}s/${doc.id}`)}>Edit {kind==='invoice'?'terms & attachments':'attachments'}</Link>
      </Card>
    </div>
    <div style={{marginTop:20}}><PdfDocumentPreview kind={kind} deal={deal} invoice={kind==='invoice'?doc:undefined}/></div>
  </Shell>;
}
