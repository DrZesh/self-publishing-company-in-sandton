import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ServicesMegaPanel() {
  return (
    <div className="max-w-7xl mx-auto px-20 py-12 grid grid-cols-5 gap-8">
      {/* Publishing Packages Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-1">Publishing Packages</h3>
        <p className="text-[#6B6B6B] text-xs italic mb-4">All-in-one packages from R6,500.</p>
        <ul className="space-y-3.5">
          <li>
            <Link to="/publishingpackages/mini" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Mini Packages (5 copies)
            </Link>
          </li>
          <li>
            <div className="flex items-center gap-2">
              <Link to="/publishingpackages/a5" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
                A5 Full Packages
              </Link>
              <span className="inline-block px-2 py-0.5 bg-copper text-white text-xs font-bold rounded-full uppercase">Most Popular</span>
            </div>
          </li>
          <li>
            <Link to="/publishingpackages/6x9" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              6x9 Full Packages
            </Link>
          </li>
          <li>
            <Link to="/ebook-publishing" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Ebook Packages
            </Link>
          </li>
          <li className="pt-2 border-t border-[#E5E0D5]">
            <Link to="/self-publishing-packages-in-south-africa" className="text-copper text-sm font-semibold hover:text-copper/80 transition-colors inline-flex items-center gap-1">
              Compare all packages
              <ArrowRight className="w-3 h-3" />
            </Link>
          </li>
        </ul>
      </div>

      {/* Writing Services Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Writing Services</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/ghostwriting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Ghostwriting
            </Link>
          </li>
          <li>
            <Link to="/memoirwriting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Memoir Writing
            </Link>
          </li>
          <li>
            <Link to="/biographywriting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Biography Writing
            </Link>
          </li>
          <li>
            <Link to="/christianbookwriting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Christian Book Writing
            </Link>
          </li>
        </ul>
      </div>

      {/* Editing Services Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Editing Services</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/book-editing" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Book Editing
            </Link>
          </li>
          <li>
            <Link to="/proofreading" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Proofreading
            </Link>
          </li>
          <li>
            <Link to="/academicediting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Academic Editing
            </Link>
          </li>
          <li>
            <Link to="/dissertationediting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Dissertation Editing
            </Link>
          </li>
          <li>
            <Link to="/thesisediting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Thesis Editing
            </Link>
          </li>
        </ul>
      </div>

      {/* Design & Production Column */}
      <div>
        <h3 className="text-copper text-xs font-bold uppercase tracking-widest mb-4">Design & Production</h3>
        <ul className="space-y-3.5">
          <li>
            <Link to="/book-cover-design" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Book Cover Design
            </Link>
          </li>
          <li>
            <Link to="/typesetting" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Book Typesetting
            </Link>
          </li>
          <li>
            <Link to="/book-printing" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Book Printing
            </Link>
          </li>
          <li>
            <Link to="/author-websites" className="text-[#2C2C2C] text-sm font-medium hover:text-copper transition-colors">
              Author Websites
            </Link>
          </li>
        </ul>
      </div>

      {/* Featured Promo */}
      <div className="bg-[#FAF5EE] rounded-lg p-6 flex flex-col justify-between border-l-4 border-copper">
        <div>
          <p className="text-copper text-xs font-bold uppercase tracking-widest mb-2">Featured</p>
          <h3 className="text-[#2C2C2C] text-lg font-bold mb-3">Need everything done for you?</h3>
          <p className="text-[#6B6B6B] text-sm mb-6">
            Our full self-publishing packages handle editing, design, layout, ISBN and printing in one place.
          </p>
        </div>
        <Link
          to="/self-publishing-packages-in-south-africa"
          className="inline-flex items-center gap-2 text-copper font-semibold hover:text-copper/80 transition-colors text-sm"
        >
          View All Packages
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}