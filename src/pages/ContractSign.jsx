import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle, FileText, PenLine, Type, RotateCcw, Loader2 } from 'lucide-react';

const STEPS = ['view', 'sign', 'confirm', 'done'];

export default function ContractSign() {
  const { token } = useParams();
  const [step, setStep] = useState('loading'); // loading, error, view, sign, confirm, done
  const [contract, setContract] = useState(null);
  const [contact, setContact] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signMode, setSignMode] = useState('draw'); // draw | type
  const [typedSig, setTypedSig] = useState('');
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [viewedDoc, setViewedDoc] = useState(false);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Load contract by token
  useEffect(() => {
    if (!token) { setStep('error'); setErrorMsg('Invalid link.'); return; }
    base44.functions.invoke('contractSignature', { action: 'get_by_token', token, event: 'opened', user_agent: navigator.userAgent })
      .then(res => {
        if (res.data?.error) { setStep('error'); setErrorMsg(res.data.error); return; }
        setContract(res.data.contract);
        setContact(res.data.contact);
        if (res.data.contact?.full_name) setSignerName(res.data.contact.full_name);
        if (res.data.contact?.email) setSignerEmail(res.data.contact.email);
        setStep('view');
      })
      .catch(() => { setStep('error'); setErrorMsg('Could not load contract. Please try again.'); });
  }, [token]);

  // Mark viewed when document loads
  const handleDocViewed = () => {
    if (!viewedDoc) {
      setViewedDoc(true);
      base44.functions.invoke('contractSignature', { action: 'get_by_token', token, event: 'viewed', user_agent: navigator.userAgent }).catch(() => {});
    }
  };

  // Canvas drawing
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasEmpty = () => {
    if (!canvasRef.current) return true;
    const ctx = canvasRef.current.getContext('2d');
    const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data;
    return !data.some(v => v !== 0);
  };

  const isFormValid = () => {
    if (!signerName.trim() || !signerEmail.trim() || !consent1 || !consent2) return false;
    if (signMode === 'draw') return !isCanvasEmpty();
    if (signMode === 'type') return typedSig.trim().length > 2;
    return false;
  };

  const getSignatureImageData = () => {
    if (signMode === 'type') {
      // Render typed signature to canvas offscreen
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 400; offCanvas.height = 120;
      const ctx = offCanvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 120);
      ctx.font = 'italic 52px Georgia, serif';
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(typedSig, 200, 60);
      return offCanvas.toDataURL('image/png');
    }
    return canvasRef.current?.toDataURL('image/png') || '';
  };

  const handleProceedToSign = () => {
    base44.functions.invoke('contractSignature', { action: 'signing_started', token }).catch(() => {});
    setStep('sign');
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      // Step 1: Upload signature image from frontend (avoids backend UploadFile issues)
      const dataUrl = getSignatureImageData();
      let signatureUrl = dataUrl;
      try {
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], 'signature.png', { type: 'image/png' });
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        if (uploaded?.file_url) signatureUrl = uploaded.file_url;
      } catch (uploadErr) {
        console.warn('Signature upload failed, using dataUrl fallback:', uploadErr);
      }

      // Step 2: Submit with 30-second timeout
      const invokePromise = base44.functions.invoke('contractSignature', {
        action: 'sign',
        token,
        signer_name: signerName,
        signer_email: signerEmail,
        signature_image_url: signatureUrl,
        legal_consent: consent1 && consent2,
        user_agent: navigator.userAgent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 30000)
      );
      const res = await Promise.race([invokePromise, timeoutPromise]);

      if (res.data?.success) {
        setStep('done');
      } else {
        setErrorMsg(res.data?.error || 'Signing failed. Please try again or contact Creative Books SA.');
      }
    } catch (err) {
      console.error('Contract submit error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again or contact Creative Books SA.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!signerName || !signerEmail) { setErrorMsg('Please enter your name and email before declining.'); return; }
    setDeclining(true);
    await base44.functions.invoke('contractSignature', {
      action: 'sign',
      token,
      signer_name: signerName,
      signer_email: signerEmail,
      declined: true,
      declined_reason: declineReason,
      user_agent: navigator.userAgent,
    });
    setDeclining(false);
    setStep('error');
    setErrorMsg('You have declined this contract. Our team will be in touch shortly.');
  };

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1208] to-[#2C1810] flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-[#B87333]" />
          <p className="text-white/70">Loading your contract...</p>
        </div>
      </div>
    );
  }

  // ── ERROR ───────────────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1208] to-[#2C1810] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Open Contract</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{errorMsg || 'This link is invalid or has expired.'}</p>
          <p className="text-gray-400 text-xs mt-6">Please contact us at <a href="mailto:info@creativebooks.co.za" className="text-[#B87333] hover:underline">info@creativebooks.co.za</a> or call <strong>084 230 5393</strong></p>
        </div>
      </div>
    );
  }

  // ── SUCCESS ─────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a2e1a] to-[#1a4a2a] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Signed!</h2>
          <p className="text-gray-500 mb-6">Thank you, <strong>{signerName}</strong>. Your electronic signature has been recorded and a confirmation email is on its way to <strong>{signerEmail}</strong>.</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left text-sm text-green-800 mb-6">
            <p className="font-semibold mb-1">✅ What happens next</p>
            <ul className="space-y-1 text-green-700">
              <li>• Your project is now moving to the next stage</li>
              <li>• Our team will contact you within 24 hours</li>
              <li>• A signed confirmation has been emailed to you</li>
            </ul>
          </div>
          <p className="text-xs text-gray-400">Questions? <a href="mailto:info@creativebooks.co.za" className="text-[#B87333]">info@creativebooks.co.za</a> · 084 230 5393</p>
        </div>
      </div>
    );
  }

  // ── MAIN LAYOUT ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1208] to-[#2C1810]">
      {/* Header */}
      <div className="bg-[#1a1208]/80 backdrop-blur border-b border-[#B87333]/20 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" className="h-10 object-contain" />
          <div className="text-right">
            <p className="text-[#B87333] text-xs font-semibold uppercase tracking-widest">E-Signature Portal</p>
            <p className="text-white/60 text-xs truncate max-w-[200px]">{contract?.title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          {['View Contract', 'Sign', 'Done'].map((label, i) => {
            const currentIdx = step === 'view' ? 0 : step === 'sign' ? 1 : 2;
            const active = i === currentIdx;
            const done = i < currentIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-[#B87333] text-white' : 'bg-white/10 text-white/40'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
                {i < 2 && <div className="w-8 h-px bg-white/20" />}
              </div>
            );
          })}
        </div>

        {/* ── STEP: VIEW ───────────────────────────────────────────────────── */}
        {step === 'view' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-[#B87333] flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-white font-bold text-lg">{contract?.title}</h2>
                  {contract?.book_title && <p className="text-white/60 text-sm">{contract.book_title}</p>}
                  <p className="text-white/50 text-xs mt-1">Please read the full contract before signing.</p>
                </div>
              </div>
            </div>

            {/* Contract Viewer */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {contract?.contract_file_url ? (
                <div className="relative">
                  <iframe
                    src={`${contract.contract_file_url}#toolbar=1&navpanes=0`}
                    className="w-full border-0"
                    style={{ height: '65vh' }}
                    title="Contract Document"
                    onLoad={handleDocViewed}
                  />
                  <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-400">Scroll through the entire document before signing</span>
                    <a href={contract.contract_file_url} target="_blank" rel="noreferrer" className="text-[#B87333] text-xs font-semibold hover:underline">Open in new tab ↗</a>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p>Contract document not available. Please contact us.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleProceedToSign}
                className="flex-1 h-12 bg-[#B87333] hover:bg-[#A06828] text-white font-bold text-base"
              >
                ✍️ Proceed to Sign
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeclineForm(v => !v)}
                className="border-red-400 text-red-400 hover:bg-red-50 h-12"
              >
                Decline
              </Button>
            </div>

            {showDeclineForm && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="text-red-800 font-semibold text-sm">Decline Contract</p>
                <Input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Your full name" />
                <Input type="email" value={signerEmail} onChange={e => setSignerEmail(e.target.value)} placeholder="Your email" />
                <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Reason for declining (optional)" className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm resize-none" rows={2} />
                <Button onClick={handleDecline} disabled={declining} className="w-full bg-red-600 hover:bg-red-700 text-white">
                  {declining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm Decline
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: SIGN ───────────────────────────────────────────────────── */}
        {step === 'sign' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-[#B87333]" /> Your Signature
              </h2>

              {/* Signer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Full Legal Name *</label>
                  <Input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="e.g. Jane Anne Smith" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Email Address *</label>
                  <Input type="email" value={signerEmail} onChange={e => setSignerEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              </div>

              {/* Signature Mode Toggle */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Signature Method</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSignMode('draw')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${signMode === 'draw' ? 'bg-[#B87333] text-white border-[#B87333]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <PenLine className="w-4 h-4" /> Draw Signature
                  </button>
                  <button
                    onClick={() => setSignMode('type')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${signMode === 'type' ? 'bg-[#B87333] text-white border-[#B87333]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Type className="w-4 h-4" /> Type Signature
                  </button>
                </div>
              </div>

              {/* Draw Pad */}
              {signMode === 'draw' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sign here *</label>
                    <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={160}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-crosshair touch-none"
                    style={{ maxHeight: 160 }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  <p className="text-xs text-gray-400 mt-1">Use your mouse or finger to draw your signature</p>
                </div>
              )}

              {/* Type Signature */}
              {signMode === 'type' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Type your signature *</label>
                  <Input
                    value={typedSig}
                    onChange={e => setTypedSig(e.target.value)}
                    placeholder="Your full name as signature"
                    className="text-2xl font-serif italic h-14"
                    style={{ fontFamily: 'Georgia, serif' }}
                  />
                  {typedSig && (
                    <div className="mt-2 p-3 border border-gray-200 rounded-xl bg-gray-50 text-center">
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontStyle: 'italic', color: '#1a1a1a' }}>{typedSig}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Consent */}
              <div className="space-y-3 bg-amber-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-900">Legal Consent</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consent1} onChange={e => setConsent1(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#B87333]" />
                  <span className="text-sm text-amber-800">I confirm that I have read and understood the full contract, and I agree to its terms and conditions.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consent2} onChange={e => setConsent2(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#B87333]" />
                  <span className="text-sm text-amber-800">I consent to the use of electronic signatures and understand this is legally binding in terms of the Electronic Communications and Transactions Act, 2002 (South Africa).</span>
                </label>
              </div>

              {errorMsg && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errorMsg}</p>}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep('view')} className="w-32">← Back</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !isFormValid()}
                  className="flex-1 h-12 bg-[#B87333] hover:bg-[#A06828] text-white font-bold text-base disabled:opacity-40"
                >
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</> : '✅ Submit Signed Contract'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-white/30 text-xs">
        Creative Books SA · Prism Office Park, Fourways · info@creativebooks.co.za · 084 230 5393
      </div>
    </div>
  );
}