import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authorName,createPublishingPipelineApi,filterPublishingDeals,pipelineSummary,validateDealPatch} from '../src/lib/publishingPipeline.js';
const deal={id:'project-a',title:'A book',stage_id:5,updated_at:'2026-10-29T10:00:00Z',notes:'Original',amount_zar:null};
function mockDb(results) {
 const calls=[];
 return {calls,from(table) {
  calls.push(['from',table]);
  const chain={};
  for(const method of ['select','order','eq','update']) chain[method]=(...args)=>{calls.push([method,...args]);return chain;};
  chain.then=(resolve,reject)=>Promise.resolve(results[table]).then(resolve,reject);
  chain.maybeSingle=()=>Promise.resolve(results[table]);
  return chain;
 }};
}
test('project validation preserves unknown values and excludes immutable identifiers',()=>{
 assert.deepEqual(validateDealPatch({...deal,zoho_deal_id:'do-not-change',client_id:'other'}),{title:'A book',stage_id:5,amount_zar:null,trim_size:null,notes:'Original',expected_close:null});
 assert.equal(validateDealPatch({...deal,amount_zar:'0'}).amount_zar,0);
 assert.equal(validateDealPatch({...deal,amount_zar:'1234.50'}).amount_zar,1234.5);
});
test('invalid dates, stages and financial values are rejected before a write',()=>{
 for(const patch of [{title:' '},{stage_id:0},{stage_id:10},{stage_id:'five'},{amount_zar:-1},{amount_zar:'Infinity'},{amount_zar:'bad'},{amount_zar:1e20},{expected_close:'2026-02-30'}]) assert.throws(()=>validateDealPatch({...deal,...patch}));
 assert.equal(validateDealPatch({...deal,expected_close:'2028-02-29'}).expected_close,'2028-02-29');
});
test('the relational board loads stages in database order and joins client records',async()=>{
 const db=mockDb({pipeline_stages:{data:[{id:5,name:'Typesetting & Cover'}]},deals:{data:[deal]}});
 const result=await createPublishingPipelineApi(db).load();
 assert.equal(result.deals[0].id,deal.id);
 assert(db.calls.some(c=>c[0]==='order'&&c[1]==='id'));
 assert(db.calls.some(c=>c[0]==='select'&&c[1]==='*,client:clients(*)'));
});
test('a database load error is shown rather than an empty successful board',async()=>{
 const db=mockDb({pipeline_stages:{data:[]},deals:{error:{message:'Permission denied'}}});
 await assert.rejects(createPublishingPipelineApi(db).load(),/Permission denied/);
});
test('updates guard against stale edits and preserve Zoho and client identifiers',async()=>{
 const db=mockDb({deals:{data:{...deal,stage_id:6}}});
 const updated=await createPublishingPipelineApi(db).update(deal,{...deal,stage_id:6,zoho_deal_id:'changed',client_id:'changed'});
 assert.equal(updated.stage_id,6);
 for(const [field,value] of [['id',deal.id],['stage_id',5],['updated_at',deal.updated_at]]) assert(db.calls.some(c=>c[0]==='eq'&&c[1]===field&&c[2]===value));
 const patch=db.calls.find(c=>c[0]==='update')[1];
 assert(!('zoho_deal_id' in patch));assert(!('client_id' in patch));assert(!Number.isNaN(Date.parse(patch.updated_at)));
});
test('a stale edit or denied update never reports a successful save',async()=>{
 const db=mockDb({deals:{data:null}});
 await assert.rejects(createPublishingPipelineApi(db).update(deal,{...deal,stage_id:6}),/changed in another session/);
 const denied=mockDb({deals:{error:{message:'Row security denied'}}});
 await assert.rejects(createPublishingPipelineApi(denied).update(deal,{...deal,stage_id:6}),/Row security denied/);
});
test('history is limited to the selected project and sorted by insertion order',async()=>{
 const db=mockDb({deal_stage_history:{data:[{id:2,from_stage:5,to_stage:6}]}});
 const history=await createPublishingPipelineApi(db).history(deal.id);
 assert.equal(history.length,1);
 assert(db.calls.some(c=>c[0]==='eq'&&c[1]==='deal_id'&&c[2]===deal.id));
 assert(db.calls.some(c=>c[0]==='order'&&c[1]==='id'&&c[2].ascending===false));
});
test('filters and summary use real stage categories and client names',()=>{
 const stages=[{id:4,category:'open'},{id:5,category:'open'},{id:8,category:'won'},{id:9,category:'lost'}];
 const deals=[{...deal,client:{first_name:'First',last_name:'Author',publisher:'Imprint'}},{...deal,id:'other',stage_id:8,client:{last_name:'Second'}}];
 assert.equal(authorName(deals[1].client),'Second');
 assert.equal(filterPublishingDeals(deals,stages,'IMPRINT','open').length,1);
 assert.equal(filterPublishingDeals(deals,stages,'First Author','won').length,0);
 assert.deepEqual(pipelineSummary(deals,stages),{total:2,open:1,won:1,lost:0});
});
