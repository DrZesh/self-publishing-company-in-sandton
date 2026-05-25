import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PIPELINE_STAGES } from './KanbanBoard';

const STAGE_BADGE = {
  'New Enquiry': 'bg-blue-100 text-blue-700',
  'Information Requested': 'bg-sky-100 text-sky-700',
  'Quote in Progress': 'bg-violet-100 text-violet-700',
  'Quote Sent': 'bg-purple-100 text-purple-700',
  'Payment Pending': 'bg-amber-100 text-amber-700',
  'Project Started': 'bg-orange-100 text-orange-700',
  'Editing': 'bg-yellow-100 text-yellow-700',
  'Cover Design': 'bg-pink-100 text-pink-700',
  'Typesetting': 'bg-rose-100 text-rose-700',
  'Sample Queued': 'bg-[#B87333]/10 text-[#B87333]',
  'Sample Approved': 'bg-lime-100 text-lime-700',
  'Mass Production': 'bg-teal-100 text-teal-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Lost': 'bg-red-100 text-red-600',
};

function DaysChip({ changedAt }) {
  if (!changedAt) return <span className="text-xs text-black/30">—</span>;
  const days = Math.floor((Date.now() - new Date(changedAt).getTime()) / (1000 * 60 * 60 * 24));
  const color = days < 7 ? 'text-emerald-600' : days <= 30 ? 'text-amber-600' : 'text-red-600';
  return <span className={`text-xs font-semibold ${color}`}>{days}d</span>;
}

export default function PipelineListView({ contacts, onStageChange }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F9F7F2] border-b border-black/8">
            <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden md:table-cell">Book</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Stage</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden sm:table-cell">Value</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden lg:table-cell">Age</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden lg:table-cell">Owner</th>
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {contacts.map(c => (
            <tr
              key={c.id}
              className="border-b border-black/5 hover:bg-[#faf8f4] cursor-pointer transition-colors"
              onClick={() => navigate(`/admin/contacts?id=${c.id}`)}
            >
              <td className="px-4 py-3">
                <p className="font-semibold text-[#1A1208]">{c.full_name}</p>
                <p className="text-xs text-black/40">{c.email}</p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-xs text-black/60">{c.book_title || '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={c.pipeline_stage || 'New Enquiry'}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    const newStage = e.target.value;
                    if (newStage === 'Lost') {
                      const reason = prompt(`Reason for losing ${c.full_name}?`);
                      onStageChange(c.id, newStage, reason || '');
                    } else {
                      onStageChange(c.id, newStage, null);
                    }
                  }}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B87333] ${STAGE_BADGE[c.pipeline_stage] || 'bg-black/5 text-black/50'}`}
                >
                  {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-xs font-semibold text-emerald-700">
                {c.pipeline_value ? `R ${c.pipeline_value.toLocaleString('en-ZA')}` : '—'}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell"><DaysChip changedAt={c.pipeline_stage_changed_at} /></td>
              <td className="px-4 py-3 hidden lg:table-cell text-xs text-black/50">{c.pipeline_owner || '—'}</td>
              <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-black/20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {contacts.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-black/40">No contacts match your filters.</p>
        </div>
      )}
    </div>
  );
}