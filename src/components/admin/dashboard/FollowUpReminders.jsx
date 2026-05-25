import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Mail, FileText, User, ChevronRight, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const TYPE_ICONS = {
  lead_followup: User,
  quote_followup: FileText,
  quote_expiring: Clock,
  submission_conversion: Mail,
};

export default function FollowUpReminders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFollowUps = async () => {
    try {
      const res = await base44.functions.invoke('getFollowUpReminders', {});
      setData(res.data);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleAction = (followUp) => {
    switch (followUp.type) {
      case 'lead_followup':
        navigate(`/admin/leads?contact=${followUp.contact_id}`);
        break;
      case 'quote_followup':
      case 'quote_expiring':
        navigate(`/admin/quotes/${followUp.quote_id}`);
        break;
      case 'submission_conversion':
        navigate(`/admin/submissions?id=${followUp.submission_id}`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading Follow-ups...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data || data.followUps.length === 0) {
    return (
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">All caught up!</p>
              <p className="text-xs text-green-600">No follow-ups needed right now</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            Follow-up Required ({data.summary.total})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchFollowUps} className="h-7 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.followUps.slice(0, 5).map((followUp, idx) => {
            const Icon = TYPE_ICONS[followUp.type] || Bell;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${PRIORITY_COLORS[followUp.priority]} hover:shadow-sm transition-all cursor-pointer`}
                onClick={() => handleAction(followUp)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{followUp.title}</p>
                      <p className="text-xs opacity-80 mt-0.5">{followUp.description}</p>
                      {followUp.estimated_value && (
                        <p className="text-xs font-medium mt-1">
                          R {followUp.estimated_value.toLocaleString()}
                        </p>
                      )}
                      {followUp.quote_total && (
                        <p className="text-xs font-medium mt-1">
                          R {followUp.quote_total.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {followUp.days_overdue || followUp.days_pending || followUp.days_until_expiry}d
                    </Badge>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </div>
                </div>
              </div>
            );
          })}
          
          {data.followUps.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs mt-2"
              onClick={() => navigate('/admin/leads')}
            >
              View all {data.followUps.length} follow-ups →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}