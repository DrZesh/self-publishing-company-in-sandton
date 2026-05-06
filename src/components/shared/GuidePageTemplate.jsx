import React from 'react';
import { motion } from 'framer-motion';
import PageMeta from './PageMeta';
import { howtoSchema, qaSchema } from '@/lib/seo/schemas';

export default function GuidePageTemplate({
   title,
   description,
   keywords,
   heroImage,
   steps = [],
   faqs = [],
   children,
 }) {
   const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
   const howtoData = {
     '@context': 'https://schema.org',
     '@graph': [
       steps.length > 0 ? howtoSchema({
         name: title,
         description,
         steps: steps.map(s => ({ name: s.title, text: s.description })),
         image: heroImage,
         url: currentPath,
       }) : null,
       faqs.length > 0 ? qaSchema({ questions: faqs }) : null,
     ].filter(Boolean),
   };

  return (
    <div>
      <PageMeta
        title={title}
        description={description}
        keywords={keywords}
        schema={howtoData}
      />

      {/* Hero */}
      <div className="relative min-h-[50vh] flex items-center pt-20 bg-gradient-to-r from-[#0F0F0F] to-[#1a1a1a] overflow-hidden">
        {heroImage && (
          <img
            src={heroImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            loading="eager"
            width="1600"
            height="800"
            decoding="async"
          />
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
          >
            {title}
          </motion.h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto font-body">{description}</p>
        </div>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <section className="py-20 lg:py-28 bg-vellum">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-copper text-white flex items-center justify-center font-heading font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-2">{step.title}</h3>
                    <p className="text-[#0F0F0F]/70 text-sm leading-relaxed font-body">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      {children}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-20 lg:py-28 bg-[#060504]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading text-3xl font-bold text-white text-center mb-16">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-xl bg-white/5 border border-copper/10"
                >
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-white/60 text-sm leading-relaxed font-body">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}