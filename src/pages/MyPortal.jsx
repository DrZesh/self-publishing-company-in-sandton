import { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { BookOpen, FileText, CreditCard, Receipt, LogOut, Download, CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import NoIndexMeta from '@/components/shared/NoIndexMeta';

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Declined: 'bg-red-100 text-red-700',
  Expired: 'bg-gray-100 text-gray-500',
  Paid: 'bg-emerald-100 text-emerald-700',
  'Partially Paid': 'bg-amber-100 text-amber-700',
  Overdue: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>
  );
}

function fmt(n) { return `R ${Number(n || 0).toFixed(2)}`; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }

function downloadPdf(base64, filename) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Quote Card ─────────────────────────────────────────────────────────────────
function QuoteCard({ quote, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(null);
  const canAct = ['Sent', 'Delivered', 'Viewed', 'Opened'].includes(quote.status);

  const handle = async (action) => {
    setActing(action);
    try {
      const res = await platform.functions.invoke('clientPortalData', { action: action === 'accept' ? 'accept_quote' : 'decline_quote', quote_id: quote.id });
      if (res.data?.success) { toast.success(action === 'accept' ? 'Quote accepted!' : 'Quote declined.'); onRefresh(); }
      else toast.error(res.data?.error || 'Action failed');
    } catch { toast.error('Action failed'); }
    setActing(null);
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${canAct ? 'border-[#B87333]/30' : 'border-gray-100'}`}>
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-gray-700">{quote.quote_number}</span>
            {quote.book_title && <span className="text-gray-500 text-sm">· {quote.book_title}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <StatusBadge status={quote.status} />
            <span className="text-sm font-semibold text-[#B87333]">{fmt(quote.total)}</span>
            <span className="text-xs text-gray-400">{fmtDate(quote.created_date)}</span>
          </div>
          {quote.valid_until && !['Accepted','Declined'].includes(quote.status) && (
            <p className="text-xs text-gray-400 mt-1">Valid until {fmtDate(quote.valid_until)}</p>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600 mt-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 px-5 pb-5">
          {/* Line items */}
          {(quote.line_items || []).length > 0 && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold">Description</th>
                    <th className="text-center px-4 py-2 text-xs text-gray-500 font-semibold">Qty</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold">Unit Price</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quote.line_items.filter(i => i.description?.trim()).map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-gray-700">{item.description}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{fmt(item.unit_price)}</td>
                      <td className="px-4 py-2 text-right font-medium">{fmt(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 px-4 py-3 text-sm text-right space-y-1 border-t">
                <div className="flex justify-end gap-4"><span className="text-gray-500">Subtotal</span><span>{fmt(quote.subtotal)}</span></div>
                {quote.include_vat !== false && <div className="flex justify-end gap-4"><span className="text-gray-500">VAT ({quote.vat_rate || 15}%)</span><span>{fmt(quote.vat_amount)}</span></div>}
                <div className="flex justify-end gap-4 font-bold text-base"><span>Total</span><span className="text-[#B87333]">{fmt(quote.total)}</span></div>
              </div>
            </div>
          )}

          {quote.notes && <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">{quote.notes}</p>}
          {quote.terms && <p className="mt-2 text-xs text-gray-400 italic">{quote.terms}</p>}

          {canAct && (
            <div className="flex gap-3 mt-4">
              <Button onClick={() => handle('accept')} disabled={!!acting} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {acting === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Accept Quote
              </Button>
              <Button onClick={() => handle('decline')} disabled={!!acting} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-2">
                {acting === 'decline' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Decline
              </Button>
            </div>
          )}
          {quote.accepted_at && <p className="mt-3 text-xs text-emerald-600 text-center">Accepted on {fmtDate(quote.accepted_at)}</p>}
          {quote.declined_at && <p className="mt-3 text-xs text-red-500 text-center">Declined on {fmtDate(quote.declined_at)}</p>}
        </div>
      )}
    </div>
  );
}

// ── Invoice Card ───────────────────────────────────────────────────────────────
function InvoiceCard({ invoice }) {
  const [downloading, setDownloading] = useState(false);
  const isOverdue = invoice.status === 'Overdue';
  const hasBalance = (invoice.balance_due || 0) > 0;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await platform.functions.invoke('clientPortalData', { action: 'download_invoice', invoice_id: invoice.id });
      if (res.data?.pdf_base64) downloadPdf(res.data.pdf_base64, res.data.filename);
      else toast.error('Could not generate PDF');
    } catch { toast.error('Download failed'); }
    setDownloading(false);
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm ${isOverdue ? 'border-red-200' : hasBalance ? 'border-amber-100' : 'border-gray-100'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-gray-700">{invoice.invoice_number}</span>
              {invoice.book_title && <span className="text-gray-400 text-sm">· {invoice.book_title}</span>}
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <StatusBadge status={invoice.status} />
              <span className="text-sm font-semibold text-gray-800">Total: {fmt(invoice.total)}</span>
            </div>
            <div className="flex gap-4 mt-1 text-xs text-gray-400">
              <span>Issued: {fmtDate(invoice.issue_date)}</span>
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>Due: {fmtDate(invoice.due_date)}</span>
            </div>
          </div>
          <Button onClick={handleDownload} disabled={downloading} size="sm" variant="outline" className="gap-1.5 shrink-0">
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            PDF
          </Button>
        </div>

        {(invoice.amount_paid > 0 || hasBalance) && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Total</p>
              <p className="font-semibold text-sm mt-0.5">{fmt(invoice.total)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-emerald-600">Paid</p>
              <p className="font-semibold text-sm text-emerald-700 mt-0.5">{fmt(invoice.amount_paid)}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${hasBalance ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              <p className={`text-xs ${hasBalance ? 'text-amber-600' : 'text-emerald-600'}`}>Balance</p>
              <p className={`font-semibold text-sm mt-0.5 ${hasBalance ? 'text-amber-700' : 'text-emerald-700'}`}>{hasBalance ? fmt(invoice.balance_due) : 'Settled'}</p>
            </div>
          </div>
        )}

        {invoice.banking_details && hasBalance && (
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Banking Details</p>
            <p className="text-xs text-blue-800 whitespace-pre-line">{invoice.banking_details}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Receipt Card ───────────────────────────────────────────────────────────────
function ReceiptCard({ receipt }) {
  const [downloading, setDownloading] = useState(false);
  const settled = (receipt.balance_after || 0) <= 0;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await platform.functions.invoke('clientPortalData', { action: 'download_receipt', receipt_id: receipt.id });
      if (res.data?.pdf_base64) downloadPdf(res.data.pdf_base64, res.data.filename);
      else toast.error('Could not generate PDF');
    } catch { toast.error('Download failed'); }
    setDownloading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-bold text-[#B87333]">{receipt.receipt_number}</span>
          <span className="text-gray-400 text-sm">· {receipt.invoice_number}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-sm font-semibold text-emerald-700">{fmt(receipt.amount_paid)} paid</span>
          <span className="text-xs text-gray-400">{fmtDate(receipt.payment_date)}</span>
          <span className="text-xs text-gray-500">{receipt.payment_method}</span>
        </div>
        {settled
          ? <p className="text-xs text-emerald-600 mt-1">✓ Invoice fully settled</p>
          : <p className="text-xs text-amber-600 mt-1">Balance remaining: {fmt(receipt.balance_after)}</p>
        }
      </div>
      <Button onClick={handleDownload} disabled={downloading} size="sm" variant="outline" className="gap-1.5 shrink-0">
        {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        PDF
      </Button>
    </div>
  );
}

// ── Main Portal Page ───────────────────────────────────────────────────────────
export default function MyPortal() {
  const [user, setUser] = useState(null);
  const [contact, setContact] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    const authed = await platform.auth.isAuthenticated();
    if (!authed) { platform.auth.redirectToLogin(window.location.href); return; }
    const me = await platform.auth.me();
    setUser(me);
    await loadData();
    setLoading(false);
  };

  const loadData = async () => {
    const res = await platform.functions.invoke('clientPortalData', { action: 'load' });
    const d = res.data;
    setContact(d.contact);
    setQuotes(d.quotes || []);
    setInvoices(d.invoices || []);
    setReceipts(d.receipts || []);
  };

  const handleLogout = () => platform.auth.logout('/');

  if (loading) return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#B87333] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your portal…</p>
      </div>
    </div>
  );

  // Outstanding balance across all invoices
  const outstandingBalance = invoices.reduce((s, i) => s + (i.balance_due || 0), 0);
  const pendingQuotes = quotes.filter(q => ['Sent','Delivered','Opened','Viewed'].includes(q.status));
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BookOpen },
    { key: 'quotes', label: `Quotes (${quotes.length})`, icon: FileText },
    { key: 'invoices', label: `Invoices (${invoices.length})`, icon: CreditCard },
    { key: 'receipts', label: `Receipts (${receipts.length})`, icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <NoIndexMeta title="Client Portal | Creative Books SA" />
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#B87333] rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Creative Books SA</p>
              <p className="text-xs text-gray-400">Client Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {contact && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{contact.full_name}</p>
                <p className="text-xs text-gray-400">{contact.email}</p>
              </div>
            )}
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-[#1A1208] to-[#2d1e0d] rounded-2xl p-6 mb-6 text-white">
          <p className="text-[#B87333] text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-xl font-bold mb-1">{contact?.full_name || user?.full_name || 'there'}</h1>
          <p className="text-white/60 text-sm">Here's your publishing journey with Creative Books SA.</p>
        </div>

        {/* Alert strip */}
        {(pendingQuotes.length > 0 || overdueInvoices.length > 0) && (
          <div className="space-y-2 mb-5">
            {pendingQuotes.length > 0 && (
              <div onClick={() => setActiveTab('quotes')} className="cursor-pointer bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800 font-medium">{pendingQuotes.length} quote{pendingQuotes.length > 1 ? 's' : ''} awaiting your response</p>
              </div>
            )}
            {overdueInvoices.length > 0 && (
              <div onClick={() => setActiveTab('invoices')} className="cursor-pointer bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-800 font-medium">{overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} — please make payment</p>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-[#B87333] text-white shadow-sm' : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-100'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Quotes', value: quotes.length, color: 'text-blue-600', onClick: () => setActiveTab('quotes') },
                { label: 'Invoices', value: invoices.length, color: 'text-[#B87333]', onClick: () => setActiveTab('invoices') },
                { label: 'Receipts', value: receipts.length, color: 'text-emerald-600', onClick: () => setActiveTab('receipts') },
                { label: 'Outstanding', value: `R ${outstandingBalance.toFixed(2)}`, color: outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600', onClick: () => setActiveTab('invoices') },
              ].map(kpi => (
                <div key={kpi.label} onClick={kpi.onClick} className="bg-white rounded-xl border border-gray-100 p-4 text-center cursor-pointer hover:shadow-sm transition-shadow">
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Outstanding balance */}
            {outstandingBalance > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Outstanding Balance</h3>
                </div>
                <p className="text-2xl font-bold text-amber-700">R {outstandingBalance.toFixed(2)}</p>
                <p className="text-sm text-amber-600 mt-1">Please make payment using the banking details on your invoice.</p>
              </div>
            )}

            {/* Recent quotes */}
            {quotes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Recent Quotes</h3>
                  <button onClick={() => setActiveTab('quotes')} className="text-xs text-[#B87333] hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {quotes.slice(0, 3).map(q => (
                    <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="font-mono text-xs text-gray-600">{q.quote_number}</span>
                        {q.book_title && <span className="text-xs text-gray-400 ml-2">{q.book_title}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{fmt(q.total)}</span>
                        <StatusBadge status={q.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!contact && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-1">Account not linked</h3>
                <p className="text-sm text-gray-400">Your login email doesn't match a client account yet. Please contact Creative Books SA to get linked.</p>
              </div>
            )}
          </div>
        )}

        {/* Quotes */}
        {activeTab === 'quotes' && (
          <div className="space-y-3">
            {quotes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />No quotes yet
              </div>
            ) : quotes.map(q => <QuoteCard key={q.id} quote={q} onRefresh={loadData} />)}
          </div>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <CreditCard className="w-10 h-10 mx-auto mb-3 text-gray-200" />No invoices yet
              </div>
            ) : invoices.map(i => <InvoiceCard key={i.id} invoice={i} />)}
          </div>
        )}

        {/* Receipts */}
        {activeTab === 'receipts' && (
          <div className="space-y-3">
            {receipts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-200" />No receipts yet
              </div>
            ) : receipts.map(r => <ReceiptCard key={r.id} receipt={r} />)}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 space-y-1">
          <p>© Creative Books SA · <a href="/" className="hover:underline">Visit website</a> · <a href="/contact" className="hover:underline">Contact us</a></p>
        </div>
      </div>
    </div>
  );
}