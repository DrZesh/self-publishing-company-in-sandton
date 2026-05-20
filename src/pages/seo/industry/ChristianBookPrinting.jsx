import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you print Christian books in South Africa?', answer: 'Yes. We have extensive experience printing Christian books — devotionals, Bible studies, testimonies, ministry books, and church publications for South African authors and ministries.' },
  { question: 'Can I print a devotional in a small quantity?', answer: 'Yes. We print from 50 copies. Small devotionals, prayer guides, and ministry booklets are popular with our Christian publishing clients.' },
  { question: 'Do you offer hardcover Bible-style binding for Christian books?', answer: 'Yes. We offer hardcover case binding including cloth-effect and leatherette covers, which are popular for study Bibles, devotionals, and ministry gift books.' },
  { question: 'Do you help with Christian book editing and publishing?', answer: 'Yes. We offer a complete Christian book publishing service including manuscript evaluation, copy editing, typesetting, cover design, ISBN, and printing.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Christian Book Printing Johannesburg', description: 'Christian book printing services for South African ministries and authors.', url: '/christianbookprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Christian Book Printing', path: '/christianbookprintingjohannesburg' }]),
  ],
};

export default function ChristianBookPrinting() {
  return (
    <>
      <PageMeta
        title="Christian Book Printing"
        description="Christian book printing in Johannesburg for ministries, pastors and faith-based authors — devotionals, Bible studies, sermon collections and testimonies."
        keywords="Christian book printing Johannesburg, devotional printing South Africa, ministry book printing, Christian publishing South Africa, church book printing"
        canonical="https://www.creativebooks.co.za/christianbookprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Christian Book Printing"
        title="Christian Book Printing"
        description="Creative Books SA is a trusted partner for South African Christian authors and ministries. We print devotionals, Bible studies, testimonies, ministry books, and church publications with the quality and care that faith-based publishing deserves."
        features={[
          { title: 'Devotionals & Bible Studies', description: 'Beautifully produced devotionals and Bible study guides for ministries and individual authors.' },
          { title: 'Ministry & Church Publications', description: 'Booklets, study materials, and outreach publications for churches and Christian organisations.' },
          { title: 'Testimony & Biography Books', description: 'Personal testimony books and Christian biographies printed with care and quality.' },
          { title: 'Hardcover Ministry Books', description: 'Leatherette and cloth hardcover editions for premium ministry gifts and study collections.' },
          { title: 'Christian Publishing Package', description: 'Editing, ISBN, cover design, typesetting, and printing — full Christian publishing in one place.' },
          { title: 'Bulk Church Printing', description: 'Large print runs for church-wide distribution, conferences, and outreach campaigns.' },
        ]}
        processSteps={[
          { title: 'Consultation', description: 'Discuss your Christian book project — format, quantities, timeline, and budget.' },
          { title: 'Editing & Typesetting', description: 'Professional Christian book editing and interior layout that respects your content.' },
          { title: 'Cover Design', description: 'Faith-appropriate cover design that positions your book for your readership.' },
          { title: 'Print & Deliver', description: 'Your Christian books printed and delivered to your church, ministry, or address nationwide.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Christian Book Publishing', path: '/christianbookpublishing' },
          { label: 'Christian Book Writing', path: '/christianbookwriting' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Hardcover Printing', path: '/printing/hardcover' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Christian Book"
        ctaDescription="Get a free Christian book printing quote from our Johannesburg team today."
      />
    </>
  );
}