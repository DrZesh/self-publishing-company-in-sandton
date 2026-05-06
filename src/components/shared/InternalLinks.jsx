import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InternalLinks({ title = "Related Services", links = [], light = false }) {
  if (!links.length) return null;

  return (
    <section className={`py-16 ${light ? 'bg-vellum' : 'bg-[#0F0F0F]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h3 className={`font-heading text-xl font-semibold mb-8 ${light ? 'text-[#0F0F0F]' : 'text-white'}`}>
          {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {links.map((link, i) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={link.path}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                  light
                    ? 'bg-white border-[#0F0F0F]/5 hover:border-copper/30 hover:shadow-sm'
                    : 'bg-white/5 border-white/10 hover:border-copper/30'
                }`}
              >
                <span className={`text-sm font-body ${light ? 'text-[#0F0F0F]/80' : 'text-white/80'}`}>
                  {link.label}
                </span>
                <ArrowRight className="w-3 h-3 text-copper opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}