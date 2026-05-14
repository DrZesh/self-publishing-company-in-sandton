import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: 'Do you help first-time authors?',                     a: 'Yes. Creative Books SA helps first-time authors with editing, book cover design, typesetting, printing and self-publishing support. We guide you through each step of the process.' },
  { q: 'Do I keep ownership of my book?',                     a: 'Yes. Our self-publishing support allows you to remain in control of your book, your rights and your profits. We are a service provider, not a rights holder.' },
  { q: 'Do you charge royalties?',                            a: 'No. Creative Books SA works with once-off service charges for selected services, which means you do not have to deal with ongoing royalty deductions.' },
  { q: 'What is the minimum quantity for book printing?',     a: 'Our minimum quantity for book printing is 100 copies. This makes us ideal for authors preparing for book launches, events, direct sales and local distribution.' },
  { q: 'Can you help with ebooks?',                          a: 'Yes. We assist with ebook cover design, ebook formatting and digital publishing support including Amazon KDP setup.' },
  { q: 'Do you work with authors outside Johannesburg?',     a: 'Yes. We assist authors across South Africa and can support authors outside South Africa depending on the service required.' },
];

export default function HomeFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="relative py-24 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #eef1f7 60%, #f4f6fa 100%)' }}>
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(100,120,220,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-28"
          >
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1220] mb-6 leading-tight">
              Frequently Asked<br />Questions
            </h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-sm">
              Have more questions about publishing, printing or our services? Contact us directly for a personalised answer.
            </p>
            <div className="mt-6 h-px w-24" style={{ background: '#B8955B' }} />
          </motion.div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="font-heading text-sm font-semibold text-[#0B1220] leading-snug">{faq.q}</span>
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center transition-all"
                    style={{
                      background: open === i ? '#0B1220' : 'rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(8px)',
                    }}>
                    {open === i
                      ? <Minus className="w-3.5 h-3.5 text-white" />
                      : <Plus className="w-3.5 h-3.5 text-[#0B1220]" />
                    }
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <div className="px-6 pb-5 pt-0" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <p className="text-sm text-[#2B2B2B]/65 font-body leading-relaxed pt-4">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}