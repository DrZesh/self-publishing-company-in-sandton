import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Slide data ─────────────────────────────────────────────────────────────
const slides = [
  {
    id: 0,
    eyebrow: 'Publishing Company · South Africa',
    heading: ['Self-Publishing', 'Made Simple'],
    accentLine: 1,
    subheading: 'From manuscript to printed book, we help authors publish professionally with expert support.',
    primary: { label: 'Request a Quote', to: '/getquote' },
    secondary: { label: 'View Packages', to: '/publishingpackages' },
    visual: 'stack',
  },
  {
    id: 1,
    eyebrow: 'Book Printing · Johannesburg',
    heading: ['Professional', 'Book Printing'],
    accentLine: 1,
    subheading: 'High-quality A5, 6×9, hardcover, and children\'s book printing for authors and publishers.',
    primary: { label: 'Get Printing Quote', to: '/getquote' },
    secondary: { label: 'Explore Printing', to: '/bookprinting' },
    visual: 'single',
  },
  {
    id: 2,
    eyebrow: 'Editing & Design · South Africa',
    heading: ['Editing, Layout', '& Cover Design'],
    accentLine: 1,
    subheading: 'Give your manuscript a professional finish with editing, typesetting, and custom book cover design.',
    primary: { label: 'Start Your Project', to: '/getquote' },
    secondary: { label: 'View Services', to: '/bookediting' },
    visual: 'open',
  },
  {
    id: 3,
    eyebrow: 'Author Branding · South Africa',
    heading: ['Build Your', 'Author Brand'],
    accentLine: 1,
    subheading: 'We help authors with publishing support, author websites, book design, and launch-ready presentation.',
    primary: { label: 'Book a Consultation', to: '/contact' },
    secondary: { label: 'Learn More', to: '/bookpublishing' },
    visual: 'brand',
  },
];

const stats = [
  { value: '500+', label: 'Books Published' },
  { value: '15+', label: 'Years Experience' },
  { value: '98%', label: 'Satisfaction' },
];

// ── 3D Book visuals (pure CSS/SVG, lightweight) ─────────────────────────────

function BookStack() {
  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden="true">
      {/* Glow base */}
      <div className="absolute w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.18) 0%, transparent 70%)', bottom: '15%', left: '50%', transform: 'translateX(-50%)' }} />

      {/* Book 3 (bottom) */}
      <motion.div animate={{ y: [8, 0, 8] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute" style={{ bottom: '22%', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="relative" style={{ width: 180, height: 220 }}>
          {/* Spine */}
          <div className="absolute left-0 top-0 h-full w-6 rounded-l-sm"
            style={{ background: 'linear-gradient(180deg, #7a5230 0%, #4a3020 100%)', transform: 'skewY(-2deg)', boxShadow: '-4px 0 12px rgba(0,0,0,0.5)' }} />
          {/* Cover */}
          <div className="absolute left-5 top-0 w-full h-full rounded-r-sm"
            style={{ background: 'linear-gradient(135deg, #2a1f14 0%, #3d2b1a 40%, #2a1f14 100%)', boxShadow: '6px 6px 20px rgba(0,0,0,0.6)' }}>
            <div className="absolute inset-3 rounded border border-copper/20 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-1 rounded-full bg-copper/50" />
              <div className="w-16 h-0.5 rounded-full bg-white/20" />
              <div className="w-12 h-0.5 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Book 2 (middle) */}
      <motion.div animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="absolute" style={{ bottom: '30%', left: 'calc(50% - 16px)', transform: 'translateX(-50%)' }}>
        <div className="relative" style={{ width: 170, height: 210 }}>
          <div className="absolute left-0 top-0 h-full w-6 rounded-l-sm"
            style={{ background: 'linear-gradient(180deg, #8a3a1a 0%, #5a2010 100%)', transform: 'skewY(-1deg)', boxShadow: '-4px 0 12px rgba(0,0,0,0.5)' }} />
          <div className="absolute left-5 top-0 w-full h-full rounded-r-sm"
            style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2d1e0f 40%, #1a1208 100%)', boxShadow: '8px 8px 24px rgba(0,0,0,0.7)' }}>
            <div className="absolute inset-3 rounded border border-copper/30 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border border-copper/40 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-copper/60" />
              </div>
              <div className="w-14 h-0.5 rounded-full bg-copper/30 mt-1" />
              <div className="w-10 h-0.5 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Book 1 (top/front) */}
      <motion.div animate={{ y: [0, -16, 0], rotate: [1, -1, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute" style={{ bottom: '38%', left: 'calc(50% + 14px)', transform: 'translateX(-50%)' }}>
        <div className="relative" style={{ width: 160, height: 200 }}>
          <div className="absolute left-0 top-0 h-full w-7 rounded-l-sm"
            style={{ background: 'linear-gradient(180deg, #B87333 0%, #7a4a20 100%)', transform: 'skewY(-1deg)', boxShadow: '-4px 0 14px rgba(0,0,0,0.5)' }} />
          <div className="absolute left-6 top-0 w-full h-full rounded-r-sm"
            style={{ background: 'linear-gradient(135deg, #0d0a06 0%, #1c1309 40%, #0d0a06 100%)', boxShadow: '10px 10px 28px rgba(0,0,0,0.8)' }}>
            <div className="absolute inset-3 rounded border border-copper/40 flex flex-col items-center justify-center gap-2 p-2">
              <div className="w-full h-1.5 rounded-full bg-copper/70" />
              <div className="text-copper/80 text-center font-heading font-bold text-xs leading-tight mt-1">CREATIVE<br/>BOOKS SA</div>
              <div className="w-full h-px bg-copper/30 mt-1" />
              <div className="w-3/4 h-0.5 rounded-full bg-white/20" />
              <div className="w-1/2 h-0.5 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating pages */}
      {[...Array(4)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -12 - i * 4, 0], x: [0, i % 2 === 0 ? 8 : -8, 0], rotate: [i * 5 - 8, i * 5, i * 5 - 8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          className="absolute rounded-sm"
          style={{ width: 50 + i * 10, height: 65 + i * 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)', bottom: `${55 + i * 6}%`, left: `${20 + i * 18}%` }}
        />
      ))}
    </div>
  );
}

function SingleBook() {
  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden="true">
      <div className="absolute w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.15) 0%, transparent 70%)', top: '20%', left: '50%', transform: 'translateX(-50%)' }} />

      <motion.div animate={{ y: [0, -14, 0], rotateY: [0, 8, 0], rotateX: [2, -2, 2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ perspective: 800 }}
        className="relative z-10">
        <div className="relative" style={{ width: 200, height: 260, transformStyle: 'preserve-3d' }}>
          {/* Spine */}
          <div className="absolute left-0 top-0 h-full w-10 rounded-l"
            style={{ background: 'linear-gradient(180deg, #B87333 0%, #6a3d15 50%, #B87333 100%)', boxShadow: '-6px 0 20px rgba(0,0,0,0.6)' }}>
            <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-1">
              <div className="w-1 h-16 rounded-full bg-white/20" />
              <div className="w-4 h-0.5 rounded-full bg-white/30" />
            </div>
          </div>
          {/* Cover */}
          <div className="absolute left-9 top-0 right-0 h-full rounded-r"
            style={{ background: 'linear-gradient(160deg, #111 0%, #1e1208 60%, #0a0806 100%)', boxShadow: '12px 12px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div className="absolute inset-4 flex flex-col justify-between">
              <div>
                <div className="w-full h-1 rounded-full bg-copper/80 mb-2" />
                <div className="text-copper/90 font-heading font-bold text-sm leading-tight">PROFESSIONAL<br/>PRINTING</div>
                <div className="w-3/4 h-px bg-copper/30 mt-2" />
              </div>
              <div className="flex flex-col gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-px rounded-full bg-white/15" style={{ width: `${60 + (i % 3) * 15}%` }} />
                ))}
              </div>
              <div className="text-white/30 text-xs font-body">Creative Books SA</div>
            </div>
          </div>
          {/* Bottom shadow */}
          <div className="absolute -bottom-4 left-2 right-0 h-4 rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)', filter: 'blur(4px)' }} />
        </div>
      </motion.div>

      {/* Floating pages around */}
      {[...Array(3)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -10 - i * 5, 0], rotate: [i * 8 - 10, i * 8, i * 8 - 10], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          className="absolute rounded-sm"
          style={{ width: 60, height: 80, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', top: `${30 + i * 15}%`, left: `${10 + i * 25}%` }}
        />
      ))}
    </div>
  );
}

function OpenBook() {
  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden="true">
      <div className="absolute w-80 h-48 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(184,115,51,0.12) 0%, transparent 70%)', top: '35%', left: '50%', transform: 'translateX(-50%)' }} />

      <motion.div animate={{ y: [0, -12, 0], rotateX: [5, -2, 5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ perspective: 600 }} className="relative z-10">
        {/* Open book */}
        <div className="relative flex" style={{ width: 300, height: 200 }}>
          {/* Left page */}
          <motion.div animate={{ rotateY: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1/2 h-full rounded-l-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #ede4d0 100%)', boxShadow: '-8px 8px 24px rgba(0,0,0,0.5)', transformOrigin: 'right center', transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-4 flex flex-col gap-1.5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="rounded-full bg-[#3d2b1a]/20"
                  style={{ height: 2, width: `${50 + (i % 4) * 12}%` }} />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 text-[#3d2b1a]/30 text-xs font-body">12</div>
          </motion.div>
          {/* Spine shadow */}
          <div className="w-2 h-full z-10 shrink-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)' }} />
          {/* Right page */}
          <motion.div animate={{ rotateY: [0, 3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className="w-1/2 h-full rounded-r-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #ede4d0 0%, #f5f0e8 100%)', boxShadow: '8px 8px 24px rgba(0,0,0,0.5)', transformOrigin: 'left center', transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-4 flex flex-col gap-1.5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="rounded-full bg-[#3d2b1a]/20"
                  style={{ height: 2, width: `${40 + (i % 5) * 10}%` }} />
              ))}
            </div>
            <div className="absolute bottom-3 left-3 text-[#3d2b1a]/30 text-xs font-body">13</div>
          </motion.div>
          {/* Shadow under book */}
          <div className="absolute -bottom-5 left-0 right-0 h-5 rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)', filter: 'blur(4px)' }} />
        </div>
      </motion.div>

      {/* Floating design elements */}
      {[
        { w: 50, h: 60, top: '20%', left: '15%', rot: -12 },
        { w: 40, h: 50, top: '60%', right: '12%', rot: 8 },
        { w: 35, h: 45, top: '25%', right: '20%', rot: 15 },
      ].map((el, i) => (
        <motion.div key={i}
          animate={{ y: [0, -10, 0], rotate: [el.rot, el.rot + 4, el.rot], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          className="absolute rounded-sm"
          style={{ width: el.w, height: el.h, top: el.top, left: el.left, right: el.right, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      ))}
    </div>
  );
}

function BrandVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden="true">
      <div className="absolute w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.14) 0%, transparent 70%)', top: '15%', left: '50%', transform: 'translateX(-50%)' }} />

      {/* Laptop/screen mockup */}
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10">
        <div className="relative" style={{ width: 260, height: 170 }}>
          {/* Screen */}
          <div className="w-full h-full rounded-xl overflow-hidden border border-white/10"
            style={{ background: 'linear-gradient(135deg, #0a0806 0%, #111 50%, #0a0806 100%)', boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
            {/* Screen header */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <div className="w-2 h-2 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-3 h-3 rounded bg-white/5 text-white/20 flex items-center px-2">
                <span className="text-[7px] font-body">creativebookssa.co.za</span>
              </div>
            </div>
            {/* Screen content */}
            <div className="p-3">
              <div className="w-16 h-1.5 rounded-full bg-copper/60 mb-2" />
              <div className="w-24 h-2.5 rounded bg-copper/20 mb-3" />
              <div className="flex gap-2 mb-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-1 h-12 rounded-lg bg-white/5 border border-white/5" />
                ))}
              </div>
              <div className="flex gap-2">
                <div className="w-16 h-4 rounded-full bg-copper/50" />
                <div className="w-20 h-4 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
          {/* Laptop base */}
          <div className="absolute -bottom-2 left-0 right-0 h-3 rounded-b-xl"
            style={{ background: 'linear-gradient(180deg, #222 0%, #111 100%)', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }} />
        </div>
      </motion.div>

      {/* Floating book covers */}
      {[
        { size: 70, bottom: '25%', left: '8%', delay: 0.3, rot: -10 },
        { size: 60, bottom: '35%', right: '8%', delay: 0.8, rot: 12 },
      ].map((el, i) => (
        <motion.div key={i}
          animate={{ y: [0, -12, 0], rotate: [el.rot, el.rot + 3, el.rot], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: el.delay }}
          className="absolute rounded-sm"
          style={{ width: el.size, height: el.size * 1.3, bottom: el.bottom, left: el.left, right: el.right,
            background: 'linear-gradient(135deg, #1a0f06 0%, #2a1a0a 100%)', border: '1px solid rgba(184,115,51,0.3)',
            boxShadow: '4px 4px 16px rgba(0,0,0,0.6)' }}>
          <div className="absolute inset-2 border border-copper/20 rounded-sm" />
        </motion.div>
      ))}
    </div>
  );
}

const VisualComponents = { stack: BookStack, single: SingleBook, open: OpenBook, brand: BrandVisual };

// ── Floating particles ──────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i, delay: i * 0.35,
  x: 5 + (i * 7.9) % 90,
  y: 5 + (i * 11.3) % 85,
  size: 2 + (i % 4),
}));

// ── Main component ──────────────────────────────────────────────────────────
export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback((index, dir = 1) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length, 1), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length, -1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, 6500);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, next]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) delta > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const handleKey = (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };

  const slide = slides[current];
  const Visual = VisualComponents[slide.visual];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-[#080604]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKey}
      tabIndex={-1}
      aria-label="Hero section"
    >
      {/* ── Deep background gradient (no image, always readable) ── */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, #1a0e06 0%, #0a0806 40%, #050403 100%)' }} />

      {/* ── Animated ambient glow ── */}
      <AnimatePresence mode="wait">
        <motion.div key={`glow-${current}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 pointer-events-none">
          <motion.div className="absolute rounded-full"
            animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 700, height: 700, right: '5%', top: '-10%', background: 'radial-gradient(circle, rgba(184,115,51,0.10) 0%, transparent 65%)' }} />
          <motion.div className="absolute rounded-full"
            animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ width: 500, height: 500, left: '-5%', bottom: '-10%', background: 'radial-gradient(circle, rgba(184,115,51,0.07) 0%, transparent 65%)' }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Subtle grid overlay ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── Particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map(p => (
          <motion.div key={p.id}
            className="absolute rounded-full bg-copper/25"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -28, 0], opacity: [0.15, 0.5, 0.15], scale: [1, 1.5, 1] }}
            transition={{ duration: 4.5 + p.delay, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-28 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* ── LEFT: Text card ── */}
          <div className="w-full lg:w-1/2 xl:w-[55%]">
            <AnimatePresence mode="wait">
              <motion.div key={`text-${current}`}
                initial={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}>

                {/* Eyebrow */}
                <motion.div className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}>
                  <motion.div className="h-px bg-copper"
                    initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 0.6, delay: 0.3 }} />
                  <span className="text-copper text-xs sm:text-sm font-body tracking-[0.25em] uppercase">{slide.eyebrow}</span>
                </motion.div>

                {/* Glass card */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative rounded-3xl p-8 md:p-10"
                  style={{
                    background: 'rgba(15,10,6,0.85)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(184,115,51,0.18)',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(184,115,51,0.05)',
                  }}>
                  {/* Corner accent */}
                  <div className="absolute top-0 left-0 w-20 h-20 rounded-tl-3xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full"
                      style={{ background: 'linear-gradient(135deg, rgba(184,115,51,0.15) 0%, transparent 60%)' }} />
                  </div>

                  {/* Heading */}
                  <div className="mb-5">
                    {slide.id === 0 ? (
                      <h1 className="font-heading font-bold text-white leading-[1.08]" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                        {slide.heading.map((line, i) => (
                          <motion.span key={i} className={`block ${i === slide.accentLine ? 'text-gradient-copper italic' : ''}`}
                            initial={{ opacity: 0, y: 30, skewY: 2 }}
                            animate={{ opacity: 1, y: 0, skewY: 0 }}
                            transition={{ duration: 0.65, delay: 0.3 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}>
                            {line}
                          </motion.span>
                        ))}
                      </h1>
                    ) : (
                      <div className="font-heading font-bold text-white leading-[1.08]" role="heading" aria-level="2"
                        style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                        {slide.heading.map((line, i) => (
                          <motion.span key={i} className={`block ${i === slide.accentLine ? 'text-gradient-copper italic' : ''}`}
                            initial={{ opacity: 0, y: 30, skewY: 2 }}
                            animate={{ opacity: 1, y: 0, skewY: 0 }}
                            transition={{ duration: 0.65, delay: 0.3 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}>
                            {line}
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <motion.div className="h-px w-12 bg-copper/50 mb-5"
                    initial={{ width: 0 }} animate={{ width: 48 }} transition={{ duration: 0.5, delay: 0.55 }} />

                  {/* Subheading */}
                  <motion.p className="text-white/75 text-base md:text-lg leading-relaxed mb-8 font-body"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}>
                    {slide.subheading}
                  </motion.p>

                  {/* CTAs */}
                  <motion.div className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.65 }}>
                    <Link to={slide.primary.to}
                      className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/25 text-sm md:text-base">
                      {slide.primary.label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to={slide.secondary.to}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 text-white/90 rounded-full hover:border-copper hover:text-copper transition-all text-sm md:text-base">
                      {slide.secondary.label}
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div className="grid grid-cols-3 gap-5 mt-8 pt-6 border-t border-white/8 max-w-sm"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.85 }}>
                  {stats.map(s => (
                    <div key={s.label}>
                      <p className="font-heading text-2xl md:text-3xl font-bold text-copper">{s.value}</p>
                      <p className="text-white/40 text-xs font-body mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT: 3D visual ── */}
          <div className="w-full lg:w-1/2 xl:w-[45%] h-64 sm:h-80 lg:h-[500px] relative">
            <AnimatePresence mode="wait">
              <motion.div key={`visual-${current}`}
                initial={{ opacity: 0, x: direction > 0 ? 60 : -60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0">
                <Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Bottom controls bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 pb-6 pt-4">
        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2 }} aria-hidden="true">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-copper" />
          </div>
        </motion.div>

        {/* Pagination dots */}
        <div className="flex items-center gap-2.5" role="tablist" aria-label="Slider navigation">
          {slides.map((s, i) => (
            <motion.button key={s.id} role="tab" aria-selected={i === current} aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              whileHover={{ scale: 1.4 }}
              animate={{ width: i === current ? 28 : 8, backgroundColor: i === current ? '#B87333' : 'rgba(255,255,255,0.25)' }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full cursor-pointer"
            />
          ))}
        </div>

        {/* Arrow controls */}
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={prev} aria-label="Previous slide"
            className="w-10 h-10 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:border-copper hover:text-copper transition-all">
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={next} aria-label="Next slide"
            className="w-10 h-10 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/70 hover:border-copper hover:text-copper transition-all">
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/8 z-30">
        <motion.div className="h-full bg-copper" key={`progress-${current}`}
          initial={{ width: '0%' }} animate={{ width: paused ? undefined : '100%' }}
          transition={{ duration: 6.5, ease: 'linear' }} />
      </div>
    </section>
  );
}