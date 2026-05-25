import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, CheckCircle, XCircle, Clock, Download, Eye, Calendar, User, Mail } from 'lucide-react';

const STATUS_COLORS = {
  Accepted: 'bg-emerald-100 text-emerald-700',
  Declined: 'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',
};

const STATUS_ICONS = {
  Accepted: CheckCircle,
  Declined: XCircle,
  Pending: Clock,
};

export default function AdminSignatures() {
  const navigate = useNavigate();
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSignatures();
  }, []);

  const loadSignatures = async () => {
    try {
      const sigs = await base44.entities.QuoteSignature.list('-signed_at', 100);
      const quotes = await base44.entities.Quote.list();
      const merged = sigs.map(sig => {
        const quote = quotes.find(q => q.id === sig.quote_id);
        return {
          ...sig,
          quote_number: quote?.quote_number || 'Unknown',
          contact_name: quote?.contact_snapshot?.full_name || 'Unknown',
          contact_email: quote?.contact_snapshot?.email || '',
          quote_status: quote?.status || 'Unknown',
        };
      });
      setSignatures(merged);
    } catch (error) {
      console.error('Failed to load signatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = signatures.filter(sig => {
    if (filter === 'all') return true;
    return sig.quote_status === filter;
  });

  const handleDownloadContract = async (sig) => {
    try {
      const quote = await base44.entities.Quote.filter({ id: sig.quote_id });
      if (!quote.length) return;
      
      const viewUrl = `https://creativebooks.co.za/quote/view/${sig.quote_id}/${quote[0].view_token}`;
      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Failed to open contract:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1208]">E-Signatures & Contracts</h1>
            <p className="text-sm text-black/50 mt-1">Track all signed quotes and contracts</p>
          </div>
          <div className="flex gap-2">
            {['all', 'Accepted', 'Declined', 'Pending'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  filter === f
                    ? 'bg-[#B87333] text-white'
                    : 'bg-white text-black/60 hover:bg-black/5'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <div className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-2">Total Signed</div>
            <div className="text-3xl font-bold text-[#1A1208]">{signatures.length}</div>
            <div className="text-xs text-black/40 mt-1">All time contracts</div>
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <div className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-2">Accepted</div>
            <div className="text-3xl font-bold text-emerald-600">{signatures.filter(s => s.quote_status === 'Accepted').length}</div>
            <div className="text-xs text-black/40 mt-1">Completed deals</div>
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <div className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-2">Declined</div>
            <div className="text-3xl font-bold text-red-600">{signatures.filter(s => s.quote_status === 'Declined').length}</div>
            <div className="text-xs text-black/40 mt-1">Lost opportunities</div>
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <div className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-2">Pending</div>
            <div className="text-3xl font-bold text-amber-600">{signatures.filter(s => s.quote_status === 'Pending' || !s.quote_status).length}</div>
            <div className="text-xs text-black/40 mt-1">Awaiting signature</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f7f4] border-b border-black/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Contract</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Signed Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Method</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-black/40 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-black/5">
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-black/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-black/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-black/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-black/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-black/5 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-24 bg-black/5 rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-black/40 text-sm">
                      No signatures found
                    </td>
                  </tr>
                ) : (
                  filtered.map((sig) => {
                    const StatusIcon = STATUS_ICONS[sig.quote_status] || Clock;
                    return (
                      <tr key={sig.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#B87333]" />
                            <div>
                              <div className="font-semibold text-[#1A1208]">{sig.quote_number}</div>
                              <div className="text-xs text-black/40">Quote Contract</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-[#1A1208]">{sig.contact_name}</div>
                            {sig.contact_email && (
                              <div className="text-xs text-black/50 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {sig.contact_email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[sig.quote_status] || 'bg-gray-100 text-gray-600'}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {sig.quote_status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#1A1208]">
                            {new Date(sig.signed_at).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-black/40 mt-0.5">
                            {new Date(sig.signed_at).toLocaleTimeString('en-ZA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-black/60 capitalize">{sig.signature_method}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadContract(sig)}
                              className="p-2 text-black/50 hover:text-[#B87333] hover:bg-[#B87333]/10 rounded-lg transition-colors"
                              title="View Contract"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-black/50 hover:text-[#B87333] hover:bg-[#B87333]/10 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}