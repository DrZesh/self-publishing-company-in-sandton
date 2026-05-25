import React from 'react';
import { TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';

const ACTIVE_STAGES = ['New Enquiry', 'Information Requested', 'Quote in Progress', 'Quote Sent', 'Payment Pending', 'Project Started', 'Editing', 'Cover Design', 'Typesetting', 'Sample Queued', 'Sample Approved', 'Mass Production'];

export default function PipelineStats({ contacts, history }) {
  const activeContacts = contacts.filter(c => ACTIVE_STAGES.includes(c.pipeline_stage));
  const totalValue = activeContacts.reduce((sum, c) => sum + (c.pipeline_value || 0), 0);

  const stuckDeals = activeContacts.filter(c => {
    if (!c.pipeline_stage_changed_at) return false;
    const days = (Date.now() - new Date(c.pipeline_stage_changed_at).getTime()) / (1000 * 60 * 60 * 24);
    return days > 30;
  }).length;

  // Avg days from "Lead Contacted" to "Won" using history
  let avgDaysToWon = null;
  const wonContacts = contacts.filter(c => ['Completed', 'Delivered'].includes(c.pipeline_stage));
  const durations = wonContacts.map(c => {
    const entries = history.filter(h => h.contact_id === c.id).sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));
    const firstEntry = entries.find(h => h.to_stage === 'New Enquiry' || h.from_stage === null);
    const wonEntry = entries.find(h => ['Completed', 'Delivered'].includes(h.to_stage));
    if (!firstEntry || !wonEntry) return null;
    return (new Date(wonEntry.changed_at) - new Date(firstEntry.changed_at)) / (1000 * 60 * 60 * 24);
  }).filter(d => d !== null);
  if (durations.length > 0) {
    avgDaysToWon = Math.round(durations.reduce((s, d) => s + d, 0) / durations.length);
  }

  const stats = [
    {
      label: 'Active Deals',
      value: activeContacts.length,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pipeline Value',
      value: `R ${totalValue.toLocaleString('en-ZA')}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Avg. Days to Won',
      value: avgDaysToWon !== null ? `${avgDaysToWon}d` : '—',
      icon: Clock,
      color: 'text-[#B87333]',
      bg: 'bg-[#B87333]/10',
    },
    {
      label: 'Stuck Deals (>30d)',
      value: stuckDeals,
      icon: AlertTriangle,
      color: stuckDeals > 0 ? 'text-red-600' : 'text-black/40',
      bg: stuckDeals > 0 ? 'bg-red-50' : 'bg-black/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-black/8 p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <div>
            <p className="text-xs text-black/40 font-medium">{s.label}</p>
            <p className="text-lg font-bold text-[#1A1208]">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}