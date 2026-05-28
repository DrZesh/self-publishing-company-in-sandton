import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, FileText, User, Mail, Calendar, MessageSquare, Shield, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickSendModal({ templates, contacts, onClose, onSent }) {
  const [step, setStep] = useState(1); // 1 = choose doc, 2 = recipient details, 3 = done
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({
    recipient_name: '',
    recipient_email: '',
    requires_signature: false,
    expiry_days: 14,
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sentResult, setSentResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSend = async () => {
    if (!selectedTemplate || !form.recipient_name || !form.recipient_email) return;
    setSending(true);

    try {
      // Find or map contact by email
      const matchedContact = contacts.find(c => c.email?.toLowerCase() === form.recipient_email.toLowerCase());
      const expiresAt = new Date(Date.now() + form.expiry_days * 24 * 60 * 60 * 1000).toISOString();

      // Create a new document record from the template
      const newDoc = await base44.entities.Document.create({
        contact_id: matchedContact?.id || null,
        category: selectedTemplate.category,
        file_name: selectedTemplate.file_name,
        file_url: selectedTemplate.file_url,
        file_type: selectedTemplate.file_type,
        file_size_kb: selectedTemplate.file_size_kb,
        status: 'Draft',
        requires_signature: form.requires_signature,
        expires_at: expiresAt,
        notes: form.message,
        internal_notes: `Quick Send to: ${form.recipient_name} <${form.recipient_email}>`,
        book_title: selectedTemplate.template_label || selectedTemplate.file_name,
        is_template: false,
        is_latest_version: true,
        version: 1,
      });

      // Send email via Resend
      const subject = `Document from Creative Books SA: ${selectedTemplate.template_label || selectedTemplate.file_name}`;
      const body = `
        <p>Hi ${form.recipient_name},</p>
        ${form.message ? `<p>${form.message}</p>` : ''}
        <p>Please find the document attached below:</p>
        <p><strong>${selectedTemplate.template_label || selectedTemplate.file_name}</strong></p>
        <p><a href="${selectedTemplate.file_url}" style="display:inline-block;padding:12px 24px;background:#B87333;color:white;border-radius:8px;text-decoration:none;font-weight:600;">View Document</a></p>
        ${form.requires_signature ? '<p><em>This document requires your signature.</em></p>' : ''}
        <p>This link expires on ${new Date(expiresAt).toLocaleDateString('en-ZA')}.</p>
        <p>If you have any questions, please reply to this email.</p>
        <br/>
        <p>Kind regards,<br/>Creative Books SA Team</p>
      `;

      await base44.integrations.Core.SendEmail({
        to: form.recipient_email,
        subject,
        body,
        from_name: 'Creative Books SA',
      });

      // Update doc status to Sent
      await base44.entities.Document.update(newDoc.id, {
        status: 'Sent to Client',
        sent_at: new Date().toISOString(),
      });

      setSentResult({ name: form.recipient_name, email: form.recipient_email });
      setStep(3);
      onSent?.();
    } catch (err) {
      toast.error('Failed to send document. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const TEMPLATE_ICONS = {
    'NDA': '🔒',
    'Publishing Agreement': '📝',
    'Printing Terms': '🖨️',
    'Supplier Agreement': '🤝',
    'Payment Agreement': '💳',
    'Manuscript Submission Form': '📄',
    'Cover Design Brief': '🎨',
    'Unsigned Contract': '✍️',
    'Proof Approval': '✅',
    'Internal Admin': '📁',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Quick Send Document</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 ? 'Step 1 of 2 — Choose document' : step === 2 ? 'Step 2 of 2 — Recipient details' : 'Sent!'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#B87333]' : 'bg-gray-100'}`} />
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Step 1: Choose template */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Select a reusable document from your Template Library to send:</p>
              {templates.filter(t => !t.template_status || t.template_status === 'Active').length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No active templates available.</p>
                  <p className="text-xs mt-1">Upload a template and set its status to "Active" to send it.</p>
                </div>
              ) : (
                templates.filter(t => !t.template_status || t.template_status === 'Active').map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplate(t); setForm(f => ({ ...f, requires_signature: t.requires_signature || false, expiry_days: t.default_expiry_days || 14 })); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selectedTemplate?.id === t.id ? 'border-[#B87333] bg-orange-50' : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}
                  >
                    <span className="text-2xl">{TEMPLATE_ICONS[t.category] || TEMPLATE_ICONS[t.template_label] || '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{t.template_label || t.file_name}</p>
                      <p className="text-xs text-gray-400">{t.category} {t.requires_signature ? '· Requires signature' : ''}</p>
                    </div>
                    {selectedTemplate?.id === t.id && <CheckCircle className="w-5 h-5 text-[#B87333] flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Recipient */}
          {step === 2 && selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100 mb-2">
                <FileText className="w-5 h-5 text-[#B87333]" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedTemplate.template_label || selectedTemplate.file_name}</p>
                  <p className="text-xs text-gray-500">{selectedTemplate.category}</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  <User className="w-3.5 h-3.5" /> Recipient Name *
                </label>
                <Input value={form.recipient_name} onChange={e => set('recipient_name', e.target.value)} placeholder="Full name..." />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  <Mail className="w-3.5 h-3.5" /> Recipient Email *
                </label>
                <Input type="email" value={form.recipient_email} onChange={e => set('recipient_email', e.target.value)} placeholder="email@example.com" />
                {form.recipient_email && contacts.find(c => c.email?.toLowerCase() === form.recipient_email.toLowerCase()) && (
                  <p className="text-xs text-emerald-600 mt-1">✓ Matched to existing contact</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Link Expires (days)
                  </label>
                  <Input type="number" min="1" max="90" value={form.expiry_days} onChange={e => set('expiry_days', parseInt(e.target.value) || 14)} />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.requires_signature} onChange={e => set('requires_signature', e.target.checked)} className="w-4 h-4 accent-[#B87333]" />
                    <span className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Shield className="w-3.5 h-3.5 text-[#B87333]" /> Requires signature
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Custom Message (optional)
                </label>
                <textarea
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  rows={3}
                  placeholder="Add a personal message to the recipient..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B87333]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && sentResult && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Document Sent!</h3>
              <p className="text-sm text-gray-500">
                <strong>{selectedTemplate?.template_label || selectedTemplate?.file_name}</strong> was sent to<br />
                <strong>{sentResult.name}</strong> at <span className="text-[#B87333]">{sentResult.email}</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">The document is now tracked in Sent Documents.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          {step === 1 && (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!selectedTemplate} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
                Next → Recipient
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
              <Button
                onClick={handleSend}
                disabled={sending || !form.recipient_name || !form.recipient_email}
                className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white gap-2"
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Document</>}
              </Button>
            </>
          )}
          {step === 3 && (
            <Button onClick={onClose} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">Done</Button>
          )}
        </div>
      </div>
    </div>
  );
}