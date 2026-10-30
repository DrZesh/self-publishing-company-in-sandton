// Where the dashboard's data comes from. Pick ONE in DashboardPage (see INSTALL.md):
//   demoSource()                  sample data, no setup
//   base44Source(base44)          your Base44 entities (the current portal)
//   supabaseSource(supabase)      Supabase tables (after the migration)
// Each returns: async () => ({ submissions, leads, quotes, invoices, payments, projects, activity })
// Field names differ between systems, so every record goes through normalise(), which tries the common names.

const pick = (o, keys, dflt = null) => { for (const k of keys) { if (o?.[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; } return dflt; };
const low = (v) => (v == null ? null : String(v).toLowerCase().replace(/[\s-]+/g, '_'));

export const normalise = {
  submissions: (o) => ({ id: pick(o, ['id']), name: pick(o, ['name', 'full_name', 'client_name', 'email'], 'Someone'), type: low(pick(o, ['type', 'form_type', 'kind'], 'quote')),
    service: pick(o, ['service', 'service_type', 'category'], 'Other'), status: low(pick(o, ['status'], 'new')), created_at: pick(o, ['created_at', 'created_date', 'createdAt', 'submitted_at']) }),
  leads: (o) => ({ id: pick(o, ['id']), name: pick(o, ['name', 'full_name', 'client_name', 'contact_name'], 'Unnamed lead'), status: low(pick(o, ['status', 'stage'], 'new')),
    created_at: pick(o, ['created_at', 'created_date', 'createdAt']), last_contact_at: pick(o, ['last_contact_at', 'last_contacted', 'last_contact_date', 'lastContactAt']) }),
  quotes: (o) => ({ id: pick(o, ['id']), number: pick(o, ['number', 'quote_number', 'reference']), client_name: pick(o, ['client_name', 'customer_name', 'client', 'name']),
    status: low(pick(o, ['status'], 'draft')), total: Number(pick(o, ['total', 'amount', 'grand_total'], 0)),
    created_at: pick(o, ['created_at', 'created_date', 'quote_date', 'createdAt']), sent_at: pick(o, ['sent_at', 'sent_date']), responded_at: pick(o, ['accepted_at', 'responded_at', 'declined_at']) }),
  invoices: (o) => {
    const total = Number(pick(o, ['total', 'amount', 'grand_total'], 0));
    return { id: pick(o, ['id']), number: pick(o, ['number', 'invoice_number', 'reference']), client_name: pick(o, ['client_name', 'customer_name', 'client', 'name']),
      status: low(pick(o, ['status'], 'sent')), total, balance: Number(pick(o, ['balance', 'balance_due', 'amount_due'], low(o?.status) === 'paid' ? 0 : total)),
      invoice_date: pick(o, ['invoice_date', 'date', 'created_at', 'created_date']), due_date: pick(o, ['due_date', 'dueDate']) };
  },
  payments: (o) => ({ id: pick(o, ['id']), number: pick(o, ['number', 'payment_number', 'reference']), amount: Number(pick(o, ['amount', 'total'], 0)),
    method: pick(o, ['method', 'payment_method', 'mode'], ''), paid_on: pick(o, ['paid_on', 'payment_date', 'date', 'created_at', 'created_date']) }),
  projects: (o) => ({ id: pick(o, ['id']), title: pick(o, ['title', 'name', 'book_title'], ''), client_name: pick(o, ['client_name', 'author', 'customer_name']),
    status: low(pick(o, ['status', 'stage'], 'active')), due_date: pick(o, ['due_date', 'deadline', 'dueDate']) }),
  activity: (o) => ({ id: pick(o, ['id']), title: pick(o, ['title', 'message', 'text', 'description'], ''), subtitle: pick(o, ['subtitle', 'type', 'category'], ''),
    at: pick(o, ['at', 'created_at', 'created_date', 'createdAt']) }),
};
const KEYS = Object.keys(normalise);

/* ---------- Base44 (current portal) ---------- */
// Change the entity names on the right if yours differ (Base44 dashboard → Data).
export const BASE44_ENTITIES = { submissions: 'Submission', leads: 'Lead', quotes: 'Quote', invoices: 'Invoice', payments: 'Payment', projects: 'Project', activity: 'Notification' };
export function base44Source(base44, entities = BASE44_ENTITIES) {
  return async () => {
    const out = {};
    await Promise.all(KEYS.map(async (k) => {
      const ent = base44?.entities?.[entities[k]];
      if (!ent) { out[k] = []; return; }
      try { const rows = await ent.list('-created_date', 2000); out[k] = (rows || []).map(normalise[k]); } catch (e) { console.warn(`[dashboard] ${entities[k]}:`, e.message); out[k] = []; }
    }));
    return out;
  };
}

/* ---------- Supabase ---------- */
// Table names on the right. The Quote-to-Cash module's tables (cb_quotes, cb_invoices, cb_payments, cb_projects) work as-is.
export const SUPABASE_TABLES = { submissions: 'submissions', leads: 'leads', quotes: 'quotes', invoices: 'invoices', payments: 'payments', projects: 'projects', activity: 'activity' };
export function supabaseSource(supabase, tables = SUPABASE_TABLES) {
  return async () => {
    const out = {};
    await Promise.all(KEYS.map(async (k) => {
      if (!tables[k]) { out[k] = []; return; }
      const { data, error } = await supabase.from(tables[k]).select('*').limit(5000);
      if (error) { console.warn(`[dashboard] ${tables[k]}:`, error.message); out[k] = []; return; }
      out[k] = (data || []).map(normalise[k]);
    }));
    return out;
  };
}

/* ---------- Demo ---------- */
// Sample data shaped like the October screenshots. Clearly marked "Demo data" in the UI.
export function demoSource() {
  return async () => {
    const now = new Date();
    const at = (days, h = 10) => { const x = new Date(now); x.setDate(x.getDate() - days); x.setHours(h, 0, 0, 0); return x.toISOString(); };
    const monthAgo = (m, day = 10) => new Date(now.getFullYear(), now.getMonth() - m, day, 10).toISOString();
    const names = ['Yoganee Sukhai', 'Hg Hg', 'Fitzmaurice Simaanya', 'René Louwrens', 'Seema Naidoo', 'Katelynn Nell', 'Mthandazeli Radebe', 'Ariel Mason'];
    const svc = [['Printing', 68], ['Typesetting', 34], ['Cover Design', 30], ['Editing', 29], ['Quote Request', 6], ['General Enquiry', 4], ['Publishing', 3]];
    const submissions = []; let id = 1;
    svc.forEach(([s, c]) => { for (let i = 0; i < c; i++) submissions.push({ id: id++, name: names[i % names.length], service: s, status: i < 3 ? 'new' : 'done', created_at: at(Math.min(i % 28, now.getDate() - 1), 9 + (i % 8)) }); });
    [[1, 52], [2, 45], [3, 50], [4, 40]].forEach(([m, c]) => { for (let i = 0; i < c; i++) submissions.push({ id: id++, name: 'Earlier enquiry', service: 'Printing', status: 'done', created_at: monthAgo(m, 1 + (i % 27)) }); });
    submissions.push({ id: id++, name: 'Earlier enquiry', service: 'Printing', status: 'done', created_at: monthAgo(5, 3) });
    for (let i = 0; i < 39; i++) submissions.push({ id: id++, name: 'Earlier enquiry', service: 'Printing', status: 'done', created_at: monthAgo(5, 1 + (i % 27)) });
    submissions[0].created_at = at(0, Math.max(0, now.getHours() - 5));
    submissions[0].name = 'Yoganee Sukhai';

    const quotes = []; let q = 1;
    const addQ = (status, c) => {
      for (let i = 0; i < c; i++) {
        quotes.push({ id: q, number: `Quote-${String(1000 + q).padStart(6, '0')}`, client_name: names[q % names.length], status, total: 1950 + (q % 7) * 850,
          created_at: at(q % Math.max(1, now.getDate() - 1)), sent_at: status === 'draft' ? null : at(2 + (q % 5)) });
        q++;
      }
    };
    addQ('draft', 91); addQ('sent', 89); addQ('viewed', 2); addQ('declined', 7); addQ('expired', 3);
    [9800, 7400, 6900, 7200, 6875.11, 6900].forEach((t) => quotes.push({ id: q, number: `Quote-${String(1000 + q++).padStart(6, '0')}`, client_name: 'Sample client', status: 'accepted', total: t, created_at: at(6) }));
    quotes.push({ id: q, number: `Quote-${String(1000 + q++).padStart(6, '0')}`, client_name: 'Thokozane Zane', status: 'sent', total: 5500, created_at: at(26), sent_at: at(26) });

    const invoices = [
      { id: 1, number: 'INV-0374', client_name: 'Zola Plumbing', status: 'sent', total: 12500.4, balance: 12500.4, invoice_date: at(1), due_date: at(1) },
      { id: 2, number: 'INV-0373', client_name: 'Kuhlula Maluleke', status: 'sent', total: 0, balance: 0, invoice_date: at(2), due_date: at(-5) },
      { id: 3, number: 'INV-0372', client_name: 'Denis Maluleke', status: 'draft', total: 0, balance: 0, invoice_date: at(3) },
      { id: 4, number: 'INV-0371', client_name: 'Ezekiel', status: 'sent', total: 1.4, balance: 1.4, invoice_date: at(4), due_date: at(3) },
      { id: 5, number: 'INV-0370', client_name: 'Musa Nkanyani', status: 'draft', total: 0, balance: 0, invoice_date: at(5) },
      { id: 6, number: 'INV-0362', client_name: 'Sample client', status: 'overdue', total: 20000, balance: 20000, invoice_date: at(60), due_date: at(53) },
      { id: 7, number: 'INV-0358', client_name: 'Sample client', status: 'overdue', total: 16114.05, balance: 16114.05, invoice_date: at(80), due_date: at(73) },
      { id: 8, number: 'INV-0369', client_name: 'Sample client', status: 'sent', total: 698.05, balance: 698.05, invoice_date: at(6), due_date: at(-10) },
    ];
    const june = (day) => new Date(now.getFullYear(), 5, day, 10).toISOString();
    const payments = [
      { id: 6, number: 'PAY-0006', amount: 2357.5, method: 'EFT', paid_on: june(6) }, { id: 5, number: 'PAY-0005', amount: 1000, method: 'Card', paid_on: june(5) },
      { id: 4, number: 'PAY-0004', amount: 2357.5, method: 'EFT', paid_on: june(5) }, { id: 3, number: 'PAY-0003', amount: 100, method: 'EFT', paid_on: june(5) },
    ];
    const leads = [
      { id: 1, name: 'Siobhan Del Carme', status: 'contacted', created_at: at(40), last_contact_at: at(31) },
      { id: 2, name: 'Kholofelo Kekana', status: 'new', created_at: at(20) }, { id: 3, name: 'Lemohang Serape', status: 'new', created_at: at(18) },
      { id: 4, name: 'balaji coeik', status: 'new', created_at: at(15) },
    ];
    for (let i = 0; i < 15; i++) leads.push({ id: 10 + i, name: `Enquiry ${i + 1}`, status: 'new', created_at: at(5 + i) });
    const projects = [{ id: 1, title: 'print', status: 'enquiry_received', due_date: june(6) }];
    for (let i = 0; i < 9; i++) projects.push({ id: 2 + i, title: 'Untitled Book', status: 'quote_accepted' });
    ['Khipa Book', 'Memoir layout', 'Cover set', 'Poetry collection'].forEach((t, i) => projects.push({ id: 20 + i, title: t, status: 'in_progress' }));
    const activity = [
      { id: 1, title: 'Quote request · Yoganee Sukhai', at: at(0, Math.max(0, now.getHours() - 5)) },
      { id: 2, title: 'Draft CBSA-QT-2026-0001 · Hg Hg', at: at(0, Math.max(0, now.getHours() - 13)) },
      { id: 3, title: 'Quote request · Fitzmaurice Simaanya', at: at(1) },
      { id: 4, title: 'Quote request · René Louwrens', at: at(1, 9) },
      { id: 5, title: 'Quote request · Seema Naidoo', at: at(1, 8) },
    ];
    return { submissions, leads, quotes, invoices, payments, projects, activity };
  };
}
