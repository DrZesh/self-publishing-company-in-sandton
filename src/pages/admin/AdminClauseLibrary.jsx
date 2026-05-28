import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Tag, Copy, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'All', 'Confidentiality', 'Payment', 'Intellectual Property', 'Cancellation',
  'Approval', 'Revision Limits', 'Delivery', 'Liability', 'Dispute Resolution',
  'General', 'NDA', 'Supplier'
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
    if (clause) await base44.entities.Clause.update(clause.id, form);
    else await base44.entities.Clause.create(form);
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

export default function AdminClauseLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { data: clauses = [], isLoading } = useQuery({
    queryKey: ['clauses'],
    queryFn: () => base44.entities.Clause.list('name', 200),
  });

  const deleteClause = useMutation({
    mutationFn: (id) => base44.entities.Clause.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clauses'] }),
  });

  const handleCopy = (clause) => {
    navigator.clipboard.writeText(clause.content);
    setCopiedId(clause.id);
    toast.success('Clause text copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = clauses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.content?.toLowerCase().includes(q) || c.short_description?.toLowerCase().includes(q);
    const matchCat = catFilter === 'All' || c.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clause Library</h1>
            <p className="text-sm text-gray-500 mt-0.5">Reusable contract clauses for NDAs, agreements, and documents</p>
          </div>
          <Button onClick={() => { setEditing(null); setShowModal(true); }} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> Add Clause
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          {CATEGORIES.filter(c => c !== 'All').map(cat => {
            const count = clauses.filter(c => c.category === cat).length;
            if (count === 0) return null;
            return (
              <button key={cat} onClick={() => setCatFilter(cat === catFilter ? 'All' : cat)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${catFilter === cat ? 'bg-[#B87333] text-white border-[#B87333]' : `${CAT_COLORS[cat] || 'bg-gray-100 text-gray-600'} border-transparent`}`}>
                {cat} <span className="font-bold">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search clauses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading clauses...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No clauses yet</p>
            <p className="text-sm text-gray-400 mb-4">Build your clause library to create documents faster</p>
            <Button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
              <Plus className="w-4 h-4" /> Add First Clause
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(clause => (
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
                  <Button variant="outline" size="sm" onClick={() => { setEditing(clause); setShowModal(true); }} className="gap-1 text-xs">
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
      </div>

      {showModal && (
        <ClauseModal
          clause={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['clauses'] }); setShowModal(false); setEditing(null); }}
        />
      )}
    </AdminLayout>
  );
}