import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Loader2 } from 'lucide-react';

export default function ContractModal({ contacts, contract, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: contract?.contact_id || '',
    title: contract?.title || '',
    book_title: contract?.book_title || '',
    status: contract?.status || 'Draft',
    expiry_date: contract?.expiry_date || '',
    notes: contract?.notes || '',
  });
  const [contractFile, setContractFile] = useState(null);
  const [signedFile, setSignedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const uploadFile = async (file) => {
    const result = await base44.integrations.Core.UploadFile({ file });
    return result.file_url;
  };

  const handleSave = async () => {
    if (!form.contact_id || !form.title) return;
    setSaving(true);
    setUploading(true);

    let contract_file_url = contract?.contract_file_url || '';
    let signed_file_url = contract?.signed_file_url || '';

    if (contractFile) contract_file_url = await uploadFile(contractFile);
    if (signedFile) {
      signed_file_url = await uploadFile(signedFile);
      form.status = 'Signed';
      form.signed_at = new Date().toISOString();
    }

    setUploading(false);
    const data = { ...form, contract_file_url, signed_file_url };

    if (contract) await base44.entities.Contract.update(contract.id, data);
    else await base44.entities.Contract.create(data);

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{contract ? 'Edit Contract' : 'New Contract'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
            <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Contract Title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Publishing Agreement — My Book Title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Book Title</label>
              <Input value={form.book_title} onChange={e => set('book_title', e.target.value)} placeholder="Book title" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Expiry Date</label>
              <Input type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              {['Draft', 'Sent', 'Signed', 'Expired', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Contract File Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Contract File (unsigned)</label>
            <label className={`flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${contractFile ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setContractFile(e.target.files[0])} />
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">{contractFile ? contractFile.name : contract?.contract_file_url ? 'Replace contract file' : 'Upload contract PDF'}</span>
            </label>
          </div>

          {/* Signed File Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Signed Contract (optional)</label>
            <label className={`flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${signedFile ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => setSignedFile(e.target.files[0])} />
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">{signedFile ? signedFile.name : contract?.signed_file_url ? 'Replace signed file' : 'Upload signed version'}</span>
            </label>
            {signedFile && <p className="text-xs text-green-600 mt-1">Status will automatically update to Signed</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Internal notes..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading || !form.contact_id || !form.title} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {(saving || uploading) ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{uploading ? 'Uploading...' : 'Saving...'}</> : contract ? 'Update Contract' : 'Save Contract'}
          </Button>
        </div>
      </div>
    </div>
  );
}