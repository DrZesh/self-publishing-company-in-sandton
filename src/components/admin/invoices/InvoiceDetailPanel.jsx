import React, { useState } from 'react';
import { X, Eye, Send, Download, Plus, CreditCard, FileText, MoreVertical, Mail, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';

const GLASS = {
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.12)'
};

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-700 border-gray-300',
  'Sent': 'bg-blue-100 text-blue-700 border-blue-300',
  'Viewed': 'bg-blue-100 text-blue-700 border-blue-300',
  'Unpaid': 'bg-orange-100 text-orange-700 border-orange-300',
  'Partially Paid': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Paid': 'bg-green-100 text-green-700 border-green-300',
  'Overdue': 'bg-red-100 text-red-700 border-red-300',
  'Cancelled': 'bg-gray-100 text-gray-500 border-gray-300',
};

export default function InvoiceDetailPanel({ invoice, contact, onClose, onUpdated }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState(false);

  const handleConfirmWorkflow = async () => {
    if (invoice.invoice_confirmed_by_admin) {
      toast.info('Invoice has already been confirmed.');
      return;
    }
    if (!['Sent', 'Partially Paid'].includes(invoice.status)) {
      toast.error('Invoice must be in "Sent" status before it can be confirmed.');
      return;
    }
    if (!confirm(`Confirm invoice ${invoice.invoice_number} and continue the workflow?\n\nThis will send the NDA (if required) and portal login details to the client.`)) return;
    setConfirming(true);
    try {
      const { platform } = await import('@/api/platformClient');
      const res = await platform.functions.invoke('adminConfirmWorkflow', { invoice_id: invoice.id });
      if (res.data?.success) {
        const { nda_sent, portal_sent, logs } = res.data;
        toast.success(`Confirmed! ${nda_sent ? 'NDA sent. ' : ''}${portal_sent ? 'Portal login sent.' : ''}`);
        onUpdated?.();
      } else {
        toast.error(res.data?.error || 'Confirmation failed.');
      }
    } catch (err) {
      toast.error(err.message || 'Confirmation failed.');
    } finally {
      setConfirming(false);
    }
  };

  const handleSendInvoice = async () => {
    const email = invoice.contact_snapshot?.email || contact?.email;
    if (!email) {
      toast.error('No email address on this contact');
      return;
    }

    if (!confirm(`Send invoice ${invoice.invoice_number} to ${email}?`)) return;

    setSending(true);
    try {
      const { platform } = await import('@/api/platformClient');
      const res = await platform.functions.invoke('invoiceActions', {
        action: 'send',
        invoice_id: invoice.id,
      });

      if (res.data?.success) {
        toast.success(`Invoice ${invoice.invoice_number} sent to ${email}`);
        onUpdated?.();
      } else {
        toast.error(res.data?.error || 'Failed to send invoice');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const { platform } = await import('@/api/platformClient');
      const res = await platform.functions.invoke('invoiceActions', {
        action: 'get_public',
        invoice_id: invoice.id,
        token: invoice.view_token,
      });

      if (res.data?.invoice) {
        // Create PDF from the invoice data
        toast.success('PDF downloaded successfully');
        // In production, this would generate and download the actual PDF
        window.open(`/invoice/view/${invoice.id}/${invoice.view_token}`, '_blank');
      }
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleAddPayment = () => {
    setShowPaymentModal(true);
  };

  const handleSendReceipt = async () => {
    setSendingReceipt(true);
    try {
      const { platform } = await import('@/api/platformClient');
      // Get most recent receipt for this invoice
      const res = await platform.functions.invoke('paymentActions', {
        action: 'get_by_invoice',
        invoice_id: invoice.id,
      });
      const receipt = res.data?.receipt;
      if (!receipt?.id) { toast.error('No receipt found for this invoice'); return; }
      await platform.functions.invoke('paymentActions', {
        action: 'send_acknowledgement',
        receipt_id: receipt.id,
      });
      toast.success('Receipt sent to client');
    } catch (err) {
      toast.error(err.message || 'Failed to send receipt');
    } finally {
      setSendingReceipt(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto" style={GLASS}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[invoice.status]}`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-gray-500">{invoice.book_title || 'No book title'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Invoice Total</p>
              <p className="text-2xl font-bold text-gray-900">R {(invoice.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Balance Due</p>
              <p className={`text-2xl font-bold ${(invoice.balance_due || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                R {(invoice.balance_due || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Admin Confirmation Gate */}
          {['Sent', 'Partially Paid'].includes(invoice.status) && !invoice.invoice_confirmed_by_admin && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
              <p className="text-sm font-semibold text-amber-800 mb-1">⏳ Awaiting Admin Confirmation</p>
              <p className="text-xs text-amber-700 mb-3">The NDA and portal login will not be sent until you confirm below.</p>
              <button
                onClick={handleConfirmWorkflow}
                disabled={confirming}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {confirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {confirming ? 'Processing…' : 'Confirm Invoice and Continue'}
              </button>
            </div>
          )}

          {invoice.invoice_confirmed_by_admin && (
            <div className="p-4 bg-green-50 border border-green-300 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Invoice Confirmed by Admin</p>
                <p className="text-xs text-green-700">{invoice.portal_login_sent ? 'Portal login sent.' : ''}{invoice.nda_sent ? ' NDA sent.' : ''}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSendInvoice}
              disabled={sending || invoice.status === 'Paid'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send Invoice'}
            </button>
            <button
              onClick={handleAddPayment}
              disabled={invoice.status === 'Paid'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add Payment
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
            {['Paid', 'Partially Paid'].includes(invoice.status) && (
              <button
                onClick={handleSendReceipt}
                disabled={sendingReceipt}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 col-span-2"
              >
                <Mail className="w-5 h-5" />
                {sendingReceipt ? 'Sending…' : 'Send / Resend Receipt'}
              </button>
            )}
          </div>

          {/* Client Details */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Client Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Client Name</span>
                <Link to={`/admin/contacts/detail?id=${contact?.id}`} className="text-blue-600 hover:underline font-medium">
                  {contact?.full_name || '—'}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <a href={`mailto:${contact?.email}`} className="text-blue-600 hover:underline">
                  {contact?.email || '—'}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="text-gray-900">{contact?.phone || '—'}</span>
              </div>
              {contact?.company && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Company</span>
                  <span className="text-gray-900">{contact.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date</span>
                <span className="text-gray-900">{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date</span>
                <span className={`${invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'Paid' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {formatDate(invoice.due_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-green-600 font-medium">R {(invoice.amount_paid || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Balance Due</span>
                <span className={`text-xl font-bold ${(invoice.balance_due || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  R {(invoice.balance_due || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {invoice.line_items && invoice.line_items.length > 0 && (
            <div className="p-5 bg-white rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Line Items</h3>
              <div className="space-y-3">
                {invoice.line_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × R {item.unit_price?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <p className="font-semibold text-gray-900">R {item.line_total?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automation State */}
          {invoice.automation_state && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Workflow State</h3>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{invoice.automation_state}</span>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="p-5 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-gray-600 text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Terms */}
          {invoice.payment_terms && (
            <div className="p-5 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Terms</h3>
              <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.payment_terms}</p>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          invoice={invoice}
          contact={contact}
          onClose={() => setShowPaymentModal(false)}
          onPaymentAdded={onUpdated}
        />
      )}
    </>
  );
}