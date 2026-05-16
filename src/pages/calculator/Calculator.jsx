import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CalcHeader from '../../components/calculator/CalcHeader';
import CalcPresets from '../../components/calculator/CalcPresets';
import BookBasics from '../../components/calculator/BookBasics';
import ServiceModules from '../../components/calculator/ServiceModules';
import EstimateSidebar from '../../components/calculator/EstimateSidebar';
import MobileEstimateBar from '../../components/calculator/MobileEstimateBar';
import PreviewPhase from '../../components/calculator/PreviewPhase';
import LeadModal from '../../components/calculator/LeadModal';
import SuccessState from '../../components/calculator/SuccessState';
import { PACKAGES, PACKAGE_UPGRADES, getPrintingPrice, TYPESETTING, COVER_DESIGN, formatZAR } from '../../lib/calculator-pricing';

const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';
const LS_KEY = 'cbsa_calculator_state';

const DEFAULT_BOOK = {
  bookType: 'adult_fiction',
  size: 'a5',
  pages: 200,
  words: 50000,
  genre: '',
};

const DEFAULT_SERVICES = {
  package: { on: false, key: null },
  cover:   { on: false, tier: 'stock', variant: 'paperback' },
  typeset: { on: false, tier: 'basic' },
  print:   { on: false, copies: 100, paperType: 'cream' },
  ebook:   { on: false },
  editing: { on: false },
  custom:  [], // [{id, label, note}]
};

function buildBreakdown(book, services, inclVat) {
  const lines = [];
  const pkg = services.package;
  const included = new Set();

  if (pkg.on && pkg.key) {
    const p = PACKAGES[pkg.key];
    lines.push({ id: 'package', label: p.label, sub: `${p.copies > 0 ? p.copies + ' copies, ' : ''}${p.size !== 'any' ? p.size.toUpperCase() + ', ' : ''}up to ${p.maxPages} pages`, amount: p.price, removable: true });
    included.add('cover'); included.add('typeset'); included.add('editing');
    if (p.copies > 0) included.add('print');
    if (['a5_gold','6x9_gold','plus'].includes(pkg.key)) included.add('ebook');
  }

  if (services.cover.on && !included.has('cover')) {
    const price = COVER_DESIGN[services.cover.variant]?.[services.cover.tier] || 0;
    const tierLabels = { authors: "Author's Book Cover", stock: 'Stock Design Cover', illustrated: 'Illustrated Cover' };
    const variantLabels = { paperback: 'Paperback', ebook: 'Ebook Cover' };
    lines.push({ id: 'cover', label: 'Cover Design', sub: `${tierLabels[services.cover.tier]} — ${variantLabels[services.cover.variant]}`, amount: price, removable: true });
  }

  if (services.typeset.on && !included.has('typeset') && book.pages > 0) {
    const rate = TYPESETTING[services.typeset.tier] || TYPESETTING.basic;
    const amount = Math.round(book.pages * rate);
    const tierLabels = { basic: 'Basic Layout', standard: 'Standard Layout', premium: 'Premium Layout' };
    lines.push({ id: 'typeset', label: 'Typesetting', sub: `${tierLabels[services.typeset.tier]} — ${book.pages} pages × R${rate}/page`, amount, removable: true });
  }

  if (services.print.on && !included.has('print')) {
    const result = getPrintingPrice(book.size === '6x9' ? '6x9' : 'a5', book.pages, services.print.copies);
    if (result) {
      lines.push({ id: 'print', label: 'Book Printing', sub: `${services.print.copies} copies, ${book.size.toUpperCase()}, ${book.pages} pages, ${services.print.paperType === 'cream' ? 'cream paper' : 'white paper'}`, amount: result.total, perCopy: result.perCopy, removable: true });
    } else {
      lines.push({ id: 'print', label: 'Book Printing', sub: 'Out of standard range — see custom quote', amount: null, custom: true, removable: true });
    }
  }

  if (services.ebook.on && !included.has('ebook')) {
    lines.push({ id: 'ebook', label: 'Ebook Add-on', sub: 'Amazon-ready ebook formatting', amount: PACKAGES.ebook.price, removable: true });
  }

  if (services.editing.on && !included.has('editing')) {
    lines.push({ id: 'editing', label: 'Standalone Editing', sub: 'Custom quote required', amount: null, custom: true, removable: true });
  }

  services.custom.forEach(c => {
    lines.push({ id: `custom_${c.id}`, label: c.label, sub: c.note || 'Custom Quote Required', amount: null, custom: true, removable: true });
  });

  const subtotal = lines.reduce((s, l) => s + (l.amount || 0), 0);
  const vat = inclVat ? 0 : Math.round(subtotal * 0.15);
  const total = subtotal + vat;
  return { lines, subtotal, vat, total };
}

function getTimeline(services) {
  const pkg = services.package;
  if (services.custom.some(c => c.label.toLowerCase().includes('ghost'))) return '16–22 weeks (incl. ghostwriting)';
  if (pkg.on && pkg.key) {
    if (['a5_gold','6x9_gold','plus'].includes(pkg.key)) return '10–12 weeks';
    if (['mini_bronze','mini_silver','mini_gold','ebook'].includes(pkg.key)) return '3–6 weeks';
    return '8–10 weeks';
  }
  if (services.print.on && !services.cover.on && !services.typeset.on) return '3–4 weeks production + delivery';
  if (services.ebook.on && !services.print.on) return '3–4 weeks';
  return '6–10 weeks';
}

export default function Calculator() {
  const [book, setBook] = useState(DEFAULT_BOOK);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [inclVat, setInclVat] = useState(true);
  const [phase, setPhase] = useState('build'); // 'build' | 'preview' | 'success'
  const [leadModal, setLeadModal] = useState(null); // null | 'email' | 'pdf'
  const [submittedQuote, setSubmittedQuote] = useState(null);
  const [restoredBanner, setRestoredBanner] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { book: b, services: s, inclVat: v, savedAt } = JSON.parse(saved);
        const age = Date.now() - savedAt;
        if (age < 30 * 24 * 3600 * 1000) {
          setBook(b);
          setServices(s);
          setInclVat(v);
          setRestoredBanner(true);
        } else {
          localStorage.removeItem(LS_KEY);
        }
      }
    } catch {}
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ book, services, inclVat, savedAt: Date.now() }));
    } catch {}
  }, [book, services, inclVat]);

  const { lines, subtotal, vat, total } = useMemo(() => buildBreakdown(book, services, inclVat), [book, services, inclVat]);
  const timeline = useMemo(() => getTimeline(services), [services]);
  const deposit = Math.round(total * 0.75);
  const balance = total - deposit;

  const updateBook = useCallback((patch) => setBook(prev => ({ ...prev, ...patch })), []);

  const updateService = useCallback((id, patch) => {
    setServices(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const removeLineItem = useCallback((lineId) => {
    if (lineId === 'package') { updateService('package', { on: false, key: null }); return; }
    if (lineId === 'cover')   { updateService('cover',   { on: false }); return; }
    if (lineId === 'typeset') { updateService('typeset', { on: false }); return; }
    if (lineId === 'print')   { updateService('print',   { on: false }); return; }
    if (lineId === 'ebook')   { updateService('ebook',   { on: false }); return; }
    if (lineId === 'editing') { updateService('editing', { on: false }); return; }
    if (lineId.startsWith('custom_')) {
      const cid = lineId.replace('custom_', '');
      setServices(prev => ({ ...prev, custom: prev.custom.filter(c => c.id !== cid) }));
    }
  }, [updateService]);

  const applyPreset = useCallback((preset) => {
    setBook(prev => ({ ...prev, size: preset.defaultSize || 'a5' }));
    const newServices = { ...DEFAULT_SERVICES, custom: [] };
    if (preset.packageKey) {
      newServices.package = { on: true, key: preset.packageKey };
    } else if (preset.printOnly) {
      newServices.print = { on: true, copies: 100, paperType: 'cream' };
    }
    setServices(newServices);
  }, []);

  const addCustomItem = useCallback((label, note) => {
    const id = Date.now().toString();
    setServices(prev => ({ ...prev, custom: [...prev.custom, { id, label, note }] }));
  }, []);

  const reset = useCallback(() => {
    setBook(DEFAULT_BOOK);
    setServices({ ...DEFAULT_SERVICES, custom: [] });
    setInclVat(true);
    setPhase('build');
    setRestoredBanner(false);
    localStorage.removeItem(LS_KEY);
  }, []);

  const quoteRef = useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `CB-EST-${d}-${rand}`;
  }, []);

  const calcState = { book, services, inclVat, lines, subtotal, vat, total, deposit, balance, timeline, quoteRef, logoUrl: LOGO_URL, updateService };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <PageMeta
        title="Book Publishing Cost Calculator South Africa | Instant Quote | Creative Books SA"
        description="Calculate your book publishing costs instantly using real Creative Books SA prices. Build, refine, and download your custom quote as a PDF in 60 seconds."
        canonical="https://www.creativebooks.co.za/calculator"
      />

      <CalcHeader inclVat={inclVat} setInclVat={setInclVat} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32 lg:pb-16">
        {/* Restored banner */}
        <AnimatePresence>
          {restoredBanner && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-copper/10 border border-copper/30 rounded-xl text-sm">
              <span className="text-[#0F0F0F]/80">👋 Welcome back — we've restored your last estimate.</span>
              <button onClick={reset} className="text-copper font-semibold hover:underline whitespace-nowrap">Start fresh</button>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'build' && (
          <div className="flex gap-8 items-start">
            {/* Left — builder */}
            <div className="flex-1 min-w-0 space-y-6">
              <CalcPresets onSelect={applyPreset} onReset={reset} />
              <BookBasics book={book} updateBook={updateBook} services={services} />
              <ServiceModules book={book} services={services} updateService={updateService} addCustomItem={addCustomItem} />
              <div className="text-center pt-2">
                <button onClick={reset} className="text-sm text-[#0F0F0F]/40 hover:text-copper transition-colors">Reset calculator</button>
              </div>
            </div>
            {/* Right — sidebar (desktop) */}
            <div className="hidden lg:block w-[380px] flex-shrink-0">
              <EstimateSidebar
                calcState={calcState}
                onRemove={removeLineItem}
                onPreview={() => setPhase('preview')}
                addCustomItem={addCustomItem}
              />
            </div>
          </div>
        )}

        {phase === 'preview' && (
          <PreviewPhase
            calcState={calcState}
            services={services}
            updateService={updateService}
            addCustomItem={addCustomItem}
            onBack={() => setPhase('build')}
            onEmail={() => setLeadModal('email')}
            onPdf={() => setLeadModal('pdf')}
            onRemove={removeLineItem}
          />
        )}

        {phase === 'success' && submittedQuote && (
          <SuccessState quote={submittedQuote} onReset={reset} />
        )}
      </div>

      {/* Mobile bottom bar */}
      {phase === 'build' && (
        <MobileEstimateBar
          calcState={calcState}
          onRemove={removeLineItem}
          onPreview={() => setPhase('preview')}
          addCustomItem={addCustomItem}
        />
      )}

      {/* Lead modal */}
      <AnimatePresence>
        {leadModal && (
          <LeadModal
            mode={leadModal}
            calcState={calcState}
            onClose={() => setLeadModal(null)}
            onSuccess={(info) => {
              setSubmittedQuote({ ...calcState, clientInfo: info });
              setLeadModal(null);
              setPhase('success');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}