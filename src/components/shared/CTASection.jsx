import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';

export default function CTASection({
  title = "Ready to Publish Your Book?",
  description = "Get a free consultation and personalized quote for your publishing project. Our team of experts is ready to bring your story to life.",
  primaryLabel = "Get a Free Quote",
  primaryLink = "/getquote",
  showWhatsApp = true
}) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F]" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, #B87333 0%, transparent 50%), radial-gradient(circle at 70% 50%, #B87333 0%, transparent 50%)'
      }} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto font-body leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={primaryLink}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-xl shadow-copper/20 text-base">
              {primaryLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {showWhatsApp && (
              <a href="https://wa.me/27000000000" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all text-base">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}