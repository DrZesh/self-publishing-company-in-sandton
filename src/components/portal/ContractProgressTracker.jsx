import { CheckCircle, Clock, PenLine, Download, ExternalLink, AlertTriangle, XCircle } from 'lucide-react';

const SIGNING_STEPS = [
  {
    label: 'Contract Prepared',
    description: 'Creative Books SA has prepared your contract',
    doneStatuses: ['Admin Fields Completed', 'Admin Signed', 'Sent for Signature', 'Opened', 'Viewed', 'Signing Started', 'Signed', 'Fully Signed', 'Resent'],
  },
  {
    label: 'Company Signed',
    description: 'Creative Books SA has signed the contract',
    doneStatuses: ['Admin Signed', 'Sent for Signature', 'Opened', 'Viewed', 'Signing Started', 'Signed', 'Fully Signed', 'Resent'],
  },
  {
    label: 'Sent to You',
    description: 'Contract sent to your email for signing',
    doneStatuses: ['Sent for Signature', 'Opened', 'Viewed', 'Signing Started', 'Signed', 'Fully Signed', 'Resent'],
  },
  {
    label: 'Your Signature',
    description: 'Awaiting your electronic signature',
    doneStatuses: ['Signed', 'Fully Signed'],
  },
  {
    label: 'Fully Executed',
    description: 'Contract is fully signed and legally binding',
    doneStatuses: ['Fully Signed'],
  },
];

function getStepState(step, status) {
  if (step.doneStatuses.includes(status)) return 'done';
  // Active = previous step done but this one not
  const prevIdx = SIGNING_STEPS.indexOf(step) - 1;
  if (prevIdx < 0) return status !== 'Draft' ? 'active' : 'pending';
  return SIGNING_STEPS[prevIdx].doneStatuses.includes(status) ? 'active' : 'pending';
}

export default function ContractProgressTracker({ contract }) {
  const status = contract.status || 'Draft';
  const isDeclined = status === 'Declined';
  const isExpired = status === 'Expired';
  const isCancelled = status === 'Cancelled';
  const isTerminated = isDeclined || isExpired || isCancelled;
  const isFullySigned = status === 'Fully Signed';
  const needsSignature = ['Sent for Signature', 'Opened', 'Viewed', 'Signing Started', 'Resent'].includes(status);

  return (
    <div className={`bg-white rounded-2xl border p-5 ${isFullySigned ? 'border-emerald-200' : isTerminated ? 'border-red-200' : 'border-gray-100'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{contract.title}</h3>
          {contract.book_title && <p className="text-xs text-gray-500 mt-0.5">{contract.book_title}</p>}
        </div>
        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isFullySigned ? 'bg-emerald-100 text-emerald-700' :
          needsSignature ? 'bg-amber-100 text-amber-700' :
          isTerminated ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {isFullySigned && <CheckCircle className="w-3 h-3" />}
          {needsSignature && <PenLine className="w-3 h-3" />}
          {isTerminated && <XCircle className="w-3 h-3" />}
          {!isFullySigned && !needsSignature && !isTerminated && <Clock className="w-3 h-3" />}
          {status}
        </span>
      </div>

      {/* Terminated notice */}
      {isTerminated && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            {isDeclined && `This contract was declined${contract.declined_reason ? `: "${contract.declined_reason}"` : '. Please contact us to discuss.'}`}
            {isExpired && 'This contract has expired. Please contact us to get a new contract issued.'}
            {isCancelled && 'This contract has been cancelled. Please contact us for more information.'}
          </p>
        </div>
      )}

      {/* Progress Steps */}
      {!isTerminated && (
        <div className="relative mb-5">
          {/* Connecting line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" style={{ left: 16, right: 16 }} />
          <div className="flex justify-between relative">
            {SIGNING_STEPS.map((step, i) => {
              const state = getStepState(step, status);
              return (
                <div key={i} className="flex flex-col items-center text-center flex-1 px-1">
                  {/* Circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 mb-2 border-2 transition-all ${
                    state === 'done' ? 'bg-emerald-500 border-emerald-500' :
                    state === 'active' ? 'bg-[#B87333] border-[#B87333] animate-pulse' :
                    'bg-white border-gray-300'
                  }`}>
                    {state === 'done'
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : state === 'active'
                      ? <Clock className="w-3.5 h-3.5 text-white" />
                      : <span className="text-xs font-bold text-gray-400">{i + 1}</span>
                    }
                  </div>
                  <p className={`text-[10px] font-semibold leading-tight ${
                    state === 'done' ? 'text-emerald-600' :
                    state === 'active' ? 'text-[#B87333]' :
                    'text-gray-400'
                  }`}>{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fully signed banner */}
      {isFullySigned && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-800">Contract Fully Executed</p>
            {contract.signed_at && (
              <p className="text-xs text-emerald-600">
                Signed on {new Date(contract.signed_at).toLocaleString('en-ZA')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Sign now button */}
        {needsSignature && contract.sign_token && (
          <a
            href={`/sign/contract/${contract.sign_token}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B87333] hover:bg-[#A06828] text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" /> Sign Contract Now
          </a>
        )}

        {/* Download signed copy */}
        {contract.signed_file_url && (
          <a
            href={contract.signed_file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download Signed Copy
          </a>
        )}

        {/* View original */}
        {contract.contract_file_url && (
          <a
            href={contract.contract_file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Document
          </a>
        )}
      </div>

      {/* Dates footer */}
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
        {contract.sent_at && (
          <span className="text-xs text-gray-400">Sent: {new Date(contract.sent_at).toLocaleDateString('en-ZA')}</span>
        )}
        {contract.admin_signed_at && (
          <span className="text-xs text-gray-400">Company signed: {new Date(contract.admin_signed_at).toLocaleDateString('en-ZA')}</span>
        )}
        {contract.signed_at && (
          <span className="text-xs text-emerald-600 font-medium">You signed: {new Date(contract.signed_at).toLocaleDateString('en-ZA')}</span>
        )}
        {contract.expiry_date && !isFullySigned && (
          <span className={`text-xs font-medium ${new Date(contract.expiry_date) < new Date() ? 'text-red-500' : 'text-orange-500'}`}>
            Expires: {new Date(contract.expiry_date).toLocaleDateString('en-ZA')}
          </span>
        )}
      </div>
    </div>
  );
}