import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { formatZAR } from '../../lib/calculatorPricing';

const HOW_HELP = ['Ready to proceed', 'Comparing options', 'Just researching', 'Have questions'];
const CONTACT_TIME = ['Anytime', 'Morning', 'Afternoon', 'Evening', 'Email only'];

export default function LeadModal({ mode, answers, pricing, inclVat, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', howHelp: '', contactTime: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const subtotal = answers.chosenPath === 'A' && pricing.pathATotal ? pricing.pathATotal : pricing.pathBTotal;
  const vat = inclVat ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal + vat;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErr('');
    try {
      const quoteRef = `CB-EST-${new Date().toISOString().slice(0,10)}-${String(Math.floor(1000+Math.random()*9000))}`;
      
      // Save the calculator enquiry without external notifications.
      await platform.functions.invoke('captureFormSubmission', {
          formType: 'calculator_estimate',
          fullName: form.name,
          email: form.email,
          phone: form.phone || null,
          message: `Calculator estimate request. How can we help: ${form.howHelp || 'N/A'}. Contact preference: ${form.contactTime || 'N/A'}. Quote: ${quoteRef}`,
          sourcePage: '/calculator',
          serviceInterest: ['book_publishing'],
          bookTitle: answers.projectType || '',
          bookPageCount: answers.pages || 0,
          bookWordCount: answers.words || 0,
          budget: total > 0 ? String(total) : undefined,
          additionalFields: {
            quoteNumber: quoteRef,
            chosenPath: answers.chosenPath || pricing.recommendation,
            estimatedTotal: total,
            howHelp: form.howHelp,
            contactTime: form.contactTime,
            mode: mode,
            projectType: answers.projectType,
            stage: answers.stage,
            pages: answers.pages,
            words: answers.words,
          },
        });
      platform.analytics.track({ eventName: mode === 'email' ? 'enquiry_saved' : 'pdf_downloaded', properties: { total, chosenPath: answers.chosenPath || pricing.recommendation } });
      onSuccess(form);
    } catch (e) {
      console.error('LeadModal submit error:', e);
      // Even if everything fails, save to localStorage as fallback
      try {
        const fallbackKey = 'cbsa_failed_submissions';
        const existing = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
        existing.push({
          timestamp: Date.now(),
          clientInfo: form,
          answers,
          pricing,
          total,
          mode,
        });
        localStorage.setItem(fallbackKey, JSON.stringify(existing));
      } catch {}
      setErr(`Error: ${e?.message || e?.response?.data?.error || 'Unknown error'}. Your details have been saved locally. Please call us on 010 500 3331.`);
    } finally {
      setLoading(false);
    }
  };

  const f = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-[#0A0806] px-6 py-5 rounded-t-2xl flex items-start justify-between">
          <div>
            <div className="text-white font-heading text-lg font-bold">
              {mode === 'email' ? 'Save My Enquiry' : '📥 Download as PDF'}
            </div>
            <div className="text-white/50 text-sm mt-0.5">
              {mode === 'email' ? "Save your estimate details for our team to review." : "Enter your details to generate your PDF."}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0 mt-0.5">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quote total */}
          <div className="p-4 bg-copper/5 rounded-xl border border-copper/20 text-center">
            <div className="text-xs text-black/50 mb-1">Your quote total</div>
            <div className="font-heading text-2xl font-bold text-copper">{formatZAR(total)}</div>
          </div>

          {/* Fields */}
          {[
            { key: 'name',  label: 'Full Name *',  type: 'text',  placeholder: 'Jane Smith' },
            { key: 'email', label: 'Email *',       type: 'email', placeholder: 'jane@example.com' },
            { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+27 82 000 0000' },
          ].map(f2 => (
            <div key={f2.key}>
              <label className="block text-xs font-semibold text-[#2C2C2C]/70 mb-1">{f2.label}</label>
              <input type={f2.type} placeholder={f2.placeholder} value={form[f2.key]}
                onChange={e => f(f2.key, e.target.value)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors[f2.key] ? 'border-red-400' : 'border-black/15 focus:border-copper'}`} />
              {errors[f2.key] && <div className="text-xs text-red-500 mt-1">{errors[f2.key]}</div>}
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-[#2C2C2C]/70 mb-1">How can we help next? (optional)</label>
            <select value={form.howHelp} onChange={e => f('howHelp', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black/15 rounded-xl text-sm focus:outline-none focus:border-copper bg-white">
              <option value="">Select...</option>
              {HOW_HELP.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C2C2C]/70 mb-1">Preferred contact time? (optional)</label>
            <select value={form.contactTime} onChange={e => f('contactTime', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black/15 rounded-xl text-sm focus:outline-none focus:border-copper bg-white">
              <option value="">Select...</option>
              {CONTACT_TIME.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {err && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">{err}</div>}

          <button onClick={submit} disabled={loading}
            className="w-full py-4 bg-copper text-white rounded-full font-bold text-base disabled:opacity-50 hover:bg-copper/90 transition-all flex items-center justify-center gap-2 shadow-lg">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : mode === 'email' ? 'Save My Enquiry' : '📥 Generate & Download PDF'}
          </button>

          <p className="text-xs text-center text-black/30">We respect your privacy. No spam, ever. Unsubscribe anytime.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}