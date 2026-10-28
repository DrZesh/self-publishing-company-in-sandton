import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, AlertCircle, Clock, Upload, Download, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { platform } from '@/api/platformClient';

export default function ProofApprovalTab({ proofs, contact, projects }) {
  const [selectedProof, setSelectedProof] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [decision, setDecision] = useState(''); // 'approve' | 'request_changes' | 'reject'
  const [submitting, setSubmitting] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const handleSubmitDecision = async () => {
    if (!selectedProof || !decision) return;
    
    setSubmitting(true);
    try {
      await platform.functions.invoke('proofApprovalActions', {
        action: decision === 'approve' ? 'approve' : 'request_changes',
        proof_id: selectedProof.id,
        decision,
        client_feedback: decision === 'approve' ? '' : feedback,
        contact_id: contact.id,
      });
      
      toast.success(decision === 'approve' ? 'Proof approved!' : 'Feedback submitted');
      setShowApprovalModal(false);
      setFeedback('');
      setDecision('');
      setSelectedProof(null);
    } catch (error) {
      toast.error('Failed to submit decision: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    'pending': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Awaiting Your Approval' },
    'approved': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Approved' },
    'changes_requested': { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Changes Requested' },
    'rejected': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Rejected' },
  };

  return (
    <div className="space-y-6">
      {/* Active Proofs Requiring Action */}
      {proofs?.filter(p => p.status === 'pending').length > 0 && (
        <div className="bg-gradient-to-r from-[#B87333]/20 to-orange-500/10 rounded-3xl border border-[#B87333]/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-[#D4A574]" />
            <h3 className="font-bold text-white text-lg">Action Required: {proofs.filter(p => p.status === 'pending').length} Proof(s) Awaiting Approval</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Please review and approve or provide feedback for the following proofs:</p>
          <div className="grid gap-3">
            {proofs.filter(p => p.status === 'pending').map(proof => (
              <div key={proof.id} className="p-4 bg-[#1A1A2E]/80 rounded-xl border border-[#B87333]/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{proof.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{proof.proof_type.replace('_', ' ').toUpperCase()}</p>
                    {proof.deadline && (
                      <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {new Date(proof.deadline).toLocaleDateString('en-ZA')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedProof(proof);
                        setShowApprovalModal(true);
                      }}
                      className="bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold px-4 py-2 rounded-lg text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Review & Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Proofs History */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#D4A574]" />
          Proof History
        </h3>
        
        {!proofs || proofs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No proofs submitted yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {proofs.map(proof => {
              const config = statusConfig[proof.status] || statusConfig.pending;
              const Icon = config.icon;
              
              return (
                <div key={proof.id} className="p-5 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">{proof.title}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{proof.proof_type.replace('_', ' ').toUpperCase()}</p>
                      {proof.deadline && (
                        <p className="text-xs text-gray-500 mt-1">
                          Deadline: {new Date(proof.deadline).toLocaleDateString('en-ZA')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {proof.proof_file_url && (
                      <a
                        href={proof.proof_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#D4A574] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        View Proof
                      </a>
                    )}
                    {proof.status === 'approved' && proof.approved_at && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved on {new Date(proof.approved_at).toLocaleDateString('en-ZA')}
                      </span>
                    )}
                    {proof.status === 'changes_requested' && proof.client_feedback && (
                      <div className="text-xs text-orange-400">
                        <strong>Your feedback:</strong> {proof.client_feedback}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedProof && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-xl">{selectedProof.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{selectedProof.proof_type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <a
                href={selectedProof.proof_file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#B87333]/20 text-[#D4A574] rounded-xl text-sm font-semibold hover:bg-[#B87333]/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Proof in New Tab
              </a>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-2 block">Your Decision</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setDecision('approve')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      decision === 'approve'
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Approve</p>
                  </button>
                  <button
                    onClick={() => setDecision('request_changes')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      decision === 'request_changes'
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Request Changes</p>
                  </button>
                  <button
                    onClick={() => setDecision('reject')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      decision === 'reject'
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <XCircle className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Reject</p>
                  </button>
                </div>
              </div>

              {decision && decision !== 'approve' && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-2 block">
                    {decision === 'request_changes' ? 'What changes are needed?' : 'Reason for rejection'}
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please provide detailed feedback..."
                    rows={4}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B87333]/40 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowApprovalModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitDecision}
                  disabled={!decision || (decision !== 'approve' && !feedback.trim())}
                  className="flex-1 bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Decision'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}