import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, BookOpen, Layers, Printer, Award } from 'lucide-react';
import PricingButtons from '../../components/shared/PricingButtons';
import Breadcrumbs from '../../components/shared/Breadcrumbs';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

// ─── Pricing Data ────────────────────────────────────────────────────────────
const packageFeatures = [
  'A5 Format',
  '100 Copies',
  'Gloss / Matte Cover',
  'Perfect Binding',
  'Black & White Inners',
];

const whitePricing = [
  { name: 'Bronze',   pages: '50 – 100',   price: 'R4 500',  popular: true  },
  { name: 'Silver',   pages: '115 – 150',  price: 'R5 100',  popular: false },
  { name: 'Gold',     pages: '160 – 200',  price: 'R6 500',  popular: false },
  { name: 'Platinum', pages: '215 – 300',  price: 'R7 800',  popular: false },
  { name: 'Diamond',  pages: '315 – 350',  price: 'R8 500',  popular: false },
  { name: 'Elite',    pages: '360 – 400',  price: 'R9 600',  popular: false },
];

const creamPricing = [
  { name: 'Bronze',   pages: '50 – 100',   price: 'R5 500',  popular: true,  mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20A5%20Printing%20Bronze%20%2850-100%20pages%29%20-%20R5%2C500&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20printing%20service%3A%0A%0ASERVICE%3A%20A5%20Printing%20-%20Bronze%20Tier%0APRICE%3A%20R5%2C500%0A%0AINCLUDED%3A%0A-%20A5%20size%0A-%20100%20copies%0A-%2050%20to%20100%20pages%0A-%20Gloss%20or%20matte%20cover%0A-%20Perfect%20binding%0A-%20Black%20and%20white%20inners%0A-%20Cream%20paper%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0APage%20count%3A%20%0AIs%20your%20book%20already%20typeset%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C" },
  { name: 'Silver',   pages: '115 – 150',  price: 'R6 250',  popular: false, mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20A5%20Printing%20Silver%20%28115-150%20pages%29%20-%20R6%2C250&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20printing%20service%3A%0A%0ASERVICE%3A%20A5%20Printing%20-%20Silver%20Tier%0APRICE%3A%20R6%2C250%0A%0AINCLUDED%3A%0A-%20A5%20size%0A-%20100%20copies%0A-%20115%20to%20150%20pages%0A-%20Gloss%20or%20matte%20cover%0A-%20Perfect%20binding%0A-%20Black%20and%20white%20inners%0A-%20Cream%20paper%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0APage%20count%3A%20%0AIs%20your%20book%20already%20typeset%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C" },
  { name: 'Gold',     pages: '160 – 200',  price: 'R7 500',  popular: false, mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20A5%20Printing%20Gold%20%28160-200%20pages%29%20-%20R7%2C500&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20printing%20service%3A%0A%0ASERVICE%3A%20A5%20Printing%20-%20Gold%20Tier%0APRICE%3A%20R7%2C500%0A%0AINCLUDED%3A%0A-%20A5%20size%0A-%20100%20copies%0A-%20160%20to%20200%20pages%0A-%20Gloss%20or%20matte%20cover%0A-%20Perfect%20binding%0A-%20Black%20and%20white%20inners%0A-%20Cream%20paper%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0APage%20count%3A%20%0AIs%20your%20book%20already%20typeset%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C" },
  { name: 'Platinum', pages: '210 – 250',  price: 'R8 750',  popular: false, mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20A5%20Printing%20Platinum%20%28210-250%20pages%29%20-%20R8%2C750&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20printing%20service%3A%0A%0ASERVICE%3A%20A5%20Printing%20-%20Platinum%20Tier%0APRICE%3A%20R8%2C750%0A%0AINCLUDED%3A%0A-%20A5%20size%0A-%20100%20copies%0A-%20210%20to%20250%20pages%0A-%20Gloss%20or%20matte%20cover%0A-%20Perfect%20binding%0A-%20Black%20and%20white%20inners%0A-%20Cream%20paper%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0APage%20count%3A%20%0AIs%20your%20book%20already%20typeset%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C" },
  { name: 'Diamond',  pages: '260 – 300',  price: 'R9 600',  popular: false, mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20A5%20Printing%20Diamond%20%28260-300%20pages%29%20-%20R9%2C600&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20printing%20service%3A%0A%0ASERVICE%3A%20A5%20Printing%20-%20Diamond%20Tier%0APRICE%3A%20R9%2C600%0A%0AINCLUDED%3A%0A-%20A5%20size%0A-%20100%20copies%0A-%20260%20to%20300%20pages%0A-%20Gloss%20or%20matte%20cover%0A-%20Perfect%20binding%0A-%20Black%20and%20white%20inners%0A-%20Cream%20paper%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0APage%20count%3A%20%0AIs%20your%20book%20already%20typeset%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C" },
  { name: 'Elite',    pages: '310 – 350',  price: 'R11 500', popular: false, mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20A5%20Printing%20Elite%20%28310-350%20pages%29%20-%20R11%2C500&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20printing%20service%3A%0A%0ASERVICE%3A%20A5%20Printing%20-%20Elite%20Tier%0APRICE%3A%20R11%2C500%0A%0AINCLUDED%3A%0A-%20A5%20size%0A-%20100%20copies%0A-%20310%20to%20350%20pages%0A-%20Gloss%20or%20matte%20cover%0A-%20Perfect%20binding%0A-%20Black%20and%20white%20inners%0A-%20Cream%20paper%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0APage%20count%3A%20%0AIs%20your%20book%20already%20typeset%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C" },
  { name: 'Glam',     pages: '360 – 400',  price: 'R12 500', popular: false, mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20A5%20Printing%20Glam%20%28360-400%20pages%29%20-%20R12%2C500&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20printing%20service%3A%0A%0ASERVICE%3A%20A5%20Printing%20-%20Glam%20Tier%0APRICE%3A%20R12%2C500%0A%0AINCLUDED%3A%0A-%20A5%20size%0A-%20100%20copies%0A-%20360%20to%20400%20pages%0A-%20Gloss%20or%20matte%20cover%0A-%20Perfect%20binding%0A-%20Black%20and%20white%20inners%0A-%20Cream%20paper%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0APage%20count%3A%20%0AIs%20your%20book%20already%20typeset%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C" },
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
  { label: 'White Paper', value: '80gsm Bond Paper' },
  { label: 'Cream Paper', value: '78gsm Bulk Cream' },
];

// ─── Pricing Card (light bg) ──────────────────────────────────────────────────
function PricingCard({ pkg, paperType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="relative flex flex-col overflow-hidden"
      style={{
        background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.85)',
        boxShadow: pkg.popular
          ? '0 24px 60px rgba(184,149,91,0.18), inset 0 1px 0 rgba(255,255,255,1)'
          : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        borderRadius: '16px',
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />

      {pkg.popular && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
            <Award className="w-2.5 h-2.5" />Popular
          </span>
        </div>
      )}

      <div className="p-6 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-2"
          style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.name}</p>

        {/* Price */}
        <div className="mb-2">
          <span className="font-heading text-4xl font-bold text-[#0B1220]">{pkg.price}</span>
        </div>

        {/* Page count — smaller, below price */}
        <p className="text-xs text-[#2B2B2B]/45 font-body mb-5">{pkg.pages} pages</p>

        <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />

        {/* Features */}
        <ul className="space-y-2.5 mb-6">
          {packageFeatures.map(f => (
            <li key={f} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-body text-[#2B2B2B]/70">{f}</span>
            </li>
          ))}
          <li className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
              <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-body text-[#2B2B2B]/70">{paperType}</span>
          </li>
        </ul>
      </div>

      <div className="px-6 pb-6">
        <PricingButtons mailtoUrl={pkg.mailto} />
      </div>
    </motion.div>
  );
}

// ─── Dark Pricing Card (for cream section on dark bg) ─────────────────────────
function DarkPricingCard({ pkg, paperType, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="relative flex flex-col overflow-hidden"
      style={{
        background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: pkg.popular ? '1.5px solid rgba(184,149,91,0.6)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: pkg.popular
          ? '0 24px 60px rgba(184,149,91,0.22), inset 0 1px 0 rgba(255,255,255,1)'
          : '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        borderRadius: '16px',
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-px"
        style={{ background: pkg.popular ? 'linear-gradient(90deg, transparent, rgba(184,149,91,0.8), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

      {pkg.popular && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
            <Award className="w-2.5 h-2.5" />Popular
          </span>
        </div>
      )}

      <div className="p-6 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-2"
          style={{ color: pkg.popular ? '#B8955B' : 'rgba(255,255,255,0.4)' }}>{pkg.name}</p>

        <div className="mb-2">
          <span className="font-heading text-4xl font-bold" style={{ color: pkg.popular ? '#0B1220' : '#fff' }}>{pkg.price}</span>
        </div>
        <p className="text-xs font-body mb-5" style={{ color: pkg.popular ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.35)' }}>{pkg.pages} pages</p>

        <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(255,255,255,0.08)' }} />

        <ul className="space-y-2.5 mb-6">
          {packageFeatures.map(f => (
            <li key={f} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(255,255,255,0.08)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(255,255,255,0.15)'}` }}>
                <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : 'rgba(255,255,255,0.7)' }} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-body" style={{ color: pkg.popular ? 'rgba(11,18,32,0.65)' : 'rgba(255,255,255,0.55)' }}>{f}</span>
            </li>
          ))}
          <li className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(255,255,255,0.08)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(255,255,255,0.15)'}` }}>
              <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : 'rgba(255,255,255,0.7)' }} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-body" style={{ color: pkg.popular ? 'rgba(11,18,32,0.65)' : 'rgba(255,255,255,0.55)' }}>{paperType}</span>
          </li>
        </ul>
      </div>

      <div className="px-6 pb-6">
        <PricingButtons mailtoUrl={pkg.mailto} />
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PrintingA5() {
  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="A5 Book Printing South Africa | Cream & White Paper"
        description="Affordable A5 book printing in SA — cream or white paper, perfect binding, from 100 copies. Free printed proof and competitive pricing. Order now."
        canonical="https://www.creativebookssa.co.za/printing/a5"
      />

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

      {/* ── White Paper: Why Section ── */}
      <section id="pricing" className="relative py-20 lg:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(100,120,220,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: '#B8955B' }} />
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body">White Paper</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">
              Why Print with White Paper?
            </h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-2xl leading-relaxed">
              White paper maintains consistency across different editions or reprints of the same book, ensuring that readers receive a uniform reading experience regardless of when or where they obtain the book.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { title: 'Tradition', body: 'White paper has been the standard for book printing for centuries, and this tradition has been maintained due to its effectiveness.' },
              { title: 'Accessibility', body: "White paper is generally more accessible to a wider audience, as it doesn't interfere with readability for individuals with visual impairments or colour blindness." },
              { title: 'Versatility', body: 'White paper provides a neutral background that complements various genres and styles, making it suitable for a wide range of content.' },
              { title: 'Consistency', body: 'White paper ensures a uniform reading experience across different print runs, editions and distribution channels.' },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-6"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                  borderRadius: '14px',
                }}>
                <div className="w-8 h-0.5 mb-4" style={{ background: '#B8955B' }} />
                <h3 className="font-heading text-base font-bold text-[#0B1220] mb-2">{item.title}</h3>
                <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>

          {/* White Paper Pricing Header */}
          <div className="mb-8">
            <p className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body mb-3">Printing Packages</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0B1220] mb-1">Save time. Save money.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whitePricing.map((pkg, i) => (
              <motion.div key={pkg.name + '-white'} transition={{ delay: i * 0.07 }}>
                <PricingCard pkg={pkg} paperType="White Paper" />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '12px' }}>
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

      {/* ── White Paper Pricing (Dark Section) ── */}
      <section className="relative py-24 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.4), transparent)' }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: '#B8955B' }} />
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body">White Paper</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              A5 White Paper Printing
            </h2>
            <p className="text-white/45 font-body text-sm max-w-lg leading-relaxed">
              White paper provides a clean, bright reading experience — ideal for business books, academic works and professional publications. Prices include softcover perfect binding and a full-colour cover.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creamPricing.map((pkg, i) => (
              <DarkPricingCard key={pkg.name + '-white'} pkg={pkg} paperType="White Paper" i={i} />
            ))}
          </div>
          <p className="text-white/25 text-xs font-body mt-4 text-center">Need adjustments or have questions? Click 'Get a Custom Quote'. Ready to email us directly? Click 'Email Now' to send a pre-filled email.</p>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
            <p className="text-white/50 font-body text-sm leading-relaxed max-w-xl">
              Need white paper book printing? Request a quote and we will help you confirm the best option for your page count and quantity.
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