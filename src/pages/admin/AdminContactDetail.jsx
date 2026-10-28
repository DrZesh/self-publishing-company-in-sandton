import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import ContactEmailThread from '@/components/admin/email/ContactEmailThread';
import CommunicationTimeline from '@/components/admin/contacts/CommunicationTimeline';
import { ArrowLeft, Mail, Phone, Globe, User, Building, MapPin, BookOpen, Edit2, Save, X, Plus, Eye } from 'lucide-react';
import ContactTimeline from '@/components/admin/ContactTimeline';
import WorkflowPanel from '@/components/admin/workflow/WorkflowPanel';
import EmailTrackingPanel from '@/components/admin/contacts/EmailTrackingPanel';
import Contact360Widget from '@/components/admin/contacts/Contact360Widget';
import { toast } from 'sonner';

const TABS = ['Overview', '360° View', 'Workflow', 'Timeline', 'Emails', 'Tracking', 'Notes'];

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

export default function AdminContactDetail() {
  const [params] = useSearchParams();
  const contactId = params.get('id');
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!contactId) { navigate('/admin/contacts'); return; }
    platform.entities.Contact.filter({ id: contactId }).then(data => {
      if (!data.length) { navigate('/admin/contacts'); return; }
      setContact(data[0]);
      setForm(data[0]);
      setNotes(data[0].description || '');
    }).finally(() => setLoading(false));
  }, [contactId]);

  const handleSave = async () => {
    setSaving(true);
    await platform.entities.Contact.update(contact.id, form);
    setContact({ ...contact, ...form });
    setSaving(false);
    setEditing(false);
    toast.success('Contact saved');
  };

  if (loading) return (
    <AdminLayout>
      <div className="space-y-4 max-w-5xl mx-auto">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-black/5 rounded-2xl animate-pulse" />)}
      </div>
    </AdminLayout>
  );

  if (!contact) return null;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate('/admin/contacts')} className="flex items-center gap-2 text-sm text-black/50 hover:text-[#B87333] mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Contacts
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#B87333]/15 flex items-center justify-center text-2xl font-bold text-[#B87333]">
              {contact.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1208]">{contact.full_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {contact.email && <a href={`mailto:${contact.email}`} className="text-sm text-[#B87333] hover:underline">{contact.email}</a>}
                {contact.phone && <span className="text-sm text-black/50">{contact.phone}</span>}
                {contact.lifecycle_stage && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold capitalize">{contact.lifecycle_stage.replace(/_/g, ' ')}</span>
                )}
                {contact.pipeline_stage && (
                  <span className="px-2 py-0.5 bg-[#B87333]/10 text-[#B87333] rounded-full text-xs font-semibold">{contact.pipeline_stage}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { setTab('Emails'); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428]">
              <Mail className="w-4 h-4" /> Email
            </button>
            <button onClick={() => { setTab('Tracking'); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
              <Eye className="w-4 h-4" /> Tracking
            </button>
            <button onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-2 border border-black/15 text-black/60 rounded-xl text-sm font-semibold hover:bg-black/5">
              {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl border border-black/8 p-1.5 w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-[#B87333] text-white' : 'text-black/50 hover:text-black/70'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === '360° View' && <Contact360Widget contactId={contact.id} />}
        {tab === 'Workflow' && <WorkflowPanel contactId={contact.id} onClose={() => setTab('Overview')} />}
        
        {tab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
              <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Contact Info</h2>
                <div>
                  <InfoRow icon={Mail} label="Email" value={contact.email} />
                  <InfoRow icon={Phone} label="Phone" value={contact.phone} />
                  <InfoRow icon={Building} label="Company" value={contact.company} />
                  <InfoRow icon={Globe} label="Website" value={contact.website_url} />
                  <InfoRow icon={User} label="Role" value={contact.role} />
                  <InfoRow icon={MapPin} label="Location" value={[contact.city, contact.province, contact.country].filter(Boolean).join(', ')} />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
              <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Book & Pipeline</h2>
                <div>
                  <InfoRow icon={BookOpen} label="Book Title" value={contact.book_title} />
                  <InfoRow icon={User} label="Lifecycle" value={contact.lifecycle_stage?.replace(/_/g, ' ')} />
                  <InfoRow icon={User} label="Pipeline Stage" value={contact.pipeline_stage} />
                  {contact.pipeline_value && <InfoRow icon={User} label="Deal Value" value={`R ${Number(contact.pipeline_value).toLocaleString('en-ZA')}`} />}
                </div>
            </div>
          </div>
        )}

        {tab === 'Timeline' && (
          <div className="space-y-5">
            <CommunicationTimeline contactId={contact.id} />
            <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
              <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-4">Activity Timeline</h2>
              <ContactTimeline contact={contact} />
            </div>
          </div>
        )}

        {tab === 'Emails' && (
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <ContactEmailThread contact={contact} />
          </div>
        )}

        {tab === 'Tracking' && (
          <EmailTrackingPanel contactId={contact.id} onClose={() => setTab('Overview')} />
        )}

        {tab === 'Notes' && (
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Internal Notes</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
              placeholder="Private notes about this contact…"
              className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] resize-none" />
            <button onClick={async () => {
              await platform.entities.Contact.update(contact.id, { description: notes });
              setContact(c => ({ ...c, description: notes }));
              toast.success('Notes saved');
            }} className="mt-3 px-4 py-2 bg-[#B87333] text-white text-sm rounded-xl font-semibold hover:bg-[#a06428] transition-colors">
              Save Notes
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}