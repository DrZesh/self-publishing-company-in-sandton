import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { MessageCircle, CheckCircle2, XCircle, Clock, Search, RefreshCw } from 'lucide-react';

const GLASS = {
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
};

function statusIcon(status) {
  if (status === 'sent') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400" />;
  return <Clock className="w-4 h-4 text-yellow-400" />;
}

function relTime(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

export default function AdminWhatsAppLog() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['wa-logs'],
    queryFn: () => platform.entities.MessageLog.list('-created_date', 500),
    refetchInterval: 30000,
  });

  // Only WhatsApp logs
  const waLogs = logs.filter(l => l.channel === 'whatsapp' || l.message_type === 'whatsapp');

  const filtered = waLogs.filter(l => {
    if (statusFilter && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.to?.toLowerCase().includes(q) || l.message?.toLowerCase().includes(q) || l.contact_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const sentCount = waLogs.filter(l => l.status === 'sent').length;
  const failedCount = waLogs.filter(l => l.status === 'failed').length;
  const pendingCount = waLogs.filter(l => !l.status || l.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">WhatsApp Message Log</h1>
              <p className="text-sm text-white/60 mt-0.5">All outbound WhatsApp notifications sent from the system</p>
            </div>
            <button onClick={() => refetch()} className="p-2.5 rounded-xl hover:scale-105 transition-all" style={GLASS}>
              <RefreshCw className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Sent', value: sentCount, color: '#10b981' },
              { label: 'Failed', value: failedCount, color: '#ef4444' },
              { label: 'Pending', value: pendingCount, color: '#f59e0b' },
            ].map(k => (
              <div key={k.label} className="rounded-2xl p-4" style={GLASS}>
                <p className="text-xs text-white/50 uppercase tracking-widest">{k.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {['', 'sent', 'failed', 'pending'].map(s => (
                <button key={s || 'all'} onClick={() => setStatusFilter(s)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all capitalize"
                  style={statusFilter === s
                    ? { background: 'linear-gradient(135deg,#ec4899,#f97316)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.55)' }}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Log table */}
          {isLoading ? (
            <div className="text-center text-white/40 py-20">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl p-16 text-center" style={GLASS}>
              <MessageCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No WhatsApp messages found</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={GLASS}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">To</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Message</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wide">When</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {statusIcon(log.status)}
                          <span className="text-xs capitalize text-white/60">{log.status || 'pending'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{log.contact_name || log.to || '—'}</p>
                        {log.to && log.contact_name && <p className="text-xs text-white/40">{log.to}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                        <p className="text-xs text-white/60 truncate">{log.message || log.body || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-white/40 whitespace-nowrap">
                        {relTime(log.created_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}