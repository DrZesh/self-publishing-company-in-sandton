import React, { useState } from 'react';
import { X, FileText, Download, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const GLASS = {
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.12)'
};

export default function InvoiceBulkActions({ selectedInvoices, contacts, onClose, onCompleted }) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('send_email'); // send_email, download_pdf, mark_paid

  const handleBulkAction = async () => {
    if (!selectedInvoices || selectedInvoices.length === 0) {
      toast.error('No invoices selected');
      return;
    }

    setLoading(true);
    try {
      const { platform } = await import('@/api/platformClient');
      let successCount = 0;

      for (const invoice of selectedInvoices) {
        try {
          if (action === 'send_email') {
            const email = invoice.contact_snapshot?.email || contacts.find(c => c.id === invoice.contact_id)?.email;
            if (!email) continue;
            
            await platform.functions.invoke('invoiceActions', {
              action: 'send',
              invoice_id: invoice.id,
            });
            successCount++;
          } else if (action === 'download_pdf') {
            // Open each invoice in new tab for download
            window.open(`/invoice/view/${invoice.id}/${invoice.view_token}`, '_blank');
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to process invoice ${invoice.invoice_number}:`, error);
        }
      }

      toast.success(`Successfully processed ${successCount} of ${selectedInvoices.length} invoices`);
      onCompleted?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to process bulk action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl" style={GLASS}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Back to Invoices">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Actions</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedInvoices?.length || 0} invoices selected</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Action Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500 bg-blue-50 cursor-pointer">
              <input
                type="radio"
                checked={action === 'send_email'}
                onChange={() => setAction('send_email')}
                className="w-5 h-5 text-blue-600"
              />
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Send via Email</p>
                <p className="text-sm text-gray-600">Email invoices to clients</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                checked={action === 'download_pdf'}
                onChange={() => setAction('download_pdf')}
                className="w-5 h-5 text-blue-600"
              />
              <Download className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Download PDFs</p>
                <p className="text-sm text-gray-600">Download all selected invoices</p>
              </div>
            </label>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> {action === 'send_email' ? 'Each invoice will be sent to its respective client email address.' : 'PDFs will open in new tabs for downloading.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAction}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {loading ? 'Processing...' : `Process ${selectedInvoices?.length || 0} Invoices`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};