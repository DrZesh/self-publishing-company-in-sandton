import React from 'react';
import LocationPage from '../../LocationPage';

const locationData = {
  city: 'Sandton',
  province: 'Gauteng',
  serviceType: 'Book Printing',
  pageTitle: 'Book Printing Sandton | Professional Book Printers Sandton | Creative Books SA',
  pageDescription: 'Book printing services for Sandton authors and businesses. Softcover, hardcover, and specialty book printing with delivery to Sandton, Johannesburg. Get a free quote today.',
  pageKeywords: 'book printing Sandton, book printers Sandton, Sandton book printing, printing services Sandton, book publishing Sandton',
  canonical: 'https://www.creativebookssa.co.za/bookprintingsandton',
};

export default function BookPrintingSandton() {
  return <LocationPage locationData={locationData} />;
}