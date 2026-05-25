import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import LeadDetailPanel from '@/components/admin/leads/LeadDetailPanel';
import LeadEditModal from '@/components/admin/leads/LeadEditModal';
import { Search, Plus, ChevronRight, Download, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const STAGES = ['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost'];

const STAGE_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Waiting for Client',
  quoted: 'Quote Sent',
  negotiating: 'Quote Accepted',
  won: 'Completed',
  lost: 'Lost',
};

const STAGE_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-amber-100 text-amber-700',
  quoted: 'bg-orange-100 text-orange-700',
  negotiating: 'bg-indigo-100 text-indigo-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
};

const SERVICE_OPTIONS = [
  'Book Printing', 'Book Editing', 'Proofreading', 'Thesis Editing', 'Dissertation Editing',
  'Book Cover Design', 'Typesetting', 'Ghostwriting', 'Ebook Publishing', 'Self Publishing',
  "Children's Books", 'Memoir Writing', 'Biography Writing', 'Author Websites', 'Other',
];

const SOURCE_LABELS = {
  organic_search: 'Organic Search', direct: 'Direct', social: 'Social',
  referral: 'Referral', paid: 'Paid Ads', email: 'Email', other: 'Other',
};

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Lead.list('-created_date', 200),
      base44.entities.Contact.list('-created_date', 200),
      base44.entities.Submission.list('-created_date', 200),
    ]).then(([l, c, s]) => { setLeads(l); setContacts(c); setSubmissions(s); })
      .finally(() => setLoading(false));
  }, []);

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = leads.filter(l => {
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
    if (serviceFilter) {
      const services = (l.service_interest || []).join(' ').toLowerCase();
      if (!services.includes(serviceFilter.toLowerCase())) return false;
    }
    if (search) {
      const c = contactMap[l.contact_id];
      const q = search.toLowerCase();
      const matches = c?.full_name?.toLowerCase().includes(q) ||
        c?.email?.toLowerCase().includes(q) ||
        c?.phone?.toLowerCase().includes(q) ||
        c?.book_title?.toLowerCase().includes(q) ||
        (l.service_interest || []).join(' ').toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  const openLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  const pipelineValue = openLeads.reduce((s, l) => s + (l.weighted_value || 0), 0);
  const wonValue = leads.filter(l => l.stage === 'won').reduce((s, l) => s + (l.estimated_value || 0), 0);

  const handleSave = async (data) => {
    if (editLead?.id) {
      const updated = await base44.entities.Lead.update(editLead.id, data);
      setLeads(prev => prev.map(l => l.id === editLead.id ? { ...l, ...data } : l));
      if (selectedLead?.id === editLead.id) setSelectedLead(prev => ({ ...prev, ...data }));
      toast.success('Lead updated');
    } else {
      const created = await base44.entities.Lead.create(data);
      setLeads(prev => [created, ...prev]);
      toast.success('Lead created');
    }
    setShowEditModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    await base44.entities.Lead.delete(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelectedLead(null);
    setShowEditModal(false);
    toast.success('Lead deleted');
  };

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
  };

  return (
    <AdminLayout>
      <div className="flex h-full gap-0">
        {/* Main list */}
        <div className={`flex-1 min-w-0 transition-all ${selectedLead ? 'hidden lg:block lg:max-w-none' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {openLeads.length} open · R{pipelineValue.toLocaleString()} pipeline · R{wonValue.toLocaleString()} won
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const headers = ['Name','Email','Phone','Stage','Service','Book Title','Value (R)','Date'];
                  const rows = filtered.map(l => {
                    const c = contactMap[l.contact_id];
                    return [c?.full_name||'',c?.email||'',c?.phone||'',STAGE_LABELS[l.stage]||l.stage,(l.service_interest||[]).join('; '),c?.book_title||'',l.estimated_value||0,new Date(l.created_date).toLocaleDateString('en-ZA')];
                  });
                  const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
                  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download=`leads-${new Date().toISOString().slice(0,10)}.csv`;a.click();
                }}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:border-[#B87333] hover:text-[#B87333] transition-colors bg-white">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button onClick={() => { setEditLead(null); setShowEditModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B87333] text-white rounded-lg text-sm font-semibold hover:bg-[#a06428] transition-colors">
                  <Plus className="w-4 h-4" /> New Lead
                </button>
              </div>
            </div>

            {/* Stage filter pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              <button onClick={() => setStageFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B87333]'}`}>
                All ({leads.length})
              </button>
              {STAGES.map(s => (
                <button key={s} onClick={() => setStageFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === s ? 'bg-[#B87333] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B87333]'}`}>
                  {STAGE_LABELS[s] || s} ({leads.filter(l => l.stage === s).length})
                </button>
              ))}
            </div>

            {/* Search + filters row */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, phone, book title…"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#B87333] bg-white" />
              </div>
              <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#B87333] bg-white text-gray-600">
                <option value="">All Services</option>
                {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-sm font-semibold text-gray-500">No leads found</p>
                <p className="text-xs text-gray-400 mt-1">Leads are created from submissions or manually.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Next Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Date</th>
                        <th className="px-4 py-3 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(lead => {
                        const contact = contactMap[lead.contact_id];
                        const isOverdue = lead.next_action_due && new Date(lead.next_action_due) < new Date();
                        const services = (lead.service_interest || []).slice(0, 2);
                        const isSelected = selectedLead?.id === lead.id;
                        return (
                          <tr key={lead.id}
                            onClick={() => handleSelectLead(lead)}
                            className={`border-b border-gray-100 hover:bg-amber-50/40 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50 border-l-2 border-l-[#B87333]' : ''}`}>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900">{contact?.full_name || '—'}</p>
                              <p className="text-xs text-gray-400">{contact?.email || ''}</p>
                              {contact?.phone && <p className="text-xs text-gray-400">{contact.phone}</p>}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {services.length ? services.map(s => (
                                  <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{s}</span>
                                )) : <span className="text-xs text-gray-300">—</span>}
                              </div>
                              {contact?.book_title && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[140px]">📖 {contact.book_title}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-600'}`}>
                                {STAGE_LABELS[lead.stage] || lead.stage}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right hidden md:table-cell">
                              <p className="font-semibold text-gray-900">R{(lead.estimated_value || 0).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">{lead.probability_percent || 0}% prob</p>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell max-w-[180px]">
                              {lead.next_action
                                ? <p className={`text-xs truncate ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>{isOverdue ? '⚠ ' : ''}{lead.next_action}</p>
                                : <span className="text-xs text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3 hidden xl:table-cell">
                              <p className="text-xs text-gray-400">{new Date(lead.created_date).toLocaleDateString('en-ZA')}</p>
                            </td>
                            <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-gray-300" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedLead && (
          <LeadDetailPanel
            lead={selectedLead}
            contact={contactMap[selectedLead.contact_id]}
            submissions={submissions.filter(s => {
              const c = contactMap[selectedLead.contact_id];
              return s.email === c?.email;
            })}
            onClose={() => setSelectedLead(null)}
            onEdit={() => { setEditLead(selectedLead); setShowEditModal(true); }}
            onDelete={handleDelete}
            onStageChange={async (newStage) => {
              await base44.entities.Lead.update(selectedLead.id, { stage: newStage, stage_changed_at: new Date().toISOString() });
              setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, stage: newStage } : l));
              setSelectedLead(prev => ({ ...prev, stage: newStage }));
              toast.success(`Stage updated to ${newStage}`);
            }}
          />
        )}
      </div>

      {showEditModal && (
        <LeadEditModal
          lead={editLead}
          contacts={contacts}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
}