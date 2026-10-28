import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, Mail, Phone, MapPin, Hash, Banknote, Receipt, FileText, Loader2, Save, Upload, Send, PenTool } from 'lucide-react';

function Field({ label, icon: FieldIcon, children }) {
  const Icon = FieldIcon;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-2 py-3 border-b border-black/5 last:border-0">
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#1A1208] pt-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#B87333]" />}
        {label}
      </label>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

export default function CompanySettingsForm({ settings, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

  const handleTestEmail = async () => {
    const email = form.email;
    if (!email) { toast.error('Please enter a company email address first'); return; }
    setTestingEmail(true);
    try {
      const res = await platform.functions.invoke('sendBrandedEmail', {
        to: email,
        subject: 'Test Email — Creative Books SA Settings',
        htmlBody: `<h2>Test email confirmed ✓</h2><p>This is a test email from your Creative Books SA app. Email sending is working correctly.</p><p style="color:#888;font-size:13px;">Sent: ${new Date().toLocaleString('en-ZA')}</p>`,
        senderName: form.company_name || 'Creative Books SA',
        senderEmail: email,
      });
      if (res.data?.success) {
        toast.success(`Test email sent to ${email}`);
      } else {
        toast.error(res.data?.error || 'Test email failed');
      }
    } catch (e) {
      toast.error(e.message || 'Test email failed — check your Resend API key');
    } finally {
      setTestingEmail(false);
    }
  };

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await platform.integrations.Core.UploadFile({ file });
      set('logo_url', file_url);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSig(true);
    try {
      const { file_url } = await platform.integrations.Core.UploadFile({ file });
      set('admin_signature_url', file_url);
      toast.success('Signature uploaded');
    } catch {
      toast.error('Signature upload failed');
    } finally {
      setUploadingSig(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = { ...form, setting_key: 'main' };
      if (settings?.id) {
        await platform.entities.CompanySettings.update(settings.id, dataToSave);
      } else {
        await platform.entities.CompanySettings.create(dataToSave);
      }
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      toast.success('Company settings saved successfully');
      onSaved?.();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Identity */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Company Identity</h2>
        <p className="text-xs text-black/40 mb-5">Displayed on all documents, emails, and client communications</p>

        <Field label="Company Name" icon={Building2}>
          <Input value={form.company_name || ''} onChange={e => set('company_name', e.target.value)} placeholder="Creative Books SA" />
        </Field>

        <Field label="Logo" icon={Building2}>
          <div className="flex items-center gap-3">
            {form.logo_url && (
              <img src={form.logo_url} alt="Logo" className="h-12 w-auto rounded border border-gray-200 object-contain bg-gray-50 p-1" />
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#B87333] hover:text-[#B87333] transition-colors">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading…' : 'Upload Logo'}
              </span>
            </label>
          </div>
        </Field>

        <Field label="Physical Address" icon={MapPin}>
          <textarea
            value={form.physical_address || ''}
            onChange={e => set('physical_address', e.target.value)}
            placeholder="123 Main Street, Sandton, 2196"
            rows={2}
            className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </Field>

        <Field label="Email" icon={Mail}>
          <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="info@creativebooks.co.za" />
        </Field>

        <Field label="Phone" icon={Phone}>
          <Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+27 11 000 0000" />
        </Field>

        <Field label="VAT Reg. Number" icon={Hash}>
          <Input value={form.vat_number || ''} onChange={e => set('vat_number', e.target.value)} placeholder="4123456789" />
        </Field>
      </div>

      {/* Financial Defaults */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Financial Defaults</h2>
        <p className="text-xs text-black/40 mb-5">Applied automatically to all quotes, invoices, and receipts</p>

        <Field label="Currency" icon={Banknote}>
          <div className="flex items-center gap-3">
            <Input value={form.currency || 'ZAR'} readOnly className="w-24 bg-gray-50 text-gray-500" />
            <Input value={form.currency_symbol || 'R'} readOnly className="w-16 bg-gray-50 text-gray-500" />
            <span className="text-xs text-gray-400">South African Rand — locked to ZAR</span>
          </div>
        </Field>

        <Field label="Default VAT Rate" icon={Receipt}>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={form.default_vat_rate ?? 15}
              onChange={e => set('default_vat_rate', Number(e.target.value))}
              className="w-24"
              min={0} max={100} step={0.5}
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </Field>
      </div>

      {/* Bank Account 1 */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Primary Bank Account</h2>
        <p className="text-xs text-black/40 mb-5">First bank account printed on invoices and quotes</p>
        <Field label="Bank Name" icon={Banknote}>
          <Input value={form.bank_name || ''} onChange={e => set('bank_name', e.target.value)} placeholder="e.g. FNB, ABSA, Standard Bank" />
        </Field>
        <Field label="Account Name" icon={Banknote}>
          <Input value={form.bank_account_name || ''} onChange={e => set('bank_account_name', e.target.value)} placeholder="Creative Books SA (Pty) Ltd" />
        </Field>
        <Field label="Account Number" icon={Banknote}>
          <Input value={form.bank_account_number || ''} onChange={e => set('bank_account_number', e.target.value)} placeholder="62 000 000 00" />
        </Field>
        <Field label="Branch Code" icon={Banknote}>
          <Input value={form.bank_branch_code || ''} onChange={e => set('bank_branch_code', e.target.value)} placeholder="250655" />
        </Field>
      </div>

      {/* Bank Account 2 */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Secondary Bank Account</h2>
        <p className="text-xs text-black/40 mb-5">Optional second bank account (e.g. Nedbank, Capitec) — appended below the primary account on all documents</p>
        <Field label="Bank Name" icon={Banknote}>
          <Input value={form.bank_name_2 || ''} onChange={e => set('bank_name_2', e.target.value)} placeholder="e.g. Nedbank, Capitec" />
        </Field>
        <Field label="Account Name" icon={Banknote}>
          <Input value={form.bank_account_name_2 || ''} onChange={e => set('bank_account_name_2', e.target.value)} placeholder="Creative Books SA (Pty) Ltd" />
        </Field>
        <Field label="Account Number" icon={Banknote}>
          <Input value={form.bank_account_number_2 || ''} onChange={e => set('bank_account_number_2', e.target.value)} placeholder="11 222 333 44" />
        </Field>
        <Field label="Branch Code" icon={Banknote}>
          <Input value={form.bank_branch_code_2 || ''} onChange={e => set('bank_branch_code_2', e.target.value)} placeholder="198765" />
        </Field>
      </div>

      {/* Free-text banking override */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Banking Details Override (Optional)</h2>
        <p className="text-xs text-black/40 mb-5">If filled in, this free-text block will be used instead of the structured accounts above — useful for custom formatting</p>
        <Field label="Custom Block" icon={Banknote}>
          <textarea
            value={form.banking_details || ''}
            onChange={e => set('banking_details', e.target.value)}
            placeholder={"Leave blank to auto-build from structured accounts above.\n\nOr enter custom text e.g.:\nFNB: Acc 62 000 000 00 | Branch 250655\nNedbank: Acc 11 222 333 44 | Branch 198765"}
            rows={5}
            className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring font-mono"
          />
        </Field>
      </div>

      {/* Document Terms */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Terms & Conditions</h2>
        <p className="text-xs text-black/40 mb-5">Printed at the bottom of every document — quotes and invoices can have separate terms</p>

        <Field label="Quote Terms" icon={FileText}>
          <textarea
            value={form.quote_terms || ''}
            onChange={e => set('quote_terms', e.target.value)}
            placeholder="Quote valid for 30 days. Prices exclude VAT unless stated. 50% deposit required to confirm booking..."
            rows={4}
            className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </Field>

        <Field label="Invoice Terms" icon={FileText}>
          <textarea
            value={form.invoice_terms || ''}
            onChange={e => set('invoice_terms', e.target.value)}
            placeholder="Payment due within 7 days of invoice date. Late payments attract interest at 2% per month..."
            rows={4}
            className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </Field>

        <Field label="Signature Label" icon={FileText}>
          <Input value={form.signature_label || ''} onChange={e => set('signature_label', e.target.value)} placeholder="Authorized Signature" />
        </Field>

        <Field label="Authorized Signature" icon={PenTool}>
          <div className="flex items-center gap-3">
            {form.admin_signature_url && (
              <img src={form.admin_signature_url} alt="Signature" className="h-16 w-auto rounded border border-gray-200 bg-white p-2" />
            )}
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#B87333] hover:text-[#B87333] transition-colors">
                {uploadingSig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingSig ? 'Uploading…' : 'Upload Signature'}
              </span>
            </label>
            {form.admin_signature_url && (
              <button onClick={() => set('admin_signature_url', '')} className="text-xs text-red-600 hover:text-red-700 underline">Remove</button>
            )}
          </div>
        </Field>
      </div>

      {/* Document Footer */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Document Footer</h2>
        <p className="text-xs text-black/40 mb-5">Note printed at the bottom of all quotes, invoices, and receipts</p>

        <Field label="Footer Note" icon={FileText}>
          <textarea
            value={form.document_footer_note || ''}
            onChange={e => set('document_footer_note', e.target.value)}
            placeholder="Thank you for choosing Creative Books SA. All prices include VAT at 15%."
            rows={3}
            className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </Field>
      </div>

      {/* Email Test */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
        <h2 className="text-base font-bold text-[#1A1208] mb-1">Email Delivery</h2>
        <p className="text-xs text-black/40 mb-5">Send a test email to your company address to confirm email is working before sending to real clients</p>
        <div className="flex items-center gap-3">
          <Button onClick={handleTestEmail} disabled={testingEmail || !form.email} variant="outline" className="gap-2">
            {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {testingEmail ? 'Sending…' : 'Send Test Email'}
          </Button>
          <span className="text-xs text-gray-400">Sends to: {form.email || '(no email set)'}</span>
        </div>
      </div>

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}