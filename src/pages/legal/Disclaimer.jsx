import React from 'react';
import LegalPage, {
  LegalSection, LegalParagraph,
} from '@/components/legal/LegalPage';

export default function Disclaimer() {
  return (
    <LegalPage
      title="Website Disclaimer"
      subtitle="Important information about the use of the Creative Books SA website and its content."
      lastUpdated="7 July 2026"
      metaDescription="Important information about the use of the Creative Books SA website and its content, and the limits on the use of the site."
      canonical="https://creativebooks.co.za/disclaimer"
      summary={
        <p>This disclaimer governs your use of the Creative Books SA website. By using the site you accept it in full. It should be read together with our Terms &amp; Conditions and Privacy Policy.</p>
      }
    >
      <LegalSection number="1" title="General information only">
        <LegalParagraph>The content on this website is provided for general information about Creative Books SA and its services. While we take care to keep it accurate and up to date, we make no warranty that it is complete, current or error-free, and it may change without notice.</LegalParagraph>
      </LegalSection>

      <LegalSection number="2" title="No professional advice">
        <LegalParagraph>Nothing on this website constitutes professional, legal, financial or publishing advice, and it should not be relied on as such. Any decision you make based on the information here is your own responsibility.</LegalParagraph>
      </LegalSection>

      <LegalSection number="3" title="No guarantee of results">
        <LegalParagraph>We do not guarantee any particular outcome, including the sales, reception or commercial success of any book we help produce or publish.</LegalParagraph>
      </LegalSection>

      <LegalSection number="4" title="Authors’ views">
        <LegalParagraph>Views, opinions and content in books we print or publish are those of their authors, and do not represent the views of Creative Books SA. Responsibility for the content of a manuscript rests with its author, as set out in our Terms &amp; Conditions.</LegalParagraph>
      </LegalSection>

      <LegalSection number="5" title="External links">
        <LegalParagraph>Our website may link to third-party sites for convenience. We do not control and are not responsible for the content, accuracy or practices of those sites, and a link does not imply endorsement.</LegalParagraph>
      </LegalSection>

      <LegalSection number="6" title="Limitation of liability">
        <LegalParagraph>To the maximum extent permitted by law, and subject to any rights under the Consumer Protection Act, 2008 that cannot be excluded, Creative Books SA is not liable for any loss or damage arising from the use of, or inability to use, this website or from reliance on its content.</LegalParagraph>
      </LegalSection>

      <LegalSection number="7" title="Contact">
        <LegalParagraph>Questions about this disclaimer can be sent to info@creativebooks.co.za.</LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}