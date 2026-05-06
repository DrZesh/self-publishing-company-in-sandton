import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';

export default function BookCoverDesign() {
  return (
    <ServicePageTemplate
      heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/63376ef11_generated_5bcb307c.png"
      subtitle="Book Cover Design South Africa"
      title="Stunning Book Cover Design"
      description="Professional book cover design that captures your vision and attracts readers. Custom cover designs for every genre — fiction, non-fiction, children's books, academic, and more."
      features={[
        { title: 'Custom Cover Design', description: 'Unique designs tailored to your genre, audience, and creative vision. No templates.' },
        { title: 'Print & Digital Versions', description: 'Receive print-ready cover files and optimised digital versions for online platforms.' },
        { title: 'Spine & Back Cover', description: 'Complete cover design including front, spine, and back cover with blurb and barcode placement.' },
        { title: 'Multiple Concepts', description: 'We provide 2–3 initial concepts and work with you through revisions until you\'re delighted.' },
        { title: 'Genre Expertise', description: 'Our designers specialise in fiction, non-fiction, children\'s, Christian, and academic covers.' },
        { title: 'Fast Turnaround', description: 'Initial concepts within 5 business days. Complete design within 2 weeks.' },
      ]}
      processSteps={[
        { title: 'Creative Brief', description: 'Share your vision, genre, target audience, and any reference designs you admire.' },
        { title: 'Concept Development', description: 'Our designers create 2–3 unique cover concepts based on your brief.' },
        { title: 'Revisions', description: 'Choose your favourite concept and we refine it through rounds of revisions.' },
        { title: 'Final Delivery', description: 'Receive print-ready and digital files in all required formats.' },
      ]}
      faqs={[
        { question: 'How much does book cover design cost?', answer: 'Custom book cover design starts from R2,500 for a front cover only and R4,500 for a complete cover (front, spine, back). Premium designs with illustration or custom artwork start from R6,000.' },
        { question: 'How many revisions are included?', answer: 'All our cover design packages include up to 3 rounds of revisions. Additional revision rounds can be purchased if needed.' },
        { question: 'Can I provide my own images?', answer: 'Yes, you can provide your own photos or artwork. We can also source professional stock images or commission custom illustrations.' },
      ]}
      relatedLinks={[
        { label: 'Typesetting', path: '/typesetting' },
        { label: 'Book Layout Design', path: '/booklayoutdesign' },
        { label: 'eBook Formatting', path: '/ebookformatting' },
        { label: 'Book Publishing', path: '/bookpublishing' },
        { label: 'Book Printing', path: '/bookprinting' },
        { label: 'Author Websites', path: '/authorwebsites' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Get a Design Quote"
      ctaDescription="Share your book details and let our designers create a cover that captivates readers."
    />
  );
}