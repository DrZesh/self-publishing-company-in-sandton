import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Pen, Ruler, FileDown, RotateCcw, ArrowRight, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import PageMeta from '@/components/shared/PageMeta';
import {
  TRIM_SIZES, PAPER_TYPES, BINDING_TYPES, COVER_FINISHES, BLEED_OPTIONS,
  calcDimensions, specCode, fmt, unitLabel,
} from '@/lib/coverTemplate';
import { generateCoverPdf } from '@/lib/coverTemplatePdf';
import CoverDimensionsTable from '@/components/cover/CoverDimensionsTable';
import CoverTemplateVisual from '@/components/cover/CoverTemplateVisual';

const READING_DIRECTIONS = [
  { value: 'ltr', label: 'Left to Right' },
  { value: 'rtl', label: 'Right to Left' },
];

const selectCls = 'flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ffc72c]';
const labelCls = 'text-xs font-medium text-gray-700';

export default function CoverSizeCalculator() {
  const [unit, setUnit] = useState('mm');
  const [mode, setMode] = useState('author'); // author | designer
  const [trimVal, setTrimVal] = useState('6x9');
  const [paper, setPaper] = useState('cream78');
  const [pages, setPages] = useState(200);
  const [binding, setBinding] = useState('perfect');
  const [finish, setFinish] = useState('paperback');
  const [direction, setDirection] = useState('ltr');
  const [bleed, setBleed] = useState(3.175);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const trim = useMemo(() => TRIM_SIZES.find((t) => t.value === trimVal) || TRIM_SIZES[0], [trimVal]);
  const dims = useMemo(
    () => calcDimensions({ trim, pages: Number(pages), paper, binding, bleed, finish }),
    [trim, pages, paper, binding, bleed, finish]
  );
  const code = specCode(dims);

  const handleDownload = () => {
    if (!dims) return;
    generateCoverPdf(dims, { trimLabel: trim.label, trimValue: trim.value, pages });
  };

  const handleEmail = (e) => {
    e.preventDefault();
    if (!email) return;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const reset = () => {
    setTrimVal('6x9'); setPaper('cream78'); setPages(200);
    setBinding('perfect'); setFinish('paperback'); setDirection('ltr'); setBleed(3.175);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-body">
      <PageMeta
        title="Book Cover Template & Dimensions Calculator | Creative Books"
        description="Calculate exact book cover dimensions and download a print-ready template. Set trim size, page count, paper, and binding to get spine width, bleed, safe area and full cover size."
        keywords="book cover template calculator, cover dimensions calculator, spine width calculator, print ready cover template south africa"
        canonical="https://creativebooks.co.za/covercalculator"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Resources</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Book Cover Size Calculator</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Calculate exact cover dimensions and download a print-ready template — set your trim size, page count, paper and binding.
            </p>
          </div>
        </div>
      </section>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-gray-900 leading-tight">Book Cover Design &amp; Print</p>
              <p className="text-xs text-gray-500">Cover template &amp; dimensions calculator</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Unit toggle */}
              <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                {['mm', 'cm', 'inches'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${unit === u ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >{u}</button>
                ))}
              </div>
              {/* Mode toggle */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full">
                <button
                  onClick={() => setMode('author')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'author' ? 'bg-[#ffc72c] text-black' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Pen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Author Mode</span>
                  <span className="sm:hidden">Author</span>
                </button>
                <button
                  onClick={() => setMode('designer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'designer' ? 'bg-[#ffc72c] text-black' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Designer Mode</span>
                  <span className="sm:hidden">Designer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Enter Your Book Information</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>1. Trim size</label>
                  <select value={trimVal} onChange={(e) => setTrimVal(e.target.value)} className={selectCls}>
                    {TRIM_SIZES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>2. Interior paper type</label>
                  <select value={paper} onChange={(e) => setPaper(e.target.value)} className={selectCls}>
                    {PAPER_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>3. Page count</label>
                  <input
                    type="number" min={8} max={800} value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="Number of pages at your formatted trim size"
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ffc72c]"
                  />
                  <p className="text-[11px] text-gray-400">
                    {dims ? `${dims.bindingLabel}: ${dims.minPages}–${dims.maxPages} pages` : 'Perfect Bound: 24–800 pages'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>4. Binding type</label>
                  <select value={binding} onChange={(e) => setBinding(e.target.value)} className={selectCls}>
                    {BINDING_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>5. Cover finish</label>
                  <select value={finish} onChange={(e) => setFinish(e.target.value)} className={selectCls}>
                    {COVER_FINISHES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>6. Reading direction</label>
                  <select value={direction} onChange={(e) => setDirection(e.target.value)} className={selectCls}>
                    {READING_DIRECTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2 w-full h-10 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm rounded shadow-sm font-medium"
                  >
                    <FileDown className="w-4 h-4" /> Download Template
                  </button>
                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 w-full h-9 text-gray-500 hover:text-gray-800 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset book information
                  </button>
                </div>

                {/* Designer advanced settings */}
                {mode === 'designer' && (
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <p className="text-xs font-semibold text-gray-700">Designer mode (advanced settings)</p>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Bleed setting</label>
                      <select value={bleed} onChange={(e) => setBleed(Number(e.target.value))} className={selectCls}>
                        {BLEED_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Lead capture */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <form onSubmit={handleEmail} className="space-y-2">
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email My Specs to Myself"
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ffc72c]"
                    />
                    {emailSent && <p className="text-[11px] text-green-600">Your cover specs have been noted — we'll be in touch.</p>}
                  </form>
                  <Link
                    to="/getquote"
                    className="inline-flex items-center justify-center gap-2 w-full h-10 bg-[#1a1a1a] hover:bg-black text-white text-sm rounded font-medium"
                  >
                    Request a Cover Design <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Results + Visual */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Cover Dimensions &amp; Template</h2>
                <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-blue-50 text-blue-600">{code}</span>
              </div>
              <div className="p-5">
                {dims?.outOfRange && (
                  <div className="flex gap-2 p-3 mb-4 rounded-md bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Your page count is outside the {dims.minPages}–{dims.maxPages} range for {dims.bindingLabel}. Contact us for a custom quote.
                    </p>
                  </div>
                )}
                {dims?.warnThinSpine && (
                  <div className="flex gap-2 p-3 mb-4 rounded-md bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Spine is too thin for visible text. Leave the spine blank or use very small type.</p>
                  </div>
                )}
                <CoverDimensionsTable dims={dims} unit={unit} />

                {dims && (
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Full cover: </span>
                      <span className="font-semibold text-gray-900">{fmt(dims.fullWidth, unit)} × {fmt(dims.fullHeight, unit)} {unitLabel(unit)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Spine: </span>
                      <span className="font-semibold text-gray-900">{fmt(dims.spine, unit)} {unitLabel(unit)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live cover visual */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <CoverTemplateVisual dims={dims} unit={unit} />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffc72c] hover:bg-[#e8b422] text-black text-sm font-semibold rounded"
                >
                  <FileDown className="w-4 h-4" /> Download Template
                </button>
                <Link
                  to="/book-cover-design"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm rounded"
                >
                  <ShieldCheck className="w-4 h-4" /> Preflight Check My Cover File
                </Link>
                <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-blue-50 text-blue-600">{code}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Key Terms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                {[
                  ['Full Cover', 'Total artboard including back, spine, front, wraparound and bleed.'],
                  ['Bleed', 'Extra area beyond the trim that gets cut off — extend backgrounds into it.'],
                  ['Safe Area', 'Keep text and logos inside this zone so nothing is trimmed.'],
                  ['Spine', 'Bound edge width — depends on page count and paper thickness.'],
                  ['Margin', 'Distance from the trim edge to the safe area.'],
                  ['Barcode Margin', 'Reserved clear space on the back cover for the ISBN barcode.'],
                ].map(([t, d]) => (
                  <div key={t} className="flex gap-2">
                    <Mail className="hidden" />
                    <span className="font-semibold text-gray-700 whitespace-nowrap">{t}:</span>
                    <span className="text-gray-500">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}