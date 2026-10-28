import React from 'react';
import { Download, Eye, Calendar } from 'lucide-react';
import {
  FILETYPE_ICON, CATEGORY_ICON, FILETYPE_TINT, formatFileSize, formatDate,
} from '@/lib/resourceDocsConfig';

export default function DocumentCard({ doc, onView, onDownload }) {
  const FileIcon = FILETYPE_ICON[doc.file_type] || FILETYPE_ICON.Other;
  const CatIcon = CATEGORY_ICON[doc.category] || CATEGORY_ICON.Other;
  const tint = FILETYPE_TINT[doc.file_type] || '#B8955B';
  const size = formatFileSize(doc.file_size_kb);
  const date = formatDate(doc.updated_date);

  return (
    <div className="flex flex-col bg-white border border-[#E5E0D8] rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${tint}14`, border: `1px solid ${tint}33` }}
          >
            <FileIcon className="w-5 h-5" style={{ color: tint }} strokeWidth={1.75} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-[#FAF5EE] text-copper border border-[#EADFCC]">
            <CatIcon className="w-3 h-3" />
            {doc.category}
          </span>
        </div>

        <h3 className="font-heading text-lg font-bold text-[#2C2C2C] mb-2 leading-snug">{doc.title}</h3>
        {doc.description && (
          <p className="text-sm font-body text-[#6B6B6B] leading-relaxed line-clamp-3">{doc.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-xs font-body text-[#9A948B]">
          <span className="uppercase tracking-wider font-medium">{doc.file_type}</span>
          {size && <><span>·</span><span>{size}</span></>}
          {date && <><span>·</span><span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span></>}
        </div>
      </div>

      <div className="px-6 pb-6 flex items-center gap-2.5">
        <button
          onClick={() => onView(doc)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#2C2C2C] bg-[#F5F1EA] hover:bg-[#EDE7DD] border border-[#E5E0D8] rounded-lg transition-colors flex-1 justify-center"
        >
          <Eye className="w-4 h-4" /> View
        </button>
        <button
          onClick={() => onDownload(doc)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-copper hover:bg-copper/90 rounded-lg transition-colors flex-1 justify-center"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}