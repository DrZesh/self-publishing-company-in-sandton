import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

export default function CTASection({
  title = "Ready to Publish Your Book?",
  description = "Get a free consultation and personalized quote for your publishing project. Our team of experts is ready to bring your story to life.",
  primaryLabel = "Get a Free Quote",
  primaryLink = "/getquote",
  showWhatsApp = true
}) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Dark background with animated gradients */}
      <div className="absolute inset-0 bg-[#060504]" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.3) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.25) 0%, transparent 60%)', filter: 'blur(50px)' }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-copper/40"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}
          >
            <Sparkles className="w-4 h-4 text-copper" />
            <span className="text-copper text-sm font-medium">Start Your Publishing Journey</span>
          </motion.div>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto font-body leading-relaxed">
            {description}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to={primaryLink}
                className="group inline-flex items-center gap-2 px-8 py-4 text-white font-medium rounded-full transition-all text-base"
                style={{
                  background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
                  boxShadow: '0 16px 40px rgba(184,115,51,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}>
                {primaryLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            {showWhatsApp && (
              <motion.a
                href="https://wa.me/27000000000"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full transition-all text-base"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}