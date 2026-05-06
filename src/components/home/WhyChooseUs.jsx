import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Clock, Award, Heart, TrendingUp, Zap } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Books Published', sub: 'across SA & globally' },
  { value: '15+', label: 'Years Experience', sub: 'Johannesburg based' },
  { value: '100%', label: 'Rights Retained', sub: 'always, no exceptions' },
  { value: '9', label: 'Provinces Served', sub: 'nationwide delivery' },
];

const reasons = [
  { icon: Shield, code: 'RTS', title: '100% Rights Retained', desc: 'You own every word, every idea, every royalty. We are a service provider — never a rights holder.' },
  { icon: Clock, code: 'SPD', title: 'Industry-Fast Turnaround', desc: 'Weeks — not the 18-month delays of traditional publishing. Streamlined from day one.' },
  { icon: Award, code: 'QLT', title: 'Award-Winning Quality', desc: 'Books indistinguishable from global publishers. Premium paper, precision binding, stunning covers.' },
  { icon: Heart, code: 'ZAF', title: 'Proudly South African', desc: 'Joburg-based, locally rooted. We know the SA market, the readers, the bookshops.' },
  { icon: TrendingUp, code: 'DST', title: 'Print to Global Digital', desc: 'Amazon KDP, eBook, 70+ countries. We extend your reach far beyond local shelves.' },
  { icon: Zap, code: 'UNI', title: 'One Partner. Everything.', desc: 'Editing, design, print, ISBN, KDP, author website — all under one roof, one invoice.' },
];

export default function WhyChooseUs({ bookImage }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-vellum overflow-hidden">
      {/* Dot matrix */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #B87333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* System label */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex items-center gap-3 mb-6">
          <div className="w-px h-6 bg-copper/40" />
          <span className="font-mono text-xs text-copper/50 tracking-[0.25em] uppercase">WHY_US · PERFORMANCE_METRICS · CREATIVE_BOOKS_SA</span>
        </motion.div>

        {/* Stats — HUD panels */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-20">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative p-5 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,115,51,0.15)', backdropFilter: 'blur(10px)' }}>
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-copper/40" />
              <div className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-0.5">{s.value}</div>
              <div className="font-mono text-[10px] text-copper tracking-widest uppercase mb-0.5">{s.label}</div>
              <div className="text-[#0F0F0F]/35 text-[10px] font-body">{s.sub}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.4), transparent)' }} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">

          {/* Image */}
          <motion.div style={{ y }} className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 rounded-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 70%)' }} />

            {/* HUD frame */}
            <div className="relative">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`absolute w-6 h-6 pointer-events-none z-10 ${i === 0 ? 'top-0 left-0' : i === 1 ? 'top-0 right-0' : i === 2 ? 'bottom-0 left-0' : 'bottom-0 right-0'}`}
                  style={{
                    borderTop: i < 2 ? '2px solid rgba(184,115,51,0.7)' : 'none',
                    borderBottom: i >= 2 ? '2px solid rgba(184,115,51,0.7)' : 'none',
                    borderLeft: i % 2 === 0 ? '2px solid rgba(184,115,51,0.7)' : 'none',
                    borderRight: i % 2 === 1 ? '2px solid rgba(184,115,51,0.7)' : 'none',
                  }} />
              ))}
              <img
                src={bookImage || 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png'}
                alt="Premium book production — Creative Books SA"
                className="w-full rounded object-cover shadow-2xl"
              />
              {/* Scan line overlay */}
              <div className="absolute inset-0 pointer-events-none rounded"
                style={{ background: 'linear-gradient(to bottom, rgba(184,115,51,0.04) 0%, transparent 50%, rgba(184,115,51,0.06) 100%)' }} />
              <div className="absolute bottom-3 left-3 font-mono text-[9px] text-copper/40 tracking-widest">[VISUAL · PROD_QUALITY · PREMIUM]</div>
            </div>

            {/* Floating data chip */}
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -right-4 p-4"
              style={{ background: 'rgba(249,247,242,0.95)', border: '1px solid rgba(184,115,51,0.3)', backdropFilter: 'blur(12px)', boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}>
              <div className="font-heading text-2xl font-bold text-[#0F0F0F]">500+</div>
              <div className="font-mono text-[10px] text-copper tracking-widest">BOOKS_PUBLISHED</div>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="font-mono text-xs text-copper/50 tracking-[0.25em] uppercase block mb-4">WHY_CREATIVE_BOOKS_SA</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#0F0F0F] leading-tight mb-6">
              South Africa's Most<br />
              <span className="text-gradient-copper">Trusted Partner</span>
            </h2>
            <p className="text-[#0F0F0F]/55 font-body leading-relaxed text-base mb-8">
              For over 15 years, we've helped hundreds of South African authors turn manuscripts into beautifully published books — while keeping every right and every rand of royalty.
            </p>
            <div className="space-y-3">
              {['You retain 100% of all rights and royalties', 'Production quality matching global publishers', 'Complete service: editing, design, print, digital', 'All 9 provinces served with courier delivery'].map((p, i) => (
                <motion.div key={p} initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 font-mono text-[10px] text-copper/50 w-5">▸</div>
                  <span className="text-[#0F0F0F]/65 text-sm font-body leading-relaxed">{p}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reasons grid — terminal cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.code}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative p-6 cursor-default group overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,115,51,0.12)', backdropFilter: 'blur(8px)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(184,115,51,0.08)', border: '1px solid rgba(184,115,51,0.15)' }}>
                    <Icon className="w-4 h-4 text-copper" />
                  </div>
                  <span className="font-mono text-[9px] text-copper/30 tracking-widest">[{r.code}]</span>
                </div>
                <h3 className="font-heading text-sm font-bold text-[#0F0F0F] mb-1.5">{r.title}</h3>
                <p className="text-[#0F0F0F]/45 text-xs font-body leading-relaxed">{r.desc}</p>
                <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px transition-all duration-500"
                  style={{ background: 'rgba(184,115,51,0.35)' }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}