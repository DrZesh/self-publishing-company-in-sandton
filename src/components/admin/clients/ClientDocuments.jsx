import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { FileText, Receipt, CreditCard } from 'lucide-react';
import { formatZAR } from '@/lib/useCompanySettings';

const QUOTE_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
};

const INV_STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
  'Partially Paid': 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-gray-200 text-gray-500',
};

function Section({ icon: SectionIcon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-5">
      <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3 flex items-center gap-2">
        <SectionIcon className="w-3.5 h-3.5 text-[#B87333]" /> {title}
      </h3>
      {children}
    </div>
  );
}

export default function ClientDocuments({ contactId }) {
  const { data: quotes = [] } = useQuery({
    queryKey: ['client-quotes', contactId],
    queryFn: () => platform.entities.Quote.filter({ contact_id: contactId }),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices', contactId],
    queryFn: () => platform.entities.Invoice.filter({ contact_id: contactId }),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['client-payments', contactId],
    queryFn: () => platform.entities.Payment.filter({ contact_id: contactId }),
  });

  const totalPaid = payments.filter(p => p.status === 'Confirmed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalOutstanding = invoices.filter(i => !['Paid','Cancelled','Refunded'].includes(i.status)).reduce((s, i) => s + (i.balance_due || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Quotes', value: quotes.length, color: 'text-blue-600' },
          { label: 'Collected', value: formatZAR(totalPaid), color: 'text-green-600' },
          { label: 'Outstanding', value: formatZAR(totalOutstanding), color: 'text-orange-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-black/8 p-4 text-center">
            <p className="text-xs text-black/40">{card.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quotes */}
      <Section icon={FileText} title={`Quotes (${quotes.length})`}>
        {quotes.length === 0 ? <p className="text-xs text-black/40">No quotes yet</p> : (
          <div className="space-y-2">
            {quotes.map(q => (
              <div key={q.id} className="flex items-center justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
                <div>
                  <p className="font-medium text-[#1A1208]">{q.quote_number || 'Quote'}</p>
                  <p className="text-xs text-black/40">{q.book_title || '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#1A1208]">{formatZAR(q.total)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${QUOTE_STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-600'}`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Invoices */}
      <Section icon={Receipt} title={`Invoices (${invoices.length})`}>
        {invoices.length === 0 ? <p className="text-xs text-black/40">No invoices yet</p> : (
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
                <div>
                  <p className="font-medium text-[#1A1208]">{inv.invoice_number}</p>
                  <p className="text-xs text-black/40">{inv.due_date ? `Due: ${new Date(inv.due_date).toLocaleDateString('en-ZA')}` : '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-[#1A1208]">{formatZAR(inv.total)}</p>
                    {(inv.balance_due || 0) > 0 && <p className="text-xs text-orange-600">Bal: {formatZAR(inv.balance_due)}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${INV_STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Payments */}
      <Section icon={CreditCard} title={`Payments (${payments.length})`}>
        {payments.length === 0 ? <p className="text-xs text-black/40">No payments recorded yet</p> : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
                <div>
                  <p className="font-medium text-[#1A1208]">{p.payment_method} — {p.reference || 'No ref'}</p>
                  <p className="text-xs text-black/40">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-ZA') : '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-green-600">{formatZAR(p.amount)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}