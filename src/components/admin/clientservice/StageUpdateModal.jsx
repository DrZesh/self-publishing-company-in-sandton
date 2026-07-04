import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Eye, Send, Edit3, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { WORKFLOWS as DEFAULT_WORKFLOWS } from './WORKFLOWS';

export default function StageUpdateModal({ project, onClose, onUpdated }) {
  const { data: workflowRows = [] } = useQuery({
    queryKey: ['client-service-workflow', project.service_type],
    queryFn: () => base44.entities.ClientServiceWorkflow.filter(
      { service_type: project.service_type },
      '-updated_date',
      1,
    ),
    staleTime: 30000,
  });

  const stages = useMemo(() => {
    const stored = workflowRows[0]?.stages;
    return Array.isArray(stored) && stored.length
      ? stored
      : (DEFAULT_WORKFLOWS[project.service_type] || []);
  }, [workflowRows, project.service_type]);

  const [selectedStage, setSelectedStage] = useState(null);
  const [emailBody, setEmailBody] = useState('');
  const [subject, setSubject] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stages.length) {
      setSelectedStage(null);
      return;
    }

    const stillExists = selectedStage && stages.some(stage => stage.key === selectedStage.key);
    if (stillExists) return;

    const currentIdx = stages.findIndex(stage => stage.key === project.current_stage_key);
    const nextIndex = currentIdx >= 0 ? Math.min(currentIdx + 1, stages.length - 1) : 0;
    setSelectedStage(stages[nextIndex] || stages[0]);
  }, [stages, project.current_stage_key, selectedStage]);

  useEffect(() => {
    if (!selectedStage) return;
    setSubject(selectedStage.subject || '');
    const body = (selectedStage.defaultBody || '').replace(/{{project_title}}/g, project.project_title);
    setEmailBody(body.replace(/\n/g, '<br />'));
    setPreview(false);
    setEditingEmail(false);
  }, [selectedStage, project.project_title]);

  const handleStageOnly = async () => {
    if (!selectedStage) return;
    setLoading(true);
    try {
      await base44.functions.invoke('clientServiceActions', {
        action: 'update_stage',
        projectId: project.id,
        stageKey: selectedStage.key,
        stageLabel: selectedStage.label,
      });
      toast.success(`Stage updated to: ${selectedStage.label}`);
      onUpdated();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  const handleStageAndEmail = async () => {
    if (!selectedStage) return;
    setLoading(true);
    try {
      await base44.functions.invoke('clientServiceActions', {
        action: 'update_stage_and_send',
        projectId: project.id,
        stageKey: selectedStage.key,
        stageLabel: selectedStage.label,
        subject,
        emailBody,
        isWelcome: selectedStage.isWelcome || false,
      });
      toast.success('Stage updated and email sent!');
      onUpdated();
      onClose();
    } catch (error) {
      if (error.message?.includes('already sent')) {
        toast.error('An email for this stage was already sent. Use Resend if you need to send again.');
      } else {
        toast.error(error.message || 'Failed to send email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/60"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(40px)' }}
        onClick={event => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-100 rounded-t-3xl" style={{ background: 'rgba(255,255,255,0.98)' }}>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Update Stage</h2>
            <p className="text-xs text-slate-400 mt-0.5">{project.client_name} · {project.project_title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Client', value: project.client_name },
              { label: 'Service', value: project.service_type },
              { label: 'Project', value: project.project_title },
              { label: 'Current Stage', value: project.current_stage_label || '—' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3 border border-slate-100" style={{ background: 'rgba(248,250,252,0.8)' }}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700 leading-tight">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Select New Stage</label>
            <div className="relative">
              <select
                value={selectedStage?.key || ''}
                onChange={event => setSelectedStage(stages.find(stage => stage.key === event.target.value) || null)}
                className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                style={{ background: 'rgba(255,255,255,0.9)' }}
              >
                {stages.map(stage => (
                  <option key={stage.key} value={stage.key}>{stage.label}{stage.isWelcome ? ' (Welcome Email)' : ''}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden" style={{ background: 'rgba(248,250,252,0.6)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-600">Email Template</p>
                <p className="text-[10px] text-slate-400 mt-0.5">to: {project.client_email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setPreview(!preview); setEditingEmail(false); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> {preview ? 'Close Preview' : 'Preview'}
                </button>
                <button onClick={() => { setEditingEmail(!editingEmail); setPreview(false); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> {editingEmail ? 'Done' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Subject</label>
                {editingEmail ? (
                  <input value={subject} onChange={event => setSubject(event.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                ) : (
                  <p className="text-sm text-slate-700 font-medium">{subject}</p>
                )}
              </div>

              {editingEmail ? (
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Body (HTML supported)</label>
                  <textarea value={emailBody} onChange={event => setEmailBody(event.target.value)} rows={8}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none font-mono text-xs leading-relaxed" />
                </div>
              ) : preview ? (
                <div className="border border-slate-100 rounded-xl p-4 bg-white text-sm text-slate-600 leading-relaxed max-h-48 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: emailBody }} />
              ) : (
                <p className="text-xs text-slate-400 italic">Click "Preview" to see the email or "Edit" to modify it.</p>
              )}

              {selectedStage?.isWelcome && (project.payment_receipt_url || project.invoice_url) && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <span className="font-semibold">Attachments will be included: </span>
                    {[project.payment_receipt_name && 'Payment Receipt', project.invoice_name && 'Invoice'].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-100 px-6 py-4 flex items-center gap-3 rounded-b-3xl" style={{ background: 'rgba(255,255,255,0.98)' }}>
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleStageOnly} disabled={loading || !selectedStage}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Update Stage Only
          </button>
          <button onClick={handleStageAndEmail} disabled={loading || !selectedStage}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)', boxShadow: '0 4px 15px rgba(184,115,51,0.3)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Update &amp; Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
