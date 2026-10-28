import React from 'react';
import { PenLine, CheckCircle } from 'lucide-react';

export default function ContractsTab({ contracts }) {
  if (!contracts || contracts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-16 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <PenLine className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Contracts Yet</h3>
        <p className="text-gray-400">Contracts will appear here when ready for signature.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {contracts.map(c => (
        <div key={c.id} className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-lg">{c.title}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{c.book_title}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
          
          <div className="flex items-center gap-4 pt-4 border-t border-gray-800/50">
            {c.admin_signed_at && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Admin signed: {new Date(c.admin_signed_at).toLocaleDateString('en-ZA')}</span>
              </div>
            )}
            {c.signed_at && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>You signed: {new Date(c.signed_at).toLocaleDateString('en-ZA')}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex gap-3">
            {c.contract_file_url && (
              <a
                href={c.contract_file_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#D4A574] hover:underline flex items-center gap-1"
              >
                📄 View Contract
              </a>
            )}
            {c.signed_file_url && (
              <a
                href={c.signed_file_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#D4A574] hover:underline flex items-center gap-1"
              >
                📄 View Signed Copy
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Draft': 'bg-gray-500/20 text-gray-400',
    'Sent for Signature': 'bg-blue-500/20 text-blue-400',
    'Opened': 'bg-blue-500/20 text-blue-400',
    'Viewed': 'bg-blue-500/20 text-blue-400',
    'Signing Started': 'bg-yellow-500/20 text-yellow-400',
    'Signed': 'bg-green-500/20 text-green-400',
    'Fully Signed': 'bg-green-500/20 text-green-400',
    'Declined': 'bg-red-500/20 text-red-400',
    'Expired': 'bg-gray-500/20 text-gray-400',
  };
  
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}