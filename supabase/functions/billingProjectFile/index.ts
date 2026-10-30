import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {required,serverKey} from '../_shared/integrations.ts';
Deno.serve(async req=>{
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex,nofollow,noarchive'};
 if(req.method!=='GET')return Response.json({error:'Method not allowed'},{status:405,headers});
 const url=new URL(req.url),token=url.searchParams.get('token'),file=url.searchParams.get('file');const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if(!token||!file||!uuid.test(token)||!uuid.test(file))return Response.json({error:'Invalid file link'},{status:404,headers});
 try{
  const admin=createClient(required('SUPABASE_URL'),serverKey(),{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await admin.rpc('cb_portal_resource',{p_token:token,p_resource:file});if(error||!data)return Response.json({error:'File unavailable for this project'},{status:404,headers});
  let target=data.url;if(data.path){const signed=await admin.storage.from('cb-project-deliverables').createSignedUrl(data.path,120,{download:data.name});if(signed.error)throw signed.error;target=signed.data.signedUrl;}
  if(!target||new URL(target).protocol!=='https:')throw new Error('Invalid destination');
  return new Response(null,{status:302,headers:{...headers,Location:target}});
 }catch{return Response.json({error:'File is not available. Please contact Creative Books SA.'},{status:404,headers});}
});
