import React from 'react';
import { useNavigate } from 'react-router-dom';

function DaysIndicator({ changedAt }) {
  if (!changedAt) return null;
  const days = Math.floor((Date.now() - new Date(changedAt).getTime()) / (1000 * 60 * 60 * 24));
  const color = days < 7 ? 'bg-emerald-100 text-emerald-700' : days <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${color}`}>
      {days}d
    </span>
  );
}

function OwnerAvatar({ owner }) {
  if (!owner) return null;
  const initial = (owner[0] || '?').toUpperCase();
  return (
    <div className="w-6 h-6 rounded-full bg-[#B87333] flex items-center justify-center text-white text-xs font-bold flex-shrink-0" title={owner}>
      {initial}
    </div>
  );
}

export default function PipelineCard({ contact, isDragging }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (isDragging) return;
    navigate(`/admin/contacts?id=${contact.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl border border-black/8 p-3 cursor-pointer hover:shadow-md transition-all select-none ${isDragging ? 'shadow-lg rotate-1 opacity-90' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-[#1A1208] leading-tight">{contact.full_name}</p>
        <DaysIndicator changedAt={contact.pipeline_stage_changed_at} />
      </div>
      {contact.book_title && (
        <p className="text-xs text-black/50 mb-1 truncate">📖 {contact.book_title}</p>
      )}
      {contact.pipeline_stage && (
        <p className="text-xs text-black/40 mb-1 truncate">{contact.pipeline_stage === 'Editing' || contact.pipeline_stage === 'Cover Design' || contact.pipeline_stage === 'Typesetting' ? '🔧 ' : ''}{contact.pipeline_stage}</p>
      )}
      <div className="flex items-center justify-between">
        {contact.pipeline_value ? (
          <span className="text-xs font-semibold text-emerald-700">R {contact.pipeline_value.toLocaleString('en-ZA')}</span>
        ) : (
          <span className="text-xs text-black/20">No value</span>
        )}
        <OwnerAvatar owner={contact.pipeline_owner} />
      </div>
    </div>
  );
}