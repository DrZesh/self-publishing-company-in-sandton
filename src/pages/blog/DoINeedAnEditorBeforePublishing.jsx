import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/doineedaneditorbeforepublishing',
  title: 'Do I Need an Editor Before Publishing My Book?',
  description: 'Why every author needs an editor before publishing — the difference editing makes and the types of editing explained.',
  category: 'Editing Guides',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: 'Whether you\'re self-publishing or submitting to a traditional publisher, professional editing is one of the most important investments you\'ll make in your book. Here\'s what you need to know about editing in the South African context.' },
    { heading: 'Types of Editing: Know the Difference', text: 'Developmental editing examines big-picture structure, character, argument, and pacing. Copy editing covers grammar, punctuation, consistency, and fact-checking. Proofreading is the final check for errors before printing. Structural editing for fiction examines plot, character development, and narrative arc.' },
    { heading: 'What Creative Books SA Offers', text: 'Creative Books SA offers three professional editing tiers, all priced per word: Proofreading at R0.25 per word; Copy Editing (non-fiction) at R0.30 per word; Structural Editing (fiction) at R0.40 per word. A 60,000-word manuscript would cost R15,000 for proofreading, R18,000 for copy editing, or R24,000 for structural editing. View <a href="/bookediting">editing services</a>.' },
    { heading: 'Is Editing Included in Full Packages?', text: 'Yes. All of Creative Books SA\'s Full Publishing Packages include two drafts of editing, making them excellent value. The Bronze Package (R21,000) includes editing, cover design, typesetting, and 100 printed copies for manuscripts up to 150 pages. See <a href="/selfpublishingpackagesinsouthafrica">packages</a>.' },
    { heading: 'Bottom Line', text: 'Never publish without professional editing. Unedited books damage your reputation and are obvious to readers. With Creative Books SA\'s inclusive packages, editing is built into your production process — not an afterthought.' },
  ],
  ctaText: 'Get your manuscript professionally edited before publishing. Request a quote from Creative Books SA today.',
  faqs: [
    { q: 'Do I need an editor before self-publishing?', a: 'Yes. Professional editing is essential before publishing. Unedited books contain errors that damage your reputation and are obvious to readers.' },
    { q: 'What is the difference between proofreading and copy editing?', a: 'Proofreading is the final check for surface errors before printing. Copy editing is more thorough, covering grammar, punctuation, consistency, and fact-checking. Structural editing addresses big-picture issues like argument flow and narrative arc.' },
    { q: 'How much does editing cost in South Africa?', a: 'Creative Books SA charges R0.25 per word for proofreading, R0.30 per word for copy editing, and R0.40 per word for structural editing. Editing is also included in all Full Publishing Packages.' },
  ],
  relatedLinks: [
    { label: 'Book Editing Services', path: '/bookediting' },
    { label: 'Proofreading Services', path: '/proofreading' },
    { label: 'Professional Copy Editing', path: '/professionalcopyeditingservices' },
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function DoINeedAnEditorBeforePublishing() {
  return <BlogArticlePage article={article} />;
}