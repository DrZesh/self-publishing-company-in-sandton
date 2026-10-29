// These relational tables are separate from the historical Contact-based pipeline.
export const publishingPipelineKey = ['publishing-pipeline'];
export function validateDealPatch(values) {
  const title = String(values.title ?? '').trim();
  if (!title) throw new Error('Enter a project title.');
  const stage = Number(values.stage_id);
  if (!Number.isInteger(stage) || stage < 1 || stage > 9) throw new Error('Choose a valid pipeline stage.');
  const rawAmount = values.amount_zar;
  const amount = rawAmount === '' || rawAmount == null ? null : Number(rawAmount);
  if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 9999999999.99)) throw new Error('Enter a valid, non-negative amount in rands.');
  const due = values.expected_close || null;
  if (due) {
    const parsed = new Date(`${due}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0,10) !== due) throw new Error('Enter a valid expected completion date.');
  }
  return { title, stage_id: stage, amount_zar: amount, trim_size: String(values.trim_size ?? '').trim() || null, notes: String(values.notes ?? ''), expected_close: due };
}
function unwrap(result) {
  if (result.error) throw new Error(result.error.message || 'The pipeline could not be loaded.');
  return result.data;
}
export function createPublishingPipelineApi(db) {
  return {
    async load() {
      const [stages, deals] = await Promise.all([
        db.from('pipeline_stages').select('id,name,category,probability').order('id'),
        db.from('deals').select('*,client:clients(*)').order('updated_at', { ascending: false }),
      ]);
      return { stages: unwrap(stages) || [], deals: unwrap(deals) || [] };
    },
    async history(dealId) {
      return unwrap(await db.from('deal_stage_history').select('id,deal_id,from_stage,to_stage,changed_at').eq('deal_id',dealId).order('id', { ascending: false })) || [];
    },
    async update(deal, values) {
      const patch = validateDealPatch(values);
      // Compare both stage and timestamp so a stale tab cannot overwrite a newer edit.
      const row = unwrap(await db.from('deals').update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id',deal.id).eq('stage_id',deal.stage_id).eq('updated_at',deal.updated_at).select('*,client:clients(*)').maybeSingle());
      if (!row) throw new Error('This project changed in another session, or you no longer have access. Refresh the board before editing again.');
      return row;
    },
  };
}
export function authorName(client) {
  return [client?.first_name,client?.last_name].filter(Boolean).join(' ') || 'Unassigned client';
}
export function filterPublishingDeals(deals, stages, search, category) {
  const categories = new Map(stages.map(s=>[s.id,s.category]));
  const term = search.trim().toLocaleLowerCase('en-ZA');
  return deals.filter(d=>(category === 'all' || categories.get(d.stage_id) === category) &&
    (!term || [d.title,authorName(d.client),d.client?.publisher,d.client?.email,d.zoho_deal_id].filter(Boolean).join(' ').toLocaleLowerCase('en-ZA').includes(term)));
}
export function pipelineSummary(deals, stages) {
  const categories = new Map(stages.map(s=>[s.id,s.category]));
  return {total:deals.length,open:deals.filter(d=>categories.get(d.stage_id)==='open').length,won:deals.filter(d=>categories.get(d.stage_id)==='won').length,lost:deals.filter(d=>categories.get(d.stage_id)==='lost').length};
}
