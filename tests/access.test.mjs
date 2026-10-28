import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessMode, safeRedirect } from '../supabase/functions/_shared/policy.js';
test('unauthenticated visitors cannot run staff actions or trigger email/AI gateways',()=>{
 for(const [name,action] of [['quoteActions','send'],['invoiceActions','check_overdue'],['portalMessages','admin_reply'],['platform-integrations',undefined],['paymentActions','create'],['adobeSignWebhook',undefined]]) assert.equal(accessMode(name,action,null),'deny');
});
test('public document actions require the document authorization path',()=>{
 assert.equal(accessMode('quoteActions','respond',null),'document');
 assert.equal(accessMode('eSignatureActions','submit_signature',null),'document');
 assert.equal(accessMode('portalMessages','send',null),'portal');
});
test('only administrators can run privileged workflows',()=>{
 for(const role of ['admin','super_user']) assert.equal(accessMode('paymentActions','create',role),'staff');
 assert.equal(accessMode('paymentActions','create','client'),'deny');
 assert.equal(accessMode('paymentActions','create','standard_user'),'deny');
 assert.equal(accessMode('clientPortalData','list_projects_with_messages','client'),'deny');
 assert.equal(accessMode('contractSignature','admin_sign','standard_user'),'deny');
});
test('return URLs cannot redirect visitors to an outside domain',()=>{
 assert.equal(safeRedirect('https://outside.test/steal','https://creativebooks.co.za'),'/');
 assert.equal(safeRedirect('/my-portal?tab=files','https://creativebooks.co.za'),'/my-portal?tab=files');
});

test('invoice confirmation and portal credential creation require an administrator',()=>{
 for(const name of ['adminConfirmWorkflow','autoCreatePortalAccess']) {
  for(const role of [null,'client','standard_user']) assert.equal(accessMode(name,undefined,role),'deny');
  for(const role of ['admin','super_user']) assert.equal(accessMode(name,undefined,role),'staff');
  assert.equal(accessMode(name,undefined,null,true),'staff');
 }
});
