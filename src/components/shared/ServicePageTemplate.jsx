import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import CTASection from './CTASection';
import FAQSection from './FAQSection';
import InternalLinks from './InternalLinks';

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
  children
}) {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-20">
        <div className="absolute inset-0">
          {heroImage && <img src={heroImage} alt={title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/80 to-[#0F0F0F]/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            {subtitle && (
              <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">
                {subtitle}
              </span>
            )}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 font-body">
              {description}
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
      {features.length > 0 && (
        <section className="py-20 lg:py-28 bg-vellum">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-2xl border border-[#0F0F0F]/5 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center mb-5">
                    <CheckCircle className="w-5 h-5 text-copper" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Steps */}
      {processSteps.length > 0 && (
        <section className="py-20 lg:py-28 bg-obsidian">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Our Process</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">How It Works</h2>
            </motion.div>
            <div className="space-y-8">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="shrink-0 w-12 h-12 rounded-full bg-copper/10 border border-copper/20 flex items-center justify-center">
                    <span className="text-copper font-heading font-bold">{String(i + 1).padStart(2, '0')}</span>
                  </div>
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

      {/* FAQ */}
      <FAQSection faqs={faqs} />

      {/* Internal Links */}
      <InternalLinks links={relatedLinks} />

      {/* CTA */}
      <CTASection title={ctaTitle} description={ctaDescription} />
    </div>
  );
}