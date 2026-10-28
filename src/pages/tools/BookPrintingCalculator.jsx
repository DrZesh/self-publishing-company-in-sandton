import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';
import QuoteFormSection from '../../components/shared/QuoteFormSection';

// Exact pricing data from Creative Books SA
const PRICING_TIERS = {
  a5: {
    cream78: {
      '50-100': 5500,
      '115-150': 6250,
      '160-200': 7500,
      '210-250': 8750,
      '260-300': 9600,
      '310-350': 11500,
      '360-400': 12500,
    },
    white80: {
      '50-100': 5200,
      '115-150': 5950,
      '160-200': 7200,
      '210-250': 8450,
      '260-300': 9300,
      '310-350': 11200,
      '360-400': 12200,
    },
  },
  '6x9': {
    cream78: {
      '50-100': 6200,
      '115-150': 6950,
      '160-200': 8200,
      '210-250': 9450,
      '260-300': 10300,
      '310-350': 12200,
      '360-400': 13200,
    },
    white80: {
      '50-100': 5900,
      '115-150': 6650,
      '160-200': 7900,
      '210-250': 9150,
      '260-300': 10000,
      '310-350': 11900,
      '360-400': 12900,
    },
  },
};

// Quantity multipliers (base price for 100 copies)
const QUANTITY_MULTIPLIERS = {
  100: 1,
  150: 1.45,
  200: 1.85,
  250: 2.25,
  300: 2.6,
  400: 3.3,
  500: 4.0,
  1000: 7.5,
};

function getPriceTier(pages) {
  if (pages >= 50 && pages <= 100) return '50-100';
  if (pages >= 115 && pages <= 150) return '115-150';
  if (pages >= 160 && pages <= 200) return '160-200';
  if (pages >= 210 && pages <= 250) return '210-250';
  if (pages >= 260 && pages <= 300) return '260-300';
  if (pages >= 310 && pages <= 350) return '310-350';
  if (pages >= 360 && pages <= 400) return '360-400';
  return null;
}

export default function BookPrintingCalculator() {
  const [size, setSize] = useState('a5');
  const [pages, setPages] = useState(200);
  const [words, setWords] = useState(50000);
  const [paperType, setPaperType] = useState('cream78');
  const [binding, setBinding] = useState('paperback');
  const [copies, setCopies] = useState(100);
  const [error, setError] = useState('');
  const [lengthError, setLengthError] = useState('');

  const handlePagesChange = useCallback((val) => {
    const num = Number(val);
    setPages(num);
    setWords(num * 250);
    if (num > 400 || num < 50) {
      setLengthError('For longer manuscripts, please request a custom quote.');
    } else {
      setLengthError('');
    }
  }, []);

  const handleWordsChange = useCallback((val) => {
    const num = Number(val);
    setWords(num);
    const derivedPages = Math.round(num / 250);
    setPages(derivedPages);
    if (num > 100000 || num < 12500) {
      setLengthError('For longer manuscripts, please request a custom quote.');
    } else {
      setLengthError('');
    }
  }, []);

  const paperLabels = {
    cream78: 'Cream Paper 78 gsm',
    white80: 'White Paper 80 gsm',
  };

  const calculation = useMemo(() => {
    setError('');

    // Validate pages
    if (pages < 50) {
      setError('Books under 50 pages require a custom quote.');
      return null;
    }
    if (pages > 400) {
      setError('Books over 400 pages require a custom quote.');
      return null;
    }

    // Check if children's book size
    if (['15x15', '20x20', '21x21'].includes(size)) {
      return { type: 'childrenBook', size };
    }

    // Check if hardcover
    if (binding === 'hardcover') {
      return { type: 'hardcover', size };
    }

    // Get pricing tier
    const tier = getPriceTier(pages);
    if (!tier) {
      setError('Page count outside standard pricing tiers.');
      return null;
    }

    // Get base price for 100 copies
    const basePrice = PRICING_TIERS[size]?.[paperType]?.[tier];
    if (!basePrice) {
      setError('Pricing not available for this combination.');
      return null;
    }

    // Apply quantity multiplier
    const multiplier = QUANTITY_MULTIPLIERS[copies] || 1;
    const totalPrice = Math.round(basePrice * multiplier);
    const perCopyPrice = Math.round(totalPrice / copies);

    return {
      type: 'standard',
      basePrice,
      totalPrice,
      perCopyPrice,
      multiplier,
      tier,
    };
  }, [size, pages, paperType, binding, copies]);

  return (
    <div>
      <PageMeta
        title="Book Printing Cost Calculator"
        description="Use the book printing cost calculator to estimate printing costs based on your book size, page count and printing requirements."
        description="Calculate the exact cost of printing your book in South Africa. Enter your page count, size, quantity, and binding type for an accurate estimate."
        keywords="book printing calculator South Africa, book printing cost, printing estimate, self-publishing costs"
        canonical="https://www.creativebookssa.co.za/bookprintingcalculator"
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <Calculator className="w-4 h-4 text-copper" />
              <span className="text-copper text-sm font-medium">Free Printing Calculator</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Book Printing Cost Calculator</h1>
            <p className="text-white/60 text-lg font-body mb-4">Calculate the cost of printing your book in South Africa. Prices below are based on our standard short-run printing rates for 100+ copies on cream 78 gsm or white paper, paperback perfect binding.</p>
            <p className="text-white/40 text-sm font-body">Need a different size, hardcover, full-colour, or larger print run? Request a custom quote.</p>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 lg:py-20 bg-vellum">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Inputs */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-6">
              <h2 className="font-heading text-2xl font-bold text-[#0F0F0F]">Calculate Your Print Cost</h2>
              <p className="text-[#0F0F0F]/60 font-body text-sm">Enter your book details to see an instant estimate.</p>

              {/* Book Size */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-3">Book Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'a5', label: 'A5 (148×210mm)' },
                    { value: '6x9', label: '6×9 inches (152.4×228.6mm)' },
                    { value: '15x15', label: '15×15cm (children\'s)' },
                    { value: '20x20', label: '20×20cm (children\'s)' },
                    { value: '21x21', label: '21×21cm (children\'s)' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSize(value)}
                      className={`p-3 rounded-lg text-sm font-body border transition-all text-left ${
                        size === value
                          ? 'border-copper bg-copper/10 text-copper'
                          : 'border-[#0F0F0F]/10 bg-white text-[#0F0F0F]/70 hover:border-copper/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Link to="/a5vs6x9bookprinting" className="text-copper text-xs mt-2 inline-block hover:underline">
                  Not sure which size? Read A5 vs 6×9 Book Printing →
                </Link>
              </div>

              {/* Page Count + Word Count — paired linked inputs */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-3">Book Length</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Pages */}
                  <div className="flex-1">
                    <label className="block text-xs text-[#0F0F0F]/50 mb-1">Pages</label>
                    <input
                      type="number"
                      min={50}
                      max={400}
                      value={pages}
                      onChange={(e) => handlePagesChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg text-[#0F0F0F] font-medium focus:outline-none focus:border-copper transition-colors bg-white"
                      style={{ borderColor: lengthError ? '#f87171' : '#e5e7eb' }}
                    />
                    <div className="text-xs text-[#0F0F0F]/40 mt-1">min 50 · max 400</div>
                  </div>

                  {/* Lock icon */}
                  <div className="flex items-center justify-center sm:mt-5">
                    <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-copper" />
                    </div>
                  </div>

                  {/* Words */}
                  <div className="flex-1">
                    <label className="block text-xs text-[#0F0F0F]/50 mb-1">Words</label>
                    <input
                      type="number"
                      min={12500}
                      max={100000}
                      step={250}
                      value={words}
                      onChange={(e) => handleWordsChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg text-[#0F0F0F] font-medium focus:outline-none focus:border-copper transition-colors bg-white"
                      style={{ borderColor: lengthError ? '#f87171' : '#e5e7eb' }}
                    />
                    <div className="text-xs text-[#0F0F0F]/40 mt-1">min 12,500 · max 100,000</div>
                  </div>
                </div>

                {lengthError && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-700">{lengthError}</span>
                    <Link to="/getquote" className="ml-auto text-xs text-copper font-semibold hover:underline whitespace-nowrap">Request Custom Quote →</Link>
                  </div>
                )}

                <p className="text-[#0F0F0F]/50 text-xs mt-3 font-body leading-relaxed">
                  Most novels are 60,000–90,000 words (240–360 pages). Most memoirs are 50,000–80,000 words. Enter whichever number you know — we'll auto-calculate the other.
                </p>
              </div>

              {/* Paper Type */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-3">Paper Type</label>
                <div className="space-y-2">
                  {[
                    { value: 'cream78', label: 'Cream Paper 78 gsm (standard for novels and memoirs, thicker and softer)' },
                    { value: 'white80', label: 'White Paper 80 gsm (standard for non-fiction and textbooks, premium white)' },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-copper/5 transition-all" style={{ borderColor: paperType === value ? '#B87333' : '#0F0F0F10' }}>
                      <input
                        type="radio"
                        name="paper"
                        value={value}
                        checked={paperType === value}
                        onChange={(e) => setPaperType(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[#0F0F0F]/80 font-body">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Binding Type */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-3">Binding Type</label>
                <div className="space-y-2">
                  {[
                    { value: 'paperback', label: 'Paperback (perfect bound)' },
                    { value: 'hardcover', label: 'Hardcover (case bound — requires quote)' },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-copper/5 transition-all" style={{ borderColor: binding === value ? '#B87333' : '#0F0F0F10' }}>
                      <input
                        type="radio"
                        name="binding"
                        value={value}
                        checked={binding === value}
                        onChange={(e) => setBinding(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[#0F0F0F]/80 font-body">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Number of Copies */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-3">Number of Copies</label>
                <select
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="w-full p-3 border border-[#0F0F0F]/10 rounded-lg text-[#0F0F0F]/80 font-body bg-white focus:border-copper focus:outline-none"
                >
                  {Object.keys(QUANTITY_MULTIPLIERS).map((qty) => (
                    <option key={qty} value={qty}>
                      {qty} copies
                    </option>
                  ))}
                </select>
                <p className="text-[#0F0F0F]/60 text-xs mt-2 font-body">
                  Minimum order is 100 copies. Larger orders reduce per-copy cost. For fewer than 100 copies, see our Mini Packages.
                </p>
              </div>
            </motion.div>

            {/* Right Column - Live Result Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-20 lg:h-fit"
            >
              <div className="p-8 rounded-2xl bg-white border-2 border-copper/20" style={{ boxShadow: '0 10px 40px rgba(184,115,51,0.1)' }}>
                <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-6">Your Estimate</h3>

                {error ? (
                  <div className="space-y-4">
                    <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                    <Link
                      to="/getquote"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
                    >
                      Request a Custom Quote
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : calculation?.type === 'childrenBook' ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-900">
                        Children's book printing is quoted individually based on size, page count, and full-colour requirements.
                      </p>
                    </div>
                    <Link
                      to="/getquote"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
                    >
                      Request a Custom Quote
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : calculation?.type === 'hardcover' ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-900">
                        Hardcover printing is quoted individually based on your specifications.
                      </p>
                    </div>
                    <Link
                      to="/getquote"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
                    >
                      Request a Custom Quote
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : calculation?.type === 'standard' ? (
                  <div className="space-y-4">
                    {/* Total Price */}
                    <div>
                      <p className="text-[#0F0F0F]/60 text-xs font-body mb-1">Estimated print cost</p>
                      <p className="font-heading text-4xl font-bold text-copper">R{calculation.totalPrice.toLocaleString()}</p>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 pt-4 border-t border-[#0F0F0F]/10">
                      {[
                        ['Book size', size === 'a5' ? 'A5' : '6×9'],
                        ['Page count', `${pages} pages (≈${words.toLocaleString()} words)`],
                        ['Paper', paperLabels[paperType]],
                        ['Binding', 'Paperback'],
                        ['Copies', `${copies}`],
                        ['Per copy', `R${calculation.perCopyPrice.toLocaleString()}`],
                      ].map(([key, val]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-[#0F0F0F]/60 font-body">{key}</span>
                          <span className="text-[#0F0F0F] font-medium font-body">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* What's Included */}
                    <div className="pt-4 border-t border-[#0F0F0F]/10 space-y-1">
                      <p className="text-xs font-semibold text-[#0F0F0F] mb-2">What's included:</p>
                      {[
                        'Gloss or matte cover finish',
                        'Perfect binding',
                        'Black and white interior pages',
                        paperLabels[paperType],
                        'Nationwide delivery available',
                      ].map((item) => (
                        <p key={item} className="text-xs text-[#0F0F0F]/70 font-body">✓ {item}</p>
                      ))}
                    </div>

                    {/* Disclaimer */}
                    <div className="pt-4 border-t border-[#0F0F0F]/10">
                      <p className="text-[#0F0F0F]/50 text-xs font-body mb-4">
                        Final pricing for orders above 100 copies will be confirmed in your formal quote. Larger orders qualify for better per-copy rates — request a custom quote for the exact figure.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Link
                        to="/getquote"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
                      >
                        Get a Custom Quote
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href={`mailto:info@creativebookssa.co.za?subject=Print Order: ${size.toUpperCase()} ${pages}p ${paperType === 'cream78' ? 'Cream' : 'White'} ${copies} copies - R${calculation.totalPrice}&body=Hi Creative Books SA,%0D%0A%0D%0AI'd like to order the following print run as-is:%0D%0A%0D%0AESTIMATE FROM CALCULATOR:%0D%0A- Book size: ${size === 'a5' ? 'A5' : '6x9'}%0D%0A- Page count: ${pages}%0D%0A- Paper type: ${paperLabels[paperType]}%0D%0A- Binding: Paperback%0D%0A- Number of copies: ${copies}%0D%0A- Estimated total: R${calculation.totalPrice.toLocaleString()}%0D%0A- Per copy: R${calculation.perCopyPrice.toLocaleString()}%0D%0A%0D%0A---%0D%0AMY DETAILS:%0D%0AName: %0D%0APhone: %0D%0ABook title: %0D%0AIs your book typeset and print-ready? (Yes/No): %0D%0AAny notes: %0D%0A%0D%0AThank you,`}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-copper text-copper font-medium rounded-full hover:bg-copper/5 transition-all"
                      >
                        Order This Print Run
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Why is the minimum 100 copies?', a: 'Short-run printing economics favor 100+ copy orders. Smaller quantities have higher per-copy costs due to setup fees. For fewer than 100 copies, we offer Mini Packages with 5 copies included.' },
              { q: 'Can I print fewer than 100 copies?', a: 'Yes. Check our Mini Packages which include 5 free copies. Visit our Mini Publishing Package page for details.' },
              { q: 'Do you print in colour?', a: 'Yes, we offer full-colour interior printing. Contact us for a custom quote.' },
              { q: 'Do you print hardcover books?', a: 'Yes. Hardcover printing is custom quoted based on your specifications. Request a quote to discuss options.' },
              { q: 'Do you print children\'s books?', a: 'Yes. We print children\'s books in standard sizes (15×15, 20×20, 21×21 cm). Hardcover and full-colour options are available with custom quotes.' },
              { q: 'How long does printing take?', a: 'Typical turnaround is 2-3 weeks from print-ready file approval.' },
              { q: 'Do you deliver outside Johannesburg?', a: 'Yes, nationwide delivery available across South Africa.' },
            ].map((faq, i) => (
              <details key={i} className="group border border-[#0F0F0F]/10 rounded-lg p-4 hover:border-copper/40 transition-all">
                <summary className="flex items-center justify-between cursor-pointer font-medium text-[#0F0F0F]">
                  {faq.q}
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-[#0F0F0F]/70 font-body text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Quote Form */}
      <QuoteFormSection
        title="Quick Book Printing Quote"
        description="Use the form below to request a quote for your specific book printing project."
        services={[
          { value: 'a5-printing', label: 'A5 Book Printing' },
          { value: '6x9-printing', label: '6×9 Book Printing' },
          { value: 'hardcover-printing', label: 'Hardcover Printing' },
          { value: 'childrens-printing', label: "Children's Book Printing" },
          { value: 'cream-paper', label: 'Cream Paper (78 gsm)' },
          { value: 'white-paper', label: 'White Paper (80 gsm)' },
        ]}
      />

      <InternalLinks
        links={[
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: '6×9 Book Printing', path: '/printing/6x9' },
          { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
          { label: 'A5 vs 6×9', path: '/a5vs6x9bookprinting' },
          { label: 'Children\'s Books', path: '/printing/childrensbooks' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        light
      />
      <CTASection
        title="Need Something Custom?"
        description="Different size, hardcover, full-colour, or larger quantity? Our team will send you a precise quote within 24 hours."
      />
    </div>
  );
}