import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';

const googleReviews = [
  {
    name: 'Sarah M.',
    rating: 5,
    date: '2 weeks ago',
    text: 'Professional team, excellent communication, and delivered our book on time. Highly recommend Creative Books SA for all publishing needs!',
  },
  {
    name: 'John K.',
    rating: 5,
    date: '1 month ago',
    text: 'Great experience from start to finish. The team was responsive and the quality of our printed books exceeded expectations.',
  },
  {
    name: 'Lisa T.',
    rating: 5,
    date: '6 weeks ago',
    text: 'Outstanding service. Turned our manuscript into a beautiful published book. Worth every rand!',
  },
  {
    name: 'Ahmed R.',
    rating: 4,
    date: '2 months ago',
    text: 'Very good printing quality and quick turnaround. A few minor adjustments in communication, but overall excellent.',
  },
];

export default function GoogleReviews() {
  const [expanded, setExpanded] = useState(false);

  const displayReviews = expanded ? googleReviews : googleReviews.slice(0, 3);
  const avgRating = (googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length).toFixed(1);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-vellum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-4">What Our Clients Say</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-heading text-2xl font-bold text-[#0F0F0F]">{avgRating}</span>
            <span className="text-[#0F0F0F]/60 font-body">Based on {googleReviews.length} reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {displayReviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-[#0F0F0F]">{review.name}</h3>
                <span className="text-xs text-[#0F0F0F]/40">{review.date}</span>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-[#0F0F0F]/70 font-body leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {expanded && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setExpanded(false)}
              className="px-6 py-2.5 border border-copper text-copper rounded-full font-medium text-sm hover:bg-copper/5 transition-colors"
            >
              Show Less
            </motion.button>
          )}
          {!expanded && googleReviews.length > 3 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setExpanded(true)}
              className="px-6 py-2.5 border border-copper text-copper rounded-full font-medium text-sm hover:bg-copper/5 transition-colors"
            >
              See All Reviews
            </motion.button>
          )}
          <a
            href="https://www.google.com/search?q=Creative+Books+SA+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-copper text-white rounded-full font-medium text-sm hover:bg-copper/90 transition-colors"
          >
            See on Google <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}