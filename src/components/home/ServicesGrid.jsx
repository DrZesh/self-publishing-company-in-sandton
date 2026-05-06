import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Printer, PenLine, Palette, Globe, Users,
  Feather, GraduationCap, BookMarked, FileText, Camera, Mic
} from 'lucide-react';

const services = [
  {
    icon: BookOpen,
    title: 'Book Publishing',
    category: 'Publishing',
    color: '#B87333',
    description: 'Complete publishing solutions from manuscript to marketplace. Self-publishing and full-service packages that put you in control.',
    tags: ['Self-Publishing', 'Traditional', 'Packages', 'ISBN'],
    stat: '500+ Books Published',
  },
  {
    icon: Printer,
    title: 'Book Printing',
    category: 'Printing',
    color: '#8B6914',
    description: 'High-quality offset and digital printing in Johannesburg. Hardcover, softcover, and specialty formats from 50 to 50,000 copies.',
    tags: ['Hardcover', 'Softcover', 'Colour', 'B&W'],
    stat: '50–50,000 Copies',
  },
  {
    icon: PenLine,
    title: 'Editing Services',
    category: 'Editing',
    color: '#B87333',
    description: 'Professional proofreading, copy editing, manuscript evaluation, and academic editing by South Africa\'s finest editors.',
    tags: ['Proofreading', 'Copy Editing', 'Academic', 'Developmental'],
    stat: '1,200+ Manuscripts Edited',
  },
  {
    icon: Palette,
    title: 'Cover Design',
    category: 'Design',
    color: '#9a6030',
    description: 'Stunning book cover design, typesetting, interior layout, and formatting. Books that captivate from the very first glance.',
    tags: ['Cover Design', 'Typesetting', 'Layout', 'Branding'],
    stat: 'Award-Winning Design',
  },
  {
    icon: Globe,
    title: 'eBook Publishing',
    category: 'Digital',
    color: '#B87333',
    description: 'Publish on Amazon KDP, Kindle, and global platforms. Full digital formatting and international distribution setup.',
    tags: ['Amazon KDP', 'Kindle', 'ePub', 'Global'],
    stat: '70+ Countries Reached',
  },
  {
    icon: Users,
    title: 'Ghostwriting',
    category: 'Writing',
    color: '#8B6914',
    description: 'Professional ghostwriters for memoirs, biographies, business books, and Christian literature — your story, our words.',
    tags: ['Memoir', 'Biography', 'Business', 'Christian'],
    stat: 'Full Confidentiality',
  },
  {
    icon: Feather,
    title: 'Memoir Writing',
    category: 'Writing',
    color: '#9a6030',
    description: 'Transform your life story into a beautifully crafted memoir. Our specialist memoir writers capture your voice authentically.',
    tags: ['Life Story', 'Personal', 'Family', 'Legacy'],
    stat: 'Your Voice, Preserved',
  },
  {
    icon: GraduationCap,
    title: 'Academic Editing',
    category: 'Editing',
    color: '#B87333',
    description: 'Thesis and dissertation editing, journal article preparation, and academic manuscript evaluation for South African researchers.',
    tags: ['Thesis', 'Dissertation', 'Research', 'Academic'],
    stat: 'PhD-Level Editors',
  },
  {
    icon: BookMarked,
    title: "Children's Books",
    category: 'Publishing',
    color: '#8B6914',
    description: "Specialised children's book publishing with illustration coordination, age-appropriate design, and full-colour printing.",
    tags: ['Illustration', 'Full Colour', 'Picture Books', 'Young Adult'],
    stat: 'Ages 0–16 Covered',
  },
  {
    icon: FileText,
    title: 'Training Manuals',
    category: 'Printing',
    color: '#9a6030',
    description: 'Corporate training manuals, workbooks, and educational materials printed and bound to professional standards.',
    tags: ['Corporate', 'Workbooks', 'Spiral Bound', 'Bulk'],
    stat: 'Corporate Specialists',
  },
  {
    icon: Camera,
    title: 'Annual Reports',
    category: 'Design',
    color: '#B87333',
    description: 'Premium annual report design and printing for Johannesburg corporates. Glassmorphic, modern, and boardroom-ready.',
    tags: ['Design', 'Print', 'Corporate', 'Premium'],
    stat: 'JSE-Listed Clients',
  },
  {
    icon: Mic,
    title: 'Author Branding',
    category: 'Design',
    color: '#8B6914',
    description: 'Author websites, press kits, social media assets, and full personal brand identity for the modern South African author.',
    tags: ['Website', 'Social', 'Press Kit', 'Identity'],
    stat: 'Full Brand Suite',
  },
];

const categories = ['All', 'Publishing', 'Printing', 'Editing', 'Design', 'Digital', 'Writing'];

export default function ServicesGrid() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const filtered = activeCategory === 'All' ? services : services.filter(s => s.category === activeCategory);

  return (
    <section className="py-20 lg:py-28 bg-[#060504] relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.04, 0.1, 0.04], x: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{ opacity: [0.03, 0.08, 0.03], x: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-copper text-sm font-body tracking-[0.3em] uppercase mb-4 block">Complete Publishing Ecosystem</span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            Every Service You Need<br />
            <span className="text-gradient-copper">Under One Roof</span>
          </h2>
          <p className="text-white/50 text-lg font-body max-w-2xl mx-auto">
            From first draft to final distribution — South Africa's most comprehensive publishing services.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-5 py-2 rounded-full text-sm font-medium font-body transition-all duration-300"
              style={activeCategory === cat ? {
                background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(184,115,51,0.35)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((service, i) => {
              const Icon = service.icon;
              const isHovered = hoveredIndex === i;
              return (
                <motion.div
                  key={service.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative group cursor-default rounded-2xl overflow-hidden"
                  style={{
                    background: isHovered
                      ? 'rgba(184,115,51,0.08)'
                      : 'rgba(255,255,255,0.025)',
                    border: isHovered
                      ? '1px solid rgba(184,115,51,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Glow on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(184,115,51,0.12) 0%, transparent 70%)' }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="p-6">
                    {/* Icon + Category */}
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(184,115,51,0.12)', border: '1px solid rgba(184,115,51,0.2)' }}
                      >
                        <Icon className="w-5 h-5 text-copper" />
                      </motion.div>
                      <span className="text-xs font-body px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(184,115,51,0.08)', color: 'rgba(184,115,51,0.8)', border: '1px solid rgba(184,115,51,0.15)' }}>
                        {service.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-lg font-semibold text-white mb-2 leading-tight">{service.title}</h3>

                    {/* Description */}
                    <p className="text-white/50 text-sm font-body leading-relaxed mb-4">{service.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {service.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md font-body"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stat line */}
                    <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <span className="text-copper text-xs font-medium font-body tracking-wide">{service.stat}</span>
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <motion.div
                    animate={{ scaleX: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
                    style={{ background: 'linear-gradient(90deg, #B87333, transparent)' }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-white/20 text-sm font-body">
            {filtered.length} service{filtered.length !== 1 ? 's' : ''} available · {activeCategory === 'All' ? 'All categories' : activeCategory}
          </p>
        </motion.div>
      </div>
    </section>
  );
}