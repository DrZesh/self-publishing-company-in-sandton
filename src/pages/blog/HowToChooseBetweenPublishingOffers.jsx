import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howtochoosebetweenmultiplebookpublishingoffers',
  title: 'How to Choose Between Multiple Book Publishing Offers',
  description: 'How to choose between publishing offers in South Africa — comparing contracts, royalties, rights, track records and when self-publishing is the better choice.',
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Receiving multiple publishing offers is an enviable problem. Here's how to evaluate your options carefully." },
    { heading: "Don't Just Chase the Biggest Advance", text: "A smaller publisher deeply passionate about your book with a focused marketing plan may well outperform a larger house that treats your book as a secondary title." },
    { heading: "Evaluate Each Publisher's Track Record", text: "Did comparable titles get wide bookshop distribution? Were they reviewed in major South African publications? Did they sell through their initial print runs? Author forums and Facebook groups can provide candid publisher feedback." },
    { heading: 'Compare the Contract Terms', text: "Beyond royalty rates and advances, compare: territory (South Africa only, or world rights?); rights granted; reversion clause; and option clause breadth." },
    { heading: 'Consider the Self-Publishing Alternative', text: "If neither offer is compelling, remember that self-publishing with Creative Books SA gives you full control, 100% of revenue, and a professional-quality book — often faster than waiting for a traditional publisher's production cycle. Compare the options on their <a href='/selfpublishingpackagesinsouthafrica'>packages page</a>." },
  ],
  ctaText: "Compare every option before you sign. Request a Creative Books SA quote to see what professional self-publishing looks like as an alternative.",
  faqs: [
    { q: 'How do I choose between publishing offers in South Africa?', a: "Compare track records, royalty rates, contract terms (especially reversion clauses and rights), marketing commitment, and whether the publisher has a genuine passion for your book." },
    { q: 'Is self-publishing better than a bad traditional deal?', a: "Often yes. If neither traditional offer is compelling, self-publishing with Creative Books SA gives you full control, 100% revenue, and faster time to market." },
  ],
  relatedLinks: [
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'What is a Fair Book Deal', path: '/whatisafairbookdealforsouthafricanauthors' },
    { label: 'Questions to Ask a Publisher', path: '/questionstoaskapublisher' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowToChooseBetweenPublishingOffers() {
  return <BlogArticlePage article={article} />;
}