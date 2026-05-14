import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon, ArrowRight } from 'lucide-react';

export default function CalculatorCTA() {
  return (
    <section className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1526 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 16px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Specular highlight */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
          {/* Inner glass sheen */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />

          <div className="relative flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
              }}>
              <CalculatorIcon className="w-7 h-7 text-[#B8955B]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
                Estimate Your Book Printing Needs
              </h2>
              <p className="text-white/45 font-body text-sm leading-relaxed max-w-lg">
                Not sure which book size, paper type or format is right for your book? Use our book printing calculator to explore your options before requesting a quote.
              </p>
            </div>
          </div>
          <Link
            to="/bookprintingcalculator"
            className="relative shrink-0 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white transition-all group overflow-hidden"
            style={{ background: '#B8955B', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}
          >
            Use the Book Printing Calculator
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}