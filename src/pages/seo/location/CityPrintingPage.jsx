import React from 'react';
import LocationPage from '../../LocationPage';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema, localBusinessSchemaForCity } from '../../../lib/seo/schemas';

const cityData = {
    capetown: {
      city: 'Cape Town',
      province: 'Western Cape',
      slug: 'bookprintingcapetown',
      nearby: 'Stellenbosch, Bellville, Paarl, Somerset West',
      deliveryDays: '3–5',
      lat: -33.9249,
      lon: 18.4241,
      suburbs: ['Stellenbosch', 'Bellville', 'Paarl', 'Somerset West', 'Brackenfell', 'Durbanville', 'Kraaifontein', 'Strand', 'Gordon\'s Bay', 'Elgin'],
      uniqueIntro: 'Located on the Western Cape coast, Cape Town is home to a thriving publishing community. Creative Books SA serves Cape Town\'s authors, small publishers, and corporate clients with premium book printing and publishing services. With 3–5 business day delivery to the Mother City and fast turnaround on offset and print-on-demand runs, we\'re your trusted book printing partner in Cape Town.',
      localPhone: '+27 21 XXX XXXX (Cape Town office)',
    },
   durban: {
     city: 'Durban',
     province: 'KwaZulu-Natal',
     slug: 'bookprintingdurban',
     nearby: 'Pinetown, Umhlanga, Westville, Ballito',
     deliveryDays: '2–4',
     lat: -29.8587,
     lon: 31.0192,
     suburbs: ['Umhlanga', 'Westville', 'Morningside', 'Glenwood', 'Berea', 'Durban Central', 'Bluff', 'Isipingo', 'Chatsworth', 'Phoenix'],
     uniqueIntro: 'Serving the KwaZulu-Natal coast, Creative Books SA delivers professional book printing to Durban in just 2–4 business days. Whether you\'re a self-publishing author in the Umhlanga area or a publisher managing a large print run, we offer softcover, hardcover, and specialty printing with the quality and speed Durban\'s writers demand.',
     localPhone: '+27 31 XXX XXXX (Durban network)',
   },
   bloemfontein: {
     city: 'Bloemfontein',
     province: 'Free State',
     slug: 'bookprintingbloemfontein',
     nearby: 'Mangaung, Welkom, Kroonstad',
     deliveryDays: '2–3',
     lat: -29.1137,
     lon: 25.5148,
     suburbs: ['Mangaung', 'Welkom', 'Botshabelo', 'Thaba Nchu', 'Kroonstad', 'Parys', 'Harrismith', 'Ficksburg'],
     uniqueIntro: 'In the heart of South Africa\'s Free State province, Creative Books SA provides book printing and self-publishing support to Bloemfontein\'s growing author community. With 2–3 day delivery and competitive pricing, we help Free State authors, NGOs, and publishers bring their stories to print.',
     localPhone: '+27 51 XXX XXXX (Free State coverage)',
   },
   polokwane: {
     city: 'Polokwane',
     province: 'Limpopo',
     slug: 'bookprintingpolokwane',
     nearby: 'Tzaneen, Mokopane, Louis Trichardt',
     deliveryDays: '2–3',
     lat: -23.9006,
     lon: 29.4167,
     suburbs: ['Tzaneen', 'Mokopane', 'Louis Trichardt', 'Warmbaths', 'Giyani', 'Musina'],
     uniqueIntro: 'Creative Books SA serves Limpopo\'s publishing community with professional book printing and self-publishing support. Based from our Johannesburg facility, we deliver to Polokwane in just 2–3 business days, making us the preferred choice for Limpopo authors and publishers.',
   },
   nelspruit: {
     city: 'Nelspruit',
     province: 'Mpumalanga',
     slug: 'bookprintingnelspruit',
     nearby: 'Mbombela, White River, Hazyview',
     deliveryDays: '2–3',
     lat: -25.4833,
     lon: 30.9667,
     suburbs: ['Mbombela', 'White River', 'Hazyview', 'Komatipoort', 'Machadodorp'],
     uniqueIntro: 'Nelspruit-based authors and publishers can rely on Creative Books SA for quick turnaround book printing. We deliver to Mpumalanga in 2–3 business days with premium quality and competitive pricing.',
   },
   portelizabeth: {
     city: 'Gqeberha (Port Elizabeth)',
     province: 'Eastern Cape',
     slug: 'bookprintingportelizabeth',
     nearby: 'Uitenhage, George, East London',
     deliveryDays: '3–5',
     lat: -33.9585,
     lon: 25.6017,
     suburbs: ['Uitenhage', 'Despatch', 'Bethelsdorp', 'Walmer', 'Summerstrand', 'Humewood', 'Greenacres'],
     uniqueIntro: 'Serving the Eastern Cape coast, Creative Books SA delivers professional book printing to Port Elizabeth in 3–5 business days. We\'ve helped dozens of Gqeberha-based self-publishing authors and indie publishers reach readers locally and nationally.',
   },
   eastlondon: {
     city: 'East London',
     province: 'Eastern Cape',
     slug: 'bookprintingeastlondon',
     nearby: "King William's Town, Stutterheim, Queenstown",
     deliveryDays: '3–5',
     lat: -32.9973,
     lon: 27.8109,
     suburbs: ['Stutterheim', 'King William\'s Town', 'Queenstown', 'Komani', 'Cathcart'],
     uniqueIntro: 'East London authors and publishers benefit from Creative Books SA\'s professional printing services with 3–5 day delivery across the Eastern Cape region.',
   },
   kimberley: {
     city: 'Kimberley',
     province: 'Northern Cape',
     slug: 'bookprintingkimberley',
     nearby: 'Upington, Springbok, De Aar',
     deliveryDays: '2–4',
     lat: -28.7347,
     lon: 24.8517,
     suburbs: ['Upington', 'De Aar', 'Springbok', 'Kakamas', 'Keimoes'],
     uniqueIntro: 'In South Africa\'s Northern Cape, Creative Books SA connects Kimberley\'s authors with professional book printing and publishing services. We deliver within 2–4 business days across the region.',
   },
   pietermaritzburg: {
     city: 'Pietermaritzburg',
     province: 'KwaZulu-Natal',
     slug: 'bookprintingpietermaritzburg',
     nearby: 'Howick, Richmond, Greytown',
     deliveryDays: '2–4',
     lat: -29.6100,
     lon: 30.3776,
     suburbs: ['Howick', 'Richmond', 'Greytown', 'Umzinto', 'Glenburn'],
     uniqueIntro: 'Pietermaritzburg\'s self-publishing authors partner with Creative Books SA for complete publishing services — editing, design, printing, and ISBN registration with 2–4 day delivery throughout KwaZulu-Natal.',
   },
   rustenburg: {
     city: 'Rustenburg',
     province: 'North West',
     slug: 'bookprintingrustenburg',
     nearby: 'Brits, Hartbeespoort, Mahikeng',
     deliveryDays: '1–3',
     lat: -25.5256,
     lon: 27.2333,
     suburbs: ['Brits', 'Hartbeespoort', 'Mahikeng', 'Potchefstroom', 'Klerksdorp'],
     uniqueIntro: 'Rustenburg and the North West province benefit from fast book printing through Creative Books SA. 1–3 day delivery makes us ideal for last-minute book projects and corporate publishing needs.',
   },
   boksburg: {
     city: 'Boksburg',
     province: 'Gauteng',
     slug: 'bookprintingboksburg',
     nearby: 'Benoni, Germiston, Brakpan',
     deliveryDays: '1–2',
     lat: -26.2028,
     lon: 28.2373,
     suburbs: ['Benoni', 'Germiston', 'Brakpan', 'Duduza', 'Apex'],
     uniqueIntro: 'Boksburg and the East Rand benefit from same-day or next-day book printing through Creative Books SA. Whether you need hardcover, softcover, or specialty printing, we deliver locally in 1–2 business days.',
   },
   benoni: {
     city: 'Benoni',
     province: 'Gauteng',
     slug: 'bookprintingbenoni',
     nearby: 'Boksburg, Brakpan, Kempton Park',
     deliveryDays: '1–2',
     lat: -26.1667,
     lon: 28.3333,
     suburbs: ['Boksburg', 'Brakpan', 'Daveyton', 'Duduza', 'Katlehong'],
     uniqueIntro: 'Based in Johannesburg with same-day delivery to Benoni and surrounding areas, Creative Books SA is your go-to printer for books, workbooks, and corporate publications across the East Rand.',
   },
   germiston: {
     city: 'Germiston',
     province: 'Gauteng',
     slug: 'bookprintinggermiston',
     nearby: 'Boksburg, Alberton, Johannesburg South',
     deliveryDays: '1',
     lat: -26.0111,
     lon: 28.2011,
     suburbs: ['Boksburg', 'Alberton', 'Johannesburg South', 'Edenvale', 'Rynfield'],
     uniqueIntro: 'Creative Books SA offers same-day delivery to Germiston for book printing projects. Our fast turnaround and premium quality make us the trusted printer for Germiston authors and businesses.',
   },
   kemptonpark: {
     city: 'Kempton Park',
     province: 'Gauteng',
     slug: 'bookprintingkemptonpark',
     nearby: 'Edenvale, Benoni, Midrand',
     deliveryDays: '1–2',
     lat: -26.0228,
     lon: 28.2397,
     suburbs: ['Edenvale, Benoni', 'Midrand', 'Alberton', 'Modderfontein'],
     uniqueIntro: 'Kempton Park and surrounding areas receive book printing within 1–2 business days through Creative Books SA. We specialize in rush jobs, corporate printing, and custom book production.',
   },
   fourways: {
     city: 'Fourways',
     province: 'Gauteng',
     slug: 'bookprintingfourways',
     nearby: 'Sandton, Bryanston, Midrand',
     deliveryDays: '1',
     lat: -25.9931,
     lon: 28.0381,
     suburbs: ['Sandton', 'Bryanston', 'Midrand', 'Sunninghill', 'Broadacres'],
     uniqueIntro: 'Fourways entrepreneurs and self-publishing authors choose Creative Books SA for professional book printing with same-day Johannesburg delivery. Premium quality, competitive pricing, and full publishing support.',
   },
   bryanston: {
     city: 'Bryanston',
     province: 'Gauteng',
     slug: 'bookprintingbryanston',
     nearby: 'Sandton, Fourways, Randburg',
     deliveryDays: '1',
     lat: -25.9544,
     lon: 28.0397,
     suburbs: ['Sandton', 'Fourways', 'Randburg', 'Sunninghill', 'Illovo'],
     uniqueIntro: 'Bryanston\'s business leaders and self-publishing authors partner with Creative Books SA for premium book printing and publishing services. Same-day delivery within Johannesburg and surrounding areas.',
   },
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

  const locationData = {
    city: d.city,
    province: d.province,
    serviceType: 'Book Printing',
    pageTitle: `Book Printing in ${d.city} | Fast Turnaround | Creative Books SA`,
    pageDescription: `Professional book printing in ${d.city} with ${d.deliveryDays} day delivery. Softcover, hardcover, and specialty printing for ${d.city} authors. We serve ${d.nearby}. Free quote today.`,
    pageKeywords: `book printing ${d.city.toLowerCase()}, book printers ${d.city.toLowerCase()}, printing services ${d.province.toLowerCase()}, book publishing ${d.city.toLowerCase()}, book printing near me`,
    canonical: `https://www.creativebookssa.co.za/${d.slug}`,
  };

  return <LocationPage locationData={locationData} />;
}

export function SelfPublishingCityPage({ cityKey }) {
  const d = selfPubData[cityKey];
  if (!d) return null;

  const locationData = {
    city: d.city,
    province: d.province,
    serviceType: 'Self Publishing',
    pageTitle: `Self Publishing ${d.city} | Self-Publish Your Book | Creative Books SA`,
    pageDescription: `Professional self-publishing services for ${d.city} authors. Editing, cover design, printing, ISBN, and Amazon KDP. Retain 100% rights. Get a free quote today.`,
    pageKeywords: `self publishing ${d.city.toLowerCase()}, self publish book ${d.city.toLowerCase()}, book publishing ${d.city.toLowerCase()}, independent publishing ${d.province.toLowerCase()}`,
    canonical: `https://www.creativebookssa.co.za/selfpublishing${cityKey}`,
  };

  return <LocationPage locationData={locationData} />;
}