import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const bookTypes = [
  { name: 'Novels', to: '/novelprintingjohannesburg' },
  { name: 'Memoirs', to: '/memoirpublishing' },
  { name: 'Autobiographies', to: null },
  { name: 'Poetry Books', to: '/poetrypublishing' },
  { name: 'Christian Books', to: '/christianbookpublishing' },
  { name: "Children's Books", to: '/childrensbookpublishing' },
  { name: 'Business Books', to: '/businessbookpublishing' },
  { name: 'Inspirational Books', to: null },
  { name: 'Educational Books', to: '/educationalbookprintingjohannesburg' },
  { name: 'Academic Books', to: null },
  { name: 'Workbooks and Guides', to: '/workbookprinting' },
  { name: 'Personal Development Books', to: null },
  { name: 'Training Manuals', to: '/trainingmanualprintingjohannesburg' },
  { name: 'Short Story Collections', to: null },
];

export default function BookTypes() {
  return (
    <section className="py-20 lg:py-24 bg-[#F8F5EF]" aria-labelledby="book-types-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">Book Genres & Types</span>
          <h2 id="book-types-heading" className="font-heading text-3xl md:text-4xl font-bold text-[#101826] mb-4">
            Books We Help Authors Publish
          </h2>
          <p className="text-[#2B2B2B]/60 max-w-2xl font-body text-base leading-relaxed">
            We support authors across different genres, industries and publishing goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {bookTypes.map((book, i) => (
            <motion.div
              key={book.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              {book.to ? (
                <Link
                  to={book.to}
                  className="flex items-center justify-between gap-1 px-4 py-3 bg-white rounded-xl border border-[#E8D8B8]/60 text-sm font-body text-[#101826] hover:border-[#B8955B]/60 hover:text-[#B8955B] transition-all group"
                >
                  <span className="text-xs font-medium leading-snug">{book.name}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : (
                <div className="px-4 py-3 bg-white rounded-xl border border-[#E8D8B8]/60 text-xs font-body text-[#2B2B2B]/70 font-medium leading-snug">
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