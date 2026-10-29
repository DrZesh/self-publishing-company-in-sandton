// Quote to Cash — company settings and workflow rules.
// Edit this file to match Creative Books SA. Everything the screens print comes from here.

const billingConfig = {
  // Where the module is mounted in your router (see INSTALL.md)
  basePath: '/admin/billing',
  // Public client-portal path for "Review & Accept Quote" links
  portalPath: '/portal/q',
  portalOrigin: 'https://creativebooks.co.za',

  company: {
    name: 'Creative Books SA',
    legalName: 'Creative Books SA (Pty) Ltd',
    email: 'info@creativebooks.co.za',
    addressLines: ['Prism Office Park', '1 Ruby Cl', 'Johannesburg Gauteng 2191', 'South Africa'],
    // Put the logo file in your /public folder with this name
    logoUrl: '/creative-books-logo.png',
    vatNumber: '', // fill in only if VAT-registered; a VAT line then appears on documents
  },

  banks: [
    { bank: 'FNB', accountName: 'Creative Books SA', accountType: '', accountNumber: '62848257673' },
    { bank: 'Nedbank', accountName: 'Creative Books SA', accountType: 'Cheque Account', accountNumber: '1288581483' },
  ],

  rules: {
    quoteValidityDays: 30,   // T&C 3.1
    depositPercent: 75,      // T&C 4.1
    reminderDay: 21,         // reminder if not accepted by this day
    overdueAfterDays: 7,     // an invoice turns OVERDUE this many days after its date
    invoiceTermsLabel: 'Due on Receipt',
    paymentMethods: [        // T&C 4.1: no cheques
      { value: 'eft', label: 'EFT' },
      { value: 'cash_deposit', label: 'Cash deposit' },
    ],
  },

  numbering: {
    quotePrefix: 'Quote-', quoteDigits: 6,
    invoicePrefix: 'INV-', invoiceDigits: 6,
    paymentPrefix: 'PAY-', paymentDigits: 6,
  },

  // Default production checklist for a new project
  projectChecklist: ['Print files approved', 'Printing', 'Binding', 'Quality check', 'Delivery'],

  sources: ['Website enquiry', 'Referral', 'Walk-in', 'Facebook', 'Repeat client', 'Other'],
  services: ['Printing', 'Typesetting & layout', 'Cover design', 'Editing', 'Self-publishing package', 'Amazon publishing', 'Other'],

  // Short terms printed on quotes (the full terms text can be attached as a PDF)
  termsSummary: [
    '3.1 All quotations remain valid for acceptance for a period of 30 days from the date of the quote.',
    '3.7 In order to accept a quote, the client must sign and date the quotation confirming its acceptance.',
    '4.1 On accepting a quote the client shall pay a 75% deposit of the total amount quoted. Payment is to be made via electronic fund transfer or cash deposit; no payment by cheque will be accepted.',
    '4.2 No project will commence until the 75% deposit has been paid and the funds are reflected as clear.',
    '4.3 A further 25% payment will be required upon completion of the project. Once proof of payment has been received, the final phase of the project shall commence.',
  ],

  // Optional: plug in real email sending (e.g. a Supabase Edge Function + Resend).
  // async ({ to, cc, subject, text, html }) => void. Leave null to open the user's mail app instead.
  sendEmail: null,
};

export default billingConfig;
