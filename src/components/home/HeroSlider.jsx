import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 0,
    eyebrow: 'Publishing Company · South Africa',
    heading: ['Premium Book', 'Publishing in South Africa'],
    accentLine: 1,
    subheading: 'From manuscript to printed book, we help authors publish professionally with expert support.',
    primary: { label: 'Request a Quote', to: '/getquote' },
    secondary: { label: 'View Packages', to: '/publishingpackages' },
    bg: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1800&q=80',
  },
  {
    id: 1,
    eyebrow: 'Book Printing · Johannesburg',
    heading: ['Professional', 'Book Printing'],
    accentLine: 1,
    subheading: 'High-quality A5, 6×9, hardcover, and children\'s book printing for authors and publishers.',
    primary: { label: 'Get Printing Quote', to: '/getquote' },
    secondary: { label: 'Explore Printing', to: '/bookprinting' },
    bg: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1800&q=80',
  },
  {
    id: 2,
    eyebrow: 'Editing & Design · South Africa',
    heading: ['Editing, Layout', '& Cover Design'],
    accentLine: 1,
    subheading: 'Give your manuscript a professional finish with editing, typesetting, and custom book cover design.',
    primary: { label: 'Start Your Project', to: '/getquote' },
    secondary: { label: 'View Services', to: '/bookediting' },
    bg: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1800&q=80',
  },
  {
    id: 3,
    eyebrow: 'Author Branding · South Africa',
    heading: ['Build Your', 'Author Brand'],
    accentLine: 1,
    subheading: 'We help authors with publishing support, author websites, book design, and launch-ready presentation.',
    primary: { label: 'Book a Consultation', to: '/contact' },
    secondary: { label: 'Learn More', to: '/bookpublishing' },
    bg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80',
  },
];

const stats = [
  { value: '500+', label: 'Books Published' },
  { value: '15+', label: 'Years Experience' },
  { value: '98%', label: 'Satisfaction' },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i, delay: i * 0.35,
  x: 5 + (i * 7.9) % 90,
  y: 5 + (i * 11.3) % 85,
  size: 2 + (i % 4),
}));

export default function HeroSlider({ locationData }) {
  const [current, setCurrent] = useState(0);
  
  // If locationData is provided, use a single location-specific slide
  const locationSlide = locationData ? {
    id: 'location',
    eyebrow: `${locationData.serviceType} · ${locationData.city}`,
    heading: [locationData.serviceType, `in ${locationData.city}`],
    accentLine: 1,
    subheading: `Professional ${locationData.serviceType.toLowerCase()} services for ${locationData.city} and ${locationData.province}. Fast turnaround, competitive pricing, and expert support for authors and businesses.`,
    primary: { label: 'Get a Quote', to: '/getquote' },
    secondary: { label: 'View Services', to: locationData.serviceType === 'Book Printing' ? '/bookprinting' : '/selfpublishingsouthafrica' },
    bg: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1800&q=80',
  } : null;
  
  const activeSlides = locationSlide ? [locationSlide] : slides;
  const currentSlide = activeSlides[current];
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback((index, dir = 1) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => goTo((current + 1) % activeSlides.length, 1), [current, goTo, activeSlides.length]);
  const prev = useCallback(() => goTo((current - 1 + activeSlides.length) % activeSlides.length, -1), [current, goTo, activeSlides.length]);

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

  const slide = currentSlide;

  const bgVariants = {
    enter: (d) => ({ opacity: 0, scale: 1.08, x: d > 0 ? 40 : -40 }),
    center: { opacity: 0.5, scale: 1.03, x: 0, transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (d) => ({ opacity: 0, scale: 1, x: d > 0 ? -40 : 40, transition: { duration: 0.8, ease: 'easeIn' } }),
  };

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
      {/* ── Background image at 50% opacity ── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={`bg-${current}`}
          src={slide.bg}
          alt={slide.heading.join(' ')}
          aria-hidden="true"
          custom={direction}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          loading="eager"
          width="1800"
          height="1000"
          decoding="async"
        />
      </AnimatePresence>

      {/* ── Dark overlay on top of image for text readability ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/90 via-[#0F0F0F]/75 to-[#0F0F0F]/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-70" />

      {/* ── Animated ambient glow ── */}
      <motion.div className="absolute rounded-full pointer-events-none"
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 700, height: 700, right: '5%', top: '-10%', background: 'radial-gradient(circle, rgba(184,115,51,0.10) 0%, transparent 65%)' }} />
      <motion.div className="absolute rounded-full pointer-events-none"
        animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ width: 500, height: 500, left: '-5%', bottom: '-10%', background: 'radial-gradient(circle, rgba(184,115,51,0.07) 0%, transparent 65%)' }} />

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

      {/* ── Main content (full width, centered) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-28 pb-24 md:pt-36 md:pb-28">
        <AnimatePresence mode="wait">
          <motion.div key={`text-${current}`}
            initial={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl">

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
                background: 'rgba(15,10,6,0.82)',
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
            <motion.div className="grid grid-cols-3 gap-5 mt-8 pt-6 border-t border-white/10 max-w-sm"
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

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 pb-6 pt-4">
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2 }} aria-hidden="true">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-copper" />
          </div>
        </motion.div>

        <div className="flex items-center gap-2.5" role="tablist" aria-label="Slider navigation">
          {activeSlides.map((s, i) => (
            <motion.button key={s.id} role="tab" aria-selected={i === current} aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              whileHover={{ scale: 1.4 }}
              animate={{ width: i === current ? 28 : 8, backgroundColor: i === current ? '#B87333' : 'rgba(255,255,255,0.25)' }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full cursor-pointer"
            />
          ))}
        </div>

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