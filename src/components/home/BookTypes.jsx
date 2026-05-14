import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const bookTypes = [
  { name: 'Novels',                  to: '/novelprintingjohannesburg' },
  { name: 'Memoirs',                 to: '/memoirpublishing' },
  { name: 'Autobiographies',         to: null },
  { name: 'Poetry Books',            to: '/poetrypublishing' },
  { name: 'Christian Books',         to: '/christianbookpublishing' },
  { name: "Children's Books",        to: '/childrensbookpublishing' },
  { name: 'Business Books',          to: '/businessbookpublishing' },
  { name: 'Inspirational Books',     to: null },
  { name: 'Educational Books',       to: '/educationalbookprintingjohannesburg' },
  { name: 'Academic Books',          to: null },
  { name: 'Workbooks and Guides',    to: '/workbookprinting' },
  { name: 'Personal Development',    to: null },
  { name: 'Training Manuals',        to: '/trainingmanualprintingjohannesburg' },
  { name: 'Short Story Collections', to: null },
];

export default function BookTypes() {
  return (
    <section className="relative py-24 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d1526 0%, #0a0f1e 100%)' }}>
      {/* Orb glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Genres and Types</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Books We Help Authors Publish
            </h2>
            <p className="text-white/40 font-body text-sm max-w-xs leading-relaxed">
              We support authors across different genres, industries and publishing goals.
            </p>
          </div>
          <div className="mt-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))' }} />
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
                  className="flex items-center justify-between gap-1 px-4 py-3 text-xs font-body font-medium text-white/70 hover:text-white transition-all group"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <span className="leading-snug">{book.name}</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : (
                <div className="px-4 py-3 text-xs font-body text-white/30 leading-snug"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
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