// Production readiness only. Delivery and client approval are tracked separately.
export function serviceProgress(stageCount,current,completed=[],skipped=[]){
 const active=Array.from({length:stageCount},(_,i)=>i).filter(i=>!skipped.includes(i));
 if(!active.length)return 0;
 const checked=active.filter(i=>completed.includes(i)).length/active.length;
 const position=active.indexOf(current);
 const stage=position<0?0:active.length===1?(current===stageCount-1?1:0):position/(active.length-1);
 return Math.round(Math.max(checked,stage)*100);
}
