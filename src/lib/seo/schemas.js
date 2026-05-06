const SITE_URL = 'https://www.creativebookssa.co.za';
const BUSINESS_NAME = 'Creative Books SA';
const PHONE = '+27000000000';
const EMAIL = 'info@creativebookssa.co.za';
const ADDRESS = {
  streetAddress: '123 Publishing Avenue, Johannesburg',
  addressLocality: 'Johannesburg',
  addressRegion: 'Gauteng',
  postalCode: '2000',
  addressCountry: 'ZA',
};

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BUSINESS_NAME,
  url: SITE_URL,
  logo: SITE_URL + '/logo.png',
  telephone: PHONE,
  email: EMAIL,
  address: { '@type': 'PostalAddress', ...ADDRESS },
  sameAs: [
    'https://www.facebook.com/creativebookssa',
    'https://www.instagram.com/creativebookssa',
    'https://twitter.com/CreativeBooksSA',
  ],
  description: 'South Africa\'s premier publishing company offering book publishing, printing, editing, cover design and typesetting services.',
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': SITE_URL + '/#localbusiness',
  name: BUSINESS_NAME,
  image: SITE_URL + '/og-image.jpg',
  url: SITE_URL,
  telephone: PHONE,
  email: EMAIL,
  address: { '@type': 'PostalAddress', ...ADDRESS },
  geo: { '@type': 'GeoCoordinates', latitude: -26.2041, longitude: 28.0473 },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '17:00' },
  ],
  priceRange: 'R4,999 – R94,000',
  areaServed: [
    { '@type': 'City', name: 'Johannesburg' },
    { '@type': 'City', name: 'Pretoria' },
    { '@type': 'City', name: 'Sandton' },
    { '@type': 'City', name: 'Cape Town' },
    { '@type': 'City', name: 'Durban' },
    { '@type': 'Country', name: 'South Africa' },
  ],
  hasMap: 'https://maps.google.com/?q=Johannesburg,Gauteng,SouthAfrica',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127' },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BUSINESS_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: SITE_URL + '/?s={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

export function serviceSchema({ name, description, url, areaServed = 'South Africa' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: SITE_URL + url,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_NAME,
      url: SITE_URL,
      telephone: PHONE,
      address: { '@type': 'PostalAddress', ...ADDRESS },
    },
    areaServed,
    serviceType: name,
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: SITE_URL + item.path,
    })),
  };
}

export function articleSchema({ title, description, datePublished, url, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    url: SITE_URL + url,
    image,
    author: { '@type': 'Organization', name: BUSINESS_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: BUSINESS_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: SITE_URL + '/logo.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': SITE_URL + url },
  };
}