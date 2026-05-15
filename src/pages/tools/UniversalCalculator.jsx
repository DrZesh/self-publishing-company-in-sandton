import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Calculator, ArrowRight, AlertCircle, Download, Mail } from 'lucide-react';
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

      {/* Main Calculator */}
      <section className="py-16 lg:py-20 bg-vellum min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {currentStep === 'services' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-2">Step 1: Select Services</h2>
                <p className="text-[#0F0F0F]/60">Choose the services you need for your publishing project.</p>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'printing', icon: '📚', title: 'Book Printing', description: 'Print your finished manuscript' },
                  { id: 'editing', icon: '✏️', title: 'Editing & Proofreading', description: 'Professional manuscript review' },
                  { id: 'design-cover', icon: '🎨', title: 'Cover Design', description: 'Custom book cover design' },
                  { id: 'typesetting', icon: '📄', title: 'Typesetting', description: 'Professional layout & formatting' },
                ].map(service => (
                  <motion.button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedServices.includes(service.id)
                        ? 'border-copper bg-copper/10'
                        : 'border-[#0F0F0F]/10 bg-white hover:border-copper/40'
                    }`}
                  >
                    <div className="text-3xl mb-3">{service.icon}</div>
                    <h3 className="font-heading font-bold text-[#0F0F0F]">{service.title}</h3>
                    <p className="text-sm text-[#0F0F0F]/60 mt-1">{service.description}</p>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(selectedServices.length > 0 ? 'details' : null)}
                disabled={selectedServices.length === 0}
                className="w-full px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue to Details →
              </button>
            </motion.div>
          )}

          {currentStep === 'details' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <h2 className="font-heading text-3xl font-bold text-[#0F0F0F]">Step 2: Service Details</h2>

              {/* Printing Details */}
              {selectedServices.includes('printing') && (
                <div className="p-6 bg-white rounded-xl border border-[#0F0F0F]/10">
                  <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-4">Book Printing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Book Size</label>
                      <select
                        value={formData.printing?.bookSize || 'a5'}
                        onChange={(e) => updateServiceData('printing', { bookSize: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="a5">A5 (148×210mm)</option>
                        <option value="6x9">6×9 inches</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Paper Type</label>
                      <select
                        value={formData.printing?.paperType || 'cream78'}
                        onChange={(e) => updateServiceData('printing', { paperType: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="cream78">Cream Paper 78 gsm</option>
                        <option value="white80">White Paper 80 gsm</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Page Count</label>
                      <input
                        type="number"
                        min={50}
                        max={400}
                        value={formData.printing?.pages || 150}
                        onChange={(e) => updateServiceData('printing', { pages: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Copies</label>
                      <select
                        value={formData.printing?.copies || 100}
                        onChange={(e) => updateServiceData('printing', { copies: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                      >
                        {Object.keys(QUANTITY_MULTIPLIERS).map(qty => (
                          <option key={qty} value={qty}>{qty} copies</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Editing Details */}
              {selectedServices.includes('editing') && (
                <div className="p-6 bg-white rounded-xl border border-[#0F0F0F]/10">
                  <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-4">Editing & Proofreading</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Word Count</label>
                      <input
                        type="number"
                        value={formData.editing?.wordCount || 50000}
                        onChange={(e) => updateServiceData('editing', { wordCount: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Type</label>
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
                        className="w-full p-2 border rounded"
                      >
                        <option value="proofreading">Proofreading (R0.04/word)</option>
                        <option value="copyediting">Copy Editing (R0.08/word)</option>
                        <option value="academic">Academic Editing (R0.12/word)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Design */}
              {selectedServices.includes('design-cover') && (
                <div className="p-6 bg-white rounded-xl border border-[#0F0F0F]/10">
                  <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-4">Book Cover Design</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'starter', label: 'Starter - R3,850' },
                      { id: 'standard', label: 'Standard - R5,500' },
                      { id: 'premium', label: 'Premium - R7,700' },
                    ].map(pkg => (
                      <button
                        key={pkg.id}
                        onClick={() => updateServiceData('design-cover', { packageLevel: pkg.id })}
                        className={`p-3 rounded border-2 transition-all ${
                          formData['design-cover']?.packageLevel === pkg.id
                            ? 'border-copper bg-copper/10'
                            : 'border-[#0F0F0F]/10'
                        }`}
                      >
                        {pkg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typesetting */}
              {selectedServices.includes('typesetting') && (
                <div className="p-6 bg-white rounded-xl border border-[#0F0F0F]/10">
                  <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-4">Typesetting</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Page Count</label>
                      <input
                        type="number"
                        value={formData.typesetting?.pages || 200}
                        onChange={(e) => updateServiceData('typesetting', { pages: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 mt-6">
                        <input
                          type="checkbox"
                          checked={formData.typesetting?.complexFormatting || false}
                          onChange={(e) => updateServiceData('typesetting', { complexFormatting: e.target.checked })}
                        />
                        <span className="text-sm">Complex formatting (images, tables, footnotes)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('services')}
                  className="px-6 py-3 border-2 border-copper text-copper rounded-full hover:bg-copper/5"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    calculateEstimate();
                    setCurrentStep('review');
                  }}
                  className="flex-1 px-6 py-3 bg-copper text-white rounded-full hover:bg-copper/90"
                >
                  Review Estimate →
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <h2 className="font-heading text-3xl font-bold text-[#0F0F0F]">Step 3: Review & Client Info</h2>

              {/* Estimate Breakdown */}
              <div className="p-6 bg-white rounded-xl border border-[#0F0F0F]/10">
                <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-4">Estimate Breakdown</h3>
                <div className="space-y-2 mb-4">
                  {breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-semibold">R{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Estimated Total:</span>
                    <span className="text-copper">R{estimateTotal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-900">
                    <strong>Disclaimer:</strong> This is an automated estimate based on website pricing. Final quotation will be confirmed after Creative Books SA reviews your files and requirements.
                  </p>
                </div>
              </div>

              {/* Client Information */}
              <div className="p-6 bg-white rounded-xl border border-[#0F0F0F]/10">
                <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-4">Your Contact Information</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="w-full p-3 border rounded"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="w-full p-3 border rounded"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="w-full p-3 border rounded"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('details')}
                  className="px-6 py-3 border-2 border-copper text-copper rounded-full hover:bg-copper/5"
                >
                  ← Back
                </button>
                <button
                  onClick={submitEstimate}
                  disabled={loading || !clientInfo.name || !clientInfo.email}
                  className="flex-1 px-6 py-3 bg-copper text-white rounded-full hover:bg-copper/90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {loading ? 'Generating...' : 'Generate & Send Estimate'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'confirmation' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">✓</div>
              <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-4">Estimate Sent!</h2>
              <p className="text-[#0F0F0F]/60 mb-8">
                Your estimate has been generated and sent to <strong>{clientInfo.email}</strong>. 
                Our team will review your requirements and send a final quotation within 24 hours.
              </p>
              <button
                onClick={() => {
                  setCurrentStep('services');
                  setSelectedServices([]);
                  setFormData({});
                  setClientInfo({ name: '', email: '', phone: '' });
                }}
                className="px-8 py-3 bg-copper text-white rounded-full hover:bg-copper/90"
              >
                Calculate Another Estimate
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <CTASection
        title="Questions About Your Project?"
        description="Our team is ready to answer questions and provide personalized guidance."
      />
    </div>
  );
}