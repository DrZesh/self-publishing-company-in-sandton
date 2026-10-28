import React from 'react';
import { FolderOpen, Download, ExternalLink, FileText } from 'lucide-react';

export default function DocumentsTab({ documents = [] }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-16 text-center">
        <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Documents Yet</h3>
        <p className="text-gray-400">Documents will be shared here as your project progresses.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map(doc => {
        const hasSecureLink = doc.secure_token && doc.expires_at && new Date(doc.expires_at) > new Date();
        const secureUrl = hasSecureLink ? `/doc/view/${doc.id}/${doc.secure_token}` : null;
        const needsAction = ['Sent to Client', 'Opened', 'Awaiting Signature', 'Awaiting Approval'].includes(doc.status);
        
        return (
          <div
            key={doc.id}
            className={`group bg-white rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 ${
              needsAction ? 'border-[#B87333] bg-orange-50' : 'border-gray-200 hover:border-[#B87333]/40'
            }`}
            style={{
              boxShadow: needsAction ? '0 4px 16px rgba(184, 115, 51, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${needsAction ? 'bg-[#B87333] text-white' : 'bg-purple-100 text-purple-600'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{doc.file_name}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {doc.category}{doc.book_title && <span className="font-medium text-gray-900"> · {doc.book_title}</span>}
                    </p>
                  </div>
                </div>
              </div>
              <StatusBadge status={doc.status} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {secureUrl && (
                <a
                  href={secureUrl}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#B87333]/30 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  {needsAction ? 'Open & Take Action' : 'View Document'}
                </a>
              )}
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-700 hover:border-[#B87333] text-gray-300 hover:text-[#D4A574] rounded-xl text-sm font-bold transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Draft': 'bg-gray-200 text-gray-700',
    'Sent to Client': 'bg-blue-100 text-blue-700',
    'Opened': 'bg-blue-100 text-blue-700',
    'Awaiting Signature': 'bg-yellow-100 text-yellow-700',
    'Awaiting Approval': 'bg-yellow-100 text-yellow-700',
    'Signed': 'bg-green-100 text-green-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-200 text-gray-700'}`}>
      {status}
    </span>
  );
}