import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SignatureCanvas from '@/components/signature/SignatureCanvas';
import {
  Shield, CheckCircle, AlertTriangle, Clock, FileText,
  ChevronRight, Download, Eye, PenTool, Loader2, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['View Document', 'Sign', 'Legal Consent', 'Complete'];

export default function ESignatureSigning() {
  const { requestId, token } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [signature, setSignature] = useState(null);
  const [form, setForm] = useState({ confirmed_name: '', confirmed_email: '', consent_read: false, consent_identity: false, consent_authorised: false, consent_electronic: false, consent_submit: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [declineMode, setDeclineMode] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    if (!requestId || !token) { setError('Invalid signing link.'); setLoading(false); return; }
    base44.functions.invoke('eSignatureActions', { action: 'track_open', request_id: requestId, token }).then(res => {
      if (res.data?.expired) { setError('This signing link has expired. Please contact the sender.'); }
      else if (res.data?.error) { setError(res.data.error); }
      else if (res.data?.already_signed) { setRequest(res.data.doc); setSubmitted(true); }
      else { setRequest(res.data?.doc || {}); }
      setLoading(false);
    }).catch(() => { setError('Failed to load signing request. Please try again.'); setLoading(false); });
  }, [requestId, token]);

  const handleStartSigning = async () => {
    await base44.functions.invoke('eSignatureActions', { action: 'signing_started', request_id: requestId, token }).catch(() => {});
    setStep(1);
  };

  const handleSubmit = async () => {
    // Validation
    if (!signature) { toast.error('Please provide your signature before submitting.'); return; }
    if (!form.confirmed_name.trim()) { toast.error('Please enter your full name.'); return; }
    if (!form.confirmed_email.trim()) { toast.error('Please enter your email address.'); return; }
    if (!form.consent_read || !form.consent_identity || !form.consent_authorised || !form.consent_electronic || !form.consent_submit) {
      toast.error('Please accept all required consent checkboxes.'); return;
    }

    setSubmitting(true);
    try {
      // Step 1: Upload signature image to get a proper URL (avoids base64 size limits)
      let signatureUrl = signature.dataUrl;
      try {
        const sigBlob = await fetch(signature.dataUrl).then(r => r.blob());
        const sigFile = new File([sigBlob], 'signature.png', { type: 'image/png' });
        const uploaded = await base44.integrations.Core.UploadFile({ file: sigFile });
        signatureUrl = uploaded.file_url;
      } catch (uploadErr) {
        console.warn('Signature upload failed, using dataUrl fallback:', uploadErr);
      }

      // Step 2: Submit to backend
      const res = await base44.functions.invoke('eSignatureActions', {
        action: 'submit_signature',
        request_id: requestId,
        token,
        signature_image_url: signatureUrl,
        signature_method: signature.method,
        confirmed_name: form.confirmed_name,
        confirmed_email: form.confirmed_email,
        consent_read: true,
        consent_identity: true,
        consent_authorised: true,
        consent_electronic: true,
        consent_submit: true,
      });

      if (res.data?.success) {
        setSubmitted(true);
        setRequest(r => ({ ...r, signed_document_url: res.data?.signed_document_url || null }));
      } else {
        const errMsg = res.data?.error || 'Submission failed. Please try again or contact Creative Books SA.';
        toast.error(errMsg);
        console.error('E-signature submission error:', res.data);
      }
    } catch (err) {
      console.error('Submit exception:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) { toast.error('Please provide a reason for declining'); return; }
    setDeclining(true);
    await base44.functions.invoke('eSignatureActions', { action: 'decline', request_id: requestId, token, reason: declineReason });
    setDeclining(false);
    setDeclineMode(false);
    setError('You have declined to sign this document. The sender has been notified.');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#B87333] mx-auto mb-4" />
        <p className="text-gray-500">Loading signing request...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <AlertTriangle className="w-14 h-14 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Signing Unavailable</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
        <p className="text-xs text-gray-400 mt-4">Questions? Contact Creative Books SA — 010 500 3331</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Signed!</h2>
        <p className="text-gray-500 text-sm mb-2"><strong>{request?.title}</strong></p>
        <p className="text-gray-500 text-sm mb-6">Your signature has been captured and the document has been sent to Creative Books SA. You will receive a confirmation email shortly.</p>
        {request?.allow_download_after_sign !== false && request?.signed_document_url && (
          <a href={request.signed_document_url} download={`signed_${request.title || 'document'}.pdf`}>
            <Button className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white w-full mb-3">
              <Download className="w-4 h-4" /> Download Signature Certificate
            </Button>
          </a>
        )}
        <p className="text-xs text-gray-400 mt-4">Creative Books SA · info@creativebooks.co.za · 010 500 3331</p>
      </div>
    </div>
  );

  if (declineMode) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" /> Decline Signing</h2>
        <p className="text-sm text-gray-500 mb-5">Please provide a reason for declining. This will be sent to Creative Books SA.</p>
        <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none mb-4" placeholder="Reason for declining..." />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setDeclineMode(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleDecline} disabled={declining} className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2">
            {declining ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Confirm Decline
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#1A1208] to-[#2C1E0F] text-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[#B87333] font-bold text-lg">Creative Books SA</p>
            <p className="text-white/50 text-xs">Secure Document Signing</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Shield className="w-4 h-4 text-[#B87333]" /> Encrypted
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#B87333] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-[#B87333]' : i < step ? 'text-emerald-600' : 'text-gray-400'}`}>{s}</span>
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Document info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-[#B87333]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{request?.title}</h2>
              <p className="text-sm text-gray-500">{request?.document_category} — Signing requested by Creative Books SA</p>
              {request?.expires_at && (
                <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> Link expires {new Date(request.expires_at).toLocaleDateString('en-ZA')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 0: View document */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Step 1 — Review Document</h3>
            <p className="text-sm text-gray-500">Please read the document carefully before signing. You can view or download it using the link below.</p>
            {request?.file_url && (
              <div className="space-y-3">
                <a href={request.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100 transition-colors">
                  <Eye className="w-5 h-5 text-[#B87333]" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">View Document</p>
                    <p className="text-xs text-gray-500">Opens in a new tab — read all pages before signing</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
                {request?.allow_download_before_sign !== false && (
                  <a href={request.file_url} download className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors text-sm text-gray-600">
                    <Download className="w-4 h-4" /> Download document
                  </a>
                )}
              </div>
            )}
            <div className="border-t pt-4 flex gap-3">
              <Button onClick={() => setDeclineMode(true)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-2" /> Decline
              </Button>
              <Button onClick={handleStartSigning} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
                <PenTool className="w-4 h-4" /> I Have Read the Document — Start Signing
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Signature */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900">Step 2 — Add Your Signature</h3>
            <SignatureCanvas label="Your Signature" onChange={setSignature} />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Your Full Name *</label>
                <input value={form.confirmed_name} onChange={e => setForm(f => ({ ...f, confirmed_name: e.target.value }))} placeholder="Type your full legal name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Your Email *</label>
                <input type="email" value={form.confirmed_email} onChange={e => setForm(f => ({ ...f, confirmed_email: e.target.value }))} placeholder="your@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => {
                if (!signature) { toast.error('Please provide your signature'); return; }
                if (!form.confirmed_name || !form.confirmed_email) { toast.error('Please confirm your name and email'); return; }
                setStep(2);
              }} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
                Continue to Legal Consent
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Legal consent */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900">Step 3 — Legal Consent</h3>
            <p className="text-sm text-gray-500">Please read and accept all statements below to complete your signature.</p>
            <div className="space-y-3">
              {[
                { key: 'consent_read', text: 'I confirm that I have read and understood this document in full.' },
                { key: 'consent_identity', text: `I confirm that my name (${form.confirmed_name || '...'}) and email (${form.confirmed_email || '...'}) are correct.` },
                { key: 'consent_authorised', text: 'I confirm that I am authorised to sign this document.' },
                { key: 'consent_electronic', text: 'I understand that my electronic signature is legally binding and will be attached to this document.' },
                { key: 'consent_submit', text: 'I agree to submit this document electronically and accept the terms above.' },
              ].map(item => (
                <label key={item.key} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form[item.key] ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={form[item.key]} onChange={e => setForm(f => ({ ...f, [item.key]: e.target.checked }))} className="w-4 h-4 mt-0.5 accent-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">{item.text}</span>
                </label>
              ))}
            </div>

            {signature && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Your signature:</p>
                <img src={signature.dataUrl} alt="Signature" className="max-h-16" />
                <p className="text-xs text-gray-400 mt-1">{form.confirmed_name} · {form.confirmed_email}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !(form.consent_read && form.consent_identity && form.consent_authorised && form.consent_electronic && form.consent_submit)}
                className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white gap-2"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing — please wait...</>
                  : <><CheckCircle className="w-4 h-4" /> Submit Signed Document</>}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        Creative Books SA · Secure E-Signature System · 010 500 3331
      </div>
    </div>
  );
}