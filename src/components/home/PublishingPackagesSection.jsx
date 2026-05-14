import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const pkgs = [
  {
    tag: 'A5 Format',
    name: 'Full Publishing Packages A5',
    desc: 'A complete publishing solution for authors who want a professional A5 book package with editing, design and print.',
    points: ['Professional A5 book format', 'Editing and cover design included', 'Print-ready production'],
    label: 'View A5 Packages',
    to: '/publishingpackages/a5',
    featured: false,
  },
  {
    tag: 'Most Popular',
    name: 'Full Publishing Packages 6×9',
    desc: 'Ideal for novels, memoirs, business books, non-fiction books and inspirational titles in the popular 6×9 format.',
    points: ['Industry-standard 6×9 format', 'Full production support', 'Novels, memoirs and non-fiction'],
    label: 'View 6×9 Packages',
    to: '/publishingpackages/6x9',
    featured: true,
  },
  {
    tag: 'Starter',
    name: 'Mini Publishing Packages',
    desc: 'A simpler package option for authors who need selected publishing support without committing to a full package.',
    points: ['Selected publishing services', 'Cost-effective entry point', 'Flexible production options'],
    label: 'View Mini Packages',
    to: '/publishingpackages/mini',
    featured: false,
  },
];

export default function PublishingPackagesSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#090E18' }}>
      {/* Ambient */}
      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 9, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,149,91,0.2) 0%, transparent 65%)', filter: 'blur(80px)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.4), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body mb-4 border border-[#B8955B]/25 px-3 py-1 rounded-sm"
            style={{ background: 'rgba(184,149,91,0.06)' }}>
            Publishing Packages
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Publishing Packages for Every Stage<br className="hidden md:block" /> of Your Book Journey
          </h2>
          <p className="text-white/50 font-body text-base max-w-xl mx-auto">
            Choose a publishing package that matches your book size, budget and production needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pkgs.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
              className="relative flex flex-col p-8 overflow-hidden group"
              style={pkg.featured ? {
                background: 'rgba(184,149,91,0.08)',
                border: '1px solid rgba(184,149,91,0.4)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(184,149,91,0.15)',
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: pkg.featured ? 'linear-gradient(90deg, transparent, rgba(184,149,91,0.9), transparent)' : 'linear-gradient(90deg, transparent, rgba(184,149,91,0.3), transparent)' }} />

              {pkg.featured && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-sm"
                  style={{ background: 'rgba(184,149,91,0.15)', border: '1px solid rgba(184,149,91,0.3)' }}>
                  <Sparkles className="w-3 h-3 text-[#B8955B]" />
                  <span className="text-[#B8955B] text-[10px] font-medium tracking-widest uppercase">Popular</span>
                </div>
              )}

              <span className="text-[#B8955B]/70 text-[10px] tracking-[0.25em] uppercase font-body mb-4 block">{pkg.tag}</span>
              <h3 className="font-heading text-xl font-bold text-white mb-3 leading-snug pr-16">{pkg.name}</h3>
              <p className="text-white/45 font-body text-sm leading-relaxed mb-6">{pkg.desc}</p>

              <ul className="space-y-2 mb-8 flex-1">
                {pkg.points.map(pt => (
                  <li key={pt} className="flex items-center gap-2.5 text-xs text-white/55 font-body">
                    <span className="w-1 h-1 rounded-full bg-[#B8955B] shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>

              <Link
                to={pkg.to}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all group/btn ${
                  pkg.featured
                    ? 'bg-[#B8955B] text-white hover:bg-[#a0803f]'
                    : 'border border-white/15 text-white hover:border-[#B8955B] hover:text-[#B8955B]'
                }`}
              >
                {pkg.label}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-white/30 text-xs font-body"
        >
          Not sure which package suits your book?{' '}
          <Link to="/getquote" className="text-[#B8955B] hover:text-white transition-colors underline underline-offset-4">
            Request a custom quote →
          </Link>
        </motion.p>
      </div>
    </section>
  );
}