import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Do you help first-time authors?',
    answer: 'Yes. Creative Books SA helps first-time authors with editing, book cover design, typesetting, printing and self-publishing support. We guide you through each step of the process.',
  },
  {
    question: 'Do I keep ownership of my book?',
    answer: 'Yes. Our self-publishing support allows you to remain in control of your book, your rights and your profits. We are a service provider, not a rights holder.',
  },
  {
    question: 'Do you charge royalties?',
    answer: 'No. Creative Books SA works with once-off service charges for selected services, which means you do not have to deal with ongoing royalty deductions.',
  },
  {
    question: 'What is the minimum quantity for book printing?',
    answer: 'Our minimum quantity for book printing is 100 copies. This makes us ideal for authors preparing for book launches, events, direct sales and local distribution.',
  },
  {
    question: 'Can you help with ebooks?',
    answer: 'Yes. We assist with ebook cover design, ebook formatting and digital publishing support including Amazon KDP setup.',
  },
  {
    question: 'Do you work with authors outside Johannesburg?',
    answer: 'Yes. We assist authors across South Africa and can support authors outside South Africa depending on the service required.',
  },
];

export default function HomeFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-20 lg:py-28 bg-white" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">FAQ</span>
          <h2 id="faq-heading" className="font-heading text-3xl md:text-4xl font-bold text-[#101826]">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="rounded-xl border border-[#E8D8B8]/60 bg-[#F8F5EF] overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-heading text-sm font-semibold text-[#101826]">{faq.question}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-[#B8955B]" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="px-6 pb-5 pt-0 border-t border-[#E8D8B8]/50">
                      <p className="text-sm text-[#2B2B2B]/65 font-body leading-relaxed pt-4">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}