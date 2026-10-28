import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  ArrowRight, CheckCircle, AlertCircle, Loader2, FileText, Mail, DollarSign, 
  Signature, Play, Pause, Shield, Calendar, User, BookOpen 
} from 'lucide-react';

const GLASS = {
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

const STAGE_COLORS = {
  'New Enquiry': 'bg-blue-100 text-blue-700 border-blue-200',
  'Reviewed by Admin': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Quote Required': 'bg-purple-100 text-purple-700 border-purple-200',
  'Quote Sent': 'bg-violet-100 text-violet-700 border-violet-200',
  'Quote Viewed': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'Quote Accepted': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'NDA Required': 'bg-amber-100 text-amber-700 border-amber-200',
  'NDA Sent': 'bg-orange-100 text-orange-700 border-orange-200',
  'NDA Signed': 'bg-green-100 text-green-700 border-green-200',
  'Invoice Required': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Invoice Sent': 'bg-lime-100 text-lime-700 border-lime-200',
  'Payment Pending': 'bg-amber-100 text-amber-700 border-amber-200',
  'Payment Received': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Project Active': 'bg-blue-100 text-blue-700 border-blue-200',
  'Project In Progress': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Client Review': 'bg-purple-100 text-purple-700 border-purple-200',
  'Final Approval': 'bg-pink-100 text-pink-700 border-pink-200',
  'Ready for Production': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Completed': 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function WorkflowPanel({ contactId, onClose }) {
  const queryClient = useQueryClient();
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [advancing, setAdvancing] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // Fetch workflow
  const { data: workflowData, isLoading, refetch } = useQuery({
    queryKey: ['workflow', contactId],
    queryFn: async () => {
      const res = await platform.functions.invoke('workflowAutomation', {
        action: 'get_workflow',
        contact_id: contactId,
      });
      return res.data;
    },
  });

  // Initialize workflow if doesn't exist
  const initializeMutation = useMutation({
    mutationFn: async (serviceType) => {
      const res = await platform.functions.invoke('workflowAutomation', {
        action: 'initialize',
        contact_id: contactId,
        data: { service_type: serviceType },
      });
      return res.data;
    },
    onSuccess: () => {
      refetch();
      toast.success('Workflow initialized');
    },
  });

  // Advance stage mutation
  const advanceMutation = useMutation({
    mutationFn: async (stage) => {
      if (!workflowData?.workflow?.id) throw new Error('No workflow found');
      const res = await platform.functions.invoke('workflowAutomation', {
        action: 'advance_stage',
        workflow_id: workflowData.workflow.id,
        data: { stage },
      });
      if (!res.data?.success && !res.data?.blocked) {
        throw new Error(res.data?.error || 'Failed to advance stage');
      }
      return res.data;
    },
    onMutate: () => {
      setAdvancing(true);
      setBlockMessage('');
    },
    onSuccess: (data) => {
      if (data.blocked) {
        setBlockMessage(data.reason);
        toast.error(data.reason);
      } else {
        toast.success(`Advanced to ${targetStage}${data.email_sent ? ' • Email sent to client' : ''}`);
        refetch();
      }
      setAdvancing(false);
    },
    onError: (error) => {
      toast.error('Failed to advance: ' + error.message);
      setAdvancing(false);
    },
  });

  const handleAdvance = (stage) => {
    setTargetStage(stage);
    advanceMutation.mutate(stage);
  };

  const stages = [
    'New Enquiry', 'Reviewed by Admin', 'Quote Required', 'Quote Sent', 
    'Quote Viewed', 'Quote Accepted', 'NDA Required', 'NDA Sent', 
    'NDA Signed', 'Invoice Required', 'Invoice Sent', 'Payment Pending', 
    'Payment Received', 'Project Active', 'Project In Progress', 
    'Client Review', 'Final Approval', 'Ready for Production', 'Completed'
  ];

  const currentIndex = stages.indexOf(workflowData?.workflow?.current_stage || 'New Enquiry');

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
            <p className="text-gray-700 font-medium">Loading workflow...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workflowData?.exists && !isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Initialize Workflow</h3>
          <p className="text-gray-600 mb-6">This contact doesn't have a workflow yet. Select a service type to begin:</p>
          <div className="space-y-2 mb-6">
            {['Full Publishing Package', 'Book Printing', 'Book Editing', 'Proofreading', 'Cover Design', 'Typesetting', 'Ghostwriting', 'Ebook Publishing'].map(service => (
              <button
                key={service}
                onClick={() => initializeMutation.mutate(service)}
                disabled={initializeMutation.isPending}
                className="w-full px-4 py-3 text-left hover:bg-amber-50 rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
              >
                <span className="font-medium text-gray-900">{service}</span>
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const workflow = workflowData?.workflow;
  const quote = workflowData?.quote;
  const invoice = workflowData?.invoice;
  const nda = workflowData?.nda_document;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
        style={GLASS}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Client Workflow</h2>
            <p className="text-sm text-gray-500 mt-1">
              {workflowData?.contact?.full_name} • {workflow?.service_type}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Stage */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Current Stage</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${STAGE_COLORS[workflow?.current_stage] || 'bg-gray-100 text-gray-700'}`}>
                {workflow?.current_stage || 'Not Started'}
              </span>
            </div>
            {workflow?.next_action && (
              <div className="flex items-center gap-2 text-amber-900">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">Next: {workflow.next_action}</span>
              </div>
            )}
          </div>

          {/* Stage Progress */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Workflow Progress</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-3">
                {stages.map((stage, idx) => {
                  const isCompleted = idx < currentIndex;
                  const isCurrent = idx === currentIndex;
                  const isFuture = idx > currentIndex;
                  
                  return (
                    <div key={stage} className="relative flex items-center gap-4 pl-10">
                      <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isCompleted ? 'bg-emerald-500 border-emerald-500' :
                        isCurrent ? 'bg-amber-500 border-amber-500' :
                        'bg-white border-gray-300'
                      }`}>
                        {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                        {isCurrent && <div className="w-3 h-3 bg-white rounded-full" />}
                      </div>
                      <div className={`flex-1 py-2 px-3 rounded-lg border ${
                        isCurrent ? 'bg-amber-50 border-amber-200' :
                        isCompleted ? 'bg-emerald-50 border-emerald-200' :
                        'bg-white border-gray-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            isCurrent ? 'text-amber-900' :
                            isCompleted ? 'text-emerald-900' :
                            'text-gray-500'
                          }`}>
                            {stage}
                          </span>
                          {isCurrent && stages[idx + 1] && (
                            <button
                              onClick={() => handleAdvance(stages[idx + 1])}
                              disabled={advancing}
                              className="text-xs px-3 py-1 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 flex items-center gap-1"
                            >
                              {advancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                              Advance
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Linked Records */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quote */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Quote</h4>
              </div>
              {quote ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium text-blue-700">{quote.status}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-2 font-bold text-gray-900">R {(quote.total || 0).toLocaleString('en-ZA')}</span>
                  </div>
                  <a href={`/admin/quotes/${quote.id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    View Quote <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No quote created yet</p>
              )}
            </div>

            {/* NDA/Document */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">NDA / Agreement</h4>
              </div>
              {workflow?.nda_required ? (
                nda ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium text-purple-700">{nda.status}</span>
                    </div>
                    <a href={`/admin/documents/${nda.id}`} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                      View Document <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 font-medium">NDA required but not sent</p>
                )
              ) : (
                <p className="text-sm text-gray-500">Not required for this service</p>
              )}
            </div>

            {/* Invoice */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Invoice</h4>
              </div>
              {invoice ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium text-green-700">{invoice.status}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Balance:</span>
                    <span className={`ml-2 font-bold ${(invoice.balance_due || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      R {(invoice.balance_due || 0).toLocaleString('en-ZA')}
                    </span>
                  </div>
                  <a href={`/admin/invoices`} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                    View Invoice <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No invoice created yet</p>
              )}
            </div>
          </div>

          {/* Payment Status */}
          {workflow?.payment_status && (
            <div className={`rounded-xl p-4 border ${
              workflow.payment_status === 'paid' ? 'bg-emerald-50 border-emerald-200' :
              workflow.payment_status === 'deposit_paid' ? 'bg-blue-50 border-blue-200' :
              'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`w-5 h-5 ${
                  workflow.payment_status === 'paid' ? 'text-emerald-600' :
                  workflow.payment_status === 'deposit_paid' ? 'text-blue-600' :
                  'text-amber-600'
                }`} />
                <h4 className="font-semibold text-gray-900">Payment Status</h4>
              </div>
              <p className="text-sm font-medium capitalize">{workflow.payment_status.replace('_', ' ')}</p>
              {workflow.payment_received_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Received: {new Date(workflow.payment_received_at).toLocaleDateString('en-ZA')}
                </p>
              )}
            </div>
          )}

          {/* Block Message */}
          {blockMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 text-sm">Cannot Advance</h4>
                <p className="text-sm text-red-700 mt-1">{blockMessage}</p>
              </div>
            </div>
          )}

          {/* Email Notification Info */}
          {workflow?.automation_enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Automated Email Updates</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Email notifications are enabled. Clients will receive automatic updates when the workflow advances to key stages.
                </p>
              </div>
            </div>
          )}

          {/* Stage History */}
          {workflow?.stage_history && workflow.stage_history.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Stage History</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {workflow.stage_history.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{entry.stage}</span>
                      {entry.changed_by && (
                        <span className="text-gray-500 ml-2">by {entry.changed_by}</span>
                      )}
                    </div>
                    <span className="text-gray-500">
                      {new Date(entry.entered_at).toLocaleDateString('en-ZA', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}