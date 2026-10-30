// Client portal + appointments calendar settings.
const portalConfig = {
  company: {
    name: 'Creative Books SA',
    email: 'info@creativebooks.co.za',
    phone: '',                                   // optional: shown under Help
    whatsapp: '',                                // optional: e.g. 27820000000 (no +)
    collectionAddress: 'Prism Office Park, 1 Ruby Cl, Johannesburg',
    logoUrl: '/creative-books-logo.png',
  },
  portalPath: '/portal',                         // client link: /portal/<token>
  adminCalendarPath: '/admin/appointments',
  timezone: 'Africa/Johannesburg',

  // Shown in the booking pop-up only. Real availability comes from the portalBooking function (opening hours in Booking Settings).
  booking: {
    horizonDays: 60,
    collection: { weekdays: [1, 2, 3, 4, 5], open: '09:00', close: '16:00', slotMinutes: 60, capacity: 2 },
    delivery: { weekdays: [1, 2, 3, 4, 5], open: '08:00', close: '16:00', slotMinutes: 240, capacity: 4 },
  },
  holidays: {
    '2026-01-01': "New Year's Day", '2026-04-03': 'Good Friday', '2026-04-06': 'Family Day', '2026-04-27': 'Freedom Day', '2026-05-01': "Workers' Day",
    '2026-06-16': 'Youth Day', '2026-08-10': "National Women's Day (observed)", '2026-09-24': 'Heritage Day', '2026-12-16': 'Day of Reconciliation',
    '2026-12-25': 'Christmas Day', '2027-01-01': "New Year's Day", '2027-03-22': 'Human Rights Day (observed)', '2027-03-26': 'Good Friday',
    '2027-03-29': 'Family Day', '2027-04-27': 'Freedom Day', '2027-06-16': 'Youth Day', '2027-08-09': "National Women's Day", '2027-09-24': 'Heritage Day',
    '2027-12-16': 'Day of Reconciliation', '2027-12-27': 'Day of Goodwill (observed)',
  },
  upload: { maxMB: 15, accept: '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.zip,.txt' },
};
export default portalConfig;
