import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefetchRoute } from '@/lib/prefetch';

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'Publishing', children: [
      {
        label: 'Publishing Packages', children: [
          { label: 'Mini Packages', path: '/publishingpackages/mini' },
          { label: 'Full Packages (A5)', path: '/publishingpackages/a5' },
          { label: 'Full Packages (6x9)', path: '/publishingpackages/6x9' },
        ]
      },
      { label: 'Self Publishing Packages', path: '/self-publishing-packages-in-south-africa' },
      { label: "Children's Book Publishing", path: '/printing/childrensbooks' },
      { label: 'Amazon KDP', path: '/ebook-publishing' },
    ]
  },
  {
    label: 'Printing', children: [
      { label: 'A5 Printing', path: '/printing/a5' },
      { label: '6x9 Printing', path: '/printing/6x9' },
      { label: 'Hardcover Printing', path: '/printing/hardcover' },
      { label: "Children's Book Printing", path: '/printing/childrensbooks' },
    ]
  },
  {
    label: 'Editing', children: [
      { label: 'Proofreading', path: '/proofreading' },
      { label: 'Book Editing', path: '/book-editing' },
      { label: 'AI Generated Books', path: '/ai-generated-book-editing' },
      { label: 'Manuscript Evaluation', path: '/book-editing' },
      { label: 'Academic Editing', path: '/academicediting' },
      { label: 'Thesis Editing', path: '/thesisediting' },
      { label: 'Dissertation Editing', path: '/dissertationediting' },
    ]
  },
  {
    label: 'Design & Writing', children: [
      { label: 'Book Cover Design', path: '/book-cover-design' },
      { label: 'Annual Report Design', path: '/annualreportdesignsandton' },
      { label: 'Book Layout & Typesetting', path: '/typesetting' },
      { label: 'eBook Formatting', path: '/ebookformatting' },
      { label: 'Author Websites', path: '/author-websites' },
      { label: 'Ghostwriting', path: '/ghostwriting' },
      { label: 'Memoir Writing', path: '/memoirwriting' },
      { label: 'Biography Writing', path: '/biographywriting' },
      { label: 'Christian Book Writing', path: '/christianbookwriting' },
    ]
  },
  {
    label: 'Resources', children: [
      { label: 'Cover Size Calculator', path: '/resources/CoverSizeCalculator' },
      { label: 'ISBN Barcode Generator', path: '/barcode-generator' },
      { label: 'Documents', path: '/resources/documents' },
      { label: 'ISBN Registration', path: '/isbn' },
      { label: 'Publishing Guide', path: '/publishingguide' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'Blog', path: '/blog' },
      { label: 'FAQ', path: '/faq' },
    ]
  },
  {
    label: 'Get In Touch', children: [
      { label: 'Contact Us', path: '/contact' },
      { label: 'Get a Quote', path: '/getquote' },
    ]
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0806]/90 backdrop-blur-2xl shadow-2xl shadow-black/40 border-b border-copper/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png"
              alt="Creative Books SA"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 + 0.3 }}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.children ? (
                  <button className="flex items-center gap-1 px-3 py-2 text-sm text-white/80 hover:text-copper transition-colors font-body group">
                    {item.label}
                    <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                ) : (
                  <Link to={item.path} onMouseEnter={() => prefetchRoute(item.path)} className="px-3 py-2 text-sm text-white/80 hover:text-copper transition-colors font-body relative group">
                    {item.label}
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-copper scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                )}
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute top-full left-0 mt-2 w-56 rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(10, 8, 6, 0.95)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(184, 115, 51, 0.15)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
                      }}
                    >
                      {item.children.map((child, i) => (
                        <motion.div
                          key={child.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={child.children ? 'relative group' : ''}
                        >
                          {child.children ? (
                            <>
                              <button className="w-full text-left flex items-center justify-between px-4 py-3 text-sm text-white/70 hover:text-copper hover:bg-copper/10 transition-all">
                                {child.label}
                                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                              </button>
                              <motion.div
                                initial={{ opacity: 0, x: 8 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="hidden group-hover:block absolute left-full top-0 ml-1 w-52 rounded-lg overflow-hidden"
                                style={{
                                  background: 'rgba(10, 8, 6, 0.95)',
                                  backdropFilter: 'blur(24px)',
                                  border: '1px solid rgba(184, 115, 51, 0.15)',
                                }}
                              >
                                {child.children.map((grandchild) => (
                                  <Link
                                    key={grandchild.path}
                                    to={grandchild.path}
                                    onMouseEnter={() => prefetchRoute(grandchild.path)}
                                    className="block px-4 py-3 text-sm text-white/70 hover:text-copper hover:bg-copper/10 transition-all"
                                  >
                                    {grandchild.label}
                                  </Link>
                                ))}
                              </motion.div>
                            </>
                          ) : (
                            <Link
                              to={child.path}
                              onMouseEnter={() => prefetchRoute(child.path)}
                              className={`block px-4 py-3 text-sm transition-all hover:bg-copper/10 hover:pl-5 ${
                                child.label === 'Get a Quote'
                                  ? 'text-copper font-medium'
                                  : 'text-white/70 hover:text-copper'
                              }`}
                            >
                              {child.label}
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Link
                to="/book"
                className="px-5 py-2 text-sm font-medium text-copper border border-copper/40 rounded-full hover:bg-copper/10 transition-all"
              >
                Book a Consultation
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/getquote"
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-copper to-[#9a6030] rounded-full hover:shadow-lg hover:shadow-copper/30 transition-all"
              >
                Get Quote
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden text-white p-2"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:hidden overflow-hidden"
            style={{
              background: 'rgba(10, 8, 6, 0.98)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(184, 115, 51, 0.1)',
            }}
          >
            <div className="max-h-[80vh] overflow-y-auto px-4 py-4 space-y-1">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-copper transition-colors"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden pl-4 border-l border-copper/20 ml-3"
                          >
                            {item.children.map((child) => (
                              <div key={child.label}>
                                {child.children ? (
                                  <>
                                    <button
                                      onClick={() => setActiveDropdown(activeDropdown === `${item.label}-${child.label}` ? item.label : `${item.label}-${child.label}`)}
                                      className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-white/60 hover:text-copper transition-colors"
                                    >
                                      {child.label}
                                      <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === `${item.label}-${child.label}` ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                      {activeDropdown === `${item.label}-${child.label}` && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden pl-3 border-l border-copper/10 ml-3"
                                        >
                                          {child.children.map((grandchild) => (
                                            <Link key={grandchild.path} to={grandchild.path}
                                              className="block px-3 py-2 text-sm text-white/50 hover:text-copper transition-colors">
                                              {grandchild.label}
                                            </Link>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </>
                                ) : (
                                  <Link to={child.path}
                                    className="block px-3 py-2.5 text-sm text-white/60 hover:text-copper transition-colors">
                                    {child.label}
                                  </Link>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link to={item.path} className="block px-3 py-3 text-white/80 hover:text-copper transition-colors">
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-4"
              >
                <Link
                  to="/book"
                  className="block w-full text-center px-5 py-3 text-sm font-medium text-copper border border-copper/40 rounded-full mb-2"
                >
                  Book a Consultation
                </Link>
                <Link
                  to="/getquote"
                  className="block w-full text-center px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-copper to-[#9a6030] rounded-full"
                >
                  Get a Free Quote
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}