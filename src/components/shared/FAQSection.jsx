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
    <section className={`py-20 lg:py-28 ${light ? 'bg-vellum' : 'bg-obsidian'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
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
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className={`rounded-xl border px-6 ${
                  light
                    ? 'border-[#0F0F0F]/10 bg-white'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <AccordionTrigger className={`text-left font-heading text-base font-medium py-5 hover:no-underline ${
                  light ? 'text-[#0F0F0F]' : 'text-white'
                }`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className={`text-sm leading-relaxed pb-5 font-body ${
                  light ? 'text-[#0F0F0F]/60' : 'text-white/60'
                }`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}