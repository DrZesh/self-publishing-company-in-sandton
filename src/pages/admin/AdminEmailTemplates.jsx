import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Pencil, Trash2, X, Save, FileText, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['general', 'follow_up', 'quote', 'onboarding', 'invoice', 'marketing'];
const MERGE_FIELDS = ['{first_name}', '{full_name}', '{email}', '{book_title}', '{company}', '{quote_number}'];

const STARTER_TEMPLATES = [
  {
    name: 'Initial Follow-Up',
    category: 'follow_up',
    subject: 'Following up on your enquiry — Creative Books SA',
    body_html: `<p>Hi {first_name},</p><p>Thank you for reaching out to Creative Books SA! I wanted to follow up on your recent enquiry and see if you have any questions we can help answer.</p><p>We'd love to help you bring your book project to life. Would you be available for a quick call this week to discuss your project in more detail?</p><p>Looking forward to hearing from you!</p><p>Warm regards,<br>The Creative Books SA Team</p>`,
  },
  {
    name: 'Quote Follow-Up',
    category: 'quote',
    subject: 'Your quote from Creative Books SA — any questions?',
    body_html: `<p>Hi {first_name},</p><p>I hope this email finds you well. I wanted to check in to see if you've had a chance to review the quote we sent you for <strong>{book_title}</strong>.</p><p>If you have any questions about the pricing, services included, or would like to make any adjustments, please don't hesitate to reach out. We're happy to customise a package that works for you.</p><p>We look forward to working with you!</p><p>Warm regards,<br>The Creative Books SA Team</p>`,
  },
  {
    name: 'Welcome — New Client',
    category: 'onboarding',
    subject: 'Welcome to Creative Books SA, {first_name}!',
    body_html: `<p>Dear {first_name},</p><p>Welcome to Creative Books SA! We're thrilled to have you on board and are looking forward to working on <strong>{book_title}</strong> with you.</p><p>Here's what happens next:</p><ul><li>Our team will review your project details and be in touch within 24 hours</li><li>We'll schedule a kick-off call to align on timelines and deliverables</li><li>You'll receive a project brief to confirm all details before we begin</li></ul><p>If you have any immediate questions, reply directly to this email or call us on 010 500 3331.</p><p>Excited to get started!</p><p>The Creative Books SA Team</p>`,
  },
  {
    name: 'Manuscript Received',
    category: 'onboarding',
    subject: 'We\'ve received your manuscript — {book_title}',
    body_html: `<p>Hi {first_name},</p><p>Great news — we've received your manuscript for <strong>{book_title}</strong> and it's now in our system.</p><p>Our team will review the document over the next 1–2 business days and be in touch with any clarifying questions or next steps.</p><p>In the meantime, if you'd like to make any changes to the manuscript, please let us know as soon as possible so we can update our records before work begins.</p><p>Thank you for entrusting us with your book!</p><p>Warm regards,<br>Creative Books SA</p>`,
  },
  {
    name: 'Payment Reminder',
    category: 'invoice',
    subject: 'Friendly payment reminder — Creative Books SA',
    body_html: `<p>Hi {first_name},</p><p>I hope you're well. This is a gentle reminder that a payment for your project is due.</p><p>If you've already processed this payment, please disregard this email and accept our thanks. If you have any questions about the invoice or would like to arrange alternative payment, please don't hesitate to reply to this email.</p><p><strong>Banking Details:</strong><br>Bank: FNB<br>Account Name: Creative Books SA<br>Branch Code: 250655</p><p>Thank you for your continued support!</p><p>Creative Books SA</p>`,
  },
  {
    name: 'Project Complete',
    category: 'general',
    subject: 'Your project is complete — {book_title}',
    body_html: `<p>Dear {first_name},</p><p>Congratulations! We're pleased to let you know that work on <strong>{book_title}</strong> is now complete.</p><p>Please find the final files attached to this email. We'd love to hear your feedback on the final result.</p><p>It has been an absolute pleasure working with you. If you'd like to leave us a Google review, it would mean the world to our small team: <a href="https://www.google.com/search?q=creative+books+sa">Leave a Review</a></p><p>We hope to work with you again in the future!</p><p>Warm regards,<br>The Creative Books SA Team</p>`,
  },
  {
    name: 'No Response — Last Attempt',
    category: 'follow_up',
    subject: 'Last check-in from Creative Books SA',
    body_html: `<p>Hi {first_name},</p><p>I hope you're doing well. I've reached out a couple of times regarding your book project and haven't heard back — which is completely fine!</p><p>If you're still interested in publishing {book_title}, we'd love to pick up where we left off. If your plans have changed or you've gone in a different direction, no hard feelings at all.</p><p>Just reply to this email with a quick "yes" or "not now" and we'll take it from there.</p><p>Wishing you all the best!</p><p>Creative Books SA</p>`,
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
    if (editorRef.current && form.body_html) {
      editorRef.current.innerHTML = form.body_html;
    }
  }, []);

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const insertMerge = (field) => {
    document.execCommand('insertText', false, field);
    editorRef.current?.focus();
    setShowMerge(false);
  };

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
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Subject Line *</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" placeholder="Email subject (supports {merge_fields})" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wide">Body *</label>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  <button onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 hover:bg-black/8 rounded text-xs font-bold text-black/50">B</button>
                  <button onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 hover:bg-black/8 rounded italic text-xs text-black/50">I</button>
                  <button onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="p-1.5 hover:bg-black/8 rounded text-xs text-black/50">•</button>
                </div>
                <div className="relative">
                  <button onMouseDown={e => { e.preventDefault(); setShowMerge(!showMerge); }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#B87333]/10 text-[#B87333] rounded-lg text-xs font-semibold">
                    {'{}'} Merge Fields <ChevronDown className="w-3 h-3" />
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
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[200px] border border-black/15 rounded-xl p-4 text-sm outline-none focus:border-[#B87333] prose prose-sm max-w-none"
            />
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

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    base44.entities.EmailTemplate.list('-created_date', 100).then(data => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (data) => {
    if (editingTemplate?.id) {
      const updated = await base44.entities.EmailTemplate.update(editingTemplate.id, data);
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...data } : t));
      toast.success('Template updated');
    } else {
      const created = await base44.entities.EmailTemplate.create(data);
      setTemplates(prev => [created, ...prev]);
      toast.success('Template created');
    }
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    await base44.entities.EmailTemplate.delete(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted');
  };

  const handleSeedStarters = async () => {
    if (!confirm('This will create 7 starter templates. Continue?')) return;
    setSeeding(true);
    for (const tpl of STARTER_TEMPLATES) {
      const created = await base44.entities.EmailTemplate.create({ ...tpl, is_active: true });
      setTemplates(prev => [created, ...prev]);
    }
    setSeeding(false);
    toast.success('7 starter templates added!');
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = templates.filter(t => t.category === cat);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1208]">Email Templates</h1>
            <p className="text-sm text-black/50 mt-1">{templates.length} templates · Supports {'{'}merge fields{'}'}</p>
          </div>
          <div className="flex items-center gap-2">
            {templates.length === 0 && (
              <button onClick={handleSeedStarters} disabled={seeding}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#B87333]/40 text-[#B87333] rounded-xl text-sm font-semibold hover:bg-[#B87333]/5 disabled:opacity-50">
                {seeding ? 'Adding…' : '✨ Add Starter Templates'}
              </button>
            )}
            <button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428]">
              <Plus className="w-4 h-4" /> New Template
            </button>
          </div>
        </div>

        {/* Merge Fields reference */}
        <div className="bg-[#faf8f4] border border-[#B87333]/20 rounded-2xl p-4 mb-6">
          <div className="text-xs font-bold text-[#B87333] uppercase tracking-wide mb-2">Available Merge Fields</div>
          <div className="flex flex-wrap gap-2">
            {MERGE_FIELDS.map(f => (
              <code key={f} className="px-2.5 py-1 bg-white border border-[#B87333]/20 rounded-lg text-xs text-[#B87333] font-mono">{f}</code>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-black/5 rounded-2xl animate-pulse" />)}</div>
        ) : templates.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 text-black/15 mx-auto mb-3" />
            <p className="text-sm font-semibold text-black/40">No templates yet</p>
            <button onClick={handleSeedStarters} disabled={seeding} className="mt-3 text-[#B87333] text-sm font-semibold hover:underline">
              {seeding ? 'Adding starter templates…' : 'Add 7 starter templates →'}
            </button>
          </div>
        ) : (
          CATEGORIES.map(cat => {
            if (!grouped[cat]?.length) return null;
            return (
              <div key={cat} className="mb-8">
                <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-black/20" />{cat.replace(/_/g, ' ')} ({grouped[cat].length})
                </h2>
                <div className="grid gap-3">
                  {grouped[cat].map(t => (
                    <div key={t.id} className={`bg-white rounded-2xl border p-4 flex items-start justify-between gap-4 ${t.is_active ? 'border-black/8' : 'border-black/5 opacity-60'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#1A1208] text-sm">{t.name}</span>
                          {!t.is_active && <span className="text-xs bg-black/5 text-black/40 px-2 py-0.5 rounded-full">Inactive</span>}
                        </div>
                        <div className="text-xs text-black/50 truncate">{t.subject}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => { setEditingTemplate(t); setShowEditor(true); }}
                          className="p-2 hover:bg-black/5 rounded-lg"><Pencil className="w-4 h-4 text-black/40" /></button>
                        <button onClick={() => handleDelete(t.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
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