import React from 'react';
import LegalPage, {
  LegalSection, LegalParagraph, LegalList, LegalContactBlock,
} from '@/components/legal/LegalPage';

export default function RefundsAndReturns() {
  return (
    <LegalPage
      title="Refunds & Returns Policy"
      subtitle="When returns, cancellations and refunds apply to Creative Books SA orders, and how to request them — consistent with the Consumer Protection Act and the ECT Act."
      lastUpdated="7 July 2026"
      metaDescription="When returns, reprints, cancellations and refunds apply to Creative Books SA orders, and how to request them — consistent with the CPA and ECT Act."
      canonical="https://creativebooks.co.za/refunds-and-returns"
      summary={
        <p><strong>In short:</strong> Printed books are made to your specifications and approved proof, so they generally cannot be returned or refunded once produced — except where they are defective, damaged in transit, or differ from what you approved. If something is wrong with your order, tell us promptly and we will put it right. This policy does not affect your rights under the Consumer Protection Act, 2008 (the “CPA”).</p>
      }
    >
      <LegalSection number="1" title="Scope">
        <LegalParagraph>This policy applies to Services and goods supplied by Creative Books SA and forms part of our Terms &amp; Conditions. It is designed to comply with the CPA and the Electronic Communications and Transactions Act, 2002 (the “ECT Act”).</LegalParagraph>
      </LegalSection>

      <LegalSection number="2" title="Custom-made goods (printed books)">
        <LegalParagraph>Our printed books are produced specifically for you, according to your specifications and the proof you approve. Under the ECT Act, the automatic seven-day cooling-off right for certain online purchases does <strong>not</strong> apply to goods made to a consumer’s specifications, and under the CPA custom-made goods are generally not returnable simply because you have changed your mind.</LegalParagraph>
        <LegalParagraph>This means that once you have approved your proof and production has begun, an order for printed books cannot be cancelled, returned or refunded, except in the circumstances in sections 4 and 5.</LegalParagraph>
      </LegalSection>

      <LegalSection number="3" title="Services (editing, typesetting, design)">
        <LegalParagraph>Editorial, typesetting and design services are charged for the work performed. Where work has already been carried out, the fee for that work is payable and is not refundable. If we have not yet started or delivered a service you have paid for, we will discuss a fair refund of the portion not performed. Deposits are non-refundable once work has commenced.</LegalParagraph>
      </LegalSection>

      <LegalSection number="4" title="Defective, damaged or incorrect goods">
        <LegalParagraph>Under the CPA you are entitled to goods that are of good quality, in good working order and free of defects. If your order is defective, damaged in transit, or not what was agreed:</LegalParagraph>
        <LegalList items={[
          <><strong>Report transit damage or an incorrect order</strong> within 7 days of delivery, with photographs where possible.</>,
          'If goods are found to be defective within the period provided by the CPA, you may be entitled to have them repaired or replaced, or to a refund, in line with your CPA rights.',
          'We will arrange to inspect, and to repair, reprint or refund as appropriate, at no cost to you where the fault is ours.',
        ]} />
      </LegalSection>

      <LegalSection number="5" title="Our error versus your approved proof">
        <LegalList items={[
          <><strong>If we deviate from the proof you approved</strong> — for example, a printing or production error on our part — we will correct or reprint the affected books at our cost.</>,
          <><strong>If an error was present in the proof you approved</strong> — for example, a typo or layout issue you signed off on — the reprint is treated as a new order, as set out in our Terms &amp; Conditions. We will always try to help you resolve it fairly.</>,
        ]} />
      </LegalSection>

      <LegalSection number="6" title="How to request a return, reprint or refund">
        <LegalParagraph>Contact us as soon as possible with:</LegalParagraph>
        <LegalList items={[
          'Your name and order or invoice number;',
          'A description of the problem; and',
          'Photographs or samples showing the issue, where relevant.',
        ]} />
        <LegalContactBlock>
          <p>Email: info@creativebooks.co.za</p>
          <p>Telephone / WhatsApp: 010 500 3331</p>
        </LegalContactBlock>
        <LegalParagraph>We aim to acknowledge requests within 2 business days and to resolve them as quickly as possible.</LegalParagraph>
      </LegalSection>

      <LegalSection number="7" title="Refund method and timing">
        <LegalParagraph>Where a refund is due, it will be made to your original payment method, or by EFT where that is not possible, within 14 business days of the refund being agreed.</LegalParagraph>
      </LegalSection>

      <LegalSection number="8" title="Non-refundable items">
        <LegalList items={[
          'Completed custom work and printed books, except as set out in sections 4 and 5.',
          'Deposits, once production or work has commenced.',
          'Services already performed.',
        ]} />
        <LegalParagraph>Nothing in this section limits any right you have under the CPA that cannot be excluded.</LegalParagraph>
      </LegalSection>

      <LegalSection number="9" title="Contact">
        <LegalParagraph>Questions about this policy can be sent to info@creativebooks.co.za. This policy may be updated from time to time; the “last updated” date above reflects the latest version.</LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}