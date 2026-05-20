import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/whattolookforinsouthafricanpublishingcontract',
  title: 'What to Look for in a Publishing Contract',
  description: 'What to look for in a publishing contract — royalties, rights granted, reversion clauses, option clauses and red flags every South African author should know.',
  category: 'Publishing Tips',
  readTime: '7 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "A publishing contract is a legally binding agreement that will govern your relationship with your publisher and control the fate of your work for years, possibly decades. Understanding the key clauses before you sign is essential." },
    { heading: 'Royalty Rates and Payment Terms', text: "Ensure the royalty rate is clearly stated as a percentage of either RRP or net receipts. Check payment frequency — quarterly or semi-annually is standard. Confirm the threshold for payment." },
    { heading: 'Rights Granted', text: "You are granting the publisher a licence to publish your work. Examine: territorial rights; format rights (print, digital, audio, large print); language rights; and subsidiary rights (film, TV, translation, merchandise). With Creative Books SA's self-publishing service, you retain all rights at all times." },
    { heading: 'The Option Clause', text: "Most publishing contracts include an option clause requiring you to offer your next book to the same publisher first. Be wary of broadly worded options. Negotiate for a narrow option with a time-limited response period." },
    { heading: 'Out-of-Print and Reversion Clause', text: "Ensure the clause specifies a minimum sales threshold (e.g., fewer than 200 copies sold in any 12-month period) that triggers reversion of rights to you — not merely the physical availability of stock." },
    { heading: 'Warranties and Indemnities', text: "You will be asked to warrant that the work is original and does not infringe copyright or contain defamatory material. Understand the indemnity provisions before signing." },
  ],
  ctaText: "Avoid complex contracts entirely. Self-publish with Creative Books SA — transparent once-off fees, no royalty splits, and you retain all rights.",
  faqs: [
    { q: 'What should I look for in a South African publishing contract?', a: "Check royalty rates, rights granted, the option clause, reversion clause terms, and warranties. Ensure the reversion clause has a clear sales threshold that returns rights to you." },
    { q: 'What is a reversion clause in a publishing contract?', a: "A reversion clause returns publishing rights to the author when the book goes out of print or falls below a minimum sales threshold. Insist on a specific numerical threshold, not vague language." },
    { q: 'Do I retain copyright when signing a publishing contract?', a: "You should retain copyright (ownership) and only license publishing rights to the publisher. Never permanently assign copyright unless you fully understand the implications." },
  ],
  relatedLinks: [
    { label: 'What is a Fair Book Deal', path: '/whatisafairbookdealforsouthafricanauthors' },
    { label: 'Questions to Ask a Publisher', path: '/questionstoaskapublisher' },
    { label: 'Copyright FAQs for Authors', path: '/copyrightfaqsforauthors' },
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function WhatToLookForInPublishingContract() {
  return <BlogArticlePage article={article} />;
}