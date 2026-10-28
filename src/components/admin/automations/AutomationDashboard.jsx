import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { CheckCircle, AlertTriangle, MessageSquare, Mail, Clock, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AutomationDashboard({ contacts, invoices, projects }) {
  const [runningCheck, setRunningCheck] = useState(false);

  const { data: logs = [] } = useQuery({
    queryKey: ['activitylog-auto'],
    queryFn: () => platform.entities.ActivityLog.list('-created_date', 200),
  });

  const today = new Date().toDateString();
  const todayLogs = logs.filter(l => new Date(l.created_date).toDateString() === today);
  const waSent = logs.filter(l => l.type === 'whatsapp_sent').length;
  const emailSent = logs.filter(l => l.type === 'email_sent').length;
  const failed = logs.filter(l => l.type?.includes('failed')).length;

  const overdueInvoices = invoices.filter(i => i.status === 'Overdue').length;
  const awaitingSignature = (projects || []).filter(p => p.contract_status === 'Sent').length;
  const activeProjects = (projects || []).filter(p => !['Completed', 'Delivered', 'Archived'].includes(p.stage)).length;

  const handleOverdueCheck = async () => {
    setRunningCheck(true);
    const res = await platform.functions.invoke('checkOverdueInvoices', {});
    setRunningCheck(false);
    if (res.data?.success) toast.success(`Done — ${res.data.invoices_marked_overdue || 0} overdue, ${res.data.tasks_created || 0} tasks created`);
    else toast.error('Check failed');
  };

  const kpis = [
    { label: 'Triggered Today', value: todayLogs.length, icon: Zap, color: 'text-[#B87333]', bg: 'bg-orange-50' },
    { label: 'WhatsApp Sent', value: waSent, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Emails Sent', value: emailSent, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Failed', value: failed, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Overdue Invoices', value: overdueInvoices, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Projects', value: activeProjects, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const systemStatus = [
    { label: 'Resend Email', status: 'Connected', ok: true },
    { label: 'CallMeBot WhatsApp', status: 'Connected', ok: true },
    { label: 'Twilio WhatsApp', status: 'Connected', ok: true },
    { label: 'Overdue Check', status: 'Runs 7am daily', ok: true },
    { label: 'Follow-up Reminders', status: 'Runs daily', ok: true },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-gray-100`}>
              <Icon className={`w-5 h-5 ${k.color} mb-2`} />
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{k.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> System Status
          </h3>
          <div className="space-y-2.5">
            {systemStatus.map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{s.label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#B87333]" /> Quick Actions
          </h3>
          <div className="space-y-2">
            <Button
              onClick={handleOverdueCheck}
              disabled={runningCheck}
              variant="outline"
              className="w-full gap-2 justify-start text-sm"
            >
              <RefreshCw className={`w-4 h-4 text-orange-500 ${runningCheck ? 'animate-spin' : ''}`} />
              {runningCheck ? 'Checking...' : 'Run Overdue Invoice Check'}
            </Button>
            <Button
              onClick={async () => {
                const res = await platform.functions.invoke('sendFollowUpReminders', {});
                if (res.data?.success) toast.success('Follow-up reminders sent!');
                else toast.error('Failed to send reminders');
              }}
              variant="outline"
              className="w-full gap-2 justify-start text-sm"
            >
              <Clock className="w-4 h-4 text-blue-500" /> Send Follow-Up Reminders Now
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {logs.slice(0, 8).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Automation Activity</h3>
          <div className="space-y-2">
            {logs.slice(0, 8).map(log => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type?.includes('failed') ? 'bg-red-400' : 'bg-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{log.description || log.type}</p>
                  {log.entity_name && <p className="text-[10px] text-gray-400">{log.entity_name}</p>}
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(log.created_date).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}