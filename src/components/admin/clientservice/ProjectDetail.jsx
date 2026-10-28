import { X, Mail, Clock, CheckCircle, XCircle, RefreshCw, FileText, RotateCcw, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import ProjectTimeline from './ProjectTimeline';
import { STATUS_COLORS, SERVICE_COLORS } from './WORKFLOWS';

export default function ProjectDetail({ project, emailLogs, onClose, onUpdated, onOpenStageModal }) {
  const [resending, setResending] = useState(null);
  const projectLogs = [...emailLogs].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

  const handleResend = async (log) => {
    setResending(log.id);
    try {
      await platform.functions.invoke('clientServiceActions', {
        action: 'send_stage_email',
        projectId: project.id,
        stageKey: log.stage_key,
        stageLabel: log.stage_label,
        subject: log.subject,
        emailBody: log.body_html,
        isWelcome: log.is_welcome_email,
        forceResend: true,
      });
      toast.success('Email resent successfully');
      onUpdated();
    } catch (err) {
      toast.error('Resend failed: ' + err.message);
    } finally {
      setResending(null);
    }
  };

  const sc = STATUS_COLORS[project.status] || STATUS_COLORS.active;
  const svc = SERVICE_COLORS[project.service_type] || SERVICE_COLORS['Book Printing'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:w-[520px] h-full sm:h-auto sm:max-h-[94vh] overflow-y-auto sm:rounded-3xl shadow-2xl border border-white/60 flex flex-col"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(40px)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-100 rounded-t-3xl flex items-start justify-between gap-3"
          style={{ background: 'rgba(255,255,255,0.98)' }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${svc.bg} ${svc.text} ${svc.border}`}>{project.service_type}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border} flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{project.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-800 truncate">{project.project_title}</h2>
            <p className="text-xs text-slate-400">{project.client_name} · {project.client_email}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onOpenStageModal}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
              <Send className="w-3.5 h-3.5" /> Update Stage
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current stage */}
          <div className="rounded-2xl p-4 border border-blue-100 bg-blue-50/60">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Current Stage</p>
            <p className="text-sm font-bold text-blue-700">{project.current_stage_label || 'Not set'}</p>
          </div>

          {/* Project notes */}
          {project.notes && (
            <div className="rounded-xl p-3 border border-slate-100 bg-slate-50/60">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-xs text-slate-600 leading-relaxed">{project.notes}</p>
            </div>
          )}

          {/* Attachments */}
          {(project.payment_receipt_url || project.invoice_url) && (
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-amber-400 inline-block" />Payment Documents
              </p>
              <div className="space-y-2">
                {project.payment_receipt_url && (
                  <a href={project.payment_receipt_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700 flex-1 truncate">{project.payment_receipt_name || 'Payment Receipt'}</span>
                    <span className="text-[9px] text-emerald-500">View</span>
                  </a>
                )}
                {project.invoice_url && (
                  <a href={project.invoice_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 flex-1 truncate">{project.invoice_name || 'Invoice'}</span>
                    <span className="text-[9px] text-blue-500">View</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-violet-400 inline-block" />Project Timeline
            </p>
            <div className="rounded-2xl border border-slate-100 p-4" style={{ background: 'rgba(248,250,252,0.6)' }}>
              <ProjectTimeline project={project} />
            </div>
          </div>

          {/* Email History */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-sky-400 inline-block" />Email History ({projectLogs.length})
            </p>
            {projectLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">No emails sent yet.</div>
            ) : (
              <div className="space-y-2">
                {projectLogs.map(log => (
                  <div key={log.id} className="rounded-xl border border-slate-100 p-3" style={{ background: 'rgba(248,250,252,0.6)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {log.status === 'sent' || log.status === 'resent' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          log.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                          log.status === 'resent' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>{log.status}</span>
                        {log.is_welcome_email && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Welcome</span>}
                      </div>
                      {log.status === 'failed' && (
                        <button onClick={() => handleResend(log)} disabled={resending === log.id}
                          className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700 px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                          {resending === log.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          Resend
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-2 leading-tight">{log.subject}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.sent_at).toLocaleString('en-ZA')}
                      </span>
                      {log.sent_by && <span className="text-[10px] text-slate-400">by {log.sent_by}</span>}
                    </div>
                    {log.attachments_included?.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] text-amber-600">Attached: {log.attachments_included.join(', ')}</span>
                      </div>
                    )}
                    {log.error_message && (
                      <p className="text-[10px] text-red-500 mt-1">Error: {log.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}