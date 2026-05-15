import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Calculator, ArrowRight, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import { MASTER_PRICING, QUANTITY_MULTIPLIERS, getPrintingPrice } from '../../lib/pricing-extractor';

export default function UniversalCalculator() {
  // Service selection
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentStep, setCurrentStep] = useState('services'); // services, details, review, confirmation
  const [formData, setFormData] = useState({});
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [estimateTotal, setEstimateTotal] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Service toggle
  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
    setFormData(prev => {
      const updated = { ...prev };
      if (updated[serviceId]) delete updated[serviceId];
      return updated;
    });
  };

  // Update form data for a service
  const updateServiceData = (serviceId, data) => {
    setFormData(prev => ({ ...prev, [serviceId]: { ...prev[serviceId], ...data } }));
  };

  // Calculate totals
  const calculateEstimate = useCallback(() => {
    let total = 0;
    let items = [];

    selectedServices.forEach(serviceId => {
      const data = formData[serviceId] || {};

      if (serviceId === 'printing') {
        const result = getPrintingPrice(
          data.bookSize || 'a5',
          data.paperType || 'cream78',
          data.pages || 150,
          data.copies || 100
        );
        if (result.type === 'standard') {
          total += result.totalPrice;
          items.push({
            name: 'Book Printing',
            description: `${data.copies} copies, ${data.pages}p, ${data.bookSize}`,
            amount: result.totalPrice,
          });
        }
      } else if (serviceId === 'editing') {
        const amount = Math.ceil((data.wordCount || 0) * (data.ratePerWord || 0.08));
        if (amount > 0) {
          total += amount;
          items.push({
            name: `${data.editingType || 'Editing'}`,
            description: `${data.wordCount || 0} words`,
            amount,
          });
        }
      } else if (serviceId === 'design-cover') {
        const prices = { starter: 3850, standard: 5500, premium: 7700 };
        const amount = prices[data.packageLevel || 'standard'];
        total += amount;
        items.push({
          name: 'Book Cover Design',
          description: data.packageLevel || 'Standard',
          amount,
        });
      } else if (serviceId === 'typesetting') {
        const ratePerPage = data.complexFormatting ? 15.4 : 10.5;
        const amount = Math.ceil((data.pages || 0) * ratePerPage);
        if (amount > 0) {
          total += amount;
          items.push({
            name: 'Typesetting',
            description: `${data.pages} pages`,
            amount,
          });
        }
      }
    });

    setEstimateTotal(total);
    setBreakdown(items);
  }, [selectedServices, formData]);

  // Submit estimate
  const submitEstimate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('generateEstimateQuote', {
        services: breakdown.map((item, idx) => ({
          name: item.name,
          estimatedCost: item.amount,
          details: item.description,
        })),
        clientInfo,
        breakdown,
        total: estimateTotal,
      });

      if (response.data) {
        setCurrentStep('confirmation');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Universal Publishing Calculator | Creative Books SA"
        description="Calculate costs for printing, editing, design, and publishing all in one calculator. Instant estimates for your publishing project."
        canonical="https://www.creativebookssa.co.za/calculator"
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <Calculator className="w-4 h-4 text-copper" />
              <span className="text-copper text-sm font-medium">Universal Calculator</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Publishing Cost Calculator</h1>
            <p className="text-white/60 text-lg mb-4">Select the services you need and get an instant estimate. Pricing based on actual Creative Books SA rates.</p>
            <p className="text-white/40 text-sm">Disclaimer: This is an automated estimate. Final pricing will be confirmed after file review.</p>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      {currentStep !== 'confirmation' && (
        <section className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-[#0F0F0F]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {['services', 'details', 'review'].map((step, idx) => (
                <div key={step} className="flex items-center flex-1">
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                      currentStep === step
                        ? 'bg-copper text-white'
                        : ['services', 'details', 'review'].indexOf(currentStep) > idx
                        ? 'bg-green-500 text-white'
                        : 'bg-[#0F0F0F]/10 text-[#0F0F0F]/50'
                    }`}
                  >
                    {['services', 'details', 'review'].indexOf(currentStep) > idx ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </motion.div>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full ${
                        ['services', 'details', 'review'].indexOf(currentStep) > idx
                          ? 'bg-green-500'
                          : 'bg-[#0F0F0F]/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Calculator */}
      <section className="py-8 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {currentStep === 'services' && (
              <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="text-center mb-10">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F0F0F] mb-3">What services do you need?</h2>
                  <p className="text-[#0F0F0F]/60 text-sm sm:text-base">Select all the services for your publishing project</p>
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {[
                    { id: 'printing', icon: '📚', title: 'Book Printing', description: 'Print your finished manuscript' },
                    { id: 'editing', icon: '✏️', title: 'Editing & Proofreading', description: 'Professional manuscript review' },
                    { id: 'design-cover', icon: '🎨', title: 'Cover Design', description: 'Custom book cover design' },
                    { id: 'typesetting', icon: '📄', title: 'Typesetting', description: 'Professional layout & formatting' },
                  ].map((service, idx) => (
                    <motion.button
                      key={service.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => toggleService(service.id)}
                      whileHover={{ scale: 1.02, translateY: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-5 sm:p-6 rounded-2xl border-2 transition-all text-left ${
                        selectedServices.includes(service.id)
                          ? 'border-copper bg-gradient-to-br from-copper/15 to-copper/5 shadow-lg'
                          : 'border-[#0F0F0F]/10 bg-white hover:border-copper/50 hover:shadow-md'
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl mb-3">{service.icon}</div>
                      <h3 className="font-heading font-bold text-[#0F0F0F] mb-1">{service.title}</h3>
                      <p className="text-xs sm:text-sm text-[#0F0F0F]/60">{service.description}</p>
                      {selectedServices.includes(service.id) && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 flex justify-end">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-copper flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={() => setCurrentStep(selectedServices.length > 0 ? 'details' : null)}
                  disabled={selectedServices.length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 sm:py-4 bg-copper text-white font-medium rounded-full hover:bg-copper/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm sm:text-base"
                >
                  Continue to Details <ChevronRight className="w-4 h-4 inline ml-2" />
                </motion.button>
              </motion.div>
            )}

            {currentStep === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F0F0F] mb-2">Service Details</h2>
                  <p className="text-[#0F0F0F]/60 text-sm sm:text-base">Customize your selections</p>
                </div>

                {/* Printing Details */}
                {selectedServices.includes('printing') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 sm:p-6 bg-gradient-to-br from-copper/5 to-transparent rounded-2xl border border-copper/20">
                    <h3 className="font-heading text-lg font-bold text-[#0F0F0F] mb-4 flex items-center gap-2">
                      <span>📚</span> Book Printing
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Book Size</label>
                          <select
                            value={formData.printing?.bookSize || 'a5'}
                            onChange={(e) => updateServiceData('printing', { bookSize: e.target.value })}
                            className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper bg-white"
                          >
                            <option value="a5">A5 (148×210mm)</option>
                            <option value="6x9">6×9 inches</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Paper Type</label>
                          <select
                            value={formData.printing?.paperType || 'cream78'}
                            onChange={(e) => updateServiceData('printing', { paperType: e.target.value })}
                            className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper bg-white"
                          >
                            <option value="cream78">Cream Paper 78 gsm</option>
                            <option value="white80">White Paper 80 gsm</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Page Count: <span className="text-copper font-bold">{formData.printing?.pages || 150}</span></label>
                          <input
                            type="range"
                            min={50}
                            max={400}
                            step={10}
                            value={formData.printing?.pages || 150}
                            onChange={(e) => updateServiceData('printing', { pages: Number(e.target.value) })}
                            className="w-full accent-copper"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Number of Copies</label>
                          <select
                            value={formData.printing?.copies || 100}
                            onChange={(e) => updateServiceData('printing', { copies: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper bg-white"
                          >
                            {Object.keys(QUANTITY_MULTIPLIERS).map(qty => (
                              <option key={qty} value={qty}>{qty} copies</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Editing Details */}
                {selectedServices.includes('editing') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50 to-transparent rounded-2xl border border-emerald-200">
                    <h3 className="font-heading text-lg font-bold text-[#0F0F0F] mb-4 flex items-center gap-2">
                      <span>✏️</span> Editing & Proofreading
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Word Count</label>
                          <input
                            type="number"
                            value={formData.editing?.wordCount || 50000}
                            onChange={(e) => updateServiceData('editing', { wordCount: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Service Type</label>
                          <select
                            value={formData.editing?.editingType || 'proofreading'}
                            onChange={(e) => {
                              const type = e.target.value;
                              const rates = { proofreading: 0.04, copyediting: 0.08, academic: 0.12 };
                              updateServiceData('editing', {
                                editingType: type,
                                ratePerWord: rates[type],
                              });
                            }}
                            className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper bg-white"
                          >
                            <option value="proofreading">Proofreading (R0.04/word)</option>
                            <option value="copyediting">Copy Editing (R0.08/word)</option>
                            <option value="academic">Academic Editing (R0.12/word)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Cover Design */}
                {selectedServices.includes('design-cover') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 sm:p-6 bg-gradient-to-br from-purple-50 to-transparent rounded-2xl border border-purple-200">
                    <h3 className="font-heading text-lg font-bold text-[#0F0F0F] mb-4 flex items-center gap-2">
                      <span>🎨</span> Book Cover Design
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'starter', label: 'Starter', price: 'R3,850' },
                        { id: 'standard', label: 'Standard', price: 'R5,500' },
                        { id: 'premium', label: 'Premium', price: 'R7,700' },
                      ].map(pkg => (
                        <motion.button
                          key={pkg.id}
                          onClick={() => updateServiceData('design-cover', { packageLevel: pkg.id })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            formData['design-cover']?.packageLevel === pkg.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-[#0F0F0F]/10 hover:border-purple-300'
                          }`}
                        >
                          <div className="font-semibold text-[#0F0F0F]">{pkg.label}</div>
                          <div className="text-sm text-copper font-bold mt-1">{pkg.price}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Typesetting */}
                {selectedServices.includes('typesetting') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 sm:p-6 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl border border-blue-200">
                    <h3 className="font-heading text-lg font-bold text-[#0F0F0F] mb-4 flex items-center gap-2">
                      <span>📄</span> Typesetting
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Page Count</label>
                        <input
                          type="number"
                          value={formData.typesetting?.pages || 200}
                          onChange={(e) => updateServiceData('typesetting', { pages: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper"
                        />
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/50 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.typesetting?.complexFormatting || false}
                          onChange={(e) => updateServiceData('typesetting', { complexFormatting: e.target.checked })}
                          className="w-4 h-4 accent-copper"
                        />
                        <span className="text-sm font-medium text-[#0F0F0F]">Complex formatting (images, tables, footnotes) — +R5/page</span>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0">
                  <motion.button
                    onClick={() => setCurrentStep('services')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 border-2 border-copper text-copper rounded-full hover:bg-copper/5 font-medium text-sm sm:text-base"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      calculateEstimate();
                      setCurrentStep('review');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-copper text-white rounded-full hover:bg-copper/90 font-medium shadow-lg text-sm sm:text-base"
                  >
                    Review Estimate <ChevronRight className="w-4 h-4 inline ml-2" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 'review' && (
              <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F0F0F] mb-2">Review & Confirm</h2>
                  <p className="text-[#0F0F0F]/60 text-sm sm:text-base">Almost there! Let us know how to contact you</p>
                </div>

                {/* Estimate Breakdown */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 sm:p-8 bg-gradient-to-br from-copper/10 to-transparent rounded-2xl border-2 border-copper/30">
                  <h3 className="font-heading text-lg font-bold text-[#0F0F0F] mb-5">Your Estimate</h3>
                  <div className="space-y-3 mb-6">
                    {breakdown.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex justify-between items-center pb-3 border-b border-copper/20 last:border-0"
                      >
                        <div>
                          <div className="font-medium text-[#0F0F0F]">{item.name}</div>
                          <div className="text-xs text-[#0F0F0F]/60">{item.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-copper">R{item.amount.toLocaleString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-6 border-t-2 border-copper/40"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-heading text-xl font-bold text-[#0F0F0F]">Estimated Total</span>
                      <span className="font-heading text-3xl font-bold text-copper">R{estimateTotal.toLocaleString()}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Info Box */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <p className="text-xs sm:text-sm text-blue-900">
                    <span className="font-bold">ℹ️ Disclaimer:</span> This is an automated estimate based on website pricing. Final quotation will be confirmed after Creative Books SA reviews your files and requirements within 24 hours.
                  </p>
                </motion.div>

                {/* Client Information */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 sm:p-8 bg-white rounded-2xl border border-[#0F0F0F]/10">
                  <h3 className="font-heading text-lg font-bold text-[#0F0F0F] mb-5">Your Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Full Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Email *</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#0F0F0F]/80 mb-2">Phone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+27 11 234 5678"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#0F0F0F]/15 rounded-lg focus:outline-none focus:border-copper transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0">
                  <motion.button
                    onClick={() => setCurrentStep('details')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 border-2 border-copper text-copper rounded-full hover:bg-copper/5 font-medium text-sm sm:text-base"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    onClick={submitEstimate}
                    disabled={loading || !clientInfo.name || !clientInfo.email}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-copper text-white rounded-full hover:bg-copper/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg inline-flex items-center justify-center gap-2 text-sm sm:text-base transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate & Send Estimate
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-2xl mx-auto py-12 sm:py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F0F0F] mb-4">Estimate Sent!</h2>
                <p className="text-[#0F0F0F]/60 mb-6 text-sm sm:text-base">
                  We've sent your estimate to <strong className="text-copper">{clientInfo.email}</strong>
                </p>
                <p className="text-[#0F0F0F]/50 mb-8 text-xs sm:text-sm">
                  Our team will review your requirements and send a final quotation within 24 hours.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentStep('services');
                    setSelectedServices([]);
                    setFormData({});
                    setClientInfo({ name: '', email: '', phone: '' });
                    setEstimateTotal(0);
                    setBreakdown([]);
                  }}
                  className="px-8 py-3 bg-copper text-white rounded-full hover:bg-copper/90 font-medium shadow-lg inline-flex items-center gap-2 text-sm sm:text-base"
                >
                  <ArrowRight className="w-4 h-4" />
                  Calculate Another Estimate
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <CTASection
        title="Questions About Your Project?"
        description="Our team is ready to answer questions and provide personalized guidance."
      />
    </div>
  );
}