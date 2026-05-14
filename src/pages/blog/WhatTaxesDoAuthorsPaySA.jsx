import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/whattaxesdoselfpublishedauthorspayinsouthafrica',
  title: 'What Taxes Do Self-Published Authors Pay in South Africa?',
  description: "Tax obligations for self-published South African authors — income tax, deductible expenses, using Creative Books SA invoices as tax documents, and when to get professional advice.",
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Money from book sales is income — and SARS expects its share. Navigating your tax obligations as a self-published South African author is important from the start." },
    { heading: 'Author Income Is Taxable', text: "Whether you earn income from direct book sales, speaking fees, or any other author-related source, these are taxable income in South Africa and must be declared to SARS (South African Revenue Service)." },
    { heading: 'Personal Income Tax', text: "For most self-published authors, income from writing is added to your total personal income and taxed at the applicable marginal rate. You file an annual income tax return (ITR12) and include all author-related income." },
    { heading: 'Deductible Business Expenses', text: "Authors can deduct legitimate business expenses against their author income, reducing taxable profit. Deductible expenses include: professional editing and proofreading; cover design and layout; website hosting and domain; author platform software; books purchased for research; a portion of home office costs; and travel to events and book launches." },
    { heading: 'Your Creative Books SA Invoice as a Tax Document', text: "When you engage Creative Books SA for editing, design, typesetting, or printing services, their invoices constitute legitimate business expenses that are deductible against your author income. Keep all receipts and invoices from your publishing production process." },
    { heading: 'Get Professional Advice', text: "Consult a tax practitioner familiar with creative industry income. Keeping meticulous records of all income and expenses from the start will make tax season significantly less stressful." },
  ],
  ctaText: "Invest in professional book production with Creative Books SA — your production invoices are legitimate business expenses deductible against your author income.",
  faqs: [
    { q: 'Do South African authors pay tax on book sales?', a: "Yes. Author income from book sales, speaking fees, and other related sources is taxable and must be declared to SARS in your annual ITR12 return." },
    { q: 'What expenses can South African authors deduct?', a: "Professional editing, cover design, typesetting, printing, website hosting, research materials, author platform tools, home office costs, and travel to events are all potentially deductible." },
    { q: 'Is a self-published author considered a sole trader?', a: "In most cases, yes. Your author income is typically declared as personal income from a sole proprietorship. Consult a tax practitioner familiar with creative industry taxation for specific guidance." },
  ],
  relatedLinks: [
    { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
    { label: 'How Much Will I Earn', path: '/howmuchwilliearnfrommyfirstbook' },
    { label: "Can You Make a Living as an Author", path: '/canyoumakealivingasaselfpublishedauthorinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function WhatTaxesDoAuthorsPaySA() {
  return <BlogArticlePage article={article} />;
}