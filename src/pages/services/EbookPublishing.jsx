import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';

export default function EbookPublishing() {
  return (
    <ServicePageTemplate
      heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png"
      subtitle="eBook Publishing South Africa"
      title="Professional eBook Publishing"
      description="Publish your eBook on Amazon KDP, Kindle, Apple Books, Kobo, and more. Professional formatting, cover conversion, and global digital distribution from South Africa."
      features={[
        { title: 'Amazon KDP Setup', description: 'Complete Kindle Direct Publishing account setup, formatting, and listing optimisation.' },
        { title: 'eBook Formatting', description: 'Professional EPUB and MOBI formatting for all major eReader platforms and devices.' },
        { title: 'Global Distribution', description: 'Publish on Amazon, Apple Books, Kobo, Google Play Books, and more.' },
        { title: 'Digital Cover Design', description: 'Optimised eBook cover design that looks stunning on all devices and platforms.' },
        { title: 'Metadata Optimisation', description: 'Strategic keywords, categories, and descriptions to maximise your book\'s discoverability.' },
        { title: 'Print + Digital Bundle', description: 'Combine eBook publishing with print publishing for a complete publishing solution.' },
      ]}
      processSteps={[
        { title: 'Submit Your Manuscript', description: 'Send us your edited manuscript in Word or PDF format.' },
        { title: 'Format & Convert', description: 'We convert your manuscript into professional eBook formats (EPUB, MOBI).' },
        { title: 'Platform Setup', description: 'We set up your accounts on Amazon KDP and other platforms with optimised listings.' },
        { title: 'Publish & Launch', description: 'Your eBook goes live globally with ongoing support for updates and marketing.' },
      ]}
      faqs={[
        { question: 'How much does eBook publishing cost?', answer: 'eBook formatting and publishing starts from R1,999. This includes EPUB/MOBI conversion, cover optimisation, and listing on one platform. Multi-platform distribution packages start from R3,499.' },
        { question: 'Can I publish on Amazon from South Africa?', answer: 'Yes! We help South African authors publish on Amazon KDP, Kindle, and all major global platforms. We handle account setup, tax documentation, and royalty payment configuration.' },
        { question: 'How long until my eBook is live?', answer: 'Once your manuscript is ready, eBook formatting takes 3–5 business days. After submission to platforms, your eBook typically goes live within 24–72 hours.' },
      ]}
      relatedLinks={[
        { label: 'Amazon KDP', path: '/amazonkdp' },
        { label: 'Kindle Publishing', path: '/kindlepublishing' },
        { label: 'eBook Formatting', path: '/ebookformatting' },
        { label: 'Book Publishing', path: '/bookpublishing' },
        { label: 'Self Publishing', path: '/selfpublishing' },
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Publish Your eBook Today"
      ctaDescription="Get your book on Amazon and global platforms. Start with a free consultation."
    />
  );
}