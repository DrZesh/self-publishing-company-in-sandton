import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import DealCard from './DealCard';

const STAGE_COLORS = [
  { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-400' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400' },
];

function getStageStyle(stage, idx) {
  if (stage.isWon) return STAGE_COLORS[5];
  if (stage.isLost) return STAGE_COLORS[6];
  return STAGE_COLORS[idx % 5];
}

export default function PipelineKanban({ pipeline, deals, onDragEnd, onDealClick, onAddDeal }) {
  const stages = [...(pipeline.stages || [])].sort((a, b) => a.order - b.order);

  const dealsByStage = {};
  stages.forEach(s => { dealsByStage[s.key] = []; });
  deals.forEach(d => {
    if (dealsByStage[d.stage_key]) dealsByStage[d.stage_key].push(d);
    else {
      const first = stages[0]?.key;
      if (first) dealsByStage[first].push(d);
    }
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {stages.map((stage, idx) => {
          const style = getStageStyle(stage, idx);
          const stageDeals = dealsByStage[stage.key] || [];
          return (
            <div key={stage.key} className={`flex-shrink-0 w-64 rounded-2xl border ${style.border} flex flex-col`}
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', minHeight: '200px' }}>
              {/* Column header */}
              <div className={`px-3 py-3 border-b ${style.border} rounded-t-2xl flex items-center justify-between`}
                style={{ background: 'rgba(255,255,255,0.8)' }}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  <span className={`text-xs font-bold ${style.text}`}>{stage.label}</span>
                  {stage.isWon && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">WON</span>}
                  {stage.isLost && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">LOST</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 w-5 h-5 rounded-full flex items-center justify-center">{stageDeals.length}</span>
                  <button onClick={() => onAddDeal(stage.key)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={stage.key}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`flex-1 p-2 transition-colors rounded-b-2xl ${snapshot.isDraggingOver ? 'bg-blue-50/60' : ''}`}
                    style={{ minHeight: '80px' }}>
                    {stageDeals.map((deal, i) => (
                      <DealCard key={deal.id} deal={deal} index={i} onClick={onDealClick}
                        isWonStage={stage.isWon} isLostStage={stage.isLost} />
                    ))}
                    {provided.placeholder}
                    {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-16">
                        <p className="text-[10px] text-slate-300 font-medium">Drop deals here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}