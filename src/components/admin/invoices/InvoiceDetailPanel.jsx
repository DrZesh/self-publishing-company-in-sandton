import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Edit2, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import InvoiceModal from './InvoiceModal';

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
  'Partially Paid': 'bg-yellow-100 text-yellow-700',
};

export default function InvoiceDetailPanel({ invoice, contact, onClose, onUpdated }) {
  const [showEdit, setShowEdit] = useState(false);
  const [marking, setMarking] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    if (!contact?.email) {
      toast.error('Contact has no email address.');
      return;
    }

    if (!confirm(`Send invoice ${invoice.invoice_number} to ${contact.email}?`)) return;

    setSending(true);

    try {
      const result = await base44.functions.invoke('sendInvoiceEmail', {
        invoice_id: invoice.id,
      });

      if (result.data?.success) {
        toast.success(`Invoice sent to ${contact.email}`);
        onUpdated();
      } else {
        toast.error(result.data?.error || 'Failed to send invoice.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send invoice.');
    } finally {
      setSending(false);
    }
  };

  const markPaid = async () => {
    const balance = Number(invoice.balance_due || 0);

    if (balance <= 0) {
      toast.info('This invoice has no outstanding balance.');
      return;
    }

    setMarking(true);

    try {
      await base44.entities.Payment.create({
        invoice_id: invoice.id,
        contact_id: invoice.contact_id,
        amount: balance,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: 'Other',
        reference: `Manual settlement for ${invoice.invoice_number}`,
        status: 'Confirmed',
        notes: 'Created from the invoice Mark as Paid action.',
      });

      toast.success('Invoice marked as paid and payment recorded');
      onUpdated();
    } catch (error) {
      toast.error(error.message || 'Failed to record settlement payment.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <p className="font-mono text-sm text-gray-500">{invoice.invoice_number}</p>
              <h2 className="font-bold text-gray-900">{contact?.full_name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status] || 'bg-gray-100 text-gray-600'}`}>{invoice.status}</span>
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}><Edit2 className="w-4 h-4" /></Button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">R {(invoice.total || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-bold text-green-600">R {(invoice.amount_paid || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Balance</p>
                <p className={`text-lg font-bold ${(invoice.balance_due || 0) > 0 ? 'text-orange-600' : 'text-gray-400'}`}>R {(invoice.balance_due || 0).toLocaleString()}</p>
              </div>
            </div>

            {invoice.line_items?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Line Items</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs text-gray-500">Description</th>
                        <th className="text-right px-4 py-2 text-xs text-gray-500">Qty</th>
                        <th className="text-right px-4 py-2 text-xs text-gray-500">Unit</th>
                        <th className="text-right px-4 py-2 text-xs text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoice.line_items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">R {(item.unit_price || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-medium">R {(item.line_total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right text-sm font-semibold">Subtotal</td>
                        <td className="px-4 py-2 text-right font-semibold">R {(invoice.subtotal || 0).toLocaleString()}</td>
                      </tr>
                      {invoice.include_vat && (
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">VAT ({invoice.vat_rate}%)</td>
                          <td className="px-4 py-2 text-right text-gray-500">R {(invoice.vat_amount || 0).toLocaleString()}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-bold">Total</td>
                        <td className="px-4 py-2 text-right font-bold text-[#B87333]">R {(invoice.total || 0).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {[
                { label: 'Book Title', value: invoice.book_title },
                { label: 'Due Date', value: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-ZA') : null },
                { label: 'Payment Terms', value: invoice.payment_terms },
              ].filter(detail => detail.value).map(detail => (
                <div key={detail.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{detail.label}</span>
                  <span className="text-gray-900 font-medium text-right max-w-[60%]">{detail.value}</span>
                </div>
              ))}
            </div>

            {invoice.banking_details && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">Banking Details</p>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{invoice.banking_details}</p>
              </div>
            )}

            <div className="flex gap-3">
              {invoice.status !== 'Paid' && (
                <Button onClick={markPaid} disabled={marking} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  {marking ? 'Recording...' : 'Mark as Paid'}
                </Button>
              )}
              <Button variant="outline" onClick={handleSendEmail} disabled={sending} className="flex-1">
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {sending ? 'Sending...' : 'Email Invoice'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <InvoiceModal
          invoice={invoice}
          contacts={contact ? [contact] : []}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            onUpdated();
          }}
        />
      )}
    </>
  );
}
