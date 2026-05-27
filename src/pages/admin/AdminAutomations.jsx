import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Zap, Mail, MessageSquare, Clock, AlertTriangle, Send, RefreshCw, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

function ActionCard({ title, description, icon: Icon, iconBg, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
      <p className="text-sm text-gray-600">Send a branded invoice email directly to the client with all line items, totals, and banking details.</p>
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
      <p className="text-sm text-gray-600">Send a payment reminder to a client with outstanding balance via email, WhatsApp, or both.</p>
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
      <p className="text-sm text-gray-600">Send the client a branded email about their current project stage. A default message is used based on the stage, or you can add a custom note.</p>
      <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
        <option value="">Select a project...</option>
        {activeProjects.map(p => {
          const contact = contacts.find(c => c.id === p.contact_id);
          return <option key={p.id} value={p.id}>{p.book_title} — {contact?.full_name} ({p.stage})</option>;
        })}
      </select>
      <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional custom message (leave blank to use the default stage message)..." />
      <Button onClick={handleSend} disabled={!projectId || sending} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
        <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Project Update'}
      </Button>
    </div>
  );
}

function WhatsAppSender({ contacts }) {
  const [contactId, setContactId] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const selectedContact = contacts.find(c => c.id === contactId);

  const handleSend = async () => {
    if (!contactId || !message) return;
    const number = selectedContact?.whatsapp_number || selectedContact?.phone;
    if (!number) { toast.error('This client has no phone number saved'); return; }
    setSending(true);
    const res = await base44.functions.invoke('sendWhatsAppNotification', { to_number: number, message, contact_id: contactId, type: 'Custom Message' });
    setSending(false);
    if (res.data?.success) { toast.success('WhatsApp message sent!'); setMessage(''); }
    else toast.error(res.data?.error || 'Failed to send WhatsApp message');
  };

  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm text-gray-600">Send a WhatsApp message directly to a client via Twilio. Make sure the client's phone number is saved on their contact record.</p>
      <select value={contactId} onChange={e => setContactId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
        <option value="">Select client...</option>
        {contacts.filter(c => c.phone || c.whatsapp_number).map(c => (
          <option key={c.id} value={c.id}>{c.full_name} — {c.whatsapp_number || c.phone}</option>
        ))}
      </select>
      {selectedContact && (
        <p className="text-xs text-gray-500">Will send to: {selectedContact.whatsapp_number || selectedContact.phone}</p>
      )}
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Type your WhatsApp message..." />
      <Button onClick={handleSend} disabled={!contactId || !message || sending} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
        <MessageSquare className="w-4 h-4" /> {sending ? 'Sending...' : 'Send WhatsApp'}
      </Button>
    </div>
  );
}

function OverdueChecker() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    const res = await base44.functions.invoke('checkOverdueInvoices', {});
    setRunning(false);
    setResult(res.data);
    if (res.data?.success) toast.success(`Checked invoices: ${res.data.invoices_marked_overdue} marked overdue, ${res.data.tasks_created} tasks created`);
    else toast.error(res.data?.error || 'Check failed');
  };

  return (
    <div className="pt-4 space-y-3">
      <p className="text-sm text-gray-600">Scans all outstanding invoices, marks any past their due date as "Overdue", and automatically creates a "Payment Follow-up" task for each. This runs automatically every morning at 7am but can be triggered manually here.</p>
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

export default function AdminAutomations() {
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => base44.entities.Contact.list('-created_date', 500) });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => base44.entities.Invoice.list('-created_date', 200) });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list('-created_date', 200) });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automations &amp; Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Trigger emails, WhatsApp messages, and automated workflows</p>
        </div>

        {/* Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Resend Email</p>
              <p className="text-xs text-green-600">Connected &amp; ready</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Twilio WhatsApp</p>
              <p className="text-xs text-green-600">Connected &amp; ready</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Scheduled Jobs</p>
              <p className="text-xs text-blue-600">Overdue check: 7am daily</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email Notifications</h2>
          <ActionCard title="Send Invoice to Client" description="Email a branded invoice PDF to a client" icon={Mail} iconBg="bg-[#B87333]" defaultOpen>
            <InvoiceEmailSender contacts={contacts} invoices={invoices} />
          </ActionCard>
          <ActionCard title="Send Payment Reminder" description="Remind a client about an outstanding invoice via email or WhatsApp" icon={AlertTriangle} iconBg="bg-red-500">
            <PaymentReminderSender contacts={contacts} invoices={invoices} />
          </ActionCard>
          <ActionCard title="Send Project Stage Update" description="Notify a client about their current project progress" icon={Send} iconBg="bg-blue-500">
            <ProjectUpdateSender contacts={contacts} projects={projects} />
          </ActionCard>

          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4">WhatsApp Messaging</h2>
          <ActionCard title="Send Custom WhatsApp Message" description="Send a free-form WhatsApp message to any client" icon={MessageSquare} iconBg="bg-green-600">
            <WhatsAppSender contacts={contacts} />
          </ActionCard>

          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-4">Automated Workflows</h2>
          <ActionCard title="Check &amp; Flag Overdue Invoices" description="Auto-mark overdue invoices and create follow-up tasks" icon={RefreshCw} iconBg="bg-orange-500">
            <OverdueChecker />
          </ActionCard>
        </div>
      </div>
    </AdminLayout>
  );
}