import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  Plus, Search, FolderOpen, Download, Archive, Trash2, Send, RotateCcw,
  Activity, X, RefreshCw, Clock, Zap, Star, Shield, FileText,
  Lock, BookOpen, Layers, Tag, Sparkles, Ban, Edit2
} from 'lucide-react';
import DocumentUploadModal from '@/components/admin/documents/DocumentUploadModal';
import DocumentActivityPanel from '@/components/admin/documents/DocumentActivityPanel';
import QuickSendModal from '@/components/admin/documents/QuickSendModal';
import DocumentInbox from '@/components/admin/documents/DocumentInbox';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  'Signed Contract': 'bg-green-100 text-green-700',
  'Unsigned Contract': 'bg-yellow-100 text-yellow-700',
  'NDA': 'bg-purple-100 text-purple-700',
  'Publishing Agreement': 'bg-blue-100 text-blue-700',
  'Quotation': 'bg-blue-100 text-blue-700',
  'Invoice': 'bg-violet-100 text-violet-700',
  'Payment Proof': 'bg-emerald-100 text-emerald-700',
  'Payment Agreement': 'bg-teal-100 text-teal-700',
  'Manuscript': 'bg-orange-100 text-orange-700',
  'Manuscript Submission Form': 'bg-orange-100 text-orange-700',
  'Book Cover File': 'bg-pink-100 text-pink-700',
  'Cover Design Brief': 'bg-rose-100 text-rose-700',
  'Typesetting File': 'bg-indigo-100 text-indigo-700',
  'Final Print File': 'bg-teal-100 text-teal-700',
  'Proof Approval': 'bg-lime-100 text-lime-700',
  'ISBN Document': 'bg-cyan-100 text-cyan-700',
  'Copyright Page': 'bg-slate-100 text-slate-700',
  'Printing Spec': 'bg-amber-100 text-amber-700',
  'Printing Terms': 'bg-amber-100 text-amber-700',
  'Supplier Agreement': 'bg-sky-100 text-sky-700',
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

const TABS = [
  { key: 'inbox', label: 'Inbox', icon: FileText },
  { key: 'all', label: 'All Documents', icon: Layers },
  { key: 'templates', label: 'Template Library', icon: BookOpen },
  { key: 'sent', label: 'Sent to Clients', icon: Send },
  { key: 'vault', label: 'Signed Vault', icon: Lock },
];

const SENT_STATUSES = ['Sent to Client', 'Opened', 'Viewed', 'Downloaded', 'Awaiting Signature', 'Awaiting Approval', 'Changes Requested', 'Payment Proof Uploaded', 'Expired'];
const VAULT_STATUSES = ['Signed', 'Approved'];

function getTabDocs(docs, tab) {
  switch (tab) {
    case 'inbox': return docs.filter(d => !d.is_template && d.status !== 'Archived');
    case 'templates': return docs.filter(d => d.is_template);
    case 'sent': return docs.filter(d => !d.is_template && d.contact_id && SENT_STATUSES.includes(d.status));
    case 'vault': return docs.filter(d => VAULT_STATUSES.includes(d.status));
    default: return docs.filter(d => d.status !== 'Archived' && !d.is_template);
  }
}

export default function AdminDocuments() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [signatureFilter, setSignatureFilter] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [templateStatusFilter, setTemplateStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [showQuickSend, setShowQuickSend] = useState(false);
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

  const updateDoc = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const archiveDoc = useMutation({
    mutationFn: (id) => base44.entities.Document.update(id, { status: 'Archived' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document archived.');
    },
  });

  const deleteDoc = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted.');
    },
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const handleSendDoc = async (doc) => {
    const contact = contactMap[doc.contact_id];
    if (!contact?.email) { toast.error('Contact has no email address.'); return; }
    if (!window.confirm(`Send "${doc.file_name}" to ${contact.email}?`)) return;
    setSendingId(doc.id);
    try {
      const res = await base44.functions.invoke('documentActions', { action: 'send', document_id: doc.id });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        toast.success(`Sent to ${contact.email}`);
      } else {
        toast.error(res.data?.error || 'Failed to send.');
      }
    } catch (e) {
      toast.error('Failed to send: ' + (e?.message || 'Unknown error'));
    } finally {
      setSendingId(null);
    }
  };

  const handleResendDoc = async (doc) => {
    const contact = contactMap[doc.contact_id];
    if (!contact?.email) { toast.error('Contact has no email address.'); return; }
    setSendingId(doc.id);
    try {
      const res = await base44.functions.invoke('documentActions', { action: 'resend', document_id: doc.id });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        toast.success(`Resent to ${contact.email}`);
      } else {
        toast.error(res.data?.error || 'Failed to resend.');
      }
    } catch (e) {
      toast.error('Failed to resend: ' + (e?.message || 'Unknown error'));
    } finally {
      setSendingId(null);
    }
  };

  const handleExtendExpiry = async (doc) => {
    setSendingId(doc.id);
    try {
      const res = await base44.functions.invoke('documentActions', { action: 'extend_expiry', document_id: doc.id, days: 30 });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        toast.success('Expiry extended by 30 days.');
      } else {
        toast.error(res.data?.error || 'Failed to extend.');
      }
    } catch (e) {
      toast.error('Failed to extend expiry.');
    } finally {
      setSendingId(null);
    }
  };

  const toggleFavourite = (doc) => {
    updateDoc.mutate({ id: doc.id, data: { is_favourite: !doc.is_favourite } });
    toast.success(doc.is_favourite ? 'Unpinned' : 'Pinned template');
  };

  const handleRevokeAccess = (doc) => {
    if (!window.confirm(`Revoke access to "${doc.template_label || doc.file_name}"? The recipient will no longer be able to open this link.`)) return;
    updateDoc.mutate({ id: doc.id, data: { access_revoked: true, access_revoked_at: new Date().toISOString(), status: 'Archived' } });
    toast.success('Document access revoked.');
  };

  const handleOpenModal = (doc = null) => {
    setEditingDoc(doc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDoc(null);
  };

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    handleCloseModal();
    toast.success(editingDoc ? 'Document updated.' : 'Document uploaded.');
  };

  const switchTab = (key) => {
    setActiveTab(key);
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setSignatureFilter('');
    setLabelFilter('');
    setTemplateStatusFilter('');
  };

  const tabDocs = getTabDocs(documents, activeTab);

  const filtered = tabDocs.filter(d => {
    const q = search.toLowerCase();
    const contact = contactMap[d.contact_id];
    const matchSearch = !q || d.file_name?.toLowerCase().includes(q) || d.book_title?.toLowerCase().includes(q) || d.template_label?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q);
    const matchCat = !categoryFilter || d.category === categoryFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    const matchSig = !signatureFilter || (signatureFilter === 'yes' ? d.requires_signature : !d.requires_signature);
    const matchLabel = !labelFilter || (d.labels || []).includes(labelFilter);
    const matchTplStatus = !templateStatusFilter || d.template_status === templateStatusFilter;
    return matchSearch && matchCat && matchStatus && matchSig && matchLabel && matchTplStatus;
  });

  const templates = documents.filter(d => d.is_template);
  const favouriteTemplates = templates.filter(d => d.is_favourite);
  const isVaultLocked = activeTab === 'vault';

  const stats = {
    total: documents.filter(d => !d.is_template && d.status !== 'Archived').length,
    awaitingSignature: documents.filter(d => d.status === 'Awaiting Signature').length,
    signed: documents.filter(d => VAULT_STATUSES.includes(d.status)).length,
    expired: documents.filter(d => d.status === 'Expired').length,
    sent: documents.filter(d => SENT_STATUSES.includes(d.status)).length,
    templates: templates.length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Command Centre</h1>
            <p className="text-sm text-gray-500 mt-0.5">Templates, client documents, sent history &amp; signed vault</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <RouterLink to="/admin/document-builder">
              <Button variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                <FileText className="w-4 h-4" /> Document Builder
              </Button>
            </RouterLink>
            <RouterLink to="/admin/clause-library">
              <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                <BookOpen className="w-4 h-4" /> Clause Library
              </Button>
            </RouterLink>
            <Button
              onClick={() => setShowQuickSend(true)}
              variant="outline"
              className="gap-2 border-[#B87333] text-[#B87333] hover:bg-orange-50"
            >
              <Zap className="w-4 h-4" /> Quick Send
            </Button>
            <Button
              onClick={() => handleOpenModal(null)}
              className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white"
            >
              <Plus className="w-4 h-4" /> Upload Document
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Total Docs', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Templates', value: stats.templates, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Sent', value: stats.sent, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Awaiting Sig', value: stats.awaitingSignature, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Signed', value: stats.signed, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Expired', value: stats.expired, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(card => (
            <div key={card.label} className={`${card.bg} rounded-xl border border-gray-100 p-3`}>
              <p className="text-xs text-gray-500 leading-tight">{card.label}</p>
              <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Pinned Templates */}
        {favouriteTemplates.length > 0 && activeTab !== 'vault' && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Pinned Templates
            </p>
            <div className="flex flex-wrap gap-2">
              {favouriteTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedDoc(t)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                >
                  <FileText className="w-3 h-3 text-amber-600" />
                  {t.template_label || t.file_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const tabCount = getTabDocs(documents, tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.key ? 'bg-[#B87333]/10 text-[#B87333]' : 'bg-gray-200 text-gray-500'}`}>
                  {tabCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── INBOX TAB ── */}
        {activeTab === 'inbox' && (
          <DocumentInbox contacts={contacts} />
        )}

        {/* ── ALL OTHER TABS ── */}
        {activeTab !== 'inbox' && (
          <>
            {/* Vault notice */}
            {isVaultLocked && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Signed Document Vault</p>
                  <p className="text-xs text-emerald-600">These documents are signed or approved and protected from deletion.</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search by name, client, book title..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">All Types</option>
                {[...new Set(tabDocs.map(d => d.category))].filter(Boolean).sort().map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {activeTab !== 'templates' && (
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">All Statuses</option>
                  {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              <select value={signatureFilter} onChange={e => setSignatureFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Signature: Any</option>
                <option value="yes">Requires Signature</option>
                <option value="no">No Signature Required</option>
              </select>
              {activeTab === 'templates' && (
                <select value={templateStatusFilter} onChange={e => setTemplateStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">All Statuses</option>
                  {['Draft Template', 'Pending Approval', 'Active', 'Archived Template'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              <select value={labelFilter} onChange={e => setLabelFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">All Labels</option>
                {['Legal', 'Finance', 'Client-Facing', 'Internal', 'Supplier', 'Urgent', 'Confidential', 'Requires Action'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {(search || categoryFilter || statusFilter || signatureFilter || labelFilter || templateStatusFilter) && (
                <button onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); setSignatureFilter(''); setLabelFilter(''); setTemplateStatusFilter(''); }} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Template empty state */}
            {activeTab === 'templates' && filtered.length === 0 && !isLoading && (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Templates Yet</h3>
                <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
                  Upload reusable documents like NDAs, Publishing Agreements, and Proof Approval Forms.
                </p>
                <Button onClick={() => handleOpenModal(null)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
                  <Plus className="w-4 h-4" /> Upload Template
                </Button>
              </div>
            )}

            {/* Documents Table */}
            {(activeTab !== 'templates' || filtered.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {isLoading ? (
                  <div className="p-12 text-center text-gray-400">Loading documents...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-12 text-center">
                    <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No documents found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Document', 'Client', 'Type', 'Status', 'Activity', 'Actions'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map(doc => {
                          const contact = contactMap[doc.contact_id];
                          const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();
                          const isVaultDoc = VAULT_STATUSES.includes(doc.status);
                          return (
                            <tr
                              key={doc.id}
                              className={`transition-colors cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                              onClick={() => setSelectedDoc(doc.id === selectedDoc?.id ? null : doc)}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {doc.is_template && (
                                    <button onClick={e => { e.stopPropagation(); toggleFavourite(doc); }} className="flex-shrink-0" title={doc.is_favourite ? 'Unpin' : 'Pin'}>
                                      <Star className={`w-4 h-4 ${doc.is_favourite ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-400'}`} />
                                    </button>
                                  )}
                                  {isVaultDoc && <Lock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                                  {doc.requires_signature && !isVaultDoc && <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{doc.template_label || doc.file_name}</p>
                                    {doc.book_title && <p className="text-xs text-gray-400 truncate">{doc.book_title}</p>}
                                    {!doc.is_latest_version && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 inline-block">Old version</span>}
                                    {doc.is_template && doc.template_status && (
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-0.5 inline-block font-medium ${
                                        doc.template_status === 'Active' ? 'bg-green-100 text-green-700' :
                                        doc.template_status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700' :
                                        doc.template_status === 'Archived Template' ? 'bg-gray-200 text-gray-500' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>{doc.template_status}</span>
                                    )}
                                    {(doc.labels || []).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {doc.labels.slice(0, 2).map(l => (
                                          <span key={l} className="text-[10px] bg-orange-50 text-[#B87333] border border-orange-100 px-1.5 py-0.5 rounded-full">{l}</span>
                                        ))}
                                        {doc.labels.length > 2 && <span className="text-[10px] text-gray-400">+{doc.labels.length - 2}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {contact ? (
                                  <Link to={`/admin/contacts/detail?id=${doc.contact_id}`} className="text-gray-600 text-sm hover:text-[#B87333] hover:underline" onClick={e => e.stopPropagation()}>
                                    {contact.full_name}
                                  </Link>
                                ) : doc.is_template ? (
                                  <span className="text-xs text-purple-500 font-medium">Reusable Template</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[doc.category] || 'bg-gray-100 text-gray-600'}`}>
                                  {doc.category}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {doc.is_template ? (
                                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Template</span>
                                ) : (
                                  <div className="space-y-1">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                                      {doc.status}
                                    </span>
                                    {isExpired && <div className="flex items-center gap-1 text-[10px] text-orange-500"><Clock className="w-3 h-3" /> Link expired</div>}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-xs text-gray-400 space-y-0.5">
                                  {doc.open_count > 0 && <div>👁 {doc.open_count} opens</div>}
                                  {doc.download_count > 0 && <div>⬇ {doc.download_count} downloads</div>}
                                  {doc.sent_at && <div>📤 {new Date(doc.sent_at).toLocaleDateString('en-ZA')}</div>}
                                  {doc.signed_at && <div className="text-green-600">✅ {new Date(doc.signed_at).toLocaleDateString('en-ZA')}</div>}
                                </div>
                              </td>
                              <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {/* Edit */}
                                  <Button variant="ghost" size="sm" title="Edit document" onClick={() => handleOpenModal(doc)}>
                                    <Edit2 className="w-4 h-4 text-gray-500" />
                                  </Button>

                                  {/* Quick Send (templates) */}
                                  {doc.is_template && (
                                    <Button variant="ghost" size="sm" title="Quick Send this template" onClick={() => setShowQuickSend(true)}>
                                      <Zap className="w-4 h-4 text-[#B87333]" />
                                    </Button>
                                  )}

                                  {/* Send (draft docs with contact) */}
                                  {!doc.is_template && doc.status === 'Draft' && doc.contact_id && (
                                    <Button variant="ghost" size="sm" title="Send to client" disabled={sendingId === doc.id} onClick={() => handleSendDoc(doc)}>
                                      {sendingId === doc.id
                                        ? <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                                        : <Send className="w-4 h-4 text-emerald-600" />}
                                    </Button>
                                  )}

                                  {/* Resend */}
                                  {!doc.is_template && ['Sent to Client', 'Opened', 'Viewed', 'Expired'].includes(doc.status) && (
                                    <Button variant="ghost" size="sm" title="Resend" disabled={sendingId === doc.id} onClick={() => handleResendDoc(doc)}>
                                      {sendingId === doc.id
                                        ? <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                        : <RotateCcw className="w-4 h-4 text-blue-500" />}
                                    </Button>
                                  )}

                                  {/* Extend expiry */}
                                  {doc.status === 'Expired' && (
                                    <Button variant="ghost" size="sm" title="Extend expiry 30 days" disabled={sendingId === doc.id} onClick={() => handleExtendExpiry(doc)}>
                                      <RefreshCw className="w-4 h-4 text-orange-500" />
                                    </Button>
                                  )}

                                  {/* Download */}
                                  {doc.file_url && (
                                    <a href={doc.file_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                                      <Button variant="ghost" size="sm" title="Download"><Download className="w-4 h-4" /></Button>
                                    </a>
                                  )}

                                  {/* Activity */}
                                  <Button variant="ghost" size="sm" title="Activity log" onClick={() => setSelectedDoc(doc.id === selectedDoc?.id ? null : doc)}>
                                    <Activity className="w-4 h-4 text-purple-500" />
                                  </Button>

                                  {/* Revoke */}
                                  {!isVaultDoc && !doc.access_revoked && !doc.is_template && ['Sent to Client', 'Opened', 'Viewed'].includes(doc.status) && (
                                    <Button variant="ghost" size="sm" title="Revoke access" onClick={() => handleRevokeAccess(doc)}>
                                      <Ban className="w-4 h-4 text-red-400" />
                                    </Button>
                                  )}

                                  {/* Archive + Delete (not vault docs) */}
                                  {!isVaultDoc && (
                                    <>
                                      <Button variant="ghost" size="sm" title="Archive" onClick={() => { if (window.confirm('Archive this document?')) archiveDoc.mutate(doc.id); }}>
                                        <Archive className="w-4 h-4 text-gray-400" />
                                      </Button>
                                      <Button variant="ghost" size="sm" title="Delete" onClick={() => { if (window.confirm('Permanently delete this document?')) deleteDoc.mutate(doc.id); }}>
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload / Edit Modal */}
      {showModal && (
        <DocumentUploadModal
          contacts={contacts}
          document={editingDoc}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}

      {/* Quick Send */}
      {showQuickSend && (
        <QuickSendModal
          templates={templates}
          contacts={contacts}
          onClose={() => setShowQuickSend(false)}
          onSent={() => { queryClient.invalidateQueries({ queryKey: ['documents'] }); setShowQuickSend(false); toast.success('Document sent!'); }}
        />
      )}

      {/* Activity Panel Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedDoc(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-sm truncate max-w-[260px]">{selectedDoc.template_label || selectedDoc.file_name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[selectedDoc.category] || 'bg-gray-100 text-gray-600'}`}>
                    {selectedDoc.category}
                  </span>
                  {selectedDoc.is_template && <span className="text-[10px] text-purple-600 font-semibold">TEMPLATE</span>}
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Status', value: selectedDoc.is_template ? 'Template' : selectedDoc.status },
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
              {selectedDoc.requires_signature && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg mb-4">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-700">Signature required on this document</span>
                </div>
              )}
              {selectedDoc.access_revoked && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <Ban className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-red-700">Access revoked — recipient can no longer open this link</span>
                </div>
              )}
              {selectedDoc.ai_summary && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Summary</p>
                  <p className="text-xs text-purple-800 leading-relaxed">{selectedDoc.ai_summary}</p>
                </div>
              )}
              {(selectedDoc.labels || []).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Labels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.labels.map(l => (
                      <span key={l} className="text-[11px] bg-orange-50 text-[#B87333] border border-orange-100 px-2 py-0.5 rounded-full font-medium">{l}</span>
                    ))}
                  </div>
                </div>
              )}
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
              {selectedDoc.notes && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Notes</p>
                  <p className="text-xs text-gray-600">{selectedDoc.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-semibold text-gray-700">Activity Timeline</h4>
              </div>
              <DocumentActivityPanel documentId={selectedDoc.id} />
            </div>
            <div className="p-4 border-t border-gray-100 space-y-2">
              <Button size="sm" variant="outline" onClick={() => { handleOpenModal(selectedDoc); setSelectedDoc(null); }} className="w-full gap-2">
                <Edit2 className="w-4 h-4" /> Edit Document
              </Button>
              {selectedDoc.is_template && (
                <Button size="sm" onClick={() => { setShowQuickSend(true); setSelectedDoc(null); }} className="w-full gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
                  <Zap className="w-4 h-4" /> Quick Send This Template
                </Button>
              )}
              {!selectedDoc.is_template && ['Sent to Client', 'Opened', 'Viewed', 'Expired'].includes(selectedDoc.status) && (
                <Button size="sm" onClick={() => handleResendDoc(selectedDoc)} disabled={sendingId === selectedDoc.id} className="w-full gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
                  <RotateCcw className="w-4 h-4" /> Resend Document
                </Button>
              )}
              {!selectedDoc.is_template && selectedDoc.status === 'Draft' && selectedDoc.contact_id && (
                <Button size="sm" onClick={() => handleSendDoc(selectedDoc)} disabled={sendingId === selectedDoc.id} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="w-4 h-4" /> Send to Client
                </Button>
              )}
              {selectedDoc.file_url && (
                <a href={selectedDoc.file_url} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}