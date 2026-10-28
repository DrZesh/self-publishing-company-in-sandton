import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ResourcesMegaPanel() {
  const currentDate = new Date();
  const monthYear = currentDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-20 py-12 grid grid-cols-3 gap-8">
      {/* Tools & Calculators Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Tools & Calculators</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/resources/CoverSizeCalculator" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Cover Size Calculator
            </Link>
          </li>
          <li>
            <Link to="/tools/BookPrintingCalculator" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Book Printing Calculator
            </Link>
          </li>
          <li>
            <Link to="/barcode-generator" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              ISBN Barcode Generator
            </Link>
          </li>
          <li>
            <Link to="/isbn" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              ISBN Registration Guide
            </Link>
          </li>
          <li>
            <Link to="/resources/documents" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Documents
            </Link>
          </li>
        </ul>
      </div>

      {/* Popular Guides Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Popular Guides</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/publishingguide" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Complete Self-Publishing Guide
            </Link>
          </li>
          <li>
            <Link to="/howmuchdoesitcosttopublishabook" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              How Much Does It Cost?
            </Link>
          </li>
          <li>
            <Link to="/how-to-get-an-isbn-for-your-book" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              How to Get an ISBN
            </Link>
          </li>
          <li>
            <Link to="/howtoselfpublishabook" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              How to Self-Publish a Book
            </Link>
          </li>
          <li>
            <Link to="/howtomarketandsellyourselfpublishedbookinsouthafrica" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              How to Market Your Book
            </Link>
          </li>
          <li>
            <Link to="/bestplatformstoselfpublishinsouthafrica" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Best Self-Publishing Platforms
            </Link>
          </li>
        </ul>
      </div>

      {/* Learn More Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Learn More</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/blog" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Browse the Blog
            </Link>
          </li>
          <li>
            <Link to="/faq" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              FAQ
            </Link>
          </li>
          <li>
            <Link to="/aboutus" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              About Creative Books SA
            </Link>
          </li>
        </ul>
      </div>

      {/* Featured Article Panel - spans bottom */}
      <div className="col-span-full mt-4">
        <div className="bg-[#FAF5EE] rounded-lg p-8 border-l-4 border-copper max-w-2xl">
          <p className="text-copper text-xs font-bold uppercase tracking-widest mb-2">Featured Article</p>
          <p className="text-[#6B6B6B] text-xs mb-4">Updated {monthYear}</p>
          <h3 className="text-[#2C2C2C] text-2xl font-bold mb-3">The Complete Guide to Self-Publishing in South Africa</h3>
          <p className="text-[#6B6B6B] text-sm mb-6">
            Real costs, real steps, and the distribution truth most authors learn too late.
          </p>
          <Link
            to="/publishingguide"
            className="inline-flex items-center gap-2 text-copper font-semibold hover:text-copper/80 transition-colors text-sm"
          >
            Read the Guide
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}