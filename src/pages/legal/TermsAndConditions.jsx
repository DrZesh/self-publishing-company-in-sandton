import React from 'react';
import LegalPage, {
  LegalSection, LegalParagraph, LegalList, LegalDefinitions, LegalCallout, LegalContactBlock,
} from '@/components/legal/LegalPage';

export default function TermsAndConditions() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="The terms on which Creative Books SA provides its website and its self-publishing, printing, typesetting and editorial services."
      lastUpdated="7 July 2026"
      metaDescription="The terms on which Creative Books SA provides its website and self-publishing, printing, typesetting and editorial services. How quotes, orders, payment and liability work."
      canonical="https://creativebooks.co.za/terms-and-conditions"
      summary={
        <p><strong>Please read these terms carefully.</strong> They form a binding agreement between you and Creative Books SA when you request a quote, place an order or use our website. They set out how quotes and orders work, payment, your responsibilities as an author, and the limits of our liability. Nothing in these terms limits any rights you have under the Consumer Protection Act, 2008 (the “CPA”) that cannot be excluded.</p>
      }
    >
      <LegalSection number="1" title="About us and these terms">
        <LegalParagraph>This website and our services are provided by Creative Books SA (“Creative Books SA”, “we”, “us”), of 1 Ruby Cl, Fourways, 2191. You can reach us at info@creativebooks.co.za or 010 500 3331.</LegalParagraph>
        <LegalParagraph>By using our website, requesting a quote, or placing an order, you agree to these Terms &amp; Conditions and to our Privacy Policy. If you do not agree, please do not use our services.</LegalParagraph>
      </LegalSection>

      <LegalSection number="2" title="Definitions">
        <LegalDefinitions items={[
          { term: 'Services:', description: 'Any services we provide, including self-publishing support, book printing, typesetting, book design, editing and related editorial work.' },
          { term: 'Author / you:', description: 'The person or entity requesting or purchasing our Services.' },
          { term: 'Work:', description: 'The manuscript, text, images, artwork and other content you supply to us.' },
          { term: 'Proof:', description: 'A sample or pre-production version of your book (digital or physical) provided for your review and approval.' },
          { term: 'Order:', description: 'Your accepted request for Services, forming a contract between us.' },
        ]} />
      </LegalSection>

      <LegalSection number="3" title="Our services">
        <LegalParagraph>We offer self-publishing, book printing, typesetting, design and editorial services as described on our website and in the quote provided to you. The exact scope, deliverables and specifications for your project will be those set out in your quote and any related written correspondence.</LegalParagraph>
      </LegalSection>

      <LegalSection number="4" title="Quotes">
        <LegalList items={[
          'Quotes are based on the information and specifications you provide. If the scope changes — for example, a different page count, word count, quantity, trim size or finishing — the price may change accordingly.',
          'Unless stated otherwise, a quote is valid for 30 days from its date.',
          'Prices are quoted in South African Rand and, where applicable, indicate whether they include or exclude VAT.',
          'A quote is an invitation to proceed, not a binding contract, until an Order is accepted in accordance with section 5.',
        ]} />
      </LegalSection>

      <LegalSection number="5" title="Orders and acceptance">
        <LegalParagraph>An Order is accepted, and a contract is formed, when you confirm the quote in writing and we receive the required payment or deposit (see section 6), or when we otherwise confirm your Order in writing — whichever happens first. We may decline any Order at our discretion, for example where the requested content is unlawful.</LegalParagraph>
      </LegalSection>

      <LegalSection number="6" title="Fees and payment">
        <LegalList items={[
          'Fees are as set out in your accepted quote. Unless agreed otherwise, a 50% is payable before work begins, with the balance payable before delivery.',
          'We invoice through Zoho Books and accept payment by EFT and card.',
          'Ownership of any printed goods remains with us until payment has been received in full. Risk in the goods passes to you on delivery or collection (see section 12).',
          'We may suspend work or delivery while any invoice remains overdue, and we reserve our rights in respect of unpaid amounts.',
        ]} />
      </LegalSection>

      <LegalSection number="7" title="Your content and your responsibilities">
        <LegalParagraph>You are responsible for the content of your Work. By submitting Work to us, you warrant and confirm that:</LegalParagraph>
        <LegalList items={[
          'You own the copyright in the Work, or have all necessary rights, licences and permissions to use it and to have it produced;',
          'The Work does not infringe the intellectual-property or other rights of any third party;',
          'The Work is not defamatory, unlawful, obscene or otherwise objectionable, and does not breach any law; and',
          'Where the Work contains personal information about other people, you are entitled to provide it and have obtained any necessary consent (see our Privacy Policy).',
        ]} />
        <LegalParagraph>You grant us the licence necessary to reproduce, typeset, print and produce your Work for the purpose of providing the Services. You <strong>indemnify</strong> us against any claim, loss or damage arising from a breach of these warranties or from the content of your Work.</LegalParagraph>
      </LegalSection>

      <LegalSection number="8" title="Intellectual property">
        <LegalList items={[
          'You retain ownership of the copyright in your own Work.',
          'We retain ownership of our own materials, including our website content, templates, systems and any design elements or software we create, except for the specific deliverables licensed or transferred to you under your Order.',
          'On full payment, the finished book (and, where agreed, a print-ready or ebook file) is provided to you for your own use; Creative Books SA retains its own working files, design assets and templates.',
        ]} />
      </LegalSection>

      <LegalSection number="9" title="Proofs and approval">
        <LegalParagraph>Before final production we will normally provide a proof for your review. It is your responsibility to check the proof carefully — including text, spelling, layout, images and specifications — and to approve it in writing before we proceed.</LegalParagraph>
        <LegalCallout>
          <p><strong>Once you approve a proof, you accept responsibility for its content.</strong> We are not liable for errors, omissions or issues that were present in a proof you approved. If we deviate from an approved proof, we will correct the error at our cost (see our Refunds &amp; Returns Policy).</p>
        </LegalCallout>
      </LegalSection>

      <LegalSection number="10" title="Changes and author’s alterations">
        <LegalParagraph>Changes you request after approval, or after work has begun, may incur additional charges and may affect timelines. We will let you know the cost and impact before carrying out significant changes.</LegalParagraph>
      </LegalSection>

      <LegalSection number="11" title="Timelines and production tolerances">
        <LegalList items={[
          'Any timeframes we give are good-faith estimates, not guarantees. Delays caused by you (for example, late approvals or content) or by third parties (such as couriers) are outside our control.',
          'Printing and finishing are subject to normal industry tolerances. Minor variations in colour, trim, binding and finish, and small quantity variances of up to 5%, are considered acceptable and are not defects.',
        ]} />
      </LegalSection>

      <LegalSection number="12" title="Delivery, collection and risk">
        <LegalParagraph>We deliver via The Courier Guy or by collection, as agreed. Delivery timeframes are estimates. Risk in any goods passes to you on delivery or collection. Please inspect your order on receipt and report any transit damage promptly (see our Refunds &amp; Returns Policy).</LegalParagraph>
      </LegalSection>

      <LegalSection number="13" title="Cancellations, returns and refunds">
        <LegalParagraph>Because our printed books are produced to your specifications and approved proof, they are custom-made goods. Your rights, and the circumstances in which cancellations, returns and refunds apply, are set out in full in our Refunds &amp; Returns Policy, which forms part of these terms.</LegalParagraph>
      </LegalSection>

      <LegalSection number="14" title="Confidentiality">
        <LegalParagraph>We treat your Work and project details as confidential and use them only to provide the Services, except where disclosure is required by law or to our operators under appropriate confidentiality obligations. We expect the same confidentiality from you in respect of any non-public information we share with you.</LegalParagraph>
      </LegalSection>

      <LegalSection number="15" title="Warranties and limitation of liability">
        <LegalParagraph>We will provide the Services with reasonable care and skill. To the maximum extent permitted by law, and subject always to your non-excludable rights under the CPA:</LegalParagraph>
        <LegalList items={[
          'Our total liability arising from or in connection with an Order is limited to the amount you paid for that Order;',
          'We are not liable for indirect or consequential loss, loss of profit, or loss of anticipated sales or opportunity; and',
          'We give no guarantee as to the commercial success, sales or reception of any published work.',
        ]} />
        <LegalParagraph>Nothing in these terms excludes or limits liability that cannot lawfully be excluded, including liability under the CPA for goods that are unsafe, defective or of poor quality.</LegalParagraph>
      </LegalSection>

      <LegalSection number="16" title="Events beyond our control">
        <LegalParagraph>We are not responsible for delays or failures caused by events beyond our reasonable control, including supplier or courier failures, load-shedding, natural events, or disruptions to third-party services.</LegalParagraph>
      </LegalSection>

      <LegalSection number="17" title="Privacy">
        <LegalParagraph>Our collection and use of personal information is governed by our Privacy Policy, which forms part of these terms.</LegalParagraph>
      </LegalSection>

      <LegalSection number="18" title="General">
        <LegalDefinitions items={[
          { term: 'Whole agreement.', description: 'Your accepted quote, these terms and our policies make up the whole agreement between us for your Order.' },
          { term: 'Changes.', description: 'We may update these terms from time to time; the version in force when you place an Order applies to that Order.' },
          { term: 'Severability.', description: 'If any provision is found to be unenforceable, the remaining provisions continue to apply.' },
          { term: 'Assignment.', description: 'You may not transfer your rights or obligations without our consent.' },
          { term: 'Notices.', description: 'Notices may be sent to the contact details each party has provided.' },
        ]} />
      </LegalSection>

      <LegalSection number="19" title="Governing law and disputes">
        <LegalParagraph>These terms are governed by the laws of the Republic of South Africa. In the event of a dispute, the parties will first try to resolve it in good faith. Failing that, the dispute will be subject to the jurisdiction of the courts of Gauteng, South Africa.</LegalParagraph>
      </LegalSection>

      <LegalSection number="20" title="Contact">
        <LegalContactBlock>
          <p><strong>Creative Books SA</strong></p>
          <p>Email: info@creativebooks.co.za</p>
          <p>Telephone / WhatsApp: 010 500 3331</p>
          <p>Address: 1 Ruby Cl, Fourways, 2191</p>
        </LegalContactBlock>
      </LegalSection>
    </LegalPage>
  );
}