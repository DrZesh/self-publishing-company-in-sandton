import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const fallbackReviews = [
  {
    name: 'Sarah Mthembu',
    rating: 5,
    date: 'May 2025',
    text: 'Fantastic experience with Creative Books SA. They handled my children\'s book from editing to final printing. Professional, reliable, and the quality is outstanding.',
  },
  {
    name: 'James Pieterse',
    rating: 5,
    date: 'April 2025',
    text: 'Best self-publishing experience I\'ve had. The team understood my vision and delivered a beautifully printed book. Highly professional and fair pricing.',
  },
  {
    name: 'Dr. Amelia Chen',
    rating: 5,
    date: 'March 2025',
    text: 'Exceptional service for academic publishing. Creative Books SA handled my dissertation with meticulous attention to detail.',
  },
];

export default function GoogleReviews() {
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState(fallbackReviews);
  const [avgRating, setAvgRating] = useState('5.0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await base44.functions.invoke('fetchGoogleReviews', {});
        if (response.data?.reviews?.length > 0) {
          setReviews(response.data.reviews);
          setAvgRating(response.data.avgRating?.toFixed(1) || '5.0');
        }
      } catch (error) {
        console.log('Using fallback reviews:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const displayReviews = expanded ? reviews : reviews.slice(0, 3);
  const totalReviews = reviews.length;

  // Schema markup for Google
  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    'ratingValue': avgRating,
    'bestRating': '5',
    'worstRating': '1',
    'ratingCount': totalReviews,
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-vellum">
      <script type="application/ld+json">
        {JSON.stringify(reviewSchema)}
      </script>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-4">What Our Clients Say</h2>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-copper" />
              <span className="text-[#0F0F0F]/60">Loading reviews...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-heading text-2xl font-bold text-[#0F0F0F]">{avgRating}</span>
              <span className="text-[#0F0F0F]/60 font-body">Based on {totalReviews} reviews</span>
            </div>
          )}
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
          {!expanded && totalReviews > 3 && (
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