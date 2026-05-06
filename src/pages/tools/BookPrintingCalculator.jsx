import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, BookOpen, Layers } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const RATES = {
  a5: { bw: { 50: 82, 100: 62, 200: 48, 500: 38 }, colour: { 50: 180, 100: 140, 200: 110, 500: 85 } },
  '6x9': { bw: { 50: 90, 100: 68, 200: 52, 500: 42 }, colour: { 50: 195, 100: 150, 200: 118, 500: 92 } },
  a4: { bw: { 50: 105, 100: 80, 200: 62, 500: 50 }, colour: { 50: 240, 100: 185, 200: 145, 500: 115 } },
  square20: { bw: { 50: 120, 100: 90, 200: 70, 500: 55 }, colour: { 50: 220, 100: 165, 200: 130, 500: 100 } },
};

const HARDCOVER_PREMIUM = 55;
const SPINE_WORDS_PER_PAGE = { a5: 260, '6x9': 295, a4: 400, square20: 220 };

function closestQty(qty) {
  if (qty <= 50) return 50;
  if (qty <= 100) return 100;
  if (qty <= 200) return 200;
  return 500;
}

export default function BookPrintingCalculator() {
  const [size, setSize] = useState('a5');
  const [pages, setPages] = useState(200);
  const [qty, setQty] = useState(100);
  const [colour, setColour] = useState('bw');
  const [binding, setBinding] = useState('softcover');

  const estimate = useMemo(() => {
    const qKey = closestQty(qty);
    const base = RATES[size]?.[colour]?.[qKey] ?? 60;
    const pageFactor = 1 + Math.max(0, (pages - 200) / 200) * 0.35;
    let perCopy = base * pageFactor;
    if (binding === 'hardcover') perCopy += HARDCOVER_PREMIUM;
    const total = Math.round(perCopy * qty);
    return { perCopy: Math.round(perCopy), total };
  }, [size, pages, qty, colour, binding]);

  const spineWidth = useMemo(() => {
    const ppp = SPINE_WORDS_PER_PAGE[size] || 260;
    return ((pages / ppp) * 2.5).toFixed(1);
  }, [pages, size]);

  return (
    <div>
      <PageMeta
        title="Book Printing Cost Calculator South Africa | Instant Estimate | Creative Books SA"
        description="Instantly estimate your book printing cost in South Africa. Enter your page count, size, quantity, and binding type for an instant quote estimate."
        keywords="book printing calculator South Africa, book printing cost estimator, book printing price calculator, how much to print a book"
        canonical="https://www.creativebookssa.co.za/bookprintingcalculator"
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <Calculator className="w-4 h-4 text-copper" />
              <span className="text-copper text-sm font-medium">Free Printing Estimator</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Book Printing Cost Calculator</h1>
            <p className="text-white/60 text-lg font-body mb-2">Get an instant estimate for your book printing project. Fill in your specs below.</p>
            <p className="text-white/40 text-sm font-body">Note: This is an estimate only. Contact us for a precise quote.</p>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 lg:py-20 bg-vellum">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#0F0F0F]">Your Book Specs</h2>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Book Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['a5', 'A5 (148×210mm)'], ['6x9', '6×9 Inch'], ['a4', 'A4 (210×297mm)'], ['square20', '20×20cm Square']].map(([k, label]) => (
                    <button key={k} onClick={() => setSize(k)}
                      className={`p-3 rounded-xl text-sm font-body border transition-all text-left ${size === k ? 'border-copper bg-copper/10 text-copper' : 'border-[#0F0F0F]/10 bg-white text-[#0F0F0F]/70 hover:border-copper/40'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Page Count: <span className="text-copper font-semibold">{pages} pages</span></label>
                <input type="range" min={48} max={600} step={8} value={pages} onChange={e => setPages(Number(e.target.value))}
                  className="w-full accent-[#B87333]" />
                <div className="flex justify-between text-xs text-[#0F0F0F]/40 mt-1"><span>48pp</span><span>600pp</span></div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Quantity: <span className="text-copper font-semibold">{qty} copies</span></label>
                <input type="range" min={50} max={500} step={50} value={qty} onChange={e => setQty(Number(e.target.value))}
                  className="w-full accent-[#B87333]" />
                <div className="flex justify-between text-xs text-[#0F0F0F]/40 mt-1"><span>50</span><span>500+</span></div>
              </div>

              {/* Interior */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Interior Printing</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['bw', 'Black & White'], ['colour', 'Full Colour']].map(([k, label]) => (
                    <button key={k} onClick={() => setColour(k)}
                      className={`p-3 rounded-xl text-sm font-body border transition-all ${colour === k ? 'border-copper bg-copper/10 text-copper' : 'border-[#0F0F0F]/10 bg-white text-[#0F0F0F]/70 hover:border-copper/40'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Binding */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Binding Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['softcover', 'Softcover (Perfect Binding)'], ['hardcover', 'Hardcover (Case Binding)']].map(([k, label]) => (
                    <button key={k} onClick={() => setBinding(k)}
                      className={`p-3 rounded-xl text-sm font-body border transition-all text-left ${binding === k ? 'border-copper bg-copper/10 text-copper' : 'border-[#0F0F0F]/10 bg-white text-[#0F0F0F]/70 hover:border-copper/40'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#0F0F0F]">Your Estimate</h2>

              {/* Main estimate card */}
              <div className="p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)', boxShadow: '0 20px 50px rgba(184,115,51,0.3)' }}>
                <p className="text-white/70 text-sm mb-2">Estimated cost per copy</p>
                <p className="font-heading text-5xl font-bold text-white mb-1">R{estimate.perCopy.toLocaleString()}</p>
                <p className="text-white/60 text-sm">per copy</p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-white/70 text-sm mb-1">Total estimated cost ({qty} copies)</p>
                  <p className="font-heading text-3xl font-bold text-white">R{estimate.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Spine calculator */}
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(184,115,51,0.15)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-copper" />
                  <span className="font-heading font-semibold text-[#0F0F0F]">Estimated Spine Width</span>
                </div>
                <p className="font-heading text-3xl font-bold text-copper">{spineWidth}mm</p>
                <p className="text-[#0F0F0F]/50 text-xs mt-1">Based on {pages} pages in {size.toUpperCase()} on 80gsm paper</p>
              </div>

              {/* Spec summary */}
              <div className="p-6 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(184,115,51,0.15)' }}>
                <h3 className="font-heading font-semibold text-[#0F0F0F]">Your Specs Summary</h3>
                {[
                  ['Size', size === 'a5' ? 'A5 (148×210mm)' : size === '6x9' ? '6×9 Inch' : size === 'a4' ? 'A4' : '20×20cm Square'],
                  ['Pages', `${pages} pages`],
                  ['Quantity', `${qty} copies`],
                  ['Interior', colour === 'bw' ? 'Black & White' : 'Full Colour'],
                  ['Binding', binding === 'softcover' ? 'Softcover' : 'Hardcover'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[#0F0F0F]/50 font-body">{k}</span>
                    <span className="text-[#0F0F0F] font-medium font-body">{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-[#0F0F0F]/50 text-xs font-body">* Estimates are indicative. Actual costs may vary based on final specifications, paper choice, and current material costs. Contact us for an accurate quote.</p>
                <Link to="/getquote" className="group flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#0F0F0F] text-white font-medium rounded-full hover:bg-copper transition-all">
                  Get an Accurate Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'A5 Book Printing', path: '/printing/a5' },
        { label: '6×9 Book Printing', path: '/printing/6x9' },
        { label: 'Hardcover Printing', path: '/printing/hardcover' },
        { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
        { label: 'A5 vs 6×9', path: '/a5vs6x9bookprinting' },
        { label: 'Hardcover vs Paperback', path: '/hardcovervspaperbackprinting' },
        { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
        { label: 'Get a Quote', path: '/getquote' },
      ]} light />
      <CTASection title="Ready for an Accurate Quote?" description="Our team will send you a precise, itemised printing quote within 24 hours — tailored to your exact specs." />
    </div>
  );
}