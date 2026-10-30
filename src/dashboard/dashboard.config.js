// Mission Control dashboard: settings. Edit to match your portal.
const dashboardConfig = {
  ownerFirstName: '',
  monthlyTarget: 150000,          // R, shown on "Collected"
  refreshSeconds: 60,             // auto-refresh
  followUpAfterDays: 7,           // a sent quote with no reply after this many days needs a follow-up
  staleLeadDays: 3,               // a new enquiry not contacted within this many days needs a follow-up
  timezone: 'Africa/Johannesburg',

  // Your admin routes. Change any that differ in your portal.
  routes: {
    dashboard: '/admin/dashboard',
    submissions: '/admin/submissions',
    leads: '/admin/leads',
    clients: '/admin/contacts',
    pipeline: '/admin/pipeline',
    tasks: '/admin/tasks',
    followUps: '/admin/follow-ups',
    leadScoring: '/admin/lead-scoring',
    users: '/admin/settings/users',
    quotes: '/admin/billing/quotes',
    quoteDrafts: '/admin/billing/quotes?status=draft',
    invoices: '/admin/billing/invoices',
    overdueInvoices: '/admin/billing/invoices?status=overdue',
    payments: '/admin/billing/payments',
    projects: '/admin/projects',
    docLibrary: '/admin/documents',
    eSignatures: '/admin/esignatures',
    activity: '/admin/notifications',
  },
};
export default dashboardConfig;
