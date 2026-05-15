import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Circle, ArrowRight, AlertCircle } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const STAGES = [
  {
    id: 'manuscript',
    label: 'Manuscript Ready',
    description: 'You have a completed manuscript',
    daysFromStart: 0,
    order: 1,
  },
  {
    id: 'editing',
    label: 'Editing',
    description: 'Professional editing (copy/developmental)',
    daysFromStart: 14,
    durationDays: 21,
    order: 2,
  },
  {
    id: 'cover',
    label: 'Cover Design',
    description: 'Professional cover design',
    daysFromStart: 35,
    durationDays: 10,
    order: 3,
  },
  {
    id: 'typesetting',
    label: 'Typesetting & Layout',
    description: 'Professional book layout and formatting',
    daysFromStart: 45,
    durationDays: 10,
    order: 4,
  },
  {
    id: 'proofs',
    label: 'Proofing & Revisions',
    description: 'Review proofs and final corrections',
    daysFromStart: 55,
    durationDays: 7,
    order: 5,
  },
  {
    id: 'printing',
    label: 'Printing & Distribution',
    description: 'Print-on-demand setup or printing run',
    daysFromStart: 62,
    durationDays: 10,
    order: 6,
  },
  {
    id: 'marketing',
    label: 'Marketing & Launch',
    description: 'Launch marketing campaign',
    daysFromStart: 72,
    durationDays: 7,
    order: 7,
  },
];

export default function PublishingRoadmap() {
  const [currentStage, setCurrentStage] = useState('manuscript');
  const [includeServices, setIncludeServices] = useState({
    editing: false,
    cover: true,
    typesetting: true,
  });

  const selectedStageObj = useMemo(() => {
    return STAGES.find((s) => s.id === currentStage);
  }, [currentStage]);

  const timeline = useMemo(() => {
    const baselineDate = new Date();
    const stages = STAGES.map((stage) => {
      const startDate = new Date(baselineDate);
      startDate.setDate(startDate.getDate() + stage.daysFromStart);

      const endDate = new Date(startDate);
      if (stage.durationDays) {
        endDate.setDate(endDate.getDate() + stage.durationDays);
      }

      return {
        ...stage,
        startDate,
        endDate,
        isCompleted: STAGES.findIndex((s) => s.id === stage.id) < STAGES.findIndex((s) => s.id === currentStage),
        isActive: stage.id === currentStage,
      };
    });

    return stages;
  }, [currentStage]);

  const finalDate = useMemo(() => {
    let lastDate = new Date();
    timeline.forEach((stage) => {
      if (stage.endDate > lastDate) {
        lastDate = stage.endDate;
      }
    });
    return lastDate;
  }, [timeline]);

  const daysToCompletion = useMemo(() => {
    const today = new Date();
    return Math.ceil((finalDate - today) / (1000 * 60 * 60 * 24));
  }, [finalDate]);

  const remainingStages = useMemo(() => {
    const currentIndex = timeline.findIndex((s) => s.isActive);
    return timeline.slice(currentIndex);
  }, [timeline]);

  return (
    <div>
      <PageMeta
        title="Publishing Roadmap Tool | Timeline Calculator | Creative Books SA"
        description="Interactive tool to plan your book's publishing timeline. See estimated dates from your current stage to publication."
        keywords="publishing timeline, book roadmap, publishing timeline calculator, self-publishing timeline"
        canonical="https://www.creativebookssa.co.za/publishingroadmap"
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <Calendar className="w-4 h-4 text-copper" />
              <span className="text-copper text-sm font-medium">Free Tool</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Publishing Roadmap</h1>
            <p className="text-white/60 text-lg font-body">
              See your path to publication. Select your current stage and get an estimated timeline for when your book will be ready to launch.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tool */}
      <section className="py-16 lg:py-20 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stage Selection */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-2">Where are you in the process?</h2>
                <p className="text-[#0F0F0F]/60 font-body text-sm mb-6">
                  Select your current publishing stage to see your timeline to launch.
                </p>

                <div className="space-y-3">
                  {STAGES.map((stage) => {
                    const isSelected = stage.id === currentStage;
                    return (
                      <motion.button
                        key={stage.id}
                        onClick={() => setCurrentStage(stage.id)}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: stage.order * 0.05 }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-copper bg-copper/10'
                            : 'border-[#0F0F0F]/10 bg-white hover:border-copper/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-copper flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-[#0F0F0F]/20" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#0F0F0F]">{stage.label}</h3>
                            <p className="text-sm text-[#0F0F0F]/60 font-body">{stage.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Services Selection */}
              <div className="pt-6 border-t border-[#0F0F0F]/10">
                <h3 className="font-heading font-bold text-[#0F0F0F] mb-4">Services Included in Timeline</h3>
                <div className="space-y-2">
                  {[
                    { id: 'editing', label: 'Professional Editing (add 21 days)', default: false },
                    { id: 'cover', label: 'Professional Cover Design (add 10 days)', default: true },
                    { id: 'typesetting', label: 'Professional Typesetting (add 10 days)', default: true },
                  ].map(({ id, label, default: defaultVal }) => (
                    <label key={id} className="flex items-center gap-3 p-3 border border-[#0F0F0F]/10 rounded-lg cursor-pointer hover:bg-copper/5 transition-all" style={{ borderColor: includeServices[id] ? '#B87333' : '#0F0F0F10' }}>
                      <input
                        type="checkbox"
                        checked={includeServices[id]}
                        onChange={(e) => setIncludeServices({ ...includeServices, [id]: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[#0F0F0F]/80 font-body">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Timeline Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-20 lg:h-fit"
            >
              <div className="p-8 rounded-2xl bg-white border-2 border-copper/20" style={{ boxShadow: '0 10px 40px rgba(184,115,51,0.1)' }}>
                <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-6">Your Timeline</h3>

                <div className="space-y-6">
                  {/* Current Stage */}
                  <div>
                    <p className="text-[#0F0F0F]/60 text-xs font-body mb-2">Current Stage</p>
                    <p className="font-heading text-lg font-bold text-copper">{selectedStageObj?.label}</p>
                  </div>

                  {/* Completion Date */}
                  <div className="pt-4 border-t border-[#0F0F0F]/10">
                    <p className="text-[#0F0F0F]/60 text-xs font-body mb-2">Estimated Publication Date</p>
                    <p className="font-heading text-2xl font-bold text-[#0F0F0F]">
                      {finalDate.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-copper font-medium mt-1">{daysToCompletion} days from now</p>
                  </div>

                  {/* Remaining Stages */}
                  <div className="pt-4 border-t border-[#0F0F0F]/10">
                    <p className="text-xs font-semibold text-[#0F0F0F] mb-3">Remaining Stages</p>
                    <div className="space-y-2">
                      {remainingStages.map((stage, idx) => (
                        <div key={stage.id} className="flex gap-2 text-xs">
                          <span className="text-copper font-semibold w-5">{idx + 1}.</span>
                          <div>
                            <p className="text-[#0F0F0F] font-medium">{stage.label}</p>
                            <p className="text-[#0F0F0F]/50">
                              {stage.startDate.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                              {stage.durationDays && ` · ~${stage.durationDays} days`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-[#0F0F0F]/10">
                    <Link
                      to="/getquote"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
                    >
                      Get a Quote
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Full Timeline Visualization */}
          <div className="mt-12 pt-12 border-t border-[#0F0F0F]/10">
            <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-8">Complete Publishing Timeline</h2>
            <div className="space-y-4">
              {timeline.map((stage) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-lg border ${
                    stage.isCompleted
                      ? 'bg-green-50 border-green-200'
                      : stage.isActive
                      ? 'bg-copper/10 border-copper'
                      : 'bg-white border-[#0F0F0F]/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {stage.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : stage.isActive ? (
                        <Circle className="w-5 h-5 text-copper fill-copper" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#0F0F0F]/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-heading font-bold ${stage.isCompleted ? 'text-green-700' : stage.isActive ? 'text-copper' : 'text-[#0F0F0F]'}`}>
                          {stage.label}
                        </h3>
                        {stage.isCompleted && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Completed</span>}
                        {stage.isActive && <span className="text-xs font-semibold text-copper bg-copper/10 px-2 py-1 rounded">Current</span>}
                      </div>
                      <p className="text-sm text-[#0F0F0F]/60 font-body mb-2">{stage.description}</p>
                      <div className="flex gap-4 text-xs text-[#0F0F0F]/50 font-body">
                        <span>Starts: {stage.startDate.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {stage.durationDays && <span>Duration: ~{stage.durationDays} days</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this timeline accurate for my book?', a: 'This roadmap shows typical timelines based on our service experience. Your actual timeline may vary based on your manuscript length, complexity, and revision requirements. Contact us for a personalized estimate.' },
              { q: 'Can I speed up the process?', a: 'Yes. Some stages can be shortened or run in parallel. Contact our team to discuss expedited options and rush services.' },
              { q: 'What if I already have a cover or typeset book?', a: 'You can select a later stage in the roadmap to adjust the timeline. If you have specific services completed, reach out for a custom quote.' },
              { q: 'Does this include ISBN registration?', a: 'ISBN registration is handled separately and typically takes 5-10 business days. You can start registering while other stages are in progress.' },
              { q: 'What happens after the launch date?', a: 'Post-launch, we provide support for distribution setup, marketing coordination, and any reprints or updates needed for your book.' },
              { q: 'Are there extra costs if the timeline gets longer?', a: 'Service pricing is based on the scope of work, not the timeline. However, rush services or expedited turnarounds may incur additional fees.' },
            ].map((faq, i) => (
              <details key={i} className="group border border-[#0F0F0F]/10 rounded-lg p-4 hover:border-copper/40 transition-all">
                <summary className="flex items-center justify-between cursor-pointer font-medium text-[#0F0F0F]">
                  {faq.q}
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-[#0F0F0F]/70 font-body text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks
        links={[
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Cover Design', path: '/bookcoverdesign' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        light
      />

      <CTASection
        title="Ready to Start Your Publishing Journey?"
        description="Use this roadmap to plan your timeline, then contact us to get started with the services your book needs."
      />
    </div>
  );
}