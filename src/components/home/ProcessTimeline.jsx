import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, PenLine, Palette, Printer, Rocket } from 'lucide-react';

const steps = [
  { id: 0, num: '01', icon: MessageCircle, title: 'Consultation', tag: 'INIT', desc: 'Share your vision. We discuss your goals, genre, target audience, and publishing strategy — free 30-minute session.', meta: '30 min · Free · Phone or video', progress: 20 },
  { id: 1, num: '02', icon: PenLine, title: 'Editing', tag: 'EDIT', desc: 'Expert editors transform your manuscript into a publication-ready masterwork — proofreading, copy editing, developmental feedback.', meta: '2–6 weeks · Track changes · Multiple rounds', progress: 40 },
  { id: 2, num: '03', icon: Palette, title: 'Design & Layout', tag: 'DSNG', desc: 'Award-quality cover design and meticulous interior typesetting. Three cover concepts, unlimited revisions, print and digital optimised.', meta: '1–3 weeks · 3 concepts · Unlimited revisions', progress: 60 },
  { id: 3, num: '04', icon: Printer, title: 'Print & Produce', tag: 'PRNT', desc: 'High-quality printing in Johannesburg with premium materials. 7–14 business day turnaround. Every copy quality-checked.', meta: '7–14 days · Premium materials · Quality checked', progress: 80 },
  { id: 4, num: '05', icon: Rocket, title: 'Launch & Distribute', tag: 'DIST', desc: 'ISBN registration, Amazon KDP setup, bookshop submission, and author support for a successful launch in South Africa and globally.', meta: 'ISBN + Amazon KDP · National + International', progress: 100 },
];

export default function ProcessTimeline() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setActive(p => (p + 1) % steps.length), 4500);
    return () => clearTimeout(t);
  }, [active]);

  const step = steps[active];

  return (
    <section className="relative py-24 lg:py-32 bg-[#050403] overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(184,115,51,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(184,115,51,0.8) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Ambient */}
      <motion.div animate={{ opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 6, repeat: Infinity }}
        className="absolute pointer-events-none"
        style={{ width: 600, height: 600, right: '-10%', top: '50%', transform: 'translateY(-50%)', background: 'radial-gradient(circle, rgba(184,115,51,0.2) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
            <span className="font-mono text-xs text-copper/50 tracking-[0.3em] uppercase">PROCESS_FLOW · 5 STAGES</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Manuscript<br /><span className="text-gradient-copper">to Masterwork</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* Left: step selector */}
          <div className="space-y-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = active === i;
              const isDone = i < active;
              return (
                <motion.button key={s.id} onClick={() => setActive(i)}
                  className="w-full text-left relative overflow-hidden transition-all duration-300 focus:outline-none group"
                  style={{
                    background: isActive ? 'rgba(184,115,51,0.07)' : 'rgba(255,255,255,0.015)',
                    border: isActive ? '1px solid rgba(184,115,51,0.35)' : '1px solid rgba(255,255,255,0.05)',
                    padding: '16px 20px',
                  }}>
                  {/* Progress fill */}
                  {isDone && (
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(184,115,51,0.03)' }} />
                  )}
                  <div className="flex items-center gap-4">
                    {/* Status indicator */}
                    <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 transition-all"
                      style={isActive ? {
                        background: 'rgba(184,115,51,0.15)', border: '1px solid rgba(184,115,51,0.4)',
                      } : isDone ? {
                        background: 'rgba(184,115,51,0.06)', border: '1px solid rgba(184,115,51,0.15)',
                      } : {
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                      {isDone ? (
                        <svg className="w-3 h-3 text-copper/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-copper' : 'text-white/20'}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-[10px] tracking-widest ${isActive ? 'text-copper' : isDone ? 'text-copper/40' : 'text-white/20'}`}>{s.num}</span>
                        <span className={`font-heading text-sm font-semibold truncate ${isActive ? 'text-white' : isDone ? 'text-white/50' : 'text-white/25'}`}>{s.title}</span>
                      </div>

                      {/* Active progress bar */}
                      {isActive && (
                        <motion.div className="mt-2 h-px w-full relative overflow-hidden"
                          style={{ background: 'rgba(184,115,51,0.15)' }}>
                          <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }}
                            transition={{ duration: 4.5, ease: 'linear' }}
                            className="absolute inset-0 h-px"
                            style={{ background: 'linear-gradient(90deg, #B87333, rgba(184,115,51,0.4))' }}
                          />
                        </motion.div>
                      )}
                    </div>

                    <span className={`font-mono text-[9px] tracking-widest shrink-0 ${isActive ? 'text-copper/60' : 'text-white/10'}`}>[{s.tag}]</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: detail panel */}
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="relative flex flex-col justify-between p-8 lg:p-10 overflow-hidden"
              style={{ background: 'rgba(184,115,51,0.04)', border: '1px solid rgba(184,115,51,0.2)' }}>

              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.8), transparent)' }} />

              {/* Background step number */}
              <div className="absolute -right-4 -bottom-8 font-heading font-bold text-[160px] leading-none select-none pointer-events-none"
                style={{ color: 'rgba(184,115,51,0.04)' }}>
                {step.num}
              </div>

              <div>
                {/* Tag + num */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-2 py-0.5 font-mono text-[10px] text-copper tracking-widest"
                    style={{ border: '1px solid rgba(184,115,51,0.3)', background: 'rgba(184,115,51,0.06)' }}>
                    [{step.tag}]
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'rgba(184,115,51,0.15)' }} />
                  <span className="font-mono text-[10px] text-white/20">{step.num} / 05</span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded flex items-center justify-center mb-5"
                  style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.25)' }}>
                  {React.createElement(step.icon, { className: 'w-6 h-6 text-copper' })}
                </div>

                <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-white/55 font-body leading-relaxed mb-6">{step.desc}</p>

                {/* Meta pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] text-copper/70 tracking-wide"
                  style={{ background: 'rgba(184,115,51,0.06)', border: '1px solid rgba(184,115,51,0.15)' }}>
                  ◈ {step.meta}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-8">
                <div className="flex justify-between font-mono text-[9px] text-white/20 mb-1.5">
                  <span>PIPELINE PROGRESS</span>
                  <span>{step.progress}%</span>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${step.progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #B87333, rgba(184,115,51,0.4))' }} />
                </div>
              </div>

              {/* Bottom glow line */}
              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.4), transparent)' }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}