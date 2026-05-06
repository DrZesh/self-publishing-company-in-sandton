import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeading from './SectionHeading';

export default function FAQSection({ title = "Frequently Asked Questions", faqs = [], light = false }) {
  if (!faqs.length) return null;

  return (
    <section className={`relative py-20 lg:py-28 overflow-hidden ${light ? 'bg-vellum' : 'bg-[#060504]'}`}>
      {/* Ambient glow for dark theme */}
      {!light && (
        <>
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -left-32 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.3) 0%, transparent 60%)', filter: 'blur(40px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.25) 0%, transparent 60%)', filter: 'blur(50px)' }}
          />
        </>
      )}

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeading
          subtitle="FAQ"
          title={title}
          light={!light}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <AccordionItem
                  value={`faq-${i}`}
                  className="rounded-xl px-6"
                  style={light ? {
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                  } : {
                    background: 'rgba(10, 8, 6, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(184, 115, 51, 0.1)',
                  }}
                >
                  <AccordionTrigger className={`text-left font-heading text-base font-medium py-5 hover:no-underline transition-colors ${
                    light ? 'text-[#0F0F0F] hover:text-copper' : 'text-white hover:text-copper'
                  }`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className={`text-sm leading-relaxed pb-5 font-body ${
                    light ? 'text-[#0F0F0F]/60' : 'text-white/60'
                  }`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}