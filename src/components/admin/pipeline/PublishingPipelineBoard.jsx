import React, { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, ChevronRight, Clock, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { authorName, createPublishingPipelineApi, filterPublishingDeals, pipelineSummary, publishingPipelineKey } from '@/lib/publishingPipeline';

const api = createPublishingPipelineApi(supabase);
const money = value => value == null ? 'Value not set' : new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:2}).format(value);
const date = value => value ? new Intl.DateTimeFormat('en-ZA',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)) : 'Not recorded';
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B87333]';
const colours = ['#6366f1','#0ea5e9','#d97706','#8b5cf6','#B87333','#db2777','#0891b2','#15803d','#dc2626'];

function ProjectDetails({ deal, stages, onClose }) {
  const queryClient = useQueryClient();
  const [values,setValues] = useState({ title:deal.title,stage_id:deal.stage_id,amount_zar:deal.amount_zar ?? '',trim_size:deal.trim_size || '',notes:deal.notes || '',expected_close:deal.expected_close || '' });
  const [saved,setSaved] = useState(false);
  const history = useQuery({queryKey:[...publishingPipelineKey,'history',deal.id],queryFn:()=>api.history(deal.id)});
  const mutation = useMutation({mutationFn:()=>api.update(deal,values),onSuccess:async()=>{
    setSaved(true);
    await queryClient.invalidateQueries({queryKey:publishingPipelineKey});
    onClose();
  },onError:()=>queryClient.invalidateQueries({queryKey:publishingPipelineKey})});
  const names = new Map(stages.map(s=>[s.id,s.name]));
  const field = e => {setSaved(false);setValues(v=>({...v,[e.target.name]:e.target.value}));};
  return <section aria-label={`Project details: ${deal.title}`} className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-[#9a6030]">Project details</p><h2 className="mt-1 text-xl font-semibold text-slate-900">{deal.title}</h2><p className="mt-1 text-sm text-slate-600">{authorName(deal.client)}{deal.client?.publisher ? ` · ${deal.client.publisher}` : ''}</p></div>
      <button type="button" onClick={onClose} disabled={mutation.isPending} aria-label="Close project details" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"><X size={20}/></button>
    </div>
    <div className="grid gap-8 p-5 lg:grid-cols-2">
      <form onSubmit={e=>{e.preventDefault();mutation.mutate();}} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">Project title<input required name="title" value={values.title} onChange={field} className={`${inputClass} mt-1`}/></label>
        <label className="block text-sm font-medium text-slate-700">Stage<select name="stage_id" value={values.stage_id} onChange={field} className={`${inputClass} mt-1`}>{stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Value (ZAR)<input type="number" min="0" max="9999999999.99" step="0.01" name="amount_zar" value={values.amount_zar} onChange={field} placeholder="Not set" className={`${inputClass} mt-1`}/></label>
          <label className="block text-sm font-medium text-slate-700">Trim size<input name="trim_size" value={values.trim_size} onChange={field} placeholder="e.g. A5 or 6x9" className={`${inputClass} mt-1`}/></label>
        </div>
        <label className="block text-sm font-medium text-slate-700">Expected completion<input type="date" name="expected_close" value={values.expected_close} onChange={field} className={`${inputClass} mt-1`}/></label>
        <label className="block text-sm font-medium text-slate-700">Project notes<textarea name="notes" value={values.notes} onChange={field} rows={4} className={`${inputClass} mt-1`}/></label>
        {mutation.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{mutation.error.message}</p>}
        {saved && <p role="status">Project saved.</p>}
        <button disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-[#9a6030] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#804f27] disabled:opacity-50">{mutation.isPending && <Loader2 size={16} className="animate-spin"/>}{mutation.isPending ? 'Saving…' : 'Save project'}</button>
      </form>
      <div>
        <h3 className="font-semibold text-slate-900">Client and Zoho references</h3>
        <dl className="mt-3 space-y-2 break-words text-sm text-slate-600">
          <div><dt className="inline font-medium text-slate-800">Email: </dt><dd className="inline">{deal.client?.email || 'Not supplied'}</dd></div>
          <div><dt className="inline font-medium text-slate-800">Phone: </dt><dd className="inline">{deal.client?.phone || 'Not supplied'}</dd></div>
          <div><dt className="inline font-medium text-slate-800">Zoho contact ID: </dt><dd className="inline">{deal.client?.zoho_contact_id || 'Not supplied'}</dd></div>
          <div><dt className="inline font-medium text-slate-800">Zoho deal ID: </dt><dd className="inline">{deal.zoho_deal_id || 'Not supplied'}</dd></div>
        </dl>
        <h3 className="mt-7 flex items-center gap-2 font-semibold text-slate-900"><Clock size={17}/>Stage history</h3>
        {history.isPending && <p role="status" className="mt-3 text-sm text-slate-500">Loading history…</p>}
        {history.error && <p role="alert" className="mt-3 text-sm text-red-700">{history.error.message} <button type="button" onClick={()=>history.refetch()} className="underline">Retry</button></p>}
        {history.data && <ol className="mt-4 space-y-4">{history.data.map(h=><li key={h.id} className="border-l-2 border-[#B87333]/40 pl-4"><p className="text-sm font-medium text-slate-800">{h.from_stage == null ? 'Created' : names.get(h.from_stage) || `Stage ${h.from_stage}`} <ArrowRight size={12} className="inline"/> {names.get(h.to_stage) || `Stage ${h.to_stage}`}</p><p className="mt-1 text-xs text-slate-500">{date(h.changed_at)}</p></li>)}</ol>}
      </div>
    </div>
  </section>;
}

export default function PublishingPipelineBoard() {
  const queryClient = useQueryClient();
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const [selected,setSelected] = useState(null);
  const [moving,setMoving] = useState(null);
  const [moveError,setMoveError] = useState('');
  const moveLock = useRef(false);
  const detailsRef = useRef(null);
  const query = useQuery({queryKey:publishingPipelineKey,queryFn:()=>api.load(),refetchOnWindowFocus:true});
  const stages=query.data?.stages || [], deals=query.data?.deals || [];
  const visible=useMemo(()=>filterPublishingDeals(deals,stages,search,category),[deals,stages,search,category]);
  const summary=pipelineSummary(deals,stages);
  const selectedDeal=deals.find(d=>d.id===selected);
  async function move(deal,stageId) {
    if (moveLock.current || Number(stageId)===deal.stage_id) return;
    moveLock.current=true;setMoving(deal.id);setMoveError('');
    try {
      await api.update(deal,{...deal,stage_id:Number(stageId)});
      await queryClient.invalidateQueries({queryKey:publishingPipelineKey});
    } catch(error) {setMoveError(error.message);await queryClient.invalidateQueries({queryKey:publishingPipelineKey});}
    finally {moveLock.current=false;setMoving(null);}
  }
  function open(dealId) {
    setSelected(dealId);
    requestAnimationFrame(()=>detailsRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-[#9a6030]">Sales and production</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">Creative Books Pipeline</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Track each book from enquiry to delivery. Zoho references are retained; automatic Zoho synchronisation is not connected.</p></div>
      <button type="button" disabled={query.isFetching || Boolean(moving)} onClick={()=>queryClient.invalidateQueries({queryKey:publishingPipelineKey})} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"><RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''}/>Refresh</button>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Projects',summary.total],['In progress',summary.open],['Delivered',summary.won],['Lost / Cancelled',summary.lost]].map(([label,n])=><div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{query.isPending ? '…' : n}</p></div>)}</div>
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-0 flex-1"><span className="sr-only">Search projects, authors or publishers</span><Search size={17} className="absolute left-3 top-3 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects, authors or publishers" className={`${inputClass} pl-10`}/></label>
      <label><span className="sr-only">Filter pipeline category</span><select value={category} onChange={e=>setCategory(e.target.value)} className={inputClass}><option value="all">All projects</option><option value="open">In progress</option><option value="won">Delivered</option><option value="lost">Lost / Cancelled</option></select></label>
      <span aria-live="polite" className="text-sm text-slate-500">{visible.length} shown</span>
    </div>
    {query.isPending && <p role="status" className="flex items-center gap-2 rounded-xl bg-white p-8 text-slate-600"><Loader2 size={20} className="animate-spin"/>Loading your pipeline…</p>}
    {query.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p className="flex items-center gap-2 font-semibold"><AlertCircle size={18}/>Unable to load the pipeline</p><p className="mt-2">{query.error.message}</p><button type="button" onClick={()=>query.refetch()} className="mt-3 underline">Try again</button></div>}
    {moveError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{moveError}</p>}
    {query.data && !query.error && <>
      {stages.length===0 ? <p className="rounded-xl border bg-white p-6 text-sm text-slate-600">No pipeline stages are visible to this account. Check your staff access.</p> : <>
        <p className="text-xs text-slate-500">Scroll horizontally to see all nine stages. Use a project’s stage menu to move it, or open its details to edit it. Stage moves are saved without sending client notifications.</p>
        <div tabIndex={0} role="region" aria-label="Nine-stage publishing pipeline board" className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-3 focus:outline-none focus:ring-2 focus:ring-[#B87333]">
          <div className="flex items-start gap-3" style={{minWidth:stages.length*276}}>{stages.map((stage,index)=>{
            const items=visible.filter(d=>d.stage_id===stage.id);
            return <section key={stage.id} aria-label={`${stage.name}: ${items.length} projects`} className="w-64 shrink-0 rounded-xl bg-slate-50">
              <div className="flex min-h-[72px] items-center justify-between gap-2 border-t-4 px-3 py-4" style={{borderTopColor:colours[index%colours.length]}}><h2 className="text-sm font-semibold text-slate-800">{stage.id}. {stage.name}</h2><span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">{items.length}</span></div>
              <div className="space-y-3 px-2 pb-3">{items.length===0 && <p className="px-2 py-6 text-center text-xs text-slate-400">No projects</p>}{items.map(deal=><article key={deal.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <button type="button" onClick={()=>open(deal.id)} className="w-full text-left text-sm font-semibold leading-relaxed text-slate-900 hover:text-[#9a6030]">{deal.title}</button>
                <p className="mt-2 text-xs text-slate-600">{authorName(deal.client)}</p>
                {deal.client?.publisher && <p className="mt-1 text-xs text-slate-500">{deal.client.publisher}</p>}
                <p className="mt-3 text-sm font-semibold text-slate-800">{money(deal.amount_zar)}</p>
                {deal.trim_size && <p className="mt-1 text-xs text-slate-500">Format: {deal.trim_size}</p>}
                <label className="mt-4 block text-xs font-medium text-slate-500">Stage<select aria-label={`Stage for ${deal.title}`} value={deal.stage_id} disabled={Boolean(moving) || selected===deal.id} onChange={e=>move(deal,e.target.value)} className={`${inputClass} mt-1 text-xs disabled:opacity-50`}>{stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
                {moving===deal.id && <p role="status" className="mt-2 text-xs text-[#9a6030]">Saving stage…</p>}
                <button type="button" onClick={()=>open(deal.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9a6030]">Details and history<ChevronRight size={13}/></button>
              </article>)}</div>
            </section>;
          })}</div>
        </div>
        {visible.length===0 && <p className="rounded-xl bg-white p-6 text-sm text-slate-600">No projects match these filters.</p>}
      </>}
    </>}
    <div ref={detailsRef} style={{scrollMarginTop:24}}>{selectedDeal && <ProjectDetails key={`${selectedDeal.id}:${selectedDeal.updated_at}`} deal={selectedDeal} stages={stages} onClose={()=>setSelected(null)}/>}</div>
  </div>;
}
