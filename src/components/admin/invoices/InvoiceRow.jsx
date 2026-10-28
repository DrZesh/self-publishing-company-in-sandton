import React from 'react';
import { Eye, Download, Mail } from 'lucide-react';

export default function InvoiceRow({ invoice, contact, onSelected, onSend, isSelected }) {
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !['Paid', 'Cancelled'].includes(invoice.status);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <tr 
      className={`border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      } ${isOverdue ? 'bg-red-50' : ''}`}
      onClick={() => onSelected(invoice)}
    >
      <td className="px-4 py-3">
        {isSelected && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-gray-900">{invoice.invoice_number}</td>
      <td className="px-4 py-3">
        <span className="text-gray-900 font-medium">{contact?.full_name || '—'}</span>
        {contact?.company && <p className="text-xs text-gray-500">{contact.company}</p>}
      </td>
      <td className="px-4 py-3 text-gray-600">{invoice.book_title || '—'}</td>
      <td className="px-4 py-3 font-medium text-gray-900">
        R {(invoice.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 font-medium">
        <span className={(invoice.balance_due || 0) > 0 ? 'text-orange-600' : 'text-green-600'}>
          R {(invoice.balance_due || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
        </span>
      </td>
      <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
        {formatDate(invoice.due_date)}
        {isOverdue && (
          <p className="text-xs text-red-500 mt-0.5">
            {Math.ceil((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))} days overdue
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
          invoice.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-300' :
          invoice.status === 'Overdue' ? 'bg-red-100 text-red-700 border-red-300' :
          invoice.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
          invoice.status === 'Sent' ? 'bg-blue-100 text-blue-700 border-blue-300' :
          'bg-gray-100 text-gray-700 border-gray-300'
        }`}>
          {invoice.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); onSelected(invoice); }}
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          {invoice.status !== 'Paid' && (
            <button
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={(e) => { e.stopPropagation(); onSend(invoice); }}
              title="Send Reminder"
            >
              <Mail className="w-4 h-4 text-blue-600" />
            </button>
          )}
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); window.open(`/invoice/view/${invoice.id}/${invoice.view_token}`, '_blank'); }}
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </td>
    </tr>
  );
}