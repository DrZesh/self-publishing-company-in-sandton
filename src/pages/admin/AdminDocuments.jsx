import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderOpen, Download, Archive, Trash2, Eye } from 'lucide-react';
import DocumentUploadModal from '@/components/admin/documents/DocumentUploadModal';

const CATEGORY_COLORS = {
  'Signed Contract': 'bg-green-100 text-green-700',
  'Unsigned Contract': 'bg-yellow-100 text-yellow-700',
  'Quotation': 'bg-blue-100 text-blue-700',
  'Invoice': 'bg-purple-100 text-purple-700',
  'Payment Proof': 'bg-emerald-100 text-emerald-700',
  'Manuscript': 'bg-orange-100 text-orange-700',
  'Book Cover File': 'bg-pink-100 text-pink-700',
  'Typesetting File': 'bg-indigo-100 text-indigo-700',
  'Final Print File': 'bg-teal-100 text-teal-700',
  'Proof Approval': 'bg-lime-100 text-lime-700',
  'ISBN Document': 'bg-cyan-100 text-cyan-700',
  'Copyright Page': 'bg-slate-100 text-slate-700',
  'Printing Spec': 'bg-amber-100 text-amber-700',
  'Courier Document': 'bg-sky-100 text-sky-700',
  'Client Supplied': 'bg-gray-100 text-gray-700',
  'Internal Admin': 'bg-red-100 text-red-700',
};

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent to Client': 'bg-blue-100 text-blue-700',
  'Awaiting Signature': 'bg-yellow-100 text-yellow-700',
  'Signed': 'bg-green-100 text-green-700',
  'Approved': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Expired': 'bg-gray-200 text-gray-500',
  'Archived': 'bg-slate-100 text-slate-500',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);

export default function AdminDocuments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 500),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const archiveDoc = useMutation({
    mutationFn: (id) => base44.entities.Document.update(id, { status: 'Archived' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = documents.filter(d => {
    const q = search.toLowerCase();
    const contact = contactMap[d.contact_id];
    const matchSearch = !q || d.file_name?.toLowerCase().includes(q) || d.book_title?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q);
    const matchCat = !categoryFilter || d.category === categoryFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  // Category summary counts
  const categoryCounts = ALL_CATEGORIES.reduce((acc, c) => {
    acc[c] = documents.filter(d => d.category === c).length;
    return acc;
  }, {});

  const formatSize = (kb) => {
    if (!kb) return '—';
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-0.5">All client and project documents in one place</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> Upload Document
          </Button>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Documents', value: documents.length, color: 'text-gray-900' },
            { label: 'Awaiting Signature', value: documents.filter(d => d.status === 'Awaiting Signature').length, color: 'text-yellow-600' },
            { label: 'Approved', value: documents.filter(d => d.status === 'Approved').length, color: 'text-green-600' },
            { label: 'Manuscripts', value: categoryCounts['Manuscript'] || 0, color: 'text-orange-600' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c} {categoryCounts[c] > 0 ? `(${categoryCounts[c]})` : ''}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents found</p>
              <p className="text-sm text-gray-400 mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['File Name', 'Client', 'Category', 'Status', 'Version', 'Size', 'Uploaded', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(doc => {
                  const contact = contactMap[doc.contact_id];
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">{doc.file_name}</p>
                        {doc.book_title && <p className="text-xs text-gray-400 truncate">{doc.book_title}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[doc.category] || 'bg-gray-100 text-gray-600'}`}>
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">v{doc.version || 1}</td>
                      <td className="px-4 py-3 text-gray-500">{formatSize(doc.file_size_kb)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {doc.created_date ? new Date(doc.created_date).toLocaleDateString('en-ZA') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" title="Download"><Download className="w-4 h-4" /></Button>
                            </a>
                          )}
                          <Button variant="ghost" size="sm" title="Archive" onClick={() => archiveDoc.mutate(doc.id)}>
                            <Archive className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Delete" onClick={() => { if (window.confirm('Delete this document?')) deleteDoc.mutate(doc.id); }}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <DocumentUploadModal
          contacts={contacts}
          onClose={() => setShowModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['documents'] }); setShowModal(false); }}
        />
      )}
    </AdminLayout>
  );
}