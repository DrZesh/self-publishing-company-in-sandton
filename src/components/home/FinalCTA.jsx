import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#090E18' }}>
      {/* Glass overlay panel */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(184,149,91,0.12) 0%, transparent 55%), radial-gradient(ellipse at 70% 50%, rgba(11,18,32,0.8) 0%, transparent 60%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.3), transparent)' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Glass card */}
          <div className="relative p-10 md:p-16"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(184,149,91,0.2)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.7), transparent)' }} />

            <span className="inline-block text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body mb-6 border border-[#B8955B]/25 px-3 py-1 rounded-sm"
              style={{ background: 'rgba(184,149,91,0.06)' }}>
              Start Your Publishing Journey
            </span>

            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Publish Your Book<br className="hidden md:block" /> Professionally?
            </h2>
            <p className="text-white/55 text-base md:text-lg mb-10 max-w-2xl mx-auto font-body leading-relaxed">
              Your book deserves a professional finish. Whether you need printing, editing, proofreading, book cover design, typesetting, ghostwriting, ebook support or a complete publishing package, Creative Books SA can help you take the next step with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/getquote"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-medium text-sm group"
                  style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)' }}
                >
                  Request a Publishing Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/book-publishing"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
                >
                  Explore Services
                </Link>
              </motion.div>
            </div>

            <p className="text-white/25 text-xs font-body mt-8">
              Free consultation · No obligation · Response within 24 hours
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}