import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

export default function DocumentPreviewModal({ doc, onClose, onDownload }) {
  if (!doc) return null;
  const isPdf = doc.file_type === 'PDF';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden bg-white rounded-lg shadow-2xl"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#E5E0D8] shrink-0">
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-bold text-[#2C2C2C] truncate">{doc.title}</h3>
            <p className="text-xs text-[#6B6B6B] font-body">{doc.category} · {doc.file_type}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onDownload(doc)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-copper hover:bg-copper/90 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-[#F5F1EA] transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 min-h-0 bg-[#F5F1EA]">
          {isPdf ? (
            <iframe
              title={doc.title}
              src={`${doc.file_url}#toolbar=1&view=FitH`}
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <p className="text-[#6B6B6B] font-body mb-5 max-w-sm">
                This file type can&rsquo;t be previewed in the browser. Open it in a new tab or download it.
              </p>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#2C2C2C] rounded-lg border border-[#E5E0D8] hover:bg-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}