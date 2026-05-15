import React, { useState, useEffect, useCallback } from 'react';
import PageMeta from '../components/shared/PageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Home, MessageCircle, Loader2, Sparkles, BookOpen, Star, Shield, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
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
  firstName: '', lastName: '', email: '', confirmEmail: '',
  phone: '', address: '', city: '', province: '', postalCode: '',
  bookSize: '', bookSizeConverted: '', numberOfPages: '', bookGenre: '', wordCount: '',
  needCover: '', coverType: '',
  needPrinting: '', printCopies: '', paperType: '', coverFinish: '',
  hasColourImages: '', colourImageCount: '', colourImagePrint: '',
  needTypesetting: '', typesettingType: '',
  needEditing: '', editingWordCount: '', editingGenre: '',
  startDate: '', howFound: '', additionalNotes: '',
};

const STEP_LABELS = [
  'Client Details', 'Book Details', 'Cover Design',
  'Printing', 'Typesetting', 'Editing', 'Timeline', 'Review'
];

const TRUST_ITEMS = [
  { icon: Star, label: '500+ Books Published' },
  { icon: Shield, label: 'No Hidden Fees' },
  { icon: Clock, label: '24hr Response Time' },
  { icon: Users, label: 'SA-Based Team' },
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
    try {
      const fields = [
        ['Full Name', `${data.firstName} ${data.lastName}`.trim()],
        ['Email Address', data.email],
        ['Phone Number', data.phone],
        ['Address', [data.address, data.city, data.province, data.postalCode].filter(Boolean).join(', ')],
        ['Book Size', data.bookSize],
        ['Number of Pages', data.numberOfPages],
        ['Genre', data.bookGenre],
        ['Word Count', data.wordCount],
        ['Needs Cover Design', data.needCover === 'yes' ? `Yes — ${data.coverType}` : 'No'],
        ['Needs Printing', data.needPrinting === 'yes' ? 'Yes' : 'No'],
        data.needPrinting === 'yes' ? ['Print Copies', data.printCopies] : null,
        data.needPrinting === 'yes' ? ['Paper Type', data.paperType] : null,
        data.needPrinting === 'yes' ? ['Cover Finish', data.coverFinish] : null,
        data.needPrinting === 'yes' ? ['Colour Images', data.hasColourImages === 'yes' ? `Yes — ${data.colourImageCount} images, ${data.colourImagePrint}` : 'No'] : null,
        ['Needs Typesetting', data.needTypesetting === 'yes' ? `Yes — ${data.typesettingType}` : 'No'],
        ['Needs Editing', data.needEditing === 'yes' ? 'Yes' : 'No'],
        data.needEditing === 'yes' ? ['Editing Word Count', data.editingWordCount] : null,
        ['Start Date', data.startDate],
        ['How Did You Hear About Us', data.howFound],
        ['Additional Notes', data.additionalNotes],
      ].filter(Boolean);

      const serviceSummary = [
        data.needCover === 'yes' && 'Cover Design',
        data.needPrinting === 'yes' && 'Printing',
        data.needTypesetting === 'yes' && 'Typesetting',
        data.needEditing === 'yes' && 'Editing',
      ].filter(Boolean).join(', ') || 'General Publishing';

      // Capture to admin database (non-blocking)
      base44.functions.invoke('captureFormSubmission', {
        formType: 'quote',
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        sourcePage: window.location.pathname,
        serviceInterest: [
          data.needCover === 'yes' && 'Cover Design',
          data.needPrinting === 'yes' && 'Printing',
          data.needTypesetting === 'yes' && 'Typesetting',
          data.needEditing === 'yes' && 'Editing',
        ].filter(Boolean),
        budget: null,
        bookTitle: null,
        bookGenre: data.bookGenre,
        bookPageCount: parseInt(data.numberOfPages),
        bookWordCount: parseInt(data.wordCount),
        additionalFields: {
          bookSize: data.bookSize,
          coverType: data.needCover === 'yes' ? data.coverType : null,
          printCopies: data.printCopies,
          paperType: data.paperType,
          coverFinish: data.coverFinish,
          typesettingType: data.typesettingType,
          editingWordCount: data.editingWordCount,
          startDate: data.startDate,
          howFound: data.howFound,
          notes: data.additionalNotes,
        },
      }).catch(err => console.error('Form capture failed:', err));

      // Send confirmation emails (primary action)
      await base44.functions.invoke('sendFormEmail', {
        formType: 'Quote Request',
        submitterName: `${data.firstName} ${data.lastName}`.trim(),
        submitterEmail: data.email,
        businessSubject: `New Quote Request from ${data.firstName} ${data.lastName} — ${serviceSummary}`,
        userSubject: "We've received your quote request — Creative Books SA",
        fields,
        pageUrl: 'https://www.creativebookssa.co.za/getquote',
        honeypot: '',
        loadedAt: null,
      });
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
        <div className="min-h-screen bg-[#060504] flex items-center justify-center px-4 pt-24 pb-16">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #B87333 0%, transparent 70%)', filter: 'blur(80px)' }} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-lg w-full text-center"
            style={{
              background: 'rgba(15,10,6,0.9)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(184,115,51,0.2)',
              borderRadius: '2rem',
              padding: '3rem 2.5rem',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(184,115,51,0.15)', border: '1px solid rgba(184,115,51,0.3)' }}
            >
              <CheckCircle className="w-10 h-10 text-copper" />
            </motion.div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
              Thanks, {data.firstName}! Your quote request has been received.
            </h2>
            <p className="text-white/50 font-body leading-relaxed mb-3 text-sm">
              We'll be in touch within 24 hours during business days. We've also sent a confirmation to <strong className="text-white/70">{data.email}</strong> — please check your inbox (and spam folder, just in case).
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all text-white bg-copper hover:bg-copper/90">
                <Home className="w-4 h-4" /> Back to Home
              </Link>
              <Link to="/selfpublishingpackagesinsouthafrica"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all text-white/70 hover:text-white"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                Explore Our Services <ArrowRight className="w-4 h-4" />
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

      {/* ── HERO ── */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-[#060504] pt-24 pb-16 px-4">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }}
          />
          <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.25) 0%, transparent 70%)', filter: 'blur(60px)' }}
          />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 rounded-full bg-copper/50"
            style={{ left: `${20 + i * 15}%`, top: `${25 + (i % 3) * 20}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          />
        ))}

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.25)' }}
          >
            <Sparkles className="w-4 h-4 text-copper" />
            <span className="text-copper text-sm font-medium font-body">100% Free — No Obligation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            Your Book Deserves<br />
            <span className="text-gradient-copper">Professional Publishing</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/55 font-body text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10"
          >
            Complete the 8-step form below and receive a personalised, transparent quote — tailored to your exact project. No hidden costs. Ever.
          </motion.p>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/40 text-sm font-body">
                <Icon className="w-4 h-4 text-copper" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-copper/50 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── FORM SECTION ── */}
      <section className="relative bg-vellum py-16 px-4">
        {/* Top wave transition */}
        <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden -mt-1">
          <div className="w-full h-full bg-[#060504]"
            style={{ clipPath: 'ellipse(60% 100% at 50% 0%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-8 rounded-lg bg-obsidian flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-copper" />
            </div>
            <span className="text-[#0F0F0F]/40 text-sm font-body uppercase tracking-widest">Your Quote</span>
          </motion.div>

          {/* Progress */}
          <QuoteProgress step={step} labels={STEP_LABELS} />

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-6 rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(184,115,51,0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {/* Card Header */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: 'rgba(15,15,15,0.92)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-copper/60" />
                </div>
                <span className="text-white/30 text-xs font-body uppercase tracking-widest">Step {step + 1} of 8</span>
              </div>
              <span className="text-copper text-xs font-body font-medium tracking-wide">{STEP_LABELS[step]}</span>
            </div>

            {/* Step Content */}
            <div className="p-6 md:p-10 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {STEPS[step]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="px-6 md:px-10 pb-8 flex items-center justify-between gap-4 border-t border-[#0F0F0F]/5 pt-6">
              <button
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body transition-all disabled:opacity-20 disabled:pointer-events-none"
                style={{ border: '1px solid rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.5)' }}
                onMouseEnter={e => { if (step > 0) { e.currentTarget.style.borderColor = '#B87333'; e.currentTarget.style.color = '#B87333'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.color = 'rgba(0,0,0,0.5)'; }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < 7 ? (
                <motion.button
                  onClick={next}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-2.5 text-white rounded-full text-sm font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
                    boxShadow: '0 8px 24px rgba(184,115,51,0.3)',
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={submit}
                  disabled={submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-2.5 text-white rounded-full text-sm font-medium transition-all disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
                    boxShadow: '0 8px 24px rgba(184,115,51,0.3)',
                  }}
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><CheckCircle className="w-4 h-4" /> Submit Quote Request</>}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Bottom reassurance */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center text-[#0F0F0F]/30 text-xs font-body mt-6"
          >
            🔒 Your information is kept private and never shared with third parties.
          </motion.p>
        </div>
      </section>
    </>
  );
}