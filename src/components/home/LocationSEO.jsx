import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

const locationLinks = [
  { label: 'Book Printing Johannesburg', to: '/bookprintingjohannesburg' },
  { label: 'Self Publishing South Africa', to: '/selfpublishingsouthafrica' },
  { label: 'Book Publishers South Africa', to: '/bookpublisherssouthafrica' },
  { label: 'Publishing Companies South Africa', to: '/publishingcompaniessouthafrica' },
];

export default function LocationSEO() {
  return (
    <section className="py-16 bg-white border-t border-[#E8D8B8]/60" aria-labelledby="location-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#B8955B]" />
              <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase">Serving South Africa</span>
            </div>
            <h2 id="location-heading" className="font-heading text-2xl md:text-3xl font-bold text-[#101826] mb-4">
              Book Publishing and Printing Services Across South Africa
            </h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed">
              Creative Books SA supports authors across Johannesburg, Gauteng and South Africa with professional self-publishing, book printing, editing, cover design and layout services. Whether you are based in Sandton, Pretoria, Midrand, Centurion, Randburg, Roodepoort or another part of South Africa, our team can help you prepare your book professionally.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {locationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center justify-between gap-2 px-5 py-4 bg-[#F8F5EF] rounded-xl border border-[#E8D8B8]/60 text-sm font-body text-[#101826] hover:border-[#B8955B]/60 hover:text-[#B8955B] transition-all group"
              >
                <span className="font-medium leading-snug">{link.label}</span>
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}