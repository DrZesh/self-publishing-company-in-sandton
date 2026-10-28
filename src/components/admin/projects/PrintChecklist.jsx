import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { CheckCircle, XCircle, AlertTriangle, Lock, Unlock } from 'lucide-react';

const CHECKLIST_ITEMS = [
  {
    key: 'quote_accepted',
    label: 'Quote Accepted',
    description: 'Client has accepted the project quote',
    check: (project, quotes, invoices, documents) => {
      if (project.stage && ['Quote Accepted', 'Contract Sent', 'Contract Signed', 'Payment Received', 'Manuscript Received', 'Editing', 'Proofreading', 'Typesetting', 'Cover Design', 'Client Approval', 'Final Approval Received', 'Sample Print Queued', 'Sample Print Completed', 'Mass Production Started', 'Ready for Collection', 'Courier Booked', 'Delivered', 'Completed'].includes(project.stage)) return true;
      if (quotes.some(q => q.status === 'Accepted')) return true;
      if (documents.some(d => d.category === 'Quotation' && d.status === 'Approved')) return true;
      return false;
    },
  },
  {
    key: 'contract_signed',
    label: 'Contract Signed',
    description: 'Signed contract is on file',
    check: (project, quotes, invoices, documents) => {
      if (project.contract_status === 'Signed') return true;
      if (documents.some(d => ['Signed Contract', 'Unsigned Contract'].includes(d.category) && d.status === 'Signed')) return true;
      return false;
    },
  },
  {
    key: 'invoice_paid',
    label: 'Invoice Paid / Payment Approved',
    description: 'Payment received or approved by owner',
    check: (project, quotes, invoices, documents) => {
      if (['Fully Paid', 'Deposit Paid'].includes(project.payment_status)) return true;
      if (invoices.some(i => ['Paid', 'Partially Paid'].includes(i.status))) return true;
      return false;
    },
  },
  {
    key: 'manuscript_approved',
    label: 'Final Manuscript Approved',
    description: 'Final manuscript file approved by client',
    check: (project, quotes, invoices, documents) =>
      documents.some(d => d.category === 'Manuscript' && ['Approved', 'Signed'].includes(d.status)),
  },
  {
    key: 'cover_approved',
    label: 'Cover Design Approved',
    description: 'Final cover file approved for print',
    check: (project, quotes, invoices, documents) =>
      documents.some(d => d.category === 'Book Cover File' && ['Approved', 'Signed'].includes(d.status)),
  },
  {
    key: 'proof_approved',
    label: 'Print Proof Approved',
    description: 'Final proof approval received from client',
    check: (project, quotes, invoices, documents) =>
      documents.some(d => d.category === 'Proof Approval' && d.status === 'Approved'),
  },
];

export default function PrintChecklist({ project }) {
  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes', project.contact_id],
    queryFn: () => platform.entities.Quote.filter({ contact_id: project.contact_id }),
    enabled: !!project.contact_id,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', project.contact_id],
    queryFn: () => platform.entities.Invoice.filter({ contact_id: project.contact_id }),
    enabled: !!project.contact_id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', project.contact_id],
    queryFn: () => platform.entities.Document.filter({ contact_id: project.contact_id }),
    enabled: !!project.contact_id,
  });

  const results = CHECKLIST_ITEMS.map(item => ({
    ...item,
    passed: item.check(project, quotes, invoices, documents),
  }));

  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;

  const printStages = ['Sample Print Queued', 'Sample Print Completed', 'Mass Production Started', 'Ready for Collection', 'Courier Booked', 'Delivered', 'Completed'];
  const isInPrintStage = printStages.includes(project.stage);

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-3 ${allPassed ? 'bg-green-50 border-b border-green-100' : 'bg-orange-50 border-b border-orange-100'}`}>
        {allPassed
          ? <Unlock className="w-4 h-4 text-green-600" />
          : <Lock className="w-4 h-4 text-orange-600" />
        }
        <div className="flex-1">
          <p className={`text-sm font-bold ${allPassed ? 'text-green-800' : 'text-orange-800'}`}>
            {allPassed ? '✅ Ready for Production' : `🔒 Print Lock Active (${passedCount}/${results.length})`}
          </p>
          <p className={`text-xs ${allPassed ? 'text-green-600' : 'text-orange-600'}`}>
            {allPassed ? 'All pre-production checks passed.' : 'Complete all items before moving to print.'}
          </p>
        </div>
        {!allPassed && isInPrintStage && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span className="text-[10px] font-bold text-red-700">IN PRINT — INCOMPLETE</span>
          </div>
        )}
      </div>

      {/* Checklist items */}
      <div className="divide-y divide-gray-50 bg-white">
        {results.map(item => (
          <div key={item.key} className="flex items-start gap-3 px-4 py-3">
            {item.passed
              ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              : <XCircle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
            }
            <div>
              <p className={`text-sm font-medium ${item.passed ? 'text-gray-700' : 'text-gray-500'}`}>{item.label}</p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}