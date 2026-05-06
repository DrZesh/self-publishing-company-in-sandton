import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/aboutus' },
  {
    label: 'Publishing', children: [
      { label: 'Book Publishing', path: '/bookpublishing' },
      { label: 'Publishing Packages', path: '/publishingpackages' },
      { label: 'Self Publishing', path: '/selfpublishing' },
      { label: 'Christian Book Publishing', path: '/christianbookpublishing' },
      { label: "Children's Book Publishing", path: '/childrensbookpublishing' },
      { label: 'Memoir Publishing', path: '/memoirpublishing' },
      { label: 'Poetry Publishing', path: '/poetrypublishing' },
      { label: 'Business Book Publishing', path: '/businessbookpublishing' },
      { label: 'eBook Publishing', path: '/ebookpublishing' },
      { label: 'Amazon KDP', path: '/amazonkdp' },
    ]
  },
  {
    label: 'Printing', children: [
      { label: 'Book Printing', path: '/bookprinting' },
      { label: 'A5 Book Printing', path: '/a5bookprinting' },
      { label: '6×9 Book Printing', path: '/6x9bookprinting' },
      { label: 'Hardcover Printing', path: '/hardcoverprinting' },
      { label: 'Softcover Printing', path: '/softcoverprinting' },
      { label: "Children's Book Printing", path: '/childrensbookprinting' },
      { label: 'Workbook Printing', path: '/workbookprinting' },
      { label: 'Comic Book Printing', path: '/comicbookprinting' },
      { label: 'Manual Printing', path: '/manualprinting' },
    ]
  },
  {
    label: 'Editing', children: [
      { label: 'Book Editing', path: '/bookediting' },
      { label: 'Proofreading', path: '/proofreading' },
      { label: 'Copy Editing', path: '/copyediting' },
      { label: 'Manuscript Evaluation', path: '/manuscriptevaluation' },
      { label: 'Academic Editing', path: '/academicediting' },
      { label: 'Thesis Editing', path: '/thesisediting' },
      { label: 'Dissertation Editing', path: '/dissertationediting' },
      { label: 'Technical Editing', path: '/technicalediting' },
      { label: 'Language Editing', path: '/languageediting' },
    ]
  },
  {
    label: 'Design & Writing', children: [
      { label: 'Book Cover Design', path: '/bookcoverdesign' },
      { label: 'Book Layout & Typesetting', path: '/typesetting' },
      { label: 'eBook Formatting', path: '/ebookformatting' },
      { label: 'Author Websites', path: '/authorwebsites' },
      { label: 'Ghostwriting', path: '/ghostwriting' },
      { label: 'Memoir Writing', path: '/memoirwriting' },
      { label: 'Biography Writing', path: '/biographywriting' },
      { label: 'Christian Book Writing', path: '/christianbookwriting' },
    ]
  },
  {
    label: 'Resources', children: [
      { label: 'ISBN Registration', path: '/isbnregistration' },
      { label: 'How to Publish a Book', path: '/howtopublishabook' },
      { label: 'Publishing Guide', path: '/publishingguide' },
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-obsidian/95 backdrop-blur-xl shadow-2xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-copper flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">C</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-heading text-lg font-semibold tracking-wide">Creative Books</span>
              <span className="text-copper text-xs block tracking-[0.3em] uppercase">South Africa</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.children ? (
                  <button className="flex items-center gap-1 px-3 py-2 text-sm text-white/80 hover:text-copper transition-colors font-body">
                    {item.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                ) : (
                  <Link to={item.path} className="px-3 py-2 text-sm text-white/80 hover:text-copper transition-colors font-body">
                    {item.label}
                  </Link>
                )}
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-obsidian/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                    >
                      {item.children.map((child) => (
                        child.label === 'Get a Quote' ? (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2.5 text-sm text-copper font-medium hover:bg-white/5 transition-all"
                          >
                            {child.label}
                          </Link>
                        ) : (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2.5 text-sm text-white/70 hover:text-copper hover:bg-white/5 transition-all"
                          >
                            {child.label}
                          </Link>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="https://wa.me/27000000000" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/80 hover:text-copper transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-obsidian/98 backdrop-blur-xl border-t border-white/10 overflow-hidden"
          >
            <div className="max-h-[80vh] overflow-y-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        className="flex items-center justify-between w-full px-3 py-3 text-white/80 hover:text-copper transition-colors"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            {item.children.map((child) => (
                              <Link key={child.path} to={child.path}
                                className="block px-3 py-2.5 text-sm text-white/60 hover:text-copper transition-colors">
                                {child.label}
                              </Link>
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
                </div>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}