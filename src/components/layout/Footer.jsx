import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const footerSilos = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', path: '/' },
      { label: 'About Us', path: '/aboutus' },
      { label: 'Blog', path: '/blog' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Get a Quote', path: '/getquote' },
    ]
  },
  {
    title: 'Services',
    links: [
      { label: 'Book Printing', path: '/bookprinting' },
      { label: 'Book Editing', path: '/bookediting' },
      { label: 'Book Cover Design', path: '/bookcoverdesign' },
      { label: 'eBook Publishing', path: '/ebookpublishing' },
      { label: 'Ghostwriting', path: '/ghostwriting' },
      { label: 'Typesetting & Layout', path: '/typesetting' },
      { label: 'Author Websites', path: '/authorwebsites' },
    ]
  },
  {
    title: 'Publishing Categories',
    links: [
      { label: 'Book Publishing', path: '/bookpublishing' },
      { label: 'Poetry Book Publishing', path: '/poetrybookpublishing' },
      { label: 'Memoir Book Publishing', path: '/memoirbookpublishing' },
      { label: 'Christian Book Publishing', path: '/christianbookpublishing' },
      { label: "Children's Book Publishing", path: '/childrensbookpublishing' },
      { label: 'Business Book Publishing', path: '/businessbookpublishing' },
      { label: 'Self Publishing', path: '/selfpublishing' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'ISBN Registration', path: '/isbnregistration' },
      { label: 'How to Publish a Book', path: '/howtopublishabook' },
      { label: 'Publishing Guide', path: '/publishingguide' },
      { label: 'Best Publishers SA', path: '/bestpublishingcompaniesinsouthafrica' },
      { label: 'Publishers in SA', path: '/bookpublisherssouthafrica' },
      { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
    ]
  },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian text-white/70">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-copper flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg">C</span>
              </div>
              <div>
                <span className="text-white font-heading text-lg font-semibold">Creative Books</span>
                <span className="text-copper text-xs block tracking-[0.3em] uppercase">South Africa</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              South Africa's premier publishing company. We bring your story to life with professional publishing, printing, editing, and design services.
            </p>
            <div className="space-y-3 text-sm">
              <a href="tel:+27000000000" className="flex items-center gap-3 hover:text-copper transition-colors">
                <Phone className="w-4 h-4 text-copper" /> +27 (0) 00 000 0000
              </a>
              <a href="mailto:info@creativebookssa.co.za" className="flex items-center gap-3 hover:text-copper transition-colors">
                <Mail className="w-4 h-4 text-copper" /> info@creativebookssa.co.za
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-copper shrink-0" /> Johannesburg, Gauteng, South Africa
              </div>
            </div>
          </div>

          {/* Silo Columns */}
          {footerSilos.map((silo, i) => (
            <div key={silo.title} className={i > 0 ? 'border-t border-white/5 pt-6 md:border-t-0 md:pt-0 md:border-l md:border-white/5 md:pl-6' : ''}>
              <h4 className="text-white font-heading text-sm font-semibold mb-4 tracking-wider uppercase">{silo.title}</h4>
              <ul className="space-y-2.5">
                {silo.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm hover:text-copper transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Creative Books SA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/aboutus" className="hover:text-copper transition-colors">About</Link>
            <Link to="/contact" className="hover:text-copper transition-colors">Contact</Link>
            <Link to="/getquote" className="hover:text-copper transition-colors">Get Quote</Link>
            <a href="https://wa.me/27000000000" target="_blank" rel="noopener noreferrer" className="hover:text-copper transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}