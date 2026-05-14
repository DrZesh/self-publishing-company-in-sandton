import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, BookOpen, Layers, MapPin } from 'lucide-react';

const cards = [
  {
    icon: DollarSign,
    title: 'Once-Off Service Charges',
    desc: 'Clear, transparent pricing without confusing royalty deductions or hidden publishing fees.',
  },
  {
    icon: BookOpen,
    title: '100 Copy Printing Minimum',
    desc: 'Ideal for authors preparing for book launches, events, direct sales and distribution.',
  },
  {
    icon: Layers,
    title: 'Full Book Production Support',
    desc: 'Editing, proofreading, cover design, typesetting, printing and ebook support in one place.',
  },
  {
    icon: MapPin,
    title: 'South African Publishing Partner',
    desc: 'Based in South Africa, supporting authors locally and internationally.',
  },
];

export default function TrustStrip() {
  return (
    <section className="py-14 bg-white border-b border-[#E8D8B8]/60" aria-label="Key trust indicators">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4 items-start p-5 rounded-xl bg-[#F8F5EF] border border-[#E8D8B8]/50"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-[#B8955B]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#B8955B]" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-[#2B2B2B] mb-1">{card.title}</h3>
                  <p className="text-xs text-[#2B2B2B]/60 font-body leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}