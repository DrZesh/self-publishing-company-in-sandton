import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon, ArrowRight } from 'lucide-react';

export default function CalculatorCTA() {
  return (
    <section className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #eef1f7 0%, #f4f6fa 100%)', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.70)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          {/* Specular shine */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.5) 0%, transparent 60%)' }} />

          <div className="relative flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(184,149,91,0.2)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
                backdropFilter: 'blur(12px)',
              }}>
              <CalculatorIcon className="w-7 h-7 text-[#B8955B]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0B1220] mb-2">
                Estimate Your Book Printing Needs
              </h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-lg">
                Not sure which book size, paper type or format is right for your book? Use our book printing calculator to explore your options before requesting a quote.
              </p>
            </div>
          </div>
          <div className="relative shrink-0 inline-flex gap-3">
            <Link
              to="/bookprintingcalculator"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all group"
              style={{ background: '#B8955B', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}
            >
              Book Printing Calculator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all group border-2"
              style={{ borderColor: '#B8955B', background: 'transparent', color: '#B8955B' }}
            >
              All Services Calculator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}