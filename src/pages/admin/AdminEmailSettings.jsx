import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle, AlertTriangle, Send, Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';

const SETTING_KEY = 'email_settings';

export default function AdminEmailSettings() {
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email_provider: 'resend',
    sender_name: 'Creative Books SA',
    sender_email: 'info@creativebooks.co.za',
    reply_to: 'info@creativebooks.co.za',
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings', SETTING_KEY],
    queryFn: () => base44.entities.AppSettings.filter({ setting_key: SETTING_KEY }),
  });

  const existing = settings[0];

  useEffect(() => {
    if (existing) {
      setForm({
        email_provider: existing.email_provider || 'resend',
        sender_name: existing.sender_name || 'Creative Books SA',
        sender_email: existing.sender_email || 'info@creativebooks.co.za',
        reply_to: existing.reply_to || 'info@creativebooks.co.za',
      });
    }
  }, [existing]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const data = { setting_key: SETTING_KEY, ...form, is_configured: true };
    if (existing) await base44.entities.AppSettings.update(existing.id, data);
    else await base44.entities.AppSettings.create(data);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    toast.success('Email settings saved');
  };

  const handleTestEmail = async () => {
    if (!testEmail) { toast.error('Enter a test email address'); return; }
    setSending(true);
    const res = await base44.functions.invoke('sendBrandedEmail', {
      to: testEmail,
      subject: 'Test Email — Creative Books SA CRM',
      htmlBody: `
        <h2 style="color:#B87333;margin:0 0 16px;">Email Configuration Test ✓</h2>
        <p>This is a test email from your Creative Books SA CRM to confirm your email sending is working correctly.</p>
        <p><strong>Provider:</strong> ${form.email_provider === 'resend' ? 'Resend (recommended)' : 'Built-in'}</p>
        <p><strong>Sender Name:</strong> ${form.sender_name}</p>
        <p><strong>Sender Email:</strong> ${form.sender_email}</p>
        <p style="margin-top:24px;padding:16px;background:#f5f3ef;border-radius:8px;font-size:13px;color:#666;">
          If you received this email, your email configuration is working correctly.
        </p>
      `,
    });
    setSending(false);
    if (res.data?.success) toast.success(`Test email sent to ${testEmail} via ${res.data.provider}`);
    else toast.error(res.data?.error || 'Failed to send test email');
  };

  const isConfigured = existing?.is_configured;

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#B87333]" /> Email Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure outbound email for all CRM communications</p>
        </div>

        {/* Status */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${isConfigured ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          {isConfigured
            ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
          <div>
            <p className={`font-semibold text-sm ${isConfigured ? 'text-green-800' : 'text-amber-800'}`}>
              {isConfigured ? 'Email sending is configured' : 'Email sending is not configured'}
            </p>
            <p className={`text-xs mt-0.5 ${isConfigured ? 'text-green-600' : 'text-amber-700'}`}>
              {isConfigured
                ? `Using ${form.email_provider === 'resend' ? 'Resend' : 'Built-in'} · From: ${form.sender_name} <${form.sender_email}>`
                : 'Please complete Email Settings before activating email automations.'}
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Mail className="w-4 h-4 text-[#B87333]" /> Sending Configuration</h2>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Email Provider</label>
            <select value={form.email_provider} onChange={e => set('email_provider', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="resend">Resend (recommended — supports custom domain)</option>
              <option value="builtin">Built-in (quick start — limited deliverability)</option>
            </select>
            {form.email_provider === 'resend' && (
              <p className="text-xs text-gray-400 mt-1.5">
                RESEND_API_KEY must be set in App Secrets to use Resend.
                Set <code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code> in App Secrets to use Resend.
                For a verified domain add <code className="bg-gray-100 px-1 rounded">creativebooks.co.za</code> in your Resend dashboard.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Sender Name</label>
              <Input value={form.sender_name} onChange={e => set('sender_name', e.target.value)} placeholder="Creative Books SA" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Sender Email</label>
              <Input type="email" value={form.sender_email} onChange={e => set('sender_email', e.target.value)} placeholder="info@creativebooks.co.za" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Reply-To Email</label>
            <Input type="email" value={form.reply_to} onChange={e => set('reply_to', e.target.value)} placeholder="info@creativebooks.co.za" />
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Test Email */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Send className="w-4 h-4 text-[#B87333]" /> Send Test Email</h2>
          <p className="text-sm text-gray-500">Send a styled test email to confirm the pipe works end to end.</p>
          <div className="flex gap-3">
            <Input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1"
            />
            <Button onClick={handleTestEmail} disabled={sending} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white whitespace-nowrap">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
          <p className="text-xs text-gray-400">The test email uses the full Creative Books SA branded template with header, footer, and styling.</p>
        </div>

        {/* Branded shell info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">Single Branded Shell</p>
          <p className="text-xs text-blue-600">
            All outbound email — from automations, quotes, invoices, documents, and the client portal — is wrapped in the
            Creative Books SA branded template automatically. Templates only define inner content; the header, footer,
            logo, colours, and contact details are applied by the renderer so styling never drifts.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}