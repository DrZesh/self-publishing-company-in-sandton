import React, { useEffect, useMemo, useState } from 'react';
import { crmService } from '@/services/crmService';
import AdminLayout from '@/components/admin/AdminLayout';
import LeadDetailPanel from '@/components/admin/leads/LeadDetailPanel';
import LeadEditModal from '@/components/admin/leads/LeadEditModal';
import AILeadSummary from '@/components/admin/leads/AILeadSummary';
import { Search, Plus, ChevronRight, Download, X } from 'lucide-react';
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
  'Book Printing',
  'Book Editing',
  'Proofreading',
  'Thesis Editing',
  'Dissertation Editing',
  'Book Cover Design',
  'Typesetting',
  'Ghostwriting',
  'Ebook Publishing',
  'Self Publishing',
  "Children's Books",
  'Memoir Writing',
  'Biography Writing',
  'Author Websites',
  'Other',
];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const [leadData, contactData, submissionData] = await Promise.all([
        crmService.listLeads(200),
        crmService.listContacts(500),
        crmService.listSubmissions(200),
      ]);

      setLeads(leadData || []);
      setContacts(contactData || []);
      setSubmissions(submissionData || []);
    } catch (error) {
      console.error('Failed to load leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const contactMap = useMemo(
    () => Object.fromEntries(contacts.map(contact => [contact.id, contact])),
    [contacts]
  );

  const filtered = leads.filter(lead => {
    if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;

    if (serviceFilter) {
      const services = (lead.service_interest || []).join(' ').toLowerCase();
      if (!services.includes(serviceFilter.toLowerCase())) return false;
    }

    if (search.trim()) {
      const contact = contactMap[lead.contact_id];
      const query = search.toLowerCase();
      const matches =
        contact?.full_name?.toLowerCase().includes(query) ||
        contact?.email?.toLowerCase().includes(query) ||
        contact?.phone?.toLowerCase().includes(query) ||
        contact?.book_title?.toLowerCase().includes(query) ||
        (lead.service_interest || []).join(' ').toLowerCase().includes(query);

      if (!matches) return false;
    }

    return true;
  });

  const openLeads = leads.filter(lead => !['won', 'lost'].includes(lead.stage));
  const pipelineValue = openLeads.reduce((sum, lead) => sum + Number(lead.weighted_value || 0), 0);
  const wonValue = leads
    .filter(lead => lead.stage === 'won')
    .reduce((sum, lead) => sum + Number(lead.estimated_value || 0), 0);

  const handleSave = async (data) => {
    try {
      if (editLead?.id) {
        const updated = await crmService.updateLead(editLead.id, data);
        setLeads(previous => previous.map(lead => lead.id === editLead.id ? updated : lead));
        if (selectedLead?.id === editLead.id) setSelectedLead(updated);
        toast.success('Lead updated');
      } else {
        const created = await crmService.createLead(data);
        setLeads(previous => [created, ...previous]);
        toast.success('Lead created');
      }

      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save lead:', error);
      toast.error(`Failed to save lead: ${error.message}`);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;

    try {
      await crmService.deleteLead(id);
      setLeads(previous => previous.filter(lead => lead.id !== id));
      setSelectedLead(null);
      setShowEditModal(false);
      toast.success('Lead deleted');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error(`Failed to delete lead: ${error.message}`);
    }
  };

  const handleStageChange = async (newStage) => {
    if (!selectedLead) return;

    try {
      const updated = await crmService.updateLead(selectedLead.id, {
        stage: newStage,
      });

      setLeads(previous => previous.map(lead => lead.id === updated.id ? updated : lead));
      setSelectedLead(updated);
      toast.success(`Stage updated to ${STAGE_LABELS[newStage] || newStage}`);
    } catch (error) {
      toast.error(`Failed to update stage: ${error.message}`);
    }
  };

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Stage', 'Service', 'Book Title', 'Value (R)', 'Date'];
    const rows = filtered.map(lead => {
      const contact = contactMap[lead.contact_id];
      return [
        contact?.full_name || '',
        contact?.email || '',
        contact?.phone || '',
        STAGE_LABELS[lead.stage] || lead.stage,
        (lead.service_interest || []).join('; '),
        contact?.book_title || '',
        lead.estimated_value || 0,
        new Date(lead.created_date).toLocaleDateString('en-ZA'),
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const anchor = document.createElement('a');
    anchor.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    anchor.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
  };

  return (
    <AdminLayout>
      <div className="flex h-full gap-0">
        <div className={`flex-1 min-w-0 transition-all ${selectedLead ? 'hidden lg:block lg:max-w-none' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {openLeads.length} open · R{pipelineValue.toLocaleString()} pipeline · R{wonValue.toLocaleString()} won
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:border-[#B87333] hover:text-[#B87333] transition-colors bg-white"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={() => {
                    setEditLead(null);
                    setShowEditModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B87333] text-white rounded-lg text-sm font-semibold hover:bg-[#a06428] transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Lead
                </button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => setStageFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B87333]'}`}
              >
                All ({leads.length})
              </button>
              {STAGES.map(stage => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stage)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === stage ? 'bg-[#B87333] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B87333]'}`}
                >
                  {STAGE_LABELS[stage] || stage} ({leads.filter(lead => lead.stage === stage).length})
                </button>
              ))}
            </div>

            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search name, email, phone, book title…"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#B87333] bg-white"
                />
              </div>
              <select
                value={serviceFilter}
                onChange={event => setServiceFilter(event.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#B87333] bg-white text-gray-600"
              >
                <option value="">All Services</option>
                {SERVICE_OPTIONS.map(service => <option key={service} value={service}>{service}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, index) => <div key={index} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
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
                          <tr
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className={`border-b border-gray-100 hover:bg-amber-50/40 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50 border-l-2 border-l-[#B87333]' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900">{contact?.full_name || '—'}</p>
                              <p className="text-xs text-gray-400">{contact?.email || ''}</p>
                              {contact?.phone && <p className="text-xs text-gray-400">{contact.phone}</p>}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {services.length ? services.map(service => (
                                  <span key={service} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{service}</span>
                                )) : <span className="text-xs text-gray-300">—</span>}
                              </div>
                              {contact?.book_title && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[140px]">📖 {contact.book_title}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-600'}`}>
                                {STAGE_LABELS[lead.stage] || lead.stage}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right hidden md:table-cell">
                              <p className="font-semibold text-gray-900">R{Number(lead.estimated_value || 0).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">{lead.probability_percent || 0}% prob</p>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell max-w-[180px]">
                              {lead.next_action ? (
                                <p className={`text-xs truncate ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                                  {isOverdue ? '⚠ ' : ''}{lead.next_action}
                                </p>
                              ) : <span className="text-xs text-gray-300">—</span>}
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

        {selectedLead && (
          <div className="flex-1 max-w-2xl border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#2B2B2B]">Lead Details</h2>
                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AILeadSummary
                lead={selectedLead}
                contact={contactMap[selectedLead.contact_id]}
                submission={submissions.find(submission => submission.email === contactMap[selectedLead.contact_id]?.email)}
                onGenerateSummary={analysis => console.log('AI Analysis:', analysis)}
                onGenerateReply={reply => console.log('AI Reply:', reply)}
              />

              <LeadDetailPanel
                lead={selectedLead}
                contact={contactMap[selectedLead.contact_id]}
                submissions={submissions.filter(submission => {
                  const contact = contactMap[selectedLead.contact_id];
                  return submission.email === contact?.email;
                })}
                onClose={() => setSelectedLead(null)}
                onEdit={() => {
                  setEditLead(selectedLead);
                  setShowEditModal(true);
                }}
                onDelete={handleDelete}
                onStageChange={handleStageChange}
              />
            </div>
          </div>
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
