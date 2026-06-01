import { useState } from 'react';
import { X, Upload, Trash2, FileText, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { WORKFLOWS, SERVICE_TYPES } from './WORKFLOWS';

const EMPTY_FORM = {
  client_name: '', client_email: '', client_phone: '',
  service_type: 'Book Printing', project_title: '', start_date: '',
  notes: '', assigned_team_member: '', current_stage_key: '', current_stage_label: '',
  status: 'active', payment_receipt_url: '', payment_receipt_name: '',
  invoice_url: '', invoice_name: '',
};

export default function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState(project ? { ...project } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);

  const stages = WORKFLOWS[form.service_type] || [];

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === 'service_type') {
      const newStages = WORKFLOWS[v] || [];
      const first = newStages[0];
      next.current_stage_key = first?.key || '';
      next.current_stage_label = first?.label || '';
    }
    return next;
  });

  const uploadFile = async (file, type) => {
    const setter = type === 'receipt' ? setUploadingReceipt : setUploadingInvoice;
    setter(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'receipt') {
        set('payment_receipt_url', file_url);
        set('payment_receipt_name', file.name);
      } else {
        set('invoice_url', file_url);
        set('invoice_name', file.name);
      }
      toast.success(`${type === 'receipt' ? 'Receipt' : 'Invoice'} uploaded`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    if (!form.client_name || !form.client_email || !form.project_title) {
      toast.error('Please fill in client name, email, and project title.');
      return;
    }
    setSaving(true);
    try {
      // Ensure stage is set
      const saveData = { ...form };
      if (!saveData.current_stage_key && stages.length) {
        saveData.current_stage_key = stages[0].key;
        saveData.current_stage_label = stages[0].label;
      }
      // Init stage history on create
      if (!project) {
        saveData.stage_history = [{
          stage_key: saveData.current_stage_key,
          stage_label: saveData.current_stage_label,
          updated_at: new Date().toISOString(),
          updated_by: 'Admin',
          email_sent: false,
        }];
        saveData.total_emails_sent = 0;
        saveData.welcome_email_sent = false;
      }
      let saved;
      if (project?.id) {
        saved = await base44.entities.ClientServiceProject.update(project.id, saveData);
        toast.success('Project updated');
      } else {
        saved = await base44.entities.ClientServiceProject.create(saveData);
        toast.success('Project created');
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const FileUploadField = ({ label, urlKey, nameKey, uploadingState, uploadType }) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
      {form[urlKey] ? (
        <div className="flex items-center gap-2 p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
          <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-medium text-emerald-700 truncate flex-1">{form[nameKey] || 'Uploaded'}</span>
          <a href={form[urlKey]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
          <button onClick={() => { set(urlKey, ''); set(nameKey, ''); }} className="p-1 hover:bg-emerald-100 rounded-lg">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={e => e.target.files[0] && uploadFile(e.target.files[0], uploadType)} />
          {uploadingState ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Upload className="w-4 h-4 text-slate-400" />}
          <span className="text-xs text-slate-400">{uploadingState ? 'Uploading...' : 'Upload PDF, JPG or PNG'}</span>
        </label>
      )}
    </div>
  );

  const Field = ({ label, children }) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/60"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(40px)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-100 rounded-t-3xl" style={{ background: 'rgba(255,255,255,0.98)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{project ? 'Edit Project' : 'New Client Service Project'}</h2>
              <p className="text-xs text-slate-400">Fill in the project details below</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-blue-400 inline-block" />Client Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Client Name *">
                <input value={form.client_name} onChange={e => set('client_name', e.target.value)} className={inputClass} placeholder="Jane Smith" />
              </Field>
              <Field label="Client Email *">
                <input type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} className={inputClass} placeholder="jane@example.com" />
              </Field>
              <Field label="Client Phone">
                <input value={form.client_phone} onChange={e => set('client_phone', e.target.value)} className={inputClass} placeholder="+27 82 000 0000" />
              </Field>
              <Field label="Assigned Team Member">
                <input value={form.assigned_team_member} onChange={e => set('assigned_team_member', e.target.value)} className={inputClass} placeholder="Team member name or email" />
              </Field>
            </div>
          </div>

          {/* Project */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-violet-400 inline-block" />Project Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project / Book Title *">
                <input value={form.project_title} onChange={e => set('project_title', e.target.value)} className={inputClass} placeholder="e.g. The Journey Within" />
              </Field>
              <Field label="Service Type *">
                <select value={form.service_type} onChange={e => set('service_type', e.target.value)} className={inputClass}>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Start Date">
                <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Project Status">
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Field>
              {stages.length > 0 && (
                <Field label="Current Stage">
                  <select value={form.current_stage_key} onChange={e => {
                    const s = stages.find(s => s.key === e.target.value);
                    set('current_stage_key', e.target.value);
                    set('current_stage_label', s?.label || '');
                  }} className={inputClass}>
                    {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <div className="mt-4">
              <Field label="Project Notes">
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                  className={inputClass + ' resize-none'} placeholder="Optional notes about this project..." />
              </Field>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-amber-400 inline-block" />Payment Documents
            </p>
            <p className="text-xs text-slate-400 mb-3">Optional — attach receipt and invoice from your payments system. These are included in the welcome email only.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUploadField label="Payment Receipt" urlKey="payment_receipt_url" nameKey="payment_receipt_name" uploadingState={uploadingReceipt} uploadType="receipt" />
              <FileUploadField label="Invoice" urlKey="invoice_url" nameKey="invoice_name" uploadingState={uploadingInvoice} uploadType="invoice" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 rounded-b-3xl" style={{ background: 'rgba(255,255,255,0.98)' }}>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)', boxShadow: '0 4px 15px rgba(184,115,51,0.3)' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}