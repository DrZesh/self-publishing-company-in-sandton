import { createClient } from '@supabase/supabase-js';
for(const name of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','ADMIN_EMAIL','ADMIN_PASSWORD']) if(!process.env[name])throw new Error(`Set ${name} in your terminal environment first.`);
if(process.env.ADMIN_PASSWORD.length<12)throw new Error('Use an administrator password of at least 12 characters.');
const client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const {data,error}=await client.auth.admin.createUser({email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD,email_confirm:true});
if(error)throw error;
const update=await client.rpc('cb_patch',{entity_table:'user',row_id:data.user.id,patch:{role:'admin'}});
if(update.error)throw update.error;
console.log('Administrator account created. No private credentials were written to files.');
