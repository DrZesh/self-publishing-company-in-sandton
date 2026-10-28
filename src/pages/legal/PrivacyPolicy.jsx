import React from 'react';
import LegalPage, {
  LegalSection, LegalParagraph, LegalList, LegalDefinitions, LegalCallout, LegalContactBlock,
} from '@/components/legal/LegalPage';

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Creative Books SA collects, uses, shares and protects your personal information, in line with the Protection of Personal Information Act, 2013 (POPIA)."
      lastUpdated="7 July 2026"
      metaDescription="How Creative Books SA collects, uses, shares and protects your personal information, in line with POPIA. Read our full Privacy Policy."
      canonical="https://creativebooks.co.za/privacy-policy"
      summary={
        <>
          <p><strong>In short:</strong> We collect the information we need to prepare quotes, produce and deliver your books, and communicate with you. We do not sell your personal information. We use trusted service providers to run our business, some of whom are located outside South Africa. You have the right to access, correct or delete your information, and to complain to the Information Regulator.</p>
          <p>This is the full policy. Please read it together with our Terms &amp; Conditions and Cookie Policy.</p>
        </>
      }
    >
      <LegalSection number="1" title="Who we are">
        <LegalParagraph>This Privacy Policy applies to the website creativebooks.co.za and to the self-publishing, book printing, typesetting, design and editorial services offered by Creative Books SA (“Creative Books SA”, “we”, “us” or “our”).</LegalParagraph>
        <LegalParagraph>For the purposes of POPIA, Creative Books SA is the <strong>responsible party</strong> for the personal information described in this policy.</LegalParagraph>
        <LegalList items={[
          <><strong>Responsible party:</strong> Creative Books SA</>,
          <><strong>Physical address:</strong> 1 Ruby Cl, Fourways, 2191, South Africa</>,
          <><strong>Contact for privacy matters:</strong> info@creativebooks.co.za · 010 500 3331</>,
        ]} />
      </LegalSection>

      <LegalSection number="2" title="Key terms">
        <LegalParagraph>We use a few terms from POPIA in this policy:</LegalParagraph>
        <LegalDefinitions items={[
          { term: 'Personal information:', description: 'Information that identifies or relates to an identifiable, living natural person and, where applicable, an identifiable, existing juristic person (a company or other entity).' },
          { term: 'Processing:', description: 'Anything done with personal information — collecting, storing, using, sharing, updating or deleting it.' },
          { term: 'Data subject:', description: 'The person to whom the personal information relates — for example, you.' },
          { term: 'Operator:', description: 'A third party that processes personal information on our behalf and under our instruction (for example, our hosting or accounting providers).' },
          { term: 'Special personal information:', description: 'Sensitive categories such as health, religious or philosophical beliefs, race or ethnic origin, and criminal behaviour, which POPIA protects more strictly.' },
        ]} />
      </LegalSection>

      <LegalSection number="3" title="The personal information we collect">
        <LegalParagraph>Depending on how you interact with us, we may collect the following categories of personal information:</LegalParagraph>
        <LegalDefinitions items={[
          { term: 'Identity and contact details:', description: 'Your name, email address, telephone or WhatsApp number, business name (if any) and postal or delivery address.' },
          { term: 'Project and quote information:', description: 'Details you provide through our get-a-quote form or in correspondence — such as page count, word count, trim size, quantity, format, finishing options and other specifications needed to price and produce your work.' },
          { term: 'Manuscript and content:', description: 'The manuscripts, text, images, artwork and files you send us for editing, typesetting, design or printing. These may themselves contain personal information about you or about third parties (see section 9).' },
          { term: 'Transaction and billing information:', description: 'Invoicing details, amounts, payment status and correspondence relating to your orders. Card and banking details are handled by our payment and accounting providers — we do not store full card numbers ourselves.' },
          { term: 'Communications:', description: 'The content of emails, WhatsApp messages, quote correspondence and support enquiries between you and us.' },
          { term: 'Technical and usage information:', description: 'Information collected automatically when you visit our website, such as your IP address, browser type, device information, referring pages and how you use the site. See our Cookie Policy.' },
        ]} />
      </LegalSection>

      <LegalSection number="4" title="How we collect it">
        <LegalDefinitions items={[
          { term: 'Directly from you', description: '— when you complete our quote form, request a service, email or message us, place an order, or send us a manuscript.' },
          { term: 'Automatically', description: '— through cookies and similar technologies when you use our website.' },
          { term: 'From third parties', description: '— occasionally from our service providers (for example, payment confirmations from our accounting or payment provider) or from someone who refers you to us.' },
        ]} />
      </LegalSection>

      <LegalSection number="5" title="Why we process your information">
        <LegalParagraph>We process personal information for the following purposes:</LegalParagraph>
        <LegalList items={[
          'To respond to enquiries and prepare and send you quotes.',
          'To provide our services — editing, typesetting, design, printing, publishing and delivery of your books.',
          'To communicate with you about your project, proofs, timelines and approvals.',
          'To invoice you, take payment and keep proper accounting and tax records.',
          'To manage our relationship with you and provide support.',
          'To operate, secure and improve our website and services.',
          'To comply with our legal, regulatory and tax obligations.',
          'With your consent, or where the law otherwise allows, to send you information about our services (see section 11).',
        ]} />
      </LegalSection>

      <LegalSection number="6" title="Our lawful basis for processing">
        <LegalParagraph>POPIA requires us to have a lawful basis for processing your personal information. We rely on one or more of the following:</LegalParagraph>
        <LegalDefinitions items={[
          { term: 'Performance of a contract', description: '— where processing is necessary to provide a quote or carry out the services you have asked for.' },
          { term: 'Your consent', description: '— for example, for certain marketing communications, which you may withdraw at any time.' },
          { term: 'Legal obligation', description: '— where we must process information to comply with the law (for example, keeping tax and accounting records).' },
          { term: 'Legitimate interests', description: '— for the proper running, security and improvement of our business, provided this does not override your rights and interests.' },
        ]} />
      </LegalSection>

      <LegalSection number="7" title="How we use artificial intelligence">
        <LegalParagraph>To help us work quickly, we use an artificial-intelligence service (Anthropic’s Claude) to help draft quote and email correspondence. We want to be transparent about how this works:</LegalParagraph>
        <LegalList items={[
          <><strong>Pricing is calculated by our own systems and rate tables</strong> — not by the AI. The AI does not set, change or invent prices.</>,
          'The AI is used only to help draft wording around information we have already prepared.',
          <><strong>A member of our team reviews every AI-assisted draft before it is sent to you.</strong> No quote or communication is sent automatically without human review.</>,
          'We do not use the AI to make decisions about you that produce legal or similarly significant effects for you based solely on automated processing.',
        ]} />
        <LegalParagraph>Where information is processed by this service, that processing is covered by the safeguards described in sections 12 and 13.</LegalParagraph>
      </LegalSection>

      <LegalSection number="8" title="Who we share your information with">
        <LegalParagraph>We do not sell your personal information. We share it only where necessary, and only with parties who are bound to protect it. These include:</LegalParagraph>
        <LegalDefinitions items={[
          { term: 'Platform & hosting provider:', description: 'Base44, which hosts our website and business application.' },
          { term: 'Accounting & payment providers:', description: 'Zoho Books, which we use for invoicing, record-keeping and to process payments.' },
          { term: 'Communication tools:', description: 'Our email provider and WhatsApp (Meta) where you choose to contact us that way.' },
          { term: 'Analytics & advertising providers:', description: 'Google (Google Analytics, via Google Tag Manager) and Meta (the Facebook Pixel), which help us understand how our website is used and measure our marketing. See our Cookie Policy.' },
          { term: 'AI drafting service:', description: 'Anthropic (Claude), as described in section 7.' },
          { term: 'Production & delivery partners:', description: 'The Courier Guy and any print or finishing partners we use to produce and deliver your order.' },
          { term: 'Professional advisers & authorities:', description: 'Our advisers (such as accountants or lawyers) and regulators, courts or authorities where we are legally required to disclose information.' },
        ]} />
        <LegalParagraph>Where these parties process personal information on our behalf, they do so as our <strong>operators</strong> under written agreements requiring them to keep it confidential and secure and to process it only on our instructions.</LegalParagraph>
      </LegalSection>

      <LegalSection number="9" title="Manuscripts and third-party information">
        <LegalCallout>
          <p><strong>Important.</strong> Manuscripts and files you send us may contain personal information about other people (for example, in a memoir or biography). Where you provide us with such information, you confirm that you are entitled to share it with us and, where required, that you have obtained the necessary consent. You remain responsible for the content of your manuscript, as set out in our Terms &amp; Conditions. We treat manuscripts as confidential and use them only to provide the services you have requested.</p>
        </LegalCallout>
      </LegalSection>

      <LegalSection number="10" title="Security of your information">
        <LegalParagraph>We take reasonable and appropriate technical and organisational measures to protect personal information against loss, unauthorised access, alteration or disclosure, as required by section 19 of POPIA. These include access controls, use of reputable service providers, and encryption of data in transit where appropriate.</LegalParagraph>
        <LegalParagraph>No method of transmission or storage is completely secure. While we work to protect your information, we cannot guarantee absolute security, and any transmission is at your own risk. If we become aware of a security compromise affecting your personal information, we will notify you and the Information Regulator as required by law.</LegalParagraph>
      </LegalSection>

      <LegalSection number="11" title="Direct marketing">
        <LegalParagraph>We will only send you electronic marketing (such as emails or messages about our services) where you have consented, or where the law otherwise permits — for example, to existing customers about similar services. Every marketing message will give you a simple way to opt out, and you can ask us to stop at any time by contacting us using the details in section 16.</LegalParagraph>
      </LegalSection>

      <LegalSection number="12" title="How long we keep your information">
        <LegalParagraph>We keep personal information only for as long as necessary for the purposes described in this policy, and to meet our legal, accounting and tax obligations (for example, financial records are generally retained for at least five years under South African tax law). When we no longer need your information, we will securely delete or de-identify it. We may keep manuscript files for a reasonable period after a project to allow for reprints or corrections, unless you ask us to delete them sooner.</LegalParagraph>
      </LegalSection>

      <LegalSection number="13" title="Sending information outside South Africa">
        <LegalParagraph>Some of the service providers described in section 8 (for example, our hosting, accounting, AI and communication providers) are located outside South Africa, which means your personal information may be transferred to, and stored in, other countries.</LegalParagraph>
        <LegalParagraph>Where we transfer personal information across borders, we do so in accordance with section 72 of POPIA — that is, where the recipient is subject to laws, binding rules or agreements that provide an adequate level of protection, where the transfer is necessary to perform our contract with you, or where you have consented. We take reasonable steps to ensure your information remains protected wherever it is processed.</LegalParagraph>
      </LegalSection>

      <LegalSection number="14" title="Your rights">
        <LegalParagraph>Subject to POPIA, you have the right to:</LegalParagraph>
        <LegalList items={[
          'Ask what personal information we hold about you and request access to it.',
          'Ask us to correct or update information that is inaccurate or incomplete.',
          'Ask us to delete information we are no longer entitled to keep.',
          'Object, on reasonable grounds, to the processing of your information.',
          'Object to your information being used for direct marketing.',
          'Withdraw a consent you have given (this will not affect processing that already took place).',
          'Complain to the Information Regulator (see section 15).',
        ]} />
        <LegalParagraph>To exercise any of these rights, contact us using the details in section 16. We may need to verify your identity before acting on a request. Requests for access may, where applicable, be made on the prescribed POPIA form.</LegalParagraph>
      </LegalSection>

      <LegalSection number="15" title="Complaints to the Information Regulator">
        <LegalParagraph>If you are not satisfied with how we have handled your personal information, you have the right to lodge a complaint with the Information Regulator:</LegalParagraph>
        <LegalContactBlock>
          <p><strong>The Information Regulator (South Africa)</strong></p>
          <p>JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</p>
          <p>General enquiries: enquiries@inforegulator.org.za</p>
          <p>POPIA complaints: POPIAComplaints@inforegulator.org.za</p>
          <p>Telephone: 010 023 5200</p>
          <p>Website: inforegulator.org.za</p>
        </LegalContactBlock>
        <LegalParagraph>We would appreciate the chance to address your concerns directly first, so please do consider contacting us before approaching the Regulator.</LegalParagraph>
      </LegalSection>

      <LegalSection number="16" title="How to contact us">
        <LegalParagraph>For any question about this policy or your personal information, or to exercise your rights, please contact us:</LegalParagraph>
        <LegalContactBlock>
          <p><strong>Creative Books SA</strong></p>
          <p>Email: info@creativebooks.co.za</p>
          <p>Telephone: 010 500 3331</p>
          <p>Address: 1 Ruby Cl, Fourways, 2191</p>
        </LegalContactBlock>
      </LegalSection>

      <LegalSection number="17" title="Changes to this policy">
        <LegalParagraph>We may update this Privacy Policy from time to time. The current version will always be available on our website, with the “last updated” date shown at the top. Significant changes will be communicated where appropriate.</LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}