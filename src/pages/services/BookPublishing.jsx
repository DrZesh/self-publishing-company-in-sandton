import React from 'react';
import PageMeta from '../../components/shared/PageMeta';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PremiumPricingTable from '../../components/pricing/PremiumPricingTable';
import { BookOpen, Zap, Star } from 'lucide-react';

const publishingPackages = [
  {
    id: 0,
    name: 'Mini Package',
    price: 'From Quote',
    tagline: 'Perfect for first-time authors',
    icon: BookOpen,
    features: [
      'Manuscript proofreading',
      'Basic cover design',
      'Interior typesetting',
      'eBook (ePub) conversion',
      'ISBN registration',
      'Print-ready PDF files'
    ],
    link: '/publishingpackages/mini',
    ctaText: 'Get Started'
  },
  {
    id: 1,
    name: 'Standard Package',
    price: 'From Quote',
    tagline: 'Most comprehensive solution',
    icon: Zap,
    featured: true,
    features: [
      'Professional copy editing',
      'Premium cover design (3 concepts)',
      'Interior layout & typesetting',
      'ISBN & barcode',
      '100 printed softcover copies',
      'Amazon KDP setup',
      'eBook publishing'
    ],
    link: '/publishingpackages/a5',
    ctaText: 'Choose This Package'
  },
  {
    id: 2,
    name: 'Premium Package',
    price: 'From Quote',
    tagline: 'Full-service publishing',
    icon: Star,
    features: [
      'Developmental + copy editing',
      'Award-quality cover design',
      'Hardcover & softcover printing',
      '250 copies of each format',
      'Amazon KDP + eBook setup',
      'Author website',
      'Launch marketing consultation',
      'National distribution network'
    ],
    link: '/publishingpackages/6x9',
    ctaText: 'Upgrade to Premium'
  }
];

export default function BookPublishing() {
  return (
    <>
      <PageMeta
        title="Affordable Book Publishing Services in South Africa"
        description="Full-service book publishing for South African authors — editing, cover design, typesetting and printing. Get a free quote."
        canonical="https://creativebooks.co.za/book-publishing"
      />
      <ServicePageTemplate
      heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png"
      subtitle="Book Publishing South Africa"
      title="Affordable Book Publishing Services in South Africa"
      description="South Africa's leading book publishing company. We transform your manuscript into a professionally published book with expert editing, stunning design, quality printing, and global distribution."
      features={[
        { title: 'Full-Service Publishing', description: 'From manuscript evaluation to distribution, we handle every aspect of the publishing process.' },
        { title: 'ISBN Registration', description: 'We register your ISBN with the National Library of South Africa and set up your barcode.' },
        { title: 'Professional Editing', description: 'Expert editors refine your manuscript for grammar, style, consistency, and readability.' },
        { title: 'Custom Cover Design', description: 'Eye-catching book covers designed by professionals to stand out on shelves and online.' },
        { title: 'Quality Printing', description: 'High-quality offset and digital printing in softcover, hardcover, and specialty formats.' },
        { title: 'Global Distribution', description: 'Get your book on Amazon, Takealot, and bookstores across South Africa and internationally.' },
      ]}
      processSteps={[
        { title: 'Free Consultation', description: 'We discuss your publishing goals, timeline, and budget to find the perfect package.' },
        { title: 'Manuscript Preparation', description: 'Professional editing, proofreading, and manuscript formatting to publishing standards.' },
        { title: 'Design & Layout', description: 'Custom cover design and interior typesetting that brings your vision to life.' },
        { title: 'Print & Produce', description: 'Premium printing at our Johannesburg facility with rigorous quality control.' },
        { title: 'Publish & Distribute', description: 'ISBN registration, online listing, and distribution to retail channels.' },
      ]}
      pricingSection={
        <PremiumPricingTable 
          packages={publishingPackages}
          title="Choose Your Publishing Package"
          subtitle="Transparent Pricing"
        />
      }
      relatedLinks={[
        { label: 'Self Publishing', path: '/self-publishing-south-africa' },
        { label: 'Publishing Packages', path: '/publishingpackages/a5' },
        { label: 'Book Printing', path: '/book-printing' },
        { label: 'Book Editing', path: '/book-editing' },
        { label: 'Cover Design', path: '/book-cover-design' },
        { label: 'eBook Publishing', path: '/ebook-publishing' },
        { label: 'ISBN Registration', path: '/how-to-get-an-isbn-in-south-africa' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Ready to Publish Your Book?"
      ctaDescription="Get a free consultation and personalised publishing quote from South Africa's trusted publishing partner."
      />
      </>
      );
      }