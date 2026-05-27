import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderOpen, Download, Archive, Trash2, Send, RotateCcw, Activity, X, RefreshCw, Clock } from 'lucide-react';
import DocumentUploadModal from '@/components/admin/documents/DocumentUploadModal';
import DocumentActivityPanel from '@/components/admin/documents/DocumentActivityPanel';
import { toast } from 'sonner';

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
  'Opened': 'bg-sky-100 text-sky-700',
  'Viewed': 'bg-purple-100 text-purple-700',
  'Downloaded': 'bg-indigo-100 text-indigo-700',
  'Awaiting Signature': 'bg-yellow-100 text-yellow-700',
  'Signed': 'bg-green-100 text-green-700',
  'Awaiting Approval': 'bg-orange-100 text-orange-700',
  'Approved': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Changes Requested': 'bg-amber-100 text-amber-700',
  'Payment Proof Uploaded': 'bg-teal-100 text-teal-700',
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
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [sendingId, setSendingId] = useState(null);

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

  const handleSendDoc = async (doc) => {
    const contact = contactMap[doc.contact_id];
    if (!contact?.email) { toast.error('Contact has no email address.'); return; }
    if (!confirm(`Send "${doc.file_name}" to ${contact.email}?`)) return;
    setSendingId(doc.id);
    try {
      const res = await base44.functions.invoke('documentActions', { action: 'send', document_id: doc.id });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        toast.success(`✅ Sent to ${contact.email}`);
      } else { toast.error(res.data?.error || 'Failed to send.'); }
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to send.'); }
    finally { setSendingId(null); }
  };

  const handleResendDoc = async (doc) => {
    const contact = contactMap[doc.contact_id];
    if (!contact?.email) { toast.error('Contact has no email address.'); return; }
    if (!confirm(`Resend "${doc.file_name}" to ${contact.email}?`)) return;
    setSendingId(doc.id);
    try {
      const res = await base44.functions.invoke('documentActions', { action: 'resend', document_id: doc.id });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        toast.success(`✅ Resent to ${contact.email}`);
      } else { toast.error(res.data?.error || 'Failed to resend.'); }
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to resend.'); }
    finally { setSendingId(null); }
  };

  const handleExtendExpiry = async (doc) => {
    setSendingId(doc.id);
    try {
      const res = await base44.functions.invoke('documentActions', { action: 'extend_expiry', document_id: doc.id, days: 30 });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        toast.success('Expiry extended by 30 days.');
      }
    } catch (err) { toast.error('Failed to extend expiry.'); }
    finally { setSendingId(null); }
  };

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

  const needsActionCount = documents.filter(d =>
    ['Sent to Client', 'Awaiting Signature', 'Awaiting Approval', 'Changes Requested', 'Payment Proof Uploaded'].includes(d.status)
  ).length;

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
            { label: 'Needs Action', value: needsActionCount, color: 'text-orange-600' },
            { label: 'Approved / Signed', value: documents.filter(d => ['Approved','Signed'].includes(d.status)).length, color: 'text-green-600' },
            { label: 'Expired', value: documents.filter(d => d.status === 'Expired').length, color: 'text-red-600' },
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
          {needsActionCount > 0 && (
            <button onClick={() => setStatusFilter('')} className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs font-semibold text-orange-700">
              <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] flex items-center justify-center">{needsActionCount}</span>
              Needs Action
            </button>
          )}
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
                  {['File Name', 'Client', 'Category', 'Status', 'Activity', 'Version', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(doc => {
                  const contact = contactMap[doc.contact_id];
                  return (
                    <tr key={doc.id} className={`transition-colors cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`} onClick={() => setSelectedDoc(doc.id === selectedDoc?.id ? null : doc)}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[160px]">{doc.file_name}</p>
                        {doc.book_title && <p className="text-xs text-gray-400 truncate">{doc.book_title}</p>}
                        {!doc.is_latest_version && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 inline-block">Old version</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[doc.category] || 'bg-gray-100 text-gray-600'}`}>
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                            {doc.status}
                          </span>
                          {doc.expires_at && new Date(doc.expires_at) < new Date() && (
                            <div className="flex items-center gap-1 text-[10px] text-orange-500"><Clock className="w-3 h-3" /> Expired</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-400 space-y-0.5">
                          {doc.open_count > 0 && <div>👁 {doc.open_count} opens</div>}
                          {doc.download_count > 0 && <div>⬇ {doc.download_count} downloads</div>}
                          {doc.sent_at && <div>📤 {new Date(doc.sent_at).toLocaleDateString('en-ZA')}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">v{doc.version || 1}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {/* Send / Resend */}
                          {doc.status === 'Draft' && (
                            <Button variant="ghost" size="sm" title="Send to client" disabled={sendingId === doc.id}
                              onClick={() => handleSendDoc(doc)}>
                              {sendingId === doc.id ? <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" /> : <Send className="w-4 h-4 text-emerald-600" />}
                            </Button>
                          )}
                          {['Sent to Client','Opened','Viewed','Expired'].includes(doc.status) && (
                            <Button variant="ghost" size="sm" title="Resend" disabled={sendingId === doc.id}
                              onClick={() => handleResendDoc(doc)}>
                              {sendingId === doc.id ? <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /> : <RotateCcw className="w-4 h-4 text-blue-500" />}
                            </Button>
                          )}
                          {doc.status === 'Expired' && (
                            <Button variant="ghost" size="sm" title="Extend expiry 30 days" onClick={() => handleExtendExpiry(doc)}>
                              <RefreshCw className="w-4 h-4 text-orange-500" />
                            </Button>
                          )}
                          {/* Download */}
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" title="Download"><Download className="w-4 h-4" /></Button>
                            </a>
                          )}
                          {/* Activity */}
                          <Button variant="ghost" size="sm" title="Activity log" onClick={() => setSelectedDoc(doc.id === selectedDoc?.id ? null : doc)}>
                            <Activity className="w-4 h-4 text-purple-500" />
                          </Button>
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

      {/* Activity Panel Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedDoc(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-sm truncate max-w-[260px]">{selectedDoc.file_name}</h3>
                <p className="text-xs text-gray-500">Activity &amp; Audit Trail</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {/* Doc Info */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Status', value: selectedDoc.status },
                  { label: 'Version', value: `v${selectedDoc.version || 1}` },
                  { label: 'Opens', value: selectedDoc.open_count || 0 },
                  { label: 'Downloads', value: selectedDoc.download_count || 0 },
                  { label: 'Sent', value: selectedDoc.sent_at ? new Date(selectedDoc.sent_at).toLocaleDateString('en-ZA') : '—' },
                  { label: 'Expires', value: selectedDoc.expires_at ? new Date(selectedDoc.expires_at).toLocaleDateString('en-ZA') : '—' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              {selectedDoc.client_message && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Client Message</p>
                  <p className="text-xs text-amber-800">{selectedDoc.client_message}</p>
                </div>
              )}
              {selectedDoc.proof_url && (
                <div className="mb-4">
                  <a href={selectedDoc.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-700 hover:bg-teal-100">
                    <Download className="w-3.5 h-3.5" /> View Uploaded Proof / Signed Copy
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-semibold text-gray-700">Activity Timeline</h4>
              </div>
              <DocumentActivityPanel documentId={selectedDoc.id} />
            </div>
            <div className="p-4 border-t border-gray-100 space-y-2">
              {['Sent to Client','Opened','Viewed','Expired'].includes(selectedDoc.status) && (
                <Button size="sm" onClick={() => handleResendDoc(selectedDoc)} disabled={sendingId === selectedDoc.id}
                  className="w-full gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
                  <RotateCcw className="w-4 h-4" /> Resend Document
                </Button>
              )}
              {selectedDoc.status === 'Draft' && (
                <Button size="sm" onClick={() => handleSendDoc(selectedDoc)} disabled={sendingId === selectedDoc.id}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="w-4 h-4" /> Send to Client
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}