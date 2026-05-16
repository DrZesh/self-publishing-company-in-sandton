import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import SubmissionDetail from '@/components/admin/SubmissionDetail';
import { Search, Mail, Eye, CheckCircle, AlertCircle, Archive, Tag, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  new:               { label: 'New',            color: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  read:              { label: 'Read',           color: 'bg-gray-400',    text: 'text-gray-600',    bg: 'bg-gray-50',    border: 'border-gray-200' },
  converted_to_lead: { label: 'Lead',           color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  spam:              { label: 'Spam',           color: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  archived:          { label: 'Archived',       color: 'bg-gray-300',    text: 'text-gray-500',    bg: 'bg-gray-50',    border: 'border-gray-200' },
};

const FORM_TYPE_LABELS = {
  contact: 'Contact',
  quote: 'Quote Request',
  newsletter: 'Newsletter',
  package_order: 'Package Order',
  service_enquiry: 'Service Enquiry',
  other: 'Other',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function SubmissionRow({ submission, selected, onClick }) {
  const cfg = STATUS_CONFIG[submission.status] || STATUS_CONFIG.read;
  const isNew = submission.status === 'new';
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-black/5 transition-all hover:bg-[#faf8f4] ${selected ? 'bg-[#faf3ea] border-l-2 border-l-[#B87333]' : 'border-l-2 border-l-transparent'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isNew ? 'bg-blue-500' : 'bg-transparent'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm truncate ${isNew ? 'font-bold text-[#1A1208]' : 'font-medium text-[#1A1208]'}`}>{submission.full_name}</p>
            <span className="text-xs text-black/30 shrink-0 whitespace-nowrap">{timeAgo(submission.created_date)}</span>
          </div>
          <p className="text-xs text-black/50 truncate">{submission.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${cfg.text} ${cfg.bg}`}>
              {FORM_TYPE_LABELS[submission.form_type] || submission.form_type}
            </span>
            {submission.message && (
              <p className="text-xs text-black/30 truncate">{submission.message}</p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AdminInbox() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('new');
  const [selected, setSelected] = useState(null);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await base44.entities.Submission.list('-created_date', 200);
      setSubmissions(data || []);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Real-time updates
  useEffect(() => {
    const unsub = base44.entities.Submission.subscribe((event) => {
      if (event.type === 'create') {
        setSubmissions(prev => [event.data, ...prev]);
        toast.success(`New submission from ${event.data.full_name}`);
      } else if (event.type === 'update') {
        setSubmissions(prev => prev.map(s => s.id === event.id ? event.data : s));
      } else if (event.type === 'delete') {
        setSubmissions(prev => prev.filter(s => s.id !== event.id));
      }
    });
    return unsub;
  }, []);

  const filtered = submissions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.toLowerCase().includes(q) || s.message?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStatusChange = async (id, status) => {
    await base44.entities.Submission.update(id, { status });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
    toast.success(`Marked as ${status.replace(/_/g, ' ')}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    await base44.entities.Submission.delete(id);
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Submission deleted');
  };

  const openSubmission = (sub) => {
    setSelected(sub);
    if (sub.status === 'new') handleStatusChange(sub.id, 'read');
  };

  const counts = {
    all: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    read: submissions.filter(s => s.status === 'read').length,
    converted_to_lead: submissions.filter(s => s.status === 'converted_to_lead').length,
    archived: submissions.filter(s => s.status === 'archived').length,
    spam: submissions.filter(s => s.status === 'spam').length,
  };

  const FILTER_TABS = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New', dot: true },
    { value: 'read', label: 'Read' },
    { value: 'converted_to_lead', label: 'Leads' },
    { value: 'archived', label: 'Archived' },
    { value: 'spam', label: 'Spam' },
  ];

  return (
    <AdminLayout>
      <div className="flex h-full -m-6 lg:-m-8">
        {/* Left panel — list */}
        <div className={`flex flex-col ${selected ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 xl:w-[420px] border-r border-black/8 bg-white shrink-0`}>
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-black/8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-[#1A1208]">Inbox</h1>
              <div className="flex items-center gap-2">
                {counts.new > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">{counts.new}</span>
                )}
                <button onClick={() => load(true)} disabled={refreshing} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                  <RefreshCw className={`w-4 h-4 text-black/40 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, message…"
                className="w-full pl-9 pr-3 py-2 bg-[#f5f5f5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333]/30"
              />
            </div>
            {/* Status filter pills */}
            <div className="flex gap-1 flex-wrap">
              {FILTER_TABS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setStatusFilter(t.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${statusFilter === t.value ? 'bg-[#B87333] text-white' : 'bg-black/5 text-black/50 hover:bg-black/10'}`}
                >
                  {t.dot && counts.new > 0 && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
                  {t.label}
                  <span className="opacity-60">({counts[t.value] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center px-6">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-semibold text-black/50">No submissions here</p>
                <p className="text-xs text-black/30 mt-1">
                  {statusFilter === 'new' ? 'All caught up! No unread messages.' : 'Nothing matches your current filter.'}
                </p>
              </div>
            ) : (
              filtered.map(s => (
                <SubmissionRow
                  key={s.id}
                  submission={s}
                  selected={selected?.id === s.id}
                  onClick={() => openSubmission(s)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel — detail */}
        <div className={`flex-1 overflow-y-auto bg-[#f8f9fc] ${selected ? 'block' : 'hidden lg:block'}`}>
          {selected ? (
            <div className="p-6 lg:p-8 max-w-3xl">
              {/* Mobile back button */}
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden flex items-center gap-1.5 text-sm text-[#B87333] mb-4 hover:underline"
              >
                ← Back to inbox
              </button>
              <SubmissionDetail
                submission={selected}
                onClose={() => setSelected(null)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                inline
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <div className="text-5xl mb-4">✉️</div>
                <p className="text-base font-semibold text-black/40">Select a submission to view details</p>
                <p className="text-sm text-black/25 mt-1">Click any item from the list on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}