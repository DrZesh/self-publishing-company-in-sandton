import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, Mail, Eye, Trash2, CheckCircle, AlertCircle, Archive } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import SubmissionDetail from '@/components/admin/SubmissionDetail';

export default function AdminInbox() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('new');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const statusOptions = [
    { value: 'new', label: 'New', icon: Mail, color: 'text-blue-600' },
    { value: 'read', label: 'Read', icon: Eye, color: 'text-gray-600' },
    { value: 'converted_to_lead', label: 'Converted to Lead', icon: CheckCircle, color: 'text-green-600' },
    { value: 'spam', label: 'Spam', icon: AlertCircle, color: 'text-red-600' },
    { value: 'archived', label: 'Archived', icon: Archive, color: 'text-gray-400' },
  ];

  // Load submissions
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const data = await base44.entities.Submission.list('-created_date', 100);
        setSubmissions(data || []);
      } catch (err) {
        console.error('Failed to load submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSubmissions();
  }, []);

  // Filter and search submissions
  useEffect(() => {
    let filtered = submissions;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, search, statusFilter]);

  const handleStatusChange = async (submissionId, newStatus) => {
    try {
      await base44.entities.Submission.update(submissionId, { status: newStatus });
      setSubmissions(prev =>
        prev.map(s => s.id === submissionId ? { ...s, status: newStatus } : s)
      );
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await base44.entities.Submission.delete(submissionId);
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      if (selectedSubmission?.id === submissionId) {
        setShowDetail(false);
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  };

  const openSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowDetail(true);
    // Mark as read
    if (submission.status === 'new') {
      handleStatusChange(submission.id, 'read');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1220] mb-2">Inbox</h1>
          <p className="text-[#2B2B2B]/60">
            {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && ` (${statusFilter})`}
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#2B2B2B]/40" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#B8955B]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#B8955B] text-white'
                  : 'border border-[#ddd] text-[#2B2B2B] hover:border-[#B8955B]'
              }`}
            >
              All
            </button>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  statusFilter === opt.value
                    ? 'bg-[#B8955B] text-white'
                    : 'border border-[#ddd] text-[#2B2B2B] hover:border-[#B8955B]'
                }`}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submissions List */}
        {loading ? (
          <div className="text-center py-12 text-[#2B2B2B]/60">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-[#2B2B2B]/60">No submissions found</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filteredSubmissions.map((submission, i) => {
              const Icon = statusOptions.find(o => o.value === submission.status)?.icon || Mail;
              return (
                <motion.button
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openSubmission(submission)}
                  className="w-full p-4 bg-white rounded-lg border border-[#ddd]/50 hover:border-[#B8955B] hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="w-5 h-5 text-[#B8955B] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#0B1220] truncate">{submission.full_name}</p>
                        <p className="text-sm text-[#2B2B2B]/60 truncate">{submission.email}</p>
                        {submission.message && (
                          <p className="text-xs text-[#2B2B2B]/40 truncate mt-1">{submission.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#2B2B2B]/40 whitespace-nowrap">
                        {new Date(submission.created_date).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#2B2B2B]/20" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onClose={() => setShowDetail(false)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
}