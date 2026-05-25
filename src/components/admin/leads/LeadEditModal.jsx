import React, { useState } from 'react';
import { X } from 'lucide-react';

const STAGES = ['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost'];
const SERVICES = [
  'Book Printing', 'Book Editing', 'Proofreading', 'Thesis Editing', 'Dissertation Editing',
  'Book Cover Design', 'Typesetting', 'Ghostwriting', 'Ebook Publishing', 'Self Publishing',
  "Children's Books", 'Memoir Writing', 'Biography Writing', 'Author Websites', 'Other',
];

export default function LeadEditModal({ lead, contacts, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    stage: lead?.stage || 'new',
    estimated_value: lead?.estimated_value || '',
    probability_percent: lead?.probability_percent || 50,
    expected_close_date: lead?.expected_close_date || '',
    next_action: lead?.next_action || '',
    next_action_due: lead?.next_action_due || '',
    service_interest: lead?.service_interest || [],
    lost_reason: lead?.lost_reason || '',
    lost_reason_detail: lead?.lost_reason_detail || '',
    contact_id: lead?.contact_id || '',
    description: lead?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const weighted = form.estimated_value && form.probability_percent
    ? Math.round(Number(form.estimated_value) * Number(form.probability_percent) / 100)
    : 0;

  const toggleService = (svc) => {
    setForm(f => ({
      ...f,
      service_interest: f.service_interest.includes(svc)
        ? f.service_interest.filter(s => s !== svc)
        : [...f.service_interest, svc],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      estimated_value: Number(form.estimated_value) || 0,
      probability_percent: Number(form.probability_percent) || 0,
      weighted_value: weighted,
      stage_changed_at: form.stage !== lead?.stage ? new Date().toISOString() : lead?.stage_changed_at,
    };
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{lead ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Contact */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contact *</label>
            <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
              <option value="">Select a contact…</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
            </select>
          </div>

          {/* Stage + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stage</label>
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Estimated Value (R)</label>
              <input type="number" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))}
                placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
          </div>

          {/* Probability */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Probability: {form.probability_percent}% → Weighted: R{weighted.toLocaleString()}
            </label>
            <input type="range" min="0" max="100" step="5" value={form.probability_percent}
              onChange={e => setForm(f => ({ ...f, probability_percent: e.target.value }))}
              className="w-full accent-[#B87333]" />
          </div>

          {/* Services */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Services of Interest</label>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map(s => (
                <button key={s} type="button"
                  onClick={() => toggleService(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.service_interest.includes(s) ? 'bg-[#B87333] text-white border-[#B87333]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#B87333]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expected Close</label>
              <input type="date" value={form.expected_close_date} onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Next Action Due</label>
              <input type="date" value={form.next_action_due} onChange={e => setForm(f => ({ ...f, next_action_due: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
          </div>

          {/* Next action */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Next Action</label>
            <input type="text" value={form.next_action} onChange={e => setForm(f => ({ ...f, next_action: e.target.value }))}
              placeholder="e.g. Send revised quote, follow up call…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              placeholder="Internal notes about this lead…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
          </div>

          {/* Lost reason */}
          {form.stage === 'lost' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Lost Reason</label>
                <select value={form.lost_reason} onChange={e => setForm(f => ({ ...f, lost_reason: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                  <option value="">Select reason…</option>
                  {['price', 'timing', 'competitor', 'no_response', 'not_a_fit', 'other'].map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Detail</label>
                <input type="text" value={form.lost_reason_detail} onChange={e => setForm(f => ({ ...f, lost_reason_detail: e.target.value }))}
                  placeholder="Optional detail…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.contact_id}
              className="flex-1 py-3 bg-[#B87333] text-white rounded-xl font-semibold text-sm hover:bg-[#a06428] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : lead ? 'Save Changes' : 'Create Lead'}
            </button>
            {lead && (
              <button onClick={() => onDelete(lead.id)}
                className="px-4 py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-semibold">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}