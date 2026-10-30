import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import * as pdfLib from 'pdf-lib';
import {handleDocument} from '../supabase/functions/billingDocumentEmail/handler.js';
import {addresses,documentPdf,envelope,invoiceTerms} from '../supabase/functions/billingDocumentEmail/document.js';
const qid='11111111-1111-4111-8111-111111111111',iid='22222222-2222-4222-8222-222222222222',uid='33333333-3333-4333-8333-333333333333',rid='44444444-4444-4444-8444-444444444444';
const quote={id:qid,client_id:uid,number:'Quote-001999',total:1000,quote_date:'2026-10-29',expiry_date:'2099-11-28',status:'draft',public_token:rid,document_version:0,attachments:[]};
const invoice={id:iid,quote_id:qid,client_id:uid,number:'INV-009999',type:'deposit',percent:75,total:750,amount_paid:0,balance_due:750,invoice_date:'2026-10-29',terms:'CUSTOM TERMS: This invoice is payable on receipt.\nDelivery after cleared payment.',document_version:0,attachments:[{name:'Support.txt',path:`${rid}/support.txt`,size:20,type:'text/plain'}]};
const client={id:uid,display_name:'Synthetic QA Client',email:'test@example.test'};
const items=[{name:'Book printing',description:'A5 softcover test',qty:100,rate:10,discount:0,amount:1000}];
function fixture(){
 const tables={cb_quotes:[structuredClone(quote)],cb_invoices:[structuredClone(invoice)],cb_clients:[client],cb_quote_items:items,cb_document_emails:[]};let finishes=0;let blocked=false;
 class Query{
  constructor(table){this.table=table;this.filters=[];this.op='select';}
  select(){return this;}eq(k,v){this.filters.push(r=>r[k]===v);return this;}neq(k,v){this.filters.push(r=>r[k]!==v);return this;}order(){return this;}
  insert(row){this.op='insert';this.row=row;return this;}update(row){this.op='update';this.row=row;return this;}
  result(){let rows=tables[this.table]||[];if(blocked&&this.table!=='cb_document_emails')return {data:[],error:null};
   if(this.op==='insert'){if(rows.some(r=>r.id===this.row.id))return {data:null,error:{code:'23505'}};rows.push({...structuredClone(this.row),created_at:new Date().toISOString(),status:'pending'});return {data:[rows.at(-1)],error:null};}
   rows=rows.filter(r=>this.filters.every(f=>f(r)));if(this.op==='update')rows.forEach(r=>Object.assign(r,this.row));return {data:rows,error:null};}
  single(){const r=this.result();return Promise.resolve({...r,data:r.data?.[0]||null,error:r.error||(!r.data?.length?new Error('not found'):null)});}
  maybeSingle(){const r=this.result();return Promise.resolve({...r,data:r.data?.[0]||null});}
  then(resolve,reject){return Promise.resolve(this.result()).then(resolve,reject);}
 }
 const staff={from:t=>new Query(t),storage:{from:()=>({download:async()=>({data:new Blob(['Supporting test file'],{type:'text/plain'}),error:null})})}};
 const admin={from:t=>new Query(t),rpc:async(name,args)=>{assert.equal(name,'cb_finish_document_email');const a=tables.cb_document_emails.find(r=>r.id===args.p_id);if(a.status!=='sent'){finishes++;a.status='sent';a.provider_id=args.p_provider_id;if(a.kind==='quote')tables.cb_quotes[0].status='sent';}return {error:null};}};
 const input={action:'send',kind:'invoice',id:iid,request_id:rid,document_version:0,to:client.email,cc:'info@example.test',subject:'Synthetic test only',message:'Attached for verification.'};
 return {tables,staff,admin,input,user:{id:uid},get finishes(){return finishes;},block:()=>{blocked=true;}};
}
const run=(f,fetcher)=>handleDocument({...f,pdfLib,emailKey:'synthetic-key',fetcher});
test('PDF and supporting files are attached; retries do not duplicate acknowledged sends',async()=>{
 const f=fixture();let calls=0;const preview=await handleDocument({...f,input:{action:'preview',kind:'invoice',id:iid},pdfLib});
 const fetcher=async(url,options)=>{calls++;assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],`cb-billing/${rid}`);const body=JSON.parse(options.body);assert.deepEqual(body.to,[client.email]);assert.equal(body.attachments.length,2);assert.equal(body.attachments[0].filename,'INV-009999.pdf');const bytes=Buffer.from(body.attachments[0].content,'base64');assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(body.attachments[0].content,preview.content,'preview and emailed attachment must be the identical PDF');assert.equal(body.attachments[1].filename,'Support.txt');assert.equal(Buffer.from(body.attachments[1].content,'base64').toString(),'Supporting test file');return Response.json({id:'provider-test-id'});};
 assert.equal((await run(f,fetcher)).sent,true);assert.equal(f.finishes,1);assert.equal(calls,1);assert.equal((await run(f,fetcher)).sent,true);assert.equal(calls,1);
});
test('provider rejection leaves quote unsent and preserves snapshot for retry',async()=>{
 const f=fixture();f.input={...f.input,kind:'quote',id:qid};let payload;
 await assert.rejects(run(f,async(u,o)=>{payload=o.body;return Response.json({message:'no'},{status:422});}),/rejected/);
 assert.equal(f.tables.cb_quotes[0].status,'draft');assert.equal(f.finishes,0);
 f.tables.cb_quotes[0].total=2000;
 await run(f,async(u,o)=>{assert.equal(o.body,payload);return Response.json({id:'retry-id'});});assert.equal(f.tables.cb_quotes[0].status,'sent');
});
test('timeout retry uses the same idempotency key and exact payload',async()=>{
 const f=fixture();let snapshot;
 await assert.rejects(run(f,async(u,o)=>{snapshot=o.body;throw new DOMException('timeout','TimeoutError');}));
 assert.equal(f.tables.cb_document_emails[0].status,'pending');assert.equal(f.finishes,0);
 await run(f,async(u,o)=>{assert.equal(o.body,snapshot);assert.equal(o.headers['Idempotency-Key'],`cb-billing/${rid}`);return Response.json({id:'retry'});});
});
test('staff boundary, stale settings and missing attachments fail before delivery',async()=>{
 const f=fixture();let calls=0;const send=async()=>{calls++;return Response.json({id:'no'});};f.block();await assert.rejects(run(f,send),/staff access/);assert.equal(calls,0);
 const g=fixture();g.input.document_version=1;await assert.rejects(run(g,send),/settings changed/);assert.equal(calls,0);
 const h=fixture();h.staff.storage.from=()=>({download:async()=>({error:new Error('missing')})});await assert.rejects(run(h,send),/Upload it again/);assert.equal(calls,0);
});
test('PDF preview uses editable invoice terms and paginates long documents',async()=>{
 const terms=Array.from({length:80},(_,i)=>`Clause ${i+1}: Custom invoice conditions remain editable and wrap within the printable area.`).join('\n');
 const bytes=await documentPdf(pdfLib,'invoice',{...invoice,terms},quote,client,items);const doc=await pdfLib.PDFDocument.load(bytes);assert.ok(doc.getPageCount()>1);
 await writeFile('/tmp/billing-invoice-qa.pdf',bytes);assert.equal(invoiceTerms({...invoice,terms:''}),'');
 const f=fixture();f.input={action:'preview',kind:'invoice',id:iid};const preview=await run(f,()=>{throw new Error('preview must not send');});assert.equal(preview.filename,'INV-009999.pdf');assert.equal(f.tables.cb_document_emails.length,0);
});
test('reject unsafe recipients and subjects; escape email message HTML',()=>{
 assert.throws(()=>addresses('victim@example.com\nBcc: attacker@example.com',true));assert.throws(()=>envelope({to:'test@example.test',subject:'Hi\r\nInjected: yes',message:'Hello'},'quote',quote,quote));
 const e=envelope({to:'test@example.test',subject:'Quote',message:'<script>bad</script>'},'quote',quote,quote);assert.ok(!e.html.includes('<script>'));assert.ok(e.html.includes('&lt;script&gt;'));assert.ok(e.html.includes('/portal/q/'));
});
test('deployed PDF configuration matches the website configuration',async()=>{
 assert.equal(await readFile(new URL('../supabase/functions/billingDocumentEmail/config.js',import.meta.url),'utf8'),await readFile(new URL('../src/billing/billing.config.js',import.meta.url),'utf8'));
});

test('canonical PDF embeds Open Sans, wraps long rows and keeps drawn text within A4 pages',async()=>{
 const draws=[];const wrapped={...pdfLib,PDFDocument:{async create(){const d=await pdfLib.PDFDocument.create();const add=d.addPage.bind(d);d.addPage=(...args)=>{const p=add(...args);const draw=p.drawText.bind(p);p.drawText=(t,o)=>{draws.push({t,...o});draw(t,o);};return p;};return d;}}};
 const longItems=[{...items[0],description:('Long final book specifications with detailed instructions.\n').repeat(130)},{...items[0],name:'Another service',description:'Unbroken'+('X'.repeat(900)),discount:10,discount_type:'percent',amount:900}];
 const bytes=await documentPdf(wrapped,'quote',{...quote,sub_total:1900,total:1900},quote,client,longItems);const doc=await pdfLib.PDFDocument.load(bytes);assert.ok(doc.getPageCount()>2);
 for(const d of draws){assert.ok(d.x>=39,`${d.t} left margin`);assert.ok(d.x+d.font.widthOfTextAtSize(d.t,d.size)<=561,`${d.t} right margin`);assert.ok(d.y>=34,`${d.t} bottom margin`);assert.ok(d.y<=792,`${d.t} top margin`);}
 assert.ok(draws.some(d=>d.font.name.includes('OpenSans')),'reference template font is embedded');
 const a=await documentPdf(pdfLib,'quote',quote,quote,client,items);const b=await documentPdf(pdfLib,'quote',quote,quote,client,items);assert.deepEqual(a,b,'stable document inputs produce byte-identical previews and attachments');
});
