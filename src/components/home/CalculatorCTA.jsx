import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon, ArrowRight } from 'lucide-react';

export default function CalculatorCTA() {
  return (
    <section className="relative py-14 overflow-hidden" style={{ background: '#F5F5F5', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10"
          style={{
            background: '#0B1220',
            border: '1px solid rgba(184,149,91,0.2)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 flex items-center justify-center"
              style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.25)' }}>
              <CalculatorIcon className="w-7 h-7 text-[#B8955B]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
                Estimate Your Book Printing Needs
              </h2>
              <p className="text-white/50 font-body text-sm leading-relaxed max-w-lg">
                Not sure which book size, paper type or format is right for your book? Use our book printing calculator to explore your options before requesting a quote.
              </p>
            </div>
          </div>
          <Link
            to="/bookprintingcalculator"
            className="shrink-0 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white transition-all group"
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