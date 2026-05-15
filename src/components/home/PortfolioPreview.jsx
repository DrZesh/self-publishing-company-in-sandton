import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// Featured books from portfolio
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
    }, 4000);
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
    <section className="relative py-20 overflow-hidden bg-obsidian">
      {/* Background gradient */}
      <motion.div
        animate={{ opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.3) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Portfolio Preview</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Books We've Worked On
          </h2>
          <p className="text-white/60 font-body max-w-2xl mx-auto">
            Explore hundreds of published books from South African authors we've helped bring to life.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative flex items-center gap-6 max-w-5xl mx-auto">
          {/* Left Arrow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prev}
            onMouseEnter={() => setAutoPlay(false)}
            className="absolute -left-6 sm:left-0 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(184,115,51,0.2)', border: '1px solid rgba(184,115,51,0.3)' }}
          >
            <ChevronLeft className="w-5 h-5 text-copper" />
          </motion.button>

          {/* Main Carousel */}
          <div className="flex-1 relative overflow-hidden rounded-2xl" style={{ aspectRatio: '3/4', maxWidth: '300px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <img
                  src={featuredBooks[current].img}
                  alt={featuredBooks[current].title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Info at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-0 left-0 right-0 p-4 text-white"
            >
              <p className="font-heading text-sm font-semibold mb-1">{featuredBooks[current].title}</p>
              <p className="text-copper text-xs font-body">{featuredBooks[current].author}</p>
            </motion.div>
          </div>

          {/* Right Arrow */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            onMouseEnter={() => setAutoPlay(false)}
            className="absolute -right-6 sm:right-0 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(184,115,51,0.2)', border: '1px solid rgba(184,115,51,0.3)' }}
          >
            <ChevronRight className="w-5 h-5 text-copper" />
          </motion.button>

          {/* Thumbnails */}
          <div className="hidden lg:flex flex-col gap-2">
            {featuredBooks.map((book, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setCurrent(i);
                  setAutoPlay(false);
                }}
                whileHover={{ scale: 1.05 }}
                className="relative w-16 h-24 rounded-lg overflow-hidden border-2 transition-all"
                style={{ borderColor: current === i ? '#B87333' : 'rgba(184,115,51,0.2)' }}
              >
                <img
                  src={book.img}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8 lg:hidden">
          {featuredBooks.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setCurrent(i);
                setAutoPlay(false);
              }}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: current === i ? '#B87333' : 'rgba(184,115,51,0.3)' }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all group"
            style={{ background: '#B87333', boxShadow: '0 8px 24px rgba(184,115,51,0.3)' }}
          >
            View Full Portfolio
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}