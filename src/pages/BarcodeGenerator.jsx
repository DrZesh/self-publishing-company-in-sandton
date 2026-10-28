import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Barcode, Download, Loader2 } from 'lucide-react';
import PageMeta from '@/components/shared/PageMeta';
import { processISBN } from '@/lib/isbnUtils';
import BarcodePreview from '@/components/barcode/BarcodePreview';
import StatusMessage from '@/components/barcode/StatusMessage';
import BulkMode from '@/components/barcode/BulkMode';
import { downloadBarcode } from '@/components/barcode/DownloadHandler';

const FORMATS = ['PNG', 'JPG', 'WebP', 'SVG', 'EPS', 'PDF'];
const SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' },
];
const DPI_OPTIONS = [
  { value: '150', label: '150 DPI' },
  { value: '300', label: '300 DPI' },
  { value: '600', label: '600 DPI' },
  { value: '1200', label: '1200 DPI (Ultra HD)' },
];

export default function BarcodeGenerator() {
  const [mode, setMode] = useState('single');
  const [isbnInput, setIsbnInput] = useState('');
  const [format, setFormat] = useState('PNG');
  const [size, setSize] = useState('standard');
  const [dpi, setDpi] = useState('300');
  const [background, setBackground] = useState('white');
  const [downloading, setDownloading] = useState(false);

  const result = useMemo(() => (isbnInput.trim() ? processISBN(isbnInput) : null), [isbnInput]);
  const transparentBg = background === 'transparent';

  const statusType = !result ? null : !result.valid ? 'error' : result.message.startsWith('Corrected') ? 'warning' : 'success';

  const handleDownload = () => {
    if (!result?.valid) return;
    setDownloading(true);
    downloadBarcode(result.isbn13, result.displayISBN, format, {
      size,
      dpi: parseInt(dpi),
      transparentBg,
    });
    setTimeout(() => setDownloading(false), 600);
  };

  const fieldStyle = {
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(180,130,70,0.2)',
    color: '#3a2a10',
  };

  return (
    <div>
      <PageMeta
        title="Free Online Barcode Generator: Create Barcodes for Free!"
        description="This free online barcode generator creates all ISBN barcodes."
        keywords="isbn barcode generator, ean-13 barcode, book barcode, free isbn barcode, print ready barcode south africa"
        canonical="https://creativebooks.co.za/barcode-generator"
      />

      {/* Hero / Banner */}
      <section className="relative pt-32 pb-20 bg-obsidian overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #B87333 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-copper text-sm font-body tracking-[0.25em] uppercase mb-4">
              <Barcode className="w-4 h-4" /> Resources
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">ISBN Barcode Generator</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Turn any ISBN-10 or ISBN-13 into a print-ready EAN-13 barcode. Download in the format your printer needs — free.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tool */}
      <section className="py-20 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,250,240,0.9) 0%, rgba(250,240,225,0.85) 100%)',
              border: '1px solid rgba(180,130,70,0.2)',
              boxShadow: '0 24px 48px rgba(120,80,30,0.12)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Mode tabs */}
            <div className="flex items-center gap-1 p-1 rounded-full mb-8 w-fit mx-auto" style={{ background: 'rgba(180,130,70,0.1)' }}>
              {['single', 'bulk'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize"
                  style={mode === m
                    ? { background: 'linear-gradient(135deg, #7c5a2a 0%, #a07840 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(120,80,30,0.3)' }
                    : { color: 'rgba(120,80,30,0.6)' }}
                >
                  {m === 'single' ? 'Single ISBN' : 'Bulk'}
                </button>
              ))}
            </div>

            {mode === 'single' ? (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-2 block">ISBN Number</label>
                  <input
                    value={isbnInput}
                    onChange={(e) => setIsbnInput(e.target.value)}
                    placeholder="978-0-06-112008-4"
                    className="w-full text-lg font-mono rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                    style={fieldStyle}
                  />
                  <AnimatePresence>
                    {result && (
                      <div className="mt-3">
                        <StatusMessage message={result.message} type={statusType} />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">Format</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                      {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">Size</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                      {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">DPI</label>
                    <select value={dpi} onChange={(e) => setDpi(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                      {DPI_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">Background</label>
                    <select value={background} onChange={(e) => setBackground(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                      <option value="white">White</option>
                      <option value="transparent">Transparent</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(180,130,70,0.15)' }}>
                  <BarcodePreview
                    isbn13={result?.valid ? result.isbn13 : null}
                    displayISBN={result?.displayISBN}
                    size={size}
                    transparentBg={transparentBg}
                  />
                </div>

                {/* Download */}
                <motion.button
                  whileHover={{ scale: result?.valid ? 1.01 : 1 }}
                  whileTap={{ scale: result?.valid ? 0.98 : 1 }}
                  onClick={handleDownload}
                  disabled={!result?.valid || downloading}
                  className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: result?.valid ? 'linear-gradient(135deg, #7c5a2a 0%, #a07840 100%)' : 'rgba(180,160,140,0.3)',
                    color: result?.valid ? '#fff' : 'rgba(120,100,80,0.4)',
                    borderRadius: '10px',
                    boxShadow: result?.valid ? '0 4px 14px rgba(120,80,30,0.3)' : 'none',
                    border: 'none',
                    cursor: result?.valid && !downloading ? 'pointer' : 'not-allowed',
                  }}
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {downloading ? 'Preparing…' : `Download as ${format}`}
                </motion.button>
              </div>
            ) : (
              <BulkMode format={format} size={size} dpi={dpi} transparentBg={background} />
            )}

            {mode === 'bulk' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid rgba(180,130,70,0.15)' }}>
                <div>
                  <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                    {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">Size</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                    {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">DPI</label>
                  <select value={dpi} onChange={(e) => setDpi(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                    {DPI_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-1.5 block">Background</label>
                  <select value={background} onChange={(e) => setBackground(e.target.value)} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={fieldStyle}>
                    <option value="white">White</option>
                    <option value="transparent">Transparent</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-[#0F0F0F]/50 font-body mt-6">
            Accepts ISBN-10 and ISBN-13. Barcodes follow the EAN-13 standard used by printers and retailers worldwide.
          </p>
        </div>
      </section>
    </div>
  );
}