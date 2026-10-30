import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {fixture} from './helpers/billing-fixture.mjs';import {workflowMessage,deliverWorkflowJobs} from '../supabase/functions/billingWorkflowNotifications/worker.js';import {previewTemplate,serviceEmailMessage} from '../supabase/functions/_shared/service-email.js';
const migration='20261030053819_project_completed_once.sql';
test('Project Completed requires every selected service and real final handover; queues one immutable project email',async()=>{
 const {db,role,rpc}=await fixture();try{
 for(const m of ['20261029220604_service_workflow_portal_templates.sql','20261030050936_delivery_review_approval_history.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+m,import.meta.url),'utf8'));
 await role();const cid=(await db.query("INSERT INTO cb_clients(display_name,first_name,email) VALUES('Synthetic Author','Lerato','author@example.test') RETURNING id")).rows[0].id;
 const qid=await rpc('cb_save_quote',{p_quote:{client_id:cid,subject:'Synthetic book'},p_items:[{name:'Printing and Typesetting',qty:100,rate:10,discount:0}]});await rpc('cb_mark_sent',{p_quote_id:qid});const {project_id:pid}=await rpc('cb_accept_quote_internal',{p_quote_id:qid,p_method:'manual',p_name:'Local synthetic only',p_file:null});await db.exec("RESET ROLE");await db.query("UPDATE cb_projects SET status='closed',files_released_at=now() WHERE id=$1",[pid]);
 const before=(await db.query('SELECT count(*)::int n FROM cb_workflow_notifications')).rows[0].n;
 await db.exec(await readFile(new URL('../supabase/migrations/'+migration,import.meta.url),'utf8'));
 assert.equal((await db.query('SELECT count(*)::int n FROM cb_workflow_notifications')).rows[0].n,before,'migration never queues historical emails');
 assert.equal((await db.query('SELECT project_completed_at FROM cb_projects WHERE id=$1',[pid])).rows[0].project_completed_at,null,'financial closed is not final fulfilment');
 // Use selected printing + typesetting even if inference changes in future.
 await db.query("UPDATE cb_projects SET services='[\"printing\",\"typesetting\"]' WHERE id=$1",[pid]);await role();await rpc('cb_project_details',{p_id:pid,p_title:'Ink & Stories',p_owner:null});
 const state=async service=>(await db.query('SELECT * FROM cb_project_service_progress WHERE project_id=$1 AND service=$2',[pid,service])).rows[0];
 const stage=async(service,index,action)=>rpc('cb_service_stage',{p_id:pid,p_service:service,p_index:index,p_action:action,p_version:(await state(service)).version});
 const handover=async(service,method,note='Confirmed received by synthetic client')=>rpc('cb_confirm_final_handover',{p_id:pid,p_service:service,p_method:method,p_note:note,p_version:(await state(service)).version});
 const completed=async()=>(await db.query("SELECT * FROM cb_workflow_notifications WHERE project_id=$1 AND event_key LIKE 'project-completed:%'",[pid])).rows;
 await assert.rejects(handover('printing','books_delivered'),/Complete every included/);
 await stage('printing',7,'stage');assert.equal((await completed()).length,0,'ready does not mean delivered');
 for(let i=0;i<8;i++)await stage('printing',i,'complete');
 await assert.rejects(handover('printing','files_delivered'),/correct final/);await assert.rejects(handover('printing','books_delivered',''),/reference/);
 await handover('printing','books_collected');assert.equal((await completed()).length,0,'one delivered service must not finish multiservice project');
 await assert.rejects(stage('printing',0,'reopen'),/handover/);
 await stage('typesetting',0,'complete');await stage('typesetting',1,'skip');await stage('typesetting',2,'stage');await stage('typesetting',2,'complete');
 await assert.rejects(handover('typesetting','files_delivered'),/Send the final agreed files/);
 const resource=await rpc('cb_add_service_resource',{p_id:pid,p_service:'typesetting',p_purpose:'delivery',p_file:{name:'Final agreed files.pdf',url:'https://example.test/final.pdf',verified:true}});
 const request='33333333-3333-4333-8333-333333333333';await rpc('cb_send_service_delivery',{p_id:pid,p_service:'typesetting',p_instructions:'Final agreed files for your records.',p_request:request,p_resources:[resource],p_subject:'Your final files'});
 await assert.rejects(handover('typesetting','files_delivered'),/successfully/);assert.equal((await completed()).length,0,'queued file email not enough');
 await db.exec('RESET ROLE');await db.query("UPDATE cb_workflow_notifications SET status='sent',provider_id='mock-delivery',sent_at=now() WHERE id=$1",[request]);await role();assert.equal((await completed()).length,0,'provider ACK alone not final confirmation');
 const preview=await rpc('cb_preview_project_completion',{p_id:pid});assert.ok(preview.template_body.startsWith('Dear Lerato,'));assert.ok(preview.template_body.includes('Ink & Stories'));
 await handover('typesetting','files_delivered');let jobs=await completed();assert.equal(jobs.length,1);assert.equal(jobs[0].payload.stage,'Project Completed');assert.equal(jobs[0].status,'pending');
 let project=(await db.query('SELECT * FROM cb_projects WHERE id=$1',[pid])).rows[0];assert.ok(project.project_completed_at);assert.equal(project.status,'closed','financial state unchanged');
 await assert.rejects(rpc('cb_send_service_delivery',{p_id:pid,p_service:'typesetting',p_instructions:'Another delivery',p_request:'44444444-4444-4444-8444-444444444444',p_resources:[resource],p_subject:'New files'}),/handover/);
 await handover('typesetting','files_delivered');assert.equal((await completed()).length,1,'repeated confirmation never queues a second email');
 const t=(await db.query("SELECT * FROM cb_project_email_templates")).rows[0];await rpc('cb_save_project_email_template',{p_id:t.id,p_subject:'Future project thanks',p_body:'Dear {{client_first_name}}, thanks for {{book_title}}.',p_version:t.version});assert.equal((await completed())[0].payload.template_body,jobs[0].payload.template_body,'queued body immutable');await assert.rejects(rpc('cb_save_project_email_template',{p_id:t.id,p_subject:'Stale',p_body:'Stale',p_version:t.version}),/changed/);
 await role('anon',null);const portal=await rpc('cb_project_portal',{p_token:project.portal_token});assert.ok(portal.project_completed_at);assert.equal(portal.services.find(s=>s.key==='printing').handover_method,'books_collected');assert.ok(!JSON.stringify(portal).includes('Confirmed received'),'private handover notes not exposed');await assert.rejects(handover('printing','books_collected'));await assert.rejects(db.query('SELECT * FROM cb_project_email_templates'));
 await role('authenticated','22222222-2222-4222-8222-222222222222');await assert.rejects(rpc('cb_preview_project_completion',{p_id:pid}));await assert.rejects(rpc('cb_save_project_email_template',{p_id:t.id,p_subject:'No',p_body:'No',p_version:1}));await assert.rejects(db.query("SELECT cb_billing_private.cb_try_project_completed($1)",[pid]));
 }finally{await db.close();}
});
test('completion email keeps exact wording, a single inline Google review button and safe branded text',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/'+migration,import.meta.url),'utf8');const body=sql.split('$email$')[1];const p={...previewTemplate({subject:'Thank you for trusting us with your project | Creative Books SA',body},'A <script>','Ink & Stories'),stage:'Project Completed',client_email:'author@example.test'};const m=workflowMessage({kind:'stage_client',payload:p});assert.equal(m.to,'author@example.test');assert.equal(m.text,p.template_body);assert.ok(m.text.includes('Your honest feedback'));assert.ok(m.html.includes('A &lt;script&gt;'));assert.ok(m.html.includes('Ink &amp; Stories'));assert.equal((m.html.match(/href="https:\/\/g.page\/r\/CYluusLzUm24EBM\/review"/g)||[]).length,1);assert.ok(!m.html.includes('[Share your experience'));assert.ok(m.html.indexOf('Share your experience on Google')<m.html.indexOf('Thank you again for choosing'));assert.equal((m.html.match(/Warm regards,/g)||[]).length,1);assert.ok(!m.html.includes('View your project'));assert.ok(serviceEmailMessage({...p,template_body:'Custom future text'}).html.includes('Share your experience on Google'));
});
