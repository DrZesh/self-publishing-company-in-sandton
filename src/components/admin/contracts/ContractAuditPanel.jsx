import { X, Clock, Send, Eye, PenLine, CheckCircle, AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import { useState } from 'react';

const EVENT_CONFIG = {
  sent:            { icon: Send,         color: 'bg-blue-100 text-blue-600',    label: 'Sent for Signature' },
  resent:          { icon: RefreshCw,    color: 'bg-blue-100 text-blue-600',    label: 'Resent' },
  opened:          { icon: Eye,          color: 'bg-yellow-100 text-yellow-600', label: 'Opened' },
  viewed:          { icon: Eye,          color: 'bg-yellow-100 text-yellow-700', label: 'Viewed Document' },
  signing_started: { icon: PenLine,      color: 'bg-purple-100 text-purple-600', label: 'Started Signing' },
  signed:          { icon: CheckCircle,  color: 'bg-green-100 text-green-600',  label: 'Signed' },
  declined:        { icon: AlertTriangle,color: 'bg-red-100 text-red-600',      label: 'Declined' },
};

export default function ContractAuditPanel({ contract, onClose, onUpdated }) {
  const [sending, setSending] = useState(false);
  const trail = Array.isArray(contract.audit_trail) ? contract.audit_trail : [];
  const signingUrl = contract.sign_token
    ? `${window.location.origin}/sign/contract/${contract.sign_token}`
    : null;

  const handleResend = async () => {
    setSending(true);
    const res = await platform.functions.invoke('contractSignature', { action: 'resend', contract_id: contract.id });
    setSending(false);
    if (res.data?.success) { toast.success('Signing link resent'); onUpdated(); }
    else toast.error(res.data?.error || 'Failed to resend');
  };

  const copyLink = () => {
    if (!signingUrl) return;
    navigator.clipboard.writeText(signingUrl);
    toast.success('Signing link copied');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Signature Audit Trail</h2>
            <p className="text-xs text-gray-500 truncate max-w-[260px]">{contract.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Status */}
          <div className={`rounded-xl p-4 ${contract.status === 'Signed' ? 'bg-green-50 border border-green-200' : contract.status === 'Declined' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-gray-500">Current Status</p>
            <p className={`text-lg font-bold ${contract.status === 'Signed' ? 'text-green-700' : contract.status === 'Declined' ? 'text-red-700' : 'text-blue-700'}`}>{contract.status}</p>
          </div>

          {/* Signer Info (if signed) */}
          {contract.status === 'Signed' && contract.signer_name && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Signature Details</p>
              {[
                ['Signed by', contract.signer_name],
                ['Email', contract.signer_email],
                ['Signed at', contract.signed_at ? new Date(contract.signed_at).toLocaleString('en-ZA') : '—'],
                ['IP Address', contract.signer_ip || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900 font-medium text-right max-w-[200px] truncate">{value}</span>
                </div>
              ))}
              {contract.signature_image_url && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-1">Signature</p>
                  <img src={contract.signature_image_url} alt="Signature" className="max-h-20 border border-gray-200 rounded-lg bg-white p-2" />
                </div>
              )}
            </div>
          )}

          {/* Actions (if not yet signed) */}
          {!['Signed', 'Declined', 'Archived', 'Cancelled'].includes(contract.status) && (
            <div className="space-y-2">
              {signingUrl && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Signing Link</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={signingUrl}
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 truncate"
                    />
                    <Button size="sm" variant="outline" onClick={copyLink}>Copy</Button>
                  </div>
                </div>
              )}
              <Button
                size="sm"
                onClick={handleResend}
                disabled={sending}
                className="w-full bg-[#B87333] hover:bg-[#A06828] text-white"
              >
                {sending ? 'Sending...' : '📧 Resend Signing Link'}
              </Button>
            </div>
          )}

          {/* Signed doc link */}
          {contract.status === 'Signed' && contract.contract_file_url && (
            <a href={contract.contract_file_url} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="w-full">📄 View Signed Contract</Button>
            </a>
          )}

          {/* Audit Trail */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Activity Timeline</p>
            {trail.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No activity recorded yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {[...trail].reverse().map((item, i) => {
                    const cfg = EVENT_CONFIG[item.event] || { icon: Clock, color: 'bg-gray-100 text-gray-500', label: item.event };
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="flex gap-3 items-start pl-0">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{cfg.label}</p>
                          <p className="text-xs text-gray-400">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString('en-ZA') : ''}
                          </p>
                          {item.actor && <p className="text-xs text-gray-400">By: {item.actor}</p>}
                          {item.signer_name && <p className="text-xs text-gray-400">Signer: {item.signer_name}</p>}
                          {item.ip && <p className="text-xs text-gray-300">IP: {item.ip}</p>}
                          {item.reason && <p className="text-xs text-red-400">Reason: {item.reason}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}