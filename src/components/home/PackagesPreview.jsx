import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

const packages = [
  {
    name: 'Mini Package',
    price: 'From R4,999',
    tagline: 'Perfect for first-time authors',
    features: [
      'Manuscript proofreading',
      'Basic cover design',
      'Interior typesetting',
      'eBook (ePub) conversion',
      'ISBN registration',
      'Print-ready PDF files',
    ],
    link: '/minipublishingpackage',
    accent: 'rgba(184,115,51,0.7)',
  },
  {
    name: 'Standard Package',
    price: 'From R12,999',
    tagline: 'Our most popular choice',
    featured: true,
    features: [
      'Professional copy editing',
      'Premium cover design (3 concepts)',
      'Interior layout & typesetting',
      'ISBN & barcode registration',
      '100 printed softcover copies',
      'Amazon KDP setup',
      'eBook publishing',
    ],
    link: '/publishingpackages',
    accent: '#B87333',
  },
  {
    name: 'Premium Package',
    price: 'From R24,999',
    tagline: 'Full-service for ambitious authors',
    features: [
      'Developmental + copy editing',
      'Award-quality cover design',
      'Hardcover & softcover printing',
      '250 copies of each format',
      'Amazon KDP + eBook setup',
      'Author website',
      'Launch marketing consultation',
      'National distribution network',
    ],
    link: '/premiumpublishingpackage',
    accent: 'rgba(184,115,51,0.7)',
  },
];

export default function PackagesPreview() {
  const [hovered, setHovered] = useState(1);

  return (
    <section className="py-20 lg:py-28 bg-[#060504] relative overflow-hidden">
      {/* Background */}
      <motion.div
        animate={{ opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(184,115,51,0.2) 0%, transparent 60%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-copper text-sm font-body tracking-[0.3em] uppercase mb-4 block">Publishing Packages</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Publishing Journey
          </h2>
          <p className="text-white/45 font-body max-w-xl mx-auto text-lg">
            Flexible packages designed for every type of author and every kind of budget.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(1)}
              className="relative rounded-3xl overflow-hidden cursor-default"
              style={{
                background: pkg.featured
                  ? 'linear-gradient(135deg, rgba(184,115,51,0.12) 0%, rgba(184,115,51,0.04) 100%)'
                  : 'rgba(255,255,255,0.025)',
                border: hovered === i
                  ? `1.5px solid ${pkg.accent}`
                  : pkg.featured
                    ? '1.5px solid rgba(184,115,51,0.3)'
                    : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s ease',
                boxShadow: pkg.featured
                  ? '0 20px 60px rgba(184,115,51,0.12)'
                  : hovered === i
                    ? '0 20px 50px rgba(184,115,51,0.08)'
                    : 'none',
              }}
            >
              {pkg.featured && (
                <div className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, transparent, #B87333, transparent)' }} />
              )}

              <div className="p-8">
                {pkg.featured && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-copper" />
                    <span className="text-copper text-xs font-semibold tracking-wider font-body uppercase">Most Popular</span>
                  </div>
                )}

                <h3 className="font-heading text-2xl font-bold text-white mb-1">{pkg.name}</h3>
                <div className="text-copper font-heading text-3xl font-bold mb-2">{pkg.price}</div>
                <p className="text-white/40 text-sm font-body mb-7">{pkg.tagline}</p>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f, j) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + j * 0.05 }}
                      className="flex items-start gap-3 text-sm font-body"
                    >
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(184,115,51,0.15)', border: '1px solid rgba(184,115,51,0.25)' }}>
                        <Check className="w-2.5 h-2.5 text-copper" />
                      </div>
                      <span className="text-white/65">{f}</span>
                    </motion.li>
                  ))}
                </ul>

                <Link to={pkg.link}
                  className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300"
                  style={pkg.featured ? {
                    background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(184,115,51,0.3)',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Hover glow */}
              <AnimatePresence>
                {hovered === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 100%, ${pkg.accent}20 0%, transparent 70%)` }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-white/25 text-sm font-body"
        >
          All packages include ISBN registration · You retain 100% of your rights · Custom quotes available
        </motion.p>
      </div>
    </section>
  );
}