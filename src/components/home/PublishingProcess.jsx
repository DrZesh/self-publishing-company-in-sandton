import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Send Your Book Details',
    desc: 'Tell us your book size, page count, genre, quantity and services needed.',
  },
  {
    num: '02',
    title: 'Receive a Transparent Quote',
    desc: 'We prepare a quote based on your selected publishing, printing or design services.',
  },
  {
    num: '03',
    title: 'Submit Your Manuscript or Files',
    desc: 'Send your manuscript for editing or layout, or submit print-ready files for printing.',
  },
  {
    num: '04',
    title: 'We Prepare Your Book',
    desc: 'Our team works on editing, proofreading, cover design, typesetting, ebook formatting or printing setup.',
  },
  {
    num: '05',
    title: 'Review and Approve',
    desc: 'You review and approve the relevant files before the next stage begins.',
  },
  {
    num: '06',
    title: 'Print or Publish',
    desc: 'Once approved, your book moves into printing or digital publishing support.',
  },
];

export default function PublishingProcess() {
  return (
    <section className="py-20 lg:py-28 bg-[#101826]" aria-labelledby="process-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">Step by Step</span>
          <h2 id="process-heading" className="font-heading text-3xl md:text-4xl font-bold text-white">
            How Our Publishing Process Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-[#B8955B]/40 transition-colors"
            >
              <div className="font-heading text-4xl font-bold text-[#B8955B]/20 mb-4 leading-none">{step.num}</div>
              <h3 className="font-heading text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-white/55 text-sm font-body leading-relaxed">{step.desc}</p>
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-[#B8955B]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}