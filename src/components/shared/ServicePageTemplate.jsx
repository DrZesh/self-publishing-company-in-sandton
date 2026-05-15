import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import CTASection from './CTASection';
import FAQSection from './FAQSection';
import InternalLinks from './InternalLinks';
import PageHero from './PageHero';

export default function ServicePageTemplate({
  heroImage,
  subtitle,
  title,
  description,
  features = [],
  processSteps = [],
  faqs = [],
  relatedLinks = [],
  ctaTitle,
  ctaDescription,
  pricingSection,
  children
}) {
  return (
    <div>
      {/* Hero with background image overlay */}
      <div className="relative min-h-[60vh] flex items-center pt-20 bg-obsidian overflow-hidden">
        <div className="absolute inset-0">
          {heroImage && <img src={heroImage} alt="" className="w-full h-full object-cover" width="1600" height="900" loading="eager" decoding="async" />}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/80 to-[#0F0F0F]/60" />
        </div>
        <PageHero
          subtitle={subtitle}
          title={title}
          description={description}
          primaryLabel="Get a Free Quote"
          primaryLink="/getquote"
          secondaryLabel="Contact Us"
          secondaryLink="/contact"
          backgroundColor="bg-transparent"
        />
      </div>

      {/* Features Grid */}
      {features.length > 0 && (
        <section className="py-20 lg:py-28 bg-vellum relative overflow-hidden">
          <h2 className="sr-only">Features of {title}</h2>
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
                  <h3 className="font-heading text-base font-semibold text-[#0F0F0F] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Steps */}
      {processSteps.length > 0 && (
        <section className="relative py-20 lg:py-28 bg-[#060504] overflow-hidden">
          {/* Ambient glow */}
          <motion.div
            animate={{ opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.25) 0%, transparent 60%)', filter: 'blur(50px)' }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Our Process</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">How It Works</h2>
            </motion.div>
            <div className="space-y-6">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ x: 8, transition: { duration: 0.3 } }}
                  className="flex gap-6 items-start p-6 rounded-2xl transition-all"
                  style={{
                    background: 'rgba(10, 8, 6, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(184, 115, 51, 0.08)',
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}
                  >
                    <span className="text-copper font-heading font-bold">{String(i + 1).padStart(2, '0')}</span>
                  </motion.div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed font-body">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom content slot */}
      {children}

      {/* Pricing Section */}
      {pricingSection}

      {/* FAQ */}
      <FAQSection faqs={faqs} />

      {/* Internal Links */}
      <InternalLinks links={relatedLinks} />

      {/* CTA */}
      <CTASection title={ctaTitle} description={ctaDescription} />
    </div>
  );
}