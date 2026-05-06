import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const cityData = {
  capetown: { city: 'Cape Town', province: 'Western Cape', slug: 'bookprintingcapetown', nearby: 'Stellenbosch, Bellville, Paarl, Somerset West', deliveryDays: '3–5' },
  durban: { city: 'Durban', province: 'KwaZulu-Natal', slug: 'bookprintingdurban', nearby: 'Pinetown, Umhlanga, Westville, Ballito', deliveryDays: '2–4' },
  bloemfontein: { city: 'Bloemfontein', province: 'Free State', slug: 'bookprintingbloemfontein', nearby: 'Mangaung, Welkom, Kroonstad', deliveryDays: '2–3' },
  polokwane: { city: 'Polokwane', province: 'Limpopo', slug: 'bookprintingpolokwane', nearby: 'Tzaneen, Mokopane, Louis Trichardt', deliveryDays: '2–3' },
  nelspruit: { city: 'Nelspruit', province: 'Mpumalanga', slug: 'bookprintingnelspruit', nearby: 'Mbombela, White River, Hazyview', deliveryDays: '2–3' },
  portelizabeth: { city: 'Gqeberha (Port Elizabeth)', province: 'Eastern Cape', slug: 'bookprintingportelizabeth', nearby: 'Uitenhage, George, East London', deliveryDays: '3–5' },
  eastlondon: { city: 'East London', province: 'Eastern Cape', slug: 'bookprintingeastlondon', nearby: "King William's Town, Stutterheim, Queenstown", deliveryDays: '3–5' },
  kimberley: { city: 'Kimberley', province: 'Northern Cape', slug: 'bookprintingkimberley', nearby: 'Upington, Springbok, De Aar', deliveryDays: '2–4' },
  pietermaritzburg: { city: 'Pietermaritzburg', province: 'KwaZulu-Natal', slug: 'bookprintingpietermaritzburg', nearby: 'Howick, Richmond, Greytown', deliveryDays: '2–4' },
  rustenburg: { city: 'Rustenburg', province: 'North West', slug: 'bookprintingrustenburg', nearby: 'Brits, Hartbeespoort, Mahikeng', deliveryDays: '1–3' },
  boksburg: { city: 'Boksburg', province: 'Gauteng', slug: 'bookprintingboksburg', nearby: 'Benoni, Germiston, Brakpan', deliveryDays: '1–2' },
  benoni: { city: 'Benoni', province: 'Gauteng', slug: 'bookprintingbenoni', nearby: 'Boksburg, Brakpan, Kempton Park', deliveryDays: '1–2' },
  germiston: { city: 'Germiston', province: 'Gauteng', slug: 'bookprintinggermiston', nearby: 'Boksburg, Alberton, Johannesburg South', deliveryDays: '1' },
  kemptonpark: { city: 'Kempton Park', province: 'Gauteng', slug: 'bookprintingkemptonpark', nearby: 'Edenvale, Benoni, Midrand', deliveryDays: '1–2' },
  fourways: { city: 'Fourways', province: 'Gauteng', slug: 'bookprintingfourways', nearby: 'Sandton, Bryanston, Midrand', deliveryDays: '1' },
  bryanston: { city: 'Bryanston', province: 'Gauteng', slug: 'bookprintingbryanston', nearby: 'Sandton, Fourways, Randburg', deliveryDays: '1' },
};

const selfPubData = {
  johannesburg: { city: 'Johannesburg', province: 'Gauteng', slug: 'selfpublishingjohannesburg' },
  pretoria: { city: 'Pretoria', province: 'Gauteng', slug: 'selfpublishingpretoria' },
  capetown: { city: 'Cape Town', province: 'Western Cape', slug: 'selfpublishingcapetown' },
  durban: { city: 'Durban', province: 'KwaZulu-Natal', slug: 'selfpublishingdurban' },
};

export function CityPrintingPage({ cityKey }) {
  const d = cityData[cityKey];
  if (!d) return null;

  const faqs = [
    { question: `Do you offer book printing for ${d.city} clients?`, answer: `Yes. Creative Books SA serves authors, businesses, and publishers in ${d.city} with professional book printing, publishing, and editing services. We deliver to ${d.city} in ${d.deliveryDays} business days after printing.` },
    { question: `How quickly can I receive books in ${d.city}?`, answer: `After printing (7–14 business days), we ship to ${d.city} via courier. Typical delivery time is ${d.deliveryDays} business days. You can also collect from our Johannesburg facility.` },
    { question: `What types of books do you print for ${d.city} clients?`, answer: `We print novels, non-fiction, memoirs, children's books, workbooks, training manuals, poetry collections, Christian books, and business publications for all ${d.city} clients.` },
    { question: `Is there a minimum order for ${d.city} book printing?`, answer: `Minimum 50 copies for offset printing. Print-on-demand has no minimum — you can order a single copy for proofing or gifting.` },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      serviceSchema({ name: `Book Printing ${d.city}`, description: `Professional book printing services for ${d.city} authors and businesses.`, url: `/${d.slug}`, areaServed: `${d.city}, ${d.province}, South Africa` }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: `Book Printing ${d.city}`, path: `/${d.slug}` }]),
    ],
  };

  return (
    <>
      <PageMeta
        title={`Book Printing ${d.city} | Professional Book Printers | Creative Books SA`}
        description={`Book printing services for ${d.city} authors and businesses. Softcover, hardcover, and specialty printing with delivery to ${d.city}. Get a free quote today.`}
        keywords={`book printing ${d.city.toLowerCase()}, book printers ${d.city.toLowerCase()}, printing services ${d.province.toLowerCase()}, book publishing ${d.city.toLowerCase()}`}
        canonical={`https://www.creativebookssa.co.za/${d.slug}`}
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle={`Book Printing ${d.city}`}
        title={`Book Printing in ${d.city}`}
        description={`Professional book printing for ${d.city} authors, publishers, and businesses. Creative Books SA provides premium softcover, hardcover, and full-colour printing with nationwide delivery to ${d.city} and the ${d.province}.`}
        features={[
          { title: `${d.city} Delivery`, description: `Fast, reliable courier delivery to ${d.city} and surrounding areas including ${d.nearby}. Delivery takes ${d.deliveryDays} business days after printing.` },
          { title: 'Softcover & Hardcover', description: 'Perfect-bound softcover and case-bound hardcover with gloss or matte lamination.' },
          { title: 'All Book Types', description: "Novels, non-fiction, memoirs, children's books, workbooks, and more." },
          { title: 'Self-Publishing Support', description: `Complete self-publishing packages for ${d.city}-based authors including editing, design, printing, and ISBN.` },
          { title: 'Small & Large Runs', description: 'Print from 50 copies to 50,000+. Print-on-demand available for small quantities.' },
          { title: 'Competitive Pricing', description: 'Transparent, competitive book printing pricing with no hidden fees.' },
        ]}
        processSteps={[
          { title: 'Get a Quote', description: `Request a free book printing quote from ${d.city} via our online form, phone, or email.` },
          { title: 'Submit Files', description: 'Upload your print-ready PDF or manuscript. We check all files before production.' },
          { title: 'Approve Proof', description: 'Review a digital or physical proof before your full print run begins.' },
          { title: `Deliver to ${d.city}`, description: `Books printed in Johannesburg and shipped to your ${d.city} address in ${d.deliveryDays} business days.` },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing South Africa', path: '/bookprinting' },
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle={`Get a Book Printing Quote for ${d.city}`}
        ctaDescription={`Serving ${d.city} and the ${d.province} with premium book printing. Get your free quote today.`}
      />
    </>
  );
}

export function SelfPublishingCityPage({ cityKey }) {
  const d = selfPubData[cityKey];
  if (!d) return null;

  const faqs = [
    { question: `Can I self-publish a book in ${d.city}?`, answer: `Absolutely. Creative Books SA helps authors in ${d.city} self-publish professionally — with editing, cover design, typesetting, printing, ISBN registration, and Amazon KDP setup all available.` },
    { question: `How much does self-publishing cost in ${d.city}?`, answer: `Self-publishing packages start from R4,999 for our Mini Package. Premium packages with full editing, cover design, and hardcover printing range from R15,000–R45,000. Contact us for a personalised quote.` },
    { question: `Do I retain rights when self-publishing in ${d.city}?`, answer: `Yes. When you self-publish with Creative Books SA, you retain 100% of your rights and royalties. We are a service provider, not a traditional publisher.` },
    { question: `How long does self-publishing take for ${d.city} authors?`, answer: `Timeline depends on the services required. Editing takes 2–6 weeks. Design and typesetting takes 1–3 weeks. Printing takes 7–14 business days. A full project typically takes 6–16 weeks.` },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      serviceSchema({ name: `Self Publishing ${d.city}`, description: `Self-publishing services for authors in ${d.city}.`, url: `/selfpublishing${cityKey}`, areaServed: `${d.city}, ${d.province}, South Africa` }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Self Publishing', path: '/selfpublishingsouthafrica' }, { name: `Self Publishing ${d.city}`, path: `/selfpublishing${cityKey}` }]),
    ],
  };

  return (
    <>
      <PageMeta
        title={`Self Publishing ${d.city} | Self-Publish Your Book | Creative Books SA`}
        description={`Professional self-publishing services for ${d.city} authors. Editing, cover design, printing, ISBN, and Amazon KDP. Retain 100% rights. Get a free quote today.`}
        keywords={`self publishing ${d.city.toLowerCase()}, self publish book ${d.city.toLowerCase()}, book publishing ${d.city.toLowerCase()}, independent publishing ${d.province.toLowerCase()}`}
        canonical={`https://www.creativebookssa.co.za/selfpublishing${cityKey}`}
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png"
        subtitle={`Self Publishing ${d.city}`}
        title={`Self Publishing in ${d.city}`}
        description={`Publish your book professionally in ${d.city} while retaining 100% of your rights and royalties. Creative Books SA offers complete self-publishing services for ${d.city} authors — editing, cover design, typesetting, printing, ISBN, and Amazon KDP.`}
        features={[
          { title: 'Retain All Your Rights', description: 'Self-publish and keep 100% ownership of your book, rights, and royalties.' },
          { title: 'Professional Editing', description: `Proofreading, copy editing, and manuscript evaluation for ${d.city} authors.` },
          { title: 'Premium Cover Design', description: 'Professionally designed covers that position your book competitively in the market.' },
          { title: 'ISBN Registration', description: 'South African ISBN registration handled for you — your book gets an official identity.' },
          { title: 'Amazon KDP Setup', description: 'We set up your book on Amazon KDP for international sales alongside your local printing.' },
          { title: `Printing for ${d.city}`, description: `Quality printing with delivery to ${d.city} or nationwide distribution setup.` },
        ]}
        processSteps={[
          { title: 'Free Consultation', description: `Book a free self-publishing consultation from ${d.city} — by phone, video, or in person.` },
          { title: 'Editing & Design', description: 'We edit your manuscript and design a professional cover and interior layout.' },
          { title: 'ISBN & Printing', description: 'Your book gets an ISBN and is printed to professional publishing standards.' },
          { title: 'Launch & Distribute', description: `Your book is ready for retail, Amazon, and personal distribution from ${d.city}.` },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Book Printing SA', path: '/bookprinting' },
          { label: 'How to Self Publish', path: '/howtoselfpublishabook' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle={`Start Self Publishing in ${d.city}`}
        ctaDescription={`Get a free self-publishing consultation and quote for ${d.city} authors today.`}
      />
    </>
  );
}