import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

const links = [
  { label: 'Book Printing Johannesburg',        to: '/book-printing-johannesburg' },
  { label: 'Self Publishing South Africa',      to: '/self-publishing-south-africa' },
  { label: 'Book Publishers South Africa',      to: '/book-publishers-south-africa' },
  { label: 'Publishing Companies South Africa', to: '/publishing-companies-south-africa' },
];

export default function LocationSEO() {
  return (
    <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f4f6fa 0%, #eef1f7 100%)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(100,120,220,0.05) 0%, transparent 60%)' }} />

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
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0B1220] mb-5 leading-tight">
              Book Publishing and Printing Services<br className="hidden md:block" /> Across South Africa
            </h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-lg">
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
                className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-body font-medium text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1)',
                }}
              >
                {link.label}
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}