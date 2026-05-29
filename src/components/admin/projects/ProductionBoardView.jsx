import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { AlertTriangle, Clock, ArrowRight, ChevronRight } from 'lucide-react';

const COLUMNS = [
  {
    id: 'pre',
    label: 'Pre-Production',
    color: '#6366f1',
    stages: ['Enquiry Received', 'Quote Sent', 'Quote Accepted', 'Contract Sent', 'Contract Signed', 'Payment Received'],
  },
  {
    id: 'manuscript',
    label: 'Manuscript',
    color: '#0ea5e9',
    stages: ['Manuscript Received'],
  },
  {
    id: 'editing',
    label: 'Editing & Design',
    color: '#f59e0b',
    stages: ['Editing', 'Proofreading', 'Typesetting', 'Cover Design'],
  },
  {
    id: 'approval',
    label: 'Approval',
    color: '#8b5cf6',
    stages: ['Client Approval', 'Changes Requested', 'Final Approval Received'],
  },
  {
    id: 'print',
    label: 'Print',
    color: '#16a34a',
    stages: ['Sample Print Queued', 'Sample Print Completed', 'Mass Production Started'],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    color: '#B87333',
    stages: ['Ready for Collection', 'Courier Booked', 'Delivered', 'Completed'],
  },
];

// Flat ordered list for "next stage" logic
const ALL_STAGES = COLUMNS.flatMap(c => c.stages);

function getDeadlineInfo(deadline, stage) {
  if (!deadline) return null;
  const done = ['Completed', 'Delivered'].includes(stage);
  if (done) return null;
  const diff = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, color: '#ef4444', bg: '#fef2f2' };
  if (diff <= 3) return { label: `Due in ${diff}d`, color: '#f59e0b', bg: '#fffbeb' };
  if (diff <= 7) return { label: `${diff}d left`, color: '#3b82f6', bg: '#eff6ff' };
  return { label: `${diff}d left`, color: '#94a3b8', bg: '#f8fafc' };
}

function ProjectCard({ project, contact, onSelect, onMoveStage }) {
  const dl = getDeadlineInfo(project.deadline, project.stage);
  const nextStage = ALL_STAGES[ALL_STAGES.indexOf(project.stage) + 1];
  const [moving, setMoving] = useState(false);

  const handleAdvance = async (e) => {
    e.stopPropagation();
    if (!nextStage || moving) return;
    setMoving(true);
    await base44.entities.Project.update(project.id, { stage: nextStage, stage_changed_at: new Date().toISOString() });
    toast.success(`→ ${nextStage}`);
    onMoveStage();
    setMoving(false);
  };

  return (
    <div
      onClick={() => onSelect(project)}
      style={{
        background: project.is_at_risk ? '#fff5f5' : '#fff',
        border: `1px solid ${project.is_at_risk ? '#fca5a5' : '#e7e8f0'}`,
        borderLeft: `3px solid ${project.is_at_risk ? '#ef4444' : project.is_vip ? '#f59e0b' : '#e7e8f0'}`,
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 8,
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            {project.is_at_risk && <AlertTriangle style={{ width: 11, height: 11, color: '#ef4444', flexShrink: 0 }} />}
            {project.is_vip && <span style={{ fontSize: 9, background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: 10, fontWeight: 700 }}>VIP</span>}
            {project.queue_number && <span style={{ fontSize: 9, background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: 10, fontWeight: 700 }}>#{String(project.queue_number).padStart(3,'0')}</span>}
          </div>
          <p style={{ fontWeight: 600, fontSize: 12, color: '#1e1e2e', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.book_title}</p>
          <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>{contact?.full_name || project.author_name || '—'}</p>
        </div>
        <button onClick={e => { e.stopPropagation(); onSelect(project); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, flexShrink: 0 }}>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Stage pill */}
      <div style={{ fontSize: 10, color: '#64748b', background: '#f1f5f9', borderRadius: 6, padding: '2px 7px', display: 'inline-block', marginBottom: 6 }}>
        {project.stage}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {dl && (
          <span style={{ fontSize: 10, fontWeight: 600, background: dl.bg, color: dl.color, padding: '2px 6px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock style={{ width: 9, height: 9 }} /> {dl.label}
          </span>
        )}
        {project.payment_status && project.payment_status !== 'Fully Paid' && (
          <span style={{ fontSize: 10, background: project.payment_status === 'Unpaid' ? '#fef2f2' : '#fffbeb', color: project.payment_status === 'Unpaid' ? '#ef4444' : '#b45309', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>
            {project.payment_status}
          </span>
        )}
        {project.waiting_on && project.waiting_on !== 'None' && (
          <span style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>
            ⏳ {project.waiting_on}
          </span>
        )}
        {project.project_value > 0 && (
          <span style={{ fontSize: 10, color: '#64748b', marginLeft: 'auto' }}>R{project.project_value.toLocaleString('en-ZA')}</span>
        )}
      </div>

      {/* Advance button */}
      {nextStage && !['Completed', 'Delivered'].includes(project.stage) && (
        <button
          onClick={handleAdvance}
          disabled={moving}
          style={{ marginTop: 8, width: '100%', background: '#f8fafc', border: '1px solid #e7e8f0', borderRadius: 7, padding: '5px 0', fontSize: 11, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 600, opacity: moving ? 0.5 : 1 }}>
          <ArrowRight style={{ width: 11, height: 11 }} />
          {moving ? 'Moving…' : `→ ${nextStage}`}
        </button>
      )}
    </div>
  );
}

export default function ProductionBoardView({ projects, contacts, onSelect, onRefresh }) {
  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  return (
    <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
      {COLUMNS.map(col => {
        const cards = projects.filter(p => col.stages.includes(p.stage));
        const overdue = cards.filter(p => {
          if (!p.deadline) return false;
          return new Date(p.deadline) < new Date() && !['Completed','Delivered'].includes(p.stage);
        }).length;

        return (
          <div key={col.id} style={{ minWidth: 240, flex: '0 0 256px', display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: 14, border: '1px solid #e7e8f0', overflow: 'hidden' }}>
            {/* Column header */}
            <div style={{ borderBottom: `3px solid ${col.color}`, padding: '10px 12px 8px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#1e1e2e' }}>{col.label}</span>
                  <span style={{ background: col.color + '22', color: col.color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '1px 7px' }}>{cards.length}</span>
                </div>
                {overdue > 0 && (
                  <span style={{ fontSize: 10, background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                    {overdue} overdue
                  </span>
                )}
              </div>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: '4px 0 0' }}>{col.stages.slice(0, 3).join(', ')}{col.stages.length > 3 ? '…' : ''}</p>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, padding: '8px 8px 0', maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
              {cards.length === 0 ? (
                <div style={{ border: '2px dashed #e7e8f0', borderRadius: 10, padding: '18px 0', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>Empty</div>
              ) : (
                cards.map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    contact={contactMap[p.contact_id]}
                    onSelect={onSelect}
                    onMoveStage={onRefresh}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}