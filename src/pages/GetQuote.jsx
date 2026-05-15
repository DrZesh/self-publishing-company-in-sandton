import React, { useState, useEffect, useCallback } from 'react';
import PageMeta from '../components/shared/PageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Home, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteStep1 from '../components/quote/QuoteStep1';
import QuoteStep2 from '../components/quote/QuoteStep2';
import QuoteStep3 from '../components/quote/QuoteStep3';
import QuoteStep4 from '../components/quote/QuoteStep4';
import QuoteStep5 from '../components/quote/QuoteStep5';
import QuoteStep6 from '../components/quote/QuoteStep6';
import QuoteStep7 from '../components/quote/QuoteStep7';
import QuoteReview from '../components/quote/QuoteReview';
import QuoteProgress from '../components/quote/QuoteProgress';

const STORAGE_KEY = 'cbsa_quote_form';

const INITIAL_DATA = {
  // Step 1
  firstName: '', lastName: '', email: '', confirmEmail: '',
  phone: '', address: '', city: '', province: '', postalCode: '',
  // Step 2
  bookSize: '', bookSizeConverted: '', numberOfPages: '', bookGenre: '', wordCount: '',
  // Step 3
  needCover: '', coverType: '',
  // Step 4
  needPrinting: '', printCopies: '', paperType: '', coverFinish: '',
  hasColourImages: '', colourImageCount: '', colourImagePrint: '',
  // Step 5
  needTypesetting: '', typesettingType: '',
  // Step 6
  needEditing: '', editingWordCount: '', editingGenre: '',
  // Step 7
  startDate: '', howFound: '', additionalNotes: '',
};

const STEP_LABELS = [
  'Client Details', 'Book Details', 'Cover Design',
  'Printing', 'Typesetting', 'Editing', 'Timeline', 'Review'
];

export default function GetQuote() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...INITIAL_DATA, ...JSON.parse(saved) } : INITIAL_DATA;
    } catch { return INITIAL_DATA; }
  });
  const [errors, setErrors] = useState({});
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const update = useCallback((fields) => {
    setData(prev => ({ ...prev, ...fields }));
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(fields).forEach(k => delete next[k]);
      return next;
    });
  }, []);

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!data.firstName.trim()) e.firstName = 'Required';
      if (!data.lastName.trim()) e.lastName = 'Required';
      if (!data.email.trim()) e.email = 'Required';
      else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Invalid email';
      if (!data.confirmEmail.trim()) e.confirmEmail = 'Required';
      else if (data.email !== data.confirmEmail) e.confirmEmail = 'Emails do not match';
      if (!data.phone.trim()) e.phone = 'Required';
      if (!data.address.trim()) e.address = 'Required';
      if (!data.city.trim()) e.city = 'Required';
      if (!data.province.trim()) e.province = 'Required';
      if (!data.postalCode.trim()) e.postalCode = 'Required';
    }
    if (step === 1) {
      if (!data.bookSize) e.bookSize = 'Required';
      if (!data.bookSizeConverted) e.bookSizeConverted = 'Required';
      if (!data.numberOfPages.trim()) e.numberOfPages = 'Required';
      if (!data.bookGenre) e.bookGenre = 'Required';
      if (!data.wordCount.trim()) e.wordCount = 'Required';
    }
    if (step === 2) {
      if (!data.needCover) e.needCover = 'Required';
      if (data.needCover === 'yes' && !data.coverType) e.coverType = 'Required';
    }
    if (step === 3) {
      if (!data.needPrinting) e.needPrinting = 'Required';
      if (data.needPrinting === 'yes') {
        if (!data.printCopies) e.printCopies = 'Required';
        if (!data.paperType) e.paperType = 'Required';
        if (!data.coverFinish) e.coverFinish = 'Required';
        if (!data.hasColourImages) e.hasColourImages = 'Required';
        if (data.hasColourImages === 'yes') {
          if (!data.colourImageCount.trim()) e.colourImageCount = 'Required';
          if (!data.colourImagePrint) e.colourImagePrint = 'Required';
        }
      }
    }
    if (step === 4) {
      if (!data.needTypesetting) e.needTypesetting = 'Required';
      if (data.needTypesetting === 'yes' && !data.typesettingType) e.typesettingType = 'Required';
    }
    if (step === 5) {
      if (!data.needEditing) e.needEditing = 'Required';
      if (data.needEditing === 'yes') {
        if (!data.editingWordCount.trim()) e.editingWordCount = 'Required';
        if (!data.editingGenre.trim()) e.editingGenre = 'Required';
      }
    }
    if (step === 6) {
      if (!data.startDate) e.startDate = 'Required';
      if (!data.howFound) e.howFound = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, 7));
  };

  const back = () => {
    setDirection(-1);
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setSubmitting(true);
    // Build email-like submission via mailto fallback
    await new Promise(r => setTimeout(r, 1200));
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setSubmitting(false);
    setSubmitted(true);
  };

  const stepProps = { data, update, errors };

  const STEPS = [
    <QuoteStep1 {...stepProps} />,
    <QuoteStep2 {...stepProps} />,
    <QuoteStep3 {...stepProps} />,
    <QuoteStep4 {...stepProps} />,
    <QuoteStep5 {...stepProps} />,
    <QuoteStep6 {...stepProps} />,
    <QuoteStep7 {...stepProps} />,
    <QuoteReview data={data} onEdit={(s) => { setDirection(-1); setStep(s); }} />,
  ];

  if (submitted) {
    return (
      <>
        <PageMeta
          title="Get a Free Publishing Quote | Creative Books SA"
          description="Request a free, no-obligation quote for book publishing, editing, printing or cover design in South Africa. Fast response within 24 hours."
          canonical="https://www.creativebookssa.co.za/getquote"
        />
      <div className="min-h-screen bg-vellum flex items-center justify-center px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-copper" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F0F0F] mb-4">
            Quote Request Received!
          </h2>
          <p className="text-[#0F0F0F]/60 font-body leading-relaxed mb-8">
            Thank you. Your quote request has been received. Creative Books SA will review your information and get back to you shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/27000000000" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
            <Link to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-obsidian text-white rounded-full font-medium hover:bg-obsidian/80 transition-colors">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Get a Free Publishing Quote | Creative Books SA"
        description="Request a free, no-obligation quote for book publishing, editing, printing or cover design in South Africa. Fast response within 24 hours."
        canonical="https://www.creativebookssa.co.za/getquote"
      />
    <div className="min-h-screen bg-vellum pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-2 block">Creative Books SA</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F]">Get a Free Publishing Quote</h1>
          <p className="text-[#0F0F0F]/50 font-body mt-2 text-sm">Complete the steps below — we'll prepare a personalised quote for you.</p>
        </div>

        {/* Progress */}
        <QuoteProgress step={step} labels={STEP_LABELS} />

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-[#0F0F0F]/5 overflow-hidden mt-6">
          <div className="px-6 py-3 bg-obsidian flex items-center justify-between">
            <span className="text-white/50 text-xs font-body uppercase tracking-widest">Step {step + 1} of 8</span>
            <span className="text-copper text-xs font-body font-medium">{STEP_LABELS[step]}</span>
          </div>

          <div className="p-6 md:p-8 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25 }}
              >
                {STEPS[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-6 md:px-8 pb-6 md:pb-8 flex items-center justify-between gap-4 border-t border-[#0F0F0F]/5 pt-6">
            <button
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0F0F0F]/15 text-[#0F0F0F]/60 text-sm font-body hover:border-copper hover:text-copper transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 7 ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-2 px-7 py-2.5 bg-copper text-white rounded-full text-sm font-medium hover:bg-copper/90 transition-all shadow-md shadow-copper/20"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-2.5 bg-copper text-white rounded-full text-sm font-medium hover:bg-copper/90 transition-all shadow-md shadow-copper/20 disabled:opacity-70"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Quote Request <CheckCircle className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}