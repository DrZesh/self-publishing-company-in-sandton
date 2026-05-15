import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PrintingMegaPanel() {
  return (
    <div className="max-w-7xl mx-auto px-20 py-12 grid grid-cols-4 gap-8">
      {/* By Book Size Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">By Book Size</h3>
        <ul className="space-y-3.5">
          <li>
            <div className="flex items-center gap-2">
              <Link to="/printing/PrintingA5" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
                A5 Printing
              </Link>
              <span className="inline-block px-2 py-0.5 bg-copper text-white text-xs font-bold rounded-full uppercase">Most Popular</span>
            </div>
          </li>
          <li>
            <Link to="/printing/Printing6x9" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              6x9 Printing
            </Link>
          </li>
          <li>
            <Link to="/printing/PrintingHardcover" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Hardcover Printing
            </Link>
          </li>
          <li>
            <Link to="/printing/PrintingChildrensBooks" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Children's Book Printing
            </Link>
          </li>
        </ul>
      </div>

      {/* Children's Book Sizes Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Children's Book Sizes</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/printing/childrensbooks/ChildrensBooks15x15" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              15 x 15 cm
            </Link>
          </li>
          <li>
            <Link to="/printing/childrensbooks/ChildrensBooks20x20" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              20 x 20 cm
            </Link>
          </li>
          <li>
            <Link to="/printing/childrensbooks/ChildrensBooks21x21" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              21 x 21 cm
            </Link>
          </li>
        </ul>
      </div>

      {/* Popular Book Types Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Popular Book Types</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/seo/industry/NovelPrinting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Novel Printing
            </Link>
          </li>
          <li>
            <Link to="/seo/industry/MemoirBookPrinting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Memoir Printing
            </Link>
          </li>
          <li>
            <Link to="/seo/industry/ChristianBookPrinting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Christian Book Printing
            </Link>
          </li>
          <li>
            <Link to="/seo/industry/CookbookPrinting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Cookbook Printing
            </Link>
          </li>
          <li className="pt-2 border-t border-[#E5E0D5]">
            <Link to="/services/BookPrinting" className="text-copper text-sm font-semibold hover:text-copper/80 transition-colors inline-flex items-center gap-1">
              View all book types
              <ArrowRight className="w-3 h-3" />
            </Link>
          </li>
        </ul>
      </div>

      {/* Helpful Tools Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Helpful Tools</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/tools/BookPrintingCalculator" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Printing Calculator
            </Link>
          </li>
          <li>
            <Link to="/resources/CoverSizeCalculator" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Cover Size Calculator
            </Link>
          </li>
          <li>
            <Link to="/seo/longtail/A5vs6x9BookPrinting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              A5 vs 6x9 Guide
            </Link>
          </li>
        </ul>
      </div>

      {/* Featured Promo - adjust grid to span */}
      <div className="col-span-full mt-4">
        <div className="bg-[#FAF5EE] rounded-lg p-6 border-l-4 border-copper max-w-sm">
          <p className="text-copper text-xs font-bold uppercase tracking-widest mb-2">Featured</p>
          <h3 className="text-[#2C2C2C] text-lg font-bold mb-3">Not sure what you need?</h3>
          <p className="text-[#6B6B6B] text-sm mb-6">
            Use our free printing calculator to get an instant estimate.
          </p>
          <Link
            to="/tools/BookPrintingCalculator"
            className="inline-flex items-center gap-2 text-copper font-semibold hover:text-copper/80 transition-colors text-sm"
          >
            Try the Calculator
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}