import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import DealCard from './DealCard';

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function PipelineKanban({ pipeline, deals, onDragEnd, onDealClick, onAddDeal, onStageChange }) {
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
        {stages.map((stage) => {
          const color = stage.color || '#6366f1';
          const stageDeals = dealsByStage[stage.key] || [];
          const colTotal = stageDeals.reduce((s, d) => s + (d.deal_value || 0), 0);
          return (
            <div key={stage.key}
              className="flex-shrink-0 w-64 rounded-2xl flex flex-col overflow-hidden"
              style={{
                border: `1.5px solid ${hexToRgba(color, 0.3)}`,
                background: hexToRgba(color, 0.04),
                backdropFilter: 'blur(16px)',
                minHeight: '200px',
                boxShadow: `0 2px 12px ${hexToRgba(color, 0.1)}`,
              }}>

              {/* Column header */}
              <div className="px-3 py-3 flex items-center justify-between"
                style={{
                  borderBottom: `2px solid ${hexToRgba(color, 0.25)}`,
                  background: hexToRgba(color, 0.12),
                }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-xs font-bold truncate" style={{ color }}>{stage.label}</span>
                  {stage.isWon && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: hexToRgba(color, 0.15), color }}>WON</span>}
                  {stage.isLost && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: hexToRgba(color, 0.15), color }}>LOST</span>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: hexToRgba(color, 0.18), color }}>
                    {stageDeals.length}
                  </span>
                  <button onClick={() => onAddDeal(stage.key)}
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ background: hexToRgba(color, 0.18), color }}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Column total */}
              {colTotal > 0 && (
                <div className="px-3 py-1.5 text-right" style={{ borderBottom: `1px solid ${hexToRgba(color, 0.12)}` }}>
                  <span className="font-mono text-[11px] font-bold" style={{ color }}>
                    R{colTotal.toLocaleString('en-ZA')}
                  </span>
                </div>
              )}

              {/* Droppable area */}
              <Droppable droppableId={stage.key}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className="flex-1 p-2 transition-colors rounded-b-2xl"
                    style={{
                      minHeight: '80px',
                      background: snapshot.isDraggingOver ? hexToRgba(color, 0.1) : 'transparent',
                    }}>
                    {stageDeals.map((deal, i) => (
                      <DealCard key={deal.id} deal={deal} index={i} onClick={onDealClick}
                        isWonStage={stage.isWon} isLostStage={stage.isLost}
                        stageColor={color} stages={stages} onStageChange={onStageChange} />
                    ))}
                    {provided.placeholder}
                    {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-16">
                        <p className="text-[10px] font-medium" style={{ color: hexToRgba(color, 0.4) }}>Drop deals here</p>
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