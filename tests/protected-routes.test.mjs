import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import { resolve } from 'node:path';
const output = resolve('node_modules/.cache/auth-tests/route.cjs');
buildSync({ stdin: { contents: `import React from 'react'; import { renderToString } from 'react-dom/server'; import { MemoryRouter } from 'react-router-dom'; import Guard from './src/components/ProtectedAdminRoute.jsx'; export function render() { return renderToString(<MemoryRouter initialEntries={['/admin/invoices']}><Guard><p>PRIVATE INVOICES</p></Guard></MemoryRouter>); }`, resolveDir: process.cwd(), loader: 'jsx' }, outfile: output, bundle: true, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', alias: { '@/lib/AuthContext': resolve('tests/fixtures/auth-context.js') } });
const { render } = createRequire(import.meta.url)(output);
test('loading, guests, recovery sessions, and non-admin users cannot render admin screens', () => {
  for (const state of [{ isLoadingAuth: true }, {}, { user: { role: 'user' } }, { user: { role: 'admin' }, isPasswordRecovery: true }]) {
    globalThis.authTestState = state;
    assert.ok(!render().includes('PRIVATE INVOICES'));
  }
});
test('non-admin users receive access denied, verified admins can render', () => {
  globalThis.authTestState = { user: { role: 'user' } };
  assert.ok(render().includes('Access denied'));
  globalThis.authTestState = { user: { role: 'admin' } };
  assert.ok(render().includes('PRIVATE INVOICES'));
});
