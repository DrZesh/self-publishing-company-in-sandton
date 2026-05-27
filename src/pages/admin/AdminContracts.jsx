import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileSignature, Upload, Send, CheckCircle, Clock, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import ContractModal from '@/components/admin/contracts/ContractModal';
import ContractAuditPanel from '@/components/admin/contracts/ContractAuditPanel';
import AdobeSignModal from '@/components/admin/contracts/AdobeSignModal';
import { toast } from 'sonner';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent for Signature': 'bg-blue-100 text-blue-700',
  'Opened': 'bg-yellow-100 text-yellow-700',
  'Viewed': 'bg-yellow-100 text-yellow-800',
  'Signing Started': 'bg-purple-100 text-purple-700',
  'Signed': 'bg-green-100 text-green-700',
  'Declined': 'bg-red-100 text-red-700',
  'Expired': 'bg-red-100 text-red-700',
  'Resent': 'bg-blue-100 text-blue-600',
  'Cancelled': 'bg-gray-200 text-gray-500',
  'Archived': 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS = {
  'Draft': Clock,
  'Sent for Signature': Send,
  'Opened': Eye,
  'Viewed': Eye,
  'Signing Started': FileSignature,
  'Signed': CheckCircle,
  'Declined': AlertTriangle,
  'Expired': AlertTriangle,
  'Resent': RefreshCw,
  'Cancelled': AlertTriangle,
};

export default function AdminContracts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [auditContract, setAuditContract] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [adobeSignContract, setAdobeSignContract] = useState(null);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const updateContract = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contract.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const handleSendForSignature = async (contract) => {
    setSendingId(contract.id);
    const res = await base44.functions.invoke('contractSignature', { action: 'send', contract_id: contract.id });
    setSendingId(null);
    if (res.data?.success) {
      toast.success('Signing link sent to client');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    } else {
      toast.error(res.data?.error || 'Failed to send');
    }
  };

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase();
    const contact = contactMap[c.contact_id];
    const matchSearch = !q || c.title?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const unsignedCount = contracts.filter(c => ['Sent for Signature', 'Opened', 'Viewed', 'Signing Started', 'Resent'].includes(c.status)).length;
  const signedCount = contracts.filter(c => c.status === 'Signed').length;
  const expiredCount = contracts.filter(c => c.status === 'Expired').length;

  const markSigned = (contract) => {
    updateContract.mutate({ id: contract.id, data: { status: 'Signed', signed_at: new Date().toISOString() } });
  };

  const markSent = (contract) => {
    updateContract.mutate({ id: contract.id, data: { status: 'Sent', sent_at: new Date().toISOString() } });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage all client contracts</p>
          </div>
          <Button onClick={() => { setEditingContract(null); setShowModal(true); }} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> New Contract
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Contracts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{contracts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Awaiting Signature</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{unsignedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Signed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{signedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{expiredCount}</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['', 'Draft', 'Sent for Signature', 'Signed', 'Declined', 'Expired', 'Cancelled'].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-[#B87333] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s || 'All'}
              {s && (
                <span className="ml-1.5 text-xs opacity-70">({contracts.filter(c => c.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search contracts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Contracts List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading contracts...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <FileSignature className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No contracts found</p>
            </div>
          ) : (
            filtered.map(contract => {
              const contact = contactMap[contract.contact_id];
              const StatusIcon = STATUS_ICONS[contract.status] || Clock;
              const isExpiringSoon = contract.expiry_date && !['Signed', 'Cancelled', 'Expired'].includes(contract.status) && new Date(contract.expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              return (
                <div key={contract.id} className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${isExpiringSoon ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${STATUS_COLORS[contract.status]?.split(' ')[0] || 'bg-gray-100'}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{contract.title}</p>
                        <p className="text-sm text-gray-500">{contact?.full_name} {contract.book_title && `· ${contract.book_title}`}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-600'}`}>
                        {contract.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {contract.sent_at && <span>Sent: {new Date(contract.sent_at).toLocaleDateString('en-ZA')}</span>}
                      {contract.signed_at && <span className="text-green-600">Signed: {new Date(contract.signed_at).toLocaleDateString('en-ZA')}</span>}
                      {contract.expiry_date && <span className={isExpiringSoon ? 'text-orange-600 font-medium' : ''}>Expires: {new Date(contract.expiry_date).toLocaleDateString('en-ZA')}</span>}
                    </div>
                    {contract.notes && <p className="text-xs text-gray-400 mt-1 truncate">{contract.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {contract.contract_file_url && (
                      <a href={contract.contract_file_url} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">View</Button>
                      </a>
                    )}
                    {['Draft', 'Sent for Signature', 'Opened', 'Viewed', 'Signing Started', 'Resent', 'Expired'].includes(contract.status) && (
                      <Button
                        size="sm"
                        onClick={() => setAdobeSignContract(contract)}
                        className="bg-red-600 hover:bg-red-700 text-white gap-1"
                        title="Send via Adobe Acrobat Sign"
                      >
                        <FileSignature className="w-3 h-3" />
                        Adobe Sign
                      </Button>
                    )}
                    {['Draft', 'Sent for Signature', 'Opened', 'Viewed', 'Signing Started', 'Resent', 'Expired'].includes(contract.status) && contract.contract_file_url && (
                      <Button
                        size="sm"
                        disabled={sendingId === contract.id}
                        onClick={() => handleSendForSignature(contract)}
                        className="bg-[#B87333] hover:bg-[#A06828] text-white gap-1"
                      >
                        <Send className="w-3 h-3" />
                        {sendingId === contract.id ? 'Sending...' : contract.status === 'Draft' ? 'Send Link' : 'Resend Link'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setAuditContract(contract)}>
                      <Eye className="w-3 h-3 mr-1" /> Audit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingContract(contract); setShowModal(true); }}>Edit</Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {adobeSignContract && (
        <AdobeSignModal
          contract={adobeSignContract}
          contact={contactMap[adobeSignContract.contact_id]}
          onClose={() => setAdobeSignContract(null)}
          onSent={() => { queryClient.invalidateQueries({ queryKey: ['contracts'] }); }}
        />
      )}

      {auditContract && (
        <ContractAuditPanel
          contract={auditContract}
          onClose={() => setAuditContract(null)}
          onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['contracts'] }); setAuditContract(null); }}
        />
      )}

      {showModal && (
        <ContractModal
          contract={editingContract}
          contacts={contacts}
          onClose={() => { setShowModal(false); setEditingContract(null); }}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['contracts'] }); setShowModal(false); setEditingContract(null); }}
        />
      )}
    </AdminLayout>
  );
}