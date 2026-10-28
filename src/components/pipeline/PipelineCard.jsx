import React from 'react';
import { useNavigate } from 'react-router-dom';

const HEALTH_CONFIG = {
  'On Track':       { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Needs Attention':{ bg: 'bg-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-500' },
  'Delayed':        { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500' },
  'Blocked':        { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'    },
  'High Risk':      { bg: 'bg-red-200',     text: 'text-red-800',     dot: 'bg-red-700'    },
};

const WAITING_COLORS = {
  'Client':     'bg-orange-100 text-orange-700',
  'Payment':    'bg-red-100 text-red-700',
  'Admin':      'bg-blue-100 text-blue-700',
  'Editor':     'bg-yellow-100 text-yellow-700',
  'Designer':   'bg-pink-100 text-pink-700',
  'Typesetter': 'bg-purple-100 text-purple-700',
  'Production': 'bg-teal-100 text-teal-700',
  'Courier':    'bg-sky-100 text-sky-700',
  'Approval':   'bg-amber-100 text-amber-700',
};

function getHealth(changedAt) {
  if (!changedAt) return 'On Track';
  const days = Math.floor((Date.now() - new Date(changedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 5) return 'On Track';
  if (days < 14) return 'Needs Attention';
  if (days < 30) return 'Delayed';
  if (days < 60) return 'Blocked';
  return 'High Risk';
}

function getDaysInStage(changedAt) {
  if (!changedAt) return 0;
  return Math.floor((Date.now() - new Date(changedAt).getTime()) / (1000 * 60 * 60 * 24));
}

const LIFECYCLE_BADGES = {
  'lead':            { label: 'Lead',     style: 'bg-blue-100 text-blue-700' },
  'customer':        { label: 'Client',   style: 'bg-green-100 text-green-700' },
  'repeat_customer': { label: '⭐ Repeat', style: 'bg-amber-100 text-amber-700' },
  'past_customer':   { label: 'Past',     style: 'bg-gray-100 text-gray-500' },
};

export default function PipelineCard({ contact, isDragging }) {
  const navigate = useNavigate();
  const health = getHealth(contact.pipeline_stage_changed_at);
  const daysInStage = getDaysInStage(contact.pipeline_stage_changed_at);
  const healthCfg = HEALTH_CONFIG[health] || HEALTH_CONFIG['On Track'];
  const lifecycleBadge = LIFECYCLE_BADGES[contact.lifecycle_stage];

  // Derive status badges
  const badges = [];
  if (contact.lifecycle_stage === 'lead') badges.push({ label: '🔥 Hot Lead', style: 'bg-red-100 text-red-600' });
  if (contact.pipeline_stage === 'Payment Pending') badges.push({ label: '💰 Awaiting Payment', style: 'bg-amber-100 text-amber-700' });
  if (daysInStage > 14 && !['Completed','Delivered','Lost'].includes(contact.pipeline_stage)) {
    badges.push({ label: '⏰ Delayed', style: 'bg-orange-100 text-orange-700' });
  }

  const handleClick = (e) => {
    if (isDragging) return;
    navigate(`/admin/contacts?id=${contact.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl border p-3 cursor-pointer select-none transition-all backdrop-blur-sm ${
        isDragging 
          ? 'shadow-2xl rotate-2 opacity-90 scale-105' 
          : 'hover:shadow-lg hover:border-cyan-500/40'
      }`}
      style={{
        background: 'rgba(15, 23, 42, 0.65)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.03)',
      }}
    >
      {/* Top row: name + health dot */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-bold leading-tight" style={{ color: '#e0f2fe' }}>{contact.full_name}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
            style={{ 
              background: healthCfg.dot.replace('bg-', 'var(--color-'),
              boxShadow: `0 0 10px ${health === 'On Track' ? '#10b981' : health === 'Needs Attention' ? '#f59e0b' : '#ef4444'}`
            }} 
            title={health} 
          />
        </div>
      </div>

      {/* Book title */}
      {contact.book_title && (
        <p className="text-xs mb-1.5 truncate" style={{ color: 'rgba(165, 180, 200, 0.7)' }}>
          📖 {contact.book_title}
        </p>
      )}

      {/* Days in stage */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
          background: health === 'On Track' ? 'rgba(16, 185, 129, 0.15)' : 
                     health === 'Needs Attention' ? 'rgba(245, 158, 11, 0.15)' : 
                     'rgba(239, 68, 68, 0.15)',
          color: health === 'On Track' ? '#34d399' : 
                 health === 'Needs Attention' ? '#fbbf24' : 
                 '#f87171',
          border: `1px solid ${health === 'On Track' ? 'rgba(16, 185, 129, 0.3)' : 
                           health === 'Needs Attention' ? 'rgba(245, 158, 11, 0.3)' : 
                           'rgba(239, 68, 68, 0.3)'}`,
        }}>
          {daysInStage}d · {health}
        </span>
        {lifecycleBadge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
            background: lifecycleBadge.style.includes('green') ? 'rgba(52, 211, 153, 0.15)' :
                       lifecycleBadge.style.includes('amber') ? 'rgba(251, 191, 36, 0.15)' :
                       'rgba(148, 163, 184, 0.15)',
            color: lifecycleBadge.style.includes('green') ? '#34d399' :
                   lifecycleBadge.style.includes('amber') ? '#fbbf24' :
                   '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>{lifecycleBadge.label}</span>
        )}
      </div>

      {/* Status badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {badges.map((b, i) => (
            <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
              background: b.style.includes('red') ? 'rgba(239, 68, 68, 0.15)' :
                         b.style.includes('amber') ? 'rgba(251, 191, 36, 0.15)' :
                         'rgba(249, 115, 22, 0.15)',
              color: b.style.includes('red') ? '#f87171' :
                     b.style.includes('amber') ? '#fbbf24' :
                     '#fb923c',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>{b.label}</span>
          ))}
        </div>
      )}

      {/* Bottom row: value + owner */}
      <div className="flex items-center justify-between mt-1">
        {contact.pipeline_value ? (
          <span className="text-xs font-bold font-mono" style={{ 
            color: '#34d399',
            textShadow: '0 0 10px rgba(52, 211, 153, 0.4)'
          }}>
            R {contact.pipeline_value.toLocaleString('en-ZA')}
          </span>
        ) : (
          <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.3)' }}>—</span>
        )}
        {contact.pipeline_owner && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" 
            style={{
              background: 'linear-gradient(135deg, #B87333, #d4a574)',
              boxShadow: '0 2px 8px rgba(184, 115, 51, 0.5)',
            }} 
            title={contact.pipeline_owner}
          >
            {contact.pipeline_owner[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}