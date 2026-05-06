import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function PremiumPricingTable({ packages = [], title, subtitle }) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Luxury gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0F0F0F 0%, #1a140a 50%, #0F0F0F 100%)'
        }} />
        {/* Ambient glow orbs */}
        <motion.div
          animate={{ opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(184,115,51,0.3) 0%, transparent 60%)',
            filter: 'blur(60px)'
          }}
        />
        <motion.div
          animate={{ opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(184,115,51,0.25) 0%, transparent 60%)',
            filter: 'blur(50px)'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          {subtitle && (
            <span className="inline-block text-copper text-xs font-mono tracking-[0.3em] uppercase mb-4">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {title}
            </h2>
          )}
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-body">
            Transparent pricing. Premium publishing services. 100% author rights retained.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id || idx}
              variants={cardVariants}
              className="relative group h-full"
            >
              {/* Card container */}
              <div
                className="relative h-full rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-3"
                style={{
                  background: pkg.featured
                    ? 'linear-gradient(135deg, rgba(184,115,51,0.12) 0%, rgba(184,115,51,0.05) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: pkg.featured
                    ? '1px solid rgba(184,115,51,0.5)'
                    : '1px solid rgba(184,115,51,0.15)',
                  boxShadow: pkg.featured
                    ? '0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(184,115,51,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
                    : '0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
                }}
                onMouseEnter={(e) => {
                  if (pkg.featured) {
                    e.currentTarget.style.boxShadow = '0 32px 80px rgba(0,0,0,0.6), 0 0 50px rgba(184,115,51,0.25), inset 0 1px 0 rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(184,115,51,0.7)';
                  } else {
                    e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(184,115,51,0.1), inset 0 1px 0 rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(184,115,51,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pkg.featured) {
                    e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(184,115,51,0.15), inset 0 1px 0 rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(184,115,51,0.5)';
                  } else {
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(184,115,51,0.15)';
                  }
                }}
              >
                {/* Scan lines overlay */}
                <div
                  className="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
                    backgroundSize: '100% 3px'
                  }}
                />

                {/* Featured badge */}
                {pkg.featured && (
                  <div className="absolute top-0 right-0 left-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.6), transparent)' }} />
                )}

                {pkg.featured && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(184,115,51,0.15)',
                      border: '1px solid rgba(184,115,51,0.4)',
                      backdropFilter: 'blur(12px)'
                    }}
                  >
                    <Star className="w-3.5 h-3.5 text-copper fill-copper" />
                    <span className="text-copper text-xs font-mono tracking-widest uppercase font-medium">Most Popular</span>
                  </motion.div>
                )}

                {/* Content */}
                <div className="relative p-8 lg:p-10 flex flex-col h-full">
                  {/* Icon */}
                  {pkg.icon && (
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                      style={{
                        background: pkg.featured
                          ? 'linear-gradient(135deg, rgba(184,115,51,0.3) 0%, rgba(184,115,51,0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(184,115,51,0.15) 0%, rgba(184,115,51,0.05) 100%)',
                        border: '1px solid rgba(184,115,51,0.25)',
                        boxShadow: '0 4px 16px rgba(184,115,51,0.1)'
                      }}
                    >
                      {typeof pkg.icon === 'function' ? <pkg.icon className="w-6 h-6 text-copper" /> : pkg.icon}
                    </motion.div>
                  )}

                  {/* Package Name */}
                  <h3 className="font-heading text-2xl lg:text-3xl font-bold text-white mb-2">
                    {pkg.name}
                  </h3>

                  {/* Tagline */}
                  {pkg.tagline && (
                    <p className="text-white/50 text-sm font-body mb-6">
                      {pkg.tagline}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-5xl lg:text-6xl font-bold text-copper">
                        {pkg.price}
                      </span>
                      {pkg.subtext && (
                        <span className="text-white/40 text-sm font-body">
                          {pkg.subtext}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-3.5">
                      {pkg.features && pkg.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: 'rgba(184,115,51,0.15)',
                              border: '1px solid rgba(184,115,51,0.3)'
                            }}
                          >
                            <Check className="w-3 h-3 text-copper" />
                          </motion.div>
                          <span className="text-white/70 text-sm font-body leading-relaxed">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  {pkg.link && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={pkg.link}
                        className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-medium transition-all text-base"
                        style={{
                          background: pkg.featured
                            ? 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)'
                            : 'rgba(184,115,51,0.1)',
                          color: pkg.featured ? '#ffffff' : '#B87333',
                          border: pkg.featured
                            ? '1px solid rgba(255,255,255,0.1)'
                            : '1px solid rgba(184,115,51,0.3)',
                          boxShadow: pkg.featured
                            ? '0 12px 30px rgba(184,115,51,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
                            : '0 4px 16px rgba(0,0,0,0.2)'
                        }}
                      >
                        {pkg.ctaText || 'Get Started'}
                      </Link>
                    </motion.div>
                  )}
                </div>

                {/* Bottom glow accent */}
                {pkg.featured && (
                  <div className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.4), transparent)' }} />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.2), transparent)' }} />
          <span className="font-mono text-[10px] text-white/30 tracking-widest text-center">ISBN INCLUDED · 100% RIGHTS RETAINED · FREE CONSULTATION</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, rgba(184,115,51,0.2), transparent)' }} />
        </motion.div>
      </div>
    </section>
  );
}