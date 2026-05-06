import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Pen } from 'lucide-react';

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Premium book publishing in South Africa" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/75 to-[#0F0F0F]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="h-px w-12 bg-copper" />
            <span className="text-copper text-sm font-body tracking-[0.3em] uppercase">
              Publishing Company · South Africa
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Your Story,{' '}
            <span className="text-gradient-copper italic">Perfected</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-xl font-body"
          >
            South Africa's premier publishing house. We transform manuscripts into masterworks with professional publishing, printing, editing, and design services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/getquote"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-xl shadow-copper/20 text-base">
              Start Your Publishing Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/publishingpackages"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all text-base">
              <BookOpen className="w-4 h-4" /> View Packages
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-white/10 max-w-lg"
          >
            {[
              { value: '500+', label: 'Books Published' },
              { value: '15+', label: 'Years Experience' },
              { value: '98%', label: 'Author Satisfaction' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-2xl md:text-3xl font-bold text-copper">{stat.value}</p>
                <p className="text-white/50 text-xs font-body mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-copper" />
        </div>
      </motion.div>
    </section>
  );
}