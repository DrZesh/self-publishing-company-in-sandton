import React from 'react';
import { AlertTriangle, ChevronRight, Clock, CheckCircle, Download, ExternalLink } from 'lucide-react';

export default function ActionRequiredTab({ actionItems }) {
  if (actionItems.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-green-500/20 p-16 text-center shadow-xl">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">All Caught Up!</h3>
        <p className="text-gray-400">No action required right now. We'll notify you when there's something new.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {actionItems.map((item, i) => {
        const secureUrl = item.doc ? `/doc/view/${item.doc.id}/${item.doc.secure_token}` : null;
        return (
          <div
            key={i}
            className="group relative bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#B87333]/10 hover:border-[#B87333]/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="font-bold text-white text-base">{item.label}</p>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  <span className="font-medium text-gray-300">{item.doc?.file_name || item.invoice?.invoice_number || item.proof?.title}</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.doc?.expires_at ? `Respond by ${new Date(item.doc.expires_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}` : 'Action needed'}
                </p>
              </div>
              {secureUrl && (
                <a
                  href={secureUrl}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#B87333] to-[#D4A574] rounded-xl text-sm font-bold text-white shadow-lg shadow-[#B87333]/30 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Open
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}