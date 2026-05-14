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
   '@id': SITE_URL + '/#organization',
   name: BUSINESS_NAME,
   url: SITE_URL,
   logo: SITE_URL + '/logo.png',
   telephone: PHONE,
   email: EMAIL,
   address: { '@type': 'PostalAddress', ...ADDRESS },
   areaServed: { '@type': 'Country', name: 'ZA' },
   aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127', bestRating: '5', worstRating: '1' },
   sameAs: [
     'https://www.facebook.com/creativebookssa',
     'https://www.linkedin.com/company/creative-books-sa',
     'https://www.instagram.com/creativebookssa',
     'https://wa.me/27000000000',
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

export function offerSchema({ name, price, priceCurrency = 'ZAR', description, availability = 'https://schema.org/InStock' }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'Offer',
     name,
     description,
     price: String(price),
     priceCurrency,
     seller: { '@type': 'Organization', name: BUSINESS_NAME, url: SITE_URL },
     availability,
   };
 }

export function productSchema({ name, description, price, priceCurrency = 'ZAR', image, url, aggregateRating = null }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'Product',
     name,
     description,
     image,
     url: SITE_URL + url,
     offers: {
       '@type': 'Offer',
       price: String(price),
       priceCurrency,
       seller: { '@type': 'Organization', name: BUSINESS_NAME },
       availability: 'https://schema.org/InStock',
     },
     ...(aggregateRating && { aggregateRating }),
   };
 }

export function howtoSchema({ name, description, steps, image, url }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'HowTo',
     name,
     description,
     image,
     url: SITE_URL + url,
     step: steps.map((step, i) => ({
       '@type': 'HowToStep',
       position: i + 1,
       name: step.name,
       text: step.text,
       ...(step.image && { image: step.image }),
     })),
   };
 }

export function qaSchema({ questions }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'FAQPage',
     mainEntity: questions.map(q => ({
       '@type': 'Question',
       name: q.question,
       acceptedAnswer: {
         '@type': 'Answer',
         text: q.answer,
       },
     })),
   };
 }

export function reviewSchema({ author, reviewRating, reviewBody, datePublished, url }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'Review',
     author: { '@type': 'Person', name: author },
     reviewRating: { '@type': 'Rating', ratingValue: reviewRating, bestRating: '5', worstRating: '1' },
     reviewBody,
     datePublished,
     url: SITE_URL + url,
   };
 }

export function aggregateRatingSchema({ ratingValue = '4.9', reviewCount = '127', bestRating = '5', worstRating = '1' }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'AggregateRating',
     ratingValue,
     reviewCount,
     bestRating,
     worstRating,
   };
 }

export function authorSchema({ name = 'Creative Books SA Team', description }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'Organization',
     name,
     url: SITE_URL,
     description: description || 'South Africa\'s premier publishing company offering professional book publishing, printing, editing, and design services.',
     logo: { '@type': 'ImageObject', url: SITE_URL + '/logo.png' },
     sameAs: [
       'https://www.facebook.com/creativebookssa',
       'https://www.linkedin.com/company/creative-books-sa',
       'https://www.instagram.com/creativebookssa',
     ],
   };
 }

export function mainLocalBusinessSchema() {
   return {
     '@context': 'https://schema.org',
     '@type': 'LocalBusiness',
     '@id': SITE_URL + '/#localbusiness',
     name: BUSINESS_NAME,
     image: SITE_URL + '/logo.png',
     url: SITE_URL,
     telephone: PHONE,
     email: EMAIL,
     address: { '@type': 'PostalAddress', ...ADDRESS },
     geo: { '@type': 'GeoCoordinates', latitude: '-26.0755', longitude: '28.0041' },
     priceRange: 'ZAR 4999 - 45000',
     openingHoursSpecification: [
       { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '17:00' },
       { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday','Sunday'], opens: '09:00', closes: '13:00' },
     ],
     sameAs: [
       'https://www.facebook.com/creativebookssa',
       'https://www.linkedin.com/company/creative-books-sa',
     ],
     aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127', bestRating: '5', worstRating: '1' },
   };
 }

export function localBusinessSchemaForCity({ cityName, latitude, longitude, areaServed = [] }) {
   return {
     '@context': 'https://schema.org',
     '@type': 'LocalBusiness',
     '@id': SITE_URL + `/#localbusiness-${cityName.toLowerCase()}`,
     name: `${BUSINESS_NAME} - ${cityName}`,
     image: SITE_URL + '/og-image.jpg',
     url: SITE_URL,
     telephone: PHONE,
     email: EMAIL,
     address: { '@type': 'PostalAddress', ...ADDRESS },
     geo: { '@type': 'GeoCoordinates', latitude, longitude },
     openingHoursSpecification: [
       { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '17:00' },
     ],
     areaServed: [{ '@type': 'City', name: cityName }, ...areaServed],
     aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127', bestRating: '5', worstRating: '1' },
   };
 }