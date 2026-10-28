import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import CampaignModal from '@/components/admin/marketing/CampaignModal';
import CampaignStatsPanel from '@/components/admin/marketing/CampaignStatsPanel';
import {
  Megaphone, Plus, Send, Eye, Trash2, BarChart2,
  Mail, Users, CheckCircle, Clock, Loader2, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-600',
  Scheduled: 'bg-blue-50 text-blue-700',
  Sending: 'bg-yellow-50 text-yellow-700',
  Sent: 'bg-green-50 text-green-700',
  Paused: 'bg-orange-50 text-orange-700',
  Cancelled: 'bg-red-50 text-red-600',
};

const KPI = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#B87333]/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#B87333]" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  </div>
);

export default function AdminMarketing() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statsPanel, setStatsPanel] = useState(null);
  const [sending, setSending] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => platform.entities.EmailCampaign.list('-created_date', 100),
  });

  const totalSent = campaigns.reduce((s, c) => s + (c.total_sent || 0), 0);
  const sentCampaigns = campaigns.filter(c => c.status === 'Sent');
  const avgOpenRate = sentCampaigns.length
    ? Math.round(sentCampaigns.reduce((s, c) => s + (c.open_rate || 0), 0) / sentCampaigns.length)
    : 0;

  const handleSend = async (campaign) => {
    if (!confirm(`Send "${campaign.name}" to all matching contacts? This cannot be undone.`)) return;
    setSending(campaign.id);
    const res = await platform.functions.invoke('campaignActions', { action: 'send', campaign_id: campaign.id });
    setSending(null);
    if (res.data?.success) {
      toast.success(`Sent to ${res.data.sent} contacts`);
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    } else {
      toast.error(res.data?.error || 'Send failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    await platform.entities.EmailCampaign.delete(id);
    queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    toast.success('Campaign deleted');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-[#B87333]" /> Marketing Campaigns
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Create, send, and track email campaigns to your contacts</p>
          </div>
          <Button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-[#B87333] hover:bg-[#9a6128] text-white gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={Megaphone} label="Total Campaigns" value={campaigns.length} />
          <KPI icon={Mail} label="Total Emails Sent" value={totalSent.toLocaleString()} />
          <KPI icon={TrendingUp} label="Avg Open Rate" value={`${avgOpenRate}%`} />
          <KPI icon={CheckCircle} label="Sent Campaigns" value={sentCampaigns.length} />
        </div>

        {/* Campaigns Table */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Megaphone className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600">No campaigns yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Create your first email campaign to get started</p>
            <Button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-[#B87333] hover:bg-[#9a6128] text-white gap-2">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{campaign.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[campaign.status] || 'bg-gray-100 text-gray-600'}`}>
                        {campaign.status}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{campaign.campaign_type}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{campaign.subject}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {campaign.total_sent > 0 && (
                        <>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.total_sent} sent</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Eye className="w-3 h-3" /> {campaign.open_rate || 0}% opened</span>
                        </>
                      )}
                      {campaign.sent_at && (
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(campaign.sent_at), 'dd MMM yyyy HH:mm')}</span>
                      )}
                      {!campaign.sent_at && (
                        <span className="text-xs text-gray-400">{format(new Date(campaign.created_date), 'dd MMM yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {campaign.status === 'Sent' && (
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setStatsPanel(campaign)}>
                        <BarChart2 className="w-3 h-3" /> Stats
                      </Button>
                    )}
                    {['Draft', 'Scheduled'].includes(campaign.status) && (
                      <>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => { setEditing(campaign); setShowModal(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" className="gap-1 text-xs bg-[#B87333] hover:bg-[#9a6128] text-white"
                          onClick={() => handleSend(campaign)} disabled={sending === campaign.id}>
                          {sending === campaign.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Send Now
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <CampaignModal
            campaign={editing}
            onClose={() => setShowModal(false)}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ['email-campaigns'] })}
          />
        )}
        {statsPanel && <CampaignStatsPanel campaign={statsPanel} onClose={() => setStatsPanel(null)} />}
      </div>
    </AdminLayout>
  );
}