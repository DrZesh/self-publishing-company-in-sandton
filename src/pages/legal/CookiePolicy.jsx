import React from 'react';
import LegalPage, {
  LegalSection, LegalParagraph, LegalDefinitions, LegalTable,
} from '@/components/legal/LegalPage';

export default function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      subtitle="How and why creativebooks.co.za uses cookies and similar technologies, and how you can control them."
      lastUpdated="7 July 2026"
      metaDescription="How and why creativebooks.co.za uses cookies and similar technologies, and how you can control or delete them."
      canonical="https://creativebooks.co.za/cookie-policy"
      summary={
        <p><strong>In short:</strong> We use a small number of cookies to make our website work, to remember your preferences, and to understand how the site is used. You can control or delete cookies through your browser at any time. This policy should be read together with our Privacy Policy.</p>
      }
    >
      <LegalSection number="1" title="What are cookies?">
        <LegalParagraph>Cookies are small text files that a website places on your device when you visit. They are widely used to make websites work, to make them work more efficiently, and to provide information to the site owner. “Similar technologies” such as pixels and local storage work in comparable ways, and we refer to all of them as “cookies” in this policy.</LegalParagraph>
      </LegalSection>

      <LegalSection number="2" title="The types of cookies we use">
        <LegalDefinitions items={[
          { term: 'Strictly necessary cookies:', description: 'Required for the website and its core features to function — for example, page navigation and secure areas. The site cannot work properly without these, so they cannot be switched off in our systems.' },
          { term: 'Functional cookies:', description: 'Remember choices you make (such as preferences) to give you a smoother experience.' },
          { term: 'Analytics cookies:', description: 'Help us understand how visitors use the site so we can improve it. We use Google Analytics (via Google Tag Manager) for this, and the information is used in aggregate.' },
          { term: 'Marketing cookies:', description: 'Used to measure and improve our advertising. We use the Meta (Facebook) Pixel to understand the performance of our campaigns.' },
        ]} />
      </LegalSection>

      <LegalSection number="3" title="Cookies used on this site">
        <LegalParagraph>The main cookies used on our site are set out below. The exact cookies may change as the site and our tools are updated.</LegalParagraph>
        <LegalTable
          headers={['Cookie / provider', 'Type', 'Purpose', 'Duration']}
          rows={[
            ['Session cookie', 'Strictly necessary', 'Keeps the site working during your visit', 'Session'],
            ['_ga, _gid (Google Analytics)', 'Analytics', 'Measures how the site is used', 'Up to 2 years'],
            ['_fbp (Meta / Facebook Pixel)', 'Marketing', 'Measures advertising performance', 'Up to 3 months'],
          ]}
        />
      </LegalSection>

      <LegalSection number="4" title="Third-party cookies">
        <LegalParagraph>Some cookies may be set by third-party services we use (for example, an analytics provider, or embedded content). These providers have their own privacy and cookie policies, which govern their use of your information.</LegalParagraph>
      </LegalSection>

      <LegalSection number="5" title="Managing and disabling cookies">
        <LegalParagraph>You can control and delete cookies through your browser settings, and set your browser to warn you before accepting cookies or to refuse them. Please note that if you disable strictly necessary cookies, parts of the site may not work as intended. Guidance for the most common browsers — Chrome, Safari, Edge and Firefox — is available in each browser’s help pages.</LegalParagraph>
      </LegalSection>

      <LegalSection number="6" title="Your consent">
        <LegalParagraph>By continuing to use our website, you agree to our use of cookies as described in this policy, except for strictly necessary cookies which are required for the site to function. Where the law requires your consent for non-essential cookies (such as analytics and marketing cookies), we will obtain it.</LegalParagraph>
      </LegalSection>

      <LegalSection number="7" title="Contact">
        <LegalParagraph>Questions about our use of cookies can be sent to info@creativebooks.co.za. This policy may be updated from time to time; the “last updated” date above reflects the latest version.</LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}