import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function QuotesTab({ quotes = [] }) {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-16 text-center">
        <div className="w-20 h-20 bg-[#B87333]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-[#D4A574]" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Quotes Yet</h3>
        <p className="text-gray-400">Your quotes will appear here once created by our team.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {quotes.map(q => (
        <div key={q.id} className="group bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl border border-gray-700/50 p-6 shadow-xl hover:shadow-2xl hover:border-[#B87333]/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-white text-lg">{q.book_title || q.quote_number}</h3>
                {q.mode === 'premium' && (
                  <span className="px-2 py-1 bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white rounded-full text-[10px] font-bold uppercase tracking-wide">Premium</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="font-semibold text-white">R {(q.total || 0).toLocaleString()}</span>
                <span>·</span>
                <span>{new Date(q.created_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={q.status} />
              {q.pdf_url ? (
                <a href={q.pdf_url} target="_blank" rel="noreferrer" className="p-2.5 bg-gray-800/50 hover:bg-[#B87333] hover:text-white rounded-xl transition-all duration-300" title="Download PDF">
                  <Download className="w-4 h-4" />
                </a>
              ) : (
                <button 
                  onClick={() => alert(`Quote: ${q.quote_number || q.book_title}\n\nTotal: R ${(q.total || 0).toLocaleString()}\nStatus: ${q.status}\n\nPDF will be available once the quote is finalized.`)}
                  className="p-2.5 bg-gray-800/50 hover:bg-[#B87333] hover:text-white rounded-xl transition-all duration-300"
                  title="View Quote Details"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Draft': 'bg-gray-500/20 text-gray-400',
    'Sent': 'bg-blue-500/20 text-blue-400',
    'Accepted': 'bg-green-500/20 text-green-400',
    'Declined': 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}