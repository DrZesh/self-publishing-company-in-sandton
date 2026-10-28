import { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { 
  Send, Eye, Download, CheckCircle, XCircle, FileSignature,
  CreditCard, RotateCcw, Clock, Upload, MessageSquare, AlertTriangle, Bell
} from 'lucide-react';

const ACTION_CONFIG = {
  uploaded:               { icon: Upload,         color: 'text-gray-500',   bg: 'bg-gray-100',   label: 'Uploaded' },
  sent:                   { icon: Send,            color: 'text-blue-600',   bg: 'bg-blue-50',    label: 'Sent' },
  resent:                 { icon: RotateCcw,       color: 'text-blue-500',   bg: 'bg-blue-50',    label: 'Resent' },
  reminder_sent:          { icon: Bell,            color: 'text-orange-500', bg: 'bg-orange-50',  label: 'Reminder Sent' },
  opened:                 { icon: Eye,             color: 'text-sky-600',    bg: 'bg-sky-50',     label: 'Opened' },
  viewed:                 { icon: Eye,             color: 'text-purple-600', bg: 'bg-purple-50',  label: 'Viewed' },
  downloaded:             { icon: Download,        color: 'text-indigo-600', bg: 'bg-indigo-50',  label: 'Downloaded' },
  signed:                 { icon: FileSignature,   color: 'text-emerald-600',bg: 'bg-emerald-50', label: 'Signed' },
  approved:               { icon: CheckCircle,     color: 'text-green-600',  bg: 'bg-green-50',   label: 'Approved' },
  rejected:               { icon: XCircle,         color: 'text-red-600',    bg: 'bg-red-50',     label: 'Rejected' },
  changes_requested:      { icon: MessageSquare,   color: 'text-amber-600',  bg: 'bg-amber-50',   label: 'Changes Requested' },
  payment_proof_uploaded: { icon: CreditCard,      color: 'text-teal-600',   bg: 'bg-teal-50',    label: 'Payment Proof Uploaded' },
  expired:                { icon: AlertTriangle,   color: 'text-orange-600', bg: 'bg-orange-50',  label: 'Expired' },
  version_created:        { icon: Clock,           color: 'text-gray-600',   bg: 'bg-gray-100',   label: 'New Version Created' },
};

export default function DocumentActivityPanel({ documentId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    platform.functions.invoke('documentActions', { action: 'get_activity', document_id: documentId })
      .then(res => setActivities(res.data?.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [documentId]);

  if (loading) return (
    <div className="space-y-2 py-2">
      {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
    </div>
  );

  if (!activities.length) return (
    <div className="py-6 text-center text-gray-400 text-sm">No activity yet</div>
  );

  return (
    <div className="space-y-2">
      {activities.map((a, i) => {
        const cfg = ACTION_CONFIG[a.action] || { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: a.action };
        const Icon = cfg.icon;
        return (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white">
            <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                <span className="text-xs text-gray-400 capitalize">{a.actor_type}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {new Date(a.timestamp).toLocaleString('en-ZA')}
              </div>
              {(a.actor_email || a.actor_ip || a.actor_device) && (
                <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-x-3">
                  {a.actor_email && <span>✉ {a.actor_email}</span>}
                  {a.actor_ip && <span>🌐 {a.actor_ip}</span>}
                  {a.actor_device && <span>📱 {a.actor_device}</span>}
                  {a.actor_browser && <span>🔍 {a.actor_browser}</span>}
                </div>
              )}
              {a.notes && <p className="text-xs text-gray-500 mt-1 italic">{a.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}