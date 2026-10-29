import React from 'react';
import { useLocation } from 'react-router-dom';

const notices = [
  ['/admin/quotes', 'Quote drafts and PDF downloads are available. Sending quotes and automatic invoice delivery are pending approval.'],
  ['/admin/invoices', 'Invoice drafts are available. Invoice email delivery is pending approval.'],
  ['/admin/payments', 'Payment records and PDF receipts are available. Receipt email delivery is pending approval.'],
  ['/admin/contracts', 'Contract signing and delivery are unavailable while approvals are pending.'],
  ['/admin/esignatures', 'Electronic signing and signing notifications are unavailable while approvals are pending.'],
  ['/admin/documents', 'You can manage saved documents. Document delivery and signing actions are pending approval.'],
  ['/admin/chat', 'Client chat and its email notifications are pending approval.'],
  ['/admin/message-centre', 'Template sending and client communications are pending approval.'],
  ['/admin/bulk-email', 'Bulk email sending is pending approval.'],
  ['/admin/marketing', 'Campaign sending is pending approval. Saved campaign records remain available.'],
  ['/admin/email-settings', 'Enquiry and booking notifications are active. General email test sending is pending approval.'],
  ['/admin/automation-centre', 'Automated client communications are pending approval.'],
  ['/admin/client-portal', 'Portal records can be managed. Automatic client invitations and portal chat are pending approval.'],
  ['/admin/analytics', 'Google Analytics needs its account connection before reports can load.'],
  ['/admin/seo', 'Google Search Console needs its account connection before reports can load.'],
  ['/admin/search-console', 'Google Search Console needs its account connection before reports can load.'],
  ['/admin/zoho-books', 'Zoho Books needs its account connection before synchronisation can run.'],
];
export default function CrmAvailabilityNotice() {
  const { pathname } = useLocation();
  const notice = notices.find(([path]) => pathname === path || pathname.startsWith(path + '/'));
  if (!notice) return null;
  return <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{notice[1]}</div>;
}
