import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { platform } from '@/api/platformClient';
import { Settings, MessageSquare, Mail, Clock, Shield, TestTube, CheckCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_SETTINGS = {
  wa_test_number: '',
  email_test_address: '',
  email_sender_name: 'Creative Books SA',
  quiet_hours_enabled: true,
  quiet_start: '08:00',
  quiet_end: '17:00',
  quiet_days: [1, 2, 3, 4, 5],
  retry_attempts: 2,
  retry_delay_minutes: 30,
  max_reminders: 3,
  admin_notify_new_lead: true,
  admin_notify_quote_accepted: true,
  admin_notify_payment_proof: true,
  admin_notify_contract_signed: true,
  admin_notify_automation_failed: true,
  do_not_contact_check: true,
  marketing_consent_required: true,
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COMPLIANCE_ITEMS = [
  { key: 'do_not_contact_check', label: 'Skip contacts marked as Do Not Contact' },
  { key: 'marketing_consent_required', label: 'Require marketing consent for promotional messages' },
  { key: 'admin_notify_new_lead', label: 'Notify admin when new lead arrives' },
  { key: 'admin_notify_quote_accepted', label: 'Notify admin when quote is accepted' },
  { key: 'admin_notify_payment_proof', label: 'Notify admin when payment proof is uploaded' },
  { key: 'admin_notify_contract_signed', label: 'Notify admin when contract is signed' },
  { key: 'admin_notify_automation_failed', label: 'Notify admin when automation fails' },
];

const RETRY_FIELDS = [
  { label: 'Retry Attempts', key: 'retry_attempts', min: 0, max: 5 },
  { label: 'Retry Delay (min)', key: 'retry_delay_minutes', min: 5, max: 120 },
  { label: 'Max Reminders', key: 'max_reminders', min: 1, max: 10 },
];

export default function AutomationSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_automation_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [testingWA, setTestingWA] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = () => {
    localStorage.setItem('crm_automation_settings', JSON.stringify(settings));
    toast.success('Settings saved!');
  };

  const toggleDay = (day) => {
    const days = settings.quiet_days.includes(day)
      ? settings.quiet_days.filter(d => d !== day)
      : [...settings.quiet_days, day];
    set('quiet_days', days);
  };

  const handleTestWA = async () => {
    if (!settings.wa_test_number) { toast.error('Enter a test WhatsApp number first'); return; }
    setTestingWA(true);
    const res = await platform.functions.invoke('sendWhatsAppNotification', {
      to_number: settings.wa_test_number,
      message: 'This is a test message from Creative Books SA CRM Automation. Your WhatsApp integration is working correctly!',
      type: 'Test',
    });
    setTestingWA(false);
    if (res.data?.success) toast.success('Test WhatsApp sent successfully!');
    else toast.error(res.data?.error || 'Failed to send test message');
  };

  const handleTestEmail = async () => {
    if (!settings.email_test_address) { toast.error('Enter a test email address first'); return; }
    setTestingEmail(true);
    const res = await platform.functions.invoke('sendContactEmail', {
      to: settings.email_test_address,
      subject: 'Creative Books SA — Automation Test Email',
      body: '<p>This is a test email from the Creative Books SA CRM Automation system. Your email integration is working correctly!</p>',
      contact_name: 'Test Recipient',
    });
    setTestingEmail(false);
    if (res.data?.success) toast.success('Test email sent successfully!');
    else toast.error(res.data?.error || 'Failed to send test email');
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* WhatsApp */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp Settings (CallMeBot / Twilio)
        </h3>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Test WhatsApp Number</label>
          <div className="flex gap-2">
            <Input
              value={settings.wa_test_number}
              onChange={e => { set('wa_test_number', e.target.value); localStorage.setItem('wa_test_number', e.target.value); }}
              placeholder="+27821234567"
              className="flex-1"
            />
            <Button onClick={handleTestWA} disabled={testingWA} variant="outline" className="gap-2 border-green-200 text-green-700 hover:bg-green-50 whitespace-nowrap">
              <TestTube className="w-4 h-4" /> {testingWA ? 'Sending...' : 'Test Now'}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Must be a WhatsApp-enabled number in international format</p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700">CallMeBot Connected</p>
            <p className="text-xs text-green-600">API key configured via environment secrets</p>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" /> Email Settings (Resend)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Sender Name</label>
            <Input value={settings.email_sender_name} onChange={e => set('email_sender_name', e.target.value)} placeholder="Creative Books SA" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Test Email Address</label>
            <div className="flex gap-2">
              <Input value={settings.email_test_address} onChange={e => set('email_test_address', e.target.value)} placeholder="test@example.com" className="flex-1" />
              <Button onClick={handleTestEmail} disabled={testingEmail} variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 whitespace-nowrap">
                <TestTube className="w-4 h-4" /> {testingEmail ? 'Sending...' : 'Test'}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-700">Resend Email Connected</p>
            <p className="text-xs text-blue-600">RESEND_API_KEY configured via environment secrets</p>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" /> Quiet Hours
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.quiet_hours_enabled} onChange={e => set('quiet_hours_enabled', e.target.checked)} className="w-4 h-4" />
            <span className="text-sm text-gray-700">Enable</span>
          </label>
        </div>
        {settings.quiet_hours_enabled && (
          <div className="space-y-3">
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Send From</label>
                <input type="time" value={settings.quiet_start} onChange={e => set('quiet_start', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Send Until</label>
                <input type="time" value={settings.quiet_end} onChange={e => set('quiet_end', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Active Days</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${settings.quiet_days.includes(i) ? 'bg-[#B87333] text-white border-[#B87333]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Retry Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" /> Retry and Reminder Settings
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {RETRY_FIELDS.map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">{f.label}</label>
              <input
                type="number"
                min={f.min}
                max={f.max}
                value={settings[f.key]}
                onChange={e => set(f.key, parseInt(e.target.value) || f.min)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Compliance */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" /> Compliance and Consent (POPIA)
        </h3>
        {COMPLIANCE_ITEMS.map(item => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
            <input
              type="checkbox"
              checked={settings[item.key]}
              onChange={e => set(item.key, e.target.checked)}
              className="w-4 h-4 accent-[#B87333]"
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>

      <Button onClick={handleSave} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white w-full sm:w-auto">
        <Save className="w-4 h-4" /> Save Settings
      </Button>
    </div>
  );
}