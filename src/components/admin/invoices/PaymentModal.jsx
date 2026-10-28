import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const GLASS = { 
  background: 'rgba(255,255,255,0.95)', 
  backdropFilter: 'blur(24px)', 
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

export default function PaymentModal({ invoice, contact, onClose, onPaymentAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: invoice.balance_due || 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'EFT',
    reference: '',
    notes: '',
  });

  const handleSave = async () => {
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    try {
      const paymentRes = await platform.functions.invoke('paymentActions', {
        action: 'record',
        invoice_id: invoice.id,
        contact_id: invoice.contact_id,
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference: formData.reference,
        notes: formData.notes,
      });

      if (paymentRes.data?.error) throw new Error(paymentRes.data.error);

      // Auto-send receipt acknowledgement email
      const receipt = paymentRes.data?.receipt;
      if (receipt?.id) {
        try {
          await platform.functions.invoke('paymentActions', {
            action: 'send_acknowledgement',
            receipt_id: receipt.id,
          });
          toast.success('Payment recorded and receipt sent to client');
        } catch (_) {
          toast.success('Payment recorded (receipt email failed — resend manually)');
        }
      } else {
        toast.success('Payment recorded successfully');
      }

      onPaymentAdded?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl" style={GLASS}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
            <p className="text-sm text-gray-500 mt-1">Invoice {invoice.invoice_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 mb-1">Balance Due</p>
            <p className="text-2xl font-bold text-blue-900">R {(invoice.balance_due || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-semibold"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Date *</label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method *</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="EFT">EFT / Bank Transfer</option>
              <option value="Card">Card Payment</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reference</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="e.g., Payment reference number"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this payment"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}