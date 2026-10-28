import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Barcode, ArrowRight } from 'lucide-react';

export default function BarcodeToolCTA() {
  return (
    <section className="relative py-16 overflow-hidden bg-obsidian">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #B87333 0%, transparent 50%)' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10 rounded-2xl"
          style={{
            background: 'rgba(10, 8, 6, 0.6)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(184, 115, 51, 0.15)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 flex items-center justify-center rounded-xl"
              style={{ background: 'rgba(184,115,51,0.12)', border: '1px solid rgba(184,115,51,0.25)' }}>
              <Barcode className="w-7 h-7 text-copper" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-copper text-xs font-body tracking-[0.25em] uppercase mb-2 block">Free Tool</span>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
                ISBN Barcode Generator
              </h2>
              <p className="text-white/55 font-body text-sm leading-relaxed max-w-lg">
                Turn any ISBN-10 or ISBN-13 into a print-ready EAN-13 barcode. Download as PNG, JPG, SVG, EPS or PDF — with bulk mode for whole book lists.
              </p>
            </div>
          </div>
          <Link
            to="/barcode-generator"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-full transition-all group bg-gradient-to-r from-copper to-[#9a6030] hover:shadow-lg hover:shadow-copper/30"
          >
            Generate a Barcode
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}