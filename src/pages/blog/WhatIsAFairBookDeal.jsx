import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/whatisafairbookdealforsouthafricanauthors',
  title: 'What Is a Fair Book Deal?',
  description: 'What South African authors should look for in a publishing contract — royalty rates, rights ownership, advances and the red flags that signal a bad deal.',
  category: 'Publishing Tips',
  readTime: '7 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: 'When a South African publisher offers you a book deal, how do you know if the terms are fair? Understanding standard terms in the local publishing industry will help you negotiate with confidence — or decide that self-publishing is a better business decision.' },
    { heading: 'Royalty Rates: What to Expect from Traditional Publishers', text: 'Standard royalty rates from traditional publishers typically fall in these ranges: 10–15% of net receipts for trade paperback; 15–20% for hardcover; 25–50% for eBook; 5–8% for mass market paperback.' },
    { heading: 'What Self-Publishing Offers Instead', text: 'With Creative Books SA, you pay a once-off production fee and keep 100% of your sales income — no royalty split, no advance to earn back. Their Full Package Bronze (R21,000) covers editing, cover design, typesetting, and 100 printed copies of up to 150 pages. Compare this to a traditional deal where R26 per copy at 10% royalty on a R260 book would require 808 sales just to equal R21,000 in earned royalties. View <a href="/selfpublishingpackagesinsouthafrica">full packages</a>.' },
    { heading: 'Rights: What Are You Giving Away?', text: 'Pay close attention to rights clauses in any traditional contract: world rights vs South African rights; subsidiary rights (translation, film, audio); reversion clause; and the contract term. With Creative Books SA\'s self-publishing model, you retain all rights to your work at all times.' },
    { heading: 'Red Flags in Any Publishing Arrangement', text: 'Watch out for: no reversion clause in a traditional contract; excessively long option clauses; vague out-of-print definitions; royalty rates below industry norms; and in self-publishing, any company promising guaranteed success or charging hidden fees after the initial invoice.' },
  ],
  ctaText: 'Want to keep 100% of your revenue and retain all rights? Creative Books SA offers transparent, once-off self-publishing packages. Request a quote today.',
  faqs: [
    { q: 'What is a fair royalty rate for a South African author?', a: 'Standard rates are 10–15% for trade paperback, 15–20% for hardcover, and 25–50% for eBooks from traditional publishers. Self-publishing through Creative Books SA means you keep 100% of sales income.' },
    { q: 'What rights should I retain in a publishing contract?', a: 'At minimum, ensure you retain copyright, have a clear reversion clause, and understand exactly which subsidiary rights you are granting. With Creative Books SA self-publishing, you retain all rights.' },
    { q: 'What is a reversion clause?', a: 'A reversion clause returns your publishing rights to you if the book goes out of print or falls below a minimum sales threshold. Always insist on a clear reversion clause with defined thresholds.' },
  ],
  relatedLinks: [
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Self Publishing vs Traditional Publishing', path: '/selfpublishingvstraditionalpublishing' },
    { label: 'Questions to Ask a Publisher', path: '/questionstoaskapublisher' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function WhatIsAFairBookDeal() {
  return <BlogArticlePage article={article} />;
}