import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ServicesGrid from '../components/home/ServicesGrid';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ProcessTimeline from '../components/home/ProcessTimeline';
import PackagesPreview from '../components/home/PackagesPreview';
import TestimonialsSection from '../components/shared/TestimonialsSection';
import FAQSection from '../components/shared/FAQSection';
import CTASection from '../components/shared/CTASection';

const homeFaqs = [
  { question: 'How much does it cost to publish a book in South Africa?', answer: 'Our publishing packages start from R4,999 for the Mini Package and go up to R24,999+ for the Premium Package. The exact cost depends on your manuscript length, design requirements, and chosen services. Contact us for a free personalised quote.' },
  { question: 'How long does the publishing process take?', answer: 'Depending on the package chosen, the publishing process typically takes 4–12 weeks from manuscript submission to final printed copies. We work efficiently while maintaining the highest quality standards.' },
  { question: 'Do I keep the rights to my book?', answer: 'Absolutely. At Creative Books SA, you retain 100% of your intellectual property rights. We are a service provider, not a rights holder.' },
  { question: 'Can you help with ISBN registration?', answer: 'Yes, ISBN registration is included in all our publishing packages. We handle the entire process with the National Library of South Africa on your behalf.' },
  { question: 'Do you offer printing only without publishing services?', answer: 'Yes, we offer standalone book printing services. Whether you need 50 or 5,000 copies, we provide high-quality printing in hardcover, softcover, and specialty formats.' },
  { question: 'Where are you located?', answer: 'We are based in Johannesburg, Gauteng, and serve authors across South Africa and internationally. We welcome in-person consultations and also work remotely with authors nationwide.' },
];

export default function Home() {
  return (
    <div>
      <HeroSection heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png" />
      <ServicesGrid />
      <WhyChooseUs bookImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png" />
      <ProcessTimeline />
      <PackagesPreview />
      <TestimonialsSection />
      <FAQSection faqs={homeFaqs} light />
      <CTASection />
    </div>
  );
}