import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotificationBell({ contact, portalAccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch unread notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['portalNotifications', portalAccess?.project_id],
    queryFn: async () => {
      if (!portalAccess?.project_id) return [];
      const updates = await platform.entities.ProjectUpdate.filter({
        project_id: portalAccess.project_id,
        is_read: false
      });
      return updates || [];
    },
    enabled: !!portalAccess?.project_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (updateId) => {
      await platform.entities.ProjectUpdate.update(updateId, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['portalNotifications']);
    },
  });

  const handleMarkAsRead = (updateId) => {
    markAsReadMutation.mutate(updateId);
  };

  const getIcon = (updateType) => {
    switch (updateType) {
      case 'milestone_completed': return CheckCircle;
      case 'action_required': return AlertTriangle;
      default: return Info;
    }
  };

  const getColor = (updateType) => {
    switch (updateType) {
      case 'milestone_completed': return 'text-green-600 bg-green-100';
      case 'action_required': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute top-16 right-6 w-96 bg-white rounded-xl shadow-2xl border border-[#E5D9C9] z-50" style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="p-4 border-b border-[#E5D9C9]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {notifications.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">{notifications.length} unread</p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(update => {
                  const Icon = getIcon(update.update_type);
                  const colorClass = getColor(update.update_type);

                  return (
                    <div 
                      key={update.id} 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleMarkAsRead(update.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{update.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{update.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(update.created_date).toLocaleDateString('en-ZA', { 
                              day: 'numeric', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}