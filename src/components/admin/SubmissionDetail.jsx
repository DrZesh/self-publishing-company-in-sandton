import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, ArrowRight, Trash2, Flag, Archive, ExternalLink, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
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
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-black/40 w-28 shrink-0">{label}</span>
      <span className="text-[#1A1208] font-medium">{value}</span>
    </div>
  );
}

export default function SubmissionDetail({ submission, onClose, onStatusChange, onDelete, inline = false }) {
  const [converting, setConverting] = useState(false);
  const [notes, setNotes] = useState(submission.internal_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await base44.entities.Submission.update(submission.id, { internal_notes: notes });
    setSavingNotes(false);
    toast.success('Notes saved');
  };

  const handleConvertToLead = async () => {
    if (!confirm('Create a lead from this submission?')) return;
    setConverting(true);
    try {
      if (submission.contact_id) {
        await base44.entities.Lead.create({
          contact_id: submission.contact_id,
          source_submission_id: submission.id,
          stage: 'new',
          service_interest: submission.service_interest || [],
          description: submission.message || '',
          tags: ['from-submission'],
        });
        toast.success('Lead created successfully');
      } else {
        toast.error('No contact linked to this submission. Please link a contact first.');
        return;
      }
      onStatusChange(submission.id, 'converted_to_lead');
    } catch (e) {
      toast.error('Failed to create lead: ' + e.message);
    } finally {
      setConverting(false);
    }
  };

  const body = (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
      {/* Header */}
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
        {!inline && <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg shrink-0"><X className="w-5 h-5" /></button>}
      </div>

      <div className="p-6 space-y-6">
        {/* Contact info */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide">Contact</h3>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#B87333] shrink-0" />
            <a href={`mailto:${submission.email}`} className="text-sm text-[#B87333] hover:underline font-medium">{submission.email}</a>
          </div>
          {submission.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#B87333] shrink-0" />
              <a href={`tel:${submission.phone}`} className="text-sm text-[#B87333] hover:underline font-medium">{submission.phone}</a>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-black/30 shrink-0" />
            <span className="text-sm text-black/50">{new Date(submission.created_date).toLocaleString('en-ZA')}</span>
          </div>
        </div>

        {/* Service interest */}
        {submission.service_interest?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Services of Interest</h3>
            <div className="flex flex-wrap gap-2">
              {submission.service_interest.map(s => (
                <span key={s} className="px-2.5 py-1 bg-[#B87333]/8 text-[#B87333] text-xs font-semibold rounded-lg border border-[#B87333]/20">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        {submission.message && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Message</h3>
            <div className="bg-[#F9F7F2] rounded-xl p-4 text-sm text-[#1A1208] leading-relaxed whitespace-pre-wrap border border-black/5">
              {submission.message}
            </div>
          </div>
        )}

        {/* Book details */}
        {(submission.book_title || submission.book_genre || submission.book_page_count || submission.book_word_count) && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Book Details</h3>
            <div className="bg-[#F9F7F2] rounded-xl p-4 space-y-2 border border-black/5">
              <DetailRow label="Title" value={submission.book_title} />
              <DetailRow label="Genre" value={submission.book_genre} />
              <DetailRow label="Page count" value={submission.book_page_count} />
              <DetailRow label="Word count" value={submission.book_word_count} />
              {submission.budget && <DetailRow label="Budget" value={submission.budget} />}
            </div>
          </div>
        )}

        {/* Attribution */}
        {(submission.marketing_source || submission.device_type || submission.city) && (
          <div>
            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Attribution</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DetailRow label="Source" value={submission.marketing_source?.replace(/_/g, ' ')} />
              <DetailRow label="Device" value={submission.device_type} />
              <DetailRow label="City" value={[submission.city, submission.country].filter(Boolean).join(', ')} />
              <DetailRow label="Browser" value={submission.browser} />
            </div>
          </div>
        )}

        {/* Internal notes */}
        <div>
          <h3 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-2">Internal Notes</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
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

        {/* Actions */}
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

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`mailto:${submission.email}?subject=Re: Your enquiry with Creative Books&body=Hi ${submission.full_name.split(' ')[0]},%0A%0A`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B87333]/10 text-[#B87333] rounded-xl hover:bg-[#B87333]/15 font-semibold text-sm transition-colors border border-[#B87333]/20"
            >
              <Mail className="w-4 h-4" /> Reply
            </a>
            {submission.status !== 'archived' && (
              <button
                onClick={() => onStatusChange(submission.id, 'archived')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black/5 text-black/60 rounded-xl hover:bg-black/8 font-semibold text-sm transition-colors"
              >
                <Archive className="w-4 h-4" /> Archive
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {submission.status !== 'spam' && (
              <button
                onClick={() => onStatusChange(submission.id, 'spam')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold text-sm transition-colors border border-red-100"
              >
                <Flag className="w-4 h-4" /> Spam
              </button>
            )}
            <button
              onClick={() => onDelete(submission.id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold text-sm transition-colors border border-red-100"
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {body}
      </div>
    </div>
  );
}