import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Edit2, AlertTriangle, Lock, Users, Clock, Plus } from 'lucide-react';
import ProjectModal from './ProjectModal';
import PrintChecklist from './PrintChecklist';
import ProjectQRCode from '@/components/admin/ProjectQRCode';

const STAGES = [
  'Enquiry Received', 'Quote Sent', 'Quote Accepted', 'Contract Sent', 'Contract Signed',
  'Payment Received', 'Manuscript Received', 'Editing', 'Proofreading', 'Typesetting',
  'Cover Design', 'Client Approval', 'Changes Requested', 'Final Approval Received',
  'Sample Print Queued', 'Sample Print Completed', 'Mass Production Started',
  'Ready for Collection', 'Courier Booked', 'Delivered', 'Completed'
];

const WAITING_ON_OPTIONS = ['None','Client','Admin','Editor','Designer','Typesetter','Production','Courier','Payment','Approval','Documents'];
const WAITING_ON_COLORS = {
  Client: 'bg-orange-100 text-orange-700',
  Admin: 'bg-blue-100 text-blue-700',
  Editor: 'bg-yellow-100 text-yellow-700',
  Designer: 'bg-pink-100 text-pink-700',
  Typesetter: 'bg-purple-100 text-purple-700',
  Production: 'bg-teal-100 text-teal-700',
  Courier: 'bg-sky-100 text-sky-700',
  Payment: 'bg-red-100 text-red-700',
  Approval: 'bg-amber-100 text-amber-700',
  Documents: 'bg-slate-100 text-slate-700',
  None: 'bg-gray-100 text-gray-500',
};

const DELAY_TYPES = ['Late Manuscript','Late Payment','Late Approval','Late Corrections','Wrong File Sent','Changed Specifications','Client Unresponsive','Contract Delay','Other'];

export default function ProjectDetailPanel({ project, contact, onClose, onUpdated }) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [delayType, setDelayType] = useState('');
  const [delayDesc, setDelayDesc] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
    enabled: showEdit,
  });

  const { data: delays = [] } = useQuery({
    queryKey: ['client-delays', project.id],
    queryFn: () => base44.entities.ClientDelay.filter({ project_id: project.id }),
  });

  const addDelay = useMutation({
    mutationFn: (data) => base44.entities.ClientDelay.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-delays', project.id] });
      setShowDelayForm(false);
      setDelayType('');
      setDelayDesc('');
    },
  });

  const handleStageChange = async (newStage) => {
    setUpdatingStage(true);
    await base44.entities.Project.update(project.id, { stage: newStage, stage_changed_at: new Date().toISOString() });
    setUpdatingStage(false);
    onUpdated();
  };

  const handleWaitingOnChange = async (val) => {
    await base44.entities.Project.update(project.id, { waiting_on: val });
    onUpdated();
  };

  const handleQueueBlur = async (val) => {
    const num = parseInt(val);
    if (!isNaN(num)) {
      await base44.entities.Project.update(project.id, { queue_number: num });
      onUpdated();
    }
  };

  const currentStageIndex = STAGES.indexOf(project.stage);

  // Compute do-not-start reasons
  const doNotStartReasons = [];
  if (project.contract_status !== 'Signed') doNotStartReasons.push('Contract not signed');
  if (['Unpaid', 'Overdue'].includes(project.payment_status)) doNotStartReasons.push('Payment not confirmed');
  if (!project.book_spec?.page_count) doNotStartReasons.push('Book specs incomplete');
  const productionStages = ['Editing','Proofreading','Typesetting','Cover Design','Sample Print Queued','Mass Production Started'];
  const isInProduction = productionStages.includes(project.stage);

  // Revision alerts
  const counts = project.revision_counts || {};
  const limits = project.revision_limits || { cover_design: 2, editing: 1, layout: 2, proofreading: 1 };
  const revisionAlerts = Object.entries(limits).filter(([k, lim]) => (counts[k] || 0) >= lim);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900">{project.book_title}</h2>
                {project.is_vip && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">⭐ VIP</span>}
                {project.queue_number && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">#{String(project.queue_number).padStart(3, '0')}</span>}
              </div>
              <p className="text-sm text-gray-500">{contact?.full_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <ProjectQRCode project={project} contact={contact} />
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}><Edit2 className="w-4 h-4" /></Button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Value</p>
                <p className="text-sm font-bold text-gray-900 mt-1">R {(project.project_value || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Payment</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">{project.payment_status}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Contract</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">{project.contract_status}</p>
              </div>
            </div>

            {/* Do Not Start Lock */}
            {doNotStartReasons.length > 0 && isInProduction && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700">⚠️ Do Not Start — Requirements Missing</p>
                  <ul className="mt-1 space-y-0.5">
                    {doNotStartReasons.map(r => <li key={r} className="text-xs text-red-600">• {r}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* Revision Alerts */}
            {revisionAlerts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-700 mb-2">⚡ Revision Limit Reached</p>
                {revisionAlerts.map(([k, lim]) => (
                  <p key={k} className="text-xs text-amber-800">• {k.replace('_', ' ')}: {counts[k] || 0}/{lim} rounds used — further changes may be billable</p>
                ))}
              </div>
            )}

            {/* Risk Alert */}
            {project.is_at_risk && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Project at risk</p>
                  {project.risk_reason && <p className="text-xs text-red-600 mt-1">{project.risk_reason}</p>}
                </div>
              </div>
            )}

            {/* Waiting On + Queue Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" /> Waiting On
                </p>
                <select
                  value={project.waiting_on || 'None'}
                  onChange={e => handleWaitingOnChange(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                >
                  {WAITING_ON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {project.waiting_on && project.waiting_on !== 'None' && (
                  <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${WAITING_ON_COLORS[project.waiting_on] || ''}`}>
                    Waiting on {project.waiting_on}
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Print Queue #
                </p>
                <input
                  type="number"
                  defaultValue={project.queue_number || ''}
                  onBlur={e => handleQueueBlur(e.target.value)}
                  placeholder="e.g. 024"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                />
                {project.queue_type && <p className="text-[10px] text-gray-400 mt-1">{project.queue_type}</p>}
              </div>
            </div>

            {/* Pipeline Progress */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Production Pipeline</h3>
              <div className="space-y-1">
                {STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      disabled={updatingStage}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        isCurrent ? 'bg-[#B87333] text-white font-semibold' :
                        isDone ? 'bg-green-50 text-green-700' :
                        'hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isCurrent ? 'bg-white/30 text-white' :
                        isDone ? 'bg-green-200 text-green-700' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </span>
                      {stage}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Project Details</h3>
              {[
                { label: 'Author', value: project.author_name },
                { label: 'Service Type', value: project.service_type },
                { label: 'Deadline', value: project.deadline ? new Date(project.deadline).toLocaleDateString('en-ZA') : null },
                { label: 'Assigned Manager', value: project.assigned_manager },
              ].filter(d => d.value).map(d => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{d.label}</span>
                  <span className="text-gray-900 font-medium">{d.value}</span>
                </div>
              ))}
            </div>

            {/* Print Checklist */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Pre-Production Checklist</h3>
              <PrintChecklist project={project} />
            </div>

            {/* Client Delays */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Client Delays
                  {delays.length > 0 && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{delays.length}</span>
                  )}
                </h3>
                <button onClick={() => setShowDelayForm(v => !v)} className="text-xs text-[#B87333] hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Log Delay
                </button>
              </div>
              {showDelayForm && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 space-y-2">
                  <select value={delayType} onChange={e => setDelayType(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                    <option value="">Select delay type…</option>
                    {DELAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <textarea
                    value={delayDesc}
                    onChange={e => setDelayDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white resize-none"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    disabled={!delayType}
                    onClick={() => addDelay.mutate({
                      project_id: project.id,
                      contact_id: project.contact_id,
                      delay_type: delayType,
                      description: delayDesc,
                      reported_at: new Date().toISOString(),
                    })}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Log Delay
                  </Button>
                </div>
              )}
              {delays.length === 0 ? (
                <p className="text-xs text-gray-400">No delays logged.</p>
              ) : (
                <div className="space-y-1.5">
                  {delays.map(d => (
                    <div key={d.id} className="flex items-start gap-2 bg-red-50 rounded-lg p-2">
                      <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded shrink-0">{d.delay_type}</span>
                      {d.description && <span className="text-xs text-gray-600 flex-1">{d.description}</span>}
                      <span className="text-[10px] text-gray-400 shrink-0">{new Date(d.reported_at).toLocaleDateString('en-ZA')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-1">Internal Notes</p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <ProjectModal
          project={project}
          contacts={contacts.length > 0 ? contacts : contact ? [contact] : []}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); onUpdated(); }}
        />
      )}
    </>
  );
}