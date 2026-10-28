import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Tag, Copy, CheckCheck, Upload, FileText, Download, Send, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'All', 'Confidentiality', 'Payment', 'Intellectual Property', 'Cancellation',
  'Approval', 'Revision Limits', 'Delivery', 'Liability', 'Dispute Resolution',
  'General', 'NDA', 'Supplier'
];

const TEMPLATE_CATEGORIES = [
  'All', 'NDA', 'Publishing Agreement', 'Book Cover Agreement', 'Editing Agreement',
  'Printing Agreement', 'Supplier Agreement', 'Freelancer Agreement', 'Payment Agreement',
  'Approval Form', 'Author Agreement', 'Legal Document', 'Internal Document', 'Other'
];

const CAT_COLORS = {
  'Confidentiality': 'bg-purple-100 text-purple-700',
  'Payment': 'bg-green-100 text-green-700',
  'Intellectual Property': 'bg-blue-100 text-blue-700',
  'Cancellation': 'bg-red-100 text-red-700',
  'Approval': 'bg-amber-100 text-amber-700',
  'Revision Limits': 'bg-orange-100 text-orange-700',
  'Delivery': 'bg-sky-100 text-sky-700',
  'Liability': 'bg-rose-100 text-rose-700',
  'Dispute Resolution': 'bg-indigo-100 text-indigo-700',
  'General': 'bg-gray-100 text-gray-600',
  'NDA': 'bg-violet-100 text-violet-700',
  'Supplier': 'bg-teal-100 text-teal-700',
  'Publishing Agreement': 'bg-blue-100 text-blue-700',
  'Book Cover Agreement': 'bg-pink-100 text-pink-700',
  'Editing Agreement': 'bg-cyan-100 text-cyan-700',
  'Printing Agreement': 'bg-orange-100 text-orange-700',
  'Freelancer Agreement': 'bg-lime-100 text-lime-700',
  'Payment Agreement': 'bg-green-100 text-green-700',
  'Approval Form': 'bg-amber-100 text-amber-700',
  'Author Agreement': 'bg-purple-100 text-purple-700',
  'Legal Document': 'bg-red-100 text-red-700',
  'Internal Document': 'bg-gray-100 text-gray-600',
  'Other': 'bg-gray-100 text-gray-500',
};

function ClauseModal({ clause, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: clause?.name || '',
    category: clause?.category || 'General',
    content: clause?.content || '',
    short_description: clause?.short_description || '',
    is_active: clause?.is_active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.content) { toast.error('Name and content are required.'); return; }
    setSaving(true);
    if (clause) await platform.entities.Clause.update(clause.id, form);
    else await platform.entities.Clause.create(form);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{clause ? 'Edit Clause' : 'New Clause'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Clause Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Confidentiality Clause" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Short Description</label>
            <Input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="One-line summary of what this clause does" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
              Clause Content *
              <span className="ml-2 font-normal text-gray-400 normal-case">Use {'{{client_name}}'}, {'{{book_title}}'}, {'{{project_value}}'} as merge fields</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y font-mono"
              placeholder="Enter the full clause text here..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active (available in Document Builder)</label>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? 'Saving...' : clause ? 'Update Clause' : 'Save Clause'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UploadTemplateModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ template_label: '', category: 'Other', notes: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !form.template_label) { toast.error('Please provide a name and file.'); return; }
    setUploading(true);
    const result = await platform.integrations.Core.UploadFile({ file });
    await platform.entities.Document.create({
      file_name: file.name,
      file_url: result.file_url,
      file_type: file.type,
      file_size_kb: Math.round(file.size / 1024),
      is_template: true,
      template_label: form.template_label,
      template_status: 'Active',
      category: form.category,
      notes: form.notes,
    });
    setUploading(false);
    toast.success('Template uploaded successfully');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Upload Document Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Template Name *</label>
            <Input value={form.template_label} onChange={e => setForm(f => ({ ...f, template_label: e.target.value }))} placeholder="e.g. Standard NDA 2025" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Document Type</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              {TEMPLATE_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Upload File *</label>
            <label className={`flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-[#B87333] bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} />
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">{file ? file.name : 'Upload PDF or Word document'}</span>
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Version notes, usage instructions..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleUpload} disabled={uploading || !file || !form.template_label} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</> : 'Upload Template'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminClauseLibrary() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('clauses');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { data: clauses = [], isLoading: loadingClauses } = useQuery({
    queryKey: ['clauses'],
    queryFn: () => platform.entities.Clause.list('name', 200),
  });

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => platform.entities.Document.filter({ is_template: true }),
  });

  const deleteClause = useMutation({
    mutationFn: (id) => platform.entities.Clause.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clauses'] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => platform.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['document-templates'] }),
  });

  const handleCopy = (clause) => {
    navigator.clipboard.writeText(clause.content);
    setCopiedId(clause.id);
    toast.success('Clause text copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredClauses = clauses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.content?.toLowerCase().includes(q) || c.short_description?.toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || c.category === catFilter;
    return matchSearch && matchCat;
  });

  const filteredTemplates = templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.template_label?.toLowerCase().includes(q) || t.file_name?.toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || t.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clause Library</h1>
            <p className="text-sm text-gray-500 mt-0.5">Reusable text clauses and uploadable document templates</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'clauses' ? (
              <Button onClick={() => { setEditing(null); setShowClauseModal(true); }} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
                <Plus className="w-4 h-4" /> Add Clause
              </Button>
            ) : (
              <Button onClick={() => setShowUploadModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
                <Upload className="w-4 h-4" /> Upload Template
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('clauses'); setCatFilter('All'); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'clauses' ? 'border-[#B87333] text-[#B87333]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Tag className="w-4 h-4 inline mr-1.5" />
            Text Clauses ({clauses.length})
          </button>
          <button
            onClick={() => { setActiveTab('templates'); setCatFilter('All'); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'templates' ? 'border-[#B87333] text-[#B87333]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            Document Templates ({templates.length})
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {(activeTab === 'clauses' ? CATEGORIES : TEMPLATE_CATEGORIES).map(cat => {
            const count = activeTab === 'clauses'
              ? clauses.filter(c => c.category === cat).length
              : templates.filter(t => t.category === cat).length;
            if (cat !== 'All' && count === 0) return null;
            return (
              <button key={cat} onClick={() => setCatFilter(cat === catFilter ? 'All' : cat)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${catFilter === cat ? 'bg-[#B87333] text-white border-[#B87333]' : `${CAT_COLORS[cat] || 'bg-gray-100 text-gray-600'} border-transparent`}`}>
                {cat} {cat !== 'All' && <span className="font-bold">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder={activeTab === 'clauses' ? 'Search clauses...' : 'Search templates...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* TEXT CLAUSES TAB */}
        {activeTab === 'clauses' && (
          <>
            {loadingClauses ? (
              <div className="text-center py-12 text-gray-400">Loading clauses...</div>
            ) : filteredClauses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No clauses yet</p>
                <p className="text-sm text-gray-400 mb-4">Build your clause library to create documents faster</p>
                <Button onClick={() => { setEditing(null); setShowClauseModal(true); }} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
                  <Plus className="w-4 h-4" /> Add First Clause
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredClauses.map(clause => (
                  <div key={clause.id} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{clause.name}</p>
                        {clause.short_description && <p className="text-xs text-gray-400 mt-0.5">{clause.short_description}</p>}
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0 ${CAT_COLORS[clause.category] || 'bg-gray-100 text-gray-600'}`}>
                        {clause.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-4 font-mono bg-gray-50 rounded-lg p-2.5 leading-relaxed">
                      {clause.content}
                    </p>
                    <div className="flex gap-2 mt-auto pt-1">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(clause)} className="flex-1 gap-1 text-xs">
                        {copiedId === clause.id ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copiedId === clause.id ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setEditing(clause); setShowClauseModal(true); }} className="gap-1 text-xs">
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this clause?')) deleteClause.mutate(clause.id); }} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* DOCUMENT TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <>
            {loadingTemplates ? (
              <div className="text-center py-12 text-gray-400">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No document templates yet</p>
                <p className="text-sm text-gray-400 mb-4">Upload NDAs, agreements, and reusable legal documents</p>
                <Button onClick={() => setShowUploadModal(true)} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
                  <Upload className="w-4 h-4" /> Upload First Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-[#B87333] flex-shrink-0" />
                          <p className="font-semibold text-gray-900 text-sm truncate">{template.template_label || template.file_name}</p>
                        </div>
                        <p className="text-xs text-gray-400">{template.file_name}</p>
                        {template.notes && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{template.notes}</p>}
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0 ${CAT_COLORS[template.category] || 'bg-gray-100 text-gray-600'}`}>
                        {template.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      <span>{template.file_size_kb ? `${template.file_size_kb} KB` : 'PDF/Word'}</span>
                      <span>·</span>
                      <span>{template.created_date ? new Date(template.created_date).toLocaleDateString('en-ZA') : ''}</span>
                    </div>
                    <div className="flex gap-2 mt-auto pt-1">
                      <a href={template.file_url} target="_blank" rel="noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                          <Download className="w-3 h-3" /> Download
                        </Button>
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this template?')) deleteTemplate.mutate(template.id); }} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showClauseModal && (
        <ClauseModal
          clause={editing}
          onClose={() => { setShowClauseModal(false); setEditing(null); }}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['clauses'] }); setShowClauseModal(false); setEditing(null); }}
        />
      )}

      {showUploadModal && (
        <UploadTemplateModal
          onClose={() => setShowUploadModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['document-templates'] }); setShowUploadModal(false); }}
        />
      )}
    </AdminLayout>
  );
}