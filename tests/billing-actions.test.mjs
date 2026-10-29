import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
async function harness(name) {
  const rows = { Contact: [{ id: 'client', full_name: 'Test Client', email: 'test@example.invalid' }] };
  const entities = new Proxy({}, { get(_, key) { const list = rows[key] ||= []; return {
    list: async () => list,
    filter: async query => list.filter(r => Object.entries(query).every(([k,v]) => typeof v === 'object' ? true : r[k] === v)),
    create: async data => { const row = { ...data, id: webcrypto.randomUUID() }; list.push(row); return row; },
    update: async (id, patch) => Object.assign(list.find(r => r.id === id), patch),
    delete: async id => list.splice(list.findIndex(r => r.id === id), 1),
  }; } });
  let handler;
  const external = () => { throw Error('Draft actions must not send emails'); };
  const platform = { entities, asServiceRole: { entities }, auth: { me: async () => ({ role: 'admin' }) }, functions: { invoke: external } };
  vm.runInNewContext((await readFile(`supabase/functions/${name}/index.ts`, 'utf8')).replace(/^import .*;\n/gm, ''), { createClientFromRequest: () => platform, serve: (_, fn) => handler = fn, crypto: webcrypto, Response, console, fetch: external, Resend: external });
  return async body => { const response = await handler(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify(body) })); const result = await response.json(); assert.equal(response.status, 200, JSON.stringify(result)); return result; };
}
test('quote editor creates, loads and saves line items with VAT and discount', async () => {
  const call = await harness('quoteActions');
  const { quote } = await call({ action: 'create', contact_id: 'client', include_vat: true, line_items: [] });
  const { quote: updated } = await call({ action: 'update', quote_id: quote.id, contact_id: 'client', include_vat: true, discount_amount: 10, line_items: [{ description: 'Editing', quantity: 2, unit_price: 100, line_total: 200 }] });
  assert.equal(updated.total, 218.5);
  const loaded = await call({ action: 'load', quote_id: quote.id });
  assert.equal(loaded.line_items.length, 1);
  assert.equal(loaded.quote.contact_snapshot.email, 'test@example.invalid');
});
test('invoice editor creates and saves a draft without sending emails', async () => {
  const call = await harness('invoiceActions');
  const { invoice } = await call({ action: 'create', contact_id: 'client', include_vat: true, line_items: [] });
  const { invoice: updated } = await call({ action: 'update', invoice_id: invoice.id, contact_id: 'client', include_vat: true, line_items: [{ description: 'Printing', quantity: 2, unit_price: 100, line_total: 200 }] });
  assert.equal(updated.total, 230);
  assert.equal(updated.balance_due, 230);
  assert.equal(updated.status, 'Draft');
});
