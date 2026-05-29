import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail, MessageSquare, Send, Search, CheckCircle, AlertTriangle,
  Clock, FileText, History, Settings, TestTube, Copy, CheckCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Inbox, Zap } from 'lucide-react';
import EmailQueueTab from '@/components/admin/communication/EmailQueueTab';
import AutomationRulesTab from '@/components/admin/communication/AutomationRulesTab';

// ─── WhatsApp Templates ───────────────────────────────────────────────────────
const WA_TEMPLATES = [
  { id: 'quote_sent', name: 'Quote Sent Follow-Up', category: 'Sales', message: 'Hi {{client_name}}, your publishing quote for *{{book_title}}* has been sent to your email. Please review it and let us know if you have any questions. Kind regards, Creative Books SA 📚' },
  { id: 'quote_reminder', name: 'Quote Reminder', category: 'Sales', message: 'Hi {{client_name}}, just a friendly reminder that your quote for *{{book_title}}* (ref: {{quote_number}}) is still available. Please feel free to reach out. Creative Books SA 📚' },
  { id: 'payment_reminder', name: 'Payment Reminder', category: 'Finance', message: 'Hi {{client_name}}, this is a friendly reminder that invoice *{{invoice_number}}* for R{{amount_due}} is outstanding. Please make payment at your earliest convenience. Thank you, Creative Books SA.' },
  { id: 'contract_reminder', name: 'Contract Signing Reminder', category: 'Legal', message: 'Hi {{client_name}}, we noticed your publishing contract for *{{book_title}}* has not been signed yet. Please check your email for the signing link. Creative Books SA 📖' },
  { id: 'manuscript_request', name: 'Manuscript Request', category: 'Production', message: 'Hi {{client_name}}, we are ready to begin working on *{{book_title}}*. Please send your manuscript to us as soon as possible. Creative Books SA 📝' },
  { id: 'proof_approval', name: 'Proof Approval Reminder', category: 'Production', message: 'Hi {{client_name}}, your proof for *{{book_title}}* is ready for review. Please open the approval link in your email. Creative Books SA ✅' },
  { id: 'ready_collection', name: 'Books Ready for Collection', category: 'Delivery', message: 'Hi {{client_name}}, exciting news! Your books — *{{book_title}}* — are ready for collection. Please contact us to arrange a suitable time. Creative Books SA 🎉' },
  { id: 'project_complete', name: 'Project Completed', category: 'Complete', message: 'Hi {{client_name}}, congratulations! Your publishing project for *{{book_title}}* has been successfully completed. Creative Books SA 🥳' },
  { id: 'review_request', name: 'Google Review Request', category: 'Marketing', message: 'Hi {{client_name}}, thank you for choosing Creative Books SA for *{{book_title}}*. Could you spare a moment to leave us a Google review? Thank you! 🌟' },
  { id: 'reprint_followup', name: 'Reprint Follow-Up', category: 'Sales', message: 'Hi {{client_name}}, it was great working on *{{book_title}}* with you! Are you thinking about a reprint? We can offer a fast turnaround. Creative Books SA 📚' },
];

const CAT_COLORS = { Sales: 'bg-blue-100 text-blue-700', Finance: 'bg-green-100 text-green-700', Legal: 'bg-purple-100 text-purple-700', Production: 'bg-orange-100 text-orange-700', Delivery: 'bg-teal-100 text-teal-700', Complete: 'bg-emerald-100 text-emerald-700', Marketing: 'bg-pink-100 text-pink-700' };

function resolveVars(text, contact, extras = {}) {
  if (!text) return '';
  let out = text;
  if (contact) {
    out = out.replace(/{{client_name}}/g, contact.full_name || '').replace(/{{book_title}}/g, contact.book_title || '[Book Title]');
  }
  Object.entries(extras).forEach(([k, v]) => { out = out.replace(new RegExp(`{{${k}}}`, 'g'), v || ''); });
  return out;
}

const TABS = [
  { key: 'whatsapp',   label: 'WhatsApp',      icon: MessageSquare },
  { key: 'email',      label: 'Email',          icon: Mail },
  { key: 'queue',      label: 'Email Queue',    icon: Inbox },
  { key: 'automation', label: 'Automation',     icon: Zap },
  { key: 'history',    label: 'History',        icon: History },
  { key: 'settings',   label: 'Settings',       icon: Settings },
];

export default function AdminCommunication() {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contactId, setContactId] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [extras, setExtras] = useState({ quote_number: '', invoice_number: '', amount_due: '' });
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testNumber, setTestNumber] = useState(localStorage.getItem('wa_test_number') || '');
  const [catFilter, setCatFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => base44.entities.Contact.list('-created_date', 500) });
  const { data: activityLogs = [] } = useQuery({ queryKey: ['activitylog-comms'], queryFn: () => base44.entities.ActivityLog.list('-created_date', 200) });

  const selectedContact = contacts.find(c => c.id === contactId);

  const getPreview = () => {
    const msg = selectedTemplate?.message || customMsg;
    return resolveVars(msg, selectedContact, extras);
  };

  const handleSendWA = async (isTest = false) => {
    const msg = getPreview();
    const number = isTest ? testNumber : (selectedContact?.whatsapp_number || selectedContact?.phone || customPhone);
    if (!number) { toast.error(isTest ? 'Set a test number first' : 'No phone number found'); return; }
    if (!msg.trim()) { toast.error('No message to send'); return; }
    isTest ? setTesting(true) : setSending(true);
    const res = await base44.functions.invoke('sendWhatsAppNotification', {
      to_number: number,
      message: msg,
      contact_id: contactId || undefined,
      type: isTest ? 'Test Message' : (selectedTemplate?.name || 'Custom Message'),
    });
    isTest ? setTesting(false) : setSending(false);
    if (res.data?.success) toast.success(isTest ? '✅ Test message sent!' : '✅ WhatsApp sent!');
    else toast.error(res.data?.error || 'Failed to send');
  };

  const handleSendEmail = async (isTest = false) => {
    const to = isTest ? (localStorage.getItem('email_test_address') || '') : emailForm.to;
    if (!to) { toast.error(isTest ? 'Set a test email in Settings' : 'Enter recipient email'); return; }
    if (!emailForm.subject || !emailForm.body) { toast.error('Subject and body are required'); return; }
    isTest ? setTestingEmail(true) : setSendingEmail(true);
    const res = await base44.functions.invoke('sendContactEmail', {
      action: 'send',
      to,
      subject: emailForm.subject,
      body_html: `<p>${emailForm.body.replace(/\n/g, '<br/>')}</p>`,
    });
    isTest ? setTestingEmail(false) : setSendingEmail(false);
    if (res.data?.success) { toast.success(isTest ? '✅ Test email sent!' : '✅ Email sent!'); if (!isTest) setEmailForm({ to: '', subject: '', body: '' }); }
    else toast.error(res.data?.error || 'Failed to send email');
  };

  const categories = ['All', ...new Set(WA_TEMPLATES.map(t => t.category))];
  const filteredTemplates = catFilter === 'All' ? WA_TEMPLATES : WA_TEMPLATES.filter(t => t.category === catFilter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Centre</h1>
          <p className="text-sm text-gray-500 mt-0.5">Send WhatsApp messages, emails, and manage communication history</p>
        </div>

        {/* Status strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'WhatsApp', status: 'CallMeBot Connected', ok: true, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Email', status: 'Resend Connected', ok: true, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Messages Today', status: activityLogs.filter(l => new Date(l.created_date).toDateString() === new Date().toDateString()).length, ok: true, icon: Send, color: 'text-[#B87333]', bg: 'bg-orange-50' },
            { label: 'Failed', status: activityLogs.filter(l => l.type?.includes('failed')).length, ok: false, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 p-3 flex items-center gap-3`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${s.color}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{s.label}</p>
                  <p className={`text-xs ${s.ok ? 'text-gray-500' : 'text-red-500'}`}>{s.status}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* ── WHATSAPP TAB ── */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${catFilter === c ? 'bg-[#B87333] text-white border-[#B87333]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredTemplates.map(t => (
                <div key={t.id} onClick={() => { setSelectedTemplate(t.id === selectedTemplate?.id ? null : t); setCustomMsg(''); }}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedTemplate?.id === t.id ? 'border-[#B87333] bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[t.category] || 'bg-gray-100 text-gray-600'}`}>{t.category}</span>
                      <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(t.message); setCopiedId(t.id); setTimeout(() => setCopiedId(null), 2000); }} className="p-1 hover:bg-gray-100 rounded">
                        {copiedId === t.id ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{t.message}</p>
                </div>
              ))}
            </div>

            {/* Custom message */}
            {!selectedTemplate && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom Message</h4>
                <textarea value={customMsg} onChange={e => setCustomMsg(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Type a custom WhatsApp message..." />
              </div>
            )}

            {/* Send panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                {selectedTemplate ? `Send: ${selectedTemplate.name}` : 'Send Custom Message'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Select Client</label>
                  <select value={contactId} onChange={e => setContactId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select client...</option>
                    {contacts.filter(c => c.phone || c.whatsapp_number).map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} — {c.whatsapp_number || c.phone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Or Custom Number</label>
                  <Input value={customPhone} onChange={e => setCustomPhone(e.target.value)} placeholder="+27821234567" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(extras).map(k => (
                  <div key={k}>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">{k.replace(/_/g, ' ')}</label>
                    <Input value={extras[k]} onChange={e => setExtras(ev => ({ ...ev, [k]: e.target.value }))} placeholder={`{{${k}}}`} className="text-xs h-8" />
                  </div>
                ))}
              </div>
              {(selectedTemplate || customMsg) && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">Preview</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{getPreview()}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleSendWA(true)} disabled={testing || (!selectedTemplate && !customMsg)} className="gap-2">
                  <TestTube className="w-4 h-4" /> {testing ? 'Sending test...' : 'Test Message'}
                </Button>
                <Button onClick={() => handleSendWA(false)} disabled={sending || (!selectedContact && !customPhone) || (!selectedTemplate && !customMsg)} className="gap-2 bg-green-600 hover:bg-green-700 text-white flex-1">
                  <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send WhatsApp'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">Test number:</label>
                <input value={testNumber} onChange={e => { setTestNumber(e.target.value); localStorage.setItem('wa_test_number', e.target.value); }} placeholder="+27821234567" className="text-xs border border-gray-200 rounded px-2 py-1 flex-1" />
              </div>
            </div>
          </div>
        )}

        {/* ── EMAIL TAB ── */}
        {activeTab === 'email' && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /> Send Email</h4>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">To (email address)</label>
                <Input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="recipient@email.com" type="email" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Subject</label>
                <Input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="Email subject..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Message</label>
                <textarea value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} rows={8} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Type your email message here..." />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleSendEmail(true)} disabled={testingEmail} className="gap-2">
                  <TestTube className="w-4 h-4" /> {testingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>
                <Button onClick={() => handleSendEmail(false)} disabled={sendingEmail || !emailForm.to || !emailForm.subject || !emailForm.body} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1">
                  <Send className="w-4 h-4" /> {sendingEmail ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">💡 For advanced email templates, go to <a href="/admin/email-templates" className="underline font-semibold">Email Templates</a> where you can manage branded templates and bulk sends.</p>
            </div>
          </div>
        )}

        {/* ── EMAIL QUEUE TAB ── */}
        {activeTab === 'queue' && <EmailQueueTab />}

        {/* ── AUTOMATION TAB ── */}
        {activeTab === 'automation' && <AutomationRulesTab />}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {activityLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <History className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">No communication history yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {activityLogs.slice(0, 50).map(log => (
                    <div key={log.id} className={`flex items-start gap-3 px-5 py-3.5 ${log.type?.includes('failed') ? 'bg-red-50/30' : ''}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${log.type === 'whatsapp_sent' ? 'bg-green-100' : log.type === 'email_sent' ? 'bg-blue-100' : log.type?.includes('failed') ? 'bg-red-100' : 'bg-gray-100'}`}>
                        {log.type === 'whatsapp_sent' ? <MessageSquare className="w-3 h-3 text-green-600" /> :
                         log.type === 'email_sent' ? <Mail className="w-3 h-3 text-blue-600" /> :
                         log.type?.includes('failed') ? <AlertTriangle className="w-3 h-3 text-red-500" /> :
                         <Clock className="w-3 h-3 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{log.description || log.type || 'Communication event'}</p>
                        {log.created_by && <p className="text-[10px] text-gray-400">by {log.created_by}</p>}
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(log.created_date).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="max-w-md space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp</h3>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Test WhatsApp Number</label>
                <Input value={testNumber} onChange={e => { setTestNumber(e.target.value); localStorage.setItem('wa_test_number', e.target.value); }} placeholder="+27821234567" />
              </div>
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> CallMeBot API key configured via environment secrets
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /> Email (Resend)</h3>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Test Email Address</label>
                <Input defaultValue={localStorage.getItem('email_test_address') || ''} onChange={e => localStorage.setItem('email_test_address', e.target.value)} placeholder="test@example.com" />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> RESEND_API_KEY configured via environment secrets
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}