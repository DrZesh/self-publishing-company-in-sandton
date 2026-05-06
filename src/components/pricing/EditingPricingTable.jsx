import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, PenTool, BookOpen, Sparkles, Crown, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const packages = [
  {
    name: 'Copy Edit',
    price: 'R200',
    priceLabel: 'Per 1000 Words',
    icon: FileText,
    includes: [
      'Spelling',
      'Grammar',
      'Syntax',
      'Tenses',
      'Punctuation',
      'Suggestions-based editing',
      'Two returned manuscript versions',
      'One week review period per 30,000 words'
    ],
    highlights: [
      '50% upfront payment',
      'Word or Google Docs accepted',
      'Suggestions visible version included',
      'Final accepted version included'
    ],
    cta: 'Get Started',
    popular: false,
    badge: null
  },
  {
    name: 'Line Edit',
    price: 'R250',
    priceLabel: 'Per 1000 Words',
    icon: PenTool,
    includes: [
      'Copy Edit',
      'Flow Improvement',
      'Consistent Tone of Voice',
      'Best Word Choice',
      'Repetition Reduction',
      'Wordiness Reduction',
      'Two returned manuscript versions',
      'One week review period'
    ],
    highlights: [
      '50% upfront payment',
      'Suggestions editing',
      'Word or Google Docs accepted'
    ],
    cta: 'Choose Package',
    popular: false,
    badge: null
  },
  {
    name: 'Content Edit',
    price: 'R350',
    priceLabel: 'Per 1000 Words',
    icon: BookOpen,
    includes: [
      'Structure Feedback',
      'Style Feedback',
      'Content Feedback',
      'Manuscript Assessment',
      'Summarized Feedback',
      'Full Book Review',
      'Editing Guidance',
      'Improvement Suggestions'
    ],
    highlights: [
      'Full manuscript assessment',
      'Comments throughout manuscript',
      'Detailed recommendations'
    ],
    cta: 'Start Editing',
    popular: false,
    badge: null
  },
  {
    name: 'Full Package Copy Edit',
    price: 'R450',
    priceLabel: 'Per 1000 Words',
    icon: Sparkles,
    includes: [
      'Full Content Edit',
      'Time To Implement Changes',
      'Full Copy Edit',
      'Manuscript Assessment',
      'Suggestions Editing',
      'Two Edited Versions',
      'One Week Review Period'
    ],
    highlights: [
      'Round 1 content editing',
      'Author revision period',
      'Round 2 copy editing',
      'Premium editing workflow'
    ],
    cta: 'Publish Professionally',
    popular: true,
    badge: 'Most Popular'
  },
  {
    name: 'Full Package Line Edit',
    price: 'R500',
    priceLabel: 'Per 1000 Words',
    icon: Crown,
    includes: [
      'Full Content Edit',
      'Time To Implement Changes',
      'Full Line Edit',
      'Manuscript Assessment',
      'Advanced Editing Workflow',
      'Two Edited Versions',
      'One Week Review Period'
    ],
    highlights: [
      'Round 1 content editing',
      'Revision implementation',
      'Advanced line editing',
      'Premium author support'
    ],
    cta: 'Get Premium Editing',
    popular: false,
    badge: 'Premium'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export default function EditingPricingTable() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-vellum" />
      <motion.div
        animate={{ opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.2) 0%, transparent 60%)', filter: 'blur(50px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Editing Services</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-4">Professional Editing Services</h2>
          <p className="text-[#0F0F0F]/60 text-lg max-w-2xl mx-auto font-body">
            Choose from our professional editing packages designed to help authors publish polished, professional manuscripts.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {packages.map((pkg, idx) => {
            const Icon = pkg.icon;
            const isHovered = hoveredCard === idx;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group h-full"
              >
                {/* Card */}
                <div
                  className="relative h-full p-6 rounded-2xl transition-all duration-300 flex flex-col"
                  style={{
                    background: pkg.popular
                      ? 'linear-gradient(135deg, rgba(184,115,51,0.15) 0%, rgba(184,115,51,0.05) 100%)'
                      : 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(16px)',
                    border: pkg.popular
                      ? '1.5px solid rgba(184,115,51,0.3)'
                      : '1px solid rgba(184,115,51,0.15)',
                    boxShadow: isHovered
                      ? `0 20px 60px rgba(184,115,51,0.15), inset 0 1px 0 rgba(255,255,255,0.8)`
                      : `0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)`
                  }}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="absolute -top-3 left-6 px-4 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #B87333 0%, #D4A574 100%)',
                        boxShadow: '0 8px 24px rgba(184,115,51,0.3)'
                      }}
                    >
                      {pkg.badge}
                    </motion.div>
                  )}

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-xl bg-copper/10 flex items-center justify-center mb-4"
                  >
                    <Icon className="w-6 h-6 text-copper" />
                  </motion.div>

                  {/* Package Name */}
                  <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-2">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-3xl font-bold text-copper">{pkg.price}</span>
                      <span className="text-xs text-[#0F0F0F]/50 font-body">{pkg.priceLabel}</span>
                    </div>
                  </div>

                  {/* Includes */}
                  <div className="space-y-3 mb-6 flex-grow">
                    <p className="text-xs font-semibold text-[#0F0F0F]/70 uppercase tracking-wider">Includes:</p>
                    <ul className="space-y-2">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <Check className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                          <span className="text-sm text-[#0F0F0F]/60 font-body leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Highlights */}
                  <div className="mb-6 pt-6 border-t border-[#0F0F0F]/10">
                    <p className="text-xs font-semibold text-[#0F0F0F]/70 uppercase tracking-wider mb-3">Process:</p>
                    <ul className="space-y-1">
                      {pkg.highlights.map((highlight, i) => (
                        <li key={i} className="text-xs text-[#0F0F0F]/50 font-body">
                          • {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/getquote"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all"
                      style={{
                        background: pkg.popular
                          ? 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)'
                          : 'rgba(184,115,51,0.1)',
                        color: pkg.popular ? 'white' : '#B87333',
                        boxShadow: pkg.popular
                          ? '0 8px 24px rgba(184,115,51,0.3)'
                          : 'none'
                      }}
                    >
                      {pkg.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-[#0F0F0F]/60 mb-4 font-body">
            Need a custom editing package? <span className="text-copper font-semibold">Contact us for a personalised quote.</span>
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-copper font-medium hover:gap-3 transition-all"
          >
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}