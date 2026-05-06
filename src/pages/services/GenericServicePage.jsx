import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PremiumPricingTable from '../../components/pricing/PremiumPricingTable';
import { BookOpen, Zap, Star } from 'lucide-react';

// Publishing packages for pricing tables
const publishingPackages = [
  {
    id: 0,
    name: 'Mini Package',
    price: 'R4,999',
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
    link: '/minipublishingpackage',
    ctaText: 'Get Started'
  },
  {
    id: 1,
    name: 'Standard Package',
    price: 'R12,999',
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
    link: '/publishingpackages',
    ctaText: 'Choose This Package'
  },
  {
    id: 2,
    name: 'Premium Package',
    price: 'R24,999',
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
    link: '/premiumpublishingpackage',
    ctaText: 'Upgrade to Premium'
  }
];

// Reusable service page data for all sub-pages
const serviceData = {
  // PUBLISHING SILO
  selfpublishing: {
    subtitle: 'Self Publishing South Africa',
    title: 'Self Publishing Services',
    description: 'Take control of your publishing journey with our professional self-publishing services. Retain 100% of your rights and royalties while getting expert support in South Africa.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
  },
  publishingpackages: {
    subtitle: 'Publishing Packages South Africa',
    title: 'Publishing Packages',
    description: 'Comprehensive publishing packages for every budget. From our affordable Mini Package to our full-service Premium Package, find the perfect publishing solution.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
    showPricing: true,
  },
  minipublishingpackage: {
    subtitle: 'Affordable Publishing',
    title: 'Mini Publishing Package',
    description: 'Our most affordable publishing package for first-time authors. Professional formatting, basic cover design, eBook conversion, and ISBN registration from R4,999.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
    showPricing: true,
  },
  premiumpublishingpackage: {
    subtitle: 'Premium Publishing',
    title: 'Premium Publishing Package',
    description: 'The ultimate full-service publishing experience. Developmental editing, premium design, hardcover printing, Amazon KDP, author website, and marketing consultation.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
    showPricing: true,
  },
  christianbookpublishing: {
    subtitle: 'Christian Book Publishers South Africa',
    title: 'Christian Book Publishing',
    description: 'Specialised publishing services for Christian authors. We understand faith-based literature and help you share your message with the world.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
  },
  childrensbookpublishing: {
    subtitle: "Children's Book Publishing South Africa",
    title: "Children's Book Publishing",
    description: "Bring your children's story to life with vibrant full-colour printing, professional illustration support, and age-appropriate design and layout.",
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
  },
  memoirpublishing: {
    subtitle: 'Memoir Publishing South Africa',
    title: 'Memoir Publishing',
    description: 'Preserve your life story with professional memoir publishing. From writing assistance to beautifully printed copies, we help you create a lasting legacy.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
  },
  poetrypublishing: {
    subtitle: 'Poetry Publishing South Africa',
    title: 'Poetry Publishing',
    description: 'Elegant poetry book publishing with beautiful typesetting, artistic cover design, and premium printing to showcase your verse.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png',
  },
  businessbookpublishing: {
    subtitle: 'Business Book Publishing',
    title: 'Business Book Publishing',
    description: 'Establish your authority with a professionally published business book. Expert ghostwriting, editing, and design for thought leaders and entrepreneurs.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
  },
  // PRINTING SILO
  a5bookprinting: {
    subtitle: 'A5 Book Printing',
    title: 'A5 Book Printing Services',
    description: 'Professional A5 (148×210mm) book printing. The most popular size for novels, poetry, and non-fiction. Softcover and hardcover options available.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  '6x9bookprinting': {
    subtitle: '6×9 Book Printing',
    title: '6×9 Book Printing Services',
    description: 'Standard 6×9 inch book printing, ideal for trade paperbacks and non-fiction. Compatible with Amazon KDP print-on-demand specifications.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  hardcoverprinting: {
    subtitle: 'Hardcover Book Printing',
    title: 'Hardcover Book Printing',
    description: 'Premium hardcover book printing with case binding, dust jackets, foil stamping, and embossing. Create a book that feels as good as it reads.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  softcoverprinting: {
    subtitle: 'Softcover Book Printing',
    title: 'Softcover Book Printing',
    description: 'High-quality perfect-bound softcover printing with gloss or matte lamination. The most popular and cost-effective book format.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  creampaperprinting: {
    subtitle: 'Cream Paper Printing',
    title: 'Cream Paper Book Printing',
    description: 'Premium cream paper printing for novels and literary works. 80gsm and 100gsm options available for that classic, easy-on-the-eyes reading experience.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  whitepaperprinting: {
    subtitle: 'White Paper Printing',
    title: 'White Paper Book Printing',
    description: 'Bright white paper printing for full-colour books, children\'s books, photo books, and workbooks. 80gsm and 100gsm options available.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  childrensbookprinting: {
    subtitle: "Children's Book Printing",
    title: "Children's Book Printing",
    description: "Vibrant full-colour children's book printing on thick, durable paper. Board books, picture books, and activity books with child-safe materials.",
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  comicbookprinting: {
    subtitle: 'Comic Book Printing',
    title: 'Comic Book Printing',
    description: 'Professional comic book printing with vivid colours, sharp graphics, and specialty paper options. Saddle-stitched and perfect-bound formats.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  workbookprinting: {
    subtitle: 'Workbook Printing',
    title: 'Workbook Printing',
    description: 'Custom workbook and manual printing for educators, trainers, and organisations. Wire-bound, saddle-stitched, and perfect-bound options.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  manualprinting: {
    subtitle: 'Manual Printing',
    title: 'Manual Printing Services',
    description: 'Professional manual and training material printing. Technical manuals, training guides, and instructional materials with binding options.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png',
  },
  // EDITING SILO
  proofreading: {
    subtitle: 'Proofreading Services South Africa',
    title: 'Professional Proofreading',
    description: 'Expert proofreading services for books, academic papers, and business documents. Catch every spelling, grammar, and punctuation error before print.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  copyediting: {
    subtitle: 'Copy Editing South Africa',
    title: 'Copy Editing Services',
    description: 'Comprehensive copy editing for style, tone, clarity, and consistency. Elevate your manuscript to professional publishing standards.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  manuscriptevaluation: {
    subtitle: 'Manuscript Evaluation',
    title: 'Manuscript Evaluation',
    description: 'Get a professional assessment of your manuscript with detailed feedback on plot, structure, character, pacing, and market potential.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  academicediting: {
    subtitle: 'Academic Editing South Africa',
    title: 'Academic Editing Services',
    description: 'Specialised editing for academic papers, journal articles, and research publications. APA, Harvard, and institutional style compliance.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  thesisediting: {
    subtitle: 'Thesis Editing',
    title: 'Thesis Editing Services',
    description: 'Professional thesis editing and proofreading for master\'s and doctoral candidates. Meet your university\'s formatting and language requirements.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  dissertationediting: {
    subtitle: 'Dissertation Editing',
    title: 'Dissertation Editing Services',
    description: 'Expert dissertation editing with focus on academic rigour, formatting compliance, and language precision for postgraduate students.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  technicalediting: {
    subtitle: 'Technical Editing',
    title: 'Technical Editing Services',
    description: 'Specialised technical editing for manuals, guides, scientific papers, and technical documentation. Clarity and accuracy guaranteed.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  languageediting: {
    subtitle: 'Language Editing',
    title: 'Language Editing Services',
    description: 'Professional language editing for non-native English speakers. Polish your manuscript for grammar, idiom, and fluency.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png',
  },
  // DESIGN SILO
  typesetting: {
    subtitle: 'Book Typesetting & Layout Design',
    title: 'Book Layout Design & Typesetting',
    description: 'Professional interior book layout design and typesetting. From chapter openers and headers to beautiful typography and page design — we make your book a pleasure to read.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/63376ef11_generated_5bcb307c.png',
  },
  booklayoutdesign: {
    subtitle: 'Book Typesetting & Layout Design',
    title: 'Book Layout Design & Typesetting',
    description: 'Professional interior book layout design and typesetting. From chapter openers and headers to beautiful typography and page design — we make your book a pleasure to read.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/63376ef11_generated_5bcb307c.png',
  },
  ebookformatting: {
    subtitle: 'eBook Formatting',
    title: 'eBook Formatting Services',
    description: 'Professional EPUB and MOBI formatting for Kindle, Apple Books, Kobo, and all major eReader platforms. Responsive and device-optimised.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/63376ef11_generated_5bcb307c.png',
  },
  authorwebsites: {
    subtitle: 'Author Websites South Africa',
    title: 'Author Website Design',
    description: 'Professional author websites designed to showcase your books, build your brand, and connect with readers. SEO-optimised and mobile-responsive.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/63376ef11_generated_5bcb307c.png',
  },
  // DIGITAL SILO
  amazonkdp: {
    subtitle: 'Amazon KDP South Africa',
    title: 'Amazon KDP Publishing',
    description: 'Complete Amazon KDP setup and publishing for South African authors. Format, upload, and sell your book on the world\'s largest bookstore.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png',
  },
  kindlepublishing: {
    subtitle: 'Kindle Publishing South Africa',
    title: 'Kindle Publishing Services',
    description: 'Professional Kindle formatting and publishing. Reach millions of readers worldwide through Amazon\'s Kindle platform.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png',
  },
  // WRITING SILO
  memoirwriting: {
    subtitle: 'Memoir Ghostwriters',
    title: 'Memoir Writing Services',
    description: 'Professional memoir ghostwriting that captures your life story with authenticity and literary craft. From interviews to finished manuscript.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png',
  },
  biographywriting: {
    subtitle: 'Biography Writers',
    title: 'Biography Writing Services',
    description: 'Professional biography writing through research, interviews, and expert storytelling. Create a lasting tribute to an extraordinary life.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png',
  },
  christianbookwriting: {
    subtitle: 'Christian Ghostwriters',
    title: 'Christian Book Writing',
    description: 'Faith-based ghostwriting for Christian authors. Sermons, devotionals, testimonies, and ministry books written with spiritual sensitivity.',
    heroImage: 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png',
  },
};

// Standard features and links for each silo
const defaultFeatures = [
  { title: 'Expert Team', description: 'Our experienced professionals bring decades of publishing industry expertise to every project.' },
  { title: 'Quality Guaranteed', description: 'We maintain the highest standards of quality in every aspect of our work.' },
  { title: 'Fast Turnaround', description: 'Efficient processes and clear timelines ensure your project stays on track.' },
  { title: 'Transparent Pricing', description: 'No hidden fees or surprises. You know exactly what you\'re paying for upfront.' },
  { title: 'Personal Support', description: 'A dedicated project manager guides you through every step of the process.' },
  { title: 'South African Based', description: 'Proudly based in Johannesburg, serving authors across South Africa and internationally.' },
];

const defaultFaqs = [
  { question: 'How do I get started?', answer: 'Simply contact us for a free consultation or submit a quote request through our website. We\'ll discuss your project and recommend the best approach.' },
  { question: 'What are your payment terms?', answer: 'We typically require a 50% deposit to begin work, with the balance due upon completion. For larger projects, we offer milestone-based payment plans.' },
  { question: 'Do you work with authors outside Johannesburg?', answer: 'Absolutely. While we\'re based in Johannesburg, we work with authors across South Africa and internationally. Most of our process is handled digitally.' },
];

export default function GenericServicePage({ serviceKey }) {
  const data = serviceData[serviceKey];
  if (!data) return null;

  return (
    <ServicePageTemplate
      heroImage={data.heroImage}
      subtitle={data.subtitle}
      title={data.title}
      description={data.description}
      features={defaultFeatures}
      processSteps={[
        { title: 'Consultation', description: 'We discuss your project goals, requirements, and preferences in detail.' },
        { title: 'Quote & Planning', description: 'Receive a personalised quote with a clear timeline and project plan.' },
        { title: 'Production', description: 'Our experts work on your project with regular updates and milestone reviews.' },
        { title: 'Delivery', description: 'Final review, approval, and delivery of your completed project.' },
      ]}
      pricingSection={
        data.showPricing ? (
          <PremiumPricingTable 
            packages={publishingPackages}
            title="Choose Your Publishing Package"
            subtitle="Transparent Pricing"
          />
        ) : null
      }
      faqs={defaultFaqs}
      relatedLinks={[
        { label: 'Book Publishing', path: '/bookpublishing' },
        { label: 'Book Printing', path: '/bookprinting' },
        { label: 'Book Editing', path: '/bookediting' },
        { label: 'Cover Design', path: '/bookcoverdesign' },
        { label: 'eBook Publishing', path: '/ebookpublishing' },
        { label: 'Ghostwriting', path: '/ghostwriting' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Ready to Get Started?"
      ctaDescription="Get a free consultation and personalised quote for your project."
    />
  );
}