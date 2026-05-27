import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Signed Contract', 'Unsigned Contract', 'Quotation', 'Invoice',
  'Payment Proof', 'Manuscript', 'Book Cover File', 'Typesetting File',
  'Final Print File', 'Proof Approval', 'ISBN Document', 'Copyright Page',
  'Printing Spec', 'Courier Document', 'Client Supplied', 'Internal Admin'
];

export default function DocumentUploadModal({ contacts, document, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: document?.contact_id || '',
    category: document?.category || 'Client Supplied',
    status: document?.status || 'Draft',
    book_title: document?.book_title || '',
    notes: document?.notes || '',
    version: document?.version || 1,
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.contact_id || !form.category) return;
    setSaving(true);

    let file_url = document?.file_url || '';
    let file_name = document?.file_name || '';
    let file_type = document?.file_type || '';
    let file_size_kb = document?.file_size_kb || 0;

    if (file) {
      setUploading(true);
      const result = await base44.integrations.Core.UploadFile({ file });
      file_url = result.file_url;
      file_name = file.name;
      file_type = file.type;
      file_size_kb = Math.round(file.size / 1024);
      setUploading(false);
    }

    if (!file_url && !document) { setSaving(false); return; }

    const data = { ...form, file_url, file_name, file_type, file_size_kb, uploaded_by: (await base44.auth.me())?.email || '' };

    if (document) await base44.entities.Document.update(document.id, data);
    else await base44.entities.Document.create(data);

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{document ? 'Edit Document' : 'Upload Document'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
            <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {['Draft', 'Sent to Client', 'Awaiting Signature', 'Signed', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Book Title</label>
            <Input value={form.book_title} onChange={e => set('book_title', e.target.value)} placeholder="Associated book title" />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
              {document ? 'Replace File (optional)' : 'File *'}
            </label>
            <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-[#B87333] bg-orange-50/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
              <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-[#B87333]">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(file.size / 1024)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional notes..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading || !form.contact_id || (!file && !document)} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</> : saving ? 'Saving...' : document ? 'Update' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}