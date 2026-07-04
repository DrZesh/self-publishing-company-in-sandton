import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Upload, Trash2, FileText, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { WORKFLOWS, SERVICE_TYPES } from './WORKFLOWS';

const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FileUploadField({ label, url, name, uploading, onUpload, onClear }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
      {url ? (
        <div className="flex items-center gap-2 p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
          <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-medium text-emerald-700 truncate flex-1">{name || 'Uploaded'}</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
          <button type="button" onClick={onClear} className="p-1 hover:bg-emerald-100 rounded-lg">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={event => event.target.files[0] && onUpload(event.target.files[0])}
          />
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Upload className="w-4 h-4 text-slate-400" />}
          <span className="text-xs text-slate-400">{uploading ? 'Uploading...' : 'Upload PDF, JPG or PNG'}</span>
        </label>
      )}
    </div>
  );
}

export default function ProjectModal({ project, onClose, onSaved }) {
  const refs = {
    client_name: useRef(null),
    client_email: useRef(null),
    client_phone: useRef(null),
    assigned_team_member: useRef(null),
    project_title: useRef(null),
    start_date: useRef(null),
    notes: useRef(null),
  };

  const [serviceType, setServiceType] = useState(project?.service_type || 'Book Printing');
  const [status, setStatus] = useState(project?.status || 'active');
  const [stageKey, setStageKey] = useState(project?.current_stage_key || '');
  const [stageLabel, setStageLabel] = useState(project?.current_stage_label || '');
  const [receiptUrl, setReceiptUrl] = useState(project?.payment_receipt_url || '');
  const [receiptName, setReceiptName] = useState(project?.payment_receipt_name || '');
  const [invoiceUrl, setInvoiceUrl] = useState(project?.invoice_url || '');
  const [invoiceName, setInvoiceName] = useState(project?.invoice_name || '');
  const [saving, setSaving] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);

  const { data: workflowRows = [] } = useQuery({
    queryKey: ['client-service-workflows'],
    queryFn: () => base44.entities.ClientServiceWorkflow.list('-updated_date', 100),
    staleTime: 30000,
  });

  const workflowMap = useMemo(() => {
    const map = { ...WORKFLOWS };
    workflowRows.forEach(row => {
      if (Array.isArray(row.stages) && row.stages.length) map[row.service_type] = row.stages;
    });
    return map;
  }, [workflowRows]);

  const stages = workflowMap[serviceType] || [];

  const handleServiceChange = (value) => {
    setServiceType(value);
    const newStages = workflowMap[value] || WORKFLOWS[value] || [];
    const first = newStages[0];
    setStageKey(first?.key || '');
    setStageLabel(first?.label || '');
  };

  const handleStageChange = (key) => {
    const stage = stages.find(item => item.key === key);
    setStageKey(key);
    setStageLabel(stage?.label || '');
  };

  const uploadFile = async (file, type) => {
    const setter = type === 'receipt' ? setUploadingReceipt : setUploadingInvoice;
    setter(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'receipt') {
        setReceiptUrl(file_url);
        setReceiptName(file.name);
      } else {
        setInvoiceUrl(file_url);
        setInvoiceName(file.name);
      }
      toast.success(`${type === 'receipt' ? 'Receipt' : 'Invoice'} uploaded`);
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    const clientName = refs.client_name.current?.value?.trim() || '';
    const clientEmail = refs.client_email.current?.value?.trim() || '';
    const projectTitle = refs.project_title.current?.value?.trim() || '';

    if (!clientName || !clientEmail || !projectTitle) {
      toast.error('Please fill in client name, email, and project title.');
      return;
    }

    setSaving(true);
    try {
      const saveData = {
        client_name: clientName,
        client_email: clientEmail,
        client_phone: refs.client_phone.current?.value?.trim() || '',
        assigned_team_member: refs.assigned_team_member.current?.value?.trim() || '',
        project_title: projectTitle,
        start_date: refs.start_date.current?.value || '',
        notes: refs.notes.current?.value?.trim() || '',
        service_type: serviceType,
        status,
        current_stage_key: stageKey || stages[0]?.key || '',
        current_stage_label: stageLabel || stages[0]?.label || '',
        payment_receipt_url: receiptUrl,
        payment_receipt_name: receiptName,
        invoice_url: invoiceUrl,
        invoice_name: invoiceName,
      };

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
    } catch (error) {
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/60"
        style={{ background: '#ffffff' }}
        onClick={event => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-100 rounded-t-3xl bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{project ? 'Edit Project' : 'New Client Service Project'}</h2>
              <p className="text-xs text-slate-400">Fill in the project details below</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-blue-400 inline-block" />Client Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Client Name *">
                <input ref={refs.client_name} defaultValue={project?.client_name || ''} className={inputClass} placeholder="Jane Smith" />
              </Field>
              <Field label="Client Email *">
                <input ref={refs.client_email} type="email" defaultValue={project?.client_email || ''} className={inputClass} placeholder="jane@example.com" />
              </Field>
              <Field label="Client Phone">
                <input ref={refs.client_phone} defaultValue={project?.client_phone || ''} className={inputClass} placeholder="+27 82 000 0000" />
              </Field>
              <Field label="Assigned Team Member">
                <input ref={refs.assigned_team_member} defaultValue={project?.assigned_team_member || ''} className={inputClass} placeholder="Team member name or email" />
              </Field>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-violet-400 inline-block" />Project Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project / Book Title *">
                <input ref={refs.project_title} defaultValue={project?.project_title || ''} className={inputClass} placeholder="e.g. The Journey Within" />
              </Field>
              <Field label="Service Type *">
                <select value={serviceType} onChange={event => handleServiceChange(event.target.value)} className={inputClass}>
                  {SERVICE_TYPES.map(service => <option key={service} value={service}>{service}</option>)}
                </select>
              </Field>
              <Field label="Start Date">
                <input ref={refs.start_date} type="date" defaultValue={project?.start_date || ''} className={inputClass} />
              </Field>
              <Field label="Project Status">
                <select value={status} onChange={event => setStatus(event.target.value)} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Field>
              {stages.length > 0 && (
                <Field label="Current Stage">
                  <select value={stageKey} onChange={event => handleStageChange(event.target.value)} className={inputClass}>
                    {stages.map(stage => <option key={stage.key} value={stage.key}>{stage.label}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <div className="mt-4">
              <Field label="Project Notes">
                <textarea
                  ref={refs.notes}
                  defaultValue={project?.notes || ''}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Optional notes about this project..."
                />
              </Field>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-amber-400 inline-block" />Payment Documents
            </p>
            <p className="text-xs text-slate-400 mb-3">Optional. Attach the receipt and invoice. These are included in the welcome email only.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUploadField
                label="Payment Receipt"
                url={receiptUrl}
                name={receiptName}
                uploading={uploadingReceipt}
                onUpload={file => uploadFile(file, 'receipt')}
                onClear={() => { setReceiptUrl(''); setReceiptName(''); }}
              />
              <FileUploadField
                label="Invoice"
                url={invoiceUrl}
                name={invoiceName}
                uploading={uploadingInvoice}
                onUpload={file => uploadFile(file, 'invoice')}
                onClear={() => { setInvoiceUrl(''); setInvoiceName(''); }}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 rounded-b-3xl bg-white">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)', boxShadow: '0 4px 15px rgba(184,115,51,0.3)' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
