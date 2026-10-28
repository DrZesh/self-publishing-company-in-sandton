import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const packages = [
  {
    id: 0,
    code: 'PKG_01',
    name: 'Mini Package',
    price: 'R4,999',
    tagline: 'Entry point for first-time authors',
    features: ['Manuscript proofreading', 'Basic cover design', 'Interior typesetting', 'eBook (ePub) conversion', 'ISBN registration', 'Print-ready PDF files'],
    link: '/minipublishingpackage',
  },
  {
    id: 1,
    code: 'PKG_02',
    name: 'Standard Package',
    price: 'R12,999',
    tagline: 'Most popular — comprehensive solution',
    featured: true,
    features: ['Professional copy editing', 'Premium cover design (3 concepts)', 'Interior layout & typesetting', 'ISBN & barcode', '100 printed softcover copies', 'Amazon KDP setup', 'eBook publishing'],
    link: '/publishingpackages/a5',
  },
  {
    id: 2,
    code: 'PKG_03',
    name: 'Premium Package',
    price: 'R24,999',
    tagline: 'Full-service for ambitious authors',
    features: ['Developmental + copy editing', 'Award-quality cover design', 'Hardcover & softcover printing', '250 copies of each format', 'Amazon KDP + eBook setup', 'Author website', 'Launch marketing consultation', 'National distribution network'],
    link: '/premiumpublishingpackage',
  },
];

export default function PackagesPreview() {
  const [selected, setSelected] = useState(1);

  return (
    <section className="relative py-24 lg:py-32 bg-[#050403] overflow-hidden">
      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(184,115,51,0.5) 3px, rgba(184,115,51,0.5) 4px)' }} />

      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.4), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5" style={{ background: i === 0 ? '#B87333' : i === 1 ? 'rgba(184,115,51,0.5)' : 'rgba(184,115,51,0.2)' }} />
              ))}
            </div>
            <span className="font-mono text-xs text-copper/50 tracking-[0.3em] uppercase">PKG_CATALOGUE · 3 TIERS AVAILABLE</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Choose Your<br /><span className="text-gradient-copper">Publishing Tier</span>
          </h2>
        </motion.div>

        {/* Package selector tabs */}
        <div className="flex gap-0 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid rgba(184,115,51,0.12)' }}>
          {packages.map((pkg) => (
            <button key={pkg.id} onClick={() => setSelected(pkg.id)}
              className="relative px-6 py-3 font-mono text-xs tracking-widest uppercase transition-all whitespace-nowrap focus:outline-none"
              style={selected === pkg.id ? {
                color: '#B87333',
                background: 'rgba(184,115,51,0.06)',
              } : {
                color: 'rgba(255,255,255,0.25)',
                background: 'transparent',
              }}>
              {pkg.code}
              {selected === pkg.id && (
                <motion.div layoutId="pkg-tab" className="absolute bottom-0 left-0 right-0 h-px bg-copper" />
              )}
            </button>
          ))}
        </div>

        {/* Main display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* All packages overview */}
          <div className="space-y-3 lg:col-span-1">
            {packages.map((pkg) => (
              <motion.button key={pkg.id} onClick={() => setSelected(pkg.id)}
                className="w-full text-left p-4 transition-all focus:outline-none relative overflow-hidden"
                style={selected === pkg.id ? {
                  background: 'rgba(184,115,51,0.08)',
                  border: '1px solid rgba(184,115,51,0.4)',
                } : {
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                {pkg.featured && (
                  <div className="absolute top-2 right-2 font-mono text-[8px] text-copper tracking-widest px-1.5 py-0.5"
                    style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
                    POPULAR
                  </div>
                )}
                <div className="font-mono text-[9px] text-copper/40 tracking-widest mb-1">{pkg.code}</div>
                <div className={`font-heading font-bold text-base mb-0.5 ${selected === pkg.id ? 'text-white' : 'text-white/40'}`}>{pkg.name}</div>
                <div className={`font-heading font-bold text-lg ${selected === pkg.id ? 'text-copper' : 'text-copper/30'}`}>From {pkg.price}</div>
                {selected === pkg.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.6), transparent)' }} />
                )}
              </motion.button>
            ))}
          </div>

          {/* Selected package detail */}
          <AnimatePresence mode="wait">
            <motion.div key={selected}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2 relative overflow-hidden"
              style={{ background: 'rgba(184,115,51,0.04)', border: '1px solid rgba(184,115,51,0.25)' }}>

              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.8), transparent)' }} />

              <div className="p-8 lg:p-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="font-mono text-[10px] text-copper/50 tracking-widest mb-1">{packages[selected].code}</div>
                    <h3 className="font-heading text-3xl font-bold text-white">{packages[selected].name}</h3>
                    <p className="text-white/35 text-sm font-body mt-1">{packages[selected].tagline}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-4xl font-bold text-copper">From</div>
                    <div className="font-heading text-4xl font-bold text-white">{packages[selected].price}</div>
                  </div>
                </div>

                {/* Features in 2-col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                  {packages[selected].features.map((f, i) => (
                    <motion.div key={f}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center"
                        style={{ background: 'rgba(184,115,51,0.12)', border: '1px solid rgba(184,115,51,0.2)' }}>
                        <Check className="w-2.5 h-2.5 text-copper" />
                      </div>
                      <span className="text-white/60 text-xs font-body leading-relaxed">{f}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={packages[selected].link}
                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 font-medium text-sm text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)', boxShadow: '0 10px 30px rgba(184,115,51,0.25)' }}>
                    GET STARTED <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/getquote"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-mono text-xs text-copper/70 tracking-widest uppercase transition-all"
                    style={{ border: '1px solid rgba(184,115,51,0.25)', background: 'rgba(184,115,51,0.04)' }}>
                    CUSTOM QUOTE
                  </Link>
                </div>
              </div>

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.4), transparent)' }} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex items-center gap-4 mt-8">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.2), transparent)' }} />
          <span className="font-mono text-[10px] text-white/20 tracking-widest">ISBN_INCLUDED · 100%_RIGHTS_RETAINED · CUSTOM_QUOTES_AVAILABLE</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, rgba(184,115,51,0.2), transparent)' }} />
        </motion.div>
      </div>
    </section>
  );
}