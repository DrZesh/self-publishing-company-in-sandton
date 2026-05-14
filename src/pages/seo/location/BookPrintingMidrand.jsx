import React from 'react';
import LocationPage from '../../LocationPage';

const locationData = {
  city: 'Midrand',
  province: 'Gauteng',
  serviceType: 'Book Printing',
  pageTitle: 'Book Printing Midrand | Professional Book Printers | Creative Books SA',
  pageDescription: 'Book printing services for Midrand authors and businesses. Softcover, hardcover, workbook, and corporate printing with delivery to Midrand. Get a free quote today.',
  pageKeywords: 'book printing Midrand, book printers Midrand, printing services Midrand, workbook printing Midrand, corporate book printing Midrand',
  canonical: 'https://www.creativebookssa.co.za/bookprintingmidrand',
};

export default function BookPrintingMidrand() {
  return <LocationPage locationData={locationData} />;
}