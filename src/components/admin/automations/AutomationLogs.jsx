import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { CheckCircle, AlertTriangle, MessageSquare, Mail, Clock, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ACTION_ICONS = {
  email_sent: Mail,
  whatsapp_sent: MessageSquare,
  reminder_sent: Clock,
  email_failed: AlertTriangle,
  whatsapp_failed: AlertTriangle,
  task_created: CheckCircle,
};

const ACTION_COLORS = {
  email_sent: 'bg-blue-100 text-blue-700',
  whatsapp_sent: 'bg-green-100 text-green-700',
  reminder_sent: 'bg-orange-100 text-orange-700',
  email_failed: 'bg-red-100 text-red-700',
  whatsapp_failed: 'bg-red-100 text-red-700',
  task_created: 'bg-purple-100 text-purple-700',
};

export default function AutomationLogs({ contacts }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['activitylog-full'],
    queryFn: () => platform.entities.ActivityLog.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries((contacts || []).map(c => [c.id, c]));

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.description?.toLowerCase().includes(q) || l.type?.toLowerCase().includes(q) || l.entity_name?.toLowerCase().includes(q);
    const matchType = !typeFilter || l.type === typeFilter;
    return matchSearch && matchType;
  });

  const failed = logs.filter(l => l.type?.includes('failed'));
  const types = [...new Set(logs.map(l => l.type).filter(Boolean))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Automation Logs</h3>
          <p className="text-sm text-gray-500">{logs.length} total events recorded</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} size="sm" className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Failed alerts */}
      {failed.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-semibold text-red-700">{failed.length} Failed Automation{failed.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-2">
            {failed.slice(0, 4).map(f => (
              <div key={f.id} className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-red-100">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800">{f.description || f.type}</p>
                  {f.error_message && <p className="text-[10px] text-red-500 mt-0.5">{f.error_message}</p>}
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(f.created_date).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No automation logs yet</p>
            <p className="text-xs text-gray-400 mt-1">Logs appear here when automations are triggered</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(log => {
              const Icon = ACTION_ICONS[log.type] || Clock;
              const isFailed = log.type?.includes('failed');
              return (
                <div key={log.id} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors ${isFailed ? 'bg-red-50/30' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${ACTION_COLORS[log.type] || 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{log.description || log.type || 'Automation event'}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {log.type && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ACTION_COLORS[log.type] || 'bg-gray-100 text-gray-600'}`}>
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      )}
                      {log.entity_name && <span className="text-[10px] text-gray-400">{log.entity_name}</span>}
                      {log.created_by && <span className="text-[10px] text-gray-400">by {log.created_by}</span>}
                    </div>
                    {isFailed && log.error_message && (
                      <p className="text-[10px] text-red-500 mt-1">{log.error_message}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 mt-1">
                    {new Date(log.created_date).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}