import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';

const locationData = {
  bookpublishersjohannesburg: {
    subtitle: 'Book Publishers Johannesburg',
    title: 'Book Publishers in Johannesburg',
    description: 'Looking for a trusted book publisher in Johannesburg? Creative Books SA offers complete publishing services in Gauteng — editing, design, printing, and distribution for authors in Johannesburg and across South Africa.',
  },
  publishingcompaniessouthafrica: {
    subtitle: 'Publishing Companies South Africa',
    title: 'Publishing Companies in South Africa',
    description: 'Creative Books SA is one of South Africa\'s leading publishing companies. Based in Johannesburg, Gauteng, we provide professional publishing services to authors nationwide.',
  },
  bookprintingjohannesburg: {
    subtitle: 'Book Printing Johannesburg',
    title: 'Book Printing in Johannesburg',
    description: 'Professional book printing services in Johannesburg, Gauteng. High-quality hardcover and softcover printing with fast turnaround and competitive pricing.',
  },
  editingservicesjohannesburg: {
    subtitle: 'Editing Services Johannesburg',
    title: 'Editing Services in Johannesburg',
    description: 'Expert book editing, proofreading, and manuscript evaluation in Johannesburg. Professional editors serving authors across Gauteng and South Africa.',
  },
  bookcoverdesignjohannesburg: {
    subtitle: 'Book Cover Design Johannesburg',
    title: 'Book Cover Design in Johannesburg',
    description: 'Professional book cover designers in Johannesburg creating stunning covers for fiction, non-fiction, children\'s books, and academic publications.',
  },
};

export default function LocationPage({ locationKey }) {
  const data = locationData[locationKey];
  if (!data) return null;

  return (
    <ServicePageTemplate
      heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
      subtitle={data.subtitle}
      title={data.title}
      description={data.description}
      features={[
        { title: 'Johannesburg Based', description: 'Our offices and printing facility are located in Johannesburg, Gauteng — the heart of South Africa\'s publishing industry.' },
        { title: 'In-Person Consultations', description: 'Visit us for face-to-face meetings and manuscript discussions at our Johannesburg office.' },
        { title: 'Local Print Facility', description: 'Books are printed locally in Johannesburg, reducing turnaround time and shipping costs for Gauteng authors.' },
        { title: 'Nationwide Delivery', description: 'While based in Johannesburg, we deliver printed books anywhere in South Africa.' },
        { title: 'SA Market Expertise', description: 'Deep understanding of the South African publishing market, ISBN registration, and local retail channels.' },
        { title: 'Competitive SA Pricing', description: 'Affordable publishing, printing, and editing rates designed for the South African market.' },
      ]}
      processSteps={[
        { title: 'Free Consultation', description: 'Meet us at our Johannesburg office or schedule a virtual consultation from anywhere in South Africa.' },
        { title: 'Personalised Quote', description: 'Receive a detailed, no-obligation quote tailored to your project needs and budget.' },
        { title: 'Professional Production', description: 'Our Johannesburg team handles editing, design, and printing with hands-on quality control.' },
        { title: 'Delivery & Support', description: 'Receive your books and ongoing support from our dedicated team in Gauteng.' },
      ]}
      faqs={[
        { question: 'Where are you located in Johannesburg?', answer: 'Creative Books SA is located in Johannesburg, Gauteng, South Africa. We welcome in-person consultations by appointment.' },
        { question: 'Do you serve authors outside Johannesburg?', answer: 'Yes! While based in Johannesburg, we serve authors across Gauteng, all provinces of South Africa, and internationally. Most of our process is handled digitally.' },
        { question: 'Can I visit your printing facility?', answer: 'Yes, authors are welcome to visit our Johannesburg facility by appointment to see the printing process and review proofs in person.' },
      ]}
      relatedLinks={[
        { label: 'Book Publishing', path: '/bookpublishing' },
        { label: 'Book Printing', path: '/bookprinting' },
        { label: 'Book Editing', path: '/bookediting' },
        { label: 'Cover Design', path: '/bookcoverdesign' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Get a Quote', path: '/getquote' },
        { label: 'Contact Us', path: '/contact' },
      ]}
      ctaTitle={`Get Started in ${locationKey.includes('johannesburg') ? 'Johannesburg' : 'South Africa'}`}
      ctaDescription="Contact our team for a free consultation and personalised quote."
    />
  );
}