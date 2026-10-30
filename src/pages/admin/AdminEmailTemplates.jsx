import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Pencil, Trash2, X, Save, FileText, ChevronDown, Eye } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['general', 'follow_up', 'quote', 'onboarding', 'invoice', 'marketing'];
const CATEGORY_LABELS = { general: 'General', follow_up: 'Follow-Up', quote: 'Quote', onboarding: 'Onboarding', invoice: 'Invoice', marketing: 'Marketing' };
const MERGE_FIELDS = ['{first_name}', '{full_name}', '{email}', '{book_title}', '{company}', '{quote_number}'];

const STARTER_TEMPLATES = [
  {
    name: 'Initial Follow-Up', category: 'follow_up',
    subject: 'Following up on your enquiry — Creative Books SA',
    body_html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)"><div style="background:linear-gradient(135deg,#1A1208,#2C1E0F);padding:40px 32px;text-align:center"><h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700">Creative Books SA</h1><p style="margin:10px 0 0;color:rgba(255,255,255,.5);font-size:13px">Professional Publishing Services</p></div><div style="padding:40px 32px"><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Hi {first_name},</p><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Thank you for reaching out to Creative Books SA! I wanted to follow up on your recent enquiry and see if you have any questions we can help answer.</p><p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6">We'd love to help you bring your book project to life. Would you be available for a quick call this week?</p><p style="margin:0;color:#888;font-size:14px">Warm regards,<br><strong style="color:#1A1208">The Creative Books SA Team</strong></p></div></div>`,
  },
  {
    name: 'Quote Follow-Up', category: 'quote',
    subject: 'Your quote from Creative Books SA — any questions?',
    body_html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)"><div style="background:linear-gradient(135deg,#1A1208,#2C1E0F);padding:40px 32px;text-align:center"><h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700">Creative Books SA</h1></div><div style="padding:40px 32px"><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Hi {first_name},</p><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">I wanted to check in to see if you've had a chance to review the quote we sent you for <strong style="color:#1A1208">{book_title}</strong>.</p><p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6">If you have any questions about pricing or services, please don't hesitate to reach out.</p><p style="margin:0;color:#888;font-size:14px">Warm regards,<br><strong style="color:#1A1208">The Creative Books SA Team</strong></p></div></div>`,
  },
  {
    name: 'Welcome — New Client', category: 'onboarding',
    subject: 'Welcome to Creative Books SA, {first_name}!',
    body_html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)"><div style="background:linear-gradient(135deg,#1A1208,#2C1E0F);padding:40px 32px;text-align:center"><h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700">Welcome Aboard!</h1></div><div style="padding:40px 32px"><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Dear {first_name},</p><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Welcome to Creative Books SA! We're thrilled to have you on board and look forward to working on <strong style="color:#1A1208">{book_title}</strong> with you.</p><div style="background:#faf8f4;border-left:3px solid #B87333;border-radius:12px;padding:24px;margin:24px 0"><p style="margin:0 0 16px;color:#B87333;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">What Happens Next</p><ol style="margin:0;padding-left:20px;color:#555;font-size:15px;line-height:1.8"><li>Our team will review your project details within 24 hours</li><li>We'll schedule a kick-off call to align on timelines</li><li>You'll receive a project brief before we begin</li></ol></div><p style="margin:0;color:#888;font-size:14px"><strong style="color:#1A1208">The Creative Books SA Team</strong></p></div></div>`,
  },
  {
    name: 'Manuscript Received', category: 'onboarding',
    subject: "We've received your manuscript — {book_title}",
    body_html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden"><div style="background:linear-gradient(135deg,#1A1208,#2C1E0F);padding:40px 32px;text-align:center"><h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700">Manuscript Received ✓</h1></div><div style="padding:40px 32px"><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Hi {first_name},</p><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Great news — we've received your manuscript for <strong style="color:#1A1208">{book_title}</strong> and it's now in our system.</p><p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6">Our team will review it over the next 1–2 business days and be in touch with next steps.</p><p style="margin:0;color:#888;font-size:14px"><strong style="color:#1A1208">Creative Books SA</strong></p></div></div>`,
  },
  {
    name: 'Payment Reminder', category: 'invoice',
    subject: 'Friendly payment reminder — Creative Books SA',
    body_html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden"><div style="background:linear-gradient(135deg,#1A1208,#2C1E0F);padding:40px 32px;text-align:center"><h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700">Payment Reminder</h1></div><div style="padding:40px 32px"><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Hi {first_name},</p><p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6">This is a gentle reminder that a payment for your project is due.</p><div style="background:#faf8f4;border:1px solid rgba(184,115,51,.15);border-radius:12px;padding:24px;margin:24px 0"><p style="margin:0 0 12px;color:#B87333;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Banking Details</p><p style="margin:0;color:#555;font-size:15px;line-height:1.8"><strong>Bank:</strong> FNB<br><strong>Account Name:</strong> Creative Books SA<br><strong>Branch Code:</strong> 250655</p></div><p style="margin:0;color:#888;font-size:14px"><strong style="color:#1A1208">Creative Books SA</strong></p></div></div>`,
  },
  {
    name: 'Project Complete', category: 'general',
    subject: 'Your project is complete — {book_title}',
    body_html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden"><div style="background:linear-gradient(135deg,#1A1208,#2C1E0F);padding:40px 32px;text-align:center"><h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700">🎉 Project Complete!</h1></div><div style="padding:40px 32px"><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Dear {first_name},</p><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Congratulations! Work on <strong style="color:#1A1208">{book_title}</strong> is now complete.</p><p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6">We'd love to hear your feedback. A Google review would mean the world to our team!</p><p style="margin:0;color:#888;font-size:14px">Warm regards,<br><strong style="color:#1A1208">The Creative Books SA Team</strong></p></div></div>`,
  },
  {
    name: 'No Response — Last Attempt', category: 'follow_up',
    subject: 'Last check-in from Creative Books SA',
    body_html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden"><div style="background:linear-gradient(135deg,#1A1208,#2C1E0F);padding:40px 32px;text-align:center"><h1 style="margin:0;color:#B87333;font-size:26px;font-weight:700">Quick Check-In</h1></div><div style="padding:40px 32px"><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">Hi {first_name},</p><p style="margin:0 0 20px;color:#555;font-size:16px;line-height:1.6">I've reached out a couple of times regarding your book project and haven't heard back — which is completely fine!</p><p style="margin:0 0 24px;color:#555;font-size:16px;line-height:1.6">If you're still interested in publishing <strong style="color:#1A1208">{book_title}</strong>, we'd love to pick up where we left off. Just reply with a quick "yes" or "not now".</p><p style="margin:0;color:#888;font-size:14px"><strong style="color:#1A1208">Creative Books SA</strong></p></div></div>`,
  },
];

function TemplateEditor({ template, onClose, onSave }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    category: template?.category || 'general',
    subject: template?.subject || '',
    body_html: template?.body_html || '',
    is_active: template?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);
  const [showMerge, setShowMerge] = useState(false);

  useEffect(() => {
    if (editorRef.current && form.body_html) editorRef.current.innerHTML = form.body_html;
  }, []);

  const execCmd = (cmd, value = null) => { document.execCommand(cmd, false, value); editorRef.current?.focus(); };
  const insertMerge = (field) => { document.execCommand('insertText', false, field); editorRef.current?.focus(); setShowMerge(false); };

  const handleSave = async () => {
    if (!form.name || !form.subject) { toast.error('Name and subject are required'); return; }
    setSaving(true);
    const body_html = editorRef.current?.innerHTML || '';
    await onSave({ ...form, body_html });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
          <h2 className="text-lg font-bold text-[#1A1208]">{template ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Template Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="e.g. Quote Follow-Up" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Subject Line *</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Email subject" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wide">Body *</label>
              <div className="flex items-center gap-1">
                <button onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 hover:bg-black/8 rounded text-xs font-bold text-black/50">B</button>
                <button onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 hover:bg-black/8 rounded italic text-xs text-black/50">I</button>
                <button onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="p-1.5 hover:bg-black/8 rounded text-xs text-black/50">•</button>
                <div className="relative">
                  <button onMouseDown={e => { e.preventDefault(); setShowMerge(!showMerge); }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#B87333]/10 text-[#B87333] rounded-lg text-xs font-semibold">
                    {'{}'} Merge <ChevronDown className="w-3 h-3" />
                  </button>
                  {showMerge && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-black/10 rounded-xl shadow-xl z-10 min-w-[160px]">
                      {MERGE_FIELDS.map(f => (
                        <button key={f} onMouseDown={e => { e.preventDefault(); insertMerge(f); }}
                          className="w-full text-left px-3 py-2 text-xs font-mono text-[#B87333] hover:bg-[#faf8f4] border-b border-black/5 last:border-0">{f}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div ref={editorRef} contentEditable suppressContentEditableWarning
              className="min-h-[200px] border border-black/15 rounded-xl p-4 text-sm outline-none focus:border-[#B87333] prose prose-sm max-w-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
            <label htmlFor="active" className="text-sm text-black/60">Active (available in compose)</label>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-black/8 shrink-0">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 bg-[#B87333] text-white rounded-xl font-semibold text-sm hover:bg-[#a06428] disabled:opacity-50 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Template'}
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-black/15 text-black/60 rounded-xl font-semibold text-sm hover:bg-black/5">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ template, onEdit, onDelete, onClose }) {
  return (
    <div className="w-full lg:w-[460px] border-l border-gray-200 bg-white flex flex-col h-full shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{template.name}</p>
          <span className="text-xs text-gray-400">{CATEGORY_LABELS[template.category]}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-200 rounded-lg" title="Edit">
            <Pencil className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-400">Subject:</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{template.subject}</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          srcDoc={template.body_html}
          title="Email preview"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
      <div className="border-t border-gray-200 px-5 py-3 flex gap-2">
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#B87333] text-white rounded-lg text-xs font-semibold hover:bg-[#a06428] transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Edit Template
        </button>
        <button onClick={() => onDelete(template.id)}
          className="flex items-center gap-1.5 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-xs font-semibold transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => {
    platform.entities.EmailTemplate.list('-created_date', 100).then(data => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (data) => {
    if (editingTemplate?.id) {
      await platform.entities.EmailTemplate.update(editingTemplate.id, data);
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...data } : t));
      if (selectedTemplate?.id === editingTemplate.id) setSelectedTemplate(prev => ({ ...prev, ...data }));
      toast.success('Template updated');
    } else {
      const created = await platform.entities.EmailTemplate.create(data);
      setTemplates(prev => [created, ...prev]);
      toast.success('Template created');
    }
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    await platform.entities.EmailTemplate.delete(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) setSelectedTemplate(null);
    toast.success('Template deleted');
  };

  const handleSeedStarters = async () => {
    if (!confirm('This will create 7 starter templates. Continue?')) return;
    setSeeding(true);
    for (const tpl of STARTER_TEMPLATES) {
      const created = await platform.entities.EmailTemplate.create({ ...tpl, is_active: true });
      setTemplates(prev => [created, ...prev]);
    }
    setSeeding(false);
    toast.success('7 starter templates added!');
  };

  const filtered = catFilter === 'all' ? templates : templates.filter(t => t.category === catFilter);

  return (
    <AdminLayout>
      <div className="flex h-full gap-0">
        {/* List panel */}
        <div className={`flex-1 min-w-0 overflow-y-auto ${selectedTemplate ? 'hidden lg:block' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                <Link className="text-sm text-[#B87333] underline" to="/admin/billing/templates">Edit production workflow emails</Link>
                <p className="text-sm text-gray-500 mt-0.5">{templates.length} templates · Click to preview</p>
              </div>
              <div className="flex items-center gap-2">
                {templates.length === 0 && (
                  <button onClick={handleSeedStarters} disabled={seeding}
                    className="flex items-center gap-2 px-4 py-2 border border-[#B87333]/40 text-[#B87333] rounded-lg text-sm font-semibold hover:bg-[#B87333]/5 disabled:opacity-50">
                    {seeding ? 'Adding…' : '✨ Starter Templates'}
                  </button>
                )}
                <button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B87333] text-white rounded-lg text-sm font-semibold hover:bg-[#a06428]">
                  <Plus className="w-4 h-4" /> New
                </button>
              </div>
            </div>

            {/* Merge fields */}
            <div className="bg-amber-50 border border-[#B87333]/20 rounded-xl p-3 mb-5">
              <p className="text-xs font-bold text-[#B87333] uppercase tracking-wide mb-2">Merge Fields</p>
              <div className="flex flex-wrap gap-1.5">
                {MERGE_FIELDS.map(f => (
                  <code key={f} className="px-2 py-0.5 bg-white border border-[#B87333]/20 rounded text-xs text-[#B87333] font-mono">{f}</code>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-5">
              <button onClick={() => setCatFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${catFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B87333]'}`}>
                All ({templates.length})
              </button>
              {CATEGORIES.map(c => {
                const count = templates.filter(t => t.category === c).length;
                if (!count) return null;
                return (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${catFilter === c ? 'bg-[#B87333] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B87333]'}`}>
                    {CATEGORY_LABELS[c]} ({count})
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border border-gray-200">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No templates yet</p>
                <button onClick={handleSeedStarters} disabled={seeding} className="mt-3 text-[#B87333] text-sm font-semibold hover:underline">
                  {seeding ? 'Adding…' : 'Add 7 starter templates →'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(t => {
                  const isSelected = selectedTemplate?.id === t.id;
                  return (
                    <div key={t.id}
                      onClick={() => setSelectedTemplate(isSelected ? null : t)}
                      className={`bg-white rounded-xl border p-4 flex items-start justify-between gap-4 cursor-pointer transition-all ${isSelected ? 'border-[#B87333] shadow-sm bg-amber-50/30' : t.is_active ? 'border-gray-200 hover:border-[#B87333]/40' : 'border-gray-100 opacity-60'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{CATEGORY_LABELS[t.category]}</span>
                          {!t.is_active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{t.subject}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedTemplate(t)} title="Preview"
                          className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-400" /></button>
                        <button onClick={() => { setEditingTemplate(t); setShowEditor(true); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-400" /></button>
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        {selectedTemplate && (
          <TemplatePreview
            template={selectedTemplate}
            onEdit={() => { setEditingTemplate(selectedTemplate); setShowEditor(true); }}
            onDelete={handleDelete}
            onClose={() => setSelectedTemplate(null)}
          />
        )}
      </div>

      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => { setShowEditor(false); setEditingTemplate(null); }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}