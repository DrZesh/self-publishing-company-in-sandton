import React from 'react';
import { AlertTriangle, CheckCircle, Clock, ChevronRight, Calendar } from 'lucide-react';

export default function NextActionCard({ action, onTakeAction }) {
  if (!action) return null;

  const ACTION_CONFIG = {
    approve_cover: {
      title: 'Approve Your Cover Design',
      description: 'Your cover design proof is ready for review and approval.',
      icon: CheckCircle,
      color: 'from-[#B87333] to-[#D4A574]',
      bgColor: 'bg-gradient-to-br from-[#B87333]/10 to-[#D4A574]/10',
      borderColor: 'border-[#B87333]/30',
      buttonText: 'Review & Approve',
      urgent: true,
    },
    approve_proof: {
      title: 'Approve Final Proof',
      description: 'Your book proof is ready. Please review before we proceed to printing.',
      icon: CheckCircle,
      color: 'from-[#B87333] to-[#D4A574]',
      bgColor: 'bg-gradient-to-br from-[#B87333]/10 to-[#D4A574]/10',
      borderColor: 'border-[#B87333]/30',
      buttonText: 'Review Proof',
      urgent: true,
    },
    upload_manuscript: {
      title: 'Upload Your Manuscript',
      description: 'We need your final manuscript file to proceed with editing.',
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-50',
      borderColor: 'border-blue-300',
      buttonText: 'Upload File',
      urgent: false,
    },
    pay_invoice: {
      title: 'Pay Outstanding Invoice',
      description: 'Payment is required to proceed to the next stage.',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-100 to-red-50',
      borderColor: 'border-orange-300',
      buttonText: 'View Invoice',
      urgent: true,
    },
    sign_document: {
      title: 'Sign Pending Document',
      description: 'A document requires your signature to proceed.',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-purple-50',
      borderColor: 'border-purple-300',
      buttonText: 'Sign Now',
      urgent: true,
    },
    confirm_delivery: {
      title: 'Confirm Delivery Address',
      description: 'Please confirm or update your delivery address before we ship.',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-50',
      borderColor: 'border-green-300',
      buttonText: 'Confirm Address',
      urgent: false,
    },
  };

  const config = ACTION_CONFIG[action.type] || ACTION_CONFIG.approve_proof;
  const Icon = config.icon;

  return (
    <div className={`relative rounded-3xl border-2 p-6 ${config.bgColor} ${config.borderColor} shadow-lg`}>
      <div className="absolute top-4 right-4">
        {config.urgent && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Action Required
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-2">{config.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{config.description}</p>

          <button
            onClick={onTakeAction}
            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${config.color} text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105`}
          >
            {config.buttonText}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}