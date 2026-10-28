import { useState, useEffect, useRef } from 'react';
import { platform } from '@/api/platformClient';
import { Bell, CheckCheck, Clock, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const TYPE_STYLES = {
  info: 'bg-blue-50 border-blue-100 text-blue-700',
  success: 'bg-green-50 border-green-100 text-green-700',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  error: 'bg-red-50 border-red-100 text-red-700',
  action_required: 'bg-purple-50 border-purple-100 text-purple-700',
};

const PRIORITY_DOT = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const ref = useRef(null);

  const load = async () => {
    const res = await platform.functions.invoke('onboardingActions', { action: 'get_notifications' });
    if (res.data?.success) {
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await platform.functions.invoke('onboardingActions', { action: 'mark_read', notification_id: id });
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await platform.functions.invoke('onboardingActions', { action: 'mark_all_read' });
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
    setUnreadCount(0);
  };

  const snooze = async (id, e) => {
    e.stopPropagation();
    await platform.functions.invoke('onboardingActions', { action: 'snooze', notification_id: id, hours: 24 });
    setNotifications(n => n.filter(x => x.id !== id));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleAction = async (notif) => {
    if (!notif.is_read) await markRead(notif.id);
    if (notif.action_url) {
      setOpen(false);
      navigate(notif.action_url);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[#B87333] hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleAction(n)}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_DOT[n.priority] || 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{n.created_date ? format(new Date(n.created_date), 'dd MMM HH:mm') : ''}</span>
                      {n.action_label && (
                        <span className="text-[10px] text-[#B87333] font-medium flex items-center gap-0.5">
                          {n.action_label} <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={(e) => snooze(n.id, e)} className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-lg text-gray-400" title="Snooze 24h">
                    <Clock className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100 text-center">
            <button onClick={() => { setOpen(false); navigate('/admin/notifications'); }} className="text-xs text-[#B87333] hover:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}