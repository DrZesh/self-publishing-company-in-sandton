import { serve, createClientFromRequest } from '../_shared/server.ts';
serve('getRevenueForecast', async req => {
 const api = createClientFromRequest(req);
 const [payments,deals] = await Promise.all([api.entities.Payment.list(),api.entities.PipelineDeal.list()]);
 const now = new Date(); const month = now.toISOString().slice(0,7); const previous = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)).toISOString().slice(0,7);
 const sumMonth=(key:string)=>payments.filter((p:any)=>String(p.payment_date || p.created_date).startsWith(key)).reduce((sum:number,p:any)=>sum+Number(p.amount||0),0);
 const monthly=sumMonth(month),last=sumMonth(previous); const stages:Record<string,any>={}; let weighted=0,total=0;
 const open=deals.filter((d:any)=>!d.won_at && !d.lost_at && !['Won','Lost'].includes(d.stage_key));
 for(const deal of open) { const value=Number(deal.deal_value||0); const stage=deal.stage_key||'New'; const probability=Number(deal.probability??0); total+=value;weighted+=value*Math.min(100,Math.max(0,probability))/100;stages[stage] ||= {total_value:0,count:0};stages[stage].total_value+=value;stages[stage].count++; }
 const days=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,0)).getUTCDate();
 return Response.json({monthly_revenue:monthly,projected_month_end:monthly/now.getUTCDate()*days,growth_rate:last?(monthly-last)/last*100:0,pipeline_forecast:{total_weighted:weighted,total_pipeline:total,total_opportunities:open.length},pipeline_by_stage:stages});
});
