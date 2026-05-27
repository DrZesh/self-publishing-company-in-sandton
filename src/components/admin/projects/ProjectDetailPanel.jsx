import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';
import ProjectModal from './ProjectModal';

const STAGES = [
  'Enquiry Received', 'Quote Sent', 'Quote Accepted', 'Contract Sent', 'Contract Signed',
  'Payment Received', 'Manuscript Received', 'Editing', 'Proofreading', 'Typesetting',
  'Cover Design', 'Client Approval', 'Changes Requested', 'Final Approval Received',
  'Sample Print Queued', 'Sample Print Completed', 'Mass Production Started',
  'Ready for Collection', 'Courier Booked', 'Delivered', 'Completed'
];

const STAGE_COLORS = {
  'Enquiry Received': 'bg-slate-100 text-slate-700',
  'Payment Received': 'bg-emerald-100 text-emerald-700',
  'Editing': 'bg-yellow-100 text-yellow-700',
  'Cover Design': 'bg-pink-100 text-pink-700',
  'Mass Production Started': 'bg-teal-100 text-teal-700',
  'Ready for Collection': 'bg-emerald-100 text-emerald-700',
  'Completed': 'bg-gray-100 text-gray-600',
};

export default function ProjectDetailPanel({ project, contact, onClose, onUpdated }) {
  const [showEdit, setShowEdit] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  const handleStageChange = async (newStage) => {
    setUpdatingStage(true);
    await base44.entities.Project.update(project.id, { stage: newStage, stage_changed_at: new Date().toISOString() });
    setUpdatingStage(false);
    onUpdated();
  };

  const currentStageIndex = STAGES.indexOf(project.stage);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="font-bold text-gray-900">{project.book_title}</h2>
              <p className="text-sm text-gray-500">{contact?.full_name}</p>
            </div>
            <div className="flex items-center gap-2">
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
          contacts={contact ? [contact] : []}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); onUpdated(); }}
        />
      )}
    </>
  );
}