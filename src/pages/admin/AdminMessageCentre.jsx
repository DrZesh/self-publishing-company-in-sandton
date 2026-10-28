import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import TemplateModal from '@/components/messaging/TemplateModal';
import {
  MessageSquare, Mail, Plus, Edit2, Copy, Trash2, Power, RotateCcw,
  Send, Eye, Filter, CheckCircle, XCircle, Clock, AlertTriangle,
  RefreshCw, Loader2, Settings, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const GLASS = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
};

const GLASS_CARD = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const TABS = [
  { key: 'email_templates', label: 'Email Templates', icon: Mail },
  { key: 'whatsapp_templates', label: 'WhatsApp Templates', icon: MessageSquare },
  { key: 'sent', label: 'Sent Messages', icon: CheckCircle },
  { key: 'logs', label: 'Message Logs', icon: Filter },
  { key: 'failed', label: 'Failed Messages', icon: XCircle },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const CAT_COLORS = {
  welcome: 'bg-emerald-500/20 text-emerald-300',
  stage_update: 'bg-blue-500/20 text-blue-300',
  payment: 'bg-amber-500/20 text-amber-300',
  proof: 'bg-purple-500/20 text-purple-300',
  completion: 'bg-teal-500/20 text-teal-300',
  reminder: 'bg-orange-500/20 text-orange-300',
  general: 'bg-white/10 text-white/60',
};

const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 bg-white/10 border border-white/15";

// ─── Templates Tab ────────────────────────────────────────────────────────────
function TemplatesTab({ channel }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editTemplate, setEditTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testEmailMap, setTestEmailMap] = useState({});
  const [testingId, setTestingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['message-templates', channel],
    queryFn: () => platform.entities.MessageTemplate.filter({ channel }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['message-templates', channel] });

  const filtered = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const toggleActive = async (t) => {
    await platform.entities.MessageTemplate.update(t.id, { is_active: !t.is_active });
    invalidate();
    toast.success(t.is_active ? 'Template deactivated' : 'Template activated');
  };

  const duplicate = async (t) => {
    const { id, created_date, updated_date, created_by, ...data } = t;
    await platform.entities.MessageTemplate.create({ ...data, name: `${t.name} (Copy)`, is_default: false });
    invalidate();
    toast.success('Template duplicated');
  };

  const restoreDefault = async (t) => {
    if (!t.default_content_html) { toast.error('No original content saved'); return; }
    await platform.entities.MessageTemplate.update(t.id, { content_html: t.default_content_html });
    invalidate();
    toast.success('Template restored to default');
  };

  const deleteTemplate = async (t) => {
    if (t.is_default) { toast.error('Default templates cannot be deleted'); return; }
    if (!confirm(`Delete "${t.name}"?`)) return;
    await platform.entities.MessageTemplate.delete(t.id);
    invalidate();
    toast.success('Template deleted');
  };

  const handlePreview = async (t) => {
    setPreviewId(t.id);
    const res = await platform.functions.invoke('renderTemplate', { templateId: t.id, preview: true });
    setPreviewId(null);
    if (res.data?.rendered_body) setPreviewHtml(res.data.rendered_body);
    else toast.error(res.data?.error || 'Preview failed');
  };

  const handleTestSend = async (t) => {
    const email = testEmailMap[t.id];
    if (!email) { toast.error('Enter a test email first'); return; }
    setTestingId(t.id);
    const res = await platform.functions.invoke('renderTemplate', { templateId: t.id, preview: true, testSendTo: email });
    setTestingId(null);
    if (res.data?.success) toast.success(`Test sent to ${email}`);
    else toast.error(res.data?.error || 'Send failed');
  };

  return (
    <div className="space-y-4">
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-auto p-6">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Email Preview</h3>
              <button onClick={() => setPreviewHtml('')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
            </div>
            <iframe srcDoc={previewHtml} className="w-full border-0" style={{ height: '75vh' }} title="Preview" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
            className={inputCls + " pl-9"} />
        </div>
        <button onClick={() => { setEditTemplate(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #B87333, #D4A574)', boxShadow: '0 4px 16px rgba(184,115,51,0.4)' }}>
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white/60">No {channel} templates yet</p>
          <p className="text-sm mt-1">Create your first template to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="rounded-xl p-4 transition-all" style={{ ...GLASS_CARD, opacity: t.is_active ? 1 : 0.55 }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">{t.name}</h3>
                    {t.is_default && <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/20 px-2 py-0.5 rounded-full">Default</span>}
                    {!t.is_active && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">Inactive</span>}
                    {t.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[t.category] || CAT_COLORS.general}`}>
                        {t.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  {t.subject && <p className="text-xs text-white/50 mt-0.5 truncate">Subject: {t.subject}</p>}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                  {[
                    { label: 'Edit', icon: Edit2, onClick: () => { setEditTemplate(t); setShowModal(true); } },
                    { label: 'Preview', icon: previewId === t.id ? Loader2 : Eye, onClick: () => handlePreview(t), spin: previewId === t.id },
                    { label: 'Duplicate', icon: Copy, onClick: () => duplicate(t) },
                    ...(t.is_default ? [{ label: 'Restore', icon: RotateCcw, onClick: () => restoreDefault(t) }] : []),
                  ].map(({ label, icon: Icon, onClick, spin }) => (
                    <button key={label} onClick={onClick}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">
                      <Icon className={`w-3 h-3 ${spin ? 'animate-spin' : ''}`} /> {label}
                    </button>
                  ))}
                  <button onClick={() => toggleActive(t)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${t.is_active ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
                    <Power className="w-3 h-3" /> {t.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  {!t.is_default && (
                    <button onClick={() => deleteTemplate(t)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {channel === 'email' && (
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                  <input
                    type="email"
                    placeholder="test@email.com"
                    value={testEmailMap[t.id] || ''}
                    onChange={e => setTestEmailMap(m => ({ ...m, [t.id]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white placeholder-white/30 bg-white/10 border border-white/15 focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                  <button onClick={() => handleTestSend(t)} disabled={testingId === t.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-all"
                    style={{ background: 'rgba(184,115,51,0.5)', border: '1px solid rgba(184,115,51,0.4)' }}>
                    {testingId === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Send Test
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TemplateModal
          template={editTemplate}
          onClose={() => { setShowModal(false); setEditTemplate(null); }}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab({ filter }) {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['message-logs', filter],
    queryFn: async () => {
      const all = await platform.entities.MessageLog.list('-sent_at', 200);
      if (filter === 'sent') return all.filter(l => l.success);
      if (filter === 'failed') return all.filter(l => !l.success);
      return all;
    },
  });

  const filtered = logs.filter(l => {
    if (channelFilter !== 'all' && l.channel !== channelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (l.client_name || '').toLowerCase().includes(q) ||
        (l.recipient || '').toLowerCase().includes(q) ||
        (l.subject || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client, email, subject..."
            className={inputCls + " pl-9"} />
        </div>
        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm text-white bg-white/10 border border-white/15 focus:outline-none">
          <option value="all" className="bg-gray-900">All Channels</option>
          <option value="email" className="bg-gray-900">Email</option>
          <option value="whatsapp" className="bg-gray-900">WhatsApp</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-white/20" />
          <p className="font-medium text-white/60">No messages {filter === 'failed' ? 'failed' : filter === 'sent' ? 'sent' : 'logged'} yet</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={GLASS}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Client', 'Channel', 'Subject / Template', 'Trigger', 'Sent At', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{log.client_name || log.recipient}</p>
                    <p className="text-xs text-white/40">{log.project_name || ''}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.channel === 'email' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {log.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="truncate text-white/80">{log.subject || log.template_used}</p>
                    <p className="text-xs text-white/40 truncate">{log.template_used}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-white/50 capitalize">{(log.trigger || log.triggered_by || '—').replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-white/50 whitespace-nowrap">
                    {log.sent_at ? format(new Date(log.sent_at), 'dd MMM yy HH:mm') : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {log.success ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Sent
                      </span>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs text-red-300 bg-red-500/15 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                        {log.error_message && <p className="text-xs text-red-400 mt-0.5 max-w-[150px] truncate">{log.error_message}</p>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="rounded-xl p-5 space-y-3" style={GLASS_CARD}>
        <h3 className="font-semibold text-white mb-1">Communication Settings</h3>
        {[
          { to: '/admin/email-settings', icon: Mail, label: 'Email Settings', desc: 'Configure Resend, sender name, test email' },
          { to: '/admin/automations', icon: RefreshCw, label: 'Automation Centre', desc: 'Rules, triggers, approval queue, engine' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to}
            className="flex items-center justify-between p-3 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184,115,51,0.2)' }}>
                <Icon className="w-4 h-4 text-[#D4A574]" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">{label}</p>
                <p className="text-xs text-white/50">{desc}</p>
              </div>
            </div>
            <span className="text-white/30">→</span>
          </Link>
        ))}
      </div>
      <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <p className="text-sm font-semibold text-amber-300 mb-1">POPIA Compliance</p>
        <p className="text-xs text-amber-200/80">Every automated email includes an unsubscribe link. Clients marked as <strong>Do Not Contact</strong> or <strong>Unsubscribed</strong> are automatically skipped by the automation engine.</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminMessageCentre() {
  const [activeTab, setActiveTab] = useState('email_templates');

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 lg:-m-7 p-6 lg:p-7 relative"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(20,30,80,0.85) 0%, rgba(60,20,80,0.80) 50%, rgba(10,40,80,0.85) 100%)' }} />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#D4A574]" /> Message Centre
            </h1>
            <p className="text-sm text-white/60 mt-0.5">Manage templates, review communication history, and configure messaging settings</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-2xl p-1.5" style={GLASS}>
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-xl transition-all"
                style={activeTab === key
                  ? { background: 'linear-gradient(135deg, #B87333, #D4A574)', color: '#fff', boxShadow: '0 4px 12px rgba(184,115,51,0.35)' }
                  : { color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => { if (activeTab !== key) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (activeTab !== key) e.currentTarget.style.background = ''; }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'email_templates' && <TemplatesTab channel="email" />}
            {activeTab === 'whatsapp_templates' && <TemplatesTab channel="whatsapp" />}
            {activeTab === 'sent' && <LogsTab filter="sent" />}
            {activeTab === 'logs' && <LogsTab filter="all" />}
            {activeTab === 'failed' && <LogsTab filter="failed" />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}