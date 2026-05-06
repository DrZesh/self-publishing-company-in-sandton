import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Printer, PenLine, Palette, Globe, Users,
  Feather, GraduationCap, BookMarked, FileText, BarChart2, Mic
} from 'lucide-react';

const services = [
  {
    icon: BookOpen,
    title: 'Book Publishing',
    desc: 'Complete self-publishing solutions from manuscript to marketplace — editing, design, print, and distribution handled end-to-end.',
    tags: ['Self-Publishing', 'ISBN', 'Distribution'],
    size: 'large', // takes 2 cols
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
  },
  {
    icon: Printer,
    title: 'Book Printing',
    desc: 'Offset & digital printing in Johannesburg. Hardcover, softcover, and specialty formats.',
    tags: ['Hardcover', 'Softcover', 'Bulk Runs'],
    size: 'medium',
  },
  {
    icon: PenLine,
    title: 'Editing Services',
    desc: 'Proofreading, copy editing, and developmental editing by South Africa\'s finest editors.',
    tags: ['Proofreading', 'Copy Editing', 'Academic'],
    size: 'medium',
  },
  {
    icon: Palette,
    title: 'Cover Design',
    desc: 'Award-quality cover design and interior typesetting. Books that stop shoppers mid-scroll.',
    tags: ['Cover Design', 'Typesetting', 'Branding'],
    size: 'tall', // takes 2 rows
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
  },
  {
    icon: Globe,
    title: 'eBook Publishing',
    desc: 'Amazon KDP, Kindle, and global platforms. Full digital formatting and international reach.',
    tags: ['Amazon KDP', 'ePub', 'Global'],
    size: 'small',
  },
  {
    icon: Users,
    title: 'Ghostwriting',
    desc: 'Professional ghostwriters for memoirs, biographies, and business books.',
    tags: ['Memoir', 'Biography', 'Business'],
    size: 'small',
  },
  {
    icon: Feather,
    title: 'Memoir Writing',
    desc: 'Transform your life story into a beautifully crafted memoir.',
    tags: ['Life Story', 'Family', 'Legacy'],
    size: 'small',
  },
  {
    icon: GraduationCap,
    title: 'Academic Editing',
    desc: 'Thesis, dissertation, and journal article editing for SA researchers.',
    tags: ['Thesis', 'Research', 'PhD'],
    size: 'small',
  },
  {
    icon: BookMarked,
    title: "Children's Books",
    desc: 'Illustration coordination, age-appropriate design, and full-colour printing.',
    tags: ['Illustration', 'Full Colour', 'All Ages'],
    size: 'medium',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  },
  {
    icon: FileText,
    title: 'Training Manuals',
    desc: 'Corporate workbooks and training manuals printed to professional standards.',
    tags: ['Corporate', 'Workbooks', 'Spiral Bound'],
    size: 'small',
  },
  {
    icon: BarChart2,
    title: 'Annual Reports',
    desc: 'Premium annual report design and printing for Johannesburg corporates.',
    tags: ['Corporate', 'Premium', 'Print'],
    size: 'small',
  },
  {
    icon: Mic,
    title: 'Author Branding',
    desc: 'Author websites, press kits, and full personal brand identity.',
    tags: ['Website', 'Press Kit', 'Identity'],
    size: 'small',
  },
];

const COPPER = '#B87333';

export default function ServicesGrid() {
  const [hovered, setHovered] = useState(null);

  // We'll arrange into a visual bento grid using explicit grid placement
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0704 0%, #050403 100%)' }}>

      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${COPPER}60, transparent)` }} />
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 100% at 50% 0%, rgba(184,115,51,0.07) 0%, transparent 100%)` }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-copper/60 text-xs font-mono tracking-[0.35em] uppercase mb-3">
              12 SERVICES · COMPLETE ECOSYSTEM
            </p>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.95]">
              Every Service<br />
              <em className="not-italic text-gradient-copper">You Need</em>
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="md:max-w-xs text-white/35 text-sm font-body leading-relaxed md:text-right">
            From first draft to final distribution — South Africa's most comprehensive publishing services, all under one roof.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[180px] gap-3">

          {/* 1: Book Publishing — LARGE (col-span-3, row-span-2) */}
          <BentoCard svc={services[0]} hovered={hovered} setHovered={setHovered} index={0}
            className="col-span-2 md:col-span-3 row-span-2" showImage />

          {/* 2: Cover Design — TALL (col-span-1, row-span-2) on large, medium on small */}
          <BentoCard svc={services[3]} hovered={hovered} setHovered={setHovered} index={3}
            className="col-span-2 md:col-span-1 lg:col-span-2 row-span-2" showImage />

          {/* 3: Book Printing */}
          <BentoCard svc={services[1]} hovered={hovered} setHovered={setHovered} index={1}
            className="col-span-1 md:col-span-2 lg:col-span-1" />

          {/* 4: Editing */}
          <BentoCard svc={services[2]} hovered={hovered} setHovered={setHovered} index={2}
            className="col-span-1 md:col-span-2 lg:col-span-1" />

          {/* 5: eBook */}
          <BentoCard svc={services[4]} hovered={hovered} setHovered={setHovered} index={4}
            className="col-span-1" compact />

          {/* 6: Ghostwriting */}
          <BentoCard svc={services[5]} hovered={hovered} setHovered={setHovered} index={5}
            className="col-span-1" compact />

          {/* 7: Children's Books — spans 2 cols */}
          <BentoCard svc={services[8]} hovered={hovered} setHovered={setHovered} index={8}
            className="col-span-2 md:col-span-2 lg:col-span-2" showImage />

          {/* 8: Memoir Writing */}
          <BentoCard svc={services[6]} hovered={hovered} setHovered={setHovered} index={6}
            className="col-span-1" compact />

          {/* 9: Academic Editing */}
          <BentoCard svc={services[7]} hovered={hovered} setHovered={setHovered} index={7}
            className="col-span-1" compact />

          {/* 10: Training Manuals */}
          <BentoCard svc={services[9]} hovered={hovered} setHovered={setHovered} index={9}
            className="col-span-1" compact />

          {/* 11: Annual Reports */}
          <BentoCard svc={services[10]} hovered={hovered} setHovered={setHovered} index={10}
            className="col-span-1" compact />

          {/* 12: Author Branding — spans 2 */}
          <BentoCard svc={services[11]} hovered={hovered} setHovered={setHovered} index={11}
            className="col-span-2 md:col-span-2" />

        </div>
      </div>
    </section>
  );
}

function BentoCard({ svc, hovered, setHovered, index, className = '', showImage = false, compact = false }) {
  const Icon = svc.icon;
  const isHot = hovered === index;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={`relative overflow-hidden cursor-default group ${className}`}
      style={{
        background: isHot ? 'rgba(184,115,51,0.07)' : 'rgba(255,255,255,0.025)',
        border: isHot ? '1px solid rgba(184,115,51,0.45)' : '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      {/* Background image if present */}
      {showImage && svc.image && (
        <div className="absolute inset-0">
          <img src={svc.image} alt={svc.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(5,4,3,0.96) 30%, rgba(5,4,3,0.7) 60%, rgba(5,4,3,0.4) 100%)' }} />
        </div>
      )}

      {/* Top shimmer on hover */}
      <AnimatePresence>
        {isHot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.9), transparent)' }} />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className={`relative z-10 flex flex-col justify-end h-full ${compact ? 'p-4' : 'p-6'}`}>
        {/* Icon */}
        <motion.div
          animate={isHot ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`${compact ? 'w-7 h-7 mb-3' : 'w-9 h-9 mb-4'} rounded flex items-center justify-center shrink-0`}
          style={{ background: 'rgba(184,115,51,0.12)', border: '1px solid rgba(184,115,51,0.2)' }}>
          <Icon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-copper`} />
        </motion.div>

        <h3 className={`font-heading font-bold text-white leading-tight ${compact ? 'text-sm mb-1' : 'text-lg mb-2'}`}>
          {svc.title}
        </h3>

        {!compact && (
          <p className="text-white/45 text-xs font-body leading-relaxed mb-3 line-clamp-3">{svc.desc}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {svc.tags.slice(0, compact ? 1 : 3).map(tag => (
            <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 tracking-wider"
              style={{ background: 'rgba(184,115,51,0.08)', color: 'rgba(184,115,51,0.6)', border: '1px solid rgba(184,115,51,0.12)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent */}
      <motion.div
        animate={{ scaleX: isHot ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
        style={{ background: 'linear-gradient(90deg, #B87333, rgba(184,115,51,0.2))' }}
      />
    </motion.div>
  );
}