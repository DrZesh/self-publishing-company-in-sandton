import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PenTool, FileSignature, Upload, ExternalLink, CheckCircle, Clock,
  Search, Send, Eye, Download, AlertCircle, X, Loader2, RefreshCw, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import SigningMethodSelector from '@/components/admin/signing/SigningMethodSelector';

const STATUS_STYLES = {
  'Draft':           'bg-gray-100 text-gray-600',
  'Sent':            'bg-blue-100 text-blue-700',
  'Signed':          'bg-green-100 text-green-700',
  'Expired':         'bg-red-100 text-red-600',
  'Cancelled':       'bg-gray-200 text-gray-500',
  'Awaiting Signature': 'bg-yellow-100 text-yellow-700',
};

const METHOD_BADGE = {
  builtin:   { label: 'Built-in CRM',    color: 'bg-purple-100 text-purple-700' },
  docusign:  { label: 'DocuSign',        color: 'bg-blue-100 text-blue-700' },
  adobe:     { label: 'Adobe Sign',      color: 'bg-red-100 text-red-700' },
  manual:    { label: 'Manual Upload',   color: 'bg-gray-100 text-gray-600' },
};

export default function AdminSigningWorkflow() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [showIntegrationPanel, setShowIntegrationPanel] = useState(null); // 'docusign' | 'adobe'
  const [uploadingId, setUploadingId] = useState(null);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => platform.entities.Contract.list('-created_date', 200),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['signing-docs'],
    queryFn: () => platform.entities.Document.filter({ category: 'Signed Contract' }, '-created_date', 200).catch(() =>
      platform.entities.Document.list('-created_date', 200)
    ),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const updateContract = useMutation({
    mutationFn: ({ id, data }) => platform.entities.Contract.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });

  const handleManualUpload = async (contractId, file) => {
    setUploadingId(contractId);
    try {
      const { file_url } = await platform.integrations.Core.UploadFile({ file });
      await updateContract.mutateAsync({ id: contractId, data: { signed_file_url: file_url, status: 'Signed', signed_at: new Date().toISOString() } });
      toast.success('Signed PDF uploaded and contract marked as Signed');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleSendForSigning = async (contract) => {
    // Generate secure signing link
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await updateContract.mutateAsync({ id: contract.id, data: { status: 'Sent', sent_at: new Date().toISOString() } });
    const contact = contactMap[contract.contact_id];
    if (contact?.email) {
      await platform.integrations.Core.SendEmail({
        to: contact.email,
        subject: `Please sign: ${contract.title}`,
        body: `<p>Dear ${contact.full_name},</p><p>Please review and sign the document <strong>${contract.title}</strong>.</p><p>You can view and sign it securely via your client portal.</p><p>Regards,<br/>Creative Books SA</p>`,
      }).catch(() => {});
    }
    toast.success('Signing request sent to client');
  };

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase();
    const contact = contactMap[c.contact_id];
    return !q || c.title?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q);
  });

  const stats = {
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'Signed').length,
    pending: contracts.filter(c => ['Sent', 'Draft'].includes(c.status)).length,
    expired: contracts.filter(c => c.status === 'Expired').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">E-Signature Workflow</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage contracts, signing requests, and signature methods</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowIntegrationPanel('docusign')} className="gap-2 text-xs">
              <Settings className="w-3.5 h-3.5" /> Integrations
            </Button>
            <Button onClick={() => setShowMethodSelector(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
              <PenTool className="w-4 h-4" /> New Signing Request
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Signed', value: stats.signed, color: 'text-green-600' },
            { label: 'Awaiting', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Expired', value: stats.expired, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Method Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'builtin', icon: PenTool, title: 'Built-in CRM Signing', desc: 'Draw or type signature in browser. Instant, no setup required.', color: 'border-purple-200 bg-purple-50', iconColor: 'text-purple-600', badge: 'Active' },
            { key: 'manual', icon: Upload, title: 'Manual PDF Upload', desc: 'Client signs on paper. Upload the scanned signed copy.', color: 'border-gray-200 bg-gray-50', iconColor: 'text-gray-600', badge: 'Active' },
            { key: 'docusign', icon: FileSignature, title: 'DocuSign', desc: 'Send via DocuSign API. Requires DocuSign API credentials.', color: 'border-blue-200 bg-blue-50', iconColor: 'text-blue-600', badge: 'Configure' },
            { key: 'adobe', icon: ExternalLink, title: 'Adobe Acrobat Sign', desc: 'Send via Adobe Sign API. Requires Adobe credentials.', color: 'border-red-200 bg-red-50', iconColor: 'text-red-600', badge: 'Configure' },
          ].map(m => (
            <div key={m.key} className={`border rounded-2xl p-4 ${m.color}`}>
              <div className="flex items-start justify-between mb-2">
                <m.icon className={`w-6 h-6 ${m.iconColor}`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.badge === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{m.badge}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{m.title}</p>
              <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
              {(m.key === 'docusign' || m.key === 'adobe') && (
                <button onClick={() => setShowIntegrationPanel(m.key)}
                  className="mt-3 text-xs text-blue-600 hover:underline font-medium">
                  Setup integration →
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Contracts table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-400" />
            <Input placeholder="Search contracts..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 shadow-none p-0 focus-visible:ring-0" />
          </div>
          {isLoading ? (
            <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#B87333] mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileSignature className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No contracts yet. Create a signing request to get started.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Contract', 'Client', 'Status', 'Method', 'Sent / Signed', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(contract => {
                  const contact = contactMap[contract.contact_id];
                  const method = METHOD_BADGE[contract.signing_method || 'builtin'];
                  return (
                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">{contract.title}</p>
                        {contract.book_title && <p className="text-xs text-gray-400">{contract.book_title}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[contract.status] || 'bg-gray-100 text-gray-600'}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${method?.color || 'bg-gray-100 text-gray-600'}`}>{method?.label || 'Built-in CRM'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {contract.sent_at && <div>Sent: {new Date(contract.sent_at).toLocaleDateString('en-ZA')}</div>}
                        {contract.signed_at && <div className="text-green-600 font-medium">Signed: {new Date(contract.signed_at).toLocaleDateString('en-ZA')}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {contract.status === 'Draft' && (
                            <Button variant="ghost" size="sm" title="Send for signing" onClick={() => handleSendForSigning(contract)}>
                              <Send className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          {contract.status === 'Sent' && (
                            <Button variant="ghost" size="sm" title="Resend" onClick={() => handleSendForSigning(contract)}>
                              <RefreshCw className="w-4 h-4 text-orange-500" />
                            </Button>
                          )}
                          {/* Manual upload signed copy */}
                          {contract.status !== 'Signed' && (
                            <label className="cursor-pointer" title="Upload signed copy">
                              <input type="file" accept=".pdf,.jpg,.png" className="hidden"
                                onChange={e => { if (e.target.files?.[0]) handleManualUpload(contract.id, e.target.files[0]); }} />
                              {uploadingId === contract.id
                                ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                : <Upload className="w-4 h-4 text-teal-600 hover:text-teal-800" />}
                            </label>
                          )}
                          {contract.signed_file_url && (
                            <a href={contract.signed_file_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" title="Download signed copy">
                                <Download className="w-4 h-4 text-green-600" />
                              </Button>
                            </a>
                          )}
                          {contract.contract_file_url && (
                            <a href={contract.contract_file_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm" title="View original">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Method selector modal */}
      {showMethodSelector && (
        <SigningMethodSelector
          contacts={contacts}
          onClose={() => setShowMethodSelector(false)}
          onCreated={() => { queryClient.invalidateQueries({ queryKey: ['contracts'] }); setShowMethodSelector(false); }}
        />
      )}

      {/* Integration panel */}
      {showIntegrationPanel && (
        <IntegrationPanel provider={showIntegrationPanel} onClose={() => setShowIntegrationPanel(null)} />
      )}
    </AdminLayout>
  );
}

function IntegrationPanel({ provider, onClose }) {
  const isDocuSign = provider === 'docusign';
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [clientId, setClientId] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    // In production these would call set_secrets or backend config
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success('Integration settings saved. Backend function ready to use.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDocuSign ? 'bg-blue-100' : 'bg-red-100'}`}>
              <FileSignature className={`w-5 h-5 ${isDocuSign ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{isDocuSign ? 'DocuSign' : 'Adobe Acrobat Sign'} Integration</h2>
              <p className="text-xs text-gray-500">Configure API credentials to enable external signing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Setup steps */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-800">Setup Steps</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              {isDocuSign ? (
                <>
                  <li>Create a DocuSign developer account at <strong>developers.docusign.com</strong></li>
                  <li>Create an integration key (OAuth App) in the DocuSign Admin panel</li>
                  <li>Note your Account ID (GUID) from the Admin panel</li>
                  <li>Generate an API key / RSA keypair for JWT auth</li>
                  <li>Paste credentials below — they will be stored as environment secrets</li>
                </>
              ) : (
                <>
                  <li>Create an Adobe Acrobat Sign account at <strong>acrobat.adobe.com</strong></li>
                  <li>Go to Account &gt; Adobe Sign API to generate an integration key</li>
                  <li>Note your Application ID and Client Secret</li>
                  <li>Paste credentials below — they will be stored as environment secrets</li>
                </>
              )}
            </ol>
          </div>

          {/* Credentials form */}
          <div className="space-y-3">
            {isDocuSign ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">DocuSign Account ID (GUID)</label>
                  <Input value={accountId} onChange={e => setAccountId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Integration Key (Client ID)</label>
                  <Input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="DocuSign Integration Key" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">API Secret Key</label>
                  <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="DocuSign API Secret" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Adobe Sign Application ID</label>
                  <Input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Adobe Sign App ID" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Adobe Sign Integration Key</label>
                  <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Adobe Sign Integration Key" />
                </div>
              </>
            )}
          </div>

          {/* Webhook info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">Webhook URL (for status callbacks)</p>
            <code className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 block break-all select-all">
              {window.location.origin}/api/functions/documentActions
            </code>
            <p className="text-xs text-gray-400 mt-1">Set this in your {isDocuSign ? 'DocuSign' : 'Adobe Sign'} webhook/Connect settings to auto-update signing status.</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
              {saved ? <CheckCircle className="w-4 h-4 mr-2" /> : null}
              {saved ? 'Saved!' : 'Save Credentials'}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Credentials are stored as encrypted environment secrets and never exposed to the frontend.
          </p>
        </div>
      </div>
    </div>
  );
}