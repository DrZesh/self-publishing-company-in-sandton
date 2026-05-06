import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, PenLine, Palette, Printer, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Consultation',
    subtitle: 'Your story begins here',
    description: 'Share your vision with us. We discuss your goals, genre, target audience, and publishing preferences to craft the perfect publishing strategy.',
    detail: 'Free 30-minute consultation · Phone or video call · No obligation',
    color: 'from-amber-600 to-orange-700',
  },
  {
    number: '02',
    icon: PenLine,
    title: 'Editing & Refinement',
    subtitle: 'Polish your manuscript',
    description: 'Our expert editors transform your manuscript into a publication-ready masterwork. Proofreading, copy editing, and developmental feedback that elevates your writing.',
    detail: 'Turnaround: 2–6 weeks · Track changes provided · Multiple rounds included',
    color: 'from-orange-600 to-amber-700',
  },
  {
    number: '03',
    icon: Palette,
    title: 'Design & Layout',
    subtitle: 'Visual excellence',
    description: 'Award-quality cover design and meticulous interior typesetting that brings your book to life. Books that command attention on every shelf.',
    detail: '3 cover concepts · Unlimited revisions · Print & digital optimised',
    color: 'from-amber-700 to-yellow-700',
  },
  {
    number: '04',
    icon: Printer,
    title: 'Printing & Production',
    subtitle: 'Crafted to perfection',
    description: 'High-quality printing in our Johannesburg facility using premium materials. Softcover, hardcover, full-colour — every copy a masterpiece.',
    detail: 'Minimum 50 copies · 7–14 business days · Quality checked per copy',
    color: 'from-yellow-700 to-amber-600',
  },
  {
    number: '05',
    icon: Rocket,
    title: 'Launch & Distribute',
    subtitle: 'Share your story with the world',
    description: 'ISBN registration, Amazon KDP setup, bookshop submission, and author support for a successful book launch. Your book, everywhere it needs to be.',
    detail: 'ISBN included · Amazon KDP · National & international distribution',
    color: 'from-orange-700 to-amber-600',
  },
];

export default function ProcessTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-20 lg:py-28 bg-vellum relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #B87333 0%, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-copper text-sm font-body tracking-[0.3em] uppercase mb-4 block">Our Process</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-4">
            From Manuscript to Masterwork
          </h2>
          <p className="text-[#0F0F0F]/50 max-w-xl mx-auto font-body text-lg">
            Five seamless steps from concept to published author.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeStep === i;
            return (
              <motion.button
                key={step.number}
                onClick={() => setActiveStep(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="relative text-left rounded-2xl p-5 transition-all duration-300 focus:outline-none"
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(184,115,51,0.15) 0%, rgba(184,115,51,0.05) 100%)',
                  border: '1.5px solid rgba(184,115,51,0.35)',
                  boxShadow: '0 12px 40px rgba(184,115,51,0.12)',
                } : {
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                }}
              >
                <motion.div
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={isActive ? {
                    background: 'rgba(184,115,51,0.15)',
                    border: '1px solid rgba(184,115,51,0.3)',
                  } : {
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-copper' : 'text-[#0F0F0F]/40'}`} />
                </motion.div>
                <div className={`text-xs font-body font-semibold tracking-widest mb-1 ${isActive ? 'text-copper' : 'text-[#0F0F0F]/30'}`}>
                  {step.number}
                </div>
                <div className={`font-heading font-semibold text-sm leading-tight ${isActive ? 'text-[#0F0F0F]' : 'text-[#0F0F0F]/60'}`}>
                  {step.title}
                </div>

                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rotate-45 bg-vellum"
                    style={{ border: '1px solid rgba(184,115,51,0.3)', borderTop: 'none', borderLeft: 'none' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1a1208 100%)' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-0">
              <div className="p-10 lg:p-14">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(184,115,51,0.15)', border: '1px solid rgba(184,115,51,0.25)' }}>
                    {React.createElement(steps[activeStep].icon, { className: 'w-7 h-7 text-copper' })}
                  </div>
                  <div>
                    <div className="text-copper text-xs font-body tracking-[0.2em] uppercase">{steps[activeStep].number} of 05</div>
                    <div className="text-white/40 text-sm font-body">{steps[activeStep].subtitle}</div>
                  </div>
                </div>
                <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5">{steps[activeStep].title}</h3>
                <p className="text-white/60 font-body leading-relaxed text-lg mb-6">{steps[activeStep].description}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(184,115,51,0.08)', border: '1px solid rgba(184,115,51,0.15)' }}>
                  <span className="text-copper/80 text-sm font-body">{steps[activeStep].detail}</span>
                </div>
              </div>

              {/* Progress visual */}
              <div className="p-10 lg:p-14 flex flex-col justify-center border-t lg:border-t-0 lg:border-l"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="space-y-3">
                  {steps.map((s, i) => (
                    <motion.div
                      key={s.number}
                      onClick={() => setActiveStep(i)}
                      className="flex items-center gap-4 cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        i === activeStep ? 'bg-copper' : i < activeStep ? 'bg-copper/30' : 'bg-white/5'
                      }`}>
                        {i < activeStep ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className={`text-xs font-bold font-heading ${i === activeStep ? 'text-white' : 'text-white/30'}`}>{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-heading font-semibold transition-colors ${i === activeStep ? 'text-white' : i < activeStep ? 'text-white/50' : 'text-white/25 group-hover:text-white/40'}`}>
                          {s.title}
                        </div>
                        {i === activeStep && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 4, ease: 'linear' }}
                            className="h-0.5 bg-copper/40 mt-1 rounded-full"
                            onAnimationComplete={() => setActiveStep(prev => (prev + 1) % steps.length)}
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}