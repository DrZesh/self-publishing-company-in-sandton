import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight } from 'lucide-react';

export default function CalculatorCTA() {
  return (
    <section className="py-16 bg-[#E8D8B8]/30 border-y border-[#E8D8B8]" aria-labelledby="calc-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8D8B8] flex items-center justify-center mb-6 shadow-sm">
            <Calculator className="w-7 h-7 text-[#B8955B]" />
          </div>
          <h2 id="calc-heading" className="font-heading text-2xl md:text-3xl font-bold text-[#101826] mb-4">
            Estimate Your Book Printing Needs
          </h2>
          <p className="text-[#2B2B2B]/65 max-w-xl mx-auto font-body text-base leading-relaxed mb-8">
            Not sure which book size, paper type or format is right for your book? Use our book printing calculator to explore your options before requesting a quote.
          </p>
          <Link
            to="/bookprintingcalculator"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#101826] text-white rounded-full font-medium text-sm hover:bg-[#1F2933] transition-colors group shadow-md"
          >
            Use the Book Printing Calculator
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}