import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  Download, CheckCircle, XCircle, MessageSquare, FileSignature,
  CreditCard, Upload, AlertTriangle, Clock, Eye, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentView() {
  const { id, token } = useParams();
  const [doc, setDoc] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientNotes, setClientNotes] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [done, setDone] = useState(null);
  const [sigData, setSigData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const lastPos = useRef(null);
  const tracked = useRef(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1A1208';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, [isDrawing]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) setSigData(canvas.toDataURL('image/png'));
  }, []);

  const clearSig = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigData(null);
  };

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    base44.functions.invoke('documentActions', { action: 'track_view', document_id: id, token })
      .then(res => {
        if (res.data?.error) { setError(res.data.error); }
        else { setDoc(res.data?.doc); setContact(res.data?.contact); }
      })
      .catch(err => setError(err?.response?.data?.error || 'Unable to load document.'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleDownload = async () => {
    await base44.functions.invoke('documentActions', { action: 'track_download', document_id: id, token });
    window.open(doc.file_url, '_blank');
  };

  const handleAction = async (clientAction) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      let proof_url = null;
      let signature_url = null;
      if (proofFile) {
        const uploaded = await base44.integrations.Core.UploadFile({ file: proofFile });
        proof_url = uploaded.file_url;
      }
      // Convert canvas signature to file and upload
      if (clientAction === 'sign' && sigData) {
        const blob = await fetch(sigData).then(r => r.blob());
        const sigFile = new File([blob], 'signature.png', { type: 'image/png' });
        const uploaded = await base44.integrations.Core.UploadFile({ file: sigFile });
        signature_url = uploaded.file_url;
      }
      const res = await base44.functions.invoke('documentActions', {
        action: 'client_action',
        document_id: id,
        token,
        client_action: clientAction,
        notes: clientNotes,
        proof_url,
        signature_url,
      });
      if (res.data?.success) {
        const messages = {
          approve: 'Document approved successfully!',
          reject: 'Document rejected.',
          sign: 'Document signed successfully!',
          upload_proof: 'Payment proof uploaded!',
          changes_requested: 'Changes request submitted.',
          upload_signed: 'Signed document uploaded!',
        };
        setDone({ action: clientAction, message: messages[clientAction] || 'Action completed.' });
        setActiveModal(null);
      } else {
        toast.error(res.data?.error || 'Action failed.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#B87333]/20 border-t-[#B87333] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Document Unavailable</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <p className="text-xs text-gray-400 mt-4">If you believe this is an error, please contact us at info@creativebooks.co.za</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{done.message}</h2>
        <p className="text-gray-500 text-sm mt-2">Our team has been notified and will be in touch shortly.</p>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">Creative Books SA · info@creativebooks.co.za · 010 500 3331</p>
        </div>
      </div>
    </div>
  );

  const isExpired = doc?.expires_at && new Date(doc.expires_at) < new Date();
  const category = doc?.category || '';
  const isQuote = category === 'Quotation';
  const isInvoice = category === 'Invoice';
  const isContract = category === 'Unsigned Contract' || category === 'Signed Contract';
  const isProof = category === 'Proof Approval' || category === 'Final Print File';

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-[#1A1208] text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#B87333] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#B87333] text-sm">Creative Books SA</p>
            <p className="text-white/50 text-xs">Professional Publishing Services</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Expiry warning */}
        {isExpired && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-700">This link has expired</p>
              <p className="text-xs text-orange-600">Please contact us to receive a new link.</p>
            </div>
          </div>
        )}

        {/* Document card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#faf8f4] border border-[#B87333]/20 flex items-center justify-center flex-shrink-0">
              <FileSignature className="w-6 h-6 text-[#B87333]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#B87333] uppercase tracking-wide">{category}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">v{doc?.version || 1}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-1 truncate">{doc?.file_name}</h1>
              {doc?.book_title && <p className="text-sm text-gray-500 mt-0.5">📖 {doc.book_title}</p>}
              {contact && <p className="text-sm text-gray-600 mt-1">For: <strong>{contact.full_name}</strong></p>}
              {doc?.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-3 border-[#B87333]">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Note from Creative Books SA:</p>
                  <p className="text-sm text-gray-700">{doc.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Expiry info */}
          {doc?.expires_at && !isExpired && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              Link valid until {new Date(doc.expires_at).toLocaleDateString('en-ZA')}
            </div>
          )}
        </div>

        {/* Tracking notice */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start gap-2">
          <Eye className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-sky-700">
            Your activity on this document (opens, downloads, approvals) is tracked for record-keeping purposes.
            Tracking pixels may not function if your email app blocks them.
          </p>
        </div>

        {/* Action buttons */}
        {!isExpired && (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Actions</h3>

            {/* Download always available */}
            {doc?.file_url && (
              <Button onClick={handleDownload} variant="outline" className="w-full justify-start gap-3 h-12 text-sm">
                <Download className="w-4 h-4 text-indigo-600" />
                Download Document
              </Button>
            )}

            {/* Quote actions */}
            {isQuote && !['Accepted','Declined','Rejected'].includes(doc?.status) && (
              <>
                <Button onClick={() => setActiveModal('approve')} className="w-full justify-start gap-3 h-12 text-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle className="w-4 h-4" /> Accept Quote
                </Button>
                <Button onClick={() => setActiveModal('changes_requested')} variant="outline" className="w-full justify-start gap-3 h-12 text-sm">
                  <MessageSquare className="w-4 h-4 text-amber-600" /> Request Changes
                </Button>
                <Button onClick={() => setActiveModal('reject')} variant="outline" className="w-full justify-start gap-3 h-12 text-sm text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-4 h-4" /> Decline Quote
                </Button>
              </>
            )}

            {/* Invoice actions */}
            {isInvoice && !['Payment Proof Uploaded'].includes(doc?.status) && (
              <Button onClick={() => setActiveModal('upload_proof')} className="w-full justify-start gap-3 h-12 text-sm bg-teal-600 hover:bg-teal-700 text-white">
                <CreditCard className="w-4 h-4" /> Upload Proof of Payment
              </Button>
            )}

            {/* Contract actions */}
            {isContract && !['Signed'].includes(doc?.status) && (
              <>
                <Button onClick={() => setActiveModal('sign')} className="w-full justify-start gap-3 h-12 text-sm bg-[#B87333] hover:bg-[#A06828] text-white">
                  <FileSignature className="w-4 h-4" /> Sign Contract
                </Button>
                <Button onClick={() => setActiveModal('upload_signed')} variant="outline" className="w-full justify-start gap-3 h-12 text-sm">
                  <Upload className="w-4 h-4 text-gray-600" /> Upload Signed Copy
                </Button>
                <Button onClick={() => setActiveModal('changes_requested')} variant="outline" className="w-full justify-start gap-3 h-12 text-sm">
                  <MessageSquare className="w-4 h-4 text-amber-600" /> Request Changes
                </Button>
              </>
            )}

            {/* Proof approval */}
            {isProof && !['Approved', 'Rejected'].includes(doc?.status) && (
              <>
                <Button onClick={() => setActiveModal('approve')} className="w-full justify-start gap-3 h-12 text-sm bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="w-4 h-4" /> Approve for Print
                </Button>
                <Button onClick={() => setActiveModal('changes_requested')} variant="outline" className="w-full justify-start gap-3 h-12 text-sm">
                  <MessageSquare className="w-4 h-4 text-amber-600" /> Request Changes
                </Button>
                <Button onClick={() => setActiveModal('reject')} variant="outline" className="w-full justify-start gap-3 h-12 text-sm text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-4 h-4" /> Reject Proof
                </Button>
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-6">
          Creative Books SA · info@creativebooks.co.za · 010 500 3331 · www.creativebooks.co.za
        </p>
      </div>

      {/* Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">
              {activeModal === 'approve' && (isProof ? '✅ Approve for Print' : '✅ Accept Quote')}
              {activeModal === 'reject' && '❌ Decline / Reject'}
              {activeModal === 'sign' && '✍️ Sign Contract'}
              {activeModal === 'upload_proof' && '💳 Upload Proof of Payment'}
              {activeModal === 'upload_signed' && '📄 Upload Signed Contract'}
              {activeModal === 'changes_requested' && '💬 Request Changes'}
            </h3>

            {activeModal === 'approve' && isProof && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                <strong>Important:</strong> By approving, you confirm the proof is correct and ready to print.
                This approval is legally binding and cannot be undone.
              </div>
            )}

            {/* Signature canvas for sign action */}
            {activeModal === 'sign' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Draw your signature below:</label>
                <div className="relative border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden" style={{ touchAction: 'none' }}>
                  <canvas
                    ref={canvasRef}
                    width={420}
                    height={160}
                    className="w-full cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  {!sigData && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-gray-300 text-sm">Sign here with your mouse or finger</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button onClick={clearSig} className="text-xs text-red-500 hover:underline">Clear signature</button>
                  {sigData && <span className="text-xs text-green-600 font-medium">✓ Signature captured</span>}
                </div>
              </div>
            )}

            {(activeModal === 'upload_proof' || activeModal === 'upload_signed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeModal === 'upload_proof' ? 'Upload Payment Proof (PDF/Image)' : 'Upload Signed Document (PDF)'}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => setProofFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#B87333]/10 file:text-[#B87333] hover:file:bg-[#B87333]/20"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeModal === 'changes_requested' ? 'Describe the changes needed:' : 'Optional message (visible to our team):'}
              </label>
              <textarea
                rows={3}
                value={clientNotes}
                onChange={e => setClientNotes(e.target.value)}
                placeholder={activeModal === 'changes_requested' ? 'Please describe what needs to be changed...' : 'Any additional notes...'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B87333] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setActiveModal(null); setClientNotes(''); setProofFile(null); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(activeModal)}
                disabled={submitting || ((activeModal === 'upload_proof' || activeModal === 'upload_signed') && !proofFile) || (activeModal === 'sign' && !sigData)}
                className={`flex-1 text-white ${
                  activeModal === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  activeModal === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-[#B87333] hover:bg-[#A06828]'
                }`}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}