import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TemplateModal from '@/components/messaging/TemplateModal';
import {
  MessageSquare, Mail, Plus, Edit2, Copy, Trash2, Power, RotateCcw,
  Send, Eye, Filter, CheckCircle, XCircle, Clock, AlertTriangle,
  RefreshCw, Loader2, Settings, Search
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const TABS = [
  { key: 'email_templates', label: 'Email Templates', icon: Mail },
  { key: 'whatsapp_templates', label: 'WhatsApp Templates', icon: MessageSquare },
  { key: 'sent', label: 'Sent Messages', icon: CheckCircle },
  { key: 'logs', label: 'Message Logs', icon: Filter },
  { key: 'failed', label: 'Failed Messages', icon: XCircle },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const CAT_COLORS = {
  welcome: 'bg-green-100 text-green-700',
  stage_update: 'bg-blue-100 text-blue-700',
  payment: 'bg-amber-100 text-amber-700',
  proof: 'bg-purple-100 text-purple-700',
  completion: 'bg-emerald-100 text-emerald-700',
  reminder: 'bg-orange-100 text-orange-700',
  general: 'bg-gray-100 text-gray-600',
};

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
    queryFn: () => base44.entities.MessageTemplate.filter({ channel }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['message-templates', channel] });

  const filtered = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const toggleActive = async (t) => {
    await base44.entities.MessageTemplate.update(t.id, { is_active: !t.is_active });
    invalidate();
    toast.success(t.is_active ? 'Template deactivated' : 'Template activated');
  };

  const duplicate = async (t) => {
    const { id, created_date, updated_date, created_by, ...data } = t;
    await base44.entities.MessageTemplate.create({ ...data, name: `${t.name} (Copy)`, is_default: false });
    invalidate();
    toast.success('Template duplicated');
  };

  const restoreDefault = async (t) => {
    if (!t.default_content_html) { toast.error('No original content saved'); return; }
    await base44.entities.MessageTemplate.update(t.id, { content_html: t.default_content_html });
    invalidate();
    toast.success('Template restored to default');
  };

  const deleteTemplate = async (t) => {
    if (t.is_default) { toast.error('Default templates cannot be deleted'); return; }
    if (!confirm(`Delete "${t.name}"?`)) return;
    await base44.entities.MessageTemplate.delete(t.id);
    invalidate();
    toast.success('Template deleted');
  };

  const handlePreview = async (t) => {
    setPreviewId(t.id);
    const res = await base44.functions.invoke('renderTemplate', { templateId: t.id, preview: true });
    setPreviewId(null);
    if (res.data?.rendered_body) setPreviewHtml(res.data.rendered_body);
    else toast.error(res.data?.error || 'Preview failed');
  };

  const handleTestSend = async (t) => {
    const email = testEmailMap[t.id];
    if (!email) { toast.error('Enter a test email first'); return; }
    setTestingId(t.id);
    const res = await base44.functions.invoke('renderTemplate', { templateId: t.id, preview: true, testSendTo: email });
    setTestingId(null);
    if (res.data?.success) toast.success(`Test sent to ${email}`);
    else toast.error(res.data?.error || 'Send failed');
  };

  return (
    <div className="space-y-4">
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-auto p-6">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Email Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewHtml('')}>✕</Button>
            </div>
            <iframe srcDoc={previewHtml} className="w-full border-0" style={{ height: '75vh' }} title="Preview" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="pl-9" />
        </div>
        <Button onClick={() => { setEditTemplate(null); setShowModal(true); }} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {channel} templates yet</p>
          <p className="text-sm mt-1">Create your first template to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className={`bg-white rounded-xl border p-4 transition-all ${t.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm">{t.name}</h3>
                    {t.is_default && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">Default</span>}
                    {!t.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                    {t.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[t.category] || CAT_COLORS.general}`}>
                        {t.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  {t.subject && <p className="text-xs text-gray-500 mt-0.5 truncate">Subject: {t.subject}</p>}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => { setEditTemplate(t); setShowModal(true); }}>
                    <Edit2 className="w-3 h-3" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => handlePreview(t)} disabled={previewId === t.id}>
                    {previewId === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />} Preview
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => duplicate(t)}>
                    <Copy className="w-3 h-3" /> Duplicate
                  </Button>
                  {t.is_default && (
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => restoreDefault(t)}>
                      <RotateCcw className="w-3 h-3" /> Restore
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className={`h-7 gap-1 text-xs ${t.is_active ? 'text-amber-600' : 'text-green-600'}`} onClick={() => toggleActive(t)}>
                    <Power className="w-3 h-3" /> {t.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  {!t.is_default && (
                    <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-600" onClick={() => deleteTemplate(t)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick test send row */}
              {channel === 'email' && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                  <Input
                    type="email"
                    placeholder="test@email.com"
                    value={testEmailMap[t.id] || ''}
                    onChange={e => setTestEmailMap(m => ({ ...m, [t.id]: e.target.value }))}
                    className="flex-1 h-7 text-xs"
                  />
                  <Button size="sm" className="h-7 gap-1 text-xs bg-[#B87333] hover:bg-[#A06828] text-white" onClick={() => handleTestSend(t)} disabled={testingId === t.id}>
                    {testingId === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Send Test
                  </Button>
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
      const all = await base44.entities.MessageLog.list('-sent_at', 200);
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client, email, subject..." className="pl-9" />
        </div>
        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="all">All Channels</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No messages {filter === 'failed' ? 'failed' : filter === 'sent' ? 'sent' : 'logged'} yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Channel</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Subject / Template</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Trigger</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Sent At</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <p className="font-medium text-gray-900">{log.client_name || log.recipient}</p>
                    <p className="text-xs text-gray-400">{log.project_name || ''}</p>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.channel === 'email' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {log.channel}
                    </span>
                  </td>
                  <td className="py-2 px-3 max-w-xs">
                    <p className="truncate text-gray-900">{log.subject || log.template_used}</p>
                    <p className="text-xs text-gray-400 truncate">{log.template_used}</p>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-xs text-gray-500 capitalize">{(log.trigger || log.triggered_by || '—').replace('_', ' ')}</span>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
                    {log.sent_at ? format(new Date(log.sent_at), 'dd MMM yy HH:mm') : '—'}
                  </td>
                  <td className="py-2 px-3">
                    {log.success ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Sent
                      </span>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
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
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Communication Settings</h3>
        <div className="space-y-3">
          <Link to="/admin/email-settings" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#B87333]" />
              <div>
                <p className="font-medium text-sm text-gray-900">Email Settings</p>
                <p className="text-xs text-gray-500">Configure Resend, sender name, test email</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
          <Link to="/admin/automations" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-[#B87333]" />
              <div>
                <p className="font-medium text-sm text-gray-900">Automation Centre</p>
                <p className="text-xs text-gray-500">Rules, triggers, approval queue, engine</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">POPIA Compliance</p>
        <p className="text-xs text-amber-700">Every automated email includes an unsubscribe link. Clients marked as <strong>Do Not Contact</strong> or <strong>Unsubscribed</strong> are automatically skipped by the automation engine.</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminMessageCentre() {
  const [activeTab, setActiveTab] = useState('email_templates');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#B87333]" /> Message Centre
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage templates, review communication history, and configure messaging settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-[#B87333] text-[#B87333]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
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
    </AdminLayout>
  );
}