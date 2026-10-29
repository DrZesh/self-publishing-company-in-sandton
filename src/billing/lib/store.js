// Production adapter. Missing database configuration must never fall back to demo data.
let supabase;
export function configureBilling(opts={}) {supabase=opts.supabase || null;}
export const mode=()=>supabase ? 'supabase' : 'unconfigured';
function client(){if(!supabase)throw new Error('Billing database is not configured.');return supabase;}
async function rpc(name,args){const {data,error}=await client().rpc(name,args);if(error)throw new Error(error.message);return data;}
async function all(table){
 const rows=[];
 for(let offset=0;offset<100000;offset+=1000){const {data,error}=await client().from(table).select('*').order('id').range(offset,offset+999);if(error)throw new Error(`${table}: ${error.message}`);rows.push(...data);if(data.length<1000)return rows;}
 throw new Error('Too many billing records to load. Contact your administrator.');
}
const TABLES=['clients','items','quotes','quote_items','invoices','payments','projects','activity'];
export const api={
 async load(){const data=await Promise.all(TABLES.map(t=>all(`cb_${t}`)));const db=Object.fromEntries(TABLES.map((t,i)=>[t,data[i]]));db.items=db.items.filter(x=>x.active!==false);return db;},
 async saveClient(c){
  const allowed=['id','crm_client_id','client_type','first_name','last_name','display_name','company','email','phone','billing_address','vat_number','source','service','owner','email_documents','portal_invite'];
  const row=Object.fromEntries(allowed.filter(k=>c[k]!==undefined).map(k=>[k,c[k]]));
  row.display_name=(c.display_name || `${c.first_name||''} ${c.last_name||''}`).trim();row.email=String(c.email||'').trim();
  if(!row.display_name)throw new Error('Display name is required');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))throw new Error('Enter a valid client email.');
  const {data,error}=await client().from('cb_clients').upsert(row).select().single();if(error)throw new Error(error.message);return data;
 },
 saveQuote:(q,items)=>rpc('cb_save_quote',{p_quote:q,p_items:items}).then(id=>({id})),
 markSent:id=>rpc('cb_mark_sent',{p_quote_id:id}),
 reviseQuote:id=>rpc('cb_revise_quote',{p_quote_id:id}).then(id=>({id})),
 acceptManually:(id,method,name,fileUrl)=>rpc('cb_accept_quote_internal',{p_quote_id:id,p_method:method,p_name:name||'',p_file:fileUrl||null}),
 portalGet:token=>rpc('cb_portal_quote',{p_token:token}),
 portalAccept:(token,name,image)=>rpc('cb_accept_quote',{p_token:token,p_name:name,p_signature:image}),
 portalDecline:(token,reason)=>rpc('cb_decline_quote',{p_token:token,p_reason:reason}),
 portalRequestChanges:(token,message)=>rpc('cb_request_changes',{p_token:token,p_message:message}),
 saveDocumentSettings:(kind,id,terms,attachments,version)=>rpc('cb_save_document_settings',{p_kind:kind,p_id:id,p_terms:terms,p_attachments:attachments,p_version:version}),
 async documentAction(body){const {data,error}=await client().functions.invoke('billingDocumentEmail',{body});if(error){let message=error.message;try{const detail=await error.context.json();message=detail.error||message;}catch{}throw new Error(message);}if(data?.error)throw new Error(data.error);return data;},
 async uploadAttachment(file){
  const types=['application/pdf','image/png','image/jpeg','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if(!types.includes(file.type))throw new Error('Use PDF, Word, PNG, JPEG or plain text.');if(file.size>5*1024*1024)throw new Error('Each supporting document must be 5 MB or smaller.');
  const path=`${crypto.randomUUID()}/${file.name.replace(/[^\w.-]+/g,'_')}`;const {error}=await client().storage.from('cb-billing-attachments').upload(path,file,{contentType:file.type});if(error)throw new Error(error.message);return {path,name:file.name,size:file.size,type:file.type};
 },
 recordPayment:p=>rpc('cb_record_payment',{p_payment:p}),
 clearPayment:id=>rpc('cb_clear_payment',{p_payment_id:id}),
 toggleChecklist:(id,index)=>rpc('cb_toggle_checklist',{p_project_id:id,p_index:index}),
 completeProject:id=>rpc('cb_complete_project',{p_project_id:id}),
 releaseFiles:id=>rpc('cb_release_files',{p_project_id:id}),
 async uploadFile(file){
  if(!['application/pdf','image/png','image/jpeg'].includes(file.type))throw new Error('Upload a PDF, PNG or JPEG file.');
  if(file.size>10485760)throw new Error('Files must be 10 MB or smaller.');
  const path=`${crypto.randomUUID()}/${file.name.replace(/[^\w.-]+/g,'_')}`;
  const {error}=await client().storage.from('cb-proofs').upload(path,file);if(error)throw new Error(error.message);return {url:`storage:${path}`,name:file.name};
 },
 async fileLink(url){
  if(!url)return null;if(!url.startsWith('storage:'))throw new Error('This file is not in private billing storage.');
  const {data,error}=await client().storage.from('cb-proofs').createSignedUrl(url.slice(8),600);if(error)throw new Error(error.message);return data.signedUrl;
 },
};
