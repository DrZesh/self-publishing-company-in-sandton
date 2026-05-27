import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PenTool, Upload, FileSignature, ExternalLink, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const METHODS = [
  {
    key: 'builtin',
    icon: PenTool,
    title: 'Built-in CRM Signing',
    desc: 'Client draws or types signature in browser via secure client portal link. No third-party account required.',
    color: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    badge: 'Recommended',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    key: 'manual',
    icon: Upload,
    title: 'Manual Signed PDF Upload',
    desc: 'Send contract via email, client prints and signs, then scans and returns. Upload the signed copy here.',
    color: 'border-gray-200 bg-gray-50 hover:bg-gray-100',
    iconColor: 'text-gray-600',
    badge: 'Simple',
    badgeColor: 'bg-gray-200 text-gray-600',
  },
  {
    key: 'docusign',
    icon: FileSignature,
    title: 'DocuSign',
    desc: 'Send a DocuSign envelope. Requires DocuSign API credentials configured in Integration Settings.',
    color: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'External',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'adobe',
    icon: ExternalLink,
    title: 'Adobe Acrobat Sign',
    desc: 'Send via Adobe Sign. Requires Adobe Sign API credentials configured in Integration Settings.',
    color: 'border-red-200 bg-red-50 hover:bg-red-100',
    iconColor: 'text-red-600',
    badge: 'External',
    badgeColor: 'bg-red-100 text-red-700',
  },
];

export default function SigningMethodSelector({ contacts, onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1=method, 2=details
  const [method, setMethod] = useState(null);
  const [form, setForm] = useState({ contact_id: '', title: '', book_title: '', notes: '', contract_file_url: '', expiry_date: '' });
  const [contractFile, setContractFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = async (file) => {
    setContractFile(file);
    setSaving(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(p => ({ ...p, contract_file_url: file_url }));
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!form.contact_id || !form.title) { toast.error('Contact and title are required'); return; }
    setSaving(true);
    try {
      await base44.entities.Contract.create({
        contact_id: form.contact_id,
        title: form.title,
        book_title: form.book_title,
        notes: form.notes,
        contract_file_url: form.contract_file_url,
        expiry_date: form.expiry_date || null,
        signing_method: method,
        status: 'Draft',
      });
      toast.success('Signing request created');
      onCreated?.();
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-900">New Signing Request</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Choose how the client will sign this document:</p>
              {METHODS.map(m => (
                <button key={m.key} onClick={() => { setMethod(m.key); setStep(2); }}
                  className={`w-full flex items-start gap-4 p-4 border-2 rounded-xl text-left transition-all ${method === m.key ? 'ring-2 ring-[#B87333]' : ''} ${m.color}`}>
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <m.icon className={`w-5 h-5 ${m.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-600">← Back to method selection</button>
              <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                {(() => { const m = METHODS.find(m => m.key === method); return m ? <><m.icon className={`w-4 h-4 ${m.iconColor}`} /><span className="text-sm font-medium text-gray-700">{m.title}</span></> : null; })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client *</label>
                  <select value={form.contact_id} onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                    <option value="">Select client...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Title *</label>
                  <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Publishing Agreement — The Journey Home" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Book Title</label>
                  <Input value={form.book_title} onChange={e => setForm(p => ({ ...p, book_title: e.target.value }))} placeholder="Book title" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <Input type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
                </div>

                {/* Contract file upload */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Document (PDF)</label>
                  <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${form.contract_file_url ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-[#B87333]/50'}`}>
                    <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                    {saving ? <Loader2 className="w-5 h-5 animate-spin text-[#B87333]" /> : form.contract_file_url ? <FileSignature className="w-5 h-5 text-green-600" /> : <Upload className="w-5 h-5 text-gray-400" />}
                    <div>
                      <p className="text-sm text-gray-700">{form.contract_file_url ? 'Contract uploaded ✓' : contractFile ? contractFile.name : 'Upload contract PDF'}</p>
                      <p className="text-xs text-gray-400">The document the client will sign</p>
                    </div>
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Internal notes about this contract..."
                    rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
                </div>
              </div>

              {(method === 'docusign' || method === 'adobe') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> {method === 'docusign' ? 'DocuSign' : 'Adobe Sign'} integration requires API credentials configured in Integration Settings. 
                    The contract record will be created in the CRM; the actual envelope/agreement must then be sent via the {method === 'docusign' ? 'DocuSign' : 'Adobe Sign'} dashboard or once API credentials are configured.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreate} disabled={saving} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Signing Request
                </Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}