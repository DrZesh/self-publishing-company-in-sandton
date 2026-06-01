import { Draggable } from '@hello-pangea/dnd';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const AVATAR_COLORS = ['#6366f1','#0ea5e9','#f59e0b','#16a34a','#e11d48','#8b5cf6','#ec4899','#B87333'];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const SERVICE_COLORS = {
  'Book Printing': { bg: '#ede9fe', text: '#6d28d9' },
  'Book Editing': { bg: '#e0f2fe', text: '#0369a1' },
  'Book Cover Design': { bg: '#ffe4e6', text: '#be123c' },
  'Typesetting and Layout': { bg: '#fef3c7', text: '#b45309' },
  'Manuscript Evaluation': { bg: '#ccfbf1', text: '#0f766e' },
  'Ghostwriting': { bg: '#e0e7ff', text: '#4338ca' },
  'Author Website': { bg: '#ffedd5', text: '#c2410c' },
  'Ebook Publishing': { bg: '#ecfccb', text: '#4d7c0f' },
};

export default function DealCard({ deal, index, onClick, isWonStage, isLostStage, stageColor }) {
  const svc = SERVICE_COLORS[deal.service_type];
  const acColor = stageColor || '#6366f1';
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(deal)}
          className="select-none cursor-pointer rounded-xl mb-2 transition-all overflow-hidden"
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            boxShadow: snapshot.isDragging
              ? `0 12px 28px rgba(0,0,0,0.2), -4px 0 0 ${acColor}`
              : `0 2px 8px rgba(0,0,0,0.08), -3px 0 0 ${acColor}`,
            border: snapshot.isDragging ? `1.5px solid ${acColor}40` : '1px solid rgba(255,255,255,0.7)',
          }}
        >
          {/* Header */}
          <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                style={{ background: avatarColor(deal.client_name) }}>
                {initials(deal.client_name)}
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
            <p className="text-xs text-slate-400 mb-2 truncate">📖 {deal.project_title}</p>
          )}

          {/* Deal value */}
          {deal.deal_value > 0 && (
            <p className="font-mono font-bold text-base text-slate-800 mb-2" style={{ letterSpacing: '-0.5px' }}>
              R{Number(deal.deal_value).toLocaleString('en-ZA')}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {deal.service_type && svc && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: svc.bg, color: svc.text }}>
                {deal.service_type}
              </span>
            )}
            {deal.service_type && !svc && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{deal.service_type}</span>
            )}
          </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}