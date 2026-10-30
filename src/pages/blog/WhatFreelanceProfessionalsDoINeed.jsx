import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/whatfreelanceprofessionalsdoineedtoselfpublish',
  title: 'What Freelance Professionals Do I Need to Publish a Book?',
  description: 'Which freelance professionals do self-publishing authors need? Editors, designers, typesetters and proofreaders explained — and why one-stop services save money.',
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Going the self-publishing route in South Africa means assembling your own publishing team — unless you use a full-service provider like Creative Books SA, who bring all these professionals under one roof." },
    { heading: 'The Individual Services You Need', text: "A professionally self-published book requires: a developmental editor or manuscript assessor; a copyeditor; a proofreader; a cover designer; and an interior layout designer/typesetter. Sourcing these separately can be time-consuming and expensive." },
    { heading: 'Creative Books SA: All Services Under One Roof', text: "Creative Books SA offers all of the above services with transparent, per-unit pricing: Proofreading at R0.25 per word; Copy Editing at R0.30 per word; Structural Editing at R0.40 per word; Cover Design from R1,650 to R3,850; Typesetting from R12 to R20 per page; and Printing from R5,500 for 100 copies. Their <a href='/self-publishing-packages-in-south-africa'>Full Packages from R21,000</a> bundle everything together at a saving." },
    { heading: 'Why a One-Stop Publisher Saves You Time and Money', text: "When your editor, designer, typesetter, and printer all work together under one project manager — as they do at Creative Books SA — the production process is faster, more cohesive, and less prone to the communication breakdowns that occur when you're coordinating multiple freelancers independently." },
  ],
  ctaText: 'Get all your self-publishing professionals under one roof. Request a quote from Creative Books SA today.',
  faqs: [
    { q: 'What professionals do I need to self-publish a book?', a: 'You need an editor (developmental, copy, or proofreader), a cover designer, an interior layout designer/typesetter, and a printer. Creative Books SA provides all of these under one roof.' },
    { q: 'Is it cheaper to hire freelancers or use a full-service publisher?', a: "Full-service providers like Creative Books SA often offer better value because all professionals work together seamlessly, reducing miscommunication and revision costs." },
  ],
  relatedLinks: [
    { label: 'Book Editing Services', path: '/book-editing' },
    { label: 'Book Cover Design', path: '/book-cover-design' },
    { label: 'Book Typesetting', path: '/typesetting' },
    { label: 'Self Publishing Packages', path: '/self-publishing-packages-in-south-africa' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function WhatFreelanceProfessionalsDoINeed() {
  return <BlogArticlePage article={article} />;
}