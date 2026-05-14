import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

const links = [
  { label: 'Book Printing Johannesburg',        to: '/bookprintingjohannesburg' },
  { label: 'Self Publishing South Africa',      to: '/selfpublishingsouthafrica' },
  { label: 'Book Publishers South Africa',      to: '/bookpublisherssouthafrica' },
  { label: 'Publishing Companies South Africa', to: '/publishingcompaniessouthafrica' },
];

export default function LocationSEO() {
  return (
    <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1526 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-[#B8955B]" strokeWidth={1.5} />
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body">Serving South Africa</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">
              Book Publishing and Printing Services<br className="hidden md:block" /> Across South Africa
            </h2>
            <p className="text-white/45 font-body text-sm leading-relaxed max-w-lg">
              Creative Books SA supports authors across Johannesburg, Gauteng and South Africa with professional self-publishing, book printing, editing, cover design and layout services. Whether you are based in Sandton, Pretoria, Midrand, Centurion, Randburg, Roodepoort or another part of South Africa, our team can help you prepare your book professionally.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-body font-medium text-white/70 hover:text-white transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {link.label}
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform text-[#B8955B]" />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}