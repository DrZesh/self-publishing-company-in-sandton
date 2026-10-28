import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import jsPDF from 'jspdf';
import {
  FileText, Download, Save, Send, Plus, ChevronDown, ChevronRight,
  Sparkles, Tag, User, BookOpen, DollarSign, PenLine, X, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const MERGE_FIELDS = [
  { label: 'Client Name', value: '{{client_name}}' },
  { label: 'Client Email', value: '{{client_email}}' },
  { label: 'Book Title', value: '{{book_title}}' },
  { label: 'Project Value', value: '{{project_value}}' },
  { label: 'Today Date', value: '{{today_date}}' },
  { label: 'Expiry Date', value: '{{expiry_date}}' },
  { label: 'Company Name', value: '{{company_name}}' },
  { label: 'Service Type', value: '{{service_type}}' },
  { label: 'Signer Name', value: '{{signer_name}}' },
];

const SIGNATURE_BLOCK = `
<br/><br/>
<table width="100%" style="border-top:1px solid #ccc; padding-top:16px; margin-top:24px;">
  <tr>
    <td width="50%" style="padding-right:20px;">
      <p style="font-size:12px; color:#555; margin:0;">Signed by Client:</p>
      <br/>
      <div style="border-bottom:1px solid #333; height:40px; margin-bottom:8px;"></div>
      <p style="font-size:11px; color:#777; margin:0;">Name: ________________________</p>
      <p style="font-size:11px; color:#777; margin:0;">Date: ________________________</p>
    </td>
    <td width="50%">
      <p style="font-size:12px; color:#555; margin:0;">Signed by Creative Books SA:</p>
      <br/>
      <div style="border-bottom:1px solid #333; height:40px; margin-bottom:8px;"></div>
      <p style="font-size:11px; color:#777; margin:0;">Name: ________________________</p>
      <p style="font-size:11px; color:#777; margin:0;">Date: ________________________</p>
    </td>
  </tr>
</table>`;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['clean'],
  ],
};

function ClausePanel({ clauses, onInsert, catFilter, setCatFilter }) {
  const categories = ['All', ...new Set(clauses.map(c => c.category))];
  const filtered = catFilter === 'All' ? clauses : clauses.filter(c => c.category === catFilter);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter by category</p>
        <div className="flex flex-wrap gap-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${catFilter === c ? 'bg-[#B87333] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.filter(c => c.is_active).map(clause => (
          <div key={clause.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-[#B87333]/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-gray-800">{clause.name}</p>
              <Button size="sm" variant="outline" onClick={() => onInsert(clause.content)}
                className="text-[10px] h-6 px-2 flex-shrink-0 border-[#B87333] text-[#B87333] hover:bg-orange-50">
                Insert
              </Button>
            </div>
            {clause.short_description && <p className="text-[10px] text-gray-500">{clause.short_description}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No clauses in this category</p>}
      </div>
    </div>
  );
}

export default function AdminDocumentBuilder() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('NDA');
  const [contactId, setContactId] = useState('');
  const [content, setContent] = useState('');
  const [sidePanel, setSidePanel] = useState('clauses'); // 'clauses' | 'merge' | 'signature'
  const [clauseCatFilter, setClauseCatFilter] = useState('All');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const quillRef = useRef(null);

  const { data: clauses = [] } = useQuery({
    queryKey: ['clauses'],
    queryFn: () => platform.entities.Clause.list('name', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const selectedContact = contacts.find(c => c.id === contactId);

  const insertAtCursor = (text) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range ? range.index : editor.getLength();
    editor.insertText(index, '\n\n' + text + '\n\n');
    toast.success('Inserted into document');
  };

  const insertMergeField = (field) => {
    insertAtCursor(field);
  };

  const insertSignatureBlock = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range ? range.index : editor.getLength();
    editor.clipboard.dangerouslyPasteHTML(index, SIGNATURE_BLOCK);
    toast.success('Signature block inserted');
  };

  const resolveContent = (raw) => {
    if (!selectedContact) return raw;
    return raw
      .replace(/{{client_name}}/g, selectedContact.full_name || '')
      .replace(/{{client_email}}/g, selectedContact.email || '')
      .replace(/{{book_title}}/g, selectedContact.book_title || '')
      .replace(/{{company_name}}/g, selectedContact.company || '')
      .replace(/{{today_date}}/g, new Date().toLocaleDateString('en-ZA'))
      .replace(/{{expiry_date}}/g, new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-ZA'));
  };

  const handleExportPDF = async () => {
    if (!content || !title) { toast.error('Add a title and content first.'); return; }
    setExporting(true);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const margin = 20;
    const usable = pageWidth - margin * 2;

    // Header
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(184, 115, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CREATIVE BOOKS SA', margin, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('Professional Publishing Services', margin, 20);

    // Title
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, margin, 50);
    doc.line(margin, 54, pageWidth - margin, 54);

    // Body text (strip HTML tags)
    const plainText = resolveContent(content)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(plainText, usable);
    let y = 62;
    lines.forEach(line => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5.5;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(`Creative Books SA — ${title}`, margin, 290);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 290);
    }

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    setExporting(false);
    toast.success('PDF exported!');
  };

  const handleSaveToLibrary = async () => {
    if (!title) { toast.error('Add a document title first.'); return; }
    setSaving(true);
    const blob = new Blob([content], { type: 'text/html' });
    const file = new File([blob], `${title}.html`, { type: 'text/html' });
    const { file_url } = await platform.integrations.Core.UploadFile({ file });
    await platform.entities.Document.create({
      file_name: title,
      file_url,
      file_type: 'text/html',
      category,
      contact_id: contactId || undefined,
      is_template: !contactId,
      template_label: !contactId ? title : undefined,
      status: 'Draft',
      uploaded_by: (await platform.auth.me())?.email || '',
    });
    setSaving(false);
    toast.success('Saved to Document Library!');
  };

  const handleAIAssist = async () => {
    if (!title) { toast.error('Add a document title first so the AI knows what to generate.'); return; }
    setAiGenerating(true);
    const result = await platform.integrations.Core.InvokeLLM({
      prompt: `Generate professional legal/business document content for a self-publishing company called Creative Books SA in South Africa. Document type: "${title}". ${category ? `Category: ${category}.` : ''} ${selectedContact ? `Client name: ${selectedContact.full_name}. Book title: ${selectedContact.book_title || 'TBD'}.` : 'Use {{client_name}} and {{book_title}} as merge fields.'}\n\nWrite the full document body text in a professional format. Include relevant sections, numbered clauses, and proper structure. Keep it practical and legally sensible but note this is not legal advice. Output plain text paragraphs only, no markdown.`,
    });
    setContent(prev => prev + `\n\n${result}`);
    setAiGenerating(false);
    toast.success('AI content added!');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-88px)]">
        {/* Toolbar */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Document title e.g. NDA — John Smith..."
              className="font-semibold text-base"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            {['NDA', 'Publishing Agreement', 'Unsigned Contract', 'Proof Approval', 'Payment Agreement', 'Supplier Agreement', 'Internal Admin'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={contactId} onChange={e => setContactId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">No client (template)</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.book_title ? ` — ${c.book_title}` : ''}</option>)}
          </select>
          <Button variant="outline" onClick={handleAIAssist} disabled={aiGenerating} className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
            {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Assist
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </Button>
          <Button onClick={handleSaveToLibrary} disabled={saving} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save to Library
          </Button>
        </div>

        {/* Main editor area */}
        <div className="flex flex-1 gap-4 pt-4 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-xl bg-white">
            <div className="flex-1 overflow-y-auto">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                placeholder="Start typing your document, or use AI Assist / Clause Library to build it..."
                className="h-full"
                style={{ height: 'calc(100% - 42px)' }}
              />
            </div>
          </div>

          {/* Right panel */}
          <div className="w-72 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
            {/* Panel tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { key: 'clauses', label: 'Clauses', icon: Tag },
                { key: 'merge', label: 'Fields', icon: User },
                { key: 'signature', label: 'Sign', icon: PenLine },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSidePanel(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${sidePanel === tab.key ? 'text-[#B87333] border-b-2 border-[#B87333]' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {sidePanel === 'clauses' && (
              <ClausePanel
                clauses={clauses}
                onInsert={insertAtCursor}
                catFilter={clauseCatFilter}
                setCatFilter={setClauseCatFilter}
              />
            )}

            {sidePanel === 'merge' && (
              <div className="p-4 space-y-2 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-3">Click a field to insert it at cursor position. Fields auto-fill with client data when a contact is selected.</p>
                {MERGE_FIELDS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => insertMergeField(f.value)}
                    className="w-full text-left flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-orange-50 hover:border-orange-200 border border-gray-100 transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-700">{f.label}</span>
                    <code className="text-[10px] text-[#B87333] bg-orange-50 px-1.5 py-0.5 rounded">{f.value}</code>
                  </button>
                ))}
                {selectedContact && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Auto-fill preview</p>
                    <p className="text-[10px] text-blue-600">{selectedContact.full_name}</p>
                    <p className="text-[10px] text-blue-600">{selectedContact.email}</p>
                    {selectedContact.book_title && <p className="text-[10px] text-blue-600">{selectedContact.book_title}</p>}
                  </div>
                )}
              </div>
            )}

            {sidePanel === 'signature' && (
              <div className="p-4 space-y-3 overflow-y-auto">
                <p className="text-xs text-gray-500">Insert signature blocks and form fields into your document.</p>
                <Button variant="outline" onClick={insertSignatureBlock} className="w-full gap-2 text-sm">
                  <PenLine className="w-4 h-4" /> Insert Dual Signature Block
                </Button>
                <Button variant="outline" onClick={() => insertAtCursor('[SIGNATURE: Client]')} className="w-full gap-2 text-sm">
                  Insert Client Signature
                </Button>
                <Button variant="outline" onClick={() => insertAtCursor('[INITIALS: ______]')} className="w-full gap-2 text-sm">
                  Insert Initials Field
                </Button>
                <Button variant="outline" onClick={() => insertAtCursor('[DATE SIGNED: ______]')} className="w-full gap-2 text-sm">
                  Insert Date Field
                </Button>
                <Button variant="outline" onClick={() => insertAtCursor('[ID NUMBER: ______]')} className="w-full gap-2 text-sm">
                  Insert ID Number Field
                </Button>
                <Button variant="outline" onClick={() => insertAtCursor('☐ I agree to the terms and conditions above')} className="w-full gap-2 text-sm">
                  Insert Checkbox Confirmation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}