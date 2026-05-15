import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const milestones = [
  { year: '2009', event: 'Founded in Johannesburg', done: true },
  { year: '2013', event: '100th book published', done: true },
  { year: '2017', event: 'Launched Amazon KDP services', done: true },
  { year: '2021', event: '400+ authors served nationwide', done: true },
  { year: '2024', event: '500+ books in print globally', done: true },
];

const values = [
  { code: 'EX', title: 'Excellence', desc: 'Every book meets the highest standard in editing, design, and print — no exceptions.' },
  { code: 'PT', title: 'Partnership', desc: 'We work alongside authors as creative partners, not just service vendors.' },
  { code: 'IN', title: 'Integrity', desc: 'Transparent pricing, honest timelines, and full author rights — always.' },
  { code: 'PS', title: 'Passion', desc: 'We believe every voice deserves to be heard. Books change lives.' },
];

export default function AboutSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-vellum overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(circle, #B87333 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* System label */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex items-center gap-3 mb-16">
          <div className="w-px h-8 bg-copper/40" />
          <span className="font-mono text-xs text-copper/50 tracking-[0.25em] uppercase">ABOUT_US · EST. 2009 · JHB, SOUTH AFRICA</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-24">

          {/* Left — large heading + text */}
          <motion.div className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-4xl md:text-5xl xl:text-6xl font-bold text-[#0F0F0F] leading-tight mb-8">
              South Africa's<br />
              <span className="text-gradient-copper">Publishing Authority</span>
            </h2>
            <div className="space-y-4 text-[#0F0F0F]/55 text-sm font-body leading-relaxed mb-8">
              <p>Since 2009, Creative Books SA has been the trusted partner for over 500 published authors. We combine professional publishing standards with deep expertise in the South African literary market and global distribution channels.</p>
              <p>Our certified team—editors, designers, production specialists—brings over 15 years of combined industry experience. We deliver measurable results: faster publication timelines, superior production quality, and increased reader discoverability across multiple platforms.</p>
              <p>From manuscript evaluation through global distribution, we provide end-to-end publishing solutions: professional editing, premium design, production management, ISBN coordination, and worldwide digital access via Amazon KDP, Apple Books, Takealot, and international retailers.</p>
            </div>
            <Link to="/aboutus" className="group inline-flex items-center gap-2 text-copper text-sm font-mono tracking-widest uppercase hover:gap-3 transition-all">
              LEARN MORE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right — image + timeline */}
          <motion.div className="lg:col-span-7"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>

            {/* Image with HUD frame */}
            <div className="relative mb-8">
              <div className="absolute -inset-px" style={{ border: '1px solid rgba(184,115,51,0.2)' }} />
              {/* Corner ticks */}
              {[['top-2 left-2', '0 0'], ['top-2 right-2', '0 0'], ['bottom-2 left-2', '0 0'], ['bottom-2 right-2', '0 0']].map(([pos], i) => (
                <div key={i} className={`absolute ${pos} w-5 h-5 pointer-events-none`}
                  style={{
                    borderTop: i < 2 ? '2px solid rgba(184,115,51,0.6)' : 'none',
                    borderBottom: i >= 2 ? '2px solid rgba(184,115,51,0.6)' : 'none',
                    borderLeft: i % 2 === 0 ? '2px solid rgba(184,115,51,0.6)' : 'none',
                    borderRight: i % 2 === 1 ? '2px solid rgba(184,115,51,0.6)' : 'none',
                  }} />
              ))}
              <img
                src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png"
                alt="Creative Books SA publishing team working in Johannesburg studio"
                className="w-full object-cover"
                style={{ aspectRatio: '16/7', objectPosition: 'center' }}
              />
              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(184,115,51,0.04) 0%, transparent 30%, transparent 70%, rgba(184,115,51,0.06) 100%)' }} />
              {/* Label */}
              <div className="absolute bottom-3 left-3 font-mono text-[9px] text-copper/50 tracking-widest">
                [IMG_01 · CREATIVE_BOOKS_SA · JOHANNESBURG]
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-[7px] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, rgba(184,115,51,0.5), rgba(184,115,51,0.05))' }} />
              <div className="space-y-4 pl-8">
                {milestones.map((m, i) => (
                  <motion.div key={m.year}
                    initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="relative flex items-center gap-4">
                    <div className="absolute -left-8 w-3.5 h-3.5 rounded-full border-2 border-copper bg-vellum" />
                    <span className="font-mono text-xs text-copper font-bold w-10 shrink-0">{m.year}</span>
                    <div className="h-px flex-1" style={{ background: 'rgba(184,115,51,0.15)' }} />
                    <span className="text-[#0F0F0F]/55 text-xs font-body">{m.event}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values — terminal-card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <motion.div key={v.code}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-6 cursor-default"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,115,51,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="font-mono text-[10px] text-copper/50 tracking-[0.3em] mb-4">[{v.code}]</div>
              <h3 className="font-heading text-base font-bold text-[#0F0F0F] mb-2">{v.title}</h3>
              <p className="text-[#0F0F0F]/50 text-xs font-body leading-relaxed">{v.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.4), transparent)' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}