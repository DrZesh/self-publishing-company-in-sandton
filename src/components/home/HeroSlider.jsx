import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 0,
    eyebrow: 'Publishing Company · South Africa',
    heading: ['Self-Publishing', 'Made Simple'],
    headingAccent: 1,
    subheading: 'From manuscript to printed book, we help authors publish professionally with expert support.',
    primary: { label: 'Request a Quote', to: '/getquote' },
    secondary: { label: 'View Packages', to: '/publishingpackages' },
    bg: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1800&q=80',
    accentColor: '#B87333',
    blobColor1: 'rgba(184,115,51,0.25)',
    blobColor2: 'rgba(184,115,51,0.10)',
  },
  {
    id: 1,
    eyebrow: 'Book Printing · Johannesburg',
    heading: ['Professional', 'Book Printing'],
    headingAccent: 1,
    subheading: 'High-quality A5, 6×9, hardcover, and children\'s book printing for authors and publishers.',
    primary: { label: 'Get Printing Quote', to: '/getquote' },
    secondary: { label: 'Explore Printing', to: '/bookprinting' },
    bg: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1800&q=80',
    accentColor: '#B87333',
    blobColor1: 'rgba(100,80,60,0.3)',
    blobColor2: 'rgba(184,115,51,0.12)',
  },
  {
    id: 2,
    eyebrow: 'Editing & Design · South Africa',
    heading: ['Editing, Layout', '& Cover Design'],
    headingAccent: 0,
    subheading: 'Give your manuscript a professional finish with editing, typesetting, and custom book cover design.',
    primary: { label: 'Start Your Project', to: '/getquote' },
    secondary: { label: 'View Services', to: '/bookediting' },
    bg: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1800&q=80',
    accentColor: '#B87333',
    blobColor1: 'rgba(184,115,51,0.2)',
    blobColor2: 'rgba(80,60,40,0.2)',
  },
  {
    id: 3,
    eyebrow: 'Author Branding · South Africa',
    heading: ['Build Your', 'Author Brand'],
    headingAccent: 1,
    subheading: 'We help authors with publishing support, author websites, book design, and launch-ready presentation.',
    primary: { label: 'Book a Consultation', to: '/contact' },
    secondary: { label: 'Learn More', to: '/bookpublishing' },
    bg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80',
    accentColor: '#B87333',
    blobColor1: 'rgba(184,115,51,0.18)',
    blobColor2: 'rgba(120,90,60,0.2)',
  },
];

const stats = [
  { value: '500+', label: 'Books Published' },
  { value: '15+', label: 'Years Experience' },
  { value: '98%', label: 'Author Satisfaction' },
];

// Floating blob component
function Blob({ color, style, animate }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, ...style }}
      animate={animate}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    />
  );
}

// Animated particle
function Particle({ delay, x, y, size }) {
  return (
    <motion.div
      className="absolute rounded-full bg-copper/30 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.4, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const particles = Array.from({ length: 10 }, (_, i) => ({
  id: i, delay: i * 0.4,
  x: 10 + (i * 8.5) % 85,
  y: 10 + (i * 13) % 75,
  size: 3 + (i % 4),
}));

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback((index, dir = 1) => {
    setPrev(current);
    setDirection(dir);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 1);
  }, [current, goTo]);

  const prev_ = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, -1);
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, 6000);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, next]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev_();
    touchStartX.current = null;
  };

  const slide = slides[current];

  // Slide variants
  const bgVariants = {
    enter: (d) => ({ scale: 1.08, opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { scale: 1.04, opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (d) => ({ scale: 1, opacity: 0, x: d > 0 ? -60 : 60, transition: { duration: 0.8, ease: 'easeIn' } }),
  };

  const contentVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 40, skewY: 3 },
    visible: (i) => ({ opacity: 1, y: 0, skewY: 0, transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] } }),
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero slider"
    >
      {/* ── Background slides ── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${current}`}
          custom={direction}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={slide.bg}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Dark overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/96 via-[#0F0F0F]/80 to-[#0F0F0F]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-70" />

          {/* Animated blobs */}
          <Blob color={slide.blobColor1} style={{ width: 700, height: 700, left: '-10%', top: '-20%' }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }} />
          <Blob color={slide.blobColor2} style={{ width: 500, height: 500, right: '5%', bottom: '10%' }}
            animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }} />

          {/* Light flare */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 600, height: 600, left: '30%', top: '-10%',
              background: 'radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 65%)',
              borderRadius: '50%',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Abstract lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" aria-hidden="true">
            <motion.line x1="0" y1="30%" x2="100%" y2="70%" stroke="#B87333" strokeWidth="1"
              animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 5, repeat: Infinity }} />
            <motion.line x1="0" y1="70%" x2="100%" y2="35%" stroke="#B87333" strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} />
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* ── Particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-28 pb-24 md:pt-36 md:pb-28">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`content-${current}`}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.div className="h-px bg-copper"
                initial={{ width: 0 }} animate={{ width: 48 }} transition={{ duration: 0.6, delay: 0.3 }} />
              <span className="text-copper text-xs sm:text-sm font-body tracking-[0.25em] uppercase">{slide.eyebrow}</span>
            </motion.div>

            {/* Glassmorphism card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative backdrop-blur-sm bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 md:p-10 shadow-2xl max-w-2xl"
              style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              {/* Glow edge */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(184,115,51,0.06) 0%, transparent 60%)' }} />

              {/* H1 only on slide 0 for SEO, h2 on others */}
              <div className="mb-5 overflow-hidden">
                {slide.id === 0 ? (
                  <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05]">
                    {slide.heading.map((word, i) => (
                      <motion.span key={i} custom={i} variants={wordVariants} initial="hidden" animate="visible"
                        className={`block ${i === slide.headingAccent ? 'text-gradient-copper italic' : ''}`}>
                        {word}
                      </motion.span>
                    ))}
                  </h1>
                ) : (
                  <p className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05]" role="heading" aria-level="2">
                    {slide.heading.map((word, i) => (
                      <motion.span key={i} custom={i} variants={wordVariants} initial="hidden" animate="visible"
                        className={`block ${i === slide.headingAccent ? 'text-gradient-copper italic' : ''}`}>
                        {word}
                      </motion.span>
                    ))}
                  </p>
                )}
              </div>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-white/60 text-base md:text-lg leading-relaxed mb-8 font-body max-w-xl"
              >
                {slide.subheading}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link to={slide.primary.to}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/25 text-sm md:text-base">
                  {slide.primary.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to={slide.secondary.to}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all text-sm md:text-base backdrop-blur-sm">
                  {slide.secondary.label}
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10 max-w-sm"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-2xl md:text-3xl font-bold text-copper">{s.value}</p>
                  <p className="text-white/45 text-xs font-body mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation arrows ── */}
      <div className="absolute z-20 bottom-24 right-6 sm:right-10 flex flex-col gap-3 md:flex-row md:bottom-10 md:right-10">
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={prev_}
          aria-label="Previous slide"
          className="w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:border-copper hover:text-copper transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Next slide"
          className="w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:border-copper hover:text-copper transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* ── Pagination dots ── */}
      <div className="absolute z-20 bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5" role="tablist" aria-label="Slider navigation">
        {slides.map((s, i) => (
          <motion.button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            whileHover={{ scale: 1.3 }}
            animate={{ width: i === current ? 28 : 8, backgroundColor: i === current ? '#B87333' : 'rgba(255,255,255,0.3)' }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full cursor-pointer"
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <motion.div
          className="h-full bg-copper"
          key={`progress-${current}`}
          initial={{ width: '0%' }}
          animate={{ width: paused ? undefined : '100%' }}
          transition={{ duration: 6, ease: 'linear' }}
        />
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-10 left-6 sm:left-10 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        aria-hidden="true"
      >
        <div className="w-5 h-9 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2.5 rounded-full bg-copper" />
        </div>
      </motion.div>
    </section>
  );
}