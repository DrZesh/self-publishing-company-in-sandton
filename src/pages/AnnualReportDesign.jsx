import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Users, FileText, Edit3, Calendar, Camera, Printer, ChevronDown } from 'lucide-react';
import PageMeta from '../components/shared/PageMeta';
import CTASection from '../components/shared/CTASection';
import TestimonialsSection from '../components/shared/TestimonialsSection';

const processSteps = [
  {
    icon: Users,
    title: 'Right Team',
    description: 'Make sure you appoint the right team from your company to gather the information required and project manage the annual report design professionally.',
  },
  {
    icon: FileText,
    title: 'Gather the Information',
    description: 'Garbage in, garbage out! Providing the right content is something that should happen all throughout the year, to avoid a mad year-end scramble.',
  },
  {
    icon: Edit3,
    title: 'Review & Edit',
    description: "After the annual report design and copy is completed, the first draft will be sent for review and edits will be applied. It's critical to allow enough time for a proper review process.",
  },
  {
    icon: Calendar,
    title: 'Project Plan',
    description: 'You will need a detailed project plan for your annual report design, detailing who is doing what, and by when, to meet the deadline.',
  },
  {
    icon: Camera,
    title: 'Design, Copy & Photos',
    description: 'Design and copywriting can commence after the written brief is received and all the content has been collated. At this point you can commission your photographer to shoot images needed.',
  },
  {
    icon: Printer,
    title: 'Print & Publish',
    description: 'After final approval, the final annual report design will be sent to the printer.',
  },
];

const plans = [
  {
    name: 'Basic',
    price: 'R 25,000',
    pages: 'Up to 50 Pages',
    color: 'from-white/5 to-white/10',
    borderColor: 'border-white/10',
    highlight: false,
    features: ['Cover Design', 'Collage Artwork', 'Typographic Work', 'Layout'],
  },
  {
    name: 'Standard',
    price: 'R 48,000',
    pages: 'Up to 100 Pages',
    color: 'from-copper/10 to-copper/20',
    borderColor: 'border-copper/40',
    highlight: true,
    features: ['Cover Design', 'Collage Artwork', 'Typographic Artwork', 'Layout'],
  },
  {
    name: 'Gold',
    price: 'R 71,000',
    pages: 'Up to 150 Pages',
    color: 'from-white/5 to-white/10',
    borderColor: 'border-white/10',
    highlight: false,
    features: ['Cover Design', 'Collage Artwork', 'Typographic Artwork', 'Layout'],
  },
  {
    name: 'Personal',
    price: 'R 94,000',
    pages: 'Up to 200 Pages',
    color: 'from-white/5 to-white/10',
    borderColor: 'border-white/10',
    highlight: false,
    features: ['Cover Design', 'Collage Artwork', 'Typographic Artwork', 'Layout'],
  },
];

export default function AnnualReportDesign() {
  const [activeStep, setActiveStep] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  return (
    <div className="bg-obsidian min-h-screen">
      <PageMeta
        title="Annual Report Design Sandton | Creative Books SA"
        description="Professional annual report design services in Sandton, South Africa. Expert layout, typesetting, cover design and print-ready annual reports for corporates."
        keywords="annual report design Sandton, annual report design South Africa, corporate report design, annual report layout"
      />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&q=80"
            alt="Annual Report Design"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/97 via-[#0F0F0F]/85 to-[#0F0F0F]/50" />
        </div>
        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-copper/20 blur-3xl pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">Design & Layout</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Annual Report <span className="text-copper">Design</span> in Sandton
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 font-body">
              Elevate your corporate identity with world-class annual report design. From layout and typesetting to print-ready files — we handle every detail professionally.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20">
                Get a Free Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#process" className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all">
                See Our Process
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">Design Process</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto font-body">A structured, professional approach to deliver your annual report on time and on brand.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveStep(isActive ? null : i)}
                  className={`cursor-pointer relative rounded-2xl p-8 border transition-all duration-300 ${
                    isActive
                      ? 'bg-copper/10 border-copper/40 shadow-lg shadow-copper/10'
                      : 'bg-white/5 border-white/10 hover:border-copper/30 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-copper' : 'bg-white/10'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-copper'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-lg font-semibold text-white">{step.title}</h3>
                        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-white/60 leading-relaxed font-body mt-3"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      {!isActive && (
                        <p className="text-sm text-white/40 mt-1 line-clamp-2 font-body">{step.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="absolute top-4 right-4 text-xs text-white/20 font-heading font-bold">{String(i + 1).padStart(2, '0')}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1a1008 50%, #0F0F0F 100%)' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-copper/5 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-copper/5 blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Pricing Plan</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">Design & Layout</h2>
            <p className="text-white/50 mt-3 font-body text-sm">Annual Report, APP, Book, Magazine, and Coffee Table Books</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-500 overflow-hidden
                  ${plan.highlight ? 'border-copper/50 scale-105' : `${plan.borderColor} hover:border-copper/30`}
                  ${hoveredPlan === i ? 'shadow-2xl shadow-copper/20 -translate-y-2' : ''}
                `}
                style={{
                  background: plan.highlight
                    ? 'linear-gradient(135deg, rgba(184,115,51,0.15), rgba(184,115,51,0.05))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                }}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper to-transparent" />
                )}
                {plan.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="text-xs bg-copper text-white px-2 py-0.5 rounded-full font-body font-medium">Popular</span>
                  </div>
                )}

                {/* Glassmorphism shimmer */}
                <motion.div
                  animate={hoveredPlan === i ? { opacity: [0, 0.1, 0] } : { opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                />

                <div className="p-8">
                  <h3 className="font-heading text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-1">
                    <span className="font-heading text-3xl font-bold text-copper">{plan.price}</span>
                  </div>
                  <p className="text-white/40 text-xs font-body mb-6">{plan.pages}</p>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-white/70 font-body">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-copper' : 'bg-white/10'}`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        {f}
                      </li>
                    ))}
                    <li className="flex items-center gap-3 text-sm font-medium text-copper font-body">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-copper' : 'bg-copper/20'}`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      {plan.pages}
                    </li>
                  </ul>

                  <Link
                    to="/getquote"
                    className={`block w-full text-center py-3 rounded-full text-sm font-medium transition-all duration-300 font-body
                      ${plan.highlight
                        ? 'bg-copper text-white hover:bg-copper/90 shadow-lg shadow-copper/20'
                        : 'border border-white/20 text-white hover:border-copper hover:text-copper'
                      }`}
                  >
                    Choose Plan
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection light />
      <CTASection
        title="Ready to Design Your Annual Report?"
        description="Get a personalised quote for your annual report design. Our team in Sandton is ready to bring your brand to life."
      />
    </div>
  );
}