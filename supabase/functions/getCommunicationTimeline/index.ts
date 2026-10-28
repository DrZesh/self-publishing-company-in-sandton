import { serve, createClientFromRequest } from '../_shared/server.ts';
serve('getCommunicationTimeline', async req => {
 const api=createClientFromRequest(req); const {contact_id}=await req.json(); if(!contact_id)return Response.json({error:'Contact required'},{status:400});
 const contact=await api.entities.Contact.get(contact_id);
 const [activities,messages]=await Promise.all([api.entities.ActivityLog.filter({contact_id}),api.entities.EmailMessage.filter({contact_id})]);
 const timeline=[...activities.map((r:any)=>({type:'activity',icon:'Activity',title:r.action||'Activity',description:r.description||'',date:r.created_date,metadata:r})),...messages.map((r:any)=>({type:'email',icon:'Mail',title:r.subject||'Email',description:r.snippet||'',date:r.sent_at||r.created_date,metadata:{status:r.status}}))].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 return Response.json({contact,timeline,metrics:{total_interactions:timeline.length,days_since_last_contact:timeline.length?Math.floor((Date.now()-Date.parse(timeline[0].date))/86400000):0,emails_sent:messages.length,conversion_rate:contact.lifecycle_stage==='customer'?100:0}});
});
