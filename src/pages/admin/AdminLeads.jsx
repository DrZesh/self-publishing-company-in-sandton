import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Plus, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

const STAGES = ['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost'];
const STAGE_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-amber-100 text-amber-700',
  quoted: 'bg-orange-100 text-orange-700',
  negotiating: 'bg-indigo-100 text-indigo-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
};

function LeadModal({ lead, contacts, onClose, onSave, onDelete }) {
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
        <div className="sticky top-0 bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1208]">{lead ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Contact *</label>
            <select value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
              <option value="">Select a contact…</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Stage</label>
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Estimated Value (R)</label>
              <input type="number" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))}
                placeholder="0" className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">
              Probability: {form.probability_percent}% → Weighted Value: R{weighted.toLocaleString()}
            </label>
            <input type="range" min="0" max="100" step="5" value={form.probability_percent}
              onChange={e => setForm(f => ({ ...f, probability_percent: e.target.value }))}
              className="w-full accent-[#B87333]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Expected Close Date</label>
              <input type="date" value={form.expected_close_date} onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Next Action Due</label>
              <input type="date" value={form.next_action_due} onChange={e => setForm(f => ({ ...f, next_action_due: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Next Action</label>
            <input type="text" value={form.next_action} onChange={e => setForm(f => ({ ...f, next_action: e.target.value }))}
              placeholder="e.g. Send revised quote, follow up call…"
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              placeholder="Internal notes about this lead…"
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
          </div>

          {form.stage === 'lost' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Lost Reason</label>
                <select value={form.lost_reason} onChange={e => setForm(f => ({ ...f, lost_reason: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                  <option value="">Select reason…</option>
                  {['price', 'timing', 'competitor', 'no_response', 'not_a_fit', 'other'].map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Detail</label>
                <input type="text" value={form.lost_reason_detail} onChange={e => setForm(f => ({ ...f, lost_reason_detail: e.target.value }))}
                  placeholder="Optional detail…"
                  className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
              </div>
            </div>
          )}

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

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [modalLead, setModalLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Lead.list('-created_date', 200),
      base44.entities.Contact.list('-created_date', 200),
    ]).then(([l, c]) => { setLeads(l); setContacts(c); }).finally(() => setLoading(false));
  }, []);

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = leads.filter(l => {
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
    if (search) {
      const c = contactMap[l.contact_id];
      const q = search.toLowerCase();
      return c?.full_name?.toLowerCase().includes(q) || c?.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const openLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  const pipelineValue = openLeads.reduce((s, l) => s + (l.weighted_value || 0), 0);
  const wonValue = leads.filter(l => l.stage === 'won').reduce((s, l) => s + (l.estimated_value || 0), 0);

  const handleSave = async (data) => {
    if (modalLead?.id) {
      await base44.entities.Lead.update(modalLead.id, data);
      setLeads(prev => prev.map(l => l.id === modalLead.id ? { ...l, ...data } : l));
      toast.success('Lead updated');
    } else {
      const created = await base44.entities.Lead.create(data);
      setLeads(prev => [created, ...prev]);
      toast.success('Lead created');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    await base44.entities.Lead.delete(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setShowModal(false);
    toast.success('Lead deleted');
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1208]">Leads</h1>
            <p className="text-sm text-black/50 mt-1">{openLeads.length} open · R{pipelineValue.toLocaleString()} pipeline · R{wonValue.toLocaleString()} won</p>
          </div>
          <button onClick={() => { setModalLead(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-colors">
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-[#1A1208] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
            All ({leads.length})
          </button>
          {STAGES.map(s => (
            <button key={s} onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === s ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({leads.filter(l => l.stage === s).length})
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by contact name or email…"
            className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white" />
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm font-semibold text-black/50">No leads found</p>
            <p className="text-xs text-black/30 mt-1">Leads are created from submissions or manually via the button above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9F7F2] border-b border-black/8">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Stage</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-black/40 uppercase tracking-wide hidden sm:table-cell">Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-black/40 uppercase tracking-wide hidden md:table-cell">Close Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden lg:table-cell">Next Action</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const contact = contactMap[lead.contact_id];
                  const isOverdue = lead.next_action_due && new Date(lead.next_action_due) < new Date();
                  return (
                    <tr key={lead.id} onClick={() => { setModalLead(lead); setShowModal(true); }}
                      className="border-b border-black/5 hover:bg-[#faf8f4] cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1A1208]">{contact?.full_name || '—'}</p>
                        <p className="text-xs text-black/40">{contact?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STAGE_COLORS[lead.stage]}`}>{lead.stage}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <p className="font-semibold text-[#1A1208]">R{(lead.estimated_value || 0).toLocaleString()}</p>
                        <p className="text-xs text-black/40">{lead.probability_percent || 0}% → R{(lead.weighted_value || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        {lead.expected_close_date
                          ? <span className="text-xs text-black/60">{new Date(lead.expected_close_date).toLocaleDateString('en-ZA')}</span>
                          : <span className="text-xs text-black/20">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lead.next_action
                          ? <p className={`text-xs truncate max-w-[180px] ${isOverdue ? 'text-red-500 font-semibold' : 'text-black/60'}`}>{isOverdue ? '⚠ ' : ''}{lead.next_action}</p>
                          : <span className="text-xs text-black/20">—</span>}
                      </td>
                      <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-black/20" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <LeadModal lead={modalLead} contacts={contacts} onClose={() => setShowModal(false)} onSave={handleSave} onDelete={handleDelete} />
      )}
    </AdminLayout>
  );
}