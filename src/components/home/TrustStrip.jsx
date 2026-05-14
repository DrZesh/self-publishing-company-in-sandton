import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, BookCopy, Layers3, Globe2 } from 'lucide-react';

const cards = [
  { icon: BadgeCheck, title: 'Once-Off Service Charges', desc: 'Clear, transparent pricing without confusing royalty deductions or hidden publishing fees.' },
  { icon: BookCopy,   title: '100 Copy Printing Minimum', desc: 'Ideal for authors preparing for book launches, events, direct sales and distribution.' },
  { icon: Layers3,   title: 'Full Book Production Support', desc: 'Editing, proofreading, cover design, typesetting, printing and ebook support in one place.' },
  { icon: Globe2,    title: 'South African Publishing Partner', desc: 'Based in South Africa, supporting authors locally and internationally.' },
];

export default function TrustStrip() {
  return (
    <section className="relative py-16 overflow-hidden" style={{ background: '#090E18' }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(184,149,91,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(184,149,91,0.6) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative p-6 rounded-sm overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(184,149,91,0.15)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
                <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
                  style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)' }}>
                  <Icon className="w-5 h-5 text-[#B8955B]" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-sm font-semibold text-white mb-2 leading-snug">{card.title}</h3>
                <p className="text-white/45 text-xs font-body leading-relaxed">{card.desc}</p>
                <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px transition-all duration-500"
                  style={{ background: 'rgba(184,149,91,0.4)' }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}