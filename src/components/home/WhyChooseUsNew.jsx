import React from 'react';
import { motion } from 'framer-motion';
import { Eye, UserCheck, Award, Lightbulb, Globe2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  { icon: Eye,        title: 'Transparent Publishing Support',  desc: 'You receive clear guidance and a quote based on the services your book needs.' },
  { icon: UserCheck,  title: 'Author Control',                  desc: 'You remain in control of your book, your rights and your profits.' },
  { icon: Award,      title: 'Professional Production Quality', desc: 'Your book is prepared with attention to editing, design, layout, print quality and final presentation.' },
  { icon: Lightbulb,  title: 'Practical Guidance',             desc: 'We help authors understand the publishing process, from manuscript preparation to finished copies.' },
  { icon: Globe2,     title: 'Local and International Appeal',  desc: 'Creative Books SA gives authors a professional publishing experience with a standard that can compete beyond South Africa.' },
];

export default function WhyChooseUsNew() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#0B1220' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(184,149,91,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(184,149,91,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28"
          >
            <span className="inline-block text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body mb-5 border border-[#B8955B]/25 px-3 py-1 rounded-sm"
              style={{ background: 'rgba(184,149,91,0.06)' }}>
              Our Promise
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Why Authors Choose<br />Creative Books SA
            </h2>
            <p className="text-white/50 font-body leading-relaxed mb-8 text-base">
              Creative Books SA gives authors a clear, professional and transparent route to publishing. From manuscript preparation to printed copies, our team helps you create a book that looks polished, reads clearly and feels ready for the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/getquote"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-white group"
                style={{ background: '#B8955B', boxShadow: '0 8px 24px rgba(184,149,91,0.25)' }}
              >
                Request a Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/bookpublishing"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Explore Services
              </Link>
            </div>
          </motion.div>

          {/* Right — stacked cards */}
          <div className="space-y-3">
            {cards.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09, duration: 0.5 }}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="relative flex items-start gap-5 p-6 group overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)' }}>
                    <Icon className="w-5 h-5 text-[#B8955B]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white mb-1.5">{c.title}</h3>
                    <p className="text-white/45 text-xs font-body leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 w-px"
                    style={{ background: 'rgba(184,149,91,0)', transition: 'background 0.3s' }}
                    ref={el => {
                      if (!el) return;
                      el.parentElement.addEventListener('mouseenter', () => el.style.background = '#B8955B');
                      el.parentElement.addEventListener('mouseleave', () => el.style.background = 'rgba(184,149,91,0)');
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}