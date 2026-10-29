// Formatting, derived statuses and "deal" views. Pure functions shared by demo and Supabase modes.
import cfg from '../billing.config.js';

/* ---------------- formatting ---------------- */
const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const num = (n) => nf.format(round2(n));
export const money = (n) => `R${num(n)}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
};
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const addDays = (iso, days) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
};
export const daysBetween = (a, b) => {
  const pa = Date.UTC(...a.slice(0, 10).split('-').map((v, i) => (i === 1 ? v - 1 : +v)));
  const pb = Date.UTC(...b.slice(0, 10).split('-').map((v, i) => (i === 1 ? v - 1 : +v)));
  return Math.round((pb - pa) / 86400000);
};
export const padNumber = (prefix, n, digits) => `${prefix}${String(n).padStart(digits, '0')}`;
export const firstName = (client) => (client?.first_name || client?.display_name || '').split(' ')[0];

/* ---------------- quote maths ---------------- */
export function lineAmount(it) {
  const gross = round2((Number(it.qty) || 0) * (Number(it.rate) || 0));
  const disc = it.discount_type === 'percent' ? round2(gross * (Number(it.discount) || 0) / 100) : round2(Number(it.discount) || 0);
  return round2(gross - disc);
}
export function quoteTotals(items) {
  const lines = items.filter((i) => i.name);
  const total = round2(lines.reduce((s, i) => s + lineAmount(i), 0));
  const gross = round2(lines.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0));
  return { sub_total: total, discount_total: round2(gross - total), total };
}
export const depositAmount = (total) => round2(total * cfg.rules.depositPercent / 100);
export const balanceAmount = (total) => round2(total - depositAmount(total));

/* ---------------- statuses ---------------- */
export const BADGE = {
  draft: ['neutral', 'Draft'], sent: ['info', 'Sent'], viewed: ['info', 'Viewed'], accepted: ['success', 'Accepted'],
  declined: ['danger', 'Declined'], expired: ['danger', 'Expired'], superseded: ['neutral', 'Superseded'],
  deposit_due: ['warning', 'Deposit due'], balance_due: ['warning', 'Balance due'], partially_paid: ['progress', 'Partially paid'],
  overdue: ['danger', 'Overdue'], paid: ['success', 'Paid'],
  on_hold: ['neutral', 'On hold'], in_production: ['progress', 'In production'], complete: ['success', 'Complete'], closed: ['neutral', 'Closed'],
};

export function quoteStatus(q, today = todayISO()) {
  if ((q.status === 'sent' || q.status === 'viewed') && q.expiry_date && q.expiry_date < today) return 'expired';
  return q.status;
}
export function invoiceStatus(inv, today = todayISO()) {
  if (inv.status === 'paid') return 'paid';
  if (daysBetween(inv.invoice_date, today) > cfg.rules.overdueAfterDays) return 'overdue';
  if (inv.status === 'partially_paid') return 'partially_paid';
  return inv.type === 'deposit' ? 'deposit_due' : 'balance_due';
}

/* ---------------- deal view ---------------- */
// A deal = the live (non-superseded) quote plus everything created from it.
export function buildDeal(db, quote, today = todayISO()) {
  const client = db.clients.find((c) => c.id === quote.client_id) || null;
  const items = db.quote_items.filter((i) => i.quote_id === quote.id).sort((a, b) => a.position - b.position);
  const invoices = db.invoices.filter((i) => i.quote_id === quote.id).sort((a, b) => (a.type === 'deposit' ? -1 : 1) - (b.type === 'deposit' ? -1 : 1));
  const deposit = invoices.find((i) => i.type === 'deposit') || null;
  const balance = invoices.find((i) => i.type === 'balance') || null;
  const payments = db.payments.filter((p) => invoices.some((i) => i.id === p.invoice_id)).sort((a, b) => (a.paid_on < b.paid_on ? -1 : 1));
  const project = db.projects.find((p) => p.quote_id === quote.id) || null;
  const activity = db.activity.filter((a) => a.quote_id === quote.id).sort((a, b) => (a.at < b.at ? -1 : 1));
  const qStatus = quoteStatus(quote, today);
  const received = round2(payments.reduce((s, p) => s + Number(p.amount), 0));
  const outstanding = round2(Number(quote.total) - received);

  let status = qStatus; let stage = 2; let next = null; let nextTo = null;
  const B = cfg.basePath;
  if (qStatus === 'draft') { stage = 2; next = 'Finish & send quote'; nextTo = `${B}/quotes/${quote.id}/edit`; }
  else if (qStatus === 'sent') { stage = 3; next = 'Follow up: not yet viewed'; nextTo = `${B}/quotes/${quote.id}`; }
  else if (qStatus === 'viewed') { stage = 4; next = 'Waiting for signature'; nextTo = `${B}/quotes/${quote.id}`; }
  else if (qStatus === 'expired') { stage = 4; next = 'Revise or re-issue quote'; nextTo = `${B}/quotes/${quote.id}`; }
  else if (qStatus === 'declined' || qStatus === 'superseded') { stage = 4; }
  if (qStatus === 'accepted') {
    if (project?.status === 'closed') { status = 'closed'; stage = 8; }
    else if (balance) {
      status = invoiceStatus(balance, today);
      if (status === 'paid') { stage = 8; next = 'Release final files'; nextTo = `${B}/projects/${project?.id}`; }
      else { stage = 7; next = status === 'overdue' ? 'Send reminder' : 'Record balance payment'; nextTo = `${B}/invoices/${balance.id}/pay`; }
    } else if (project?.status === 'in_production' || project?.status === 'complete') {
      status = 'in_production'; stage = 6; next = 'Mark complete → balance invoice'; nextTo = `${B}/projects/${project.id}`;
    } else if (deposit) {
      status = invoiceStatus(deposit, today); stage = 5;
      if (status === 'paid') { status = 'deposit_due'; next = 'Clear funds to start project'; } else next = status === 'overdue' ? 'Send reminder' : 'Record deposit';
      nextTo = `${B}/invoices/${deposit.id}/pay`;
    } else { stage = 5; }
  }
  return { quote, client, items, invoices, deposit, balance, payments, project, activity, quoteStatus: qStatus, status, stage, next, nextTo, received, outstanding };
}

export function listDeals(db, today = todayISO()) {
  return db.quotes
    .filter((q) => q.status !== 'superseded')
    .map((q) => buildDeal(db, q, today))
    .sort((a, b) => (a.quote.created_at < b.quote.created_at ? 1 : -1));
}

export const DEAL_TABS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'quotes', label: 'Quotes out', test: (d) => ['draft', 'sent', 'viewed', 'expired'].includes(d.status) },
  { key: 'deposit', label: 'Awaiting deposit', test: (d) => d.stage === 5 },
  { key: 'production', label: 'In production', test: (d) => d.stage === 6 },
  { key: 'balance', label: 'Balance due', test: (d) => d.stage === 7 },
  { key: 'closed', label: 'Closed', test: (d) => d.stage === 8 || ['declined'].includes(d.status) },
];

export const STAGES = ['Client', 'Quote', 'Send', 'Accept & sign', 'Deposit invoice', 'Deposit paid', 'Balance invoice', 'Paid & closed'];
