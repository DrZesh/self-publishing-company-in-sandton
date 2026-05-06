import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function TestimonialsWithSchema({ testimonials = [] }) {
  // Generate review schemas for Google
  const reviewSchemas = testimonials.map(t => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: { '@type': 'Person', name: t.author },
    reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: '5', worstRating: '1' },
    reviewBody: t.quote,
    datePublished: t.date,
  }));

  useEffect(() => {
    if (!testimonials.length) return;
    const id = 'testimonials-schema';
    let existing = document.getElementById(id);
    if (existing) existing.remove();
    const el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    el.text = JSON.stringify({ '@graph': reviewSchemas });
    document.head.appendChild(el);
    return () => {
      const s = document.getElementById('testimonials-schema');
      if (s) s.remove();
    };
  }, [testimonials]);

  if (!testimonials.length) return null;

  return (
    <section className="py-20 lg:py-28 bg-vellum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] text-center mb-16"
        >
          What Our Authors Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-copper/10"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-copper text-copper" />
                ))}
              </div>
              <p className="text-[#0F0F0F]/80 mb-4 text-sm leading-relaxed font-body">{t.quote}</p>
              <p className="font-heading text-sm font-semibold text-[#0F0F0F]">{t.author}</p>
              <p className="text-xs text-copper">{t.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}