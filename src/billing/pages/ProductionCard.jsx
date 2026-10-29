import React,{useEffect,useState} from 'react';
import {api} from '../lib/store.js';
import {Card,ErrorNote,useBilling} from '../components.jsx';
import {fmtDate} from '../lib/rules.js';
export default function ProductionCard({project,catalogue}){
 const {run}=useBilling();const [selected,setSelected]=useState(project.services||['printing']);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [jobs,setJobs]=useState([]);
 const loadJobs=()=>api.workflowNotifications(project.id).then(setJobs);
 useEffect(()=>{let active=true;const load=()=>api.workflowNotifications(project.id).then(rows=>{if(active)setJobs(rows);}).catch(()=>{});load();const timer=setInterval(load,20000);return()=>{active=false;clearInterval(timer);};},[project.id,project.production_version]);
 const action=async(fn,message)=>{setBusy(true);setError('');try{await run(fn,message);await loadJobs();}catch(e){setError(e.message);}finally{setBusy(false);}};
 const locked=['on_hold','closed'].includes(project.status);
 const current=project.checklist.find(c=>c.key===project.current_stage);
 const different=JSON.stringify([...selected].sort())!==JSON.stringify([...(project.services||[])].sort());
 return <div className="cb-stack">
  <Card title="Production">
   <ErrorNote error={error}/>
   <div className="cb-help">Select the services included in this project. Completed stages are preserved.</div>
   <fieldset disabled={busy||project.status==='closed'} style={{border:0,padding:0,margin:'12px 0'}}><legend className="cb-label">Project services</legend>
    {catalogue.map(s=><label key={s.key} className="cb-check" style={{display:'flex',margin:'8px 0'}}><input type="checkbox" checked={selected.includes(s.key)} onChange={e=>setSelected(e.target.checked?[...selected,s.key]:selected.filter(k=>k!==s.key))}/><span>{s.label}</span></label>)}
   </fieldset>
   {different&&<button className="cb-btn primary" disabled={busy||!selected.length} onClick={()=>action(()=>api.configureProjectServices(project.id,selected,project.production_version),'Project services saved')}>Save project services</button>}
   <div className="cb-banner info" style={{margin:'14px 0'}}><span>{project.status==='on_hold'?'Waiting for the deposit to clear.':project.status==='complete'?`Production marked complete. ${current?'Current stage: '+current.label:'Final handover can still be tracked below.'}`:project.status==='closed'?'Project paid and closed.':`Current stage: ${current?.label||'Production checks complete'}`}</span></div>
   {!locked&&<label><span className="cb-label">Move project to stage</span><select aria-label="Current production stage" className="cb-in" value={project.current_stage||''} disabled={busy||different} onChange={e=>action(()=>api.setProductionStage(project.id,e.target.value,null,project.production_version),'Stage updated. Client email queued.')}>
    <option value="" disabled>Select current stage</option>{project.checklist.filter(c=>!c.done).map(c=><option key={c.key} value={c.key}>{catalogue.find(s=>s.key===c.service)?.label}: {c.label}</option>)}
   </select></label>}
   <div className="cb-help">Changing the current stage or completing a stage automatically queues a branded email to the client. Updates normally send within a minute. Deposit and balance payment gates still apply.</div>
   <ul className="cb-tl"><li className={project.started_at?'ok':''}><b>Deposit cleared</b>{project.started_at?` · ${fmtDate(project.started_at)}`:''}</li></ul>
   {catalogue.filter(s=>(project.services||[]).includes(s.key)).map(s=><section key={s.key} style={{margin:'18px 0'}}><h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>{s.label}</h3><ul className="cb-tl">
    {project.checklist.filter(c=>c.service===s.key).map(c=><li key={c.key} className={c.done?'ok':''}><label className="cb-check" style={{fontSize:12}}><input type="checkbox" disabled={locked||busy||different} checked={!!c.done} onChange={e=>action(()=>api.setProductionStage(project.id,c.key,e.target.checked,project.production_version),'Production updated. Client email queued.')}/><span><b>{c.label}</b>{c.key===project.current_stage&&!locked?' · Current stage':''}{c.done_at?` · ${fmtDate(c.done_at)}`:''}</span></label></li>)}
   </ul></section>)}
  </Card>
  <Card title="Email notifications" right={<button className="cb-btn ghost sm" onClick={()=>loadJobs().catch(e=>setError(e.message))}>Refresh</button>}>
   {!jobs.length?<p className="cb-help">Future acceptance and production updates will appear here.</p>:<ul className="cb-tl">{jobs.map(j=><li key={j.id} className={j.status==='sent'?'ok':''}><b>{j.kind==='acceptance_admin'?'Admin acceptance alert':j.payload?.stage||'Client project update'}</b><div className="cb-help">{j.status==='sent'?'Accepted by email provider':j.status==='processing'?'Sending':j.status==='failed'?'Delivery failed; retry scheduled':'Queued'} · {fmtDate(j.created_at)}</div>{j.last_error&&<div className="cb-help">{j.last_error}</div>}{j.status==='failed'&&<button className="cb-btn sm" disabled={busy} onClick={()=>action(()=>api.retryWorkflowNotification(j.id),'Notification queued for retry')}>Retry notification</button>}</li>)}</ul>}
  </Card>
 </div>;
}
