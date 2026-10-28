import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { DollarSign, AlertTriangle, TrendingUp, FileQuestion, ArrowRight } from 'lucide-react';
import { canSeeFinancials } from '@/lib/rbac';

const STATUS_COLORS = {
  Draft: 'bg-slate-800/50 text-cyan-200/80 border border-cyan-500/20',
  Sent: 'bg-blue-900/30 text-blue-300 border border-blue-500/30',
  'Partially Paid': 'bg-amber-900/30 text-amber-300 border border-amber-500/30',
  Paid: 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30',
  Overdue: 'bg-red-900/30 text-red-300 border border-red-500/30',
};

function fmt(n) {
  return `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Card({ label, value, sub, icon: Icon, gradient, glow, loading }) {
  return (
    <div
      className="relative rounded-xl border p-5 overflow-hidden backdrop-blur-xl"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 0 20px ${glow.replace('20', '15')}`,
      }}
    >
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20 blur-2xl" style={{ background: gradient }} />
      <div className="relative">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: gradient, boxShadow: `0 2px 12px ${glow}` }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <p className="text-[10px] font-bold text-cyan-200/70 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-bold text-cyan-50 tracking-tight leading-none">
          {loading ? <span className="inline-block w-24 h-5 bg-cyan-900/30 rounded animate-pulse" /> : value}
        </p>
        {sub && <p className="text-[10px] text-cyan-200/50 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FinanceSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    platform.auth.me().then(setUser).catch(() => {});
    load();
  }, []);

  const canSeeFinanceTotals = canSeeFinancials(user);

  const load = async () => {
    setLoading(true);
    const [invoices, payments, quotes] = await Promise.all([
      platform.entities.Invoice.list('-created_date', 500),
      platform.entities.Payment.list('-payment_date', 500),
      platform.entities.Quote.list('-created_date', 500),
    ]);

    const unpaid = invoices.filter(i => ['Sent', 'Partially Paid', 'Overdue'].includes(i.status));
    const totalOutstanding = unpaid.reduce((s, i) => s + (i.balance_due || 0), 0);
    const overdueAmount = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + (i.balance_due || 0), 0);

    const now = new Date();
    const paymentsThisMonth = payments.filter(p => {
      const d = new Date(p.payment_date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const collectedThisMonth = paymentsThisMonth.reduce((s, p) => s + (p.amount || 0), 0);

    const quotesAwaitingResponse = quotes.filter(q => q.status === 'Sent').length;

    // Recent invoices (last 5, sorted by created_date)
    const recentInvoices = [...invoices]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);

    // Recent payments (last 5)
    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
      .slice(0, 5);

    setData({ totalOutstanding, overdueAmount, collectedThisMonth, quotesAwaitingResponse, recentInvoices, recentPayments });
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* ── 4 Summary Cards ── */}
      {canSeeFinanceTotals ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            label="Total Outstanding"
            value={fmt(data?.totalOutstanding)}
            sub="Unpaid invoice balances"
            icon={DollarSign}
            gradient="linear-gradient(135deg,#f97316,#fb923c)"
            glow="#f9731620"
            loading={loading}
          />
          <Card
            label="Overdue Amount"
            value={fmt(data?.overdueAmount)}
            sub="Past due date"
            icon={AlertTriangle}
            gradient="linear-gradient(135deg,#ef4444,#f87171)"
            glow="#ef444420"
            loading={loading}
          />
          <Card
            label="Collected This Month"
            value={fmt(data?.collectedThisMonth)}
            sub={`Payments received in ${new Date().toLocaleString('en-ZA', { month: 'long' })}`}
            icon={TrendingUp}
            gradient="linear-gradient(135deg,#10b981,#34d399)"
            glow="#10b98120"
            loading={loading}
          />
          <Card
            label="Quotes Awaiting Response"
            value={loading ? '—' : data?.quotesAwaitingResponse}
            sub="Status: Sent"
            icon={FileQuestion}
            gradient="linear-gradient(135deg,#6366f1,#818cf8)"
            glow="#6366f120"
            loading={loading}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            label="My Invoices"
            value={data?.recentInvoices?.filter(i => i.created_by_id === user?.id).length || 0}
            sub="Created by you"
            icon={FileQuestion}
            gradient="linear-gradient(135deg,#6366f1,#818cf8)"
            glow="#6366f120"
            loading={loading}
          />
          <Card
            label="My Payments Recorded"
            value={data?.recentPayments?.filter(p => p.created_by_id === user?.id).length || 0}
            sub="This month"
            icon={DollarSign}
            gradient="linear-gradient(135deg,#10b981,#34d399)"
            glow="#10b98120"
            loading={loading}
          />
          <Card
            label="Quotes Awaiting Response"
            value={loading ? '—' : data?.quotesAwaitingResponse}
            sub="Status: Sent"
            icon={FileQuestion}
            gradient="linear-gradient(135deg,#6366f1,#818cf8)"
            glow="#6366f120"
            loading={loading}
          />
          <Card
            label="Quick Actions"
            value="Quotes & Invoices"
            sub="Access your documents"
            icon={ArrowRight}
            gradient="linear-gradient(135deg,#B87333,#d4944a)"
            glow="#B8733320"
            loading={loading}
          />
        </div>
      )}

      {/* ── Two lists ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Invoices */}
        <div
          className="rounded-xl border backdrop-blur-xl overflow-hidden"
          style={{ 
            background: 'rgba(15, 23, 42, 0.6)',
            borderColor: 'rgba(34, 211, 238, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(34, 211, 238, 0.15)' }}>
            <span className="text-xs font-bold text-cyan-200/70 uppercase tracking-widest">Recent Invoices</span>
            <Link to="/admin/invoices" className="flex items-center gap-1 text-xs text-cyan-300 font-semibold hover:text-cyan-200 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !data?.recentInvoices?.length ? (
            <div className="p-8 text-center text-sm text-cyan-200/50">No invoices yet</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}>
              {data.recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-cyan-950/20 transition-colors">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-cyan-100/90">{inv.invoice_number}</p>
                    <p className="text-xs text-cyan-200/50 truncate">{inv.contact_snapshot?.full_name || inv.book_title || '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                      {inv.status}
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-cyan-50">{fmt(inv.total)}</p>
                      {(inv.balance_due || 0) > 0 && inv.status !== 'Paid' && (
                        <p className="text-[10px] text-amber-400">Bal: {fmt(inv.balance_due)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div
          className="rounded-xl border backdrop-blur-xl overflow-hidden"
          style={{ 
            background: 'rgba(15, 23, 42, 0.6)',
            borderColor: 'rgba(34, 211, 238, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(34, 211, 238, 0.15)' }}>
            <span className="text-xs font-bold text-cyan-200/70 uppercase tracking-widest">Recent Payments</span>
            <Link to="/admin/payments" className="flex items-center gap-1 text-xs text-cyan-300 font-semibold hover:text-cyan-200 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !data?.recentPayments?.length ? (
            <div className="p-8 text-center text-sm text-cyan-200/50">No payments yet</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}>
              {data.recentPayments.map(pay => (
                <div key={pay.id} className="flex items-center justify-between px-5 py-3 hover:bg-cyan-950/20 transition-colors">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-cyan-100/90">{pay.payment_number || '—'}</p>
                    <p className="text-xs text-cyan-200/50">
                      {pay.payment_date ? new Date(pay.payment_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}
                      {' · '}{pay.payment_method}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400 ml-3 shrink-0">{fmt(pay.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}