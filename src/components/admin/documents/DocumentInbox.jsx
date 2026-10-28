import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { Link } from 'react-router-dom';
import {
  Clock, AlertTriangle, Eye, Upload, MessageSquare, Mail,
  CheckCircle, FileText, Inbox, RefreshCw
} from 'lucide-react';

const SECTIONS = [
  {
    key: 'awaiting_signature',
    label: 'Awaiting Signature',
    icon: FileText,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-100',
    dot: 'bg-yellow-400',
    filter: d => d.status === 'Awaiting Signature' && !d.is_template,
  },
  {
    key: 'awaiting_approval',
    label: 'Awaiting Approval',
    icon: CheckCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-100',
    dot: 'bg-orange-400',
    filter: d => d.status === 'Awaiting Approval' && !d.is_template,
  },
  {
    key: 'opened_not_signed',
    label: 'Opened — Not Signed',
    icon: Eye,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100',
    dot: 'bg-blue-400',
    filter: d => ['Opened', 'Viewed'].includes(d.status) && d.requires_signature,
  },
  {
    key: 'proof_uploaded',
    label: 'Proof Uploaded — Needs Review',
    icon: Upload,
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-100',
    dot: 'bg-teal-400',
    filter: d => d.status === 'Payment Proof Uploaded',
  },
  {
    key: 'client_comment',
    label: 'Client Comments / Questions',
    icon: MessageSquare,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-100',
    dot: 'bg-purple-400',
    filter: d => !!d.client_message,
  },
  {
    key: 'expired',
    label: 'Expired Links',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-100',
    dot: 'bg-red-400',
    filter: d => d.status === 'Expired',
  },
  {
    key: 'pending_templates',
    label: 'Templates Pending Approval',
    icon: RefreshCw,
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-100',
    dot: 'bg-violet-400',
    filter: d => d.is_template && d.template_status === 'Pending Approval',
  },
];

function DocItem({ doc, contacts }) {
  const contact = contacts.find(c => c.id === doc.contact_id);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{doc.template_label || doc.file_name}</p>
        {contact && <p className="text-[10px] text-gray-400">{contact.full_name}</p>}
        {doc.client_message && <p className="text-[10px] text-gray-500 truncate italic">"{doc.client_message}"</p>}
      </div>
      {doc.sent_at && (
        <span className="text-[10px] text-gray-400 flex-shrink-0">
          {new Date(doc.sent_at).toLocaleDateString('en-ZA')}
        </span>
      )}
    </div>
  );
}

export default function DocumentInbox({ contacts = [] }) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => platform.entities.Document.list('-updated_date', 500),
  });

  const totalActions = SECTIONS.reduce((acc, s) => acc + documents.filter(s.filter).length, 0);

  if (isLoading) return <div className="text-center py-8 text-gray-400 text-sm">Loading inbox...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Inbox className="w-6 h-6 text-gray-700" />
          {totalActions > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {totalActions > 9 ? '9+' : totalActions}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Document Inbox</h2>
          <p className="text-xs text-gray-500">{totalActions} item{totalActions !== 1 ? 's' : ''} need attention</p>
        </div>
      </div>

      {totalActions === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-green-700 font-semibold">All clear!</p>
          <p className="text-xs text-green-600 mt-1">No documents need attention right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const items = documents.filter(section.filter);
            if (items.length === 0) return null;
            return (
              <div key={section.key} className={`rounded-xl border p-4 ${section.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${section.dot}`} />
                  <Icon className={`w-4 h-4 ${section.color}`} />
                  <p className={`text-sm font-semibold ${section.color}`}>{section.label}</p>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white ${section.color}`}>
                    {items.length}
                  </span>
                </div>
                <div className="bg-white rounded-lg px-3 divide-y divide-gray-50 max-h-48 overflow-y-auto">
                  {items.slice(0, 6).map(doc => (
                    <DocItem key={doc.id} doc={doc} contacts={contacts} />
                  ))}
                  {items.length > 6 && (
                    <p className="text-[10px] text-gray-400 py-2 text-center">+{items.length - 6} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}