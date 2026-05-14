import React from 'react';
import LocationPage from '../../LocationPage';

const locationData = {
  city: 'Pretoria',
  province: 'Gauteng',
  serviceType: 'Book Printing',
  pageTitle: 'Book Printing Pretoria | Professional Book Printers Tshwane | Creative Books SA',
  pageDescription: 'Book printing services for Pretoria and Tshwane authors, businesses, and academics. Softcover, hardcover, academic, and corporate printing. Delivery to Pretoria. Get a free quote.',
  pageKeywords: 'book printing Pretoria, book printers Pretoria, printing services Tshwane, academic book printing Pretoria, book printing Gauteng',
  canonical: 'https://www.creativebookssa.co.za/bookprintingpretoria',
};

export default function BookPrintingPretoria() {
  return <LocationPage locationData={locationData} />;
}