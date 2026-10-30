// Turns raw records into everything the dashboard shows. Pure functions: easy to test, no data fetching here.
//
// Input shape (what an adapter must return — extra fields are ignored):
//   submissions: [{ id, name, type: 'quote'|'contact'|…, service, created_at }]
//   leads:       [{ id, name, status: 'new'|'contacted'|'converted'|'lost'|'ghosted', created_at, last_contact_at }]
//   quotes:      [{ id, number, client_name, status: 'draft'|'sent'|'viewed'|'accepted'|'declined'|'expired', total, created_at, sent_at, responded_at }]
//   invoices:    [{ id, number, client_name, status: 'draft'|'sent'|'partially_paid'|'paid'|'overdue'|'void', total, balance, invoice_date, due_date }]
//   payments:    [{ id, number, amount, method, paid_on }]
//   projects:    [{ id, title, client_name, status, due_date }]
//   activity:    [{ id, title, subtitle, at }]
import cfg from '../dashboard.config.js';

const DAY = 86400000;
const n = (v) => Number(v) || 0;
const d = (v) => (v ? new Date(v) : null);
const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const rand = (v) => `R${fmt.format(Math.round(n(v) * 100) / 100)}`;
export const randShort = (v) => (Math.abs(v) >= 1000 ? `R${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k` : rand(v));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortDate = (v) => { const x = d(v); return x ? `${String(x.getDate()).padStart(2, '0')} ${MONTHS[x.getMonth()]}` : '—'; };
export const ago = (v, now = new Date()) => {
  const x = d(v); if (!x) return '';
  const m = Math.max(0, Math.round((now - x) / 60000));
  if (m < 60) return `${m}m`; const h = Math.round(m / 60); if (h < 24) return `${h}h`; return `${Math.round(h / 24)}d`;
};
const daysSince = (v, now) => (v ? Math.floor((now - d(v)) / DAY) : null);

export const PERIODS = [
  { key: 'today', label: 'Today' }, { key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' },
];
export function periodRange(key, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (key === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));   // Monday
  if (key === 'month') start.setDate(1);
  if (key === 'year') { start.setMonth(0, 1); }
  return { start, end: now };
}
const inRange = (v, r) => { const x = d(v); return !!x && x >= r.start && x <= r.end; };

const OPEN_INVOICE = (i) => !['paid', 'void', 'draft'].includes(i.status) && n(i.balance) > 0;
const isOverdue = (i, now) => OPEN_INVOICE(i) && (i.status === 'overdue' || (i.due_date && d(i.due_date) < new Date(now.getFullYear(), now.getMonth(), now.getDate())));
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export function computeDashboard(raw, periodKey = 'month', now = new Date()) {
  const r = periodRange(periodKey, now);
  const { submissions = [], leads = [], quotes = [], invoices = [], payments = [], projects = [], activity = [] } = raw;

  /* ---------- money ---------- */
  const open = invoices.filter(OPEN_INVOICE);
  const overdueList = open.filter((i) => isOverdue(i, now)).sort((a, b) => n(b.balance) - n(a.balance));
  const outstanding = open.reduce((s, i) => s + n(i.balance), 0);
  const overdue = overdueList.reduce((s, i) => s + n(i.balance), 0);
  const collected = payments.filter((p) => inRange(p.paid_on, r)).reduce((s, p) => s + n(p.amount), 0);
  const target = periodKey === 'month' ? cfg.monthlyTarget : periodKey === 'year' ? cfg.monthlyTarget * 12 : null;

  /* ---------- quotes ---------- */
  const qPeriod = quotes.filter((q) => inRange(q.created_at, r));
  const count = (list, s) => list.filter((q) => q.status === s).length;
  const funnel = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'].map((s) => ({ status: s, count: count(qPeriod, s) }));
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));
  funnel.forEach((f) => { f.pct = Math.round((f.count / maxFunnel) * 100); });
  const accepted = qPeriod.filter((q) => q.status === 'accepted');
  const decided = qPeriod.filter((q) => ['accepted', 'declined', 'expired'].includes(q.status)).length;
  const winRate = decided ? Math.round((accepted.length / decided) * 100) : null;
  const sentOrViewed = count(qPeriod, 'sent') + count(qPeriod, 'viewed');
  const draftsAll = quotes.filter((q) => q.status === 'draft');

  /* ---------- follow-ups (fixes "No contact in 999 days") ---------- */
  const fu = [];
  quotes.filter((q) => ['sent', 'viewed'].includes(q.status)).forEach((q) => {
    const days = daysSince(q.sent_at || q.created_at, now);
    if (days != null && days >= cfg.followUpAfterDays) fu.push({ id: `q-${q.id}`, name: q.client_name || 'Unknown client', reason: `Quote sent ${days} days ago, no reply`, score: 1000 + days });
  });
  leads.filter((l) => ['new', 'contacted'].includes(l.status || 'new')).forEach((l) => {
    const since = daysSince(l.last_contact_at, now);
    if (since == null) {
      const age = daysSince(l.created_at, now) ?? 0;
      if (age >= cfg.staleLeadDays) fu.push({ id: `l-${l.id}`, name: l.name || 'Unnamed lead', reason: 'New enquiry · never contacted', score: 500 + age });
    } else if (since >= cfg.followUpAfterDays) fu.push({ id: `l-${l.id}`, name: l.name || 'Unnamed lead', reason: `Last contact ${since} days ago`, score: since });
  });
  fu.sort((a, b) => b.score - a.score);
  fu.forEach((x) => { x.initials = initials(x.name); });

  /* ---------- today's focus: the 3 most important things ---------- */
  const focus = [];
  if (overdue > 0) {
    const top = overdueList[0];
    focus.push({ key: 'money', tone: 'red', label: 'CHASE MONEY', value: rand(overdue), text: `is past due${top ? `. Biggest: ${top.number} ${top.client_name || ''}, ${rand(top.balance)}` : ''}`, cta: 'Send reminders', to: cfg.routes.overdueInvoices });
  }
  if (fu.length) focus.push({ key: 'follow', tone: 'amber', label: 'FOLLOW UP', value: `${fu.length} client${fu.length === 1 ? '' : 's'}`, text: `waiting on you. ${fu[0].name}: ${fu[0].reason.charAt(0).toLowerCase()}${fu[0].reason.slice(1)}`, cta: 'Open follow-ups', to: cfg.routes.followUps });
  if (draftsAll.length) focus.push({ key: 'drafts', tone: 'blue', label: 'FINISH QUOTES', value: `${draftsAll.length} draft${draftsAll.length === 1 ? '' : 's'}`, text: 'never sent. Send or archive them', cta: 'Review drafts', to: cfg.routes.quoteDrafts });
  const newSubs = submissions.filter((s) => daysSince(s.created_at, now) != null && daysSince(s.created_at, now) < 2);
  if (focus.length < 3 && newSubs.length) focus.push({ key: 'subs', tone: 'blue', label: 'NEW ENQUIRIES', value: `${newSubs.length} new`, text: 'submissions in the last 48 hours', cta: 'Open submissions', to: cfg.routes.submissions });
  focus.slice(0, 3).forEach((f, i) => { f.n = String(i + 1).padStart(2, '0'); });

  /* ---------- enquiry trend: last 6 calendar months ---------- */
  const trend = [];
  for (let k = 5; k >= 0; k--) {
    const m = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const next = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    trend.push({ label: MONTHS[m.getMonth()].toUpperCase(), count: submissions.filter((s) => { const x = d(s.created_at); return x && x >= m && x < next; }).length });
  }
  const tMax = Math.max(1, ...trend.map((t) => t.count));
  const W = 600; const H = 200; const top = 10;
  const pts = trend.map((t, i) => [Math.round((i / 5) * W), Math.round(H - (t.count / tMax) * (H - top))]);
  const line = pts.map((p, i) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const [px, py] = pts[i - 1]; const cx = (px + p[0]) / 2;
    return `C${cx},${py} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }).join(' ');
  const last = trend[5].count; const threeAgo = trend[2].count;
  const trendNote = threeAgo > 0 && last >= threeAgo * 1.8 ? `Up ${Math.round(last / threeAgo * 10) / 10}× since ${trend[2].label.charAt(0)}${trend[2].label.slice(1).toLowerCase()}` : last < threeAgo ? 'Lower than 3 months ago' : 'Steady';

  /* ---------- services ---------- */
  const subsP = submissions.filter((s) => inRange(s.created_at, r));
  const bySvc = {};
  subsP.forEach((s) => { const k = s.service || 'Other'; bySvc[k] = (bySvc[k] || 0) + 1; });
  const svcSorted = Object.entries(bySvc).sort((a, b) => b[1] - a[1]);
  const services = svcSorted.slice(0, 4).map(([name, c]) => ({ name, count: c }));
  const otherCount = svcSorted.slice(4).reduce((s, [, c]) => s + c, 0);
  if (otherCount) services.push({ name: 'Other', count: otherCount, other: true });
  const sMax = Math.max(1, ...services.map((s) => s.count));
  services.forEach((s) => { s.pct = Math.round((s.count / sMax) * 100); });

  /* ---------- projects ---------- */
  const activeProjects = projects.filter((p) => !['complete', 'completed', 'closed', 'cancelled'].includes((p.status || '').toLowerCase()));
  const lateProjects = activeProjects.filter((p) => p.due_date && d(p.due_date) < now);
  const untitled = activeProjects.filter((p) => !p.title || /untitled/i.test(p.title));

  /* ---------- lists ---------- */
  const recentInvoices = [...invoices].filter((i) => i.status !== 'void').sort((a, b) => (d(b.invoice_date) || 0) - (d(a.invoice_date) || 0)).slice(0, 5)
    .map((i) => ({ ...i, shownStatus: isOverdue(i, now) ? 'overdue' : i.status }));
  const recentPayments = [...payments].sort((a, b) => (d(b.paid_on) || 0) - (d(a.paid_on) || 0));
  const lastPaymentDays = recentPayments[0] ? daysSince(recentPayments[0].paid_on, now) : null;

  return {
    period: periodKey, now,
    money: { outstanding, overdue, collected, target, targetPct: target ? Math.min(100, Math.round((collected / target) * 100)) : null, overdueCount: overdueList.length },
    quotes: { total: qPeriod.length, funnel, acceptedValue: accepted.reduce((s, q) => s + n(q.total), 0), acceptedCount: accepted.length, winRate, decided, declined: count(qPeriod, 'declined'), expired: count(qPeriod, 'expired'), sentOrViewed, viewed: count(qPeriod, 'viewed'), conversion: qPeriod.length ? Math.round((accepted.length / qPeriod.length) * 100) : 0 },
    focus: focus.slice(0, 3),
    followUps: fu,
    trend: { points: trend, line, area: `${line} L${W},${H} L0,${H} Z`, end: pts[5], note: trendNote, last },
    services, servicesTotal: subsP.length,
    projects: { active: activeProjects.length, late: lateProjects.length, untitled: untitled.length },
    invoices: recentInvoices,
    payments: recentPayments.slice(0, 4), lastPaymentDays,
    activity: [...activity].sort((a, b) => (d(b.at) || 0) - (d(a.at) || 0)).slice(0, 5),
    counts: { submissions: submissions.filter((s) => (s.status || 'new') === 'new').length, leads: leads.filter((l) => (l.status || 'new') === 'new').length, followUps: fu.length },
  };
}
