import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {required,publicKey,serverKey} from '../_shared/integrations.ts';
import {deliverWorkflowJobs} from '../billingWorkflowNotifications/worker.js';
const uuid=(s:unknown)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
Deno.serve(async req=>{
 const origin=req.headers.get('origin');const allowed=['https://creativebooks.co.za','https://www.creativebooks.co.za','https://creative-books-sa.vercel.app'];
 const headers={'Access-Control-Allow-Origin':origin&&allowed.includes(origin)?origin:allowed[0],'Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store',Vary:'Origin'};
 if(origin&&!allowed.includes(origin))return Response.json({error:'Origin not allowed'},{status:403,headers});if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers});
 try{
  const authorization=req.headers.get('authorization')||'';if(!authorization.startsWith('Bearer '))return Response.json({error:'Sign in to the CRM first'},{status:401,headers});
  const staff=createClient(required('SUPABASE_URL'),publicKey(),{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});const {data:{user},error}=await staff.auth.getUser(authorization.slice(7));if(error||!user)return Response.json({error:'Sign in to the CRM again'},{status:401,headers});
  const raw=await req.text();if(raw.length>15000)throw new Error('Request too large');const input=JSON.parse(raw);if(!uuid(input.project_id))throw new Error('Invalid project');
  let name,args;if(input.action==='google_review'){name='cb_request_google_review';args={p_id:input.project_id};}else if(['review_files','delivery_files'].includes(input.action)){
   if(!uuid(input.request_id)||!Array.isArray(input.resources)||!input.resources.every(uuid))throw new Error('Select the correct files');name=input.action==='review_files'?'cb_send_review_files':'cb_send_service_delivery';args={p_id:input.project_id,p_service:input.service,p_instructions:input.instructions,p_request:input.request_id,p_resources:input.resources,p_subject:input.subject};
  }else throw new Error('Invalid production action');
  // All authorization and project/resource checks happen through the caller's staff RPC.
  const created=await staff.rpc(name,args);if(created.error)throw new Error(created.error.message);const jobId=created.data;
  const admin=createClient(required('SUPABASE_URL'),serverKey(),{auth:{persistSession:false,autoRefreshToken:false}});
  try{await deliverWorkflowJobs(admin,required('RESEND_API_KEY'),fetch,jobId);}catch{/* The durable outbox remains available to the existing scheduler. */}
  const job=await admin.from('cb_workflow_notifications').select('id,status,last_error,sent_at').eq('id',jobId).single();if(job.error)throw new Error('Email was queued. Check email history for its status.');return Response.json(job.data,{headers});
 }catch(e){return Response.json({error:String(e.message||'Production action failed')},{status:400,headers});}
});
