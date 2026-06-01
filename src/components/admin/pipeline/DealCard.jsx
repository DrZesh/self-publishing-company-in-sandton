import { Draggable } from '@hello-pangea/dnd';
import { User, DollarSign, Briefcase, AlertTriangle, CheckCircle, Link } from 'lucide-react';

const SERVICE_COLORS = {
  'Book Printing': 'bg-violet-100 text-violet-700',
  'Book Editing': 'bg-sky-100 text-sky-700',
  'Book Cover Design': 'bg-rose-100 text-rose-700',
  'Typesetting and Layout': 'bg-amber-100 text-amber-700',
  'Manuscript Evaluation': 'bg-teal-100 text-teal-700',
  'Ghostwriting': 'bg-indigo-100 text-indigo-700',
  'Author Website': 'bg-orange-100 text-orange-700',
  'Ebook Publishing': 'bg-lime-100 text-lime-700',
};

export default function DealCard({ deal, index, onClick, isWonStage, isLostStage }) {
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(deal)}
          className={`
            select-none cursor-pointer rounded-2xl border p-3 mb-2 transition-all
            ${snapshot.isDragging
              ? 'shadow-xl scale-[1.02] rotate-1 border-blue-300'
              : 'shadow-sm hover:shadow-md border-white/80 hover:border-blue-200/60'}
          `}
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging
              ? 'rgba(255,255,255,0.98)'
              : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800 truncate">{deal.client_name}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {deal.linked_project_id && (
                <span title="Project created" className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                </span>
              )}
              {deal.project_creation_failed && (
                <span title="Project creation failed" className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                </span>
              )}
            </div>
          </div>

          {/* Project title */}
          {deal.project_title && (
            <p className="text-xs text-slate-500 mb-2 truncate">{deal.project_title}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {deal.service_type && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SERVICE_COLORS[deal.service_type] || 'bg-slate-100 text-slate-600'}`}>
                {deal.service_type}
              </span>
            )}
            {deal.deal_value > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
                <DollarSign className="w-2.5 h-2.5" />R{Number(deal.deal_value).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}