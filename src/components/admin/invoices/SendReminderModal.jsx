import React, { useState } from 'react';
import { X, Mail, Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const GLASS = {
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

export default function SendReminderModal({ invoice, contact, onClose, onSent }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sendCopy, setSendCopy] = useState(false);

  const handleSend = async () => {
    if (!invoice.contact_snapshot?.email && !contact?.email) {
      toast.error('No email address available for this client');
      return;
    }

    setLoading(true);
    try {
      const { platform } = await import('@/api/platformClient');
      const email = invoice.contact_snapshot?.email || contact.email;
      
      await platform.functions.invoke('sendPaymentReminder', {
        invoice_id: invoice.id,
        custom_message: message,
        send_copy_to_admin: sendCopy,
      });

      toast.success(`Payment reminder sent to ${email}`);
      onSent?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to send reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl" style={GLASS}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Payment Reminder</h2>
            <p className="text-sm text-gray-500 mt-1">Invoice {invoice.invoice_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invoice Summary */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-amber-800 font-medium">Amount Due</span>
              <span className="text-xl font-bold text-amber-900">
                R {(invoice.balance_due || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-800 font-medium">Due Date</span>
              <span className="text-sm font-medium text-amber-900">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-ZA') : '—'}
              </span>
            </div>
            {invoice.due_date && new Date(invoice.due_date) < new Date() && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600 font-medium">
                <Calendar className="w-4 h-4" />
                <span>Overdue by {Math.ceil((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))} days</span>
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to the reminder..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to use the default reminder template</p>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendCopy}
                onChange={(e) => setSendCopy(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Send Copy to Admin</p>
                <p className="text-sm text-gray-500">Receive a copy of this reminder email</p>
              </div>
            </label>
          </div>

          {/* Preview */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">Email Preview:</p>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>To:</strong> {invoice.contact_snapshot?.email || contact?.email}</p>
              <p><strong>Subject:</strong> Payment Reminder: Invoice {invoice.invoice_number}</p>
              <p className="italic">{message || 'Default reminder message will be used...'}</p>
            </div>
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
              onClick={handleSend}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Sending...' : 'Send Reminder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};