import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, TestTube, Copy, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const WA_TEMPLATES = [
  {
    id: 'quote_sent',
    name: 'Quote Sent Follow-Up',
    category: 'Sales',
    message: 'Hi {{client_name}}, your publishing quote for *{{book_title}}* has been sent to your email. Please review it at your convenience and let us know if you have any questions. Kind regards, Creative Books SA 📚',
  },
  {
    id: 'quote_reminder',
    name: 'Quote Reminder',
    category: 'Sales',
    message: 'Hi {{client_name}}, just a friendly reminder that your quote for *{{book_title}}* is still available. Your quote reference is {{quote_number}}. Please feel free to reach out if you need any changes. Creative Books SA 📚',
  },
  {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    category: 'Finance',
    message: 'Hi {{client_name}}, this is a friendly reminder that invoice *{{invoice_number}}* for R{{amount_due}} is due. Please make payment at your earliest convenience. Thank you, Creative Books SA.',
  },
  {
    id: 'contract_reminder',
    name: 'Contract Signing Reminder',
    category: 'Legal',
    message: 'Hi {{client_name}}, we noticed your publishing contract for *{{book_title}}* has not been signed yet. Please check your email for the signing link. Contact us if you need help. Creative Books SA 📖',
  },
  {
    id: 'manuscript_request',
    name: 'Manuscript Request',
    category: 'Production',
    message: 'Hi {{client_name}}, we are ready to begin working on *{{book_title}}*. Please send your manuscript to us as soon as possible so we can start your project. Creative Books SA 📝',
  },
  {
    id: 'proof_approval',
    name: 'Proof Approval Reminder',
    category: 'Production',
    message: 'Hi {{client_name}}, your proof for *{{book_title}}* is ready for review. Please open the approval link in your email and let us know if you approve or require changes. Creative Books SA ✅',
  },
  {
    id: 'sample_update',
    name: 'Sample Print Update',
    category: 'Production',
    message: 'Hi {{client_name}}, great news! Your sample print for *{{book_title}}* has been completed. We will send it to you for final approval before mass production begins. Creative Books SA 🖨️',
  },
  {
    id: 'production_update',
    name: 'Production Update',
    category: 'Production',
    message: 'Hi {{client_name}}, your books for *{{book_title}}* are currently in production. We will keep you updated on the progress. Thank you for your patience. Creative Books SA 📦',
  },
  {
    id: 'ready_collection',
    name: 'Books Ready for Collection',
    category: 'Delivery',
    message: 'Hi {{client_name}}, exciting news! Your books — *{{book_title}}* — are ready for collection from our office. Please contact us to arrange a suitable time. Creative Books SA 🎉',
  },
  {
    id: 'project_complete',
    name: 'Project Completed',
    category: 'Complete',
    message: 'Hi {{client_name}}, congratulations! Your publishing project for *{{book_title}}* has been successfully completed. It has been a pleasure working with you. Creative Books SA 🥳',
  },
  {
    id: 'review_request',
    name: 'Google Review Request',
    category: 'Marketing',
    message: 'Hi {{client_name}}, thank you for choosing Creative Books SA for *{{book_title}}*. We would love to hear your feedback. Could you spare a moment to leave us a Google review? Thank you so much! 🌟',
  },
  {
    id: 'document_sent',
    name: 'Document Sent',
    category: 'Documents',
    message: 'Hi {{client_name}}, we have sent you an important document regarding *{{book_title}}*. Please check your email and open it at your earliest convenience. Creative Books SA 📄',
  },
  {
    id: 'reprint_followup',
    name: 'Reprint Follow-Up',
    category: 'Sales',
    message: 'Hi {{client_name}}, it was great working on *{{book_title}}* with you! Are you thinking about a reprint? We can offer you a fast turnaround. Let us know when you are ready. Creative Books SA 📚',
  },
];

const VARS = ['{{client_name}}', '{{book_title}}', '{{quote_number}}', '{{invoice_number}}', '{{amount_due}}', '{{project_stage}}', '{{company_name}}'];

const CAT_COLORS = {
  Sales: 'bg-blue-100 text-blue-700',
  Finance: 'bg-green-100 text-green-700',
  Legal: 'bg-purple-100 text-purple-700',
  Production: 'bg-orange-100 text-orange-700',
  Delivery: 'bg-teal-100 text-teal-700',
  Complete: 'bg-emerald-100 text-emerald-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Documents: 'bg-indigo-100 text-indigo-700',
};

function resolveVars(text, contact) {
  if (!contact) return text;
  return text
    .replace(/{{client_name}}/g, contact.full_name || '')
    .replace(/{{book_title}}/g, contact.book_title || '[Book Title]')
    .replace(/{{company_name}}/g, contact.company || 'Creative Books SA');
}

export default function WhatsAppPanel({ contacts }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contactId, setContactId] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [extraVars, setExtraVars] = useState({ quote_number: '', invoice_number: '', amount_due: '', project_stage: '' });
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testNumber, setTestNumber] = useState(localStorage.getItem('wa_test_number') || '');
  const [catFilter, setCatFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [expandSend, setExpandSend] = useState(false);

  const selectedContact = contacts.find(c => c.id === contactId);

  const getResolvedMessage = (template) => {
    let msg = template?.message || customMsg;
    if (selectedContact) msg = resolveVars(msg, selectedContact);
    msg = msg
      .replace(/{{quote_number}}/g, extraVars.quote_number || '[Quote #]')
      .replace(/{{invoice_number}}/g, extraVars.invoice_number || '[Invoice #]')
      .replace(/{{amount_due}}/g, extraVars.amount_due || '[Amount]')
      .replace(/{{project_stage}}/g, extraVars.project_stage || '[Stage]');
    return msg;
  };

  const handleSend = async (isTest = false) => {
    const msg = getResolvedMessage(selectedTemplate);
    const number = isTest ? testNumber : (selectedContact?.whatsapp_number || selectedContact?.phone || customPhone);
    if (!number) { toast.error(isTest ? 'Set a test number in Settings' : 'No phone number found'); return; }
    if (!msg) { toast.error('No message to send'); return; }
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

  const categories = ['All', ...new Set(WA_TEMPLATES.map(t => t.category))];
  const filtered = catFilter === 'All' ? WA_TEMPLATES : WA_TEMPLATES.filter(t => t.category === catFilter);

  return (
    <div className="space-y-6">
      {/* Template Library */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">WhatsApp Template Library</h3>
        <p className="text-sm text-gray-500 mb-4">Click a template to select it, then fill in recipient details below</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${catFilter === c ? 'bg-[#B87333] text-white border-[#B87333]' : 'bg-white border-gray-200 text-gray-600 hover:border-[#B87333]/50'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(t => (
            <div
              key={t.id}
              onClick={() => { setSelectedTemplate(t.id === selectedTemplate?.id ? null : t); setCustomMsg(''); }}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedTemplate?.id === t.id ? 'border-[#B87333] bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[t.category] || 'bg-gray-100 text-gray-600'}`}>{t.category}</span>
                  <button
                    onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(t.message); setCopiedId(t.id); setTimeout(() => setCopiedId(null), 2000); }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedId === t.id ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{t.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Message */}
      {!selectedTemplate && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom Message</h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {VARS.map(v => (
              <button key={v} onClick={() => setCustomMsg(m => m + v)} className="text-[10px] bg-orange-50 text-[#B87333] border border-orange-100 px-2 py-0.5 rounded hover:bg-orange-100">
                {v}
              </button>
            ))}
          </div>
          <textarea value={customMsg} onChange={e => setCustomMsg(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Type a custom WhatsApp message..." />
        </div>
      )}

      {/* Send Panel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button onClick={() => setExpandSend(!expandSend)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Send Message</p>
              {selectedTemplate && <p className="text-xs text-[#B87333]">Template: {selectedTemplate.name}</p>}
            </div>
          </div>
          {expandSend ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {expandSend && (
          <div className="px-5 pb-5 border-t border-gray-50 space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Recipient (Client)</label>
                <select value={contactId} onChange={e => setContactId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Select client...</option>
                  {contacts.filter(c => c.phone || c.whatsapp_number).map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} — {c.whatsapp_number || c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Or Custom Phone Number</label>
                <Input value={customPhone} onChange={e => setCustomPhone(e.target.value)} placeholder="+27821234567" />
              </div>
            </div>

            {/* Extra variables */}
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(extraVars).map(k => (
                <div key={k}>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 block">{k.replace(/_/g, ' ')}</label>
                  <Input
                    value={extraVars[k]}
                    onChange={e => setExtraVars(ev => ({ ...ev, [k]: e.target.value }))}
                    placeholder={`{{${k}}}`}
                    className="text-xs h-8"
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            {(selectedTemplate || customMsg) && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-700 mb-2">Message Preview</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{getResolvedMessage(selectedTemplate)}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSend(true)}
                disabled={testing || (!selectedTemplate && !customMsg)}
                className="gap-2 border-gray-200 text-gray-600"
              >
                <TestTube className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
                {testing ? 'Sending test...' : 'Test Message'}
              </Button>
              <Button
                onClick={() => handleSend(false)}
                disabled={sending || (!selectedContact && !customPhone) || (!selectedTemplate && !customMsg)}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send WhatsApp'}
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs text-gray-500">Test number:</label>
              <input
                value={testNumber}
                onChange={e => { setTestNumber(e.target.value); localStorage.setItem('wa_test_number', e.target.value); }}
                placeholder="+27821234567"
                className="text-xs border border-gray-200 rounded px-2 py-1 flex-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}