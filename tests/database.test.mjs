import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
let db;
before(async () => {
 db = new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; grant usage on schema auth to anon,authenticated,service_role;
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
 create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant usage on schema storage to authenticated,service_role;
 grant all on storage.objects to authenticated,service_role;
 create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;`);
 await db.exec(await readFile(new URL('../supabase/schema.sql', import.meta.url),'utf8'));
 await db.exec(`insert into auth.users values ('11111111-1111-4111-8111-111111111111','admin@example.test','{}'),('22222222-2222-4222-8222-222222222222','client@example.test','{"role":"admin"}');
 update public."user" set data=data||'{"role":"admin"}' where id='11111111-1111-4111-8111-111111111111';
 insert into public.contact(id,data) values ('contact-a','{"full_name":"Private client","email":"private@example.test"}');
 insert into public.company_settings(data) values ('{"setting_key":"main","company_name":"Creative Books SA","api_secret":"DO-NOT-LEAK"}');`);
});
after(async () => { await db?.close(); });
async function as(role, sub, fn) {
 await db.exec(`reset role; select set_config('request.jwt.claims','${JSON.stringify(sub ? { sub, role } : {role})}',false); set role ${role};`);
 try { return await fn(); } finally { await db.exec('reset role'); }
}
test('ordinary signup cannot grant itself administrator access', async () => {
 const result = await db.query(`select data->>'role' role from public."user" where id='22222222-2222-4222-8222-222222222222'`);
 assert.equal(result.rows[0].role,'client');
});
test('anonymous visitors cannot read clients', async () => {
 await as('anon',null,async () => { await assert.rejects(db.query(`select * from public.cb_list('contact')`),/permission denied/); });
});
test('public settings return company details and remove private credentials', async () => {
 await as('anon',null,async () => {
  const result = await db.query(`select public.cb_list('company_settings') row`);
  assert.equal(result.rows[0].row.data.company_name,'Creative Books SA');
  assert.equal(result.rows[0].row.data.api_secret,undefined);
 });
});
test('clients see only their own profile and cannot promote themselves',async () => {
 await as('authenticated','22222222-2222-4222-8222-222222222222',async () => {
  const profiles=await db.query('select * from public."user"'); assert.equal(profiles.rows.length,1);
  await assert.rejects(db.query(`select public.cb_patch('user','22222222-2222-4222-8222-222222222222','{"role":"admin"}')`),/access denied/);
  const contacts=await db.query(`select * from public.cb_list('contact')`); assert.equal(contacts.rows.length,0);
 });
});
test('staff create, filter, sort numerically, paginate and atomically patch records',async () => {
 await as('authenticated','11111111-1111-4111-8111-111111111111',async () => {
  await db.exec(`insert into public.invoice(id,data) values ('inv-2','{"amount":2,"status":"Sent"}'),('inv-10','{"amount":10,"status":"Sent"}'),('inv-100','{"amount":100,"status":"Paid"}')`);
  const result=await db.query(`select public.cb_list('invoice','{"status":"Sent"}','-amount',1,0) row`);assert.equal(result.rows[0].row.id,'inv-10');
  await db.exec(`select public.cb_patch('invoice','inv-10','{"notes":"Reviewed"}'); select public.cb_patch('invoice','inv-10','{"status":"Paid"}');`);
  const patched=await db.query(`select data from public.invoice where id='inv-10'`);assert.deepEqual(patched.rows[0].data,{amount:10,status:'Paid',notes:'Reviewed'});
 });
});
test('JSON filters preserve numeric comparisons, regex and alternatives',async () => {
 const cases=[['{"x":10}','{"x":{"$lte":9}}',false],['{"name":"Aubrey"}','{"name":{"$regex":"aubre","$options":"i"}}',true],['{"status":"Paid"}','{"$or":[{"status":"Paid"},{"status":"Sent"}]}',true]];
 for (const [doc,filter,expected] of cases) { const r=await db.query('select public.cb_matches($1::jsonb,$2::jsonb) matches',[doc,filter]);assert.equal(r.rows[0].matches,expected); }
});
test('private file capabilities and rate controls are inaccessible to clients',async () => {
 await as('authenticated','22222222-2222-4222-8222-222222222222',async () => { await assert.rejects(db.query(`select public.cb_file_lookup('secret')`),/permission denied/); });
});
test('no table in the application schema lacks RLS',async () => {
 const result=await db.query(`select count(*)::int count from pg_tables where schemaname='public' and not rowsecurity`);assert.equal(result.rows[0].count,0);
});
