import {brandedWorkflowEmail} from '../_shared/email-templates.js';
const adminRecipients=['info@creativebooks.co.za','draubreyzesh@gmail.com'];
export function workflowMessage(job){
 const p=job.payload;const admin=job.kind==='acceptance_admin';
 if(!admin&&job.kind!=='stage_client')throw new Error('Unknown workflow notification');
 if(!admin&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.client_email||''))throw new Error('Client email is missing or invalid');
 const isSigned=['portal','upload'].includes(p.method);
 const heading=admin?(isSigned?'Quote accepted & signed':'Quote acceptance recorded'):'Your project update';
 const subject=admin?`${heading}: ${p.quote_number}`:`Project update: ${p.project_title} | Creative Books SA`;
 const intro=admin?`${p.client_name} has accepted ${p.quote_number}.`:`Hi ${p.client_name||'there'}, here is the latest update on your project.`;
 const fields=admin?[['Client',p.client_name],['Client email',p.client_email],['Quote',p.quote_number],['Accepted by',p.signer],['Acceptance method',p.method==='portal'?'Signed in client portal':p.method==='upload'?'Signed copy uploaded':'Acceptance recorded by staff'],['Accepted at',p.accepted_at?new Date(p.accepted_at).toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg'})+' SAST':''],['Deposit invoice',p.invoice_number]]:[['Project',p.project_title],['Quote',p.quote_number],['Current stage',p.stage],['Updated',p.changed_at?new Date(p.changed_at).toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg'})+' SAST':'']];
 const message=admin?'The deposit invoice has been created. Production starts only after the deposit is paid and cleared.':p.message;
 return {from:'Creative Books SA <info@creativebooks.co.za>',to:admin?[...adminRecipients]:p.client_email,reply_to:'info@creativebooks.co.za',subject,text:`${heading}\n\n${intro}\n\n${fields.map(([k,v])=>`${k}: ${v||''}`).join('\n')}\n\n${message}\n\nCreative Books SA\ninfo@creativebooks.co.za`,html:brandedWorkflowEmail({heading,introduction:intro,fields,message,actionUrl:admin?`https://creativebooks.co.za/admin/billing/quotes/${job.quote_id}`:null,actionLabel:'Open accepted quote'})};
}
export async function deliverWorkflowJobs(admin,emailKey,transport=fetch){
 if(!emailKey)throw new Error('Email service is not configured');
 const {data:jobs,error}=await admin.rpc('cb_claim_workflow_notifications');if(error)throw new Error('Could not claim notifications');
 let sent=0,failed=0;
 for(const job of jobs||[]){
  try{
   let message=job.email_message;
   if(!message){message=workflowMessage(job);const saved=await admin.from('cb_workflow_notifications').update({email_message:message}).eq('id',job.id).eq('claim_token',job.claim_token).select('id').single();if(saved.error)throw new Error('Could not persist notification snapshot');}
   const response=await transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${emailKey}`,'Content-Type':'application/json','Idempotency-Key':`cb-workflow/${job.id}`},body:JSON.stringify(message),signal:AbortSignal.timeout(8000)});
   const result=await response.json();if(!response.ok||!result.id)throw new Error(`Email provider returned ${response.status}`);
   const updated=await admin.from('cb_workflow_notifications').update({status:'sent',provider_id:result.id,sent_at:new Date().toISOString(),lease_until:null,last_error:null}).eq('id',job.id).eq('claim_token',job.claim_token).select('id').single();if(updated.error)throw new Error('Provider accepted email; CRM acknowledgement failed');sent++;
  }catch(error){
   failed++;const delay=Math.min(3600,60*2**Math.min(job.attempts||1,6));
   await admin.from('cb_workflow_notifications').update({status:'failed',last_error:String(error.message||'Notification failed').slice(0,300),available_at:new Date(Date.now()+delay*1000).toISOString(),lease_until:null}).eq('id',job.id).eq('claim_token',job.claim_token).neq('status','sent');
  }
 }
 return {processed:jobs?.length||0,sent,failed};
}
