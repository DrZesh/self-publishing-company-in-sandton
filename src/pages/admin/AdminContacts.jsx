import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Plus, ChevronRight, X, Mail, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PIPELINE_STAGES } from '@/components/pipeline/KanbanBoard';

const LIFECYCLE_COLORS = {
  subscriber: 'bg-blue-100 text-blue-700',
  lead: 'bg-amber-100 text-amber-700',
  customer: 'bg-emerald-100 text-emerald-700',
  repeat_customer: 'bg-[#B87333]/10 text-[#B87333]',
  past_customer: 'bg-black/5 text-black/50',
};

function ContactModal({ contact, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    full_name: contact?.full_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    role: contact?.role || 'author',
    lifecycle_stage: contact?.lifecycle_stage || 'lead',
    city: contact?.city || '',
    province: contact?.province || '',
    website_url: contact?.website_url || '',
    description: contact?.description || '',
    book_title: contact?.book_title || '',
    pipeline_stage: contact?.pipeline_stage || 'Lead Contacted',
    pipeline_value: contact?.pipeline_value || '',
    pipeline_owner: contact?.pipeline_owner || '',
    lost_reason: contact?.lost_reason || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1208]">{contact ? 'Edit Contact' : 'New Contact'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Full Name *</label>
              <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Email *</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="jane@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="+27 82 000 0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Company</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Company name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {['author', 'publisher', 'agent', 'other'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Lifecycle Stage</label>
              <select value={form.lifecycle_stage} onChange={e => setForm(f => ({ ...f, lifecycle_stage: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {['subscriber', 'lead', 'customer', 'repeat_customer', 'past_customer'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">City</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Johannesburg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Province</label>
              <input value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Gauteng" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Website</label>
            <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Book Title</label>
            <input value={form.book_title} onChange={e => setForm(f => ({ ...f, book_title: e.target.value }))}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Title of their book" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Pipeline Stage</label>
              <select value={form.pipeline_stage} onChange={e => setForm(f => ({ ...f, pipeline_stage: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Pipeline Value (R)</label>
              <input type="number" value={form.pipeline_value} onChange={e => setForm(f => ({ ...f, pipeline_value: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Pipeline Owner (email)</label>
            <input value={form.pipeline_owner} onChange={e => setForm(f => ({ ...f, pipeline_owner: e.target.value }))}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="owner@creativebooks.co.za" />
          </div>
          {form.pipeline_stage === 'Lost' && (
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Lost Reason</label>
              <input value={form.lost_reason} onChange={e => setForm(f => ({ ...f, lost_reason: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Why was this deal lost?" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Notes about this contact…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.full_name || !form.email}
              className="flex-1 py-3 bg-[#B87333] text-white rounded-xl font-semibold text-sm hover:bg-[#a06428] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : contact ? 'Save Changes' : 'Create Contact'}
            </button>
            {contact && (
              <button onClick={() => onDelete(contact.id)} className="px-4 py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-semibold">Delete</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalContact, setModalContact] = useState(null);

  useEffect(() => {
    base44.entities.Contact.list('-created_date', 500).then(data => {
      setContacts(data);
      // Auto-open contact if ?id= param is present
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        const found = data.find(c => c.id === id);
        if (found) { setModalContact(found); setShowModal(true); }
      }
    }).finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter(c => {
    if (stageFilter !== 'all' && c.lifecycle_stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSave = async (data) => {
    if (modalContact?.id) {
      await base44.entities.Contact.update(modalContact.id, data);
      setContacts(prev => prev.map(c => c.id === modalContact.id ? { ...c, ...data } : c));
      toast.success('Contact updated');
    } else {
      const created = await base44.entities.Contact.create(data);
      setContacts(prev => [created, ...prev]);
      toast.success('Contact created');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    await base44.entities.Contact.delete(id);
    setContacts(prev => prev.filter(c => c.id !== id));
    setShowModal(false);
    toast.success('Contact deleted');
  };

  const stages = ['subscriber', 'lead', 'customer', 'repeat_customer', 'past_customer'];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1208]">Contacts</h1>
            <p className="text-sm text-black/50 mt-1">{contacts.length} total contacts in CRM</p>
          </div>
          <button onClick={() => { setModalContact(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-colors">
            <Plus className="w-4 h-4" /> New Contact
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-[#1A1208] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
            All ({contacts.length})
          </button>
          {stages.map(s => (
            <button key={s} onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === s ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
              {s.replace(/_/g, ' ')} ({contacts.filter(c => c.lifecycle_stage === s).length})
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or company…"
            className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white" />
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm font-semibold text-black/50">No contacts found</p>
            <p className="text-xs text-black/30 mt-1">Contacts are auto-created from form submissions.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9F7F2] border-b border-black/8">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden sm:table-cell">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden md:table-cell">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden lg:table-cell">Added</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/admin/contacts/detail?id=${c.id}`)}
                    className="border-b border-black/5 hover:bg-[#faf8f4] cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1A1208]">{c.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3 text-black/30" />
                        <span className="text-xs text-black/40 truncate max-w-[180px]">{c.email}</span>
                        {c.phone && <><Phone className="w-3 h-3 text-black/30 ml-1" /><span className="text-xs text-black/40">{c.phone}</span></>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${LIFECYCLE_COLORS[c.lifecycle_stage] || 'bg-black/5 text-black/50'}`}>
                        {c.lifecycle_stage?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-black/60">{c.role || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-black/60">{[c.city, c.province].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-black/40">{new Date(c.created_date).toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-black/20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ContactModal contact={modalContact} onClose={() => setShowModal(false)} onSave={handleSave} onDelete={handleDelete} />
      )}
    </AdminLayout>
  );
}