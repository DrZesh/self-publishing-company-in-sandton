import {attachmentTypes,base64,documentPdf,envelope} from './document.js';
import logo64 from './logo.js';
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v));
const one=async query=>{const {data,error}=await query.single();if(error||!data)throw new Error('Document not found or staff access required.');return data;};
export async function handleDocument({input,user,staff,admin,pdfLib,emailKey,fetcher=fetch}) {
 const {kind,id,action}=input;
 if(!['quote','invoice'].includes(kind)||!uuid(id)||!['preview','send'].includes(action))throw new Error('Invalid document request.');
 // All document reads run as the authenticated user, preserving database staff RLS.
 const doc=await one(staff.from(kind==='quote'?'cb_quotes':'cb_invoices').select('*').eq('id',id));
 const quote=kind==='quote'?doc:await one(staff.from('cb_quotes').select('*').eq('id',doc.quote_id));
 const client=await one(staff.from('cb_clients').select('*').eq('id',doc.client_id));
 const {data:items,error:itemError}=await staff.from('cb_quote_items').select('*').eq('quote_id',quote.id).order('position');if(itemError)throw new Error('Could not load quote items.');
 const filename=`${doc.number.replace(/[^\w.-]/g,'_')}.pdf`;
 if(action==='preview'){
  const pdf=await documentPdf(pdfLib,kind,doc,quote,client,items,Uint8Array.from(atob(logo64),c=>c.charCodeAt(0)));
  return {filename,content:base64(pdf)};
 }
 if(!uuid(input.request_id))throw new Error('Missing email request ID.');
 if(!emailKey)throw new Error('Email service is not configured. Please contact your administrator.');
 const env=envelope(input,kind,doc,quote);
 const signature=JSON.stringify({kind,id,to:env.to,cc:env.cc,subject:env.subject,message:input.message,version:input.document_version});
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(signature));const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 const existing=await admin.from('cb_document_emails').select('*').eq('id',input.request_id).maybeSingle();if(existing.error)throw new Error('Could not check email attempt.');
 let attempt=existing.data;
 if(attempt){
  if(attempt.actor_id!==user.id||attempt.payload_hash!==hash)throw new Error('This send request has changed. Reopen the email composer.');
  if(attempt.status==='sent')return {sent:true,provider_id:attempt.provider_id};
  // Provider idempotency expires after 24 hours. Never replay an uncertain request after that window.
  if(Date.now()-Date.parse(attempt.created_at)>23*3600000)throw new Error('This email attempt is too old to retry safely. Check the email provider before sending again.');
 }else{
  if(input.document_version!==(doc.document_version||0))throw new Error('Document settings changed. Reopen Send to use the latest PDF and attachments.');
  if(kind==='quote'&&['expired','declined','superseded'].includes(quote.status))throw new Error('Revise this quote before sending it.');
  if(kind==='quote'&&quote.expiry_date<new Date().toISOString().slice(0,10))throw new Error('This quote expired. Revise it before sending.');
  if(Number(doc.total)<=0)throw new Error('Add a positive document total before sending.');
  const attachments=doc.attachments||[];if(attachments.length>10)throw new Error('Maximum 10 supporting documents.');
  let bytesTotal=0;const prepared=[];
  for(const f of attachments){
   if(typeof f.path!=='string'||! /^[0-9a-f-]{36}\/[\w.-]+$/.test(f.path)||typeof f.name!=='string'||f.name.length>200||/[\r\n\x00]/.test(f.name))throw new Error('Invalid supporting document.');
   const {data,error}=await staff.storage.from('cb-billing-attachments').download(f.path);if(error||!data)throw new Error(`Cannot attach ${f.name}. Upload it again before sending.`);
   if(!attachmentTypes.includes(data.type.split(';')[0])||data.size>5242880)throw new Error(`Unsupported or oversized attachment: ${f.name}`);
   bytesTotal+=data.size;if(bytesTotal>12582912)throw new Error('Supporting documents must total 12 MB or less.');
   prepared.push({filename:f.name,content:base64(new Uint8Array(await data.arrayBuffer())),content_type:data.type});
  }
  const pdf=await documentPdf(pdfLib,kind,doc,quote,client,items,Uint8Array.from(atob(logo64),c=>c.charCodeAt(0)));
  if(pdf.length>5242880)throw new Error('The generated PDF is too large to email. Shorten the document.');
  const payload={...env,attachments:[{filename,content:base64(pdf),content_type:'application/pdf'},...prepared]};
  const insert=await admin.from('cb_document_emails').insert({id:input.request_id,kind,document_id:id,quote_id:quote.id,actor_id:user.id,payload_hash:hash,payload}).select('*').single();
  if(insert.error){
   if(insert.error.code!=='23505')throw new Error('Could not save the email attempt. Nothing was sent.');
   attempt=await one(admin.from('cb_document_emails').select('*').eq('id',input.request_id));
   if(attempt.actor_id!==user.id||attempt.payload_hash!==hash)throw new Error('This send request has changed. Reopen the composer.');
  }else attempt=insert.data;
 }
 // The persisted snapshot and idempotency key make timeouts and concurrent retries safe.
 const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${emailKey}`,'Content-Type':'application/json','Idempotency-Key':`cb-billing/${attempt.id}`},body:JSON.stringify(attempt.payload),signal:AbortSignal.timeout(25000)});
 const result=await response.json();
 if(!response.ok||!result.id){
  await admin.from('cb_document_emails').update({status:'failed',error:`Email provider returned ${response.status}`}).eq('id',attempt.id).neq('status','sent');
  throw new Error(`Email provider rejected the send (${response.status}). The document has not been marked as sent. Retry or check the provider configuration.`);
 }
 const saved=await admin.rpc('cb_finish_document_email',{p_id:attempt.id,p_provider_id:result.id});
 if(saved.error)throw new Error('The email provider accepted the email, but the CRM acknowledgement failed. Retry this same request to synchronise its status safely.');
 return {sent:true,provider_id:result.id};
}
