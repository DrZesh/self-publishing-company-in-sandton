import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 0,
    eyebrow: 'Publishing Company · South Africa',
    heading: ['Self Publishing', 'Company in South Africa'],
    accentLine: 1,
    subheading: 'From manuscript to printed book, we help authors publish professionally with expert support.',
    primary: { label: 'Request a Quote', to: '/getquote' },
    secondary: { label: 'View Services', to: '/bookpublishing' },
    bg: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1800&q=80',
  },
  {
    id: 1,
    eyebrow: 'Book Printing · Johannesburg',
    heading: ['Professional', 'Book Printing'],
    accentLine: 1,
    subheading: 'High-quality A5, 6×9, hardcover, and children\'s book printing for authors and publishers.',
    primary: { label: 'Get Printing Quote', to: '/getquote' },
    secondary: { label: 'View Services', to: '/bookprinting' },
    bg: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1800&q=80',
  },
  {
    id: 2,
    eyebrow: 'Editing & Design · South Africa',
    heading: ['Editing, Layout', '& Cover Design'],
    accentLine: 1,
    subheading: 'Give your manuscript a professional finish with editing, typesetting, and custom book cover design.',
    primary: { label: 'Start Your Project', to: '/getquote' },
    secondary: { label: 'View Services', to: '/bookcoverdesign' },
    bg: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1800&q=80',
  },
  {
    id: 3,
    eyebrow: 'Author Branding · South Africa',
    heading: ['Build Your', 'Author Brand'],
    accentLine: 1,
    subheading: 'We help authors with publishing support, author websites, book design, and launch-ready presentation.',
    primary: { label: 'Book a Consultation', to: '/contact' },
    secondary: { label: 'View Services', to: '/bookpublishing' },
    bg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80',
  },
];

const stats = [
  { value: '500+', label: 'Books Published' },
  { value: '8+', label: 'Years Experience' },
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
    enter: (d) => ({ opacity: 0, scale: 1.12 }),
    center: { opacity: 1, scale: 1.06, x: 0, transition: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (d) => ({ opacity: 0, scale: 1.02, transition: { duration: 1.0, ease: 'easeIn' } }),
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-[#040302]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKey}
      tabIndex={-1}
      aria-label="Hero section"
    >
      {/* ── Cinematic letterbox bars ── */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black z-10 pointer-events-none" />

      {/* ── Background image with Ken Burns ── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0 w-full h-full"
          custom={direction}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {/* Ken Burns continuous pan */}
          <motion.img
            src={slide.bg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: [1.05, 1.12], x: [0, -16] }}
            transition={{ duration: 12, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
            srcSet={`${slide.bg.split('?')[0]}?w=480&q=70 480w, ${slide.bg.split('?')[0]}?w=768&q=75 768w, ${slide.bg.split('?')[0]}?w=1200&q=80 1200w`}
            sizes="100vw"
            fetchPriority={current === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Cinematic overlays ── */}
      {/* Vignette all sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
      {/* Left-to-right gradient for text area */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/80 via-[#000000]/50 to-transparent pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/90 via-transparent to-[#000000]/30 pointer-events-none" />

      {/* ── Film grain texture ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }} />

      {/* ── Copper accent light streak ── */}
      <motion.div className="absolute pointer-events-none"
        animate={{ opacity: [0, 0.12, 0], x: ['-20%', '120%'] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut' }}
        style={{ top: '30%', left: 0, width: '40%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.8), transparent)', filter: 'blur(1px)' }}
      />

      {/* ── Main content ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 w-full pt-32 pb-32 md:pt-40 md:pb-36">
        <AnimatePresence mode="wait">
          <motion.div key={`text-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="max-w-3xl">

            {/* Eyebrow */}
            <motion.div className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <div className="h-px bg-copper" style={{ width: 48 }} />
              <span className="text-white text-xs font-body tracking-[0.35em] uppercase" style={{ opacity: 0.85 }}>{slide.eyebrow}</span>
            </motion.div>

            {/* Heading — open cinematic type, no card */}
            <div className="mb-8">
              {slide.id === 0 ? (
                <h1 className="font-heading font-bold text-white leading-[1.0]" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', textShadow: '0 4px 40px rgba(0,0,0,0.9), 0 1px 0 rgba(0,0,0,0.6)', letterSpacing: '-0.02em' }}>
                  {slide.heading.map((line, i) => (
                    <motion.span key={i} className={`block ${i === slide.accentLine ? 'text-gradient-copper italic' : ''}`}
                      initial={{ opacity: 0, y: 50, clipPath: 'inset(0 0 100% 0)' }}
                      animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                      transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}>
                      {line}
                    </motion.span>
                  ))}
                </h1>
              ) : (
                <div className="font-heading font-bold text-white leading-[1.0]" role="heading" aria-level="2"
                  style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', textShadow: '0 4px 40px rgba(0,0,0,0.9), 0 1px 0 rgba(0,0,0,0.6)', letterSpacing: '-0.02em' }}>
                  {slide.heading.map((line, i) => (
                    <motion.span key={i} className={`block ${i === slide.accentLine ? 'text-gradient-copper italic' : ''}`}
                      initial={{ opacity: 0, y: 50, clipPath: 'inset(0 0 100% 0)' }}
                      animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                      transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}>
                      {line}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Thin copper rule */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="h-px bg-gradient-to-r from-copper via-copper/50 to-transparent mb-7" style={{ width: 200 }}
            />

            {/* Subheading */}
            <motion.p className="text-white/70 text-base md:text-xl leading-relaxed mb-10 font-body max-w-xl"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              {slide.subheading}
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}>
              <Link to={slide.primary.to}
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white font-medium rounded-full transition-all text-sm md:text-base"
                style={{ background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)', boxShadow: '0 0 40px rgba(184,115,51,0.4), 0 8px 32px rgba(0,0,0,0.5)' }}>
                {slide.primary.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => {
                  const servicesSection = document.getElementById('our-services');
                  if (servicesSection) servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white/80 rounded-full transition-all text-sm md:text-base hover:text-copper"
                style={{ border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.05)' }}>
                {slide.secondary.label}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div className="flex items-center gap-10 mt-12 pt-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1.0 }}>
              {stats.map((s, i) => (
                <div key={s.label}>
                  <p className="font-heading text-3xl md:text-4xl font-bold text-copper" style={{ textShadow: '0 0 30px rgba(184,115,51,0.5)' }}>{s.value}</p>
                  <p className="text-white/35 text-xs font-body tracking-widest uppercase mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 pb-6 pt-4" style={{ marginBottom: '4px' }}>
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