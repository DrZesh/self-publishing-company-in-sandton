import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Send, Mail, AlertTriangle } from 'lucide-react';

const STATUS_STYLES = {
  pending_approval: { label: 'Awaiting Approval', bg: '#fffbeb', color: '#b45309', icon: Clock },
  scheduled:        { label: 'Scheduled',          bg: '#eff6ff', color: '#1d4ed8', icon: Clock },
  sending:          { label: 'Sending',             bg: '#f0fdf4', color: '#16a34a', icon: Send },
  sent:             { label: 'Sent',                bg: '#f0fdf4', color: '#16a34a', icon: CheckCircle },
  failed:           { label: 'Failed',              bg: '#fef2f2', color: '#ef4444', icon: AlertTriangle },
  cancelled:        { label: 'Cancelled',           bg: '#f8fafc', color: '#64748b', icon: XCircle },
};

export default function EmailQueueTab() {
  const qc = useQueryClient();

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['message-queue'],
    queryFn: () => base44.entities.MessageQueue.list('-created_date', 100),
  });

  const approve = useMutation({
    mutationFn: async (item) => {
      await base44.entities.MessageQueue.update(item.id, {
        status: 'scheduled',
        approved_by: 'admin',
        approved_at: new Date().toISOString(),
      });
      // Fire the actual send
      await base44.functions.invoke('sendBrandedEmail', {
        to: item.recipient,
        subject: item.rendered_subject,
        html: item.rendered_body,
      });
      await base44.entities.MessageQueue.update(item.id, { status: 'sent', sent_at: new Date().toISOString() });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['message-queue'] }); toast.success('Email approved & sent'); },
    onError: () => toast.error('Failed to send'),
  });

  const cancel = useMutation({
    mutationFn: (id) => base44.entities.MessageQueue.update(id, { status: 'cancelled' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['message-queue'] }); toast.success('Cancelled'); },
  });

  const pending = queue.filter(q => q.status === 'pending_approval');
  const rest    = queue.filter(q => q.status !== 'pending_approval');

  if (isLoading) return <div className="p-12 text-center text-gray-400">Loading queue…</div>;

  return (
    <div className="space-y-5">
      {/* Pending approval */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-900">Needs Approval ({pending.length})</h3>
          </div>
          <div className="space-y-3">
            {pending.map(item => (
              <QueueCard
                key={item.id}
                item={item}
                onApprove={() => approve.mutate(item)}
                onCancel={() => cancel.mutate(item.id)}
                approving={approve.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">No messages awaiting approval</p>
        </div>
      )}

      {/* Recent queue */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Queue ({rest.length})</h3>
        {rest.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
            <Mail className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p>No messages in queue</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {rest.slice(0, 30).map(item => {
              const s = STATUS_STYLES[item.status] || STATUS_STYLES.cancelled;
              const Icon = s.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <div style={{ background: s.bg }} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon style={{ color: s.color }} className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.rendered_subject || item.template_name || 'Message'}</p>
                      <span style={{ background: s.bg, color: s.color }} className="text-[10px] font-bold px-2 py-0.5 rounded-full">{s.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">→ {item.recipient} {item.client_name ? `(${item.client_name})` : ''}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {new Date(item.created_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function QueueCard({ item, onApprove, onCancel, approving }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{item.rendered_subject || item.template_name || 'Message'}</p>
          <p className="text-xs text-gray-600 mt-0.5">To: {item.recipient} {item.client_name ? `· ${item.client_name}` : ''}</p>
          {item.trigger_event && <p className="text-[10px] text-amber-700 mt-1 font-medium">Trigger: {item.trigger_event}</p>}
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">
          {new Date(item.created_date).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Body preview */}
      {item.rendered_body && (
        <div className="bg-white border border-amber-100 rounded-lg p-3 max-h-28 overflow-hidden text-xs text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item.rendered_body.replace(/<[^>]+>/g, ' ').slice(0, 300) + '…' }} />
      )}

      <div className="flex gap-2">
        <button onClick={onApprove} disabled={approving}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
          <Send className="w-3.5 h-3.5" /> {approving ? 'Sending…' : 'Approve & Send'}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600 text-xs font-medium rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}