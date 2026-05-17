import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Maximize2 } from 'lucide-react';
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
    link: '/publishingpackages/mini',
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
    link: '/publishingpackages/6x9',
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
    link: '/publishingpackages/premium',
    ctaText: 'Upgrade to Premium'
  }
];

const features = [
  { title: 'Pocket-Friendly Format', description: 'A5 (5x8 inches) is perfect for poetry, short stories, and specialty publications.' },
  { title: 'Professional Cover Design', description: 'Eye-catching A5 covers optimized for both print and digital platforms.' },
  { title: 'Interior Typesetting', description: 'Perfect formatting for the compact A5 format with optimal readability.' },
  { title: 'Print-Ready Files', description: 'High-quality PDF files ready for offset or digital printing.' },
  { title: 'ISBN & Distribution', description: 'Full ISBN registration and setup for online retail channels.' },
  { title: 'eBook Conversion', description: 'Your A5 book converted for Kindle, Apple Books, and other platforms.' },
];

const faqs = [
  {
    question: 'What is A5 book size?',
    answer: 'A5 is 5.8 x 8.3 inches (148 x 210 mm). It\'s a compact, pocket-friendly format perfect for poetry, short stories, novellas, and specialty publications.'
  },
  {
    question: 'Is A5 suitable for novels?',
    answer: 'While primarily used for shorter works, A5 can work for novels depending on your preferences. We can advise on readability and design considerations.'
  },
  {
    question: 'How much does A5 printing cost?',
    answer: 'A5 printing is typically more affordable than larger formats due to reduced paper usage. We provide transparent quotes based on your print quantity and specifications.'
  },
  {
    question: 'Can I distribute A5 books online?',
    answer: 'Yes! A5 books can be distributed through Amazon KDP, Takealot, and other online retailers. We handle all setup and ISBN registration.'
  }
];

export default function A5BookPublishing() {
  return (
    <>
      <PageMeta
        title="A5 Book Publishing Packages South Africa | Full Service"
        description="A5 publishing packages for SA authors — editing, cover design, typesetting and printing in the most popular novel and non-fiction size. Free quote."
        keywords="A5 book publishing, pocket book format, poetry publishing, short story publishing South Africa"
      />

      <div>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center pt-20">
          <div className="absolute inset-0">
            <img
              src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png"
              alt="A5 Book Publishing"
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
                A5 Format Publishing
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                A5 Book Publishing and Printing
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 font-body">
                Professional publishing for the compact A5 format. Perfect for poetry, short stories, and specialty publications. Affordable, professional, and ready for market.
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
          title="Publish Your A5 Book"
          description="Perfect format for poetry, short stories, and specialty publications. Professional publishing support from South Africa's trusted partner."
        />
      </div>
    </>
  );
}