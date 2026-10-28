import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import CsvImportExport from '@/components/admin/CsvImportExport';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Plus, ChevronRight, X, Mail, Phone, ArrowLeft, Edit2, Save, BanIcon, Building2, MapPin, Globe, User, BookOpen, Hash } from 'lucide-react';
import { PIPELINE_STAGES } from '@/components/pipeline/KanbanBoard';
import ContactEmailThread from '@/components/admin/email/ContactEmailThread';
import CommunicationTimeline from '@/components/admin/contacts/CommunicationTimeline';
import ContactTimeline from '@/components/admin/ContactTimeline';
import ClientDocuments from '@/components/admin/clients/ClientDocuments';
import ZohoBooksSync from '@/components/admin/ZohoBooksSync';

const LIFECYCLE_COLORS = {
  subscriber: 'bg-blue-100 text-blue-700',
  lead: 'bg-amber-100 text-amber-700',
  customer: 'bg-emerald-100 text-emerald-700',
  repeat_customer: 'bg-[#B87333]/10 text-[#B87333]',
  past_customer: 'bg-black/5 text-black/50',
};

const inp = "w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]";

function InfoRow({ icon: IconComp, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-black/5 last:border-0">
      <IconComp className="w-4 h-4 text-[#B87333] mt-0.5 shrink-0" />
      <div>
        <div className="text-xs text-black/40 font-semibold">{label}</div>
        <div className="text-sm text-[#1A1208] font-medium">{value}</div>
      </div>
    </div>
  );
}

// ─── Contact/Client Modal ─────────────────────────────────────────────────────
function ContactModal({ contact, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    full_name: contact?.full_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    contact_person: contact?.contact_person || '',
    billing_address: contact?.billing_address || '',
    vat_number: contact?.vat_number || '',
    role: contact?.role || 'author',
    lifecycle_stage: contact?.lifecycle_stage || 'lead',
    city: contact?.city || '',
    province: contact?.province || '',
    website_url: contact?.website_url || '',
    description: contact?.description || '',
    book_title: contact?.book_title || '',
    pipeline_stage: contact?.pipeline_stage || 'New Enquiry',
    pipeline_value: contact?.pipeline_value || '',
    pipeline_owner: contact?.pipeline_owner || '',
    lost_reason: contact?.lost_reason || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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

          {/* Core identity */}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Full Name *</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} className={inp} placeholder="Jane Smith" /></div>
            <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Email *</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} className={inp} placeholder="jane@example.com" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} placeholder="+27 82 000 0000" /></div>
            <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className={inp}>
                {['author','publisher','agent','other'].map(r => <option key={r} value={r}>{r}</option>)}
              </select></div>
          </div>

          {/* Company / billing */}
          <div className="pt-2 border-t border-black/5">
            <p className="text-xs font-bold text-black/30 uppercase tracking-wide mb-3">Company & Billing</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Company</label>
                <input value={form.company} onChange={e => set('company', e.target.value)} className={inp} placeholder="Company name" /></div>
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Contact Person</label>
                <input value={form.contact_person} onChange={e => set('contact_person', e.target.value)} className={inp} placeholder="Accounts dept." /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">VAT Number</label>
                <input value={form.vat_number} onChange={e => set('vat_number', e.target.value)} className={inp} placeholder="4123456789" /></div>
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Lifecycle Stage</label>
                <select value={form.lifecycle_stage} onChange={e => set('lifecycle_stage', e.target.value)} className={inp}>
                  {['subscriber','lead','customer','repeat_customer','past_customer'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select></div>
            </div>
            <div className="mt-4"><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Billing Address</label>
              <textarea value={form.billing_address} onChange={e => set('billing_address', e.target.value)} rows={2}
                className={inp + " resize-none"} placeholder="123 Main Street, Sandton, 2196" /></div>
          </div>

          {/* Location */}
          <div className="pt-2 border-t border-black/5">
            <p className="text-xs font-bold text-black/30 uppercase tracking-wide mb-3">Location</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">City</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} className={inp} placeholder="Johannesburg" /></div>
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Province</label>
                <input value={form.province} onChange={e => set('province', e.target.value)} className={inp} placeholder="Gauteng" /></div>
            </div>
            <div className="mt-4"><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Website</label>
              <input value={form.website_url} onChange={e => set('website_url', e.target.value)} className={inp} placeholder="https://example.com" /></div>
          </div>

          {/* Pipeline */}
          <div className="pt-2 border-t border-black/5">
            <p className="text-xs font-bold text-black/30 uppercase tracking-wide mb-3">Pipeline</p>
          </div>

          {/* Zoho Books Sync */}
          <div className="pt-2 border-t border-black/5">
            <p className="text-xs font-bold text-black/30 uppercase tracking-wide mb-3">Integration</p>
            <ZohoBooksSync entityName="Contact" entityId={contact?.id} entityData={contact} />
          </div>

          <div className="pt-2 border-t border-black/5">
            <p className="text-xs font-bold text-black/30 uppercase tracking-wide mb-3">Pipeline</p>
            <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Book Title</label>
              <input value={form.book_title} onChange={e => set('book_title', e.target.value)} className={inp} placeholder="Title of their book" /></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Pipeline Stage</label>
                <select value={form.pipeline_stage} onChange={e => set('pipeline_stage', e.target.value)} className={inp}>
                  {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Pipeline Value (R)</label>
                <input type="number" value={form.pipeline_value} onChange={e => set('pipeline_value', e.target.value)} className={inp} placeholder="0" /></div>
            </div>
            <div className="mt-4"><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Pipeline Owner (email)</label>
              <input value={form.pipeline_owner} onChange={e => set('pipeline_owner', e.target.value)} className={inp} placeholder="owner@creativebooks.co.za" /></div>
            {form.pipeline_stage === 'Lost' && (
              <div className="mt-4"><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Lost Reason</label>
                <input value={form.lost_reason} onChange={e => set('lost_reason', e.target.value)} className={inp} placeholder="Why was this deal lost?" /></div>
            )}
          </div>

          <div className="pt-2 border-t border-black/5"><label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className={inp + " resize-none"} placeholder="Notes about this contact…" /></div>

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

// ─── Detail View ──────────────────────────────────────────────────────────────
const DETAIL_TABS = ['Overview', 'Finances', 'Timeline', 'Emails', 'Notes'];

function ContactDetail({ contact: initialContact, onBack, onUpdate }) {
  const [contact, setContact] = useState(initialContact);
  const [tab, setTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialContact);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(initialContact.description || '');
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSave = async (data) => {
    setSaving(true);
    await platform.entities.Contact.update(contact.id, data);
    const updated = { ...contact, ...data };
    setContact(updated);
    setForm(updated);
    onUpdate(updated);
    setSaving(false);
    setShowEditModal(false);
    toast.success('Contact saved');
  };

  const handleDisableToggle = async () => {
    const newVal = !contact.is_disabled;
    if (!confirm(`${newVal ? 'Disable' : 'Re-enable'} this contact?`)) return;
    await platform.entities.Contact.update(contact.id, { is_disabled: newVal });
    const updated = { ...contact, is_disabled: newVal };
    setContact(updated);
    onUpdate(updated);
    toast.success(newVal ? 'Contact disabled' : 'Contact re-enabled');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-black/50 hover:text-[#B87333] mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Contacts
      </button>

      {/* Header */}
      <div className={`bg-white rounded-2xl border shadow-sm p-6 mb-5 flex items-start justify-between gap-4 ${contact.is_disabled ? 'border-red-200 bg-red-50/20' : 'border-black/8'}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#B87333]/15 flex items-center justify-center text-2xl font-bold text-[#B87333]">
            {contact.full_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1A1208]">{contact.full_name}</h1>
              {contact.is_disabled && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Disabled</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {contact.email && <a href={`mailto:${contact.email}`} className="text-sm text-[#B87333] hover:underline">{contact.email}</a>}
              {contact.phone && <span className="text-sm text-black/50">{contact.phone}</span>}
              {contact.lifecycle_stage && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${LIFECYCLE_COLORS[contact.lifecycle_stage] || ''}`}>
                  {contact.lifecycle_stage.replace(/_/g, ' ')}
                </span>
              )}
              {contact.pipeline_stage && (
                <span className="px-2 py-0.5 bg-[#B87333]/10 text-[#B87333] rounded-full text-xs font-semibold">{contact.pipeline_stage}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setTab('Emails')} className="flex items-center gap-1.5 px-3 py-2 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428]">
            <Mail className="w-4 h-4" /> Email
          </button>
          <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1.5 px-3 py-2 border border-black/15 text-black/60 rounded-xl text-sm font-semibold hover:bg-black/5">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDisableToggle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${contact.is_disabled ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
            <BanIcon className="w-4 h-4" />
            {contact.is_disabled ? 'Re-enable' : 'Disable'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-black/8 p-1.5 w-fit overflow-x-auto">
        {DETAIL_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${tab === t ? 'bg-[#B87333] text-white' : 'text-black/50 hover:text-black/70'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Contact Info</h2>
            <InfoRow icon={Mail} label="Email" value={contact.email} />
            <InfoRow icon={Phone} label="Phone" value={contact.phone} />
            <InfoRow icon={User} label="Contact Person" value={contact.contact_person} />
            <InfoRow icon={Building2} label="Company" value={contact.company} />
            <InfoRow icon={Hash} label="VAT Number" value={contact.vat_number} />
            <InfoRow icon={Globe} label="Website" value={contact.website_url} />
            <InfoRow icon={User} label="Role" value={contact.role} />
            <InfoRow icon={MapPin} label="Location" value={[contact.city, contact.province, contact.country].filter(Boolean).join(', ')} />
            <InfoRow icon={MapPin} label="Billing Address" value={contact.billing_address} />
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Integration</h2>
            <ZohoBooksSync entityName="Contact" entityId={contact.id} entityData={contact} />
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Book & Pipeline</h2>
            <InfoRow icon={BookOpen} label="Book Title" value={contact.book_title} />
            <InfoRow icon={User} label="Lifecycle" value={contact.lifecycle_stage?.replace(/_/g, ' ')} />
            <InfoRow icon={User} label="Pipeline Stage" value={contact.pipeline_stage} />
            {contact.pipeline_value ? <InfoRow icon={User} label="Deal Value" value={`R ${Number(contact.pipeline_value).toLocaleString('en-ZA')}`} /> : null}
            {contact.description && (
              <div className="mt-3 pt-3 border-t border-black/5">
                <p className="text-xs text-black/40 font-semibold mb-1">Notes</p>
                <p className="text-sm text-black/60 whitespace-pre-wrap">{contact.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Finances */}
      {tab === 'Finances' && <ClientDocuments contactId={contact.id} />}

      {/* Tab: Timeline */}
      {tab === 'Timeline' && (
        <div className="space-y-5">
          <CommunicationTimeline contactId={contact.id} />
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-4">Activity Timeline</h2>
            <ContactTimeline contact={contact} />
          </div>
        </div>
      )}

      {/* Tab: Emails */}
      {tab === 'Emails' && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
          <ContactEmailThread contact={contact} />
        </div>
      )}

      {/* Tab: Notes */}
      {tab === 'Notes' && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
          <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Internal Notes</h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
            placeholder="Private notes about this contact…"
            className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] resize-none" />
          <button onClick={async () => {
            await platform.entities.Contact.update(contact.id, { description: notes });
            setContact(c => ({ ...c, description: notes }));
            onUpdate({ ...contact, description: notes });
            toast.success('Notes saved');
          }} className="mt-3 px-4 py-2 bg-[#B87333] text-white text-sm rounded-xl font-semibold hover:bg-[#a06428] transition-colors">
            Save Notes
          </button>
        </div>
      )}

      {showEditModal && (
        <ContactModal contact={contact} onClose={() => setShowEditModal(false)} onSave={handleSave} onDelete={() => {}} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContact, setModalContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    platform.entities.Contact.list('-created_date', 500).then(data => {
      setContacts(data);
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        const found = data.find(c => c.id === id);
        if (found) setSelectedContact(found);
      }
    }).finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter(c => {
    if (stageFilter !== 'all' && c.lifecycle_stage !== stageFilter) return false;
    if (tagFilter && !(c.tags || []).includes(tagFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.contact_person?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSave = async (data) => {
    if (modalContact?.id) {
      await platform.entities.Contact.update(modalContact.id, data);
      setContacts(prev => prev.map(c => c.id === modalContact.id ? { ...c, ...data } : c));
      toast.success('Contact updated');
    } else {
      const created = await platform.entities.Contact.create(data);
      setContacts(prev => [created, ...prev]);
      toast.success('Contact created');
    }
    setShowModal(false);
    setModalContact(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    await platform.entities.Contact.delete(id);
    setContacts(prev => prev.filter(c => c.id !== id));
    setShowModal(false);
    toast.success('Contact deleted');
  };

  const handleUpdate = (updated) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Collect all unique tags across contacts
  const allTags = [...new Set(contacts.flatMap(c => c.tags || []))].sort();

  const stages = ['subscriber', 'lead', 'customer', 'repeat_customer', 'past_customer'];

  const EXPORT_COLS = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'vat_number', label: 'VAT Number' },
    { key: 'billing_address', label: 'Billing Address' },
    { key: 'role', label: 'Role' },
    { key: 'lifecycle_stage', label: 'Lifecycle Stage' },
    { key: 'city', label: 'City' },
    { key: 'province', label: 'Province' },
    { key: 'book_title', label: 'Book Title' },
    { key: 'pipeline_stage', label: 'Pipeline Stage' },
    { key: 'pipeline_value', label: 'Pipeline Value' },
    { key: 'created_date', label: 'Created Date', render: r => r.created_date ? new Date(r.created_date).toLocaleDateString('en-ZA') : '' },
  ];

  const IMPORT_FIELDS = [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', required: true, type: 'email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'vat_number', label: 'VAT Number' },
    { key: 'billing_address', label: 'Billing Address' },
    { key: 'role', label: 'Role' },
    { key: 'lifecycle_stage', label: 'Lifecycle Stage' },
    { key: 'city', label: 'City' },
    { key: 'province', label: 'Province' },
    { key: 'book_title', label: 'Book Title' },
    { key: 'pipeline_stage', label: 'Pipeline Stage' },
    { key: 'pipeline_value', label: 'Pipeline Value', type: 'number' },
    { key: 'description', label: 'Notes / Description' },
  ];

  const VALID_PIPELINE_STAGES = ['New Enquiry','Information Requested','Quote in Progress','Quote Sent','Payment Pending','Project Started','Editing','Cover Design','Typesetting','Sample Queued','Sample Approved','Mass Production','Completed','Delivered','Lost'];

  const handleImportContacts = async (mappedRows, { dedupeMode } = {}) => {
    let created = 0, updated = 0, failed = 0;
    const errors = [];
    const existing = await platform.entities.Contact.list('-created_date', 1000);
    const byEmail = {};
    existing.forEach(c => { if (c.email) byEmail[c.email.toLowerCase()] = c; });
    for (const row of mappedRows) {
      try {
        const email = (row.email || '').trim().toLowerCase();
        const payload = {
          full_name: (row.full_name || '').trim(),
          email,
          phone: row.phone || '',
          company: row.company || '',
          contact_person: row.contact_person || '',
          vat_number: row.vat_number || '',
          billing_address: row.billing_address || '',
          role: ['author','publisher','agent','other'].includes(row.role) ? row.role : 'author',
          lifecycle_stage: ['subscriber','lead','customer','repeat_customer','past_customer'].includes(row.lifecycle_stage) ? row.lifecycle_stage : 'lead',
          city: row.city || '',
          province: row.province || '',
          book_title: row.book_title || '',
          pipeline_stage: VALID_PIPELINE_STAGES.includes(row.pipeline_stage) ? row.pipeline_stage : 'New Enquiry',
          pipeline_value: row.pipeline_value ? Number(row.pipeline_value) : undefined,
          description: row.description || '',
        };
        const duplicate = email ? byEmail[email] : null;
        if (duplicate && dedupeMode === 'update') {
          await platform.entities.Contact.update(duplicate.id, payload);
          setContacts(prev => prev.map(c => c.id === duplicate.id ? { ...c, ...payload } : c));
          updated++;
        } else if (duplicate && dedupeMode === 'skip') {
          // skip
        } else {
          const contact = await platform.entities.Contact.create(payload);
          setContacts(prev => [contact, ...prev]);
          byEmail[email] = contact;
          created++;
        }
      } catch (err) {
        failed++;
        errors.push({ row: row._idx || '?', reason: err.message || 'Unknown error' });
      }
    }
    return { created, updated, failed, errors };
  };

  // Show detail view
  if (selectedContact) {
    return (
      <AdminLayout>
        <ContactDetail
          contact={selectedContact}
          onBack={() => setSelectedContact(null)}
          onUpdate={handleUpdate}
        />
      </AdminLayout>
    );
  }

  // List view
  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 lg:-m-7 p-6 lg:p-7 relative" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Clients & Contacts</h1>
            <p className="text-sm text-white/50 mt-1">{contacts.length} total contacts in CRM</p>
          </div>
          <div className="flex items-center gap-2">
            <CsvImportExport
              data={filtered}
              exportColumns={EXPORT_COLS}
              exportFilename="contacts.csv"
              importFields={IMPORT_FIELDS}
              onImport={handleImportContacts}
              entityLabel="contacts"
            />
            <button onClick={() => { setModalContact(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-colors">
              <Plus className="w-4 h-4" /> New Contact
            </button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-white text-gray-900' : 'text-white/60'}`}
            style={stageFilter !== 'all' ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' } : {}}>
            All ({contacts.length})
          </button>
          {stages.map(s => (
            <button key={s} onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === s ? 'bg-[#B87333] text-white' : 'text-white/60'}`}
              style={stageFilter !== s ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' } : {}}>
              {s.replace(/_/g, ' ')} ({contacts.filter(c => c.lifecycle_stage === s).length})
            </button>
          ))}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button onClick={() => setTagFilter('')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={!tagFilter ? { background: 'rgba(184,115,51,0.5)', color: '#fff' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              All Tags
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={tagFilter === tag ? { background: 'rgba(184,115,51,0.5)', color: '#fff' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, company or contact person…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none text-white placeholder-white/30"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm font-semibold text-white/50">No contacts found</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide hidden sm:table-cell">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Book Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Pipeline Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide hidden xl:table-cell">Added</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => setSelectedContact(c)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: c.is_disabled ? 0.5 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-white">{c.full_name}</p>
                        {c.is_disabled && <span className="text-xs text-red-400">(disabled)</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3 text-white/30" />
                        <span className="text-xs text-white/40 truncate max-w-[180px]">{c.email}</span>
                        {c.phone && <><Phone className="w-3 h-3 text-white/30 ml-1" /><span className="text-xs text-white/40">{c.phone}</span></>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-white/70">{c.company || '—'}</p>
                      {c.contact_person && <p className="text-xs text-white/40">{c.contact_person}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${LIFECYCLE_COLORS[c.lifecycle_stage] || 'bg-black/5 text-black/50'}`}>
                        {c.lifecycle_stage?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-white/60 truncate max-w-[140px]">{c.book_title || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {c.pipeline_stage && <span className="text-xs text-white/60 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>{c.pipeline_stage}</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-white/60">{[c.city, c.province].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-white/40">{new Date(c.created_date).toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-white/20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {showModal && (
        <ContactModal contact={modalContact} onClose={() => { setShowModal(false); setModalContact(null); }} onSave={handleSave} onDelete={handleDelete} />
      )}
    </AdminLayout>
  );
}