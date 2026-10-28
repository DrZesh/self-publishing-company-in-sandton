import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Clock, ExternalLink, Loader2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TYPE_ICON = { info: '💬', success: '✅', warning: '⚠️', error: '❌', action_required: '🔔' };
const PRIORITY_DOT = { low: 'bg-gray-300', medium: 'bg-blue-500', high: 'bg-amber-500', urgent: 'bg-red-500' };
const CATEGORY_BADGE = {
  invoice: 'bg-blue-50 text-blue-700',
  quote: 'bg-purple-50 text-purple-700',
  payment: 'bg-green-50 text-green-700',
  nda: 'bg-orange-50 text-orange-700',
  portal: 'bg-indigo-50 text-indigo-700',
  project: 'bg-cyan-50 text-cyan-700',
  lead: 'bg-amber-50 text-amber-700',
  client: 'bg-pink-50 text-pink-700',
  system: 'bg-gray-100 text-gray-600',
  campaign: 'bg-teal-50 text-teal-700',
};

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page'],
    queryFn: async () => {
      const res = await platform.functions.invoke('onboardingActions', { action: 'get_notifications' });
      return res.data || { notifications: [], unread_count: 0 };
    },
    refetchInterval: 30000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read)
    : filter === 'action_required' ? notifications.filter(n => n.type === 'action_required')
    : notifications;

  const markRead = async (id) => {
    await platform.functions.invoke('onboardingActions', { action: 'mark_read', notification_id: id });
    queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
  };

  const markAllRead = async () => {
    await platform.functions.invoke('onboardingActions', { action: 'mark_all_read' });
    toast.success('All notifications marked as read');
    queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
  };

  const snooze = async (id) => {
    await platform.functions.invoke('onboardingActions', { action: 'snooze', notification_id: id, hours: 24 });
    toast.success('Snoozed for 24 hours');
    queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
  };

  const handleAction = async (notif) => {
    if (!notif.is_read) await markRead(notif.id);
    if (notif.action_url) navigate(notif.action_url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#B87333]" /> Notifications
              {unreadCount > 0 && (
                <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount} unread</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">System alerts, action items, and important updates</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead} className="gap-2 text-sm">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'action_required', label: 'Action Required' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${filter === key ? 'bg-[#B87333] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => (
              <div
                key={n.id}
                className={`bg-white rounded-xl border p-4 flex gap-4 cursor-pointer hover:border-gray-200 transition-all ${!n.is_read ? 'border-blue-100 bg-blue-50/20' : 'border-gray-100'}`}
                onClick={() => handleAction(n)}
              >
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <span className="text-xl">{TYPE_ICON[n.type] || '💬'}</span>
                  <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[n.priority] || 'bg-gray-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                    {n.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[n.category] || 'bg-gray-100 text-gray-600'}`}>
                        {n.category}
                      </span>
                    )}
                    {!n.is_read && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">New</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-400">{n.created_date ? format(new Date(n.created_date), 'dd MMM yyyy HH:mm') : ''}</span>
                    {n.action_label && (
                      <span className="text-xs text-[#B87333] font-medium flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> {n.action_label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {!n.is_read && (
                    <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                      Read
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); snooze(n.id); }}
                    className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 flex items-center gap-1 transition-colors">
                    <Clock className="w-3 h-3" /> Snooze
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}