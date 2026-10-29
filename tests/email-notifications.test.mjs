import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notificationMessages, sendRecordEmails } from '../supabase/functions/_shared/notifications.js';
function fixture() {
 const row = { id: 'record-123', email: 'submitter@example.test', full_name: 'Test', message: 'Private enquiry', form_type: 'contact' };
 let reads = 0;
 const entity = { get: async () => { reads++; return structuredClone(row); }, update: async (_, patch) => Object.assign(row, structuredClone(patch)) };
 return { row, reads: () => reads, platform: { asServiceRole: { entities: { Submission: entity, Appointment: entity } } } };
}
test('notification destinations are fixed and receipts exclude submitted content', () => {
 const messages = notificationMessages('enquiry', { id: 'id', email: 'client@example.test', full_name: 'Name', message: 'https://untrusted.invalid' });
 assert.equal(messages[0].to, 'info@creativebooks.co.za');
 assert.equal(messages[1].to, 'client@example.test');
 assert.equal(messages[0].from, 'Creative Books SA <info@creativebooks.co.za>');
 assert.ok(!messages[1].text.includes('https://untrusted.invalid'));
 assert.throws(() => notificationMessages('enquiry', { email: 'a@example.test\nBcc: attacker@example.test' }), /Invalid/);
 assert.throws(() => notificationMessages('other', {}), /Unsupported/);
});
test('missing provider key prevents network calls without changing saved records', async () => {
 const f = fixture();
 assert.deepEqual(await sendRecordEmails(f.platform, 'enquiry', f.row.id, { getEnv: () => undefined, transport: () => { throw new Error('Must not send'); } }), { status: 'disabled' });
 assert.equal(f.reads(), 0);
});
test('successful sends are persisted and retries do not send again', async () => {
 const f = fixture(), calls = [];
 const options = { getEnv: () => 'test-key', transport: async (url, req) => { calls.push({ url, req }); return Response.json({ id: `email-${calls.length}` }); } };
 assert.deepEqual(await sendRecordEmails(f.platform, 'enquiry', f.row.id, options), { status: 'accepted' });
 assert.equal(calls.length, 2);
 assert.ok(calls.every(c => c.url === 'https://api.resend.com/emails'));
 assert.equal(calls[0].req.headers['Idempotency-Key'], 'cbsa-enquiry-record-123-business');
 assert.equal(f.row.email_delivery.business.status, 'accepted');
 assert.equal(f.row.email_delivery.receipt.status, 'accepted');
 await sendRecordEmails(f.platform, 'enquiry', f.row.id, options);
 assert.equal(calls.length, 2);
});
test('provider failures are recorded without losing the saved enquiry', async () => {
 const f = fixture(); let count = 0;
 const result = await sendRecordEmails(f.platform, 'enquiry', f.row.id, { getEnv: () => 'test-key', transport: async () => ++count === 1 ? Response.json({ message: 'secret provider error' }, { status: 403 }) : Response.json({ id: 'receipt-ok' }) });
 assert.equal(result.status, 'partial');
 assert.equal(f.row.message, 'Private enquiry');
 assert.equal(f.row.email_delivery.business.status, 'failed');
 assert.equal(f.row.email_delivery.receipt.status, 'accepted');
 assert.ok(!JSON.stringify(f.row).includes('secret provider error'));
});
test('booking receipts do not confirm an appointment', () => {
 const messages = notificationMessages('booking', { id: 'appointment-1', client_email: 'client@example.test', service_name: 'Consultation', date: '2026-11-10', start_time: '10:00', status: 'pending' });
 assert.ok(messages[1].text.includes('not an appointment confirmation'));
});

test('branded HTML escapes submitted fields and keeps customer receipts free of enquiry content', () => {
 const record = { id: 'record-html', email: 'client@example.test', full_name: '<img src=x onerror=alert(1)>', message: '<script>private-message</script>', form_type: 'quote', additional_fields: { notes: '<a href="https://attacker.invalid">click</a>', bookSize:'A5' } };
 const messages = notificationMessages('enquiry',record);
 assert.ok(messages[0].html.includes('&lt;script&gt;private-message&lt;/script&gt;'));
 assert.ok(!messages[0].html.includes('<script>'));
 assert.ok(!messages[0].html.includes('<img src=x'));
 assert.ok(messages[0].html.includes('https://creative-books-sa.vercel.app/admin/submissions'));
 assert.ok(messages[0].html.includes('Book Size'));
 assert.ok(!messages[1].html.includes('private-message'));
 assert.ok(!messages[1].html.includes('attacker.invalid'));
 assert.ok(messages[0].html.includes('linear-gradient'));
 assert.ok(messages[0].text.includes('private-message'));
});
