import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { useQuery } from '@tanstack/react-query';
import { Mail, Eye, MousePointer, Clock, CheckCircle, X } from 'lucide-react';

export default function EmailTrackingPanel({ contactId, onClose }) {
  const [stats, setStats] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['emailTracking', contactId],
    queryFn: async () => {
      const res = await platform.functions.invoke('sendFollowUpWithEmailTracking', {
        action: 'get_tracking_stats',
        contact_id: contactId
      });
      return res.data?.stats;
    },
  });

  useEffect(() => {
    if (data) setStats(data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-4 border-amber-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 font-medium">Loading email stats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Tracking</h2>
            <p className="text-sm text-gray-500 mt-1">Track email opens and clicks for this contact</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 uppercase">Total Sent</span>
                </div>
                <div className="text-3xl font-bold text-blue-900">{stats.total_sent}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 uppercase">Opened</span>
                </div>
                <div className="text-3xl font-bold text-green-900">{stats.total_opened}</div>
                <div className="text-xs text-green-600 mt-1">{stats.open_rate}% open rate</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700 uppercase">Clicked</span>
                </div>
                <div className="text-3xl font-bold text-purple-900">{stats.total_clicked}</div>
                <div className="text-xs text-purple-600 mt-1">{stats.click_rate}% click rate</div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 uppercase">Responded</span>
                </div>
                <div className="text-3xl font-bold text-amber-900">{stats.total_opened > 0 ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          {/* Recent Emails */}
          {stats?.recent_emails && stats.recent_emails.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Recent Emails</h3>
              <div className="space-y-3">
                {stats.recent_emails.map(email => (
                  <div key={email.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded uppercase">
                            {email.email_type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(email.sent_at).toLocaleDateString('en-ZA', { 
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{email.subject}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {email.opened ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                            <Eye className="w-3 h-3" />
                            Opened
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Not opened
                          </div>
                        )}
                        {email.clicked && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                            <MousePointer className="w-3 h-3" />
                            Clicked
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Sent: {new Date(email.sent_at).toLocaleString('en-ZA')}
                      </div>
                      {email.opened_at && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Eye className="w-3 h-3" />
                          Opened: {new Date(email.opened_at).toLocaleString('en-ZA')}
                        </div>
                      )}
                      {email.clicked_at && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <MousePointer className="w-3 h-3" />
                          Clicked: {new Date(email.clicked_at).toLocaleString('en-ZA')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!stats || stats.total_sent === 0) && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No emails sent yet</p>
              <p className="text-sm text-gray-500 mt-1">Send a follow-up email to start tracking engagement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}