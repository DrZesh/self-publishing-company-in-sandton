import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from '../shared/SectionHeading';

const steps = [
  { number: '01', title: 'Consultation', description: 'Share your vision with us. We will discuss your goals, genre, and publishing preferences.' },
  { number: '02', title: 'Editing & Refinement', description: 'Our expert editors polish your manuscript to professional publishing standards.' },
  { number: '03', title: 'Design & Layout', description: 'Beautiful cover design and interior typesetting that brings your book to life.' },
  { number: '04', title: 'Printing & Production', description: 'High-quality printing in our Johannesburg facility with premium materials.' },
  { number: '05', title: 'Distribution & Launch', description: 'ISBN registration, distribution setup, and author support for a successful launch.' },
];

export default function ProcessTimeline() {
  return (
    <section className="py-20 lg:py-28 bg-vellum">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionHeading
          subtitle="Our Process"
          title="From Manuscript to Masterwork"
          description="A seamless five-step journey designed to bring your book from concept to completion."
        />
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-copper/20 hidden md:block" />
          <div className="space-y-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 md:gap-8 items-start"
              >
                <div className="relative shrink-0 w-12 h-12 rounded-full bg-copper flex items-center justify-center shadow-lg shadow-copper/20">
                  <span className="text-white font-heading font-bold text-sm">{step.number}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#0F0F0F]/5 shadow-sm flex-1">
                  <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}