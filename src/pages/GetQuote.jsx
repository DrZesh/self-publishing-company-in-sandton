import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, BookOpen, Printer, PenLine, Palette, Globe, Users, Check, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const serviceOptions = [
  { id: 'publishing', icon: BookOpen, label: 'Book Publishing', desc: 'Complete publishing packages' },
  { id: 'printing', icon: Printer, label: 'Book Printing', desc: 'Print copies of your book' },
  { id: 'editing', icon: PenLine, label: 'Editing', desc: 'Professional editing & proofreading' },
  { id: 'design', icon: Palette, label: 'Design', desc: 'Cover design & typesetting' },
  { id: 'ebook', icon: Globe, label: 'eBook Publishing', desc: 'Digital publishing & KDP' },
  { id: 'ghostwriting', icon: Users, label: 'Ghostwriting', desc: 'Professional ghost writers' },
];

const genres = ['Fiction', 'Non-Fiction', 'Children\'s Book', 'Christian / Religious', 'Memoir / Biography', 'Poetry', 'Academic / Thesis', 'Business', 'Self-Help', 'Other'];
const bookTypes = ['Softcover', 'Hardcover', 'eBook Only', 'Softcover + eBook', 'Hardcover + eBook', 'Not Sure'];

export default function GetQuote() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    services: [],
    genre: '',
    bookType: '',
    wordCount: '',
    name: '',
    email: '',
    phone: '',
    details: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { title: 'What do you need?', subtitle: 'Select all services that apply' },
    { title: 'About your book', subtitle: 'Tell us about your project' },
    { title: 'Your details', subtitle: 'So we can send your personalised quote' },
  ];

  const toggleService = (id) => {
    setData(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id]
    }));
  };

  const canProceed = () => {
    if (step === 0) return data.services.length > 0;
    if (step === 1) return data.genre && data.bookType;
    if (step === 2) return data.name && data.email;
    return false;
  };

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-copper" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-4">Quote Request Received!</h1>
          <p className="text-white/60 font-body leading-relaxed">
            Thank you, {data.name}. We'll review your project details and send a personalised quote to {data.email} within 24 hours.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Get a Quote</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Start Your Publishing Journey</h1>
          <p className="text-white/60 font-body">Answer a few questions and we'll send you a personalised quote.</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 max-w-sm mx-auto">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-copper' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-bold text-white mb-2">{steps[step].title}</h2>
              <p className="text-white/50 text-sm font-body">{steps[step].subtitle}</p>
            </div>

            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {serviceOptions.map((s) => {
                  const Icon = s.icon;
                  const selected = data.services.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleService(s.id)}
                      className={`text-left p-6 rounded-xl border-2 transition-all ${
                        selected ? 'border-copper bg-copper/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${selected ? 'text-copper' : 'text-white/50'}`} />
                        <span className={`font-heading font-semibold ${selected ? 'text-white' : 'text-white/80'}`}>{s.label}</span>
                        {selected && <Check className="w-4 h-4 text-copper ml-auto" />}
                      </div>
                      <p className="text-sm text-white/40 font-body">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <label className="text-sm text-white/60 font-body mb-3 block">Genre / Category</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <button key={g} onClick={() => setData({ ...data, genre: g })}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          data.genre === g ? 'border-copper bg-copper/10 text-white' : 'border-white/10 text-white/60 hover:border-white/20'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 font-body mb-3 block">Book Type</label>
                  <div className="flex flex-wrap gap-2">
                    {bookTypes.map((t) => (
                      <button key={t} onClick={() => setData({ ...data, bookType: t })}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          data.bookType === t ? 'border-copper bg-copper/10 text-white' : 'border-white/10 text-white/60 hover:border-white/20'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 font-body mb-1.5 block">Approximate Word Count</label>
                  <Input value={data.wordCount} onChange={(e) => setData({ ...data, wordCount: e.target.value })}
                    placeholder="e.g. 30,000" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 max-w-md mx-auto">
                <div>
                  <label className="text-sm text-white/60 font-body mb-1.5 block">Full Name *</label>
                  <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Your name" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div>
                  <label className="text-sm text-white/60 font-body mb-1.5 block">Email *</label>
                  <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="you@email.com" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div>
                  <label className="text-sm text-white/60 font-body mb-1.5 block">Phone</label>
                  <Input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="+27..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div>
                  <label className="text-sm text-white/60 font-body mb-1.5 block">Additional Details</label>
                  <Textarea value={data.details} onChange={(e) => setData({ ...data, details: e.target.value })}
                    placeholder="Tell us more about your project..." rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 max-w-md mx-auto">
          <button onClick={() => setStep(Math.max(0, step - 1))}
            className={`flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/60 rounded-full hover:border-white/20 transition-all ${step === 0 ? 'invisible' : ''}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < 2 ? (
            <button onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Submit Request <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}