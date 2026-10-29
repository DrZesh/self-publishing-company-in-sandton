import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { platform } from '@/api/platformClient';
import { Calculator, ArrowRight, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';

// Hardcoded pricing (no external lib dependency)
const PRINTING_TIERS = {
  a5: {
    '50-100': 5500, '115-150': 6250, '160-200': 7500,
    '210-250': 8750, '260-300': 9600, '310-350': 11500, '360-400': 12500,
  },
  '6x9': {
    '50-100': 6200, '115-150': 6950, '160-200': 8200,
    '210-250': 9450, '260-300': 10300, '310-350': 12200, '360-400': 13200,
  },
};
const QTY_MULTIPLIERS = { 100: 1, 150: 1.45, 200: 1.85, 250: 2.25, 300: 2.6, 400: 3.3, 500: 4.0, 1000: 7.5 };
const EDITING_RATES = { copyediting: 0.25, lineedit: 0.40, contentedit: 0.50 };
const COVER_PRICES = { authors: 1700, stock: 2150, illustrated: 3650 };
const TYPESET_RATES = { basic: 10.5, standard: 12.5, premium: 19.5 };

function getPrintTier(pages) {
  if (pages >= 50 && pages <= 100) return '50-100';
  if (pages >= 115 && pages <= 150) return '115-150';
  if (pages >= 160 && pages <= 200) return '160-200';
  if (pages >= 210 && pages <= 250) return '210-250';
  if (pages >= 260 && pages <= 300) return '260-300';
  if (pages >= 310 && pages <= 350) return '310-350';
  if (pages >= 360 && pages <= 400) return '360-400';
  return null;
}

export default function UniversalCalculator() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentStep, setCurrentStep] = useState('services');
  const [formData, setFormData] = useState({});
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const updateServiceData = (id, data) => {
    setFormData(prev => ({ ...prev, [id]: { ...prev[id], ...data } }));
  };

  const { estimateTotal, breakdown } = useMemo(() => {
    let total = 0;
    const items = [];

    selectedServices.forEach(serviceId => {
      const data = formData[serviceId] || {};

      if (serviceId === 'printing') {
        const pages = data.pages || 150;
        const copies = data.copies || 100;
        const size = data.bookSize || 'a5';
        const tier = getPrintTier(pages);
        if (tier) {
          const base = PRINTING_TIERS[size]?.[tier] || 0;
          const mult = QTY_MULTIPLIERS[copies] || 1;
          const amount = Math.round(base * mult);
          total += amount;
          items.push({ name: 'Book Printing', description: `${copies} copies, ${size.toUpperCase()}, ${pages} pages`, amount });
        }
      }

      if (serviceId === 'editing' && data.wordCount) {
        const rate = EDITING_RATES[data.editingType] || 0.25;
        const amount = Math.ceil(data.wordCount * rate);
        total += amount;
        const labels = { copyediting: 'Copy Editing', lineedit: 'Line Edit', contentedit: 'Content Edit' };
        items.push({ name: labels[data.editingType] || 'Copy Editing', description: `${data.wordCount.toLocaleString()} words @ R${rate}/word`, amount });
      }

      if (serviceId === 'cover') {
        const amount = COVER_PRICES[data.tier || 'stock'];
        total += amount;
        const labels = { authors: "Author's Book Cover", stock: 'Stock Design Cover', illustrated: 'Illustrated Design Cover' };
        items.push({ name: 'Cover Design', description: labels[data.tier || 'stock'], amount });
      }

      if (serviceId === 'typesetting' && data.pages) {
        const rate = TYPESET_RATES[data.tier || 'basic'];
        const amount = Math.ceil(data.pages * rate);
        total += amount;
        const labels = { basic: 'Basic Layout', standard: 'Standard Layout', premium: 'Premium Layout' };
        items.push({ name: 'Typesetting', description: `${data.pages} pages @ R${rate}/page (${labels[data.tier || 'basic']})`, amount });
      }
    });

    return { estimateTotal: total, breakdown: items };
  }, [selectedServices, formData]);

  const submitEstimate = async () => {
    if (!clientInfo.name || !clientInfo.email) { setError('Please enter your name and email'); return; }
    setLoading(true);
    setError('');
    try {
      const quoteRef = `CB-${Date.now().toString().slice(-6)}`;
      await platform.functions.invoke('captureFormSubmission', { formType: 'calculator_estimate', fullName: clientInfo.name, email: clientInfo.email, phone: clientInfo.phone || '', sourcePage: window.location.pathname, additionalFields: { breakdown, estimatedTotal: estimateTotal, quoteNumber: quoteRef } });
      setCurrentStep('confirmation');
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const SERVICES = [
    { id: 'printing', icon: '📚', title: 'Book Printing', description: 'Print your finished manuscript' },
    { id: 'editing', icon: '✏️', title: 'Editing', description: 'Professional manuscript editing' },
    { id: 'cover', icon: '🎨', title: 'Cover Design', description: 'Custom book cover design' },
    { id: 'typesetting', icon: '📄', title: 'Typesetting', description: 'Professional layout & formatting' },
  ];

  const STEPS = ['services', 'details', 'review'];

  return (
    <div>
      <PageMeta
        title="Book Publishing Cost Calculator"
        description="Use the book publishing cost calculator to estimate costs for printing, editing, cover design and typesetting."
        description="Calculate costs for printing, editing, design, and publishing. Instant estimates based on real Creative Books SA rates."
        canonical="https://creativebooks.co.za/calculator"
      />

      {/* Hero */}
      <section className="relative flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <Calculator className="w-4 h-4 text-copper" />
              <span className="text-copper text-sm font-medium">Publishing Calculator</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Book Publishing Cost Calculator</h1>
            <p className="text-white/60 text-lg">Select your services and get an instant estimate based on real Creative Books SA pricing.</p>
          </motion.div>
        </div>
      </section>

      {/* Step Progress */}
      {currentStep !== 'confirmation' && (
        <div className="sticky top-0 z-40 bg-white border-b border-black/10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step ? 'bg-copper text-white' :
                  STEPS.indexOf(currentStep) > idx ? 'bg-green-500 text-white' : 'bg-black/10 text-black/40'
                }`}>
                  {STEPS.indexOf(currentStep) > idx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs font-medium capitalize ${currentStep === step ? 'text-copper' : 'text-black/40'}`}>{step}</span>
                {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${STEPS.indexOf(currentStep) > idx ? 'bg-green-500' : 'bg-black/10'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main */}
      <section className="py-12 bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">

            {/* Step 1: Select Services */}
            {currentStep === 'services' && (
              <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold text-black mb-2">What services do you need?</h2>
                  <p className="text-black/50 text-sm">Select one or more services</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SERVICES.map(svc => (
                    <button key={svc.id} onClick={() => toggleService(svc.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${selectedServices.includes(svc.id) ? 'border-copper bg-copper/5 shadow-md' : 'border-black/10 hover:border-copper/40'}`}>
                      <div className="text-3xl mb-2">{svc.icon}</div>
                      <div className="font-semibold text-black text-sm">{svc.title}</div>
                      <div className="text-xs text-black/50 mt-1">{svc.description}</div>
                      {selectedServices.includes(svc.id) && (
                        <div className="mt-3 flex justify-end">
                          <div className="w-5 h-5 rounded-full bg-copper flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={() => selectedServices.length > 0 && setCurrentStep('details')}
                  disabled={selectedServices.length === 0}
                  className="w-full py-4 bg-copper text-white font-medium rounded-full disabled:opacity-40 hover:bg-copper/90 transition-all shadow-lg">
                  Continue <ChevronRight className="w-4 h-4 inline ml-1" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold text-black mb-2">Service Details</h2>
                  <p className="text-black/50 text-sm">Fill in the details for each service</p>
                </div>

                {selectedServices.includes('printing') && (
                  <div className="p-6 rounded-2xl border border-copper/20 bg-copper/5 space-y-4">
                    <h3 className="font-semibold text-black flex items-center gap-2">📚 Book Printing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-black/70 mb-1">Book Size</label>
                        <select value={formData.printing?.bookSize || 'a5'} onChange={e => updateServiceData('printing', { bookSize: e.target.value })}
                          className="w-full px-3 py-2 border border-black/15 rounded-lg text-sm focus:outline-none focus:border-copper bg-white">
                          <option value="a5">A5 (148×210mm)</option>
                          <option value="6x9">6×9 inches</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-black/70 mb-1">Copies</label>
                        <select value={formData.printing?.copies || 100} onChange={e => updateServiceData('printing', { copies: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-black/15 rounded-lg text-sm focus:outline-none focus:border-copper bg-white">
                          {Object.keys(QTY_MULTIPLIERS).map(q => <option key={q} value={q}>{q} copies</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-black/70 mb-1">Pages: <span className="text-copper">{formData.printing?.pages || 150}</span></label>
                      <input type="range" min={50} max={400} step={10} value={formData.printing?.pages || 150}
                        onChange={e => updateServiceData('printing', { pages: Number(e.target.value) })}
                        className="w-full accent-copper" />
                      <div className="flex justify-between text-xs text-black/40 mt-1"><span>50</span><span>400</span></div>
                    </div>
                  </div>
                )}

                {selectedServices.includes('editing') && (
                  <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50 space-y-4">
                    <h3 className="font-semibold text-black flex items-center gap-2">✏️ Editing</h3>
                    <div>
                      <label className="block text-xs font-semibold text-black/70 mb-1">Word Count *</label>
                      <input type="number" min={5000} placeholder="e.g. 60000"
                        value={formData.editing?.wordCount || ''}
                        onChange={e => updateServiceData('editing', { wordCount: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-black/15 rounded-lg text-sm focus:outline-none focus:border-copper" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-black/70 mb-1">Edit Type</label>
                      <select value={formData.editing?.editingType || 'copyediting'} onChange={e => updateServiceData('editing', { editingType: e.target.value })}
                        className="w-full px-3 py-2 border border-black/15 rounded-lg text-sm focus:outline-none focus:border-copper bg-white">
                        <option value="copyediting">Copy Editing — R0.25/word</option>
                        <option value="lineedit">Line Edit — R0.40/word</option>
                        <option value="contentedit">Content Edit — R0.50/word</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedServices.includes('cover') && (
                  <div className="p-6 rounded-2xl border border-purple-200 bg-purple-50 space-y-4">
                    <h3 className="font-semibold text-black flex items-center gap-2">🎨 Cover Design</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ id: 'authors', label: "Author's Cover", price: 'R1,700' }, { id: 'stock', label: 'Stock Design', price: 'R2,150' }, { id: 'illustrated', label: 'Illustrated', price: 'R3,650' }].map(pkg => (
                        <button key={pkg.id} onClick={() => updateServiceData('cover', { tier: pkg.id })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${formData.cover?.tier === pkg.id ? 'border-purple-500 bg-white' : 'border-black/10 hover:border-purple-300 bg-white'}`}>
                          <div className="text-xs font-semibold text-black">{pkg.label}</div>
                          <div className="text-xs text-copper font-bold mt-1">{pkg.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedServices.includes('typesetting') && (
                  <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50 space-y-4">
                    <h3 className="font-semibold text-black flex items-center gap-2">📄 Typesetting</h3>
                    <div>
                      <label className="block text-xs font-semibold text-black/70 mb-1">Page Count *</label>
                      <input type="number" min={1} placeholder="e.g. 200"
                        value={formData.typesetting?.pages || ''}
                        onChange={e => updateServiceData('typesetting', { pages: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-black/15 rounded-lg text-sm focus:outline-none focus:border-copper" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-black/70 mb-1">Layout Level</label>
                      <select value={formData.typesetting?.tier || 'basic'} onChange={e => updateServiceData('typesetting', { tier: e.target.value })}
                        className="w-full px-3 py-2 border border-black/15 rounded-lg text-sm focus:outline-none focus:border-copper bg-white">
                        <option value="basic">Basic — R10.50/page</option>
                        <option value="standard">Standard — R12.50/page</option>
                        <option value="premium">Premium — R19.50/page</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Live total */}
                {estimateTotal > 0 && (
                  <div className="p-5 rounded-2xl border-2 border-copper/20 bg-copper/5 flex justify-between items-center">
                    <span className="text-black/60 text-sm">Estimated Total</span>
                    <span className="font-heading text-2xl font-bold text-copper">R{estimateTotal.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep('services')} className="px-6 py-3 border-2 border-copper text-copper rounded-full font-medium hover:bg-copper/5">← Back</button>
                  <button onClick={() => setCurrentStep('review')} disabled={estimateTotal === 0}
                    className="flex-1 py-3 bg-copper text-white rounded-full font-medium disabled:opacity-40 hover:bg-copper/90 shadow-lg">
                    Review Estimate <ChevronRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {currentStep === 'review' && (
              <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold text-black mb-2">Review & Submit</h2>
                  <p className="text-black/50 text-sm">Confirm your estimate and we'll be in touch</p>
                </div>

                {/* Breakdown */}
                <div className="p-6 rounded-2xl border-2 border-copper/20 bg-copper/5 space-y-3">
                  <h3 className="font-semibold text-black mb-4">Your Estimate</h3>
                  {breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between items-start pb-3 border-b border-copper/15 last:border-0">
                      <div>
                        <div className="font-medium text-black text-sm">{item.name}</div>
                        <div className="text-xs text-black/50">{item.description}</div>
                      </div>
                      <div className="font-bold text-copper text-sm ml-4">R{item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between items-center">
                    <span className="font-heading font-bold text-black">Total</span>
                    <span className="font-heading text-2xl font-bold text-copper">R{estimateTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  ℹ️ This is an automated estimate. Final pricing is confirmed after Creative Books SA reviews your files (within 24 hours).
                </div>

                {/* Contact info */}
                <div className="p-6 rounded-2xl border border-black/10 space-y-4">
                  <h3 className="font-semibold text-black">Your Details</h3>
                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">Full Name *</label>
                    <input type="text" placeholder="Jane Smith" value={clientInfo.name}
                      onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-black/15 rounded-lg focus:outline-none focus:border-copper" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">Email *</label>
                    <input type="email" placeholder="jane@example.com" value={clientInfo.email}
                      onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-black/15 rounded-lg focus:outline-none focus:border-copper" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">Phone (optional)</label>
                    <input type="tel" placeholder="+27 82 000 0000" value={clientInfo.phone}
                      onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-black/15 rounded-lg focus:outline-none focus:border-copper" />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-sm text-red-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep('details')} className="px-6 py-3 border-2 border-copper text-copper rounded-full font-medium hover:bg-copper/5">← Back</button>
                  <button onClick={submitEstimate} disabled={loading || !clientInfo.name || !clientInfo.email}
                    className="flex-1 py-3 bg-copper text-white rounded-full font-medium disabled:opacity-40 hover:bg-copper/90 shadow-lg flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Save Enquiry <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Confirmation */}
            {currentStep === 'confirmation' && (
              <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-heading text-3xl font-bold text-black mb-3">Enquiry Saved!</h2>
                <p className="text-black/60 mb-2">Your estimate details have been saved for our team to review.</p>
                <p className="text-black/40 text-sm mb-8">Please call 084 230 5393 if you need to follow up.</p>
                <button onClick={() => { setCurrentStep('services'); setSelectedServices([]); setFormData({}); setClientInfo({ name: '', email: '', phone: '' }); setError(''); }}
                  className="px-8 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 shadow-lg">
                  Start New Estimate
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      <CTASection title="Questions About Your Project?" description="Our team is ready to help with personalised guidance." />
    </div>
  );
}