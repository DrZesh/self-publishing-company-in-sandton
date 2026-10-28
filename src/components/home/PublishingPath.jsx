import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, FileEdit, Package, MonitorSmartphone, ArrowRight } from 'lucide-react';

const paths = [
  { icon: Printer,          title: 'I Need to Print My Book',                    desc: 'For authors with a completed manuscript or print-ready files who need professional physical copies.',                          label: 'View Book Printing',          to: '/book-printing' },
  { icon: FileEdit,         title: 'I Need Help Preparing My Manuscript',         desc: 'For authors who need editing, proofreading, manuscript evaluation or writing support.',                                        label: 'View Editing Services',       to: '/book-editing' },
  { icon: Package,          title: 'I Need a Complete Publishing Package',         desc: 'For authors who want editing, cover design, layout and printing support combined.',                                            label: 'View Publishing Packages',    to: '/publishingpackages/a5' },
  { icon: MonitorSmartphone,title: 'I Need to Publish Online',                    desc: 'For authors who need ebook formatting, Amazon publishing support or an author website.',                                      label: 'View Ebook and Website Services', to: '/ebook-publishing' },
];

export default function PublishingPath() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#0B1220' }}>
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,149,91,0.25) 0%, transparent 65%)', filter: 'blur(80px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="inline-block text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body mb-4 border border-[#B8955B]/25 px-3 py-1 rounded-sm"
            style={{ background: 'rgba(184,149,91,0.06)' }}>
            Your Publishing Journey
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Choose the Right Publishing Support<br className="hidden md:block" /> for Your Book
          </h2>
          <p className="text-white/50 font-body text-base max-w-xl leading-relaxed">
            Every author's journey is different. Choose the option that best matches where you are in your publishing process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paths.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="relative flex flex-col p-7 group overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.4), transparent)', opacity: 0 }}
                  ref={el => { if (el) el.parentElement.addEventListener('mouseenter', () => el.style.opacity = 1); if (el) el.parentElement.addEventListener('mouseleave', () => el.style.opacity = 0); }}
                />
                <div className="w-12 h-12 rounded-sm flex items-center justify-center mb-6 transition-all group-hover:border-[#B8955B]/40"
                  style={{ background: 'rgba(184,149,91,0.08)', border: '1px solid rgba(184,149,91,0.15)' }}>
                  <Icon className="w-6 h-6 text-[#B8955B]" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-base font-bold text-white mb-3 leading-snug">{p.title}</h3>
                <p className="text-white/45 text-sm font-body leading-relaxed flex-1 mb-6">{p.desc}</p>
                <Link
                  to={p.to}
                  className="inline-flex items-center gap-2 text-[#B8955B] text-sm font-medium group/link hover:text-white transition-colors"
                >
                  {p.label}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px transition-all duration-500"
                  style={{ background: 'rgba(184,149,91,0.3)' }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}