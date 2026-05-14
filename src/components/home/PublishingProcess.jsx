import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { num: '01', title: 'Send Your Book Details',            desc: 'Tell us your book size, page count, genre, quantity and services needed.' },
  { num: '02', title: 'Receive a Transparent Quote',       desc: 'We prepare a quote based on your selected publishing, printing or design services.' },
  { num: '03', title: 'Submit Your Manuscript or Files',   desc: 'Send your manuscript for editing or layout, or submit print-ready files for printing.' },
  { num: '04', title: 'We Prepare Your Book',              desc: 'Our team works on editing, proofreading, cover design, typesetting, ebook formatting or printing setup.' },
  { num: '05', title: 'Review and Approve',                desc: 'You review and approve the relevant files before the next stage begins.' },
  { num: '06', title: 'Print or Publish',                  desc: 'Once approved, your book moves into printing or digital publishing support.' },
];

export default function PublishingProcess() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#0B1220' }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.3), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="inline-block text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body mb-4 border border-[#B8955B]/25 px-3 py-1 rounded-sm"
            style={{ background: 'rgba(184,149,91,0.06)' }}>
            Step by Step
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            How Our Publishing Process Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative p-7 group overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />
              <div className="font-heading text-5xl font-bold mb-5 leading-none select-none"
                style={{ color: 'rgba(184,149,91,0.15)' }}>
                {step.num}
              </div>
              <h3 className="font-heading text-base font-bold text-white mb-3 leading-snug">{step.title}</h3>
              <p className="text-white/45 text-sm font-body leading-relaxed">{step.desc}</p>
              <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px transition-all duration-500"
                style={{ background: 'rgba(184,149,91,0.4)' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}