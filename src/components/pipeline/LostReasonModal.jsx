import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function LostReasonModal({ contactName, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <h2 className="text-lg font-bold text-[#1A1208]">Mark as Lost</h2>
          <button onClick={onCancel} className="p-1.5 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-black/60 mb-4">
            Moving <strong>{contactName}</strong> to Lost. Please provide a reason (optional).
          </p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Budget constraints, went with competitor, no response…"
            rows={3}
            className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333] resize-none"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onConfirm(reason)}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
            >
              Confirm Lost
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 border border-black/15 rounded-xl text-sm font-semibold text-black/60 hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}