import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PipelineCard from './PipelineCard';
import LostReasonModal from './LostReasonModal';

export const PIPELINE_STAGES = ['Lead Contacted', 'Quote Sent', 'Negotiating', 'Won', 'In Production', 'Completed', 'Lost'];

const STAGE_COLORS = {
  'Lead Contacted': 'border-blue-300 bg-blue-50',
  'Quote Sent': 'border-purple-300 bg-purple-50',
  'Negotiating': 'border-amber-300 bg-amber-50',
  'Won': 'border-emerald-300 bg-emerald-50',
  'In Production': 'border-[#B87333]/40 bg-[#B87333]/5',
  'Completed': 'border-gray-300 bg-gray-50',
  'Lost': 'border-red-300 bg-red-50',
};

const STAGE_HEADER_COLORS = {
  'Lead Contacted': 'text-blue-700',
  'Quote Sent': 'text-purple-700',
  'Negotiating': 'text-amber-700',
  'Won': 'text-emerald-700',
  'In Production': 'text-[#B87333]',
  'Completed': 'text-gray-600',
  'Lost': 'text-red-600',
};

export default function KanbanBoard({ contacts, onStageChange }) {
  const [lostModal, setLostModal] = useState(null); // { contactId, contactName, destStage }
  const [draggingId, setDraggingId] = useState(null);

  const byStage = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s] = contacts.filter(c => (c.pipeline_stage || 'Lead Contacted') === s);
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
      setLostModal({ contactId: draggableId, contactName: contact.full_name, destStage: newStage });
    } else {
      onStageChange(draggableId, newStage, null);
    }
  };

  const handleLostConfirm = (reason) => {
    onStageChange(lostModal.contactId, 'Lost', reason);
    setLostModal(null);
  };

  return (
    <>
      <DragDropContext
        onDragStart={r => setDraggingId(r.draggableId)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
          {PIPELINE_STAGES.map(stage => (
            <div key={stage} className="flex-shrink-0 w-60">
              <div className={`rounded-2xl border-2 ${STAGE_COLORS[stage]} flex flex-col h-full`}>
                <div className="px-3 py-2.5 border-b border-black/8">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wide ${STAGE_HEADER_COLORS[stage]}`}>{stage}</span>
                    <span className="text-xs font-bold text-black/40 bg-white rounded-full px-2 py-0.5">
                      {byStage[stage].length}
                    </span>
                  </div>
                  {byStage[stage].some(c => c.pipeline_value) && (
                    <p className="text-xs text-black/40 mt-0.5">
                      R {byStage[stage].reduce((s, c) => s + (c.pipeline_value || 0), 0).toLocaleString('en-ZA')}
                    </p>
                  )}
                </div>
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 space-y-2 min-h-[100px] rounded-b-2xl transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                    >
                      {byStage[stage].map((contact, index) => (
                        <Draggable key={contact.id} draggableId={contact.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <PipelineCard contact={contact} isDragging={snapshot.isDragging} />
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
          ))}
        </div>
      </DragDropContext>

      {lostModal && (
        <LostReasonModal
          contactName={lostModal.contactName}
          onConfirm={handleLostConfirm}
          onCancel={() => setLostModal(null)}
        />
      )}
    </>
  );
}