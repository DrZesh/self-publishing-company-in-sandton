import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Mail, MessageCircle, X, Save, Plus, Trash2 } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const GLASS = {
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

export default function InvoiceAutomationSettings({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    send_reminders: true,
    reminder_days_before: [7, 3, 1], // Days before due date
    send_overdue_notices: true,
    overdue_interval_days: 7, // Send every X days when overdue
    auto_send_on_creation: false,
    reminder_template: 'default',
    channels: {
      email: true,
      whatsapp: false,
    }
  });

  useEffect(() => {
    // Load existing settings
    platform.entities.AppSettings.list().then(appSettings => {
      const invoiceSettings = appSettings.find(s => s.setting_key === 'invoice_automation');
      if (invoiceSettings) {
        setSettings(invoiceSettings.settings || settings);
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings
      const appSettings = await platform.entities.AppSettings.list();
      const existing = appSettings.find(s => s.setting_key === 'invoice_automation');
      
      if (existing) {
        await platform.entities.AppSettings.update(existing.id, { settings });
      } else {
        await platform.entities.AppSettings.create({
          setting_key: 'invoice_automation',
          settings,
        });
      }

      toast.success('Invoice automation settings saved');
      onClose?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setSettings(prev => ({
      ...prev,
      reminder_days_before: prev.reminder_days_before.includes(day)
        ? prev.reminder_days_before.filter(d => d !== day)
        : [...prev.reminder_days_before, day].sort((a, b) => a - b)
    }));
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
              <h2 className="text-2xl font-bold text-gray-900">Invoice Automation</h2>
              <p className="text-sm text-gray-500 mt-1">Configure automatic payment reminders</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Enable Automated Reminders</h3>
                <p className="text-sm text-blue-700">Automatically send payment reminders to clients</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.send_reminders}
                onChange={(e) => setSettings({ ...settings, send_reminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Reminder Schedule */}
          {settings.send_reminders && (
            <>
              <div className="p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Reminder Schedule</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Send reminders before the invoice due date:</p>
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3, 5, 7, 14].map(days => (
                    <button
                      key={days}
                      onClick={() => toggleDay(days)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        settings.reminder_days_before.includes(days)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {days} day{days > 1 ? 's' : ''} before
                    </button>
                  ))}
                </div>
              </div>

              {/* Overdue Notices */}
              <div className="p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Overdue Notices</h3>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={settings.send_overdue_notices}
                    onChange={(e) => setSettings({ ...settings, send_overdue_notices: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Send reminders when invoices are overdue
                  </label>
                </div>
                {settings.send_overdue_notices && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Send every</span>
                    <select
                      value={settings.overdue_interval_days}
                      onChange={(e) => setSettings({ ...settings, overdue_interval_days: parseInt(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value={3}>3 days</option>
                      <option value={5}>5 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Communication Channels */}
              <div className="p-5 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Communication Channels</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.channels.email}
                      onChange={(e) => setSettings({ ...settings, channels: { ...settings.channels, email: e.target.checked } })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-500">Send reminders via email</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.channels.whatsapp}
                      onChange={(e) => setSettings({ ...settings, channels: { ...settings.channels, whatsapp: e.target.checked } })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-500">Send reminders via WhatsApp</p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Auto-send on Creation */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.auto_send_on_creation}
                onChange={(e) => setSettings({ ...settings, auto_send_on_creation: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Automatically send invoices immediately after creation
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