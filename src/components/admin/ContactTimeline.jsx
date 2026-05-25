import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, FileText, MessageSquare, Activity, MoveRight } from 'lucide-react';

const TYPE_CONFIG = {
  email: { icon: Mail, color: 'bg-blue-100 text-blue-600', label: 'Email' },
  note: { icon: MessageSquare, color: 'bg-amber-100 text-amber-600', label: 'Note' },
  submission: { icon: FileText, color: 'bg-green-100 text-green-600', label: 'Submission' },
  stage_change: { icon: MoveRight, color: 'bg-purple-100 text-purple-600', label: 'Stage Change' },
  activity: { icon: Activity, color: 'bg-gray-100 text-gray-600', label: 'Activity' },
};

function TimelineItem({ item, isLast }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.activity;
  const IconComp = cfg.icon;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
          <IconComp className="w-3.5 h-3.5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{cfg.label}</span>
          <span className="text-xs text-gray-400 shrink-0">
            {new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' '}
            {new Date(item.date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-gray-800 font-medium">{item.title}</p>
        {item.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.body}</p>}
      </div>
    </div>
  );
}

export default function ContactTimeline({ contact }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contact?.id) return;

    Promise.all([
      base44.entities.EmailMessage.filter({ contact_id: contact.id }, '-sent_at', 50).catch(() => []),
      base44.entities.Note.filter({ entity_id: contact.id, entity_type: 'contact' }, '-created_date', 50).catch(() => []),
      base44.entities.Submission.filter({ email: contact.email }, '-created_date', 20).catch(() => []),
      base44.entities.PipelineStageHistory.filter({ contact_id: contact.id }, '-changed_at', 20).catch(() => []),
      base44.entities.ActivityLog.filter({ entity_id: contact.id, entity_type: 'contact' }, '-created_date', 20).catch(() => []),
    ]).then(([emails, notes, submissions, stageHistory, activities]) => {
      const timeline = [
        ...emails.map(e => ({
          id: `email-${e.id}`, type: 'email',
          date: e.sent_at || e.created_date,
          title: `${e.direction === 'outbound' ? '→ Sent:' : '← Received:'} ${e.subject}`,
          body: e.body_text?.slice(0, 120),
        })),
        ...notes.map(n => ({
          id: `note-${n.id}`, type: 'note',
          date: n.created_date,
          title: 'Note added',
          body: n.content?.slice(0, 120),
        })),
        ...submissions.map(s => ({
          id: `sub-${s.id}`, type: 'submission',
          date: s.created_date,
          title: `Form submission — ${s.form_type?.replace(/_/g, ' ')}`,
          body: s.message?.slice(0, 120),
        })),
        ...stageHistory.map(h => ({
          id: `stage-${h.id}`, type: 'stage_change',
          date: h.changed_at,
          title: `Stage: ${h.from_stage || '—'} → ${h.to_stage}`,
          body: h.notes,
        })),
        ...activities.map(a => ({
          id: `act-${a.id}`, type: 'activity',
          date: a.created_date,
          title: a.description || a.action,
          body: null,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setItems(timeline);
    }).finally(() => setLoading(false));
  }, [contact?.id]);

  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (items.length === 0) return (
    <div className="py-12 text-center text-sm text-gray-400">No activity recorded yet for this contact.</div>
  );

  return (
    <div>
      {items.map((item, idx) => (
        <TimelineItem key={item.id} item={item} isLast={idx === items.length - 1} />
      ))}
    </div>
  );
}