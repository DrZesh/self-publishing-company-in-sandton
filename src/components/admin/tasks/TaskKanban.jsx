import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { platform } from '@/api/platformClient';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, XCircle, Pencil } from 'lucide-react';

const COLUMNS = [
  { id: 'Pending',     label: 'Pending',     color: '#64748b', glow: 'rgba(100,116,139,0.3)' },
  { id: 'In Progress', label: 'In Progress', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { id: 'Done',        label: 'Done',        color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { id: 'Cancelled',   label: 'Cancelled',   color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
];

const PRIORITY_COLORS = {
  Urgent: 'text-red-300 bg-red-500/20 border-red-400/30',
  High:   'text-orange-300 bg-orange-500/20 border-orange-400/30',
  Medium: 'text-yellow-300 bg-yellow-500/20 border-yellow-400/30',
  Low:    'text-blue-300 bg-blue-500/20 border-blue-400/30',
};

const GLASS = {
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.12)',
};

function TaskCard({ task, contactMap, index, onEdit }) {
  const contact = contactMap[task.contact_id];
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done';
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="rounded-xl p-3 mb-2 cursor-grab active:cursor-grabbing transition-all"
          style={{
            background: snapshot.isDragging ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: snapshot.isDragging ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
            transform: snapshot.isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-white leading-tight flex-1">{task.title}</p>
            <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors">
              <Pencil className="w-3 h-3 text-white/40" />
            </button>
          </div>
          {contact && <p className="text-xs text-white/40 mt-1">{contact.full_name}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.priority && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Low}`}>
                {task.priority}
              </span>
            )}
            {task.due_date && (
              <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-300' : 'text-white/40'}`}>
                {isOverdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function TaskKanban({ tasks, contactMap, onEdit, onUpdate }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    await platform.entities.Task.update(draggableId, { status: newStatus });
    onUpdate();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="rounded-2xl p-3 flex flex-col" style={{ ...GLASS, minHeight: 300 }}>
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color, boxShadow: `0 0 8px ${col.glow}` }} />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{col.label}</span>
              <span className="ml-auto text-xs font-bold text-white/30">{grouped[col.id].length}</span>
            </div>
            {/* Droppable area */}
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 min-h-[60px] rounded-xl transition-all"
                  style={snapshot.isDraggingOver ? { background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' } : {}}
                >
                  {grouped[col.id].map((task, idx) => (
                    <TaskCard key={task.id} task={task} index={idx} contactMap={contactMap} onEdit={onEdit} />
                  ))}
                  {provided.placeholder}
                  {grouped[col.id].length === 0 && !snapshot.isDraggingOver && (
                    <p className="text-xs text-white/20 text-center pt-6">Drop here</p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}