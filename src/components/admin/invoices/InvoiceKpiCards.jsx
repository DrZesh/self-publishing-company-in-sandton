import React from 'react';
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function InvoiceKpiCards({ invoices }) {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalOutstanding = invoices.filter(i => !['Paid', 'Cancelled'].includes(i.status)).reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const outstandingCount = invoices.filter(i => !['Paid', 'Cancelled'].includes(i.status)).length;
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
  const collectionRate = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Total Invoiced</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">R {totalInvoiced.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-amber-700 mt-1">All invoices</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-900 mt-1">R {totalPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-green-600 mt-1">{paidCount} invoices paid</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">R {totalOutstanding.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-orange-600 mt-1">{outstandingCount} unpaid invoices</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{collectionRate}%</p>
              <p className="text-xs text-purple-600 mt-1">{overdueCount} overdue</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}