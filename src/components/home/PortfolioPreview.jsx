import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

const featuredBooks = [
  { title: 'Prison Love', author: 'Tshidi Monkoe', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cb372f107_PrisonLove-TshidiMonkoe.jpg' },
  { title: 'Separation & Divorce', author: 'Hilton Chirambadare', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/55c986ac5_SeparationAndDivorce-HiltonChirambadare.jpg' },
  { title: 'A Provoked Mind', author: 'Thoriso Mokwena', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/3ed9cc572_AProvokedMind-ThorisoMokwena.jpg' },
  { title: 'I Wish What I Wrote Wasn\'t True', author: 'T.D Khoza Ka Phahla', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/7ed9a6d9a_IWishWhatIWroteWasntTrue-TDKhozaKaPhahla.jpg' },
  { title: 'Celebrating A Century Of Life Lessons', author: 'Henock Nthepeng Seloane', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/145cb89fc_CelebratingACenturyOfLifeLessons-HenockNthepengSeloane.jpg' },
  { title: 'Matters Of The Heart', author: 'Patience Sakutukwa', img: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/9dad4f29e_MattersOfTheHeart-PatienceSakutukwa.jpg' },
];

export default function PortfolioPreview() {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featuredBooks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const next = () => {
    setCurrent(prev => (prev + 1) % featuredBooks.length);
    setAutoPlay(false);
  };

  const prev = () => {
    setCurrent(prev => (prev - 1 + featuredBooks.length) % featuredBooks.length);
    setAutoPlay(false);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-obsidian flex flex-col items-center justify-center pt-0 md:pt-0">
      {/* Animated background elements */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.25) 0%, transparent 60%)', filter: 'blur(80px)' }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.15, 0.08], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.2) 0%, transparent 60%)', filter: 'blur(70px)' }}
      />

      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-copper/30"
          style={{ left: `${20 + i * 20}%`, top: `${15 + i * 25}%` }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}

      <div className="relative w-full flex flex-col items-center justify-center min-h-screen md:min-h-screen px-4 sm:px-6 py-16 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}
          >
            <Sparkles className="w-4 h-4 text-copper" />
            <span className="text-copper text-xs font-body tracking-widest uppercase">Portfolio Showcase</span>
          </motion.div>
          
          <h2 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight max-w-4xl">
            Books We've <span className="text-gradient-copper">Brought to Life</span>
          </h2>
          <p className="text-white/60 font-body text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Explore our collection of beautifully published works from South African authors.
          </p>
        </motion.div>

        {/* Main Carousel Container */}
        <div className="relative w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-6xl mx-auto z-10 flex-1 py-8 md:py-0">
          {/* Left Navigation Button */}
          <motion.button
            whileHover={{ scale: 1.15, background: 'rgba(184,115,51,0.3)' }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            onMouseEnter={() => setAutoPlay(false)}
            className="hidden sm:flex w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: 'rgba(184,115,51,0.15)', border: '1px solid rgba(184,115,51,0.3)', backdropFilter: 'blur(10px)' }}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-copper" />
          </motion.button>

          {/* Main Image Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full max-w-sm sm:max-w-md lg:max-w-2xl aspect-[3/4] overflow-hidden flex-shrink-0"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.95, rotateY: -20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateY: 20 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden"
                style={{ 
                  perspective: '1000px',
                  boxShadow: '0 30px 80px rgba(184,115,51,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <img
                  src={featuredBooks[current].img}
                  alt={featuredBooks[current].title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(184,115,51,0.15) 100%)' }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Info Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)' }}
            >
              <p className="font-heading text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 line-clamp-2">{featuredBooks[current].title}</p>
              <p className="text-copper font-body text-xs sm:text-sm md:text-base">{featuredBooks[current].author}</p>
            </motion.div>

            {/* Mobile Navigation Buttons - Overlay */}
            <div className="sm:hidden absolute inset-0 flex items-center justify-between px-2 z-20">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={prev}
                onTouchStart={() => setAutoPlay(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(184,115,51,0.2)', border: '1px solid rgba(184,115,51,0.3)' }}
              >
                <ChevronLeft className="w-5 h-5 text-copper" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={next}
                onTouchStart={() => setAutoPlay(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(184,115,51,0.2)', border: '1px solid rgba(184,115,51,0.3)' }}
              >
                <ChevronRight className="w-5 h-5 text-copper" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Navigation Button */}
          <motion.button
            whileHover={{ scale: 1.15, background: 'rgba(184,115,51,0.3)' }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            onMouseEnter={() => setAutoPlay(false)}
            className="hidden sm:flex w-12 h-12 md:w-16 md:h-16 rounded-full items-center justify-center transition-all flex-shrink-0"
            style={{ background: 'rgba(184,115,51,0.15)', border: '1px solid rgba(184,115,51,0.3)', backdropFilter: 'blur(10px)' }}
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-copper" />
          </motion.button>
        </div>

        {/* Dots Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2 sm:gap-3 my-8 md:my-12 flex-wrap px-4 z-10"
        >
          {featuredBooks.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setCurrent(i);
                setAutoPlay(false);
              }}
              whileHover={{ scale: 1.3 }}
              className="rounded-full transition-all"
              style={{
                width: current === i ? '28px' : '8px',
                height: '8px',
                background: current === i ? '#B87333' : 'rgba(184,115,51,0.3)',
              }}
              aria-label={`Go to book ${i + 1}`}
            />
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="relative z-10"
        >
          <Link
            to="/portfolio"
            className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 text-white font-semibold rounded-full transition-all text-sm sm:text-base md:text-lg"
            style={{
              background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
              boxShadow: '0 20px 50px rgba(184,115,51,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            View Full Portfolio
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}