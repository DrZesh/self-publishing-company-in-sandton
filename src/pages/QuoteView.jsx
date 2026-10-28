import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { Check, X, Download, FileText, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import NoIndexMeta from '@/components/shared/NoIndexMeta';

export default function QuoteView() {
  const { id, token } = useParams();
  const [quote, setQuote] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responding, setResponding] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [changesMessage, setChangesMessage] = useState('');
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  useEffect(() => {
    platform.functions.invoke('quoteActions', { action: 'get_public', quote_id: id, token })
      .then(res => {
        if (res.data?.error) {
          setError(res.data.error);
        } else {
          setQuote(res.data.quote);
          setLineItems(res.data.line_items || []);
          setCompany(res.data.company);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err?.response?.data?.error || err.message || 'This quotation could not be found or the link is no longer valid.');
        setLoading(false);
      });
  }, [id, token]);

  const handleRespond = async (response, extraData = {}) => {
    setResponding(response);
    try {
      const res = await platform.functions.invoke('quoteActions', {
        action: 'respond',
        quote_id: id,
        token,
        response,
        rejection_reason: response === 'reject' ? rejectionReason : undefined,
        changes_message: response === 'request_changes' ? changesMessage : undefined,
        signer_name: response === 'accept' ? (confirmName || contact.full_name) : undefined,
        signer_email: response === 'accept' ? contact.email : undefined,
        ...extraData,
      });
      if (res.data?.success) {
        setQuote(res.data.quote);
        toast.success(
          response === 'accept' ? 'Quote accepted! Your invoice will be sent shortly.' :
          response === 'reject' ? 'Response received. Thank you.' :
          'Amendment request submitted. We will be in touch.'
        );
        setShowRejectModal(false);
        setShowChangesModal(false);
        setShowAcceptModal(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit response');
    } finally {
      setResponding(null);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await platform.functions.invoke('quoteActions', { action: 'generate_pdf', quote_id: id, token });
      if (res.data?.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
      }
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <NoIndexMeta title="Quotation | Creative Books SA" />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B87333] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
        <NoIndexMeta title="Quotation | Creative Books SA" />
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full text-center">
          <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500"></div>
          <div className="p-10">
            <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" className="h-12 mx-auto mb-6" />
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Quote Not Found</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {error || 'This quotation could not be found or the link is no longer valid.'}
            </p>
            <p className="text-gray-500 text-sm mt-4">Please contact Creative Books SA for assistance.</p>
            <a href="mailto:info@creativebooks.co.za" className="inline-block mt-4 text-[#B87333] hover:underline text-sm font-medium">info@creativebooks.co.za</a>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = ['Sent', 'Viewed', 'Opened', 'Delivered', 'Pending'].includes(quote.status) && quote.valid_until && new Date(quote.valid_until) < new Date();
  const canRespond = ['Sent', 'Viewed', 'Opened', 'Delivered', 'Pending'].includes(quote.status) && !isExpired;
  const contact = quote.contact_snapshot || {};

  const formatTerms = (terms) => {
    if (!terms) return null;
    return terms.split('\n\n').map((paragraph, idx) => {
      const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={idx} className="mb-4 last:mb-0 text-gray-700 leading-relaxed">
          {parts.map((part, i) => 
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4 sm:px-6 lg:px-8">
      <NoIndexMeta title="Quotation | Creative Books SA" />
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-100">
          {/* Rainbow Top Border */}
          <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500"></div>
          
          {/* Logo & Title */}
          <div className="px-6 sm:px-10 py-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#1A1208] mb-2">Quotation</h1>
                <p className="text-gray-600">Quote #{quote.quote_number}</p>
              </div>
              <Badge className={`${
                quote.status === 'Accepted' ? 'bg-green-500' :
                quote.status === 'Declined' ? 'bg-red-500' :
                isExpired ? 'bg-orange-500' : 'bg-[#B87333]'
              } text-white border-0 px-4 py-2 text-sm self-start`}>
                {isExpired ? 'Expired' : quote.status}
              </Badge>
            </div>
          </div>

          {/* Key Info Cards */}
          <div className="px-6 sm:px-10 py-6 bg-gradient-to-br from-[#B87333]/5 to-[#D4A574]/5 border-b border-gray-100">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total Value</p>
                <p className="text-2xl font-bold text-[#B87333]">R {Number(quote.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Valid Until</p>
                <p className="text-lg font-semibold text-gray-900">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Created</p>
                <p className="text-lg font-semibold text-gray-900">{quote.created_date ? new Date(quote.created_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Quote Date</p>
                <p className="text-lg font-semibold text-gray-900">{quote.sent_at ? new Date(quote.sent_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Company & Client Info */}
          <div className="px-6 sm:px-10 py-8 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">From</h3>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 text-base">{company?.company_name || 'Creative Books SA'}</p>
                  {company?.physical_address && <p className="text-sm text-gray-600 leading-relaxed">{company.physical_address}</p>}
                  <div className="space-y-1 pt-2">
                    {company?.email && <p className="text-sm text-gray-600">{company.email}</p>}
                    {company?.phone && <p className="text-sm text-gray-600">{company.phone}</p>}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">To</h3>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 text-base">{contact.full_name || 'Client'}</p>
                  {contact.company && <p className="text-sm text-gray-600">{contact.company}</p>}
                  <div className="space-y-1 pt-2">
                    {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                    {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                    {contact.billing_address && <p className="text-sm text-gray-600 leading-relaxed">{contact.billing_address}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          {quote.book_title && (
            <div className="px-6 sm:px-10 py-5 bg-gradient-to-r from-[#B87333]/10 to-[#D4A574]/10 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#B87333] mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Project</p>
                  <p className="font-medium text-gray-900 text-base">{quote.book_title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="px-6 sm:px-10 py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Itemized Services</h3>
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#2D2D2D] text-white">
                    <th className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wide">#</th>
                    <th className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wide">Description</th>
                    <th className="text-right py-4 px-6 font-semibold text-xs uppercase tracking-wide">Qty</th>
                    <th className="text-right py-4 px-6 font-semibold text-xs uppercase tracking-wide">Rate</th>
                    <th className="text-right py-4 px-6 font-semibold text-xs uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.filter(i => i.description).map((item, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-white'} border-b border-gray-100`}>
                      <td className="py-4 px-6 text-gray-500 text-center">{idx + 1}</td>
                      <td className="py-4 px-6 font-medium text-gray-900">{item.description}</td>
                      <td className="py-4 px-6 text-right text-gray-600">{Number(item.quantity).toFixed(2)}</td>
                      <td className="py-4 px-6 text-right text-gray-600">R {Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900">R {Number(item.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-4 px-6 text-right font-medium text-gray-600 bg-white border-t border-gray-200">Total</td>
                    <td className="py-4 px-6 text-right font-bold text-[#B87333] text-xl bg-white border-t border-gray-200">R {Number(quote.total).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes & Terms */}
          {(quote.notes || quote.terms) && (
            <div className="px-6 sm:px-10 py-8 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              {quote.notes && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Notes</h4>
                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{quote.notes}</p>
                  </div>
                </div>
              )}
              {quote.terms && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Terms & Conditions</h4>
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {formatTerms(quote.terms)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {canRespond && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Please review and respond to this quote</h3>
            <p className="text-gray-600 text-center mb-8">Select one of the options below to proceed</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowAcceptModal(true)}
                disabled={!!responding}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-6 text-base font-semibold gap-2 shadow-lg shadow-green-200"
              >
                <Check className="w-5 h-5" />
                Accept Quote
              </Button>
              <Button
                onClick={() => setShowChangesModal(true)}
                disabled={!!responding}
                variant="outline"
                className="border-2 border-[#B87333] text-[#B87333] hover:bg-[#B87333]/10 px-10 py-6 text-base font-semibold gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Request Amendment
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                disabled={!!responding}
                variant="outline"
                className="border-2 border-red-600 text-red-600 hover:bg-red-50 px-10 py-6 text-base font-semibold gap-2"
              >
                <X className="w-5 h-5" />
                Reject Quote
              </Button>
            </div>
          </div>
        )}

        {/* Already Responded */}
        {quote.status === 'Accepted' && (
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-3">Quote Accepted</h3>
            <p className="text-green-700 mb-4">This quote was accepted on {quote.accepted_at ? new Date(quote.accepted_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</p>
            <p className="text-sm text-green-600">Our team will contact you within 24 hours with the next steps.</p>
          </div>
        )}

        {quote.status === 'Declined' && (
          <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-900 mb-3">Quote Declined</h3>
            <p className="text-red-700 mb-4">This quote was declined on {quote.declined_at ? new Date(quote.declined_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</p>
            {quote.declined_reason && (
              <div className="mt-6 p-5 bg-white rounded-lg border border-red-100 text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">Reason for Decline:</p>
                <p className="text-sm text-red-700 leading-relaxed">{quote.declined_reason}</p>
              </div>
            )}
          </div>
        )}

        {quote.status === 'Changes Requested' && (
          <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-3">Changes Requested</h3>
            <p className="text-amber-700 mb-4">Changes were requested on {quote.changes_requested_at ? new Date(quote.changes_requested_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</p>
            {quote.client_message && (
              <div className="mt-6 p-5 bg-white rounded-lg border border-amber-100 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-2">Your Message:</p>
                <p className="text-sm text-amber-700 leading-relaxed whitespace-pre-wrap">{quote.client_message}</p>
              </div>
            )}
            <p className="text-sm text-amber-600 mt-6">Our team will review your requested changes and contact you shortly.</p>
          </div>
        )}

        {isExpired && (
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900 mb-3">Quote Expired</h3>
            <p className="text-orange-700 mb-2">This quote expired on {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</p>
            <p className="text-sm text-orange-600 mt-4">Please contact us to request a new quote.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-10 pb-8">
          <p className="font-medium text-gray-700">© {new Date().getFullYear()} {company?.company_name || 'Creative Books SA'}. All rights reserved.</p>
          <p className="mt-2">Questions? Contact us at <a href={`mailto:${company?.email}`} className="text-[#B87333] hover:underline">{company?.email || 'info@creativebooks.co.za'}</a></p>
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAcceptModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Accept Quote #{quote.quote_number}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Please confirm your details to accept this quotation.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={confirmName}
                onChange={e => setConfirmName(e.target.value)}
                placeholder={contact.full_name || 'Enter your full name'}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-start gap-3 mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <input
                type="checkbox"
                id="accept-confirm"
                checked={confirmChecked}
                onChange={e => setConfirmChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-green-600 flex-shrink-0"
              />
              <label htmlFor="accept-confirm" className="text-sm text-gray-700 cursor-pointer">
                I confirm that I have read and accept this quotation for <strong>R {Number(quote.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</strong> and agree to the terms and conditions.
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAcceptModal(false)}>Cancel</Button>
              <Button
                onClick={() => handleRespond('accept')}
                disabled={responding === 'accept' || !confirmChecked || !(confirmName || contact.full_name)}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {responding === 'accept' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                {responding === 'accept' ? 'Accepting...' : 'Confirm Acceptance'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason for Rejection</h3>
            <p className="text-sm text-gray-600 mb-3">Please let us know why you're declining this quote (optional):</p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Budget constraints, need to reconsider, going with another provider..."
              className="w-full h-28 p-3 border border-gray-300 rounded-lg text-sm mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button
                onClick={() => handleRespond('reject')}
                disabled={responding === 'reject'}
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {responding === 'reject' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <X className="w-4 h-4" />}
                {responding === 'reject' ? 'Submitting...' : 'Submit Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Amendment Modal */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowChangesModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request an Amendment</h3>
            <p className="text-sm text-gray-600 mb-3">Please describe what you'd like changed:</p>
            <textarea
              value={changesMessage}
              onChange={e => setChangesMessage(e.target.value)}
              placeholder="e.g., Please adjust the quantity, change the paper type, add ISBN registration..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowChangesModal(false)}>Cancel</Button>
              <Button
                onClick={() => handleRespond('request_changes')}
                disabled={responding === 'request_changes' || !changesMessage.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
              >
                {responding === 'request_changes' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                {responding === 'request_changes' ? 'Submitting...' : 'Submit Amendment Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}