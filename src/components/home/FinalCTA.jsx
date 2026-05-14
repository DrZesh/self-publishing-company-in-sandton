import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#101826] overflow-hidden" aria-labelledby="final-cta-heading">
      {/* Ambient glows */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,149,91,0.25) 0%, transparent 65%)', filter: 'blur(70px)' }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,149,91,0.2) 0%, transparent 65%)', filter: 'blur(60px)' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)' }}>
            <BookOpen className="w-4 h-4 text-[#B8955B]" />
            <span className="text-[#B8955B] text-sm font-medium font-body">Ready to Publish?</span>
          </div>

          <h2 id="final-cta-heading" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Publish Your Book Professionally?
          </h2>
          <p className="text-white/60 text-base md:text-lg mb-10 max-w-2xl mx-auto font-body leading-relaxed">
            Your book deserves a professional finish. Whether you need printing, editing, proofreading, book cover design, typesetting, ghostwriting, ebook support or a complete publishing package, Creative Books SA can help you take the next step with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/getquote"
                className="group inline-flex items-center gap-2 px-8 py-4 text-white font-medium rounded-full transition-all text-base"
                style={{
                  background: 'linear-gradient(135deg, #B8955B 0%, #9a7a48 100%)',
                  boxShadow: '0 16px 40px rgba(184,149,91,0.35)',
                }}
              >
                Request a Publishing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/bookpublishing"
                className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full transition-all text-base"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Explore Services
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}