import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PipelineCard from './PipelineCard';
import LostReasonModal from './LostReasonModal';

// Default stages used when no custom pipeline is selected
export const PIPELINE_STAGES = [
  'New Enquiry', 'Information Requested', 'Quote in Progress', 'Quote Sent',
  'Payment Pending', 'Project Started', 'Editing', 'Cover Design', 'Typesetting',
  'Sample Queued', 'Sample Approved', 'Mass Production', 'Completed', 'Delivered', 'Lost',
];

const DEFAULT_STAGE_COLORS = {
  'New Enquiry': { bg: 'bg-blue-50', border: 'border-blue-200', header: 'text-blue-700', dot: '#3b82f6' },
  'Information Requested': { bg: 'bg-sky-50', border: 'border-sky-200', header: 'text-sky-700', dot: '#0ea5e9' },
  'Quote in Progress': { bg: 'bg-violet-50', border: 'border-violet-200', header: 'text-violet-700', dot: '#8b5cf6' },
  'Quote Sent': { bg: 'bg-purple-50', border: 'border-purple-200', header: 'text-purple-700', dot: '#a855f7' },
  'Payment Pending': { bg: 'bg-amber-50', border: 'border-amber-200', header: 'text-amber-700', dot: '#f59e0b' },
  'Project Started': { bg: 'bg-orange-50', border: 'border-orange-200', header: 'text-orange-700', dot: '#f97316' },
  'Editing': { bg: 'bg-yellow-50', border: 'border-yellow-200', header: 'text-yellow-700', dot: '#eab308' },
  'Cover Design': { bg: 'bg-pink-50', border: 'border-pink-200', header: 'text-pink-700', dot: '#ec4899' },
  'Typesetting': { bg: 'bg-rose-50', border: 'border-rose-200', header: 'text-rose-700', dot: '#f43f5e' },
  'Sample Queued': { bg: 'bg-[#B87333]/5', border: 'border-[#B87333]/30', header: 'text-[#B87333]', dot: '#B87333' },
  'Sample Approved': { bg: 'bg-lime-50', border: 'border-lime-200', header: 'text-lime-700', dot: '#84cc16' },
  'Mass Production': { bg: 'bg-teal-50', border: 'border-teal-200', header: 'text-teal-700', dot: '#14b8a6' },
  'Completed': { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'text-emerald-700', dot: '#10b981' },
  'Delivered': { bg: 'bg-green-50', border: 'border-green-200', header: 'text-green-700', dot: '#22c55e' },
  'Lost': { bg: 'bg-red-50', border: 'border-red-200', header: 'text-red-600', dot: '#ef4444' },
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// Build stage config from custom pipeline or defaults
function buildStageConfig(customStages) {
  if (!customStages?.length) {
    return PIPELINE_STAGES.map(name => ({
      name,
      color: DEFAULT_STAGE_COLORS[name]?.dot || '#6b7280',
      icon: '',
      checklist: [],
    }));
  }
  return [...customStages].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export default function KanbanBoard({ contacts, onStageChange, customPipeline }) {
  const [lostModal, setLostModal] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const stages = buildStageConfig(customPipeline?.stages);
  const stageNames = stages.map(s => s.name);

  const byStage = stageNames.reduce((acc, s) => {
    acc[s] = contacts.filter(c => (c.pipeline_stage || stageNames[0]) === s);
    return acc;
  }, {});

  const handleDragEnd = (result) => {
    setDraggingId(null);
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStage = destination.droppableId;
    const contact = contacts.find(c => c.id === draggableId);
    if (!contact || contact.pipeline_stage === newStage) return;

    if (newStage === 'Lost') {
      setLostModal({ contactId: draggableId, contactName: contact.full_name });
    } else {
      onStageChange(draggableId, newStage, null);
    }
  };

  const totalValue = contacts.reduce((s, c) => s + (c.pipeline_value || 0), 0);

  return (
    <>
      {/* Summary Row */}
      <div className="flex items-center gap-4 mb-3 flex-wrap text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{contacts.length} contacts</span>
        {totalValue > 0 && (
          <span className="text-emerald-700 font-bold">Pipeline value: R {totalValue.toLocaleString('en-ZA')}</span>
        )}
        {customPipeline && (
          <span className="px-2 py-1 bg-[#B87333]/10 text-[#B87333] rounded-full font-semibold">{customPipeline.name}</span>
        )}
      </div>

      <DragDropContext onDragStart={r => setDraggingId(r.draggableId)} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 520 }}>
          {stages.map(stage => {
            const cards = byStage[stage.name] || [];
            const stageValue = cards.reduce((s, c) => s + (c.pipeline_value || 0), 0);
            const defaultColors = DEFAULT_STAGE_COLORS[stage.name];
            const rgb = stage.color ? hexToRgb(stage.color) : null;

            const bgStyle = rgb ? { background: `rgba(${rgb},0.06)`, borderColor: `rgba(${rgb},0.3)` } : {};
            const headerStyle = rgb ? { color: stage.color } : {};

            return (
              <div key={stage.name} className="flex-shrink-0 w-56">
                <div
                  className={`rounded-2xl border-2 flex flex-col ${defaultColors ? `${defaultColors.bg} ${defaultColors.border}` : 'bg-gray-50 border-gray-200'}`}
                  style={rgb && !defaultColors ? bgStyle : {}}
                >
                  {/* Stage Header */}
                  <div className="px-3 py-2.5 border-b border-black/8">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {stage.icon && <span className="text-sm flex-shrink-0">{stage.icon}</span>}
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wide leading-tight truncate ${defaultColors ? defaultColors.header : ''}`}
                          style={rgb && !defaultColors ? headerStyle : {}}
                        >
                          {stage.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-black/40 bg-white rounded-full px-2 py-0.5 flex-shrink-0">
                        {cards.length}
                      </span>
                    </div>
                    {stageValue > 0 && (
                      <p className="text-xs text-black/40 mt-0.5">R{stageValue.toLocaleString('en-ZA')}</p>
                    )}
                  </div>

                  <Droppable droppableId={stage.name}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 space-y-2 min-h-[100px] rounded-b-2xl transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                      >
                        {cards.map((contact, index) => (
                          <Draggable key={contact.id} draggableId={contact.id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className="select-none cursor-grab active:cursor-grabbing"
                              >
                                <PipelineCard contact={contact} isDragging={snap.isDragging} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {lostModal && (
        <LostReasonModal
          contactName={lostModal.contactName}
          onConfirm={(reason) => { onStageChange(lostModal.contactId, 'Lost', reason); setLostModal(null); }}
          onCancel={() => setLostModal(null)}
        />
      )}
    </>
  );
}