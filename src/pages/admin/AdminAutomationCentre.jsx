import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RuleModal from '@/components/automation/RuleModal';
import {
  Zap, Plus, Edit2, Trash2, Power, CheckCircle,
  XCircle, Clock, AlertTriangle, Loader2, BarChart3, Settings,
  Send, Search, Eye, GitBranch, FileText, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'workflow', label: 'Workflow Status', icon: GitBranch },
  { key: 'rules', label: 'Automation Rules', icon: Zap },
  { key: 'approval', label: 'Approval Queue', icon: Clock },
  { key: 'logs', label: 'Logs', icon: FileText },
  { key: 'projects', label: 'Project Controls', icon: Settings },
];

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const { data: rules = [] } = useQuery({ queryKey: ['auto-rules'], queryFn: () => platform.entities.AutomationRule.list() });
  const { data: logs = [] } = useQuery({ queryKey: ['msg-logs-all'], queryFn: () => platform.entities.MessageLog.list('-sent_at', 100) });
  const { data: queue = [] } = useQuery({ queryKey: ['msg-queue'], queryFn: () => platform.entities.MessageQueue.list('-created_date', 50) });

  const today = new Date().toISOString().slice(0, 10);
  const sentToday = logs.filter(l => l.success && l.sent_at?.slice(0, 10) === today).length;
  const failed = logs.filter(l => !l.success).length;
  const pending = queue.filter(q => q.status === 'pending_approval').length;
  const activeRules = rules.filter(r => r.is_active).length;

  const stats = [
    { label: 'Active Rules', value: activeRules, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Sent Today', value: sentToday, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Approval', value: pending, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Failed Messages', value: failed, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {logs.slice(0, 10).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No messages sent yet</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-center gap-3 text-sm py-1.5 border-b last:border-0">
                {log.success
                  ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                <span className="flex-1 text-gray-700 truncate">{log.client_name || log.recipient} — {log.template_used}</span>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {log.sent_at ? format(new Date(log.sent_at), 'dd MMM HH:mm') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rules Tab ─────────────────────────────────────────────────────────────────
function RulesTab() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['auto-rules'],
    queryFn: () => platform.entities.AutomationRule.list('-created_date', 100),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['auto-rules'] });

  const toggle = async (r) => {
    await platform.entities.AutomationRule.update(r.id, { is_active: !r.is_active });
    invalidate();
    toast.success(r.is_active ? 'Rule deactivated' : 'Rule activated');
  };

  const deleteRule = async (r) => {
    if (!confirm(`Delete rule "${r.name}"?`)) return;
    await platform.entities.AutomationRule.delete(r.id);
    invalidate();
    toast.success('Rule deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditRule(null); setShowModal(true); }} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
          <Plus className="w-4 h-4" /> New Rule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No automation rules yet</p>
          <p className="text-sm mt-1">Create a rule to automate client communication</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(r => (
            <div key={r.id} className={`bg-white rounded-xl border p-4 ${r.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm">{r.name}</h3>
                    {!r.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                    {r.requires_approval && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Needs Approval</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    WHEN <strong>{r.trigger?.replace(/_/g, ' ')}</strong>
                    {r.trigger_stage ? ` → ${r.trigger_stage}` : ''}
                    {' '}→ THEN <strong>{r.action?.replace(/_/g, ' ')}</strong>
                    {r.template_name ? ` using "${r.template_name}"` : ''}
                  </p>
                  {r.last_run_at && (
                    <p className="text-xs text-gray-400 mt-0.5">Last run: {format(new Date(r.last_run_at), 'dd MMM yy HH:mm')} · {r.run_count || 0} times</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => { setEditRule(r); setShowModal(true); }}>
                    <Edit2 className="w-3 h-3" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className={`h-7 text-xs ${r.is_active ? 'text-amber-600' : 'text-green-600'}`} onClick={() => toggle(r)}>
                    <Power className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-600" onClick={() => deleteRule(r)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RuleModal
          rule={editRule}
          onClose={() => { setShowModal(false); setEditRule(null); }}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}

// ── Approval Queue Tab ─────────────────────────────────────────────────────────
function ApprovalTab() {
  const queryClient = useQueryClient();
  const [previewItem, setPreviewItem] = useState(null);
  const [processing, setProcessing] = useState(null);

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['msg-queue-pending'],
    queryFn: () => platform.entities.MessageQueue.filter({ status: 'pending_approval' }),
  });

  const approve = async (item) => {
    setProcessing(item.id);
    // Send the message
    const cfg = await platform.entities.AppSettings.filter({ setting_key: 'email_settings' }).then(r => r[0] || {});
    const resendKey = 'configured'; // will use sendBrandedEmail function
    const res = await platform.functions.invoke('sendBrandedEmail', {
      to: item.recipient,
      subject: item.rendered_subject,
      htmlBody: item.rendered_body,
      skipBranding: true, // already has branded shell from queue time
    });
    if (res.data?.success) {
      await platform.entities.MessageQueue.update(item.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        approved_by: 'admin',
        approved_at: new Date().toISOString(),
      });
      await platform.entities.MessageLog.create({
        client_id: item.client_id,
        project_id: item.project_id,
        channel: item.channel,
        template_used: item.template_name,
        template_id: item.template_id,
        recipient: item.recipient,
        subject: item.rendered_subject,
        body: item.rendered_body,
        trigger: item.trigger_event,
        action_taken: 'send_email',
        sent_at: new Date().toISOString(),
        success: true,
        triggered_by: 'admin',
        dedup_key: item.dedup_key,
        client_name: item.client_name,
        project_name: item.project_name,
      });
      toast.success(`Sent to ${item.recipient}`);
    } else {
      await platform.entities.MessageQueue.update(item.id, { status: 'failed', last_error: res.data?.error });
      toast.error(res.data?.error || 'Send failed');
    }
    setProcessing(null);
    queryClient.invalidateQueries({ queryKey: ['msg-queue-pending'] });
  };

  const reject = async (item) => {
    await platform.entities.MessageQueue.update(item.id, { status: 'cancelled' });
    queryClient.invalidateQueries({ queryKey: ['msg-queue-pending'] });
    toast.success('Message cancelled');
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No messages awaiting approval</p>
        </div>
      ) : (
        <>
          {queue.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-amber-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{item.client_name || item.recipient}</p>
                  <p className="text-xs text-gray-500">{item.project_name} · {item.channel}</p>
                  <p className="text-xs text-gray-700 mt-1 font-medium">Subject: {item.rendered_subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Trigger: {item.trigger_event?.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setPreviewItem(item)}>
                    <Eye className="w-3 h-3" /> Preview
                  </Button>
                  <Button size="sm" className="h-7 gap-1 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => approve(item)} disabled={processing === item.id}>
                    {processing === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Approve
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 border-red-200" onClick={() => reject(item)}>
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {previewItem && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-auto p-6">
              <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Preview — {previewItem.rendered_subject}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>Close</Button>
                </div>
                <iframe srcDoc={previewItem.rendered_body} className="w-full border-0" style={{ height: '75vh' }} title="Preview" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Project Controls Tab ──────────────────────────────────────────────────────
function ProjectControlsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects-automation'],
    queryFn: () => platform.entities.Project.list('-updated_date', 200),
  });

  const filtered = projects.filter(p =>
    !search || (p.book_title || '').toLowerCase().includes(search.toLowerCase())
  );

  const update = async (id, data) => {
    await platform.entities.Project.update(id, data);
    queryClient.invalidateQueries({ queryKey: ['projects-automation'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Auto Updates</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Paused</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Last Sent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">{p.book_title || '—'}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">{p.stage || '—'}</td>
                  <td className="py-2 px-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => update(p.id, { automation_enabled: !p.automation_enabled })}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${p.automation_enabled ? 'bg-[#B87333]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${p.automation_enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-xs text-gray-600">{p.automation_enabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </td>
                  <td className="py-2 px-3">
                    {p.automation_enabled && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => update(p.id, { updates_paused: !p.updates_paused })}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${p.updates_paused ? 'bg-amber-400' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${p.updates_paused ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-xs text-gray-600">{p.updates_paused ? 'Paused' : 'Running'}</span>
                      </label>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-400">
                    {p.last_update_sent_at ? format(new Date(p.last_update_sent_at), 'dd MMM HH:mm') : 'Never'}
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

// ── Workflow Status Tab ───────────────────────────────────────────────────────
function WorkflowStatusTab() {
  const [search, setSearch] = useState('');
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['workflow-invoices'],
    queryFn: () => platform.entities.Invoice.list('-created_date', 100),
  });

  const filtered = invoices.filter(inv =>
    !search || (inv.contact_snapshot?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.invoice_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const stateColor = (state) => {
    const map = {
      'Invoice Generated': 'bg-blue-50 text-blue-700',
      'Invoice Sent': 'bg-indigo-50 text-indigo-700',
      'Awaiting Admin Confirmation': 'bg-amber-50 text-amber-700',
      'Admin Confirmed': 'bg-purple-50 text-purple-700',
      'NDA Sent': 'bg-orange-50 text-orange-700',
      'Portal Login Sent': 'bg-green-50 text-green-700',
      'Project Active': 'bg-emerald-50 text-emerald-700',
    };
    return map[state] || 'bg-gray-50 text-gray-600';
  };

  const getBlockedReason = (inv) => {
    if (!inv.invoice_email_sent) return 'Invoice email not sent yet';
    if (!inv.invoice_confirmed_by_admin) return 'Awaiting admin confirmation — click "Confirm Invoice and Continue"';
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client or invoice..." className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No invoices found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => {
            const blocked = getBlockedReason(inv);
            return (
              <div key={inv.id} className={`bg-white rounded-xl border p-4 ${blocked ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{inv.contact_snapshot?.full_name || '—'}</p>
                      <span className="text-xs text-gray-400">{inv.invoice_number}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stateColor(inv.automation_state)}`}>
                        {inv.automation_state || 'Invoice Generated'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${inv.invoice_confirmed_by_admin ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        Admin: {inv.invoice_confirmed_by_admin ? '✓ Confirmed' : 'Pending'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${inv.nda_sent ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                        NDA: {inv.nda_sent ? (inv.nda_signed ? '✓ Signed' : 'Sent') : 'Not sent'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${inv.portal_login_sent ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        Portal: {inv.portal_login_sent ? '✓ Sent' : 'Not sent'}
                      </span>
                    </div>
                    {blocked && (
                      <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {blocked}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#B87333]">R {Number(inv.total||0).toLocaleString('en-ZA',{minimumFractionDigits:2})}</p>
                    <p className="text-xs text-gray-400">{inv.created_date ? format(new Date(inv.created_date), 'dd MMM yy') : ''}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Logs Tab ──────────────────────────────────────────────────────────────────
function LogsTab() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['msg-logs-tab', filter],
    queryFn: () => filter === 'failed'
      ? platform.entities.MessageLog.filter({ success: false })
      : platform.entities.MessageLog.list('-sent_at', 200),
  });

  const retryLog = async (log) => {
    if (!log.recipient || !log.subject) { toast.error('Cannot retry — missing recipient or subject'); return; }
    const res = await platform.functions.invoke('sendBrandedEmail', {
      to: log.recipient,
      subject: log.subject,
      htmlBody: log.body,
      skipBranding: true,
    });
    if (res.data?.success) {
      toast.success('Email resent successfully');
      queryClient.invalidateQueries({ queryKey: ['msg-logs-tab'] });
    } else {
      toast.error(res.data?.error || 'Resend failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'failed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${filter === f ? 'bg-[#B87333] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? 'All Logs' : 'Failed Only'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className={`bg-white rounded-xl border p-3 flex items-start gap-3 ${!log.success ? 'border-red-100' : 'border-gray-100'}`}>
              {log.success
                ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{log.subject || log.template_used || '—'}</p>
                <p className="text-xs text-gray-500">{log.recipient} · {log.channel || 'email'}</p>
                {log.error_message && <p className="text-xs text-red-500 mt-0.5">{log.error_message}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">{log.sent_at ? format(new Date(log.sent_at), 'dd MMM HH:mm') : ''}</span>
                {!log.success && (
                  <Button variant="outline" size="sm" className="h-6 text-xs px-2 text-[#B87333] border-[#B87333]" onClick={() => retryLog(log)}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Retry
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminAutomationCentre() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#B87333]" /> Automation Centre
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Event-driven and scheduled automation rules for client communication</p>
        </div>

        <div className="flex gap-1 border-b overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === key ? 'border-[#B87333] text-[#B87333]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'workflow' && <WorkflowStatusTab />}
          {activeTab === 'rules' && <RulesTab />}
          {activeTab === 'approval' && <ApprovalTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'projects' && <ProjectControlsTab />}
        </div>
      </div>
    </AdminLayout>
  );
}