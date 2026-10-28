import { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Eye, Send } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'welcome','stage_update','payment','files','proof','approval',
  'printing','collection','delivery','completion','reminder','review','delay','general'
];

const VARIABLES = [
  '{{client_name}}','{{book_title}}','{{project_name}}','{{project_stage}}',
  '{{current_status}}','{{next_step}}','{{required_action}}','{{amount_due}}',
  '{{invoice_number}}','{{quote_number}}','{{document_link}}','{{approval_link}}',
  '{{invoice_link}}','{{payment_status}}','{{admin_name}}','{{company_name}}'
];

export default function TemplateModal({ template, onClose, onSaved }) {
  const isEdit = !!template?.id;
  const [form, setForm] = useState({
    name: '', channel: 'email', subject: '', content_html: '',
    category: 'general', is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (template) setForm({
      name: template.name || '',
      channel: template.channel || 'email',
      subject: template.subject || '',
      content_html: template.content_html || '',
      category: template.category || 'general',
      is_active: template.is_active !== false,
    });
  }, [template]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const insertVar = (v) => set('content_html', form.content_html + ' ' + v);

  const handleSave = async () => {
    if (!form.name || !form.content_html) { toast.error('Name and content are required'); return; }
    setSaving(true);
    if (isEdit) await platform.entities.MessageTemplate.update(template.id, form);
    else await platform.entities.MessageTemplate.create(form);
    setSaving(false);
    toast.success(isEdit ? 'Template updated' : 'Template created');
    onSaved();
    onClose();
  };

  const handlePreview = async () => {
    if (!template?.id) { toast.error('Save the template first to preview'); return; }
    setPreviewing(true);
    const res = await platform.functions.invoke('renderTemplate', { templateId: template.id, preview: true });
    setPreviewing(false);
    if (res.data?.rendered_body) { setPreviewHtml(res.data.rendered_body); setShowPreview(true); }
    else toast.error(res.data?.error || 'Preview failed');
  };

  const handleTestSend = async () => {
    if (!template?.id) { toast.error('Save the template first to test send'); return; }
    if (!testEmail) { toast.error('Enter a test email address'); return; }
    setTesting(true);
    const res = await platform.functions.invoke('renderTemplate', { templateId: template.id, preview: true, testSendTo: testEmail });
    setTesting(false);
    if (res.data?.success) toast.success(`Test email sent to ${testEmail}`);
    else toast.error(res.data?.error || 'Send failed');
  };

  if (showPreview) return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-auto p-6">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Email Preview</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>Close</Button>
        </div>
        <iframe srcDoc={previewHtml} className="w-full border-0" style={{ height: '75vh' }} title="Preview" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <h2 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit Template' : 'New Template'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Template Name *</label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Project Welcome" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Channel</label>
              <select value={form.channel} onChange={e => set('channel', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {form.channel === 'email' && (
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Subject Line</label>
                <Input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Your project has started, {{client_name}}!" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white capitalize">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-[#B87333]" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Content (inner HTML) *</label>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {VARIABLES.map(v => (
                <button key={v} onClick={() => insertVar(v)} className="text-xs px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded hover:bg-amber-100 font-mono">
                  {v}
                </button>
              ))}
            </div>
            <textarea
              value={form.content_html}
              onChange={e => set('content_html', e.target.value)}
              rows={10}
              placeholder="<p>Dear {{client_name}},</p><p>Your project has started...</p>"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-[#B87333]"
            />
            <p className="text-xs text-gray-400 mt-1">Inner content only — the branded header/footer shell is applied automatically at send time.</p>
          </div>

          {isEdit && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Test and Preview</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreview} disabled={previewing} className="gap-1">
                  {previewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />} Preview
                </Button>
              </div>
              <div className="flex gap-2">
                <Input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@email.com" className="flex-1 h-8 text-sm" />
                <Button size="sm" onClick={handleTestSend} disabled={testing} className="gap-1 bg-[#B87333] hover:bg-[#A06828] text-white">
                  {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Send Test
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>
    </div>
  );
}