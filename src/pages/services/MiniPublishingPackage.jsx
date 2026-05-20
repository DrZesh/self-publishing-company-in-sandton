import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CTASection from '../../components/shared/CTASection';
import FAQSection from '../../components/shared/FAQSection';
import PageMeta from '../../components/shared/PageMeta';
import PremiumPricingTable from '../../components/pricing/PremiumPricingTable';
import { BookOpen, Zap, Star } from 'lucide-react';

const publishingPackages = [
  {
    id: 0,
    name: 'Mini Package',
    price: 'R4,999',
    tagline: 'Perfect for first-time authors',
    icon: BookOpen,
    features: [
      'Manuscript proofreading',
      'Basic cover design',
      'Interior typesetting',
      'eBook (ePub) conversion',
      'ISBN registration',
      'Print-ready PDF files'
    ],
    link: '/minipublishingpackage',
    ctaText: 'Get Started'
  },
  {
    id: 1,
    name: 'Standard Package',
    price: 'R12,999',
    tagline: 'Most comprehensive solution',
    icon: Zap,
    featured: true,
    features: [
      'Professional copy editing',
      'Premium cover design (3 concepts)',
      'Interior layout & typesetting',
      'ISBN & barcode',
      '100 printed softcover copies',
      'Amazon KDP setup',
      'eBook publishing'
    ],
    link: '/publishingpackages',
    ctaText: 'Choose This Package'
  },
  {
    id: 2,
    name: 'Premium Package',
    price: 'R24,999',
    tagline: 'Full-service publishing',
    icon: Star,
    features: [
      'Developmental + copy editing',
      'Award-quality cover design',
      'Hardcover & softcover printing',
      '250 copies of each format',
      'Amazon KDP + eBook setup',
      'Author website',
      'Launch marketing consultation',
      'National distribution network'
    ],
    link: '/premiumpublishingpackage',
    ctaText: 'Upgrade to Premium'
  }
];

const features = [
  { title: 'Affordable Entry Point', description: 'Start your publishing journey without breaking the bank. Ideal for debut authors.' },
  { title: 'Professional Proofreading', description: 'Expert editors review your manuscript for grammar, style, and consistency.' },
  { title: 'Basic Cover Design', description: 'Get a professionally designed cover that stands out.' },
  { title: 'Interior Typesetting', description: 'Print-ready formatting for both digital and print distribution.' },
  { title: 'eBook Conversion', description: 'Your book converted to ePub format for all major digital platforms.' },
  { title: 'ISBN Included', description: 'Full ISBN registration with the National Library of South Africa.' },
];

const faqs = [
  {
    question: 'What\'s included in the Mini Package?',
    answer: 'The Mini Package includes manuscript proofreading, basic cover design, interior typesetting, eBook conversion, ISBN registration, and print-ready PDF files. It\'s perfect for authors on a budget.'
  },
  {
    question: 'Can I upgrade to a higher package later?',
    answer: 'Yes! Many authors start with the Mini Package and upgrade to Standard or Premium as their book gains traction. We can work out a transition plan for you.'
  },
  {
    question: 'Does the Mini Package include printing?',
    answer: 'The Mini Package provides print-ready files, but doesn\'t include physical printing. You can order printing separately at competitive rates.'
  },
  {
    question: 'How long does the Mini Package take?',
    answer: 'Typically 4-6 weeks from submission to completion, depending on manuscript length and revision cycles.'
  }
];

export default function MiniPublishingPackage() {
  return (
    <>
      <PageMeta
        title="Affordable Mini Publishing Package"
        description="Affordable mini publishing package for first-time authors who need editing, design or printing without a full bundle."
        description="Flexible mini publishing package — choose only the services you need. Editing, design or printing without a full bundle. Free quote within 24 hours."
        keywords="affordable book publishing, self publishing package, book editing, cover design, ISBN registration South Africa"
      />

      <div>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center pt-20">
          <div className="absolute inset-0">
            <img
              src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png"
              alt="Mini Publishing Package"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/80 to-[#0F0F0F]/60" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">
                Affordable Publishing
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Affordable Mini Publishing Package
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 font-body">
                Your most affordable entry into professional publishing. Perfect for first-time authors looking for quality without the premium price tag.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/getquote"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20">
                  Get a Free Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 lg:py-28 bg-vellum relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="p-8 rounded-2xl transition-all cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(184,115,51,0.12)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center mb-5"
                  >
                    <CheckCircle className="w-5 h-5 text-copper" />
                  </motion.div>
                  <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <PremiumPricingTable
          packages={publishingPackages}
          title="Compare Publishing Packages"
          subtitle="Choose Your Package"
        />

        {/* FAQ */}
        <FAQSection faqs={faqs} />

        {/* CTA */}
        <CTASection
          title="Start Your Publishing Journey"
          description="The Mini Package is perfect for first-time authors. Get professional publishing support at an affordable price."
        />
      </div>
    </>
  );
}