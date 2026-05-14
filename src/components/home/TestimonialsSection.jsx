import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Nomsa K.',       service: 'Book Printing & Publishing',    stars: 5, review: 'Creative Books SA helped me turn my manuscript into a beautifully printed book. The quality was exceptional and the process was smooth from start to finish.' },
  { name: 'James van der M.',service: 'Self-Publishing Package',      stars: 5, review: 'From editing to cover design to printing, every step was handled professionally. I retained full rights to my book and could not be happier with the result.' },
  { name: 'Priya N.',       service: 'Book Cover Design & Typesetting',stars: 5, review: 'The cover design team truly understood my vision. My book looks professional and competitive on any shelf. Highly recommend their services.' },
  { name: 'Pastor David M.',service: 'Christian Book Printing',       stars: 5, review: 'We printed 200 copies of our church devotional and every single copy was perfect. The turnaround time was impressive and pricing was transparent.' },
  { name: 'Thandi B.',      service: "Children's Book Publishing",    stars: 5, review: "My children's book came out exactly how I imagined it. The colour printing is vibrant and the binding is strong. Our readers absolutely love it." },
  { name: 'André S.',       service: 'Business Book Printing',        stars: 5, review: 'Professional, efficient and excellent quality. We printed 500 copies of our company book and the whole experience was seamless from quote to delivery.' },
];

export default function TestimonialsSection() {
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  };

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#090E18' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #B8955B 1px, transparent 40px)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.35), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body mb-4 border border-[#B8955B]/25 px-3 py-1 rounded-sm"
            style={{ background: 'rgba(184,149,91,0.06)' }}>
            Author Reviews
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Trusted by Authors Who Want Their<br className="hidden md:block" /> Books Done Professionally
          </h2>
          <p className="text-white/45 font-body text-base max-w-xl mx-auto">
            Authors trust Creative Books SA for professional book printing, editing, cover design, layout and publishing support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative flex flex-col p-7 group overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />

              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 fill-[#B8955B] text-[#B8955B]" />
                ))}
              </div>
              <p className="text-white/60 text-sm font-body leading-relaxed italic flex-1 mb-6">"{t.review}"</p>
              <div className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 flex items-center justify-center font-heading text-sm font-bold text-[#B8955B]"
                  style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)' }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-white/35 text-xs font-body">{t.service}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}