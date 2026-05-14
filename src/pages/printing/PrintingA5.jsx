import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, BookOpen, Layers, Printer, Award } from 'lucide-react';
import Breadcrumbs from '../../components/shared/Breadcrumbs';
import InternalLinks from '../../components/shared/InternalLinks';

// ─── Pricing Data ────────────────────────────────────────────────────────────
const creamPricing = [
  {
    name: 'Silver',
    pages: '100 – 150',
    qty100: 'R5 000',
    qty200: 'R7 000',
    qty300: 'R8 500',
    qty500: 'R12 000',
    popular: false,
  },
  {
    name: 'Bronze',
    pages: '151 – 200',
    qty100: 'R5 800',
    qty200: 'R8 200',
    qty300: 'R9 800',
    qty500: 'R14 000',
    popular: true,
  },
  {
    name: 'Gold',
    pages: '201 – 250',
    qty100: 'R6 500',
    qty200: 'R9 200',
    qty300: 'R11 200',
    qty500: 'R16 000',
    popular: false,
  },
  {
    name: 'Platinum',
    pages: '251 – 300',
    qty100: 'R7 200',
    qty200: 'R10 200',
    qty300: 'R12 500',
    qty500: 'R18 000',
    popular: false,
  },
];

const whitePricing = [
  {
    name: 'Silver',
    pages: '100 – 150',
    qty100: 'R4 500',
    qty200: 'R6 200',
    qty300: 'R7 500',
    qty500: 'R10 500',
    popular: false,
  },
  {
    name: 'Bronze',
    pages: '151 – 200',
    qty100: 'R5 200',
    qty200: 'R7 200',
    qty300: 'R8 800',
    qty500: 'R12 500',
    popular: true,
  },
  {
    name: 'Gold',
    pages: '201 – 250',
    qty100: 'R5 900',
    qty200: 'R8 200',
    qty300: 'R10 000',
    qty500: 'R14 200',
    popular: false,
  },
  {
    name: 'Platinum',
    pages: '251 – 300',
    qty100: 'R6 500',
    qty200: 'R9 000',
    qty300: 'R11 000',
    qty500: 'R16 000',
    popular: false,
  },
];

const features = [
  'Softcover (perfect-bound) finish',
  'Cream or white interior paper options',
  'Black-and-white interior printing',
  'Full-colour cover printing',
  'Professional print-ready production',
  'Minimum order: 100 copies',
  'Delivery across South Africa',
  'Quick turnaround available',
];

const specs = [
  { label: 'Format', value: '148mm × 210mm (A5)' },
  { label: 'Binding', value: 'Perfect Bound (Softcover)' },
  { label: 'Cover', value: 'Full Colour, 300gsm Gloss or Matt Laminate' },
  { label: 'Interior', value: 'Black & White on Cream or White Paper' },
  { label: 'Paper Weight', value: '80gsm (cream or white)' },
  { label: 'Min. Quantity', value: '100 copies' },
];

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ pkg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="relative flex flex-col overflow-hidden"
      style={{
        background: pkg.popular
          ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)'
          : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: pkg.popular
          ? '1.5px solid rgba(184,149,91,0.55)'
          : '1px solid rgba(255,255,255,0.85)',
        boxShadow: pkg.popular
          ? '0 24px 60px rgba(184,149,91,0.18), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)'
          : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        borderRadius: '16px',
      }}
    >
      {/* Specular top edge */}
      <div className="absolute top-0 left-4 right-4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />

      {/* Popular badge */}
      {pkg.popular && (
        <div className="absolute top-5 right-5">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{
              background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)',
              color: '#D4AF72',
              border: '1px solid rgba(212,175,114,0.3)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
              borderRadius: '4px',
            }}>
            <Award className="w-2.5 h-2.5" />
            Popular
          </span>
        </div>
      )}

      <div className="p-7 pb-0">
        {/* Package name */}
        <p className="text-xs font-semibold tracking-[0.25em] uppercase font-body mb-3"
          style={{ color: pkg.popular ? '#B8955B' : '#0B1220' + '60' }}>
          {pkg.name} Package
        </p>

        {/* Page count */}
        <div className="mb-6">
          <span className="font-heading text-2xl font-bold text-[#0B1220]">{pkg.pages}</span>
          <span className="text-[#2B2B2B]/50 font-body text-sm ml-2">pages</span>
        </div>

        {/* Divider */}
        <div className="h-px mb-6" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />

        {/* Quantity pricing */}
        <div className="space-y-3 mb-7">
          {[
            { label: '100 copies', price: pkg.qty100 },
            { label: '200 copies', price: pkg.qty200 },
            { label: '300 copies', price: pkg.qty300 },
            { label: '500 copies', price: pkg.qty500 },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs font-body text-[#2B2B2B]/55">{row.label}</span>
              <span className="font-heading text-sm font-bold text-[#0B1220]">{row.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto p-7 pt-4">
        <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.15)' : 'rgba(0,0,0,0.05)' }} />
        <Link
          to="/getquote"
          className="block text-center py-3 px-5 text-sm font-semibold font-body transition-all"
          style={pkg.popular ? {
            background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(11,18,32,0.25)',
            borderRadius: '8px',
          } : {
            background: 'rgba(11,18,32,0.05)',
            color: '#0B1220',
            border: '1px solid rgba(11,18,32,0.12)',
            borderRadius: '8px',
          }}
        >
          Request This Printing Quote
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PrintingA5() {
  return (
    <div style={{ background: '#f8f9fc' }}>

      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(100,130,220,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 w-full">
          <Breadcrumbs light items={[{ label: 'Printing', path: '/bookprinting' }, { label: 'A5 Printing', path: '/printing/a5' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mt-6">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">
              A5 Book Printing · Johannesburg
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.05]">
              Professional A5<br />Book Printing<br className="hidden md:block" />
              <span style={{ color: '#B8955B' }}> South Africa</span>
            </h1>
            <p className="text-white/55 text-lg leading-relaxed font-body mb-10 max-w-xl">
              The most popular format for novels, memoirs, poetry, business books and non-fiction. Printed professionally on cream or white paper with a full-colour cover.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Free A5 Printing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Pricing
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Specs Strip ── */}
      <section className="relative py-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {specs.map((spec, i) => (
              <motion.div key={spec.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-4"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)',
                  borderRadius: '12px',
                }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B8955B] font-body mb-1">{spec.label}</p>
                <p className="text-xs font-body text-[#0B1220]/80 font-medium leading-snug">{spec.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About A5 ── */}
      <section className="py-20 lg:py-28" style={{ background: '#f8f9fc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">About A5 Printing</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">
                Why Authors Choose<br />the A5 Format
              </h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                The A5 format (148mm × 210mm) is the most widely used book size in South Africa. It suits novels, memoirs, business books, inspirational titles, poetry collections and non-fiction writing of all kinds.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                Our A5 perfect-bound softcover printing delivers a clean, professional result that competes with traditionally published books. Full-colour covers are printed on 300gsm stock with a gloss or matt laminate finish.
              </p>
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,18,32,0.2)' }}>
                Start Your Printing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-3">
              {features.map((f, i) => (
                <motion.div key={f}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)',
                    borderRadius: '10px',
                  }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(184,149,91,0.12)', border: '1px solid rgba(184,149,91,0.25)' }}>
                    <Check className="w-3.5 h-3.5 text-[#B8955B]" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-body text-[#0B1220]/80">{f}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Cream Paper Pricing ── */}
      <section id="pricing" className="relative py-24 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        {/* Ambient */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.4), transparent)' }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: '#B8955B' }} />
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body">Pricing</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              A5 Cream Paper Printing
            </h2>
            <p className="text-white/45 font-body text-sm max-w-lg leading-relaxed">
              Cream paper gives your book a warm, traditional feel — ideal for novels, memoirs and literary works. Prices include softcover perfect binding and a full-colour cover.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creamPricing.map((pkg, i) => (
              <motion.div key={pkg.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="relative flex flex-col overflow-hidden"
                style={{
                  background: pkg.popular
                    ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)'
                    : 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: pkg.popular
                    ? '1.5px solid rgba(184,149,91,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: pkg.popular
                    ? '0 24px 60px rgba(184,149,91,0.2), inset 0 1px 0 rgba(255,255,255,1)'
                    : '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                }}>
                <div className="absolute top-0 left-4 right-4 h-px"
                  style={{ background: pkg.popular ? 'linear-gradient(90deg, transparent, rgba(184,149,91,0.8), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

                {pkg.popular && (
                  <div className="absolute top-5 right-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
                      style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                      <Award className="w-2.5 h-2.5" />
                      Popular
                    </span>
                  </div>
                )}

                <div className="p-7 pb-0">
                  <p className="text-xs font-semibold tracking-[0.25em] uppercase font-body mb-3"
                    style={{ color: pkg.popular ? '#B8955B' : 'rgba(255,255,255,0.4)' }}>
                    {pkg.name} Package
                  </p>
                  <div className="mb-6">
                    <span className="font-heading text-2xl font-bold" style={{ color: pkg.popular ? '#0B1220' : '#fff' }}>{pkg.pages}</span>
                    <span className="font-body text-sm ml-2" style={{ color: pkg.popular ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)' }}>pages</span>
                  </div>
                  <div className="h-px mb-6" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(255,255,255,0.08)' }} />
                  <div className="space-y-3 mb-7">
                    {[
                      { label: '100 copies', price: pkg.qty100 },
                      { label: '200 copies', price: pkg.qty200 },
                      { label: '300 copies', price: pkg.qty300 },
                      { label: '500 copies', price: pkg.qty500 },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-xs font-body" style={{ color: pkg.popular ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.45)' }}>{row.label}</span>
                        <span className="font-heading text-sm font-bold" style={{ color: pkg.popular ? '#0B1220' : '#fff' }}>{row.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto p-7 pt-4">
                  <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.15)' : 'rgba(255,255,255,0.06)' }} />
                  <Link to="/getquote"
                    className="block text-center py-3 px-5 text-sm font-semibold font-body transition-all"
                    style={pkg.popular ? {
                      background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(11,18,32,0.3)',
                      borderRadius: '8px',
                    } : {
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '8px',
                    }}>
                    Request This Printing Quote
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cream paper CTA nudge */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
            <p className="text-white/50 font-body text-sm leading-relaxed max-w-xl">
              Need cream paper book printing? Request a quote and we will help you confirm the best option for your page count and quantity.
            </p>
            <Link to="/getquote"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all group"
              style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 20px rgba(184,149,91,0.3)' }}>
              Request a Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── White Paper Pricing ── */}
      <section className="relative py-24 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 50%, #f4f0ff 100%)' }}>
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(100,120,220,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,149,91,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: '#B8955B' }} />
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body">Pricing</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1220] mb-4 leading-tight">
              A5 White Paper Printing
            </h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-lg leading-relaxed">
              White paper gives your book a crisp, clean interior — ideal for workbooks, manuals, business books and educational titles. Prices include softcover perfect binding and a full-colour cover.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whitePricing.map((pkg, i) => (
              <PricingCard key={pkg.name + '-white'} pkg={pkg} />
            ))}
          </div>

          {/* White paper CTA nudge */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-6"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              borderRadius: '12px',
            }}>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-xl">
              Prefer white paper book printing? Send your details and we will guide you on the best package for your book.
            </p>
            <Link to="/getquote"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all group"
              style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 20px rgba(11,18,32,0.2)' }}>
              Request a Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.2), transparent)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Ready to Print?</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
              Ready to Print Your A5 Book<br className="hidden md:block" /> Professionally?
            </h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">
              Get a free personalised A5 printing quote from our Johannesburg team within 24 hours. We will confirm page count, quantities, paper type and turnaround time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Book Printing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/bookprinting"
                className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                All Printing Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: '6×9 Printing', path: '/printing/6x9' },
        { label: 'Hardcover Printing', path: '/printing/hardcover' },
        { label: "Children's Book Printing", path: '/printing/childrensbooks' },
        { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
        { label: 'Softcover Printing', path: '/softcoverprinting' },
        { label: 'Get a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}