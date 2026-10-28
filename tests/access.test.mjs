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
test('all employee roles can use staff workflows, client accounts cannot',()=>{
 for(const role of ['admin','super_user','standard_user']) assert.equal(accessMode('paymentActions','create',role),'staff');
 assert.equal(accessMode('paymentActions','create','client'),'deny');
});
test('return URLs cannot redirect visitors to an outside domain',()=>{
 assert.equal(safeRedirect('https://outside.test/steal','https://creativebooks.co.za'),'/');
 assert.equal(safeRedirect('/my-portal?tab=files','https://creativebooks.co.za'),'/my-portal?tab=files');
});
