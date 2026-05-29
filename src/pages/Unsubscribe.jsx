import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, XCircle, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Unsubscribe() {
  const [step, setStep] = useState('loading'); // loading | confirm | done | error | already
  const [contact, setContact] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('client');
    const email = params.get('email');

    if (!clientId && !email) { setStep('error'); return; }

    const load = async () => {
      let contacts = [];
      if (clientId) contacts = await base44.entities.Contact.filter({ id: clientId });
      else if (email) contacts = await base44.entities.Contact.filter({ email });

      const c = contacts[0];
      if (!c) { setStep('error'); return; }
      setContact(c);
      if (c.unsubscribed) { setStep('already'); return; }
      setStep('confirm');
    };

    load().catch(() => setStep('error'));
  }, []);

  const handleUnsubscribe = async () => {
    if (!contact) return;
    setSubmitting(true);
    await base44.entities.Contact.update(contact.id, {
      unsubscribed: true,
      unsubscribed_at: new Date().toISOString(),
    });
    setSubmitting(false);
    setStep('done');
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <img
          src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png"
          alt="Creative Books SA"
          className="h-10 mx-auto mb-6 object-contain"
        />

        {step === 'loading' && (
          <div className="py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#B87333] mx-auto" />
            <p className="text-gray-400 mt-3 text-sm">Loading...</p>
          </div>
        )}

        {step === 'confirm' && (
          <>
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-7 h-7 text-[#B87333]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unsubscribe from Updates</h2>
            <p className="text-gray-500 text-sm mb-2">
              You are unsubscribing <strong>{contact?.email}</strong> from automated project update emails.
            </p>
            <p className="text-gray-400 text-xs mb-6">
              You will no longer receive automated updates about your publishing project. Important transactional emails (invoices, signed contracts) may still be sent.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/'}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white"
                onClick={handleUnsubscribe}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unsubscribe'}
              </Button>
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">You've Been Unsubscribed</h2>
            <p className="text-gray-500 text-sm mb-6">
              <strong>{contact?.email}</strong> has been removed from automated project update emails, as required by POPIA.
            </p>
            <p className="text-gray-400 text-xs">
              If you change your mind, please contact us at{' '}
              <a href="mailto:info@creativebooks.co.za" className="text-[#B87333]">info@creativebooks.co.za</a>
            </p>
          </>
        )}

        {step === 'already' && (
          <>
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Already Unsubscribed</h2>
            <p className="text-gray-500 text-sm">
              <strong>{contact?.email}</strong> is already unsubscribed from automated updates.
            </p>
          </>
        )}

        {step === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link Not Found</h2>
            <p className="text-gray-500 text-sm">
              This unsubscribe link is invalid or has expired. Please contact us directly.
            </p>
          </>
        )}

        <p className="text-gray-300 text-xs mt-8">Creative Books SA · info@creativebooks.co.za · 084 230 5393</p>
      </div>
    </div>
  );
}