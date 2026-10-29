import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {required,serverKey} from '../_shared/integrations.ts';
import {deliverWorkflowJobs} from './worker.js';
// This scheduler endpoint authenticates its private Vault token explicitly, rather than a browser JWT.
Deno.serve(async req=>{
 if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
 const token=req.headers.get('x-cb-workflow-token');if(!token||!/^[a-f0-9]{64}$/.test(token))return Response.json({error:'Unauthorized'},{status:401});
 try{
  const admin=createClient(required('SUPABASE_URL'),serverKey(),{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:valid,error}=await admin.rpc('cb_validate_workflow_dispatch',{p_token:token});if(error||valid!==true)return Response.json({error:'Unauthorized'},{status:401});
  return Response.json(await deliverWorkflowJobs(admin,required('RESEND_API_KEY')),{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Workflow notification worker failed'},{status:500});}
});
