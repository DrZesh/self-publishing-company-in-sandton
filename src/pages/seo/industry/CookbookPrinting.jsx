import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What size and format is best for a cookbook?', answer: 'A4 full-colour is the most popular cookbook format — it accommodates large photography and clear recipe layouts. Wire-O binding is recommended as it lies flat for practical kitchen use.' },
  { question: 'What paper is best for cookbook printing?', answer: 'Coated gloss or satin 130gsm–170gsm paper is best for cookbooks with photography. It produces vibrant colour reproduction and resists minor spills better than uncoated paper.' },
  { question: 'How much does cookbook printing cost?', answer: 'A 100-page A4 full-colour cookbook costs approximately R150–R220 per copy for 100 copies. Wire-O binding adds approximately R15–R25 per copy. Contact us for a precise quote.' },
  { question: 'Can I print a family cookbook as a gift?', answer: 'Yes. We frequently print personalised family cookbooks as gifts. Small runs from 50 copies are available, perfect for family reunions, weddings, and celebrations.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Cookbook Printing Johannesburg', description: 'Professional cookbook printing for South African authors and businesses.', url: '/cookbookprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Cookbook Printing', path: '/cookbookprintingjohannesburg' }]),
  ],
};

export default function CookbookPrinting() {
  return (
    <>
      <PageMeta
        title="Cookbook Printing South Africa | Full-Colour Quality"
        description="High-quality cookbook printing in South Africa. Full-colour, durable cookbooks with premium paper and bindings."
        keywords="cookbook printing Johannesburg, recipe book printing South Africa, full colour cookbook printing, food book printing Johannesburg, family cookbook printing"
        canonical="https://www.creativebookssa.co.za/cookbookprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Cookbook Printing"
        title="Cookbook Printing in South Africa"
        description="Print stunning full-colour cookbooks and recipe books with Creative Books SA. We specialise in producing beautifully designed cookbooks for South African food authors, chefs, restaurants, and families — from intimate family recipe collections to commercially distributed titles."
        features={[
          { title: 'Full-Colour Printing', description: 'Vibrant full-colour printing on coated paper that brings your food photography to life.' },
          { title: 'Wire-O Flat-Open Binding', description: 'Wire-O binding keeps your cookbook open on the kitchen counter for hands-free cooking.' },
          { title: 'Premium Paper Options', description: 'Gloss, satin, and soft-touch matte lamination. Coated 130gsm–170gsm interior paper.' },
          { title: 'Family Cookbook Printing', description: 'Small runs from 50 copies for family recipe collections and personalised gifts.' },
          { title: 'Cookbook Design', description: 'Professional cookbook layout design with recipe formatting, photography placement, and branding.' },
          { title: 'Hardcover & Softcover', description: 'Softcover for affordable runs; premium hardcover editions for gift-grade cookbooks.' },
        ]}
        processSteps={[
          { title: 'Quote & Consultation', description: 'Discuss your cookbook — page count, photo quantity, size, binding, and quantities.' },
          { title: 'Design & Layout', description: 'Professional cookbook interior design and typography layout with your photography.' },
          { title: 'Proof', description: 'Review a colour proof before your full print run to ensure colour accuracy.' },
          { title: 'Print & Deliver', description: 'Your cookbooks printed and delivered nationwide or collected in Johannesburg.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: "Children's Book Printing", path: '/printing/childrensbooks' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Cookbook"
        ctaDescription="Get a free cookbook printing quote from our Johannesburg team today."
      />
    </>
  );
}