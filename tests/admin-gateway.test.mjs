import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { buildSync } from 'esbuild';
const output = resolve('node_modules/.cache/auth-tests/gateway.cjs');
buildSync({ entryPoints: ['base44/functions/supabaseAdminGateway/entry.ts'], outfile: output, bundle: true, platform: 'node', format: 'cjs', alias: { 'npm:@base44/sdk@0.8.25': resolve('tests/fixtures/backend-sdk.js') } });
let handler;
globalThis.Deno = { env: { get: key => ({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'publishable' })[key] }, serve: fn => { handler = fn; } };
createRequire(import.meta.url)(output);
const request = (body, signedIn = true) => new Request('https://app.example/api', { method: 'POST', headers: { 'content-type': 'application/json', ...(signedIn ? { 'x-supabase-access-token': 'token' } : {}) }, body: JSON.stringify(body) });
test('gateway rejects unauthenticated requests before obtaining service role', async () => {
  globalThis.gatewayBackendCalls = 0;
  const response = await handler(request({ kind: 'entity', entity: 'Contact', method: 'list', args: [] }, false));
  assert.equal(response.status, 401);
  assert.equal(globalThis.gatewayBackendCalls, 0);
});
test('gateway denies a non-admin even with a valid Supabase token', async () => {
  globalThis.gatewayBackendCalls = 0;
  globalThis.fetch = async () => Response.json({ id: 'u1', user_metadata: { role: 'admin' } });
  const response = await handler(request({ kind: 'entity', entity: 'Contact', method: 'list', args: [] }));
  assert.equal(response.status, 403);
  assert.equal(globalThis.gatewayBackendCalls, 0);
});
test('verified admin can read allowed entities, but cannot call arbitrary modules or edit users', async () => {
  globalThis.fetch = async () => Response.json({ id: 'u1', app_metadata: { role: 'admin' } });
  globalThis.gatewayBackend = { entities: { Contact: { list: async () => [{ id: 'contact-1' }] } } };
  const response = await handler(request({ kind: 'entity', entity: 'Contact', method: 'list', args: [] }));
  assert.deepEqual(await response.json(), [{ id: 'contact-1' }]);
  for (const body of [{ kind: 'entity', entity: '__proto__', method: 'list', args: [] }, { kind: 'entity', entity: 'Contact', method: 'constructor', args: [] }, { kind: 'integration', method: 'GenerateImage', args: {} }]) assert.equal((await handler(request(body))).status, 400);
  assert.equal((await handler(request({ kind: 'entity', entity: 'User', method: 'update', args: ['u1', { role: 'admin' }] }))).status, 403);
});
