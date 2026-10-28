import { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, MousePointerClick, Eye, AlertTriangle, Users } from 'lucide-react';
import { format } from 'date-fns';

const STAT_CARD = ({ icon: Icon, label, value, color = 'text-gray-900' }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
    <Icon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

export default function CampaignStatsPanel({ campaign, onClose }) {
  const [stats, setStats] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platform.functions.invoke('campaignActions', { action: 'get_stats', campaign_id: campaign.id })
      .then(res => {
        if (res.data?.success) {
          setStats(res.data.stats);
          setRecipients(res.data.recipients || []);
        }
        setLoading(false);
      });
  }, [campaign.id]);

  const statusColor = (s) => ({
    sent: 'bg-blue-50 text-blue-700',
    opened: 'bg-green-50 text-green-700',
    clicked: 'bg-purple-50 text-purple-700',
    bounced: 'bg-red-50 text-red-700',
    failed: 'bg-red-50 text-red-700',
    unsubscribed: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-50 text-yellow-700',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{campaign.name}</SheetTitle>
          <p className="text-sm text-gray-500">{campaign.subject}</p>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
        ) : stats ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <STAT_CARD icon={Users} label="Recipients" value={stats.total} />
              <STAT_CARD icon={Mail} label="Sent" value={stats.sent} color="text-blue-600" />
              <STAT_CARD icon={Eye} label={`Opened (${stats.open_rate}%)`} value={stats.opened} color="text-green-600" />
              <STAT_CARD icon={MousePointerClick} label={`Clicked (${stats.click_rate}%)`} value={stats.clicked} color="text-purple-600" />
              <STAT_CARD icon={AlertTriangle} label="Bounced" value={stats.bounced} color="text-red-500" />
              <STAT_CARD icon={AlertTriangle} label="Failed" value={stats.failed} color="text-red-500" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Recipients ({recipients.length})</p>
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {recipients.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.full_name || r.email}</p>
                      <p className="text-xs text-gray-400">{r.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>{r.status}</span>
                      {r.sent_at && <span className="text-xs text-gray-400">{format(new Date(r.sent_at), 'dd MMM HH:mm')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">No stats available yet.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}