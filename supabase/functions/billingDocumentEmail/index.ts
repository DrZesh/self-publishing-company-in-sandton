import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import * as pdfLib from 'npm:pdf-lib@1.17.1';
import {publicKey,serverKey,required} from '../_shared/integrations.ts';
import {handleDocument} from './handler.js';
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 const allowed=['https://creativebooks.co.za','https://www.creativebooks.co.za','https://creative-books-sa.vercel.app'];
 const cors={'Access-Control-Allow-Origin':origin&&allowed.includes(origin)?origin:allowed[0],'Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type','Access-Control-Allow-Methods':'POST,OPTIONS',Vary:'Origin'};
 if(origin&&!allowed.includes(origin))return Response.json({error:'Origin not allowed'},{status:403,headers:cors});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers:cors});
 try{
  const authorization=req.headers.get('Authorization')||'';if(!authorization.startsWith('Bearer '))return Response.json({error:'Sign in to the CRM first.'},{status:401,headers:cors});
  const staff=createClient(required('SUPABASE_URL'),publicKey(),{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await staff.auth.getUser(authorization.slice(7));
  if(error||!user)return Response.json({error:'Your session expired. Sign in again.'},{status:401,headers:cors});
  const raw=await req.text();if(raw.length>20000)throw new Error('Request is too large.');
  const admin=createClient(required('SUPABASE_URL'),serverKey(),{auth:{persistSession:false,autoRefreshToken:false}});
  const result=await handleDocument({input:JSON.parse(raw),user,staff,admin,pdfLib,emailKey:Deno.env.get('RESEND_API_KEY')});
  return Response.json(result,{headers:{...cors,'Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:e.name==='TimeoutError'?'Email acknowledgement timed out. Retry this same request safely.':e.message||'Could not send document.'},{status:400,headers:{...cors,'Cache-Control':'no-store'}});}
});
