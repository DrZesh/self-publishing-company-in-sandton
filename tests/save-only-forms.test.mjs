import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

async function harness(name, failWrites = false) {
  const saved = [];
  const forbidden = () => { throw new Error('External notification attempted'); };
  const entities = new Proxy({}, { get(_, entity) { return {
    filter: async () => [],
    get: async () => ({ id: 'service-test', name: 'Test service', duration_minutes: 30, is_active: true }),
    create: async data => { if (failWrites) throw new Error('Database unavailable'); const row = { ...data, id: `${entity}-${saved.length}` }; saved.push({ entity, row }); return row; },
    update: async (id, patch) => { const item = saved.find(x => x.row.id === id); Object.assign(item.row, patch); return item.row; },
  }; } });
  const platform = { asServiceRole: { entities }, functions: { invoke: forbidden }, integrations: { Core: { SendEmail: forbidden } } };
  let handler;
  const source = (await readFile(`supabase/functions/${name}/index.ts`, 'utf8')).replace(/^import .*;\n/gm, '');
  vm.runInNewContext(source, { queueRecordEmails: () => Promise.resolve(), createClientFromRequest: () => platform, serve: (_, fn) => { handler = fn; }, fetch: forbidden, crypto: webcrypto, TextEncoder, Response, console: { log() {}, error() {} } });
  return { saved, submit: data => handler(new Request('https://test.invalid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })) };
}

test('calculator enquiry saves submission, contact and lead without external notifications', async () => {
  const h = await harness('captureFormSubmission');
  const response = await h.submit({ formType: 'calculator_estimate', fullName: 'Test', email: 'test@example.invalid', additionalFields: { estimatedTotal: 5000 } });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.success, true);
  assert.ok(result.submissionId);
  assert.ok(result.contactId);
  assert.ok(result.leadId);
  assert.equal(h.saved.find(x => x.entity === 'Submission').row.contact_id, result.contactId);
  assert.equal(h.saved.find(x => x.entity === 'Lead').row.source_submission_id, result.submissionId);
});

test('booking saves a pending request without sending emails', async () => {
  const h = await harness('createBookingRequest');
  const response = await h.submit({ service_id: 'service-test', service_name: 'untrusted name', date: '2026-11-10', start_time: '10:00', end_time: '10:30', client_name: 'Test', client_email: 'test@example.invalid' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  const appointment = h.saved.find(x => x.entity === 'Appointment').row;
  assert.equal(appointment.status, 'pending');
  assert.equal(appointment.service_name, 'Test service');
  assert.equal(appointment.service_duration_minutes, 30);
  assert.ok(appointment.cancel_token.length >= 64);
});

test('a failed save returns failure instead of reporting success', async () => {
  for (const [name, payload] of [
    ['captureFormSubmission', { formType: 'contact', fullName: 'Test', email: 'test@example.invalid' }],
    ['createBookingRequest', { service_id: 'service-test', date: '2026-11-10', start_time: '10:00', client_name: 'Test', client_email: 'test@example.invalid' }],
  ]) {
    const h = await harness(name, true);
    assert.equal((await h.submit(payload)).status, 500);
    assert.equal(h.saved.length, 0);
  }
});

test('booking rejects invalid input before writing records', async () => {
  const h = await harness('createBookingRequest');
  const result = await h.submit({ service_id: 'service-test', date: 'bad', start_time: '99:00', client_name: 'Test', client_email: 'bad' });
  assert.equal(result.status, 400);
  assert.equal(h.saved.length, 0);
});
