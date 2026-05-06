import React from 'react';
import PageMeta from '../components/shared/PageMeta';
import { faqSchema } from '../lib/seo/schemas';
import HeroSlider from '../components/home/HeroSlider';
import ServicesGrid from '../components/home/ServicesGrid';
import AboutSection from '../components/home/AboutSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ProcessTimeline from '../components/home/ProcessTimeline';
import PackagesPreview from '../components/home/PackagesPreview';
import FAQSection from '../components/shared/FAQSection';
import CTASection from '../components/shared/CTASection';

const homeFaqs = [
  { question: 'How much does it cost to publish a book in South Africa?', answer: 'Our publishing packages start from R4,999 for the Mini Package and go up to R24,999+ for the Premium Package. The exact cost depends on your manuscript length, design requirements, and chosen services. Contact us for a free personalised quote.' },
  { question: 'How long does the publishing process take in South Africa?', answer: 'Depending on the package chosen, the publishing process typically takes 4–12 weeks from manuscript submission to final printed copies. We work efficiently while maintaining the highest quality standards.' },
  { question: 'Do I keep the rights to my book?', answer: 'Absolutely. At Creative Books SA, you retain 100% of your intellectual property rights. We are a service provider, not a rights holder.' },
  { question: 'Can you help with ISBN registration in South Africa?', answer: 'Yes, ISBN registration is included in all our publishing packages. We handle the entire process with the National Library of South Africa on your behalf.' },
  { question: 'Do you offer book printing only without publishing services?', answer: 'Yes, we offer standalone book printing services in Johannesburg. Whether you need 50 or 5,000 copies, we provide high-quality printing in hardcover, softcover, and specialty formats.' },
  { question: 'Where are you located?', answer: 'We are based in Johannesburg, Gauteng, and serve authors across South Africa and internationally. We welcome in-person consultations and also work remotely with authors nationwide.' },
];

const faqSchemas = [faqSchema(homeFaqs)];

export default function Home() {
  return (
    <div>
      <PageMeta
         title="Publishing Company South Africa | Book Publishing, Printing & Editing | Creative Books SA"
         description="Creative Books SA — South Africa's premier publishing company in Johannesburg. Professional book publishing, printing, editing, cover design & ISBN support. Free quote today."
         keywords="publishing company South Africa, book publishers South Africa, self publishing South Africa, book printing Johannesburg, book editing South Africa, ISBN registration"
         canonical="https://www.creativebookssa.co.za/"
         schema={{ '@graph': faqSchemas }}
       />
      <HeroSlider />
      <ServicesGrid />
      <AboutSection />
      <WhyChooseUs bookImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png" />
      <ProcessTimeline />
      <PackagesPreview />
      <FAQSection faqs={homeFaqs} light />
      <CTASection />
    </div>
  );
}