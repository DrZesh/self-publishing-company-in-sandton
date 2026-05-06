import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Printer, PenLine, Palette, Globe, Users,
  Feather, GraduationCap, BookMarked, FileText, BarChart2, Mic
} from 'lucide-react';

const services = [
  { icon: BookOpen,     title: 'Book Publishing',     cat: 'Publishing', desc: 'Complete publishing solutions — self-publishing and full-service packages that put you in total control.', tags: ['Self-Publishing', 'ISBN', 'Packages'] },
  { icon: Printer,      title: 'Book Printing',        cat: 'Printing',   desc: 'Offset & digital printing in Johannesburg. Hardcover, softcover, specialty formats from 50–50,000 copies.', tags: ['Hardcover', 'Softcover', 'Bulk'] },
  { icon: PenLine,      title: 'Editing Services',     cat: 'Editing',    desc: 'Proofreading, copy editing, manuscript evaluation, and academic editing by South Africa\'s finest editors.', tags: ['Proofreading', 'Copy Edit', 'Academic'] },
  { icon: Palette,      title: 'Cover Design',         cat: 'Design',     desc: 'Award-quality cover design, interior typesetting, and layout. Books that stop browsers in their tracks.', tags: ['Cover', 'Typesetting', 'Layout'] },
  { icon: Globe,        title: 'eBook Publishing',     cat: 'Digital',    desc: 'Amazon KDP, Kindle, and global platforms. Full digital formatting and international distribution.', tags: ['Amazon KDP', 'ePub', 'Global'] },
  { icon: Users,        title: 'Ghostwriting',         cat: 'Writing',    desc: 'Professional ghostwriters for memoirs, biographies, business books, and Christian literature.', tags: ['Memoir', 'Biography', 'Business'] },
  { icon: Feather,      title: 'Memoir Writing',       cat: 'Writing',    desc: 'Transform your life story into a beautifully crafted memoir. Our specialists capture your voice authentically.', tags: ['Life Story', 'Family', 'Legacy'] },
  { icon: GraduationCap, title: 'Academic Editing',   cat: 'Editing',    desc: 'Thesis, dissertation editing, journal preparation, and academic manuscript evaluation.', tags: ['Thesis', 'Research', 'PhD'] },
  { icon: BookMarked,   title: "Children's Books",     cat: 'Publishing', desc: 'Specialised publishing with illustration coordination, age-appropriate design, and full-colour printing.', tags: ['Illustration', 'Full Colour', 'Ages 0–16'] },
  { icon: FileText,     title: 'Training Manuals',     cat: 'Printing',   desc: 'Corporate training manuals and workbooks printed and bound to professional standards.', tags: ['Corporate', 'Workbooks', 'Spiral Bound'] },
  { icon: BarChart2,    title: 'Annual Reports',       cat: 'Design',     desc: 'Premium annual report design and printing for Johannesburg corporates. Boardroom-ready.', tags: ['Corporate', 'Premium', 'JSE Listed'] },
  { icon: Mic,          title: 'Author Branding',      cat: 'Design',     desc: 'Author websites, press kits, social media assets, and full personal brand identity.', tags: ['Website', 'Press Kit', 'Identity'] },
];

const cats = ['All', 'Publishing', 'Printing', 'Editing', 'Design', 'Digital', 'Writing'];

export default function ServicesGrid() {
  const [activeCat, setActiveCat] = useState('All');
  const [activeIdx, setActiveIdx] = useState(null);

  const filtered = activeCat === 'All' ? services : services.filter(s => s.cat === activeCat);

  return (
    <section className="relative py-24 lg:py-32 bg-[#050403] overflow-hidden">
      {/* HUD scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(184,115,51,0.6) 3px, rgba(184,115,51,0.6) 4px)', backgroundSize: '100% 4px' }} />

      {/* Corner brackets */}
      {[['top-8 left-8', 'tl'], ['top-8 right-8', 'tr'], ['bottom-8 left-8', 'bl'], ['bottom-8 right-8', 'br']].map(([pos, corner]) => (
        <div key={corner} className={`absolute ${pos} w-10 h-10 pointer-events-none opacity-20`}
          style={{
            borderTop: corner.startsWith('t') ? '1px solid #B87333' : 'none',
            borderBottom: corner.startsWith('b') ? '1px solid #B87333' : 'none',
            borderLeft: corner.endsWith('l') ? '1px solid #B87333' : 'none',
            borderRight: corner.endsWith('r') ? '1px solid #B87333' : 'none',
          }} />
      ))}

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(184,115,51,0.08) 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-copper" style={{ opacity: 1 - i * 0.3 }} />)}
            </div>
            <span className="text-copper/60 text-xs font-mono tracking-[0.3em] uppercase">SVC_MODULE · {services.length} SERVICES ACTIVE</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Complete Publishing<br />
            <span className="text-gradient-copper">Ecosystem</span>
          </h2>
        </motion.div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {cats.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className="relative px-4 py-1.5 text-xs font-mono tracking-widest uppercase transition-all duration-200"
              style={activeCat === cat ? {
                color: '#B87333',
                background: 'rgba(184,115,51,0.08)',
                border: '1px solid rgba(184,115,51,0.4)',
              } : {
                color: 'rgba(255,255,255,0.3)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              {cat}
              {activeCat === cat && (
                <motion.div layoutId="cat-active" className="absolute inset-0 pointer-events-none"
                  style={{ border: '1px solid rgba(184,115,51,0.6)', boxShadow: '0 0 12px rgba(184,115,51,0.15) inset' }} />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px"
          style={{ background: 'rgba(184,115,51,0.06)', border: '1px solid rgba(184,115,51,0.1)' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((svc, i) => {
              const Icon = svc.icon;
              const isActive = activeIdx === `${svc.title}-${i}`;
              return (
                <motion.div key={svc.title} layout
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  onMouseEnter={() => setActiveIdx(`${svc.title}-${i}`)}
                  onMouseLeave={() => setActiveIdx(null)}
                  className="relative p-6 cursor-default group overflow-hidden"
                  style={{
                    background: isActive ? 'rgba(184,115,51,0.06)' : 'rgba(5,4,3,0.98)',
                    transition: 'background 0.3s ease',
                  }}>

                  {/* Top border glow on hover */}
                  <div className="absolute top-0 left-0 right-0 h-px transition-all duration-300"
                    style={{ background: isActive ? 'linear-gradient(90deg, transparent, #B87333, transparent)' : 'transparent' }} />

                  {/* Index number */}
                  <div className="absolute top-4 right-4 font-mono text-[10px] opacity-20 text-copper">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <motion.div animate={isActive ? { scale: 1.08, rotate: 3 } : { scale: 1, rotate: 0 }} transition={{ duration: 0.2 }}
                    className="w-9 h-9 rounded flex items-center justify-center mb-4"
                    style={{ background: 'rgba(184,115,51,0.08)', border: '1px solid rgba(184,115,51,0.15)' }}>
                    <Icon className="w-4 h-4 text-copper" />
                  </motion.div>

                  <div className="text-[10px] font-mono text-copper/40 tracking-widest uppercase mb-1">{svc.cat}</div>
                  <h3 className="font-heading text-base font-semibold text-white mb-2 leading-tight">{svc.title}</h3>
                  <p className="text-white/40 text-xs font-body leading-relaxed mb-4">{svc.desc}</p>

                  <div className="flex flex-wrap gap-1">
                    {svc.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom accent line on hover */}
                  <motion.div animate={{ scaleX: isActive ? 1 : 0 }} className="absolute bottom-0 left-0 right-0 h-px origin-left"
                    style={{ background: 'rgba(184,115,51,0.5)' }} transition={{ duration: 0.3 }} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Footer count */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.3), transparent)' }} />
          <span className="text-copper/30 text-[10px] font-mono tracking-widest">{filtered.length}/{services.length} MODULES DISPLAYED</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, rgba(184,115,51,0.3), transparent)' }} />
        </div>
      </div>
    </section>
  );
}