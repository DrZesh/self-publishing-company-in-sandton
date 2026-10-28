import React from 'react';
import LegalPage, {
  LegalSection, LegalSubheading, LegalParagraph, LegalList, LegalDefinitions, LegalCallout, LegalContactBlock,
} from '@/components/legal/LegalPage';

export default function PaiaManual() {
  return (
    <LegalPage
      title="PAIA Manual"
      subtitle="Manual of Creative Books SA prepared in terms of section 51 of the Promotion of Access to Information Act, 2000 (PAIA)."
      lastUpdated="7 July 2026"
      metaDescription="Manual of Creative Books SA prepared in terms of section 51 of the Promotion of Access to Information Act, 2000 (PAIA). What records we hold and how to request access."
      canonical="https://creativebooks.co.za/paia-manual"
      summary={
        <p>This manual explains what records Creative Books SA holds and how you may request access to them under the Promotion of Access to Information Act, 2000 (“PAIA”). Since 1 January 2022, every private body in South Africa must have a PAIA manual, keep it available at its principal place of business and, where it has a website, publish it there. <strong>This is a working draft that must be completed with your details and confirmed before publication.</strong></p>
      }
    >
      <LegalSection number="1" title="Introduction">
        <LegalParagraph>PAIA gives effect to the constitutional right of access to information. It allows any person to request access to a record held by a private body where that record is required to exercise or protect any right. This manual is published in terms of section 51 of PAIA.</LegalParagraph>
      </LegalSection>

      <LegalSection number="2" title="Particulars of the private body">
        <LegalList items={[
          <><strong>Name of private body:</strong> Creative Books SA</>,
          <><strong>Head of the body / Information Officer:</strong> Creative Books SA (requests may be directed to us using the contact details below)</>,
          <><strong>Deputy Information Officer:</strong> None</>,
          <><strong>Physical address:</strong> 1 Ruby Cl, Fourways, 2191</>,
          <><strong>Postal address:</strong> 1 Ruby Cl, Fourways, 2191</>,
          <><strong>Telephone:</strong> 010 500 3331</>,
          <><strong>Email:</strong> info@creativebooks.co.za</>,
          <><strong>Website:</strong> creativebooks.co.za</>,
        ]} />
      </LegalSection>

      <LegalSection number="3" title="The Information Regulator’s guide on how to use PAIA">
        <LegalParagraph>The Information Regulator has compiled a guide, in terms of section 10 of PAIA, on how to use the Act. It is available from the Regulator:</LegalParagraph>
        <LegalContactBlock>
          <p><strong>The Information Regulator (South Africa)</strong></p>
          <p>JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</p>
          <p>Enquiries: enquiries@inforegulator.org.za</p>
          <p>PAIA complaints: PAIAComplaints@inforegulator.org.za</p>
          <p>Telephone: 010 023 5200 · Website: inforegulator.org.za</p>
        </LegalContactBlock>
      </LegalSection>

      <LegalSection number="4" title="Categories of records">
        <LegalSubheading>4.1 Records available in terms of other legislation</LegalSubheading>
        <LegalParagraph>Certain records are kept in accordance with, and may be accessed under, other laws, including (as applicable): the Companies Act, 2008; the Tax Administration Act, 2011 and other tax legislation; the Basic Conditions of Employment Act; the Labour Relations Act; the Compensation for Occupational Injuries and Diseases Act; the Unemployment Insurance Act; and the Protection of Personal Information Act, 2013.</LegalParagraph>

        <LegalSubheading>4.2 Records automatically available</LegalSubheading>
        <LegalParagraph>The following information is available without a formal PAIA request: our website content, service descriptions, published pricing information and blog articles.</LegalParagraph>

        <LegalSubheading>4.3 Records available on request under PAIA</LegalSubheading>
        <LegalParagraph>The following categories of records may be requested under PAIA, subject to the grounds for refusal in the Act:</LegalParagraph>
        <LegalDefinitions items={[
          { term: 'Business records', description: '— registration documents, financial and accounting records, tax records, contracts and agreements.' },
          { term: 'Client and project records', description: '— quotes, orders, invoices, manuscripts and correspondence (subject to confidentiality and third-party protections).' },
          { term: 'Personnel records', description: '— employment records, where applicable.' },
          { term: 'Supplier and operator records', description: '— agreements with printers, couriers and service providers.' },
          { term: 'Marketing records', description: '— campaign, email and website records.' },
        ]} />
      </LegalSection>

      <LegalSection number="5" title="How to request access to a record">
        <LegalList items={[
          <>Complete the prescribed request form (PAIA <strong>Form 2</strong>) and submit it to the head of the body / Information Officer at the contact details in section 2.</>,
          'Provide enough detail to identify the record and the requester, and to enable us to contact you.',
          'As a private body, we may require you to state the right you are seeking to exercise or protect and why the record is required for that purpose.',
          'Identify the form of access required, and pay the applicable fees (section 7).',
        ]} />
      </LegalSection>

      <LegalSection number="6" title="Grounds for refusal">
        <LegalParagraph>We may refuse a request on the grounds set out in PAIA, including the mandatory protection of the privacy of third parties, commercial information of third parties, confidential information, and records privileged from production in legal proceedings. Where we refuse a request, we will give reasons based on the Act.</LegalParagraph>
      </LegalSection>

      <LegalSection number="7" title="Fees">
        <LegalParagraph>PAIA provides for a request fee and, where applicable, an access fee calculated according to the prescribed tariff. These fees are applied in accordance with the PAIA regulations, and we will confirm any amounts payable before processing your request. We may require a deposit where preparation is likely to take substantial time.</LegalParagraph>
      </LegalSection>

      <LegalSection number="8" title="Processing of personal information (POPIA)">
        <LegalParagraph>We process personal information as a responsible party under POPIA. Full details of the purposes, categories of data subjects and information, recipients, cross-border transfers and security measures are set out in our Privacy Policy, which should be read together with this manual.</LegalParagraph>
      </LegalSection>

      <LegalSection number="9" title="Availability of this manual">
        <LegalParagraph>This manual is available on our website and at our principal place of business for inspection during normal business hours, and will be provided to any person on request, and to the Information Regulator when required.</LegalParagraph>
      </LegalSection>

      <LegalSection number="10" title="Updates">
        <LegalParagraph>This manual will be reviewed and updated as necessary. The “last updated” date above reflects the latest version.</LegalParagraph>
        <LegalCallout>
          <p><strong>Reminder for Creative Books SA:</strong> in addition to publishing this manual, private bodies must register an Information Officer on the Information Regulator’s eServices portal and submit an annual PAIA report to the Regulator (the reporting window typically runs 1 April – 30 June each year). Confirm current requirements on the Regulator’s website.</p>
        </LegalCallout>
      </LegalSection>
    </LegalPage>
  );
}