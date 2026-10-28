import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../scripts/templates/supabase-auth.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { requireAdmin } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const env = { get: key => ({ SUPABASE_URL: 'https://project.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'publishable', AUTH_JOB_SECRET: 'a'.repeat(40) })[key] };
const request = headers => new Request('https://app.example/api', { headers });
const fetchUser = user => async (url, init) => {
  assert.equal(url, 'https://project.supabase.co/auth/v1/user');
  assert.equal(init.headers.Authorization, 'Bearer access-token');
  return Response.json(user);
};
test('missing token is rejected before any data access', async () => {
  await assert.rejects(requireAdmin(request({}), {}, env, () => { throw new Error('Must not fetch'); }), { status: 401 });
});
test('invalid token is rejected', async () => {
  await assert.rejects(requireAdmin(request({ 'x-supabase-access-token': 'bad' }), {}, env, async () => new Response('', { status: 401 })), { status: 401 });
});
test('only verified app_metadata can authorize an administrator', async () => {
  const req = request({ 'x-supabase-access-token': 'access-token' });
  await assert.rejects(requireAdmin(req, {}, env, fetchUser({ id: 'u1', user_metadata: { role: 'admin' } })), { status: 403 });
  const user = await requireAdmin(req, {}, env, fetchUser({ id: 'u1', app_metadata: { role: 'admin' } }));
  assert.equal(user.id, 'u1');
  assert.equal(user.role, 'admin');
});
test('anonymous Supabase users cannot access admin data', async () => {
  await assert.rejects(requireAdmin(request({ 'x-supabase-access-token': 'access-token' }), {}, env, fetchUser({ id: 'u1', is_anonymous: true, app_metadata: { role: 'admin' } })), { status: 403 });
});
test('scheduled jobs require a strong configured secret; caller flags cannot bypass auth', async () => {
  await assert.rejects(requireAdmin(request({ 'x-scheduled': 'true' }), { allowScheduled: true }, env), { status: 401 });
  await assert.rejects(requireAdmin(request({ 'x-auth-job-secret': 'wrong' }), { allowScheduled: true }, env), { status: 401 });
  const user = await requireAdmin(request({ 'x-auth-job-secret': 'a'.repeat(40) }), { allowScheduled: true }, env);
  assert.equal(user.id, 'scheduled-job');
  await assert.rejects(requireAdmin(request({ 'x-supabase-access-token': 'bad', 'x-auth-job-secret': 'a'.repeat(40) }), { allowScheduled: true }, env, async () => new Response('', { status: 401 })), { status: 401 });
});
test('missing configuration and auth outages fail closed', async () => {
  const req = request({ 'x-supabase-access-token': 'access-token' });
  await assert.rejects(requireAdmin(req, {}, { get: () => undefined }), { status: 503 });
  await assert.rejects(requireAdmin(req, {}, env, async () => { throw Error('offline'); }), { status: 503 });
});
test('every deployed auth helper matches the reviewed template', async () => {
  const { readdirSync } = await import('node:fs');
  const root = new URL('../base44/functions/', import.meta.url);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = new URL(entry.name + '/entry.ts', root);
    const entrySource = readFileSync(file, 'utf8');
    if (entrySource.includes("from './supabase-auth.ts'")) assert.equal(readFileSync(new URL(entry.name + '/supabase-auth.ts', root), 'utf8'), source, entry.name);
  }
});
