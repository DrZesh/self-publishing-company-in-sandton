import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const STAGES = [
  {
    id: 'manuscript',
    label: 'Manuscript Ready',
    description: 'You have a completed manuscript',
    daysFromStart: 0,
    durationDays: 0,
    order: 1,
  },
  {
    id: 'editing',
    label: 'Editing',
    description: 'Professional editing (copy/developmental)',
    daysFromStart: 0,
    durationDays: 9,
    order: 2,
  },
  {
    id: 'cover',
    label: 'Cover Design',
    description: 'Professional cover design',
    daysFromStart: 9,
    durationDays: 7,
    order: 3,
  },
  {
    id: 'typesetting',
    label: 'Typesetting & Layout',
    description: 'Professional book layout and formatting',
    daysFromStart: 16,
    durationDays: 4,
    order: 4,
  },
  {
    id: 'proofs',
    label: 'Proofing & Revisions',
    description: 'Review proofs and final corrections',
    daysFromStart: 20,
    durationDays: 2,
    order: 5,
  },
  {
    id: 'printing',
    label: 'Printing & Distribution',
    description: 'Print-on-demand setup or printing run',
    daysFromStart: 22,
    durationDays: 10,
    order: 6,
  },
];

export default function PublishingRoadmap() {
  const [currentStage, setCurrentStage] = useState('manuscript');

  const timeline = useMemo(() => {
    const baselineDate = new Date();
    return STAGES.map((stage) => {
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
        isFuture: STAGES.findIndex((s) => s.id === stage.id) > STAGES.findIndex((s) => s.id === currentStage),
      };
    });
  }, [currentStage]);

  const currentStageObj = timeline.find((s) => s.isActive);
  const currentStageEndDate = currentStageObj?.endDate || new Date();

  const daysToCompletion = useMemo(() => {
    const today = new Date();
    return Math.ceil((currentStageEndDate - today) / (1000 * 60 * 60 * 24));
  }, [currentStageEndDate]);

  return (
    <div>
      <PageMeta
        title="Publishing Roadmap | Your Path to Published Author"
        description="Interactive roadmap of the complete publishing journey — manuscript to distribution. Step-by-step guide for first-time South African authors."
        keywords="publishing timeline, book roadmap, publishing timeline calculator, self-publishing timeline"
        canonical="https://www.creativebookssa.co.za/publishingroadmap"
      />

      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <Calendar className="w-4 h-4 text-copper" />
              <span className="text-copper text-sm font-medium">Free Tool</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Publishing Roadmap</h1>
            <p className="text-white/60 text-lg font-body max-w-2xl">
              Select where you are in the publishing process to see your personalized timeline to book release.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Stage Selection */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-8 text-center">Where are you in your publishing journey?</h2>
            
            {/* Timeline visualization with clickable stages */}
            <div className="flex flex-col space-y-4">
              {timeline.map((stage, idx) => (
                <motion.button
                  key={stage.id}
                  onClick={() => setCurrentStage(stage.id)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    stage.isActive
                      ? 'border-copper bg-copper/15 shadow-lg'
                      : stage.isCompleted
                      ? 'border-green-300 bg-green-50'
                      : 'border-[#0F0F0F]/10 bg-white hover:border-copper/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Stage number/icon */}
                    <div className="flex-shrink-0">
                      {stage.isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      ) : stage.isActive ? (
                        <div className="w-10 h-10 rounded-full bg-copper flex items-center justify-center">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-[#0F0F0F]/30 flex items-center justify-center text-[#0F0F0F]/60 font-semibold">
                          {stage.order}
                        </div>
                      )}
                    </div>

                    {/* Stage info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-heading font-bold text-lg ${
                          stage.isCompleted ? 'text-green-700' : stage.isActive ? 'text-copper' : 'text-[#0F0F0F]'
                        }`}>
                          {stage.label}
                        </h3>
                        {stage.isCompleted && <span className="text-xs font-semibold text-green-700">✓ Completed</span>}
                        {stage.isActive && <span className="text-xs font-semibold text-copper">• Current Stage</span>}
                      </div>
                      <p className="text-[#0F0F0F]/60 text-sm font-body mt-1">{stage.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-[#0F0F0F]/50">
                        {stage.durationDays > 0 && <span>{stage.durationDays} days</span>}
                        <span>Starts: {stage.startDate.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    {stage.isActive && <ArrowRight className="w-5 h-5 text-copper flex-shrink-0" />}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border-2 border-copper/20"
            style={{ boxShadow: '0 10px 40px rgba(184,115,51,0.1)' }}
          >
            <div className="text-center">
              <p className="text-[#0F0F0F]/60 text-sm font-body mb-3">Current Stage</p>
              <h3 className="font-heading text-2xl font-bold text-copper mb-6">{currentStageObj?.label}</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-copper/5 rounded-lg">
                  <p className="text-[#0F0F0F]/60 text-xs font-body mb-1">Completion Date</p>
                  <p className="font-heading text-2xl font-bold text-[#0F0F0F]">
                    {currentStageEndDate.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-4 bg-copper/5 rounded-lg">
                  <p className="text-[#0F0F0F]/60 text-xs font-body mb-1">Days Remaining</p>
                  <p className="font-heading text-2xl font-bold text-copper">{daysToCompletion}</p>
                </div>
              </div>

              {/* Next stages preview */}
              {timeline.some((s) => s.isFuture) && (
                <div className="mt-6 pt-6 border-t border-[#0F0F0F]/10 text-left">
                  <p className="text-[#0F0F0F]/60 text-xs font-body mb-3 font-semibold">What's Next:</p>
                  <div className="space-y-2">
                    {timeline
                      .filter((s) => s.isFuture)
                      .slice(0, 3)
                      .map((stage, idx) => (
                        <div key={stage.id} className="flex items-center gap-3 text-sm">
                          <span className="text-copper font-semibold">{idx + 1}.</span>
                          <div>
                            <p className="text-[#0F0F0F] font-medium">{stage.label}</p>
                            <p className="text-[#0F0F0F]/50 text-xs">{stage.durationDays} days</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <Link
                to="/getquote"
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
              >
                Get a Custom Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this timeline accurate for my book?', a: 'This roadmap shows typical timelines based on our service experience. Your actual timeline may vary based on your manuscript length, complexity, and revision requirements. Contact us for a personalized estimate.' },
              { q: 'Can I speed up the process?', a: 'Yes. Some stages can be shortened or run in parallel. Contact our team to discuss expedited options and rush services.' },
              { q: 'What if I already have a cover or typeset book?', a: 'You can select a later stage in the roadmap to adjust the timeline. If you have specific services completed, reach out for a custom quote.' },
              { q: 'Does this include ISBN registration?', a: 'ISBN registration is handled separately and typically takes 5-10 business days. You can start registering while other stages are in progress.' },
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