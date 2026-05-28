import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Loader2, Sparkles, Tag } from 'lucide-react';

const DOCUMENT_LABELS = ['Legal', 'Finance', 'Client-Facing', 'Internal', 'Supplier', 'Urgent', 'Confidential', 'Requires Action'];
const TEMPLATE_STATUSES = ['Draft Template', 'Pending Approval', 'Active', 'Archived Template'];

const CATEGORIES = [
  'Signed Contract', 'Unsigned Contract', 'NDA', 'Publishing Agreement',
  'Quotation', 'Invoice', 'Payment Proof', 'Payment Agreement',
  'Manuscript', 'Manuscript Submission Form', 'Book Cover File', 'Cover Design Brief',
  'Typesetting File', 'Final Print File', 'Proof Approval', 'ISBN Document',
  'Copyright Page', 'Printing Spec', 'Printing Terms', 'Supplier Agreement',
  'Courier Document', 'Client Supplied', 'Internal Admin'
];

export default function DocumentUploadModal({ contacts, document, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: document?.contact_id || '',
    category: document?.category || 'Client Supplied',
    status: document?.status || 'Draft',
    book_title: document?.book_title || '',
    notes: document?.notes || '',
    version: document?.version || 1,
    is_template: document?.is_template || false,
    template_label: document?.template_label || '',
    template_status: document?.template_status || 'Draft Template',
    requires_signature: document?.requires_signature || false,
    default_expiry_days: document?.default_expiry_days || 14,
    labels: document?.labels || [],
    ai_summary: document?.ai_summary || '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const toggleLabel = (label) => {
    setForm(f => ({
      ...f,
      labels: f.labels.includes(label) ? f.labels.filter(l => l !== label) : [...f.labels, label]
    }));
  };

  const generateAISummary = async () => {
    if (!form.template_label && !form.category) return;
    setGeneratingSummary(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a brief 1-2 sentence summary explaining what this document type is and when it is used in a self-publishing or book printing company context. Document type: "${form.template_label || form.category}". Keep it practical and clear for staff.`,
    });
    setForm(f => ({ ...f, ai_summary: result }));
    setGeneratingSummary(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.is_template && !form.contact_id) return;
    if (!form.category) return;
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
    // Templates don't require contact_id
    if (form.is_template) delete data.contact_id;

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
          {/* Template toggle */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <input type="checkbox" id="is_template" checked={form.is_template} onChange={e => set('is_template', e.target.checked)} className="w-4 h-4 accent-purple-600" />
            <label htmlFor="is_template" className="text-sm font-medium text-purple-800 cursor-pointer">
              Save as Reusable Template (no client required)
            </label>
          </div>

          {form.is_template && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Template Label</label>
              <input value={form.template_label} onChange={e => set('template_label', e.target.value)} placeholder="e.g. NDA, Publishing Agreement..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}

          {!form.is_template && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
              <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Select client...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {!form.is_template && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  {['Draft', 'Sent to Client', 'Awaiting Signature', 'Signed', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Template settings */}
          {form.is_template && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Approval Status</label>
                  <select value={form.template_status} onChange={e => set('template_status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                    {TEMPLATE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Default expiry (days)</label>
                  <input type="number" min="1" max="90" value={form.default_expiry_days} onChange={e => set('default_expiry_days', parseInt(e.target.value) || 14)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="req_sig" checked={form.requires_signature} onChange={e => set('requires_signature', e.target.checked)} className="w-4 h-4 accent-[#B87333]" />
                <label htmlFor="req_sig" className="text-sm text-gray-700 cursor-pointer">Requires signature</label>
              </div>
            </div>
          )}

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

          {/* Labels */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Tag className="w-3 h-3" /> Labels</label>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_LABELS.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.labels.includes(label)
                      ? 'bg-[#B87333] text-white border-[#B87333]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#B87333]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          {form.is_template && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-500" /> AI Summary</span>
                <button type="button" onClick={generateAISummary} disabled={generatingSummary} className="text-[10px] text-purple-600 hover:underline font-normal">
                  {generatingSummary ? 'Generating...' : 'Generate'}
                </button>
              </label>
              <textarea
                value={form.ai_summary}
                onChange={e => set('ai_summary', e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="AI-generated summary of what this document is used for..."
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional notes..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading || (!form.is_template && !form.contact_id) || (!file && !document)} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</> : saving ? 'Saving...' : document ? 'Update' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}