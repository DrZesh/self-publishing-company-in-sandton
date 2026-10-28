import React, { useState } from 'react';
import { X, Repeat, Calendar, DollarSign, Save } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const GLASS = {
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

export default function RecurringInvoiceModal({ onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contact_id: '',
    amount: 0,
    description: 'Monthly retainer',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    frequency: 'monthly', // weekly, biweekly, monthly, quarterly, annually
    day_of_month: 1,
    auto_send: true,
  });

  const handleSave = async () => {
    if (!formData.contact_id) {
      toast.error('Please select a client');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Create recurring invoice schedule
      await platform.entities.RecurringInvoice.create({
        contact_id: formData.contact_id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        frequency: formData.frequency,
        day_of_month: formData.day_of_month,
        auto_send: formData.auto_send,
        status: 'active',
        next_invoice_date: calculateNextDate(formData.start_date, formData.frequency, formData.day_of_month),
      });

      toast.success('Recurring invoice schedule created');
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create recurring invoice');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDate = (startDate, frequency, dayOfMonth) => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        date.setDate(dayOfMonth);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        date.setDate(dayOfMonth);
        break;
      case 'annually':
        date.setFullYear(date.getFullYear() + 1);
        date.setDate(dayOfMonth);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl" style={GLASS}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Back to Invoices">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Recurring Invoice</h2>
              <p className="text-sm text-gray-500 mt-1">Set up automatic recurring billing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Client *</label>
            <select
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select a client</option>
              {/* Will be populated with contacts from parent */}
            </select>
          </div>

          {/* Amount & Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (R) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Monthly retainer"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'weekly', label: 'Weekly' },
                { value: 'biweekly', label: 'Bi-weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'annually', label: 'Annually' },
              ].map(freq => (
                <button
                  key={freq.value}
                  onClick={() => setFormData({ ...formData, frequency: freq.value })}
                  className={`p-3 rounded-xl border-2 font-medium transition-all ${
                    formData.frequency === freq.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date & Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Day of Month</label>
              <select
                value={formData.day_of_month}
                onChange={(e) => setFormData({ ...formData, day_of_month: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>Day {day}</option>
                ))}
              </select>
            </div>
          </div>

          {/* End Date (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Leave empty for indefinite"
            />
          </div>

          {/* Auto-send Toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              checked={formData.auto_send}
              onChange={(e) => setFormData({ ...formData, auto_send: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Automatically send invoices on the scheduled date
            </label>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Invoices will be generated automatically on the schedule</li>
                  <li>Clients receive invoices via email if auto-send is enabled</li>
                  <li>You can pause or cancel the schedule anytime</li>
                </ul>
              </div>
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
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Repeat className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}