// Live data for Mission Control: the CRM's own records (platform entities) plus the
// Quote to Cash tables (cb_quotes, cb_invoices, cb_payments, cb_projects).
// Both systems are in use, so the dashboard shows them side by side.
import { platform } from '@/api/platformClient';
import { supabase } from '@/api/supabaseClient';
import { normalise } from './sources.js';

const low = (v) => (v == null ? null : String(v).toLowerCase().replace(/[\s-]+/g, '_'));

async function entity(name, limit = 2000) {
  try { return (await platform.entities[name].list('-created_date', limit)) || []; }
  catch (e) { console.warn(`[dashboard] ${name}:`, e.message); return []; }
}
async function table(name, columns = '*') {
  try {
    const { data, error } = await supabase.from(name).select(columns).limit(5000);
    if (error) throw error;
    return data || [];
  } catch (e) { console.warn(`[dashboard] ${name}:`, e.message); return []; }
}

// Old-CRM statuses → dashboard statuses
const quoteStatus = (s) => ({ converted: 'accepted', rejected: 'declined', changes_requested: 'sent', delivered: 'sent', opened: 'viewed' }[low(s)] || low(s) || 'draft');
const invoiceStatus = (s) => ({ partially_paid: 'partially_paid', part_paid: 'partially_paid', partial: 'partially_paid' }[low(s)] || low(s) || 'sent');

export function liveSource() {
  return async () => {
    const [submission, lead, quote, invoice, payment, project, notification, contact, cbClients, cbQuotes, cbInvoices, cbPayments, cbProjects] = await Promise.all([
      entity('Submission', 3000), entity('Lead'), entity('Quote'), entity('Invoice'), entity('Payment'), entity('Project'), entity('Notification', 50), entity('Contact', 5000),
      table('cb_clients', 'id,display_name,company,first_name,last_name'),
      table('cb_quotes', 'id,number,client_id,status,total,created_at,quote_date,sent_at,accepted_at,superseded_by'),
      table('cb_invoices', 'id,number,client_id,status,total,balance_due,invoice_date,created_at'),
      table('cb_payments', 'id,number,amount,method,paid_on,created_at'),
      table('cb_projects', 'id,client_id,title,book_title,status,current_stage,project_completed_at,created_at'),
    ]);

    const contactName = Object.fromEntries(contact.map((c) => [c.id, c.full_name || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email]));
    const cbName = Object.fromEntries(cbClients.map((c) => [c.id, c.display_name || c.company || [c.first_name, c.last_name].filter(Boolean).join(' ')]));
    const nameOf = (o) => o.client_name || contactName[o.contact_id] || contactName[o.client_id] || null;

    const submissions = submission.map((o) => normalise.submissions({ ...o, name: o.full_name || o.name, service: o.service_interest || o.service, type: o.form_type }));
    const leads = lead.map(normalise.leads);

    const quotes = [
      ...quote.map((o) => ({ ...normalise.quotes({ ...o, number: o.quote_number || o.number, client_name: nameOf(o) }), status: quoteStatus(o.status), href: `/admin/previous-quotes` })),
      ...cbQuotes.filter((o) => !o.superseded_by).map((o) => ({
        id: o.id, number: o.number, client_name: cbName[o.client_id], status: quoteStatus(o.status), total: Number(o.total || 0),
        created_at: o.created_at || o.quote_date, sent_at: o.sent_at, responded_at: o.accepted_at, href: `/admin/billing/quotes/${o.id}`,
      })),
    ];

    const invoices = [
      ...invoice.map((o) => ({ ...normalise.invoices({ ...o, number: o.invoice_number || o.number, client_name: nameOf(o), invoice_date: o.issue_date || o.created_date }), status: invoiceStatus(o.status), href: `/admin/invoices/${o.id}` })),
      ...cbInvoices.map((o) => ({
        id: o.id, number: o.number, client_name: cbName[o.client_id], status: invoiceStatus(o.status), total: Number(o.total || 0),
        balance: Number(o.balance_due ?? 0), invoice_date: o.invoice_date || o.created_at, due_date: null, href: `/admin/billing/invoices/${o.id}`,
      })),
    ];

    const payments = [
      ...payment.map((o) => normalise.payments({ ...o, number: o.payment_number, method: o.payment_method, paid_on: o.payment_date || o.created_date })),
      ...cbPayments.map((o) => ({ id: o.id, number: o.number, amount: Number(o.amount || 0), method: o.method || '', paid_on: o.paid_on || o.created_at })),
    ];

    const projects = [
      ...project.map((o) => normalise.projects({ ...o, title: o.book_title || o.title, client_name: o.author_name || nameOf(o), status: o.stage || o.status })),
      ...cbProjects.map((o) => ({ id: o.id, title: o.book_title || o.title || 'Untitled book', client_name: cbName[o.client_id], status: o.project_completed_at ? 'completed' : low(o.current_stage || o.status || 'active'), due_date: null })),
    ];

    // Activity: newest enquiries plus notifications
    const activity = [
      ...submissions.slice(0, 15).map((s) => ({ id: `s-${s.id}`, title: `${(s.service || 'Enquiry')} · ${s.name}`, subtitle: 'New enquiry', at: s.created_at })),
      ...notification.map(normalise.activity),
    ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).slice(0, 20);

    return { submissions, leads, quotes, invoices, payments, projects, activity };
  };
}
