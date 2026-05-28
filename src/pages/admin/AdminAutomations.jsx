import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Zap, Mail, MessageSquare, Clock, AlertTriangle, Send,
  RefreshCw, CheckCircle, ChevronDown, ChevronUp, LayoutDashboard,
  Settings, ScrollText, FileText, DollarSign, FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import AutomationDashboard from '@/components/admin/automations/AutomationDashboard';
import WhatsAppPanel from '@/components/admin/automations/WhatsAppPanel';
import AutomationLogs from '@/components/admin/automations/AutomationLogs';
import AutomationSettings from '@/components/admin/automations/AutomationSettings';

// ─── Reusable collapsible action card ───────────────────────────────────────
function ActionCard({ title, description, icon: Icon, iconBg, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors text-left">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50">{children}</div>}
    </div>
  );
}

// ─── Invoice email sender ────────────────────────────────────────────────────
function InvoiceEmailSender({ contacts, invoices }) {
  const [invoiceId, setInvoiceId] = useState('');
  const [sending, setSending] = useState(false);
  const filteredInvoices = invoices.filter(i => !['Paid', 'Cancelled'].includes(i.status));
  const handleSend = async () => {
    if (!invoiceId) return;
    setSending(true);
    const res = await base44.functions.invoke('sendInvoiceEmail', { invoice_id: invoiceId });
    setSending(false);
    if (res.data?.success) toast.success('Invoice emailed successfully!');
    else toast.error(res.data?.error || 'Failed to send invoice');
  };
  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm text-gray-600">Send a branded invoice email with line items, totals, and banking details.</p>
      <select value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
        <option value="">Select an invoice...</option>
        {filteredInvoices.map(inv => {
          const contact = contacts.find(c => c.id === inv.contact_id);
          return <option key={inv.id} value={inv.id}>{inv.invoice_number} — {contact?.full_name} (R {(inv.total || 0).toLocaleString()})</option>;
        })}
      </select>
      <Button onClick={handleSend} disabled={!invoiceId || sending} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
        <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Invoice Email'}
      </Button>
    </div>
  );
}

// ─── Payment reminder sender ─────────────────────────────────────────────────
function PaymentReminderSender({ contacts, invoices }) {
  const [invoiceId, setInvoiceId] = useState('');
  const [channel, setChannel] = useState('email');
  const [sending, setSending] = useState(false);
  const overdueInvoices = invoices.filter(i => ['Overdue', 'Sent', 'Partially Paid'].includes(i.status));
  const handleSend = async () => {
    if (!invoiceId) return;
    setSending(true);
    const res = await base44.functions.invoke('sendPaymentReminder', { invoice_id: invoiceId, channel });
    setSending(false);
    if (res.data?.success) toast.success(`Payment reminder sent via ${channel}!`);
    else toast.error(res.data?.error || 'Failed to send reminder');
  };
  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm text-gray-600">Remind a client with outstanding balance via email, WhatsApp, or both.</p>
      <select value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
        <option value="">Select an invoice...</option>
        {overdueInvoices.map(inv => {
          const contact = contacts.find(c => c.id === inv.contact_id);
          return <option key={inv.id} value={inv.id}>{inv.invoice_number} — {contact?.full_name} — R {(inv.balance_due || inv.total || 0).toLocaleString()} due</option>;
        })}
      </select>
      <div className="flex gap-2">
        {['email', 'whatsapp', 'both'].map(c => (
          <button key={c} onClick={() => setChannel(c)} className={`px-3 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${channel === c ? 'bg-[#B87333] border-[#B87333] text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{c}</button>
        ))}
      </div>
      <Button onClick={handleSend} disabled={!invoiceId || sending} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
        <AlertTriangle className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Reminder'}
      </Button>
    </div>
  );
}

// ─── Project update sender ───────────────────────────────────────────────────
function ProjectUpdateSender({ contacts, projects }) {
  const [projectId, setProjectId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const activeProjects = projects.filter(p => !['Completed', 'Delivered'].includes(p.stage));
  const handleSend = async () => {
    if (!projectId) return;
    setSending(true);
    const res = await base44.functions.invoke('sendProjectUpdateEmail', { project_id: projectId, custom_message: customMessage || undefined });
    setSending(false);
    if (res.data?.success) toast.success('Project update email sent!');
    else toast.error(res.data?.error || 'Failed to send email');
  };
  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm text-gray-600">Send the client a branded email about their current project stage.</p>
      <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
        <option value="">Select a project...</option>
        {activeProjects.map(p => {
          const contact = contacts.find(c => c.id === p.contact_id);
          return <option key={p.id} value={p.id}>{p.book_title} — {contact?.full_name} ({p.stage})</option>;
        })}
      </select>
      <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional custom message (leave blank for default stage message)..." />
      <Button onClick={handleSend} disabled={!projectId || sending} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
        <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Project Update'}
      </Button>
    </div>
  );
}

// ─── Follow-up reminder runner ───────────────────────────────────────────────
function FollowUpRunner() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const handleRun = async () => {
    setRunning(true); setResult(null);
    const res = await base44.functions.invoke('sendFollowUpReminders', {});
    setRunning(false); setResult(res.data);
    if (res.data?.success) toast.success('Follow-up reminders processed!');
    else toast.error(res.data?.error || 'Failed');
  };
  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm text-gray-600">Send follow-up reminders for leads, quotes, and overdue tasks. Runs automatically each morning but can be triggered manually.</p>
      <Button onClick={handleRun} disabled={running} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
        <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} /> {running ? 'Running...' : 'Send Follow-Up Reminders Now'}
      </Button>
      {result && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <p className="font-semibold text-gray-700 mb-1">Result:</p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Overdue checker ─────────────────────────────────────────────────────────
function OverdueChecker() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const handleRun = async () => {
    setRunning(true); setResult(null);
    const res = await base44.functions.invoke('checkOverdueInvoices', {});
    setRunning(false); setResult(res.data);
    if (res.data?.success) toast.success(`${res.data.invoices_marked_overdue} overdue, ${res.data.tasks_created} tasks created`);
    else toast.error(res.data?.error || 'Check failed');
  };
  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm text-gray-600">Scans all invoices, marks past-due ones as Overdue, and creates follow-up tasks. Runs automatically at 7am daily.</p>
      <Button onClick={handleRun} disabled={running} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
        <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} /> {running ? 'Checking...' : 'Run Overdue Check Now'}
      </Button>
      {result && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
          <p className="font-semibold text-gray-700">Result:</p>
          <p className="text-gray-600">✓ Invoices marked overdue: <strong>{result.invoices_marked_overdue}</strong></p>
          <p className="text-gray-600">✓ Follow-up tasks created: <strong>{result.tasks_created}</strong></p>
        </div>
      )}
    </div>
  );
}

// ─── Tabs config ─────────────────────────────────────────────────────────────
const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { key: 'workflows', label: 'Workflows', icon: Zap },
  { key: 'logs', label: 'Logs', icon: ScrollText },
  { key: 'settings', label: 'Settings', icon: Settings },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminAutomations() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => base44.entities.Contact.list('-created_date', 500) });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list('-created_date', 200) });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list('-created_date', 200) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Centre</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage email, WhatsApp, workflows, and automation logs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <AutomationDashboard contacts={contacts} invoices={invoices} projects={projects} />
        )}

        {activeTab === 'email' && (
          <div className="space-y-3">
            <ActionCard title="Send Invoice to Client" description="Email a branded invoice PDF to a client" icon={Mail} iconBg="bg-[#B87333]" defaultOpen>
              <InvoiceEmailSender contacts={contacts} invoices={invoices} />
            </ActionCard>
            <ActionCard title="Send Payment Reminder" description="Remind a client about an outstanding invoice via email or WhatsApp" icon={AlertTriangle} iconBg="bg-red-500">
              <PaymentReminderSender contacts={contacts} invoices={invoices} />
            </ActionCard>
            <ActionCard title="Send Project Stage Update" description="Notify a client about their current project progress" icon={Send} iconBg="bg-blue-500">
              <ProjectUpdateSender contacts={contacts} projects={projects} />
            </ActionCard>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppPanel contacts={contacts} />
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-3">
            <ActionCard title="Check &amp; Flag Overdue Invoices" description="Auto-mark overdue invoices and create follow-up tasks (runs at 7am daily)" icon={RefreshCw} iconBg="bg-orange-500">
              <OverdueChecker />
            </ActionCard>
            <ActionCard title="Send Follow-Up Reminders" description="Process all pending follow-up reminders for leads, quotes, and tasks" icon={Clock} iconBg="bg-purple-500">
              <FollowUpRunner />
            </ActionCard>
          </div>
        )}

        {activeTab === 'logs' && (
          <AutomationLogs contacts={contacts} />
        )}

        {activeTab === 'settings' && (
          <AutomationSettings />
        )}
      </div>
    </AdminLayout>
  );
}