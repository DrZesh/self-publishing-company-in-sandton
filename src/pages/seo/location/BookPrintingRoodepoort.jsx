import React from 'react';
import LocationPage from '../../LocationPage';

const locationData = {
  city: 'Roodepoort',
  province: 'Gauteng',
  serviceType: 'Book Printing',
  pageTitle: 'Book Printing Roodepoort | Professional Book Printers | Creative Books SA',
  pageDescription: 'Book printing services for Roodepoort authors and businesses. Softcover, hardcover, and specialty printing with delivery to Roodepoort. Get a free quote today.',
  pageKeywords: 'book printing Roodepoort, book printers Roodepoort, printing services Roodepoort, self publishing Roodepoort, book printing West Rand',
  canonical: 'https://www.creativebookssa.co.za/bookprintingroodepoort',
};

export default function BookPrintingRoodepoort() {
  return <LocationPage locationData={locationData} />;
}