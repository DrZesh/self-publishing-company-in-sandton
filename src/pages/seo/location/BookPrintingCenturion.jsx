import React from 'react';
import LocationPage from '../../LocationPage';

const locationData = {
  city: 'Centurion',
  province: 'Gauteng',
  serviceType: 'Book Printing',
  pageTitle: 'Book Printing Centurion | Professional Book Printers | Creative Books SA',
  pageDescription: 'Book printing services for Centurion authors and businesses. Softcover, hardcover, workbook, and corporate printing with delivery to Centurion. Get a free quote today.',
  pageKeywords: 'book printing Centurion, book printers Centurion, printing services Centurion, self publishing Centurion, corporate book printing Centurion',
  canonical: 'https://www.creativebookssa.co.za/bookprintingcenturion',
};

export default function BookPrintingCenturion() {
  return <LocationPage locationData={locationData} />;
}