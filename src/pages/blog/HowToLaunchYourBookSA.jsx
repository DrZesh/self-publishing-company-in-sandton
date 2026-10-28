import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howtolaunchyourbooksuccessfullyinsouthafrica',
  title: 'How to Launch Your Book Successfully in South Africa',
  description: 'How to launch your book in South Africa — 3-month launch plan, venue choices, review copy strategy, social media and post-launch sales activities.',
  category: 'Publishing Tips',
  readTime: '8 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "A book launch is not just a party — it's the centrepiece of your book's marketing strategy. Done well, it creates momentum, generates media coverage, drives sales, and builds community around your work." },
    { heading: 'Start Planning at Least 3 Months Out', text: "3 months before: finalise launch venue, start advance reader copy (ARC) distribution, begin media outreach. 6–8 weeks before: send review copies to press and book influencers. 4 weeks before: begin regular social media content, open pre-orders. Launch week: events, interviews, social media push, reader interaction." },
    { heading: 'Ensure Your Book Is Launch-Ready', text: "Your book must be professionally printed and designed before launch. Creative Books SA's production timelines typically deliver completed books within 3–4 months of starting the process. Book mockups (included in all Creative Books SA packages) are essential for social media and media outreach. Plan your launch date after confirming your production timeline. <a href='/getquote'>Request a quote</a> to plan your timeline." },
    { heading: 'Choose the Right Venue', text: "Bookshop launches are the gold standard in South Africa. Independent bookshops like Love Books (Melville, Johannesburg) and The Book Lounge (Cape Town) are experienced in author events. Alternative venues — galleries, libraries, restaurants, community spaces — work well for niche audiences." },
    { heading: 'Post-Launch Sustaining Activities', text: "Most book sales happen not at launch but in the weeks and months after. Keep generating content: write articles related to your book's themes for South African publications, accept podcast invitations, speak at events. The long tail of book sales is built on sustained visibility." },
  ],
  ctaText: "Ensure your book is launch-ready with professional production from Creative Books SA. Request a quote and plan your timeline today.",
  faqs: [
    { q: 'How do I launch a book successfully in South Africa?', a: "Plan at least 3 months in advance. Send review copies early, build social media momentum, choose an appropriate venue, and prepare sustaining content for the weeks after launch." },
    { q: 'Where should I launch my book in South Africa?', a: "Bookshop launches are ideal. Independent bookshops like Love Books (Johannesburg) and The Book Lounge (Cape Town) regularly host author events. Community spaces, libraries, and galleries also work well for specific audiences." },
    { q: 'How long does book launch preparation take?', a: "Ideally 3 months of active preparation. Your book should be printed and in hand at least 2 weeks before the launch event." },
  ],
  relatedLinks: [
    { label: 'How to Market Your Book', path: '/howtomarketandsellyourselfpublishedbookinsouthafrica' },
    { label: 'Self Publishing Packages', path: '/self-publishing-packages-in-south-africa' },
    { label: 'How to Print Your Book', path: '/howtoprintyourselfpublishedbookinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowToLaunchYourBookSA() {
  return <BlogArticlePage article={article} />;
}