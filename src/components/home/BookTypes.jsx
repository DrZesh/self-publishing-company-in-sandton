import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const bookTypes = [
  { name: 'Novels',                  to: '/novelprintingjohannesburg' },
  { name: 'Memoirs',                 to: '/memoirwriting' },
  { name: 'Autobiographies',         to: null },
  { name: 'Poetry Books',            to: '/book-publishing' },
  { name: 'Christian Books',         to: '/book-publishing' },
  { name: "Children's Books",        to: '/childrensbookpackages' },
  { name: 'Business Books',          to: '/book-publishing' },
  { name: 'Inspirational Books',     to: null },
  { name: 'Educational Books',       to: '/educationalbookprintingjohannesburg' },
  { name: 'Academic Books',          to: null },
  { name: 'Workbooks and Guides',    to: '/book-printing' },
  { name: 'Personal Development',    to: null },
  { name: 'Training Manuals',        to: '/trainingmanualprintingjohannesburg' },
  { name: 'Short Story Collections', to: null },
];

export default function BookTypes() {
  return (
    <section className="relative py-24 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #eef1f7 0%, #f8f9fb 50%, #eef1f7 100%)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(100,120,220,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Genres and Types</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1220] leading-tight">
              Books We Help Authors Publish
            </h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xs leading-relaxed">
              We support authors across different genres, industries and publishing goals.
            </p>
          </div>
          <div className="mt-6 h-px" style={{ background: 'linear-gradient(90deg, #B8955B, rgba(184,149,91,0.08))' }} />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {bookTypes.map((book, i) => (
            <motion.div
              key={book.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              {book.to ? (
                <Link
                  to={book.to}
                  className="flex items-center justify-between gap-1 px-4 py-3 text-xs font-body font-medium text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all group"
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.95)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                  }}
                >
                  <span className="leading-snug">{book.name}</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : (
                <div className="px-4 py-3 text-xs font-body text-[#2B2B2B]/45 leading-snug"
                  style={{
                    background: 'rgba(255,255,255,0.45)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.7)',
                  }}>
                  {book.name}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}