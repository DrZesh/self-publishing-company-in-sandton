import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PricingButtons — reusable dual CTA for every priced service card.
 * - primary: "Get a Custom Quote" → /getquote
 * - secondary: "Order This As-Is" → mailto: pre-filled
 * Pass `quoteOnly={true}` for services without fixed pricing.
 */
export default function PricingButtons({ mailtoUrl, quoteOnly = false }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-5 border-t border-[#0F0F0F]/6">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
        <Link
          to="/getquote"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-sm font-medium text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
            boxShadow: '0 4px 14px rgba(184,115,51,0.25)',
          }}
        >
          Get a Custom Quote <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>

      {!quoteOnly && mailtoUrl && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <a
            href={mailtoUrl}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-sm font-medium transition-all text-[#0F0F0F]/70 hover:text-copper hover:border-copper"
            style={{ border: '1px solid rgba(0,0,0,0.15)' }}
          >
            <Mail className="w-3.5 h-3.5" /> Email Now
          </a>
        </motion.div>
      )}

      {quoteOnly && (
        <p className="text-xs text-[#0F0F0F]/40 font-body self-center sm:max-w-[180px] leading-relaxed">
          Pricing depends on your project — free quote within 24 hrs.
        </p>
      )}
    </div>
  );
}