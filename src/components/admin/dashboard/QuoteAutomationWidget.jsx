import React from 'react';
import { Bell, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function QuoteAutomationWidget() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Quote Automation</h3>
        <Bell className="w-5 h-5 text-[#B87333]" />
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Auto-Follow-ups Active</p>
            <p className="text-xs text-green-700 mt-1">Daily reminders sent at 9am for quotes expiring in 3 days</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Auto-Project Creation</p>
            <p className="text-xs text-blue-700 mt-1">Projects created instantly when quotes are accepted</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-800">Auto-Invoice Generation</p>
            <p className="text-xs text-purple-700 mt-1">Draft invoices created from accepted quotes</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Expiry Processing</p>
            <p className="text-xs text-amber-700 mt-1">Expired quotes automatically marked and archived</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          ⏰ Next automation run: Weekdays at 9:00 AM SAST
        </p>
      </div>
    </div>
  );
}