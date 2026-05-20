import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howdoigetmybookpublishedinsouthafrica',
  title: 'How Do I Get My Book Published in South Africa?',
  description: 'How to get your book published in South Africa — step-by-step from manuscript to print, choosing between traditional and self-publishing. Keep 100% of your rights.',
  category: 'Publishing Tips',
  readTime: '9 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: 'Getting published in South Africa is a goal shared by thousands of writers every year. Whether you\'re writing literary fiction, business non-fiction, children\'s books, or poetry, the pathway to publication differs. Here is a step-by-step guide tailored to the South African publishing landscape.' },
    { heading: 'Step 1: Finish and Polish Your Manuscript', text: 'No publisher or agent will take your work seriously if it is unfinished or unpolished. Complete your first draft, then revise it thoroughly. Consider hiring a developmental editor or manuscript assessor to give you objective feedback before submitting anywhere.' },
    { heading: 'Step 2: Choose Your Publishing Route', text: 'Your two main options are traditional publishing and self-publishing. For authors who want full control, faster timelines, and the ability to keep 100% of their profits, self-publishing with a professional partner like Creative Books SA is an excellent choice. Creative Books SA handles editing, cover design, typesetting, printing, and eBook conversion — giving South African authors a one-stop publishing solution.' },
    { heading: 'Step 3: Prepare Your Manuscript', text: 'Whether you self-publish or submit to traditional publishers, your manuscript needs to be at a professional standard. Most publishers and self-publishing services require a Word document formatted to the required book size. A5 or 6×9 are standard formats used in South African publishing.' },
    { heading: 'Step 4: Editing', text: 'Professional editing is non-negotiable. Creative Books SA offers three levels of editing: Proofreading at R0.25 per word, Copy Editing at R0.30 per word, and Structural Editing at R0.40 per word. Learn more about <a href="/bookediting">book editing services</a>.' },
    { heading: 'Step 5: Cover Design and Layout', text: 'Your cover is your book\'s first impression. Creative Books SA\'s cover design starts at R1,650 for an Author\'s Cover using your professional photo, and R2,150 for a Stock Design Cover. Interior layout starts at R10.50 per page. View <a href="/bookcoverdesign">cover design options</a>.' },
    { heading: 'Step 6: Printing or eBook Publishing', text: 'Creative Books SA prints a minimum of 100 copies. A standard 150-page A5 book on cream paper costs R6,250 for 100 copies. For digital distribution, their eBook package starts at R6,500. See <a href="/bookprinting">printing pricing</a> or <a href="/ebookpublishing">eBook options</a>.' },
    { heading: 'Step 7: Evaluate Your Full Package Options', text: 'If you want everything handled under one roof, Creative Books SA\'s Full Publishing Packages start at R21,000 (Bronze) and include editing, cover design, typesetting, and 100 printed copies. View the <a href="/selfpublishingpackagesinsouthafrica">self-publishing packages</a>.' },
  ],
  ctaText: 'Ready to get your book published professionally in South Africa? Request a quote from Creative Books SA and get your publishing journey started today.',
  faqs: [
    { q: 'How do I get my book published in South Africa?', a: 'Finish and polish your manuscript, choose between traditional or self-publishing, get professional editing and cover design, then print or publish digitally. Creative Books SA offers a full one-stop service.' },
    { q: 'Do I need a literary agent to publish in South Africa?', a: 'Not necessarily. Many South African publishers accept unagented submissions directly. If you self-publish with Creative Books SA, you deal directly with their team — no agent required.' },
    { q: 'How long does it take to publish a book in South Africa?', a: 'Self-publishing with Creative Books SA typically takes 3–4 months from manuscript to printed book. Traditional publishing can take 12–30 months.' },
    { q: 'What format should my manuscript be in?', a: 'Send your manuscript as a Word document. A5 and 6×9 are the standard book sizes used at Creative Books SA.' },
  ],
  relatedLinks: [
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Book Editing Services', path: '/bookediting' },
    { label: 'Book Cover Design', path: '/bookcoverdesign' },
    { label: 'Book Printing', path: '/bookprinting' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowDoIGetMyBookPublished() {
  return <BlogArticlePage article={article} />;
}