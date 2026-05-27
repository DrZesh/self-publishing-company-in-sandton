import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import { 
  FileText, FileSignature, Receipt, CheckCircle, Clock, AlertTriangle,
  Eye, XCircle, RefreshCw, ArrowRight
} from 'lucide-react';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent to Client': 'bg-blue-100 text-blue-700',
  'Opened': 'bg-sky-100 text-sky-700',
  'Viewed': 'bg-purple-100 text-purple-700',
  'Downloaded': 'bg-indigo-100 text-indigo-700',
  'Awaiting Signature': 'bg-yellow-100 text-yellow-700',
  'Signed': 'bg-green-100 text-green-700',
  'Awaiting Approval': 'bg-orange-100 text-orange-700',
  'Approved': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Changes Requested': 'bg-amber-100 text-amber-700',
  'Payment Proof Uploaded': 'bg-teal-100 text-teal-700',
  'Expired': 'bg-gray-200 text-gray-500',
};

function DocRow({ doc, contact }) {
  const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {contact && <span className="text-xs text-gray-500">{contact.full_name}</span>}
          <span className="text-xs text-gray-400">{doc.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isExpired && <span className="text-xs text-orange-500 font-medium">Expired</span>}
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
          {doc.status}
        </span>
        {doc.sent_at && (
          <span className="text-xs text-gray-400">{new Date(doc.sent_at).toLocaleDateString('en-ZA')}</span>
        )}
      </div>
    </div>
  );
}

export default function AdminDocumentDashboard() {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-updated_date', 500),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));
  const today = new Date();
  const todayStr = today.toDateString();

  const sections = [
    {
      label: 'Quotes Awaiting Response',
      icon: FileText,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      docs: documents.filter(d => d.category === 'Quotation' && ['Sent to Client','Opened','Viewed'].includes(d.status)),
    },
    {
      label: 'Invoices Awaiting Payment',
      icon: Receipt,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      docs: documents.filter(d => d.category === 'Invoice' && ['Sent to Client','Opened','Viewed'].includes(d.status)),
    },
    {
      label: 'Contracts Awaiting Signature',
      icon: FileSignature,
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      docs: documents.filter(d => ['Unsigned Contract'].includes(d.category) && ['Sent to Client','Opened','Viewed'].includes(d.status)),
    },
    {
      label: 'Proofs Awaiting Approval',
      icon: CheckCircle,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      docs: documents.filter(d => d.category === 'Proof Approval' && ['Sent to Client','Opened','Viewed','Changes Requested'].includes(d.status)),
    },
    {
      label: 'Changes Requested',
      icon: RefreshCw,
      color: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      docs: documents.filter(d => d.status === 'Changes Requested'),
    },
    {
      label: 'Payment Proof Uploaded',
      icon: CheckCircle,
      color: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600',
      docs: documents.filter(d => d.status === 'Payment Proof Uploaded'),
    },
    {
      label: 'Expired Links',
      icon: Clock,
      color: 'bg-gray-50 border-gray-200',
      iconColor: 'text-gray-500',
      docs: documents.filter(d => d.status === 'Expired' || (d.expires_at && new Date(d.expires_at) < today && ['Sent to Client','Opened'].includes(d.status))),
    },
    {
      label: 'Opened Today',
      icon: Eye,
      color: 'bg-sky-50 border-sky-200',
      iconColor: 'text-sky-600',
      docs: documents.filter(d => d.opened_at && new Date(d.opened_at).toDateString() === todayStr),
    },
    {
      label: 'Never Opened (Sent)',
      icon: AlertTriangle,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-500',
      docs: documents.filter(d => d.status === 'Sent to Client' && !d.opened_at),
    },
    {
      label: 'Recently Signed / Approved',
      icon: CheckCircle,
      color: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      docs: documents.filter(d => ['Signed','Approved'].includes(d.status)).slice(0, 10),
    },
  ];

  const kpis = [
    { label: 'Total Documents', value: documents.length, color: 'text-gray-900' },
    { label: 'Needs Action', value: documents.filter(d => ['Sent to Client','Opened','Awaiting Signature','Awaiting Approval','Changes Requested','Payment Proof Uploaded'].includes(d.status)).length, color: 'text-orange-600' },
    { label: 'Approved / Signed', value: documents.filter(d => ['Approved','Signed'].includes(d.status)).length, color: 'text-green-600' },
    { label: 'Expired Links', value: documents.filter(d => d.status === 'Expired').length, color: 'text-red-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Live status of all sent documents and client actions</p>
          </div>
          <Link to="/admin/documents" className="flex items-center gap-2 text-sm text-[#B87333] hover:underline font-medium">
            All Documents <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Sections grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <div key={section.label} className={`rounded-xl border p-4 ${section.color}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${section.iconColor}`} />
                    <h3 className="text-sm font-semibold text-gray-800">{section.label}</h3>
                    <span className="ml-auto text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border">{section.docs.length}</span>
                  </div>
                  {section.docs.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">None right now ✓</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {section.docs.map(doc => (
                        <DocRow key={doc.id} doc={doc} contact={contactMap[doc.contact_id]} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}