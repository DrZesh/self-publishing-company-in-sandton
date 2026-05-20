import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageMeta from '../../components/shared/PageMeta';
import { base44 } from '@/api/base44Client';
import { computePricing, formatZAR } from '../../lib/calculatorPricing';

import WizardProgress from '../../components/calculator2/WizardProgress';
import EstimateSidebar from '../../components/calculator2/EstimateSidebar';
import MobileEstimateBar from '../../components/calculator2/MobileEstimateBar';

import Step1ProjectType from '../../components/calculator2/steps/Step1ProjectType';
import Step2Stage from '../../components/calculator2/steps/Step2Stage';
import Step3Length from '../../components/calculator2/steps/Step3Length';
import Step4Editing from '../../components/calculator2/steps/Step4Editing';
import Step5Cover from '../../components/calculator2/steps/Step5Cover';
import Step6Layout from '../../components/calculator2/steps/Step6Layout';
import Step7Printing from '../../components/calculator2/steps/Step7Printing';
import Step8Ebook from '../../components/calculator2/steps/Step8Ebook';
import Step9Extras from '../../components/calculator2/steps/Step9Extras';
import Step10Final from '../../components/calculator2/steps/Step10Final';
import ReviewScreen from '../../components/calculator2/ReviewScreen';
import LeadModal from '../../components/calculator2/LeadModal';
import SuccessState from '../../components/calculator2/SuccessState';

const LS_KEY = 'cbsa_calculator_wizard_state';
const TOTAL_STEPS = 10;

const DEFAULT_ANSWERS = {
  projectType: null,
  stage: null,
  pages: 200,
  words: 50000,
  editingType: null,
  ghostwriting: false,
  ghostBudget: null,
  coverTier: null,
  coverVariant: null,
  layoutTier: null,
  wantPrint: true,
  bookSize: 'a5',
  copies: 100,
  specialPrint: [],
  wantEbook: false,
  extras: [],
  timeline: null,
  priorities: [],
  notes: '',
  chosenPath: null, // 'A' | 'B' | 'custom'
};

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [phase, setPhase] = useState('wizard'); // 'wizard' | 'review' | 'success'
  const [leadModal, setLeadModal] = useState(null); // null | 'email' | 'pdf'
  const [submittedData, setSubmittedData] = useState(null);
  const [restoredBanner, setRestoredBanner] = useState(false);
  const [savedStep, setSavedStep] = useState(null);
  const [inclVat, setInclVat] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { answers: a, step: s, savedAt } = JSON.parse(saved);
        const age = Date.now() - savedAt;
        if (age < 30 * 24 * 3600 * 1000 && s > 1) {
          setSavedStep(s);
          setRestoredBanner(true);
          // store for resume
          window._cbsa_saved = { answers: a, step: s };
        }
      }
    } catch {}
  }, []);

  // Persist on every change
  useEffect(() => {
    if (phase !== 'wizard') return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ answers, step, savedAt: Date.now() }));
    } catch {}
  }, [answers, step, phase]);

  const update = useCallback((patch) => {
    setAnswers(prev => ({ ...prev, ...patch }));
  }, []);

  const pricing = useMemo(() => computePricing(answers), [answers]);

  // Determine which steps to show based on answers
  const getStepLabel = (n) => ['Project', 'Manuscript', 'Length', 'Editing', 'Design', 'Layout', 'Printing', 'Ebook', 'Extras', 'Review'][n - 1];

  const shouldSkipStep = useCallback((n) => {
    const { stage } = answers;
    if (n === 4) {
      // Show ghostwriting variant if "just an idea"
      // Show nothing if already edited / fully designed / ebook only
      return stage === 'already_edited' || stage === 'fully_designed' || stage === 'ebook_only_ready';
    }
    if (n === 5) return stage === 'fully_designed' || stage === 'ebook_only_ready';
    if (n === 6) return stage === 'fully_designed';
    return false;
  }, [answers]);

  const nextStep = useCallback(() => {
    let next = step + 1;
    while (next <= TOTAL_STEPS && shouldSkipStep(next)) next++;
    if (next > TOTAL_STEPS) {
      setPhase('review');
    } else {
      setStep(next);
    }
    base44.analytics.track({ eventName: 'step_completed', properties: { step } });
  }, [step, shouldSkipStep]);

  const prevStep = useCallback(() => {
    let prev = step - 1;
    while (prev >= 1 && shouldSkipStep(prev)) prev--;
    if (prev >= 1) setStep(prev);
    base44.analytics.track({ eventName: 'step_back', properties: { step } });
  }, [step, shouldSkipStep]);

  const resumeSaved = () => {
    if (window._cbsa_saved) {
      setAnswers(window._cbsa_saved.answers);
      setStep(window._cbsa_saved.step);
      setRestoredBanner(false);
      base44.analytics.track({ eventName: 'wizard_resumed', properties: { step: window._cbsa_saved.step } });
    }
  };

  const reset = () => {
    setAnswers(DEFAULT_ANSWERS);
    setStep(1);
    setPhase('wizard');
    setRestoredBanner(false);
    localStorage.removeItem(LS_KEY);
  };

  const skipToReview = () => {
    setPhase('review');
    base44.analytics.track({ eventName: 'skip_to_summary_clicked', properties: { step } });
  };

  const stepProps = { answers, update, onNext: nextStep, onBack: prevStep };

  const renderStep = () => {
    switch (step) {
      case 1:  return <Step1ProjectType {...stepProps} />;
      case 2:  return <Step2Stage {...stepProps} />;
      case 3:  return <Step3Length {...stepProps} inclVat={inclVat} />;
      case 4:  return <Step4Editing {...stepProps} />;
      case 5:  return <Step5Cover {...stepProps} />;
      case 6:  return <Step6Layout {...stepProps} />;
      case 7:  return <Step7Printing {...stepProps} pricing={pricing} />;
      case 8:  return <Step8Ebook {...stepProps} />;
      case 9:  return <Step9Extras {...stepProps} />;
      case 10: return <Step10Final {...stepProps} />;
      default: return null;
    }
  };

  // Active step for progress (accounting for skipped)
  const activeStepCount = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)
    .filter(n => !shouldSkipStep(n)).length;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <PageMeta
        title="Book Printing Cost Calculator"
        description="Calculate book printing costs instantly. Get accurate quotes by format, page count, paper type and print run. Free tool, no signup required."
        description="Calculate book printing costs instantly. Get accurate quotes by format, page count, paper type and print run. Free tool, no signup required."
        canonical="https://www.creativebooks.co.za/calculator"
      />

      {/* Header */}
      <div className="bg-[#0A0806] border-b border-copper/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" className="h-10 w-auto" />
          </div>
          <div className="text-right">
            <div className="text-copper text-xs font-medium">Publishing Calculator</div>
            <div className="text-white/40 text-xs">Instant smart quote builder</div>
          </div>
        </div>
      </div>

      {/* Restored banner */}
      <AnimatePresence>
        {restoredBanner && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-copper/10 border-b border-copper/20 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-sm">
              <span className="text-[#2C2C2C]">👋 Welcome back — continue your quote from Step {savedStep}?</span>
              <div className="flex gap-3">
                <button onClick={resumeSaved} className="text-copper font-semibold hover:underline whitespace-nowrap">Resume</button>
                <button onClick={() => setRestoredBanner(false)} className="text-[#2C2C2C]/50 hover:underline whitespace-nowrap">Start fresh</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'wizard' && (
        <>
          {/* Progress bar */}
          <WizardProgress step={step} total={TOTAL_STEPS} getLabel={getStepLabel} shouldSkip={shouldSkipStep} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32 lg:pb-16">
            <div className="flex gap-8 items-start">
              {/* Main wizard area */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div key={step}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}>
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Skip to summary (step 5+) */}
                {step >= 5 && (
                  <div className="text-center mt-6">
                    <button onClick={skipToReview} className="text-sm text-[#2C2C2C]/40 hover:text-copper transition-colors underline">
                      Skip to summary →
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop sidebar */}
              <div className="hidden lg:block w-[360px] flex-shrink-0">
                <EstimateSidebar
                  answers={answers}
                  pricing={pricing}
                  inclVat={inclVat}
                  setInclVat={setInclVat}
                  step={step}
                  onGoToReview={() => setPhase('review')}
                />
              </div>
            </div>
          </div>

          {/* Mobile estimate bar */}
          <MobileEstimateBar
            answers={answers}
            pricing={pricing}
            inclVat={inclVat}
            step={step}
            onNext={nextStep}
            canNext={!!answers.projectType}
          />
        </>
      )}

      {phase === 'review' && (
        <ReviewScreen
          answers={answers}
          pricing={pricing}
          inclVat={inclVat}
          setInclVat={setInclVat}
          update={update}
          onBack={() => { setPhase('wizard'); setStep(10); }}
          onEmail={() => setLeadModal('email')}
          onPdf={() => setLeadModal('pdf')}
          onTalkToPublisher={() => window.location.href = '/getquote'}
        />
      )}

      {phase === 'success' && submittedData && (
        <SuccessState data={submittedData} onReset={reset} />
      )}

      <AnimatePresence>
        {leadModal && (
          <LeadModal
            mode={leadModal}
            answers={answers}
            pricing={pricing}
            inclVat={inclVat}
            onClose={() => setLeadModal(null)}
            onSuccess={(info) => {
              setSubmittedData({ answers, pricing, inclVat, clientInfo: info });
              setLeadModal(null);
              setPhase('success');
              localStorage.removeItem(LS_KEY);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}