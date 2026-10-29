import React from 'react';
import { X, Download, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const GLASS = {
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.12)'
};

export default function ReceiptDetailPanel({ receipt, invoice, contact, onClose }) {
  const handleDownloadPdf = async () => {
    try {
      const { platform } = await import('@/api/platformClient');
      const res = await platform.functions.invoke('paymentActions', {
        action: 'get_receipt_pdf',
        receipt_id: receipt.id,
      });
      
      if (res.data?.pdf_base64) {
        const bytes = Uint8Array.from(atob(res.data.pdf_base64), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${res.data.receipt_number || 'receipt'}.pdf`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success('Receipt downloaded');
      } else if (res.data?.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
        toast.success('Receipt downloaded');
      }
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleSendEmail = async () => {
    const email = contact?.email || receipt.contact_snapshot?.email;
    if (!email) {
      toast.error('No email address available');
      return;
    }

    if (!confirm(`Send receipt ${receipt.receipt_number} to ${email}?`)) return;

    try {
      const { platform } = await import('@/api/platformClient');
      await platform.functions.invoke('sendReceiptEmail', {
        receipt_id: receipt.id,
        email: email,
      });
      toast.success('Receipt sent via email');
    } catch (error) {
      toast.error(error.message || 'Failed to send email');
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
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto" style={GLASS}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{receipt.receipt_number}</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-300">
                  Payment Received
                </span>
              </div>
              <p className="text-gray-500">Receipt for {invoice?.invoice_number}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Payment Summary */}
          <div className="p-5 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-900">Payment Details</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-800">Amount Paid</span>
                <span className="text-xl font-bold text-green-900">
                  R {(receipt.amount_paid || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Payment Date</span>
                <span className="font-medium text-green-900">{formatDate(receipt.payment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Payment Method</span>
                <span className="font-medium text-green-900">{receipt.payment_method}</span>
              </div>
              {receipt.reference && (
                <div className="flex justify-between">
                  <span className="text-green-800">Reference</span>
                  <span className="font-medium text-green-900">{receipt.reference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Balance */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Balance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Total</span>
                <span className="font-medium">R {(receipt.invoice_total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Previous Payments</span>
                <span className="font-medium text-green-600">
                  R {((receipt.invoice_total || 0) - (receipt.balance_after || 0) - (receipt.amount_paid || 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">Balance After Payment</span>
                <span className={`text-xl font-bold ${(receipt.balance_after || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  R {(receipt.balance_after || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Client</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name</span>
                <span className="text-gray-900 font-medium">{receipt.contact_snapshot?.full_name || contact?.full_name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900">{receipt.contact_snapshot?.email || contact?.email || '—'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Send via Email
            </button>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-gray-600 text-sm">{receipt.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}