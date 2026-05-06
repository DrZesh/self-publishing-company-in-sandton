import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import FAQSection from '../../components/shared/FAQSection';
import InternalLinks from '../../components/shared/InternalLinks';
import SectionHeading from '../../components/shared/SectionHeading';

const considerations = [
  { title: 'Rights Retention', desc: 'Ensure you keep 100% of your intellectual property rights and royalties.' },
  { title: 'Transparent Pricing', desc: 'Look for fixed pricing with no hidden fees or unexpected costs.' },
  { title: 'Quality Samples', desc: 'Review samples of their editing, cover design, and printed books.' },
  { title: 'Author Testimonials', desc: 'Seek verified reviews and testimonials from published authors.' },
  { title: 'Local Expertise', desc: 'A South African company understands ISBN registration, local bookstores, and the SA market.' },
  { title: 'Full-Service Offering', desc: 'Editing, design, printing, and distribution in one place saves time and reduces costs.' },
];

const faqs = [
  { question: 'What makes a publishing company the best in South Africa?', answer: 'The best publishing companies in South Africa offer transparent pricing, author rights retention, quality editing, professional design, reliable printing, and strong author support — all under one roof.' },
  { question: 'Should I choose self-publishing or traditional publishing?', answer: 'Self-publishing with professional support (like Creative Books SA) gives authors the quality of traditional publishing with full rights, higher royalties, and faster timelines. Traditional publishers accept less than 1% of submissions.' },
  { question: 'What should I look for in a publishing contract?', answer: 'Ensure you retain all intellectual property rights, understand royalty percentages, check for hidden fees, confirm what services are included, and verify the timeline commitments.' },
  { question: 'How do I know if a publishing company is reputable?', answer: 'Look for a physical address in South Africa, published book samples, verifiable author testimonials, clear pricing, and membership in publishing industry bodies.' },
  { question: 'Is Creative Books SA a good publishing company?', answer: 'Creative Books SA has 15+ years of experience, 500+ published titles, and a 98% author satisfaction rate. We are based in Johannesburg and serve authors across South Africa.' },
];

export default function BestPublishingCompaniesSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Best Publishing Companies in South Africa | Author Guide"
        description="Compare publishing options in South Africa and learn what to look for when choosing the best publishing company for your book."
        keywords="best publishing companies in South Africa, best book publishers South Africa, publishing company comparison"
      />
      <div>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center pt-20">
          <div className="absolute inset-0">
            <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png" alt="Best Publishing Companies in South Africa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/80 to-[#0F0F0F]/60" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
              <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">Author Guide</span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Best Publishing Companies in South Africa</h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 font-body">A practical guide to comparing publishing options in South Africa and choosing the right publishing company for your book.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/getquote" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20">
                  Get a Free Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all">Contact Us</Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What Makes a Good Publishing Company */}
        <section className="py-20 bg-vellum">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading subtitle="What to Look For" title="What Makes a Good Publishing Company?" description="Not all publishing companies are equal. Here are the key criteria to evaluate before signing any agreement." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {considerations.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-2xl border border-[#0F0F0F]/5 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-copper mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Self vs Traditional */}
        <section className="py-20 bg-obsidian">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading subtitle="Publishing Options" title="Self Publishing vs Traditional Publishing" light />
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { type: 'Traditional Publishing', pros: ['Prestige and credibility', 'Publisher covers all costs', 'Access to retail distribution'], cons: ['Less than 1% acceptance rate', 'Takes 2–4 years', 'Author keeps only 10–15% royalties', 'Loss of creative control'] },
                { type: 'Self Publishing (with Creative Books SA)', pros: ['You keep 100% of rights', 'Higher royalties (60–80%)', 'Publish in 4–12 weeks', 'Full creative control'], cons: ['Upfront investment required', 'You manage marketing', 'Distribution takes more effort'] },
              ].map((col, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h3 className="font-heading text-xl font-semibold text-white mb-6">{col.type}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-copper text-xs tracking-widest uppercase mb-2 font-body">Advantages</p>
                      <ul className="space-y-2">{col.pros.map((p, j) => <li key={j} className="flex items-start gap-2 text-sm text-white/70 font-body"><CheckCircle className="w-4 h-4 text-copper shrink-0 mt-0.5" />{p}</li>)}</ul>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-body">Considerations</p>
                      <ul className="space-y-2">{col.cons.map((c, j) => <li key={j} className="text-sm text-white/50 font-body pl-6">• {c}</li>)}</ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Creative Books SA */}
        <section className="py-20 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <SectionHeading subtitle="Why Choose Us" title="Why Creative Books SA Is a Strong Option" description="With 15+ years of experience, 500+ published titles, and a 98% author satisfaction rate, Creative Books SA is one of South Africa's most trusted publishing partners." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {[['15+', 'Years Experience'], ['500+', 'Books Published'], ['98%', 'Author Satisfaction'], ['100%', 'Rights Retained']].map(([num, label]) => (
                <div key={label} className="bg-white p-6 rounded-2xl border border-[#0F0F0F]/5 shadow-sm text-center">
                  <p className="font-heading text-3xl font-bold text-copper">{num}</p>
                  <p className="text-sm text-[#0F0F0F]/60 font-body mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQSection faqs={faqs} light />
        <InternalLinks links={[
          { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
          { label: 'Book Publishers SA', path: '/bookpublisherssouthafrica' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Book Printing', path: '/bookprinting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]} light />
        <CTASection title="Ready to Choose the Right Publishing Partner?" description="Get a free consultation with Creative Books SA and discover how we can help you publish with confidence." />
      </div>
    </>
  );
}