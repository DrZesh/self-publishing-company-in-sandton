import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { jsPDF } from 'jspdf';
import { webcrypto } from 'node:crypto';
async function harness(name, seed = {}) {
  const rows = { Contact: [{ id: 'client', full_name: 'Test Client', email: 'test@example.invalid' }], ...seed };
  const entities = new Proxy({}, { get(_, key) { const list = rows[key] ||= []; return {
    list: async () => list,
    get: async id => list.find(r => r.id === id),
    filter: async query => list.filter(r => Object.entries(query).every(([k,v]) => typeof v === 'object' ? true : r[k] === v)),
    create: async data => { const row = { ...data, id: webcrypto.randomUUID() }; list.push(row); return row; },
    update: async (id, patch) => Object.assign(list.find(r => r.id === id), patch),
    delete: async id => list.splice(list.findIndex(r => r.id === id), 1),
  }; } });
  let handler;
  const external = () => { throw Error('Draft actions must not send emails'); };
  const platform = { entities, asServiceRole: { entities }, auth: { me: async () => ({ role: 'admin', full_name: 'Test Admin' }) }, functions: { invoke: external }, integrations: { Core: { UploadFile: async ({ file }) => { assert.equal(file.type, 'application/pdf'); return { file_url: 'https://test.invalid/document.pdf' }; } } } };
  platform.asServiceRole.integrations = platform.integrations;
  vm.runInNewContext((await readFile(`supabase/functions/${name}/index.ts`, 'utf8')).replace(/^import .*;\n/gm, ''), { createClientFromRequest: () => platform, serve: (_, fn) => handler = fn, crypto: webcrypto, Response, console: { log() {}, error() {} }, fetch: external, Resend: external, jsPDF, Blob, Uint8Array, btoa });
  const call = async body => { const response = await handler(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify(body) })); const result = await response.json(); assert.equal(response.status, 200, JSON.stringify(result)); return result; };
  call.rows = rows;
  return call;
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

test('onboarding checklist records progress and does not duplicate a contact checklist', async () => {
  const call = await harness('onboardingActions');
  const created = await call({ action: 'create_checklist', contact_id: 'client' });
  assert.equal(created.checklist.steps.length, 8);
  const updated = await call({ action: 'update_step', checklist_id: created.checklist.id, step_key: 'payment_received', status: 'done' });
  assert.equal(updated.progress, 13);
  const duplicate = await call({ action: 'create_checklist', contact_id: 'client' });
  assert.equal(duplicate.already_existed, true);
});
test('inventory receiving increments material stock and completes the purchase order', async () => {
  const call = await harness('manageInventory');
  const { material } = await call({ action: 'create_material', data: { material_code: 'PAPER-TEST', name: 'Paper', current_stock: 10 } });
  const { po } = await call({ action: 'create_po', data: { supplier_id: 'client', line_items: [{ material_id: material.id, quantity: 20 }] } });
  await call({ action: 'receive_items', po_id: po.id, data: { received_items: [{ line_item_index: 0, quantity_received: 20 }] } });
  assert.equal(call.rows.Material[0].current_stock, 30);
  assert.equal(call.rows.PurchaseOrder[0].status, 'Completed');
});
test('custom pipeline stages survive creating and updating a pipeline', async () => {
  const call = await harness('manageCustomPipeline');
  const created = await call({ action: 'create_pipeline', data: { pipeline_name: 'Publishing', stages: [{ key: 'new', name: 'New' }] } });
  await call({ action: 'update_pipeline', pipeline_id: created.pipeline_id, data: { pipeline_name: 'Publishing work', stages: [{ key: 'print', name: 'Printing' }] } });
  const loaded = await call({ action: 'get_pipeline', pipeline_id: created.pipeline_id });
  assert.equal(loaded.pipeline.stages[0].key, 'print');
});
test('payment recording creates a receipt and updates the invoice balance', async () => {
  const call = await harness('paymentActions', { Invoice: [{ id: 'invoice', total: 230, amount_paid: 0, invoice_number: 'INV-TEST' }] });
  const result = await call({ action: 'record', invoice_id: 'invoice', contact_id: 'client', amount: 100 });
  assert.equal(result.balance_due, 130);
  assert.equal(result.invoice_status, 'Partially Paid');
  assert.equal(result.receipt.amount_paid, 100);
  assert.equal(call.rows.Payment[0].receipt_id, result.receipt.id);
});
test('portal links use random capabilities and the frontend hostname', async () => {
  const call = await harness('managePortalAccess', { Project: [{ id: 'project', contact_id: 'client' }] });
  const result = await call({ action: 'generate', project_id: 'project', contact_id: 'client', custom_token: 'guessable' });
  assert.equal(result.access_token.length, 64);
  assert.match(result.portal_url, /^https:\/\/creative-books-sa\.vercel\.app\/portal\//);
});

test('invoice and quote PDFs are generated without client email delivery', async () => {
  const invoice = await harness('invoiceActions');
  const created = await invoice({ action: 'create', contact_id: 'client', line_items: [{ description: 'Test service', quantity: 1, unit_price: 100, line_total: 100 }] });
  const pdf = await invoice({ action: 'generate_pdf', invoice_id: created.invoice.id });
  assert.equal(Buffer.from(pdf.pdf_base64, 'base64').subarray(0, 4).toString(), '%PDF');
  const quote = await harness('quoteActions');
  const q = await quote({ action: 'create', contact_id: 'client', line_items: [] });
  const qpdf = await quote({ action: 'generate_pdf', quote_id: q.quote.id });
  assert.equal(qpdf.pdf_url, 'https://test.invalid/document.pdf');
});

test('historical numbering gaps do not reuse existing quote or invoice numbers', async () => {
  const year = new Date().getFullYear();
  const quote = await harness('quoteActions', { Quote: [
    { id: 'old-high', quote_number: `CBSA-QT-${year}-0500` },
    { id: 'new-low', quote_number: `CBSA-QT-${year}-0001` },
  ] });
  const created = await quote({ action: 'create', contact_id: 'client', line_items: [] });
  assert.equal(created.quote.quote_number, `CBSA-QT-${year}-0501`);
  const invoice = await harness('invoiceActions', { Invoice: [
    { id: 'old-high', invoice_number: 'INV-0500' },
    { id: 'new-low', invoice_number: 'INV-0001' },
  ] });
  const inv = await invoice({ action: 'create', contact_id: 'client', line_items: [] });
  assert.equal(inv.invoice.invoice_number, 'INV-0501');
});
