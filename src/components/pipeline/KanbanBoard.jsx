import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PipelineCard from './PipelineCard';
import LostReasonModal from './LostReasonModal';

export const PIPELINE_STAGES = [
  'New Enquiry',
  'Information Requested',
  'Quote in Progress',
  'Quote Sent',
  'Payment Pending',
  'Project Started',
  'Editing',
  'Cover Design',
  'Typesetting',
  'Sample Queued',
  'Sample Approved',
  'Mass Production',
  'Completed',
  'Delivered',
  'Lost',
];

// Group stages for visual grouping
export const STAGE_GROUPS = {
  'Sales': ['New Enquiry', 'Information Requested', 'Quote in Progress', 'Quote Sent', 'Payment Pending'],
  'Production': ['Project Started', 'Editing', 'Cover Design', 'Typesetting', 'Sample Queued', 'Sample Approved', 'Mass Production'],
  'Done': ['Completed', 'Delivered', 'Lost'],
};

const STAGE_COLORS = {
  'New Enquiry': 'border-blue-300 bg-blue-50',
  'Information Requested': 'border-sky-300 bg-sky-50',
  'Quote in Progress': 'border-violet-300 bg-violet-50',
  'Quote Sent': 'border-purple-300 bg-purple-50',
  'Payment Pending': 'border-amber-300 bg-amber-50',
  'Project Started': 'border-orange-300 bg-orange-50',
  'Editing': 'border-yellow-300 bg-yellow-50',
  'Cover Design': 'border-pink-300 bg-pink-50',
  'Typesetting': 'border-rose-300 bg-rose-50',
  'Sample Queued': 'border-[#B87333]/50 bg-[#B87333]/5',
  'Sample Approved': 'border-lime-300 bg-lime-50',
  'Mass Production': 'border-teal-300 bg-teal-50',
  'Completed': 'border-emerald-300 bg-emerald-50',
  'Delivered': 'border-green-300 bg-green-50',
  'Lost': 'border-red-300 bg-red-50',
};

const STAGE_HEADER_COLORS = {
  'New Enquiry': 'text-blue-700',
  'Information Requested': 'text-sky-700',
  'Quote in Progress': 'text-violet-700',
  'Quote Sent': 'text-purple-700',
  'Payment Pending': 'text-amber-700',
  'Project Started': 'text-orange-700',
  'Editing': 'text-yellow-700',
  'Cover Design': 'text-pink-700',
  'Typesetting': 'text-rose-700',
  'Sample Queued': 'text-[#B87333]',
  'Sample Approved': 'text-lime-700',
  'Mass Production': 'text-teal-700',
  'Completed': 'text-emerald-700',
  'Delivered': 'text-green-700',
  'Lost': 'text-red-600',
};

const GROUP_COLORS = {
  'Sales': 'text-blue-600 bg-blue-50 border-blue-200',
  'Production': 'text-orange-600 bg-orange-50 border-orange-200',
  'Done': 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

export default function KanbanBoard({ contacts, onStageChange }) {
  const [lostModal, setLostModal] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [groupView, setGroupView] = useState(false);

  const byStage = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s] = contacts.filter(c => (c.pipeline_stage || 'New Enquiry') === s);
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-3 text-xs text-gray-500">
          {Object.entries(STAGE_GROUPS).map(([group, stages]) => {
            const count = stages.reduce((s, stage) => s + (byStage[stage]?.length || 0), 0);
            return (
              <span key={group} className={`px-2.5 py-1 rounded-full border font-medium ${GROUP_COLORS[group]}`}>
                {group}: {count}
              </span>
            );
          })}
        </div>
      </div>

      <DragDropContext
        onDragStart={r => setDraggingId(r.draggableId)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
          {PIPELINE_STAGES.map(stage => (
            <div key={stage} className="flex-shrink-0 w-52">
              <div className={`rounded-2xl border-2 ${STAGE_COLORS[stage]} flex flex-col`} style={{ minHeight: 500 }}>
                <div className="px-3 py-2.5 border-b border-black/8">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wide leading-tight ${STAGE_HEADER_COLORS[stage]}`}>{stage}</span>
                    <span className="text-xs font-bold text-black/40 bg-white rounded-full px-2 py-0.5 ml-1 shrink-0">
                      {byStage[stage].length}
                    </span>
                  </div>
                  {byStage[stage].some(c => c.pipeline_value) && (
                    <p className="text-xs text-black/40 mt-0.5">
                      R{byStage[stage].reduce((s, c) => s + (c.pipeline_value || 0), 0).toLocaleString('en-ZA')}
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