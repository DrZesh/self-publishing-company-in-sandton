import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howtobuildanauthorplatformbeforepublishing',
  title: 'How to Build an Author Platform | Step-by-Step Guide',
  description: 'Build your author platform from scratch — website, social media, email list and reader community that sells more books.',
  category: 'Writing Tips',
  readTime: '7 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Publishers increasingly look for authors who already have an audience. For self-published authors, your platform is your marketing engine. Building yours before your book launches gives you the best chance of a successful debut." },
    { heading: 'What Is an Author Platform?', text: "Your author platform is the sum total of your visibility, credibility, and reach — your website, email list, social media following, media presence, and professional reputation. Think of it as your direct line to readers." },
    { heading: 'Start With Your Email List', text: "Your email list is your most valuable platform asset — unlike social media followers, no algorithm can take it away. Start building an email list immediately, even before your book is finished. Offer a free resource relevant to your book's topic in exchange for sign-ups." },
    { heading: 'Choose Your Social Media Platform Strategically', text: "You don't need to be everywhere. Choose 1–2 platforms where your target readers actually spend time: literary fiction authors gravitate toward Instagram; business/non-fiction authors toward LinkedIn; younger audiences toward TikTok (BookTok); South African general audience toward Facebook groups." },
    { heading: 'Your Author Website', text: "A professional author website is the hub of your platform. Creative Books SA offers author website design as part of their publishing services — ensuring your online presence matches the professional quality of your printed book. Learn more about <a href='/authorwebsites'>author websites</a>." },
    { heading: 'Engage With the South African Literary Community', text: "Attend and participate in events like the Open Book Festival (Cape Town), the Franschhoek Literary Festival, and the Time of the Writer (Durban). The South African literary community is tight-knit — being visible and generous within it builds your profile organically." },
  ],
  ctaText: "Ready to launch your author platform with a professionally produced book? Request a quote from Creative Books SA today.",
  faqs: [
    { q: 'What is an author platform?', a: "Your author platform is your combined visibility and reach — website, email list, social media following, and professional reputation. It's your direct line to readers." },
    { q: 'Do I need an author website before publishing?', a: "Yes. An author website is the professional hub of your platform. Creative Books SA offers author website design as part of their publishing services." },
    { q: 'How do I build an audience before my book is published?', a: "Start with an email list, choose 1–2 social media platforms strategically, create content related to your book's theme, and engage with the South African literary community." },
  ],
  relatedLinks: [
    { label: 'Author Websites', path: '/authorwebsites' },
    { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
    { label: 'How to Market Your Book', path: '/howtomarketandsellyourselfpublishedbookinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowToBuildAuthorPlatform() {
  return <BlogArticlePage article={article} />;
}