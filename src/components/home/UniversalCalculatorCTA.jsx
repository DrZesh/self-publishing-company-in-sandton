import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

export default function UniversalCalculatorCTA() {
  return (
    <section className="relative py-20 lg:py-24 bg-[#060504]">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 75% 40%, rgba(184,115,51,0.12) 0%, transparent 55%)' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
            <Zap className="w-4 h-4 text-copper" />
            <span className="text-copper text-sm font-medium">All-in-One Calculator</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Calculate Your Complete Publishing Costs
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Need more than just printing? Use our universal calculator to estimate costs for printing, editing, design, and typesetting all in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <Link
            to="/calculator"
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className="inline-flex items-center gap-3 px-10 py-4 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
            style={{ boxShadow: '0 16px 40px rgba(184,115,51,0.35)' }}
          >
            <span>Try the Universal Calculator</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}