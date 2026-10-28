import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toAppUser, safeReturnTo } from '../src/lib/auth-policy.js';
test('user-editable metadata cannot grant admin access', () => {
  assert.equal(toAppUser({ user_metadata: { role: 'admin' } }).role, 'user');
  assert.equal(toAppUser({ app_metadata: { role: 'admin' } }).role, 'admin');
  assert.equal(toAppUser(null), null);
});
test('return URL accepts local paths and rejects external redirects', () => {
  assert.equal(safeReturnTo('/admin/invoices?q=paid'), '/admin/invoices?q=paid');
  for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/\nevil.example', '/admin/login?next=/admin/login', null]) assert.equal(safeReturnTo(value), '/admin/dashboard');
});
