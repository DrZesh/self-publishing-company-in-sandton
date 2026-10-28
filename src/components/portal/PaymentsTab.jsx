import React from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { platform } from '@/api/platformClient';

export default function PaymentsTab({ payments = [], invoices = [], contact = {} }) {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const totalPaid = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const outstanding = (invoices || []).filter(i => (i.balance_due || 0) > 0).reduce((sum, i) => sum + (i.balance_due || 0), 0) || 0;

  const handleUploadPaymentProof = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const { file_url } = await platform.integrations.Core.UploadFile({ file: selectedFile });
      const uploadRes = await platform.functions.invoke('fileUploadActions', {
        action: 'upload_payment_proof', file_url, file_name: selectedFile.name,
      });
      
      if (uploadRes.data.success) {
        alert('Payment proof uploaded. Our team will review it.');
        setSelectedFile(null);
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard
          icon={DollarSign}
          label="Total Paid"
          value={`R ${totalPaid.toLocaleString()}`}
          color="from-green-500/20 to-emerald-500/10"
          textColor="text-green-400"
        />
        <SummaryCard
          icon={AlertCircle}
          label="Outstanding"
          value={`R ${outstanding.toLocaleString()}`}
          color="from-orange-500/20 to-red-500/10"
          textColor="text-orange-400"
        />
        <SummaryCard
          icon={CreditCard}
          label="Payments Made"
          value={payments?.length || 0}
          color="from-blue-500/20 to-cyan-500/10"
          textColor="text-blue-400"
        />
      </div>

      {/* Payment History */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#D4A574]" />
          Payment History
        </h3>
        
        {!payments || payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No payments recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map(payment => (
              <div key={payment.id} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-white">Payment of R {(payment.amount || 0).toLocaleString()}</h4>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <Info label="Date" value={new Date(payment.payment_date).toLocaleDateString('en-ZA')} />
                      <Info label="Method" value={payment.payment_method || 'EFT'} />
                      <Info label="Reference" value={payment.reference || 'N/A'} />
                    </div>
                    {payment.notes && (
                      <p className="text-xs text-gray-400 mt-2">Notes: {payment.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banking Details */}
      <div className="bg-gradient-to-r from-[#B87333]/20 to-[#D4A574]/10 rounded-3xl border border-[#B87333]/30 p-6">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#D4A574]" />
          Banking Details for EFT Payments
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <BankingField label="Bank Name" value="FNB" />
          <BankingField label="Account Name" value="Creative Books SA" />
          <BankingField label="Account Number" value="123456789" />
          <BankingField label="Branch Code" value="250655" />
          <BankingField label="Account Type" value="Current Account" />
          <BankingField label="Reference" value="Your Name/Book Title" />
        </div>
        <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
          <p className="text-sm text-yellow-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <strong>Important:</strong> Always use your name or book title as the payment reference to ensure quick allocation.
          </p>
        </div>
      </div>

      {/* Upload Payment Proof */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#D4A574]" />
          Upload Payment Proof
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          After making an EFT payment, upload the proof of payment here for faster processing.
        </p>
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-[#B87333]/40 transition-colors">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="hidden"
            id="payment-proof-upload"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <label htmlFor="payment-proof-upload" className="cursor-pointer">
            <Download className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-2">
              {selectedFile ? selectedFile.name : 'Drag and drop your payment proof here, or click to browse'}
            </p>
            <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
          </label>
          {selectedFile && (
            <Button
              onClick={handleUploadPaymentProof}
              disabled={uploading}
              className="mt-4 bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold px-6 py-2 rounded-xl disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Payment Proof'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, textColor }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl border border-gray-700/50 p-6`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-6 h-6 ${textColor}`} />
        <p className="text-sm font-semibold text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function BankingField({ label, value }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 mb-1 block">{label}</label>
      <p className="text-sm text-white bg-gray-800/50 rounded-lg px-3 py-2">{value}</p>
    </div>
  );
}