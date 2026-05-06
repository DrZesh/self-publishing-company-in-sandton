import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function CityServiceAreas({ city, suburbs = [] }) {
  if (!suburbs.length) return null;

  return (
    <section className="py-16 lg:py-24 bg-vellum">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F0F0F] mb-2">
            We Serve {city} and Surrounding Areas
          </h2>
          <p className="text-[#0F0F0F]/60 font-body">
            Our book printing and publishing services extend throughout {city} and nearby suburbs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suburbs.map((suburb, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-[#B87333]/10"
              >
                <MapPin className="w-4 h-4 text-copper flex-shrink-0" />
                <span className="text-[#0F0F0F] font-body text-sm">{suburb}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="mt-8 text-[#0F0F0F]/60 font-body text-sm">
          Don't see your suburb listed? Contact us directly at <a href="tel:+27123456789" className="text-copper font-semibold hover:underline">+27 12 345 6789</a> or <a href="mailto:hello@creativebookssa.co.za" className="text-copper font-semibold hover:underline">hello@creativebookssa.co.za</a> — we serve all of {city} and the {city} region.
        </p>
      </div>
    </section>
  );
}