import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, MapPin, Calendar, ArrowRight, Trash2, Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SubmissionDetail({ submission, onClose, onStatusChange, onDelete }) {
  const [converting, setConverting] = useState(false);
  const [notes, setNotes] = useState(submission.internal_notes || '');
  const [updatingNotes, setUpdatingNotes] = useState(false);

  const handleSaveNotes = async () => {
    try {
      setUpdatingNotes(true);
      await base44.entities.Submission.update(submission.id, { internal_notes: notes });
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleConvertToLead = async () => {
    if (!confirm('Convert this submission to a lead?')) return;
    try {
      setConverting(true);
      
      // Create lead linked to contact
      if (submission.contact_id) {
        await base44.entities.Lead.create({
          contact_id: submission.contact_id,
          source_submission_id: submission.id,
          stage: 'new',
          service_interest: submission.service_interest || [],
          tags: ['from-submission'],
        });
      }

      // Update submission status
      onStatusChange(submission.id, 'converted_to_lead');
    } catch (err) {
      console.error('Failed to convert to lead:', err);
    } finally {
      setConverting(false);
    }
  };

  const statusBadgeColor = {
    new: 'bg-blue-100 text-blue-700',
    read: 'bg-gray-100 text-gray-700',
    converted_to_lead: 'bg-green-100 text-green-700',
    spam: 'bg-red-100 text-red-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#ddd]/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1220]">{submission.full_name}</h2>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${statusBadgeColor[submission.status]}`}>
              {submission.status.replace(/_/g, ' ')}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f0f0f0] rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0B1220]">Contact Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#B8955B]" />
                <a href={`mailto:${submission.email}`} className="text-[#B8955B] hover:underline">
                  {submission.email}
                </a>
              </div>
              {submission.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#B8955B]" />
                  <a href={`tel:${submission.phone}`} className="text-[#B8955B] hover:underline">
                    {submission.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#2B2B2B]/40" />
                <span className="text-sm text-[#2B2B2B]/60">
                  {new Date(submission.created_date).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Form Type & Services */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#2B2B2B]/60 font-medium mb-1">Form Type</p>
              <p className="text-sm font-medium text-[#0B1220]">{submission.form_type}</p>
            </div>
            {submission.service_interest?.length > 0 && (
              <div>
                <p className="text-xs text-[#2B2B2B]/60 font-medium mb-1">Services Interested In</p>
                <div className="flex flex-wrap gap-2">
                  {submission.service_interest.map(s => (
                    <span key={s} className="text-xs bg-[#f0f0f0] text-[#0B1220] px-2 py-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {submission.message && (
            <div>
              <p className="text-xs text-[#2B2B2B]/60 font-medium mb-2">Message</p>
              <div className="bg-[#f5f5f5] rounded-lg p-4 text-sm text-[#0B1220] leading-relaxed">
                {submission.message}
              </div>
            </div>
          )}

          {/* Book Details */}
          {(submission.book_title || submission.book_genre || submission.book_page_count) && (
            <div>
              <p className="text-xs text-[#2B2B2B]/60 font-medium mb-2">Book Details</p>
              <div className="bg-[#f5f5f5] rounded-lg p-4 space-y-1">
                {submission.book_title && <p><strong>Title:</strong> {submission.book_title}</p>}
                {submission.book_genre && <p><strong>Genre:</strong> {submission.book_genre}</p>}
                {submission.book_page_count && <p><strong>Pages:</strong> {submission.book_page_count}</p>}
                {submission.book_word_count && <p><strong>Words:</strong> {submission.book_word_count}</p>}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <p className="text-xs text-[#2B2B2B]/60 font-medium mb-2">Internal Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this submission..."
              className="w-full p-3 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#B8955B] text-sm"
              rows={3}
            />
            {notes !== (submission.internal_notes || '') && (
              <button
                onClick={handleSaveNotes}
                disabled={updatingNotes}
                className="mt-2 px-4 py-2 bg-[#B8955B] text-white text-sm rounded-lg hover:bg-[#a07d4a] disabled:opacity-50"
              >
                {updatingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            )}
          </div>

          {/* Analytics */}
          {(submission.device_type || submission.city || submission.country) && (
            <div>
              <p className="text-xs text-[#2B2B2B]/60 font-medium mb-2">Visitor Info</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {submission.device_type && <div><strong>Device:</strong> {submission.device_type}</div>}
                {submission.browser && <div><strong>Browser:</strong> {submission.browser}</div>}
                {submission.city && <div><strong>City:</strong> {submission.city}</div>}
                {submission.country && <div><strong>Country:</strong> {submission.country}</div>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-[#ddd]/30 pt-4 space-y-2">
            {submission.status !== 'converted_to_lead' && (
              <button
                onClick={handleConvertToLead}
                disabled={converting || !submission.contact_id}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 font-medium text-sm transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                {converting ? 'Converting...' : 'Convert to Lead'}
              </button>
            )}

            {submission.status !== 'spam' && (
              <button
                onClick={() => onStatusChange(submission.id, 'spam')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-all"
              >
                <Flag className="w-4 h-4" />
                Mark as Spam
              </button>
            )}

            {submission.status !== 'archived' && submission.status !== 'converted_to_lead' && (
              <button
                onClick={() => onStatusChange(submission.id, 'archived')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-all"
              >
                Archive
              </button>
            )}

            <button
              onClick={() => onDelete(submission.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50/50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}