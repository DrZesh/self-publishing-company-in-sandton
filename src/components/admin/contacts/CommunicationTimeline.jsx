import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Inbox, FileText, CheckCircle, XCircle, Eye, User, MessageSquare, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const ICONS = {
  form: MessageSquare,
  send: Send,
  inbox: Inbox,
  document: FileText,
  eye: Eye,
  check: CheckCircle,
  x: XCircle,
  user: User,
  trending: TrendingUp,
  note: MessageSquare,
};

const TYPE_COLORS = {
  submission: 'bg-blue-50 border-blue-200',
  email: 'bg-purple-50 border-purple-200',
  quote_created: 'bg-gray-50 border-gray-200',
  quote_sent: 'bg-blue-50 border-blue-200',
  quote_viewed: 'bg-green-50 border-green-200',
  quote_accepted: 'bg-emerald-50 border-emerald-200',
  quote_declined: 'bg-red-50 border-red-200',
  lead_created: 'bg-amber-50 border-amber-200',
  lead_stage_change: 'bg-orange-50 border-orange-200',
  note: 'bg-slate-50 border-slate-200',
};

export default function CommunicationTimeline({ contactId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactId) return;
    
    platform.functions.invoke('getCommunicationTimeline', { contact_id: contactId })
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [contactId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Communication Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { contact, timeline, metrics } = data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Communication Timeline</CardTitle>
          <Badge variant="outline" className="text-xs">
            {metrics.total_interactions} interactions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b">
          <div className="text-center">
            <p className="text-xs text-gray-500">Last Contact</p>
            <p className="text-sm font-semibold">{metrics.days_since_last_contact}d ago</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Emails Sent</p>
            <p className="text-sm font-semibold">{metrics.emails_sent}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Conversion Rate</p>
            <p className="text-sm font-semibold">{metrics.conversion_rate.toFixed(0)}%</p>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {timeline.slice(0, 10).map((event, idx) => {
            const Icon = ICONS[event.icon] || MessageSquare;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${TYPE_COLORS[event.type] || 'bg-gray-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-900">{event.title}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(event.date), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                    {event.metadata?.status && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {event.metadata.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {timeline.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No interactions yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}