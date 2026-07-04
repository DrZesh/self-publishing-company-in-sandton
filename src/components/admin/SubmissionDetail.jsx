import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Trash2,
  Archive,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { crmService } from '@/services/crmService';
import { toast } from 'sonner';

const STATUS_BADGES = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-700',
  converted_to_lead: 'bg-emerald-100 text-emerald-700',
  spam: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};

const FORM_TYPE_LABELS = {
  contact: 'General Contact',
  quote: 'Quote Request',
  newsletter: 'Newsletter Signup',
  package_order: 'Package Order',
  service_enquiry: 'Service Enquiry',
  other: 'Other',
};

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className="flex gap-3 text-sm">
      <span className="text-black/40 w-28 shrink-0">{label}</span>
      <span className="text-[#1A1208] font-medium">{String(value)}</span>
    </div>
  );
}

export default function SubmissionDetail({
  submission,
  onClose,
  onStatusChange,
  onDelete,
  inline = false,
}) {
  const [converting, setConverting] = useState(false);
  const [notes, setNotes] = useState(submission.internal_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('Re: Your enquiry | Creative Books SA');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setNotes(submission.internal_notes || '');
    setReplyBody(
      `Hi ${submission.full_name?.split(' ')[0] || 'there'},\n\nThank you for reaching out to Creative Books SA.\n\n`
    );
  }, [submission.id, submission.internal_notes, submission.full_name]);

  const handleSendReply = async () => {
    if (!replyBody.trim() || !replySubject.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    setSending(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: submission.email,
        subject: replySubject,
        body: replyBody.replace(/\n/g, '<br/>'),
        from_name: 'Creative Books SA',
      });

      toast.success(`Reply sent to ${submission.email}`);
      setReplyOpen(false);
    } catch (error) {
      toast.error(`Failed to send: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);

    try {
      await crmService.updateSubmission(submission.id, { internal_notes: notes });
      toast.success('Notes saved');
    } catch (error) {
      toast.error(`Failed to save notes: ${error.message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleConvertToLead = async () => {
    if (!confirm('Create a lead from this submission?')) return;

    setConverting(true);

    try {
      await crmService.convertSubmissionToLead(submission.id);
      await onStatusChange(submission.id, 'converted_to_lead');
      toast.success('Lead created successfully');
    } catch (error) {
      toast.error(`Failed to create lead: ${error.message}`);
    } finally {
      setConverting(false);
    }
  };

  const body = (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-black/8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-[#1A1208] truncate">{submission.full_name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGES[submission.status] || STATUS_BADGES.read}`}>
              {submission.status?.replace(/_/g, ' ')}
            </span>
            <span className="px-2.5 py-1 bg-[#B87333]/10 text-[#B87333] rounded-full text-xs font-semibold">
              {FORM_TYPE_LABELS[submission.form_type] || submission.form_type}
            </span>
          </div>
        </div>
        {!inline && (
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg shrink-0">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide">Contact</h3>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#B87333] shrink-0" />
            <a href={`mailto:${submission.email}`} className="text-sm text-[#B87333] hover:underline font-medium">
              {submission.email}
            </a>
          </div>
          {submission.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#B87333] shrink-0" />
              <a href={`tel:${submission.phone}`} className="text-sm text-[#B87333] hover:underline font-medium">
                {submission.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-black/30 shrink-0" />
            <span className="text-sm text-black/50">
              {new Date(submission.created_date).toLocaleString('en-ZA')}
            </span>
          </div>
        </div>

        {submission.service_interest?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Services of Interest</h3>
            <div className="flex flex-wrap gap-2">
              {submission.service_interest.map(service => (
                <span key={service} className="px-2.5 py-1 bg-[#B87333]/8 text-[#B87333] text-xs font-semibold rounded-lg border border-[#B87333]/20">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {submission.message && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Message</h3>
            <div className="bg-[#F9F7F2] rounded-xl p-4 text-sm text-[#1A1208] leading-relaxed whitespace-pre-wrap border border-black/5">
              {submission.message}
            </div>
          </div>
        )}

        {submission.additional_fields && Object.keys(submission.additional_fields).length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Additional Details</h3>
            <div className="bg-[#F9F7F2] rounded-xl p-4 space-y-2 border border-black/5">
              {Object.entries(submission.additional_fields).map(([key, value]) => (
                <DetailRow key={key} label={key.replace(/_/g, ' ')} value={value} />
              ))}
            </div>
          </div>
        )}

        {(submission.book_title || submission.book_genre || submission.book_page_count || submission.book_word_count) && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Book Details</h3>
            <div className="bg-[#F9F7F2] rounded-xl p-4 space-y-2 border border-black/5">
              <DetailRow label="Title" value={submission.book_title} />
              <DetailRow label="Genre" value={submission.book_genre} />
              <DetailRow label="Page count" value={submission.book_page_count} />
              <DetailRow label="Word count" value={submission.book_word_count} />
              <DetailRow label="Budget" value={submission.budget} />
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Internal Notes</h3>
          <textarea
            value={notes}
            onChange={event => setNotes(event.target.value)}
            placeholder="Add private notes about this submission…"
            className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] resize-none bg-[#fafafa]"
            rows={3}
          />
          {notes !== (submission.internal_notes || '') && (
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 px-4 py-2 bg-[#B87333] text-white text-sm rounded-lg hover:bg-[#a06428] disabled:opacity-50 font-medium transition-colors"
            >
              {savingNotes ? 'Saving…' : 'Save Notes'}
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-black/8 space-y-2">
          {submission.status !== 'converted_to_lead' && (
            <button
              onClick={handleConvertToLead}
              disabled={converting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 disabled:opacity-50 font-semibold text-sm transition-colors border border-emerald-200"
            >
              <ArrowRight className="w-4 h-4" />
              {converting ? 'Creating lead…' : 'Convert to Lead'}
            </button>
          )}

          <div className="border border-[#B87333]/25 rounded-xl overflow-hidden">
            <button
              onClick={() => setReplyOpen(current => !current)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#B87333]/8 text-[#B87333] hover:bg-[#B87333]/12 font-semibold text-sm transition-colors"
            >
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Reply to {submission.full_name?.split(' ')[0]}</span>
              {replyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {replyOpen && (
              <div className="p-4 bg-white space-y-3">
                <input
                  value={replySubject}
                  onChange={event => setReplySubject(event.target.value)}
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-[#B87333]"
                />
                <textarea
                  value={replyBody}
                  onChange={event => setReplyBody(event.target.value)}
                  rows={7}
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-[#B87333] resize-y"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-lg font-semibold text-sm hover:bg-[#a06428] disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {submission.status !== 'archived' && (
              <button
                onClick={() => onStatusChange(submission.id, 'archived')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-black/50 border border-black/10 rounded-xl hover:bg-black/5"
              >
                <Archive className="w-4 h-4" /> Archive
              </button>
            )}
            <button
              onClick={() => onDelete(submission.id)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) return body;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={event => event.stopPropagation()}>
        {body}
      </div>
    </div>
  );
}
