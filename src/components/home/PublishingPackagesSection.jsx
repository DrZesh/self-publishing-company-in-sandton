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
    to: '/selfpublishingpackagesinsouthafrica',
    featured: false,
    gradient: 'linear-gradient(135deg, #1a2a6c 0%, #1e3a8a 50%, #1e40af 100%)',
    border: 'rgba(59,130,246,0.3)',
    topLine: 'rgba(96,165,250,0.5)',
  },
  {
    tag: 'Most Popular',
    name: 'Full Publishing Packages 6×9',
    desc: 'Ideal for novels, memoirs, business books, non-fiction books and inspirational titles in the popular 6×9 format.',
    points: ['Industry-standard 6×9 format', 'Full production support', 'Novels, memoirs and non-fiction'],
    label: 'View 6×9 Packages',
    to: '/selfpublishingpackagesinsouthafrica',
    featured: true,
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    border: 'rgba(96,165,250,0.5)',
    topLine: 'rgba(147,197,253,0.9)',
  },
  {
    tag: 'Print-Ready',
    name: 'Book Printing Packages',
    desc: 'Professional book printing for authors with print-ready files. A5 format with cream or white paper options.',
    points: ['Professional A5 printing', 'Cream and white paper options', 'Minimum 100 copies'],
    label: 'View Printing Packages',
    to: '/printing/a5',
    featured: false,
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e2d5a 50%, #1e3a8a 100%)',
    border: 'rgba(59,130,246,0.25)',
    topLine: 'rgba(96,165,250,0.4)',
  },
];

export default function PublishingPackagesSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#090E18' }}>
      {/* Ambient blue glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(30,64,175,0.35) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-blue-400 text-xs tracking-[0.3em] uppercase font-body mb-4 border border-blue-500/25 px-3 py-1 rounded-sm"
            style={{ background: 'rgba(59,130,246,0.08)' }}>
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
              style={{
                background: pkg.gradient,
                border: `1px solid ${pkg.border}`,
                boxShadow: pkg.featured
                  ? '0 20px 60px rgba(29,78,216,0.4), 0 0 0 1px rgba(96,165,250,0.2)'
                  : '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${pkg.topLine}, transparent)` }} />

              {/* Subtle inner glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />

              {pkg.featured && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-sm"
                  style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.4)' }}>
                  <Sparkles className="w-3 h-3 text-blue-300" />
                  <span className="text-blue-200 text-[10px] font-medium tracking-widest uppercase">Popular</span>
                </div>
              )}

              <span className="text-blue-300/70 text-[10px] tracking-[0.25em] uppercase font-body mb-4 block">{pkg.tag}</span>
              <h3 className="font-heading text-xl font-bold text-white mb-3 leading-snug pr-16">{pkg.name}</h3>
              <p className="text-white/55 font-body text-sm leading-relaxed mb-6">{pkg.desc}</p>

              <ul className="space-y-2 mb-8 flex-1">
                {pkg.points.map(pt => (
                  <li key={pt} className="flex items-center gap-2.5 text-xs text-white/65 font-body">
                    <span className="w-1 h-1 rounded-full bg-blue-300 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>

              <Link
                to={pkg.to}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all group/btn"
                style={{
                  background: pkg.featured ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
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
          <Link to="/getquote" className="text-blue-400 hover:text-white transition-colors underline underline-offset-4">
            Request a custom quote →
          </Link>
        </motion.p>
      </div>
    </section>
  );
}