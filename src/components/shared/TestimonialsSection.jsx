import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SectionHeading from './SectionHeading';

const defaultTestimonials = [
  {
    name: 'Dr. Nkosi Mbeki',
    role: 'Author, "Roots of Gold"',
    text: 'Creative Books SA transformed my manuscript into a beautifully published book. Their attention to detail and professionalism exceeded my expectations.',
  },
  {
    name: 'Sarah van der Merwe',
    role: 'Children\'s Book Author',
    text: 'From cover design to printing, every step was handled with care. My children\'s book looks absolutely stunning. I couldn\'t be happier.',
  },
  {
    name: 'Pastor James Dlamini',
    role: 'Author, "Faith Unshaken"',
    text: 'They understood my vision for a Christian book and brought it to life. The publishing process was smooth, transparent, and deeply professional.',
  },
];

export default function TestimonialsSection({ testimonials = defaultTestimonials, light = false }) {
  return (
    <section className={`py-20 lg:py-28 ${light ? 'bg-vellum' : 'bg-obsidian'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          subtitle="Testimonials"
          title="What Our Authors Say"
          description="Join hundreds of satisfied authors who trusted Creative Books SA with their publishing journey."
          light={!light}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative p-8 rounded-2xl ${
                light
                  ? 'bg-white border border-[#0F0F0F]/5 shadow-sm'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <Quote className="w-8 h-8 text-copper/30 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array(5).fill(0).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-copper fill-copper" />
                ))}
              </div>
              <p className={`text-sm leading-relaxed mb-6 font-body ${
                light ? 'text-[#0F0F0F]/70' : 'text-white/70'
              }`}>
                "{t.text}"
              </p>
              <div>
                <p className={`font-heading font-semibold text-sm ${light ? 'text-[#0F0F0F]' : 'text-white'}`}>
                  {t.name}
                </p>
                <p className={`text-xs font-body ${light ? 'text-[#0F0F0F]/50' : 'text-white/50'}`}>
                  {t.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}