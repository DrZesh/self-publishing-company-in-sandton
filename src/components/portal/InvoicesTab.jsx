import React from 'react';
import { CreditCard, AlertTriangle, Calendar, FileText } from 'lucide-react';

export default function InvoicesTab({ invoices = [] }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-16 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Invoices Yet</h3>
        <p className="text-gray-400">Invoices will appear here once generated.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {invoices.map(inv => {
        const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && !['Paid', 'Cancelled'].includes(inv.status);
        return (
          <div key={inv.id} className={`group bg-white rounded-2xl border p-6 shadow-lg transition-all duration-300 ${
            isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#B87333]/40'
          }`} style={{
            boxShadow: isOverdue ? '0 4px 16px rgba(239, 68, 68, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{inv.invoice_number}</h3>
                  {isOverdue && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Overdue
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{inv.book_title || 'Project invoice'}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-900">Total: R {(inv.total || 0).toLocaleString()}</span>
                  {inv.amount_paid > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-green-600 font-medium">Paid: R {inv.amount_paid.toLocaleString()}</span>
                    </>
                  )}
                  {(inv.balance_due || 0) > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-orange-600 font-bold">Balance: R {inv.balance_due.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={inv.status} />
                {inv.due_date && (
                  <div className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" />
                    Due {new Date(inv.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  </div>
                )}
                {inv.view_token && (
                  <a 
                    href={`/invoice/view/${inv.id}/${inv.view_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-gray-100 hover:bg-[#B87333] hover:text-white rounded-xl transition-all duration-300"
                    title="View Invoice"
                  >
                    <FileText className="w-4 h-4" />
                  </a>
                )}
              </div>
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
    'Sent': 'bg-blue-100 text-blue-700',
    'Paid': 'bg-green-100 text-green-700',
    'Overdue': 'bg-red-100 text-red-700',
    'Partially Paid': 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-200 text-gray-700'}`}>
      {status}
    </span>
  );
}