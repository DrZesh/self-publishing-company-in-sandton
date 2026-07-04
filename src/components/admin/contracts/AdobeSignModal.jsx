import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Upload, FileText, ExternalLink, Loader2, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AdobeSignModal({ contract, contact, onClose, onSent }) {
  const [signerName, setSignerName] = useState(contact?.full_name || contract?.signer_name || '');
  const [signerEmail, setSignerEmail] = useState(contact?.email || contract?.signer_email || '');
  const [message, setMessage] = useState('Please review and sign the attached contract at your earliest convenience.');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [fileUrl, setFileUrl] = useState(contract?.contract_file_url || '');
  const [fileName, setFileName] = useState('');
  const [showWebhookInfo, setShowWebhookInfo] = useState(false);
  const [webhookRegistering, setWebhookRegistering] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const webhookUrl = `${supabaseUrl}/functions/v1/adobe-sign-webhook`;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(result.file_url);
      setFileName(file.name);
      toast.success('File uploaded');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!signerName.trim()) return toast.error('Signer name is required');
    if (!signerEmail.trim() || !/\S+@\S+\.\S+/.test(signerEmail)) return toast.error('Valid signer email is required');
    if (!fileUrl) return toast.error('Please upload a document or use the existing contract file');

    setSending(true);
    try {
      const res = await base44.functions.invoke('adobeSignActions', {
        action: 'send',
        contract_id: contract.id,
        signer_name: signerName,
        signer_email: signerEmail,
        file_url: fileUrl,
        filename: fileName || `${contract.title || 'Contract'}.pdf`,
        message,
      });

      if (res.data?.success) {
        toast.success(`Document sent to ${signerEmail} via Adobe Sign`);
        onSent?.();
        onClose();
      } else {
        throw new Error(res.data?.error || 'Failed to send');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleRegisterWebhook = async () => {
    setWebhookRegistering(true);
    try {
      const res = await base44.functions.invoke('adobeSignActions', {
        action: 'register_webhook',
        webhook_url: webhookUrl,
      });
      if (res.data?.success) {
        toast.success('Webhook registered with Adobe Sign');
      } else {
        throw new Error(res.data?.error || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWebhookRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Send via Adobe Sign</h2>
              <p className="text-sm text-gray-500">{contract.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Signer info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Signer Name</label>
              <Input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Signer Email</label>
              <Input value={signerEmail} onChange={e => setSignerEmail(e.target.value)} placeholder="email@example.com" type="email" />
            </div>
          </div>

          {/* Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document</label>
            {fileUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700 flex-1 truncate">{fileName || 'Existing contract file'}</span>
                <button onClick={() => { setFileUrl(''); setFileName(''); }} className="text-xs text-gray-400 hover:text-gray-600">Change</button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#B87333]/50 hover:bg-amber-50/30 transition-colors">
                {uploading ? <Loader2 className="w-6 h-6 text-[#B87333] animate-spin" /> : <Upload className="w-6 h-6 text-gray-400" />}
                <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload PDF'}</span>
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message to signer</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#B87333]/30 focus:border-[#B87333]"
            />
          </div>

          {/* Webhook info */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowWebhookInfo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
            >
              <span className="font-medium">⚙️ Webhook Setup (one-time)</span>
              <span className="text-gray-400 text-xs">{showWebhookInfo ? '▲' : '▼'}</span>
            </button>
            {showWebhookInfo && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">Register this webhook URL with Adobe Sign to receive real-time status updates (viewed, signed, declined, expired).</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 truncate">{webhookUrl}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success('Copied'); }}
                    className="p-1.5 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={webhookRegistering}
                  onClick={handleRegisterWebhook}
                  className="w-full gap-2"
                >
                  {webhookRegistering ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                  {webhookRegistering ? 'Registering...' : 'Auto-Register Webhook'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending...' : 'Send for Signature'}
          </Button>
        </div>
      </div>
    </div>
  );
}
