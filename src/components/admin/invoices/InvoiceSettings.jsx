import React, { useState, useEffect } from 'react';
import { X, Save, Building2, FileText, Clock, AlertCircle } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const GLASS = {
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

export default function InvoiceSettings({ onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    default_payment_terms: 'Payment due within 7 days of invoice date.',
    default_due_date_days: 7,
    auto_numbering: true,
    invoice_prefix: 'INV',
    next_invoice_number: 1,
    allow_partial_payments: false,
    default_deposit_percentage: 50,
    late_fee_enabled: false,
    late_fee_percentage: 5,
    late_fee_grace_period_days: 7,
    send_thank_you_email: true,
    attach_pdf_to_email: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const existing = await platform.entities.AppSettings.filter({ setting_key: 'invoice_settings' });
      if (existing.length > 0) {
        setSettings(existing[0].settings || settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const existing = await platform.entities.AppSettings.filter({ setting_key: 'invoice_settings' });
      
      if (existing.length > 0) {
        await platform.entities.AppSettings.update(existing[0].id, { settings });
      } else {
        await platform.entities.AppSettings.create({
          setting_key: 'invoice_settings',
          settings,
        });
      }
      
      toast.success('Invoice settings saved');
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl" style={GLASS}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Back to Invoices">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Configure default invoice behavior</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Terms */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Payment Terms</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Payment Terms</label>
                <textarea
                  value={settings.default_payment_terms}
                  onChange={(e) => setSettings({ ...settings, default_payment_terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Payment terms shown on invoices..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Due Date (Days)</label>
                <input
                  type="number"
                  value={settings.default_due_date_days}
                  onChange={(e) => setSettings({ ...settings, default_due_date_days: parseInt(e.target.value) || 7 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Invoices will default to this many days from issue date</p>
              </div>
            </div>
          </div>

          {/* Numbering */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Invoice Numbering</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.auto_numbering}
                  onChange={(e) => setSettings({ ...settings, auto_numbering: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Automatic Invoice Numbering</p>
                  <p className="text-sm text-gray-500">Auto-generate sequential invoice numbers</p>
                </div>
              </label>
              {settings.auto_numbering && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Prefix</label>
                    <input
                      type="text"
                      value={settings.invoice_prefix}
                      onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="INV"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Next Invoice Number</label>
                    <input
                      type="number"
                      value={settings.next_invoice_number}
                      onChange={(e) => setSettings({ ...settings, next_invoice_number: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Partial Payments */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Partial Payments</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.allow_partial_payments}
                  onChange={(e) => setSettings({ ...settings, allow_partial_payments: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Allow Partial Payments</p>
                  <p className="text-sm text-gray-500">Accept deposits or installment payments</p>
                </div>
              </label>
              {settings.allow_partial_payments && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Deposit Percentage (%)</label>
                  <input
                    type="number"
                    value={settings.default_deposit_percentage}
                    onChange={(e) => setSettings({ ...settings, default_deposit_percentage: parseInt(e.target.value) || 50 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                    max="100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Late Fees */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Late Payment Fees</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.late_fee_enabled}
                  onChange={(e) => setSettings({ ...settings, late_fee_enabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Enable Late Fees</p>
                  <p className="text-sm text-gray-500">Automatically apply late fees to overdue invoices</p>
                </div>
              </label>
              {settings.late_fee_enabled && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Late Fee Percentage (%)</label>
                    <input
                      type="number"
                      value={settings.late_fee_percentage}
                      onChange={(e) => setSettings({ ...settings, late_fee_percentage: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grace Period (Days)</label>
                    <input
                      type="number"
                      value={settings.late_fee_grace_period_days}
                      onChange={(e) => setSettings({ ...settings, late_fee_grace_period_days: parseInt(e.target.value) || 7 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days after due date before late fee is applied</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Email Preferences */}
          <div className="p-5 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Email Preferences</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.send_thank_you_email}
                  onChange={(e) => setSettings({ ...settings, send_thank_you_email: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Send Thank You Email</p>
                  <p className="text-sm text-gray-500">Send confirmation email when payment is received</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.attach_pdf_to_email}
                  onChange={(e) => setSettings({ ...settings, attach_pdf_to_email: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Attach PDF to Invoice Emails</p>
                  <p className="text-sm text-gray-500">Include PDF attachment when sending invoices</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
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
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}