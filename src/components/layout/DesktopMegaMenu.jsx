import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchOverlay from './SearchOverlay';
import ServicesMegaPanel from './megamenu/ServicesMegaPanel';
import PrintingMegaPanel from './megamenu/PrintingMegaPanel';
import ResourcesMegaPanel from './megamenu/ResourcesMegaPanel';

const topLevelItems = [
  { label: 'Home', path: '/', hasDropdown: false },
  { label: 'Services', key: 'services', hasDropdown: true },
  { label: 'Printing', key: 'printing', hasDropdown: true },
  { label: 'Resources', key: 'resources', hasDropdown: true },
  { label: 'About', path: '/aboutus', hasDropdown: false },
  { label: 'Blog', path: '/blog', hasDropdown: false },
  { label: 'Contact', path: '/contact', hasDropdown: false },
];

const megaPanels = {
  services: ServicesMegaPanel,
  printing: PrintingMegaPanel,
  resources: ResourcesMegaPanel,
};

export default function DesktopMegaMenu() {
  const [scrolled, setScrolled] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [panelHovered, setPanelHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = (e, itemKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActivePanel(activePanel === itemKey ? null : itemKey);
    } else if (e.key === 'Escape') {
      setActivePanel(null);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      // Move to next menu item
    }
  };

  const headerHeight = scrolled ? 'h-[60px]' : 'h-[80px]';
  const logoSize = scrolled ? 'h-8' : 'h-10';

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E0D5] ${headerHeight} transition-all duration-250 will-change-transform`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <motion.img
              src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png"
              alt="Creative Books SA"
              className={`${logoSize} w-auto transition-all duration-250`}
            />
          </Link>

          {/* Top-level Menu Items */}
          <nav className="flex items-center gap-8 flex-1 justify-center">
            {topLevelItems.map((item) => (
              <div key={item.key || item.path}>
                {item.hasDropdown ? (
                  <button
                    onMouseEnter={() => setActivePanel(item.key)}
                    onMouseLeave={() => !panelHovered && setActivePanel(null)}
                    onKeyDown={(e) => handleKeyDown(e, item.key)}
                    aria-expanded={activePanel === item.key}
                    className="flex items-center gap-1 text-[#2C2C2C] text-base font-medium hover:text-copper transition-colors group relative pb-1"
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        activePanel === item.key ? 'rotate-180' : ''
                      }`}
                    />
                    {activePanel === item.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-copper rounded-t"></span>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className="text-[#2C2C2C] text-base font-medium hover:text-copper transition-colors relative pb-1 group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-copper rounded-t scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setShowSearch(true)}
              aria-label="Search"
              className="text-[#2C2C2C] hover:text-copper transition-colors p-2"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/getquote"
              className="inline-flex items-center gap-2 px-5 py-2 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all text-sm"
            >
              Get a Free Quote
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mega Menu Panel */}
        <AnimatePresence>
          {activePanel && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40 top-[80px]"
                onClick={() => setActivePanel(null)}
                style={{ top: scrolled ? '60px' : '80px' }}
              />

              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setPanelHovered(true)}
                onMouseLeave={() => {
                  setPanelHovered(false);
                  setActivePanel(null);
                }}
                className="absolute left-0 right-0 top-full bg-white border-b border-[#E5E0D5] shadow-lg z-50"
              >
                {megaPanels[activePanel] && React.createElement(megaPanels[activePanel])}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
      </AnimatePresence>

      {/* Spacer to prevent content overlap */}
      <div className={`${headerHeight} transition-all duration-250`} />
    </>
  );
}