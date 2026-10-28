import { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Mail, Send, Eye, Filter, CheckCircle2, Loader2, Save, FolderOpen, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';

const DRAFTS_KEY = 'cb_bulk_email_drafts';

const LIFECYCLE_STAGES = ['subscriber', 'lead', 'customer', 'repeat_customer', 'past_customer'];
const PIPELINE_STAGES = ['New Enquiry', 'Quote in Progress', 'Quote Sent', 'Payment Pending', 'Project Started', 'Completed'];

const GLASS = {
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
};

export default function AdminBulkEmail() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  const [filters, setFilters] = useState({
    lifecycle_stages: [],
    pipeline_stages: [],
    exclude_unsubscribed: true,
    exclude_do_not_contact: true,
  });

  const [form, setForm] = useState({
    subject: '',
    body_html: '',
    from_name: 'Creative Books SA',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]'); } catch { return []; }
  });

  const saveDraft = () => {
    if (!form.subject.trim()) return toast.error('Add a subject before saving');
    const draft = { ...form, filters, savedAt: new Date().toISOString(), id: Date.now() };
    const updated = [draft, ...drafts].slice(0, 10);
    setDrafts(updated);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    toast.success('Draft saved');
  };

  const loadDraft = (draft) => {
    setForm({ subject: draft.subject, body_html: draft.body_html, from_name: draft.from_name });
    setFilters(draft.filters || filters);
    setShowDrafts(false);
    toast.success('Draft loaded');
  };

  const deleteDraft = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
  };

  const saveCampaign = async (successCount) => {
    try {
      await platform.entities.EmailCampaign.create({
        name: form.subject,
        subject: form.subject,
        body_html: form.body_html,
        status: 'Sent',
        sent_at: new Date().toISOString(),
        total_recipients: filteredContacts.length,
        total_sent: successCount,
        audience_filter: filters,
        from_name: form.from_name,
      });
    } catch { /* non-blocking */ }
  };

  useEffect(() => {
    platform.entities.Contact.list('-created_date', 1000)
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  const filteredContacts = contacts.filter(c => {
    if (filters.exclude_unsubscribed && c.unsubscribed) return false;
    if (filters.exclude_do_not_contact && c.do_not_contact) return false;
    if (filters.lifecycle_stages.length > 0 && !filters.lifecycle_stages.includes(c.lifecycle_stage)) return false;
    if (filters.pipeline_stages.length > 0 && !filters.pipeline_stages.includes(c.pipeline_stage)) return false;
    return !!c.email;
  });

  const toggleFilter = (key, value) => {
    setFilters(f => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const handleSend = async () => {
    if (!form.subject.trim()) return toast.error('Subject is required');
    if (!form.body_html.trim()) return toast.error('Email body is required');
    if (filteredContacts.length === 0) return toast.error('No recipients match your filters');
    if (!confirm(`Send to ${filteredContacts.length} contacts?`)) return;

    setSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const contact of filteredContacts) {
      try {
        await platform.functions.invoke('sendBrandedEmail', {
          to: contact.email,
          subject: form.subject,
          body_html: form.body_html.replace(/{{name}}/g, contact.full_name || 'there'),
          from_name: form.from_name,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSending(false);
    setSent({ success: successCount, fail: failCount });
    toast.success(`Sent to ${successCount} contacts${failCount > 0 ? `, ${failCount} failed` : ''}`);
    await saveCampaign(successCount);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">Bulk Email Blast</h1>
              <p className="text-sm text-white/60 mt-0.5">Send targeted emails to filtered contact segments</p>
            </div>
            <div className="flex gap-2">
              <button onClick={saveDraft}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button onClick={() => setShowDrafts(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: showDrafts ? 'rgba(184,115,51,0.3)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <History className="w-4 h-4" /> Drafts ({drafts.length})
              </button>
            </div>
          </div>

          {/* Drafts panel */}
          {showDrafts && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-2">Saved Drafts</p>
              {drafts.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-3">No saved drafts yet</p>
              ) : drafts.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{d.subject || 'Untitled'}</p>
                    <p className="text-xs text-white/40">{new Date(d.savedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button onClick={() => loadDraft(d)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'rgba(184,115,51,0.4)' }}>
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteDraft(d.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Filters */}
            <div className="space-y-4">
              <div className="rounded-2xl p-4 space-y-4" style={GLASS}>
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-bold text-white">Audience Filters</span>
                </div>

                {/* Recipient count */}
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-3xl font-bold text-white">{loading ? '—' : filteredContacts.length}</p>
                  <p className="text-xs text-white/50 mt-0.5">recipients</p>
                </div>

                {/* Lifecycle stages */}
                <div>
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Lifecycle Stage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LIFECYCLE_STAGES.map(s => (
                      <button key={s} onClick={() => toggleFilter('lifecycle_stages', s)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize"
                        style={filters.lifecycle_stages.includes(s)
                          ? { background: 'linear-gradient(135deg,#ec4899,#f97316)', color: '#fff' }
                          : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pipeline stages */}
                <div>
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Pipeline Stage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PIPELINE_STAGES.map(s => (
                      <button key={s} onClick={() => toggleFilter('pipeline_stages', s)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={filters.pipeline_stages.includes(s)
                          ? { background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff' }
                          : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div className="space-y-2">
                  {[
                    { key: 'exclude_unsubscribed', label: 'Exclude unsubscribed' },
                    { key: 'exclude_do_not_contact', label: 'Exclude Do Not Contact' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filters[opt.key]}
                        onChange={e => setFilters(f => ({ ...f, [opt.key]: e.target.checked }))}
                        className="rounded accent-[#B87333]" />
                      <span className="text-xs text-white/70">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recipient preview */}
              {filteredContacts.length > 0 && (
                <div className="rounded-2xl p-4" style={GLASS}>
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Preview Recipients</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {filteredContacts.slice(0, 15).map(c => (
                      <div key={c.id} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: 'rgba(184,115,51,0.5)' }}>
                          {(c.full_name || c.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white truncate">{c.full_name}</p>
                          <p className="text-[10px] text-white/40 truncate">{c.email}</p>
                        </div>
                      </div>
                    ))}
                    {filteredContacts.length > 15 && (
                      <p className="text-xs text-white/30 text-center pt-1">+{filteredContacts.length - 15} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Compose */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl p-5 space-y-4" style={GLASS}>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-bold text-white">Compose Email</span>
                  <span className="text-xs text-white/40 ml-1">Use {'{{name}}'} for personalisation</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">From Name</label>
                  <input value={form.from_name} onChange={e => setForm(f => ({ ...f, from_name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Subject *</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Your email subject line…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Body (HTML or plain text) *</label>
                  <textarea value={form.body_html} onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))}
                    rows={10} placeholder="<p>Hi {{name}},</p><p>Your message here...</p>"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 font-mono resize-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowPreview(v => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                  <button onClick={handleSend} disabled={sending || filteredContacts.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #B87333, #D4A574)', boxShadow: '0 4px 20px rgba(184,115,51,0.4)' }}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? `Sending… (${filteredContacts.length})` : `Send to ${filteredContacts.length} Contacts`}
                  </button>
                </div>
              </div>

              {/* Preview panel */}
              {showPreview && form.body_html && (
                <div className="rounded-2xl overflow-hidden" style={GLASS}>
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Email Preview</p>
                  </div>
                  <div className="bg-white p-4 rounded-b-2xl">
                    <div dangerouslySetInnerHTML={{ __html: form.body_html.replace(/{{name}}/g, 'Test User') }} className="text-sm text-gray-800" />
                  </div>
                </div>
              )}

              {/* Sent result */}
              {sent && (
                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ ...GLASS, borderColor: 'rgba(16,185,129,0.3)' }}>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">Blast complete</p>
                    <p className="text-xs text-white/60">{sent.success} sent successfully{sent.fail > 0 ? `, ${sent.fail} failed` : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}