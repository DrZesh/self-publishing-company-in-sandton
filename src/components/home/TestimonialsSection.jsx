import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Nomsa K.',
    service: 'Book Printing & Publishing',
    review: 'Creative Books SA helped me turn my manuscript into a beautifully printed book. The quality was exceptional and the process was smooth from start to finish.',
    stars: 5,
  },
  {
    name: 'James van der M.',
    service: 'Self-Publishing Package',
    review: 'From editing to cover design to printing, every step was handled professionally. I retained full rights to my book and could not be happier with the result.',
    stars: 5,
  },
  {
    name: 'Priya N.',
    service: 'Book Cover Design & Typesetting',
    review: 'The cover design team truly understood my vision. My book looks professional and competitive on any shelf. Highly recommend their services.',
    stars: 5,
  },
  {
    name: 'Pastor David M.',
    service: 'Christian Book Printing',
    review: 'We printed 200 copies of our church devotional and every single copy was perfect. The turnaround time was impressive and pricing was transparent.',
    stars: 5,
  },
  {
    name: 'Thandi B.',
    service: 'Children\'s Book Publishing',
    review: 'My children\'s book came out exactly how I imagined it. The colour printing is vibrant and the binding is strong. Our readers absolutely love it.',
    stars: 5,
  },
  {
    name: 'André S.',
    service: 'Business Book Printing',
    review: 'Professional, efficient and excellent quality. We printed 500 copies of our company book and the whole experience was seamless from quote to delivery.',
    stars: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8F5EF]" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">Author Reviews</span>
          <h2 id="reviews-heading" className="font-heading text-3xl md:text-4xl font-bold text-[#101826] mb-4">
            Trusted by Authors Who Want Their Books Done Professionally
          </h2>
          <p className="text-[#2B2B2B]/60 max-w-2xl mx-auto font-body text-base leading-relaxed">
            Authors trust Creative Books SA for professional book printing, editing, cover design, layout and publishing support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 border border-[#E8D8B8]/50 shadow-sm flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} className="w-4 h-4 fill-[#B8955B] text-[#B8955B]" />
                ))}
              </div>
              <p className="text-[#2B2B2B]/75 text-sm font-body leading-relaxed italic flex-1 mb-5">
                "{t.review}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#E8D8B8]/50">
                <div className="w-9 h-9 rounded-full bg-[#B8955B]/15 flex items-center justify-center">
                  <span className="font-heading text-sm font-bold text-[#B8955B]">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-heading font-semibold text-[#101826]">{t.name}</p>
                  <p className="text-xs text-[#2B2B2B]/45 font-body">{t.service}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}