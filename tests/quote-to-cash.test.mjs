import {test} from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('quote-to-cash enforces money, clearance, tokens and staff boundaries without altering legacy records',async()=>{
const db=await PGlite.create();const admin='11111111-1111-4111-8111-111111111111',client='22222222-2222-4222-8222-222222222222';let checks=0;
async function role(r,uid) {await db.exec(`RESET ROLE; SELECT set_config('request.jwt.claim.sub','${uid||''}',false); SET ROLE ${r};`);}
async function rpc(name,args){const keys=Object.keys(args);const r=await db.query(`SELECT public.${name}(${keys.map((k,i)=>`${k}=>$${i+1}`).join(',')}) AS value`,Object.values(args));return r.rows[0].value;}
async function fails(p){await assert.rejects(p);checks++;}
const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
try {
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA auth; CREATE SCHEMA cb_private; CREATE SCHEMA storage;
 GRANT USAGE ON SCHEMA auth,cb_private,storage TO anon,authenticated,service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 CREATE FUNCTION cb_private.is_staff() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT auth.uid()='${admin}'::uuid $$;
 CREATE TABLE public.contact(id text PRIMARY KEY,data jsonb);
 CREATE TABLE public.quote(id text PRIMARY KEY,data jsonb); CREATE TABLE public.invoice(id text PRIMARY KEY,data jsonb); CREATE TABLE public.payment(id text PRIMARY KEY,data jsonb);
 INSERT INTO public.contact VALUES ('legacy-24hex','{"full_name":"Existing client","email":"existing@example.test"}'),('missing-email','{"full_name":"No email"}');
 INSERT INTO public.quote VALUES ('oldquote','{"quote_number":"Quote-001061","total":123}');
 INSERT INTO public.invoice VALUES ('oldinv','{"invoice_number":"INV-003104","total":99}');
 CREATE FUNCTION public.cb_list() RETURNS int LANGUAGE sql AS $$ SELECT 42 $$; GRANT EXECUTE ON FUNCTION public.cb_list() TO anon;
 CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid(),bucket_id text,name text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);
await db.exec(await readFile(new URL('../supabase/migrations/20261029202832_quote_to_cash_replacement.sql',import.meta.url),'utf8'));
equal((await db.query('SELECT count(*)::int n FROM cb_clients')).rows[0].n,1);
equal((await db.query('SELECT next FROM cb_counters WHERE key=\'invoice\'')).rows[0].next,3105);
const cid=(await db.query('SELECT id FROM cb_clients')).rows[0].id;
await role('authenticated',admin);
const qid=await rpc('cb_save_quote',{p_quote:{client_id:cid,subject:'Local workflow verification'},p_items:[{name:'Editing',qty:2,rate:500,discount:0}]});
equal((await db.query('SELECT total::float8 total FROM cb_quotes WHERE id=$1',[qid])).rows[0].total,1000);
const token=(await db.query('SELECT public_token FROM cb_quotes WHERE id=$1',[qid])).rows[0].public_token;
await role('anon');await fails(rpc('cb_portal_quote',{p_token:token}));
await role('authenticated',admin);await rpc('cb_mark_sent',{p_quote_id:qid});
await role('anon');const view=await rpc('cb_portal_quote',{p_token:token});equal(view.quote.status,'viewed');
const accepted=await rpc('cb_accept_quote',{p_token:token,p_name:'Local test only',p_signature:'data:image/png;base64,aGVsbG8='});
await fails(rpc('cb_accept_quote',{p_token:token,p_name:'Local test only',p_signature:'data:image/png;base64,aGVsbG8='}));
await fails(db.query('SELECT * FROM cb_quotes'));await fails(db.query('SELECT cb_billing_private.cb__apply_gates($1)',[accepted.invoice_id]));
await role('authenticated',client);equal((await db.query('SELECT * FROM cb_quotes')).rows.length,0);await fails(rpc('cb_mark_sent',{p_quote_id:qid}));
await role('authenticated',admin);equal((await db.query('SELECT total::float8 total FROM cb_invoices WHERE id=$1',[accepted.invoice_id])).rows[0].total,750);
await fails(db.query('UPDATE cb_invoices SET total=1'));
await fails(rpc('cb_record_payment',{p_payment:{invoice_id:accepted.invoice_id,amount:750,method:'eft',proof_url:'https://untrusted.invalid/proof.pdf'}}));
await db.exec('RESET ROLE');await db.exec("INSERT INTO storage.objects(bucket_id,name) VALUES ('cb-proofs','verification/proof.pdf')");await role('authenticated',admin);
await fails(rpc('cb_record_payment',{p_payment:{invoice_id:accepted.invoice_id,amount:751,method:'eft',proof_url:'storage:verification/proof.pdf'}}));
await fails(rpc('cb_record_payment',{p_payment:{invoice_id:accepted.invoice_id,amount:'NaN',method:'eft',proof_url:'storage:verification/proof.pdf'}}));
const pay=await rpc('cb_record_payment',{p_payment:{invoice_id:accepted.invoice_id,amount:750,method:'eft',proof_url:'storage:verification/proof.pdf',funds_cleared:false}});
equal((await db.query('SELECT status FROM cb_projects WHERE id=$1',[accepted.project_id])).rows[0].status,'on_hold');
await rpc('cb_clear_payment',{p_payment_id:pay.id});equal((await db.query('SELECT status FROM cb_projects WHERE id=$1',[accepted.project_id])).rows[0].status,'in_production');
const bid=await rpc('cb_complete_project',{p_project_id:accepted.project_id});equal((await db.query('SELECT total::float8 total FROM cb_invoices WHERE id=$1',[bid])).rows[0].total,250);
await fails(rpc('cb_release_files',{p_project_id:accepted.project_id}));
const bp=await rpc('cb_record_payment',{p_payment:{invoice_id:bid,amount:250,method:'eft',proof_url:'storage:verification/proof.pdf',funds_cleared:false}});
await fails(rpc('cb_release_files',{p_project_id:accepted.project_id}));await rpc('cb_clear_payment',{p_payment_id:bp.id});await rpc('cb_release_files',{p_project_id:accepted.project_id});
equal((await db.query('SELECT status FROM cb_projects WHERE id=$1',[accepted.project_id])).rows[0].status,'closed');
await fails(rpc('cb_save_quote',{p_quote:{client_id:cid},p_items:[{name:'Invalid',qty:1,rate:10,discount:20}]}));
await fails(rpc('cb_save_quote',{p_quote:{client_id:cid},p_items:[{name:'',qty:1,rate:10}]}));
await db.exec('RESET ROLE');equal((await db.query('SELECT count(*)::int n FROM public.quote')).rows[0].n,1);
equal((await db.query('SELECT count(*)::int n FROM public.invoice')).rows[0].n,1);
await role('anon');equal(await rpc('cb_list',{}),42);
const report={passed:true,checks,workflow:'draft -> shared -> signed -> 75% deposit -> cleared -> production -> 25% balance -> cleared -> closed',staffSecurity:true,legacyTablesAndFunctionsUntouched:true};
assert.equal(report.passed,true);
} catch(e){throw e;}finally{await db.close();}

});
