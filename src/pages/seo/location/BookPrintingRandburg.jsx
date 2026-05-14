import React from 'react';
import LocationPage from '../../LocationPage';

const locationData = {
  city: 'Randburg',
  province: 'Gauteng',
  serviceType: 'Book Printing',
  pageTitle: 'Book Printing Randburg | Professional Book Printers | Creative Books SA',
  pageDescription: 'Book printing services for Randburg authors and businesses. Softcover, hardcover, and specialty printing with delivery to Randburg, Gauteng. Get a free quote today.',
  pageKeywords: 'book printing Randburg, book printers Randburg, printing services Randburg, self publishing Randburg, book printing Gauteng',
  canonical: 'https://www.creativebookssa.co.za/bookprintingrandburg',
};

export default function BookPrintingRandburg() {
  return <LocationPage locationData={locationData} />;
}