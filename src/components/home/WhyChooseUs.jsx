import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Clock, Award, Heart, TrendingUp, Globe2, Star, Zap } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Books Published', icon: Star },
  { value: '15+', label: 'Years Experience', icon: Award },
  { value: '100%', label: 'Rights Retained', icon: Shield },
  { value: '9', label: 'Provinces Served', icon: Globe2 },
];

const reasons = [
  {
    icon: Shield,
    title: 'You Own 100% of Your Rights',
    description: 'Unlike traditional publishers who take a cut of everything, we are purely a service provider. Every word, every idea, every royalty — yours.',
  },
  {
    icon: Clock,
    title: 'Industry-Leading Turnaround',
    description: 'Streamlined workflows mean your book goes from manuscript to printed copies in weeks, not the 18-month delays of traditional publishing.',
  },
  {
    icon: Award,
    title: 'Award-Winning Production Quality',
    description: 'Our books are indistinguishable from the world\'s best publishers. Premium paper, precision binding, and covers that stop browsers in their tracks.',
  },
  {
    icon: Heart,
    title: 'Proudly South African',
    description: 'Based in Johannesburg, we understand the South African market, South African authors, and what South African readers want to read.',
  },
  {
    icon: TrendingUp,
    title: 'From Print to Global Digital',
    description: 'We don\'t just print your book — we put it on Amazon KDP, format it as an eBook, and help you reach readers in 70+ countries worldwide.',
  },
  {
    icon: Zap,
    title: 'One Partner. Everything.',
    description: 'Editing, design, printing, ISBN, Amazon KDP, author website. Stop juggling multiple freelancers — we handle everything under one roof.',
  },
];

export default function WhyChooseUs({ bookImage }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section ref={containerRef} className="py-20 lg:py-28 bg-[#060504] relative overflow-hidden">
      {/* Ambient glows */}
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.25) 0%, transparent 60%)', filter: 'blur(80px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative text-center p-6 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(184,115,51,0.1)' }}
              >
                <Icon className="w-5 h-5 text-copper mx-auto mb-3 opacity-60" />
                <div className="font-heading text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/40 text-sm font-body">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left: Image with parallax */}
          <motion.div style={{ y }} className="relative">
            <div className="absolute -inset-6 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(184,115,51,0.15) 0%, transparent 70%)' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Decorative frame */}
              <div className="absolute -top-3 -left-3 w-24 h-24 rounded-tl-2xl pointer-events-none"
                style={{ border: '2px solid rgba(184,115,51,0.3)', borderRight: 'none', borderBottom: 'none' }} />
              <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-br-2xl pointer-events-none"
                style={{ border: '2px solid rgba(184,115,51,0.3)', borderLeft: 'none', borderTop: 'none' }} />
              <img
                src={bookImage || 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png'}
                alt="Premium book production by Creative Books SA"
                className="rounded-2xl w-full shadow-2xl"
                style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
              />
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-5 -left-5 px-5 py-3 rounded-2xl"
                style={{
                  background: 'rgba(10,8,6,0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(184,115,51,0.3)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div className="text-copper font-heading font-bold text-xl">500+</div>
                <div className="text-white/60 text-xs font-body">Books Published</div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right: Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-copper text-sm font-body tracking-[0.3em] uppercase mb-4 block">Why Creative Books SA</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              South Africa's Most<br />Trusted Publishing Partner
            </h2>
            <p className="text-white/50 font-body leading-relaxed mb-8 text-lg">
              For over 15 years, we've helped hundreds of South African authors turn their manuscripts into beautifully published books — while keeping every right and every rand of royalty.
            </p>
            <div className="space-y-4">
              {['You retain 100% of all rights and royalties', 'Professional publishing quality — indistinguishable from global publishers', 'Complete service: editing, design, print, digital, distribution', 'Serving all 9 provinces with courier delivery nationwide'].map((point, i) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-copper/20 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/70 font-body text-sm leading-relaxed">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="p-6 rounded-2xl group cursor-default"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.15)' }}>
                  <Icon className="w-5 h-5 text-copper" />
                </div>
                <h3 className="font-heading text-base font-semibold text-white mb-2">{reason.title}</h3>
                <p className="text-white/45 text-sm font-body leading-relaxed">{reason.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}