import React, { useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const popularSearches = [
  { label: 'Book printing prices', path: '/howmuchdoesbookprintingcost' },
  { label: 'Self-publishing packages', path: '/publishingpackages/a5' },
  { label: "Children's book printing", path: '/printing/childrensbooks' },
  { label: 'Book cover design', path: '/book-cover-design' },
  { label: 'How to get an ISBN', path: '/how-to-get-an-isbn-for-your-book' },
  { label: 'Complete self-publishing guide', path: '/publishingguide' },
];

export default function SearchOverlay({ onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border-b border-[#E5E0D5] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#2C2C2C]">Search</h2>
            <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#2C2C2C] p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <div className="flex items-center gap-3 border-2 border-[#E5E0D5] rounded-lg px-4 py-3 focus-within:border-copper transition-colors">
              <Search className="w-5 h-5 text-copper" />
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 outline-none text-[#2C2C2C] text-lg bg-transparent"
                aria-label="Search Creative Books SA"
              />
            </div>
          </div>

          {/* Popular Searches */}
          <div>
            <p className="text-sm font-semibold text-[#6B6B6B] mb-4 uppercase tracking-wide">Popular Searches</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularSearches.map((search) => (
                <Link
                  key={search.path}
                  to={search.path}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF5EE] text-[#2C2C2C] hover:bg-copper hover:text-white transition-all text-sm font-medium"
                >
                  {search.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}