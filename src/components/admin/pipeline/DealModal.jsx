import { useRef, useState } from 'react';
import { X, Loader2, ExternalLink, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import { SERVICE_TYPES } from '@/components/admin/clientservice/WORKFLOWS';

const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all";

function Field({ label, children, required }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function DealModal({ deal, pipeline, stages, onClose, onSaved, onRetryProject }) {
  const isEdit = !!deal?.id;
  const refs = {
    client_name: useRef(null),
    client_email: useRef(null),
    client_phone: useRef(null),
    project_title: useRef(null),
    deal_value: useRef(null),
    notes: useRef(null),
    assigned_team_member: useRef(null),
  };

  const [serviceType, setServiceType] = useState(deal?.service_type || '');
  const [stageKey, setStageKey] = useState(deal?.stage_key || stages[0]?.key || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const client_name = refs.client_name.current?.value?.trim();
    if (!client_name) { toast.error('Client name is required'); return; }
    setSaving(true);
    try {
      const data = {
        pipeline_id: pipeline.id,
        stage_key: stageKey,
        client_name,
        client_email: refs.client_email.current?.value?.trim() || '',
        client_phone: refs.client_phone.current?.value?.trim() || '',
        project_title: refs.project_title.current?.value?.trim() || '',
        deal_value: parseFloat(refs.deal_value.current?.value) || 0,
        notes: refs.notes.current?.value?.trim() || '',
        assigned_team_member: refs.assigned_team_member.current?.value?.trim() || '',
        service_type: serviceType,
      };
      let saved;
      if (isEdit) {
        saved = await platform.entities.PipelineDeal.update(deal.id, data);
        toast.success('Deal updated');
      } else {
        saved = await platform.entities.PipelineDeal.create(data);
        toast.success('Deal created');
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this deal? This cannot be undone.')) return;
    await platform.entities.PipelineDeal.delete(deal.id);
    toast.success('Deal deleted');
    onSaved(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/60 bg-white"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white rounded-t-3xl">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Deal' : 'New Deal'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Won / project status */}
          {isEdit && deal.linked_project_id && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-700 font-medium">Project created from this deal</span>
            </div>
          )}
          {isEdit && deal.project_creation_failed && (
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-red-700 font-medium">Project creation failed: {deal.project_creation_error || 'Unknown error'}</span>
              </div>
              <button onClick={() => { onRetryProject(deal); onClose(); }}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Stage */}
          <Field label="Stage">
            <select value={stageKey} onChange={e => setStageKey(e.target.value)} className={inputClass}>
              {stages.map(s => (
                <option key={s.key} value={s.key}>
                  {s.label}{s.isWon ? ' 🏆 Won' : ''}{s.isLost ? ' ✗ Lost' : ''}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client Name" required>
              <input ref={refs.client_name} defaultValue={deal?.client_name || ''} className={inputClass} placeholder="Jane Smith" />
            </Field>
            <Field label="Client Email">
              <input ref={refs.client_email} type="email" defaultValue={deal?.client_email || ''} className={inputClass} placeholder="jane@example.com" />
            </Field>
            <Field label="Client Phone">
              <input ref={refs.client_phone} defaultValue={deal?.client_phone || ''} className={inputClass} placeholder="+27 82 000 0000" />
            </Field>
            <Field label="Service Type">
              <select value={serviceType} onChange={e => setServiceType(e.target.value)} className={inputClass}>
                <option value="">— Select Service —</option>
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Book / Project Title">
              <input ref={refs.project_title} defaultValue={deal?.project_title || ''} className={inputClass} placeholder="e.g. The Journey Within" />
            </Field>
            <Field label="Deal Value (R)">
              <input ref={refs.deal_value} type="number" defaultValue={deal?.deal_value || ''} className={inputClass} placeholder="0.00" />
            </Field>
            <Field label="Assigned Team Member">
              <input ref={refs.assigned_team_member} defaultValue={deal?.assigned_team_member || ''} className={inputClass} placeholder="Team member name" />
            </Field>
          </div>

          <Field label="Notes">
            <textarea ref={refs.notes} defaultValue={deal?.notes || ''} rows={3}
              className={inputClass + ' resize-none'} placeholder="Deal notes..." />
          </Field>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 px-6 py-4 flex justify-between gap-3 bg-white rounded-b-3xl">
          <div>
            {isEdit && (
              <button onClick={handleDelete} className="px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)', boxShadow: '0 4px 15px rgba(184,115,51,0.3)' }}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}