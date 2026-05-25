import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Edit2, Trash2, FileText, Phone, Mail, MapPin, BookOpen, Tag, Clock, DollarSign, ExternalLink } from 'lucide-react';

const STAGES = ['new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost'];
const STAGE_COLORS = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-purple-100 text-purple-700 border-purple-200',
  qualified: 'bg-amber-100 text-amber-700 border-amber-200',
  quoted: 'bg-orange-100 text-orange-700 border-orange-200',
  negotiating: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
};

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-1">
      <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="text-xs text-gray-400">{label}: </span>
        <span className="text-xs font-medium text-gray-800 break-words">{value}</span>
      </div>
    </div>
  );
}

export default function LeadDetailPanel({ lead, contact, submissions, onClose, onEdit, onDelete, onStageChange }) {
  const [changingStage, setChangingStage] = useState(false);
  const latestSub = submissions?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  const weighted = lead.estimated_value && lead.probability_percent
    ? Math.round(lead.estimated_value * lead.probability_percent / 100)
    : 0;
  const isOverdue = lead.next_action_due && new Date(lead.next_action_due) < new Date();

  return (
    <div className="w-full lg:w-[420px] xl:w-[480px] border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#B87333] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(contact?.full_name?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{contact?.full_name || 'Unknown Contact'}</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {lead.stage}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors" title="Edit lead">
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-5">
          <Link
            to={`/admin/quotes/new`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#B87333] text-white rounded-lg text-xs font-semibold hover:bg-[#a06428] transition-colors">
            <FileText className="w-3.5 h-3.5" /> Create Quote
          </Link>
          <Link
            to={`/admin/contacts?id=${contact?.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View Contact
          </Link>
        </div>

        {/* Stage change */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button key={s}
                onClick={() => { setChangingStage(true); onStageChange(s).finally(() => setChangingStage(false)); }}
                disabled={changingStage || lead.stage === s}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all disabled:opacity-60 ${lead.stage === s ? STAGE_COLORS[s] : 'bg-white border-gray-200 text-gray-600 hover:border-[#B87333] hover:text-[#B87333]'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lead financials */}
        <Section title="Deal Value">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Estimated</p>
              <p className="text-sm font-bold text-gray-900">R{(lead.estimated_value || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Probability</p>
              <p className="text-sm font-bold text-gray-900">{lead.probability_percent || 0}%</p>
            </div>
            <div className="bg-[#B87333]/5 rounded-lg p-3 text-center border border-[#B87333]/10">
              <p className="text-xs text-[#B87333] mb-1">Weighted</p>
              <p className="text-sm font-bold text-[#B87333]">R{weighted.toLocaleString()}</p>
            </div>
          </div>
        </Section>

        {/* Contact info */}
        <Section title="Contact Details">
          <InfoRow icon={Mail} label="Email" value={contact?.email} />
          <InfoRow icon={Phone} label="Phone" value={contact?.phone} />
          <InfoRow icon={MapPin} label="Location" value={[contact?.city, contact?.province].filter(Boolean).join(', ')} />
          <InfoRow icon={BookOpen} label="Book Title" value={contact?.book_title} />
        </Section>

        {/* Lead details */}
        <Section title="Lead Details">
          {(lead.service_interest || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1">
              {lead.service_interest.map(s => (
                <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium">{s}</span>
              ))}
            </div>
          )}
          <InfoRow icon={Clock} label="Expected Close" value={lead.expected_close_date ? new Date(lead.expected_close_date).toLocaleDateString('en-ZA') : null} />
          <InfoRow icon={Clock} label="Created" value={new Date(lead.created_date).toLocaleDateString('en-ZA')} />
        </Section>

        {/* Next action */}
        {(lead.next_action || lead.next_action_due) && (
          <Section title="Next Action">
            {lead.next_action && (
              <div className={`px-3 py-2 rounded-lg text-xs ${isOverdue ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                {isOverdue && '⚠ Overdue: '}{lead.next_action}
                {lead.next_action_due && <span className="block text-xs opacity-70 mt-0.5">Due: {new Date(lead.next_action_due).toLocaleDateString('en-ZA')}</span>}
              </div>
            )}
          </Section>
        )}

        {/* Notes/description */}
        {lead.description && (
          <Section title="Notes">
            <p className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{lead.description}</p>
          </Section>
        )}

        {/* Latest submission data */}
        {latestSub && (
          <Section title="Submission Details">
            <InfoRow icon={Tag} label="Source" value={latestSub.marketing_source ? (({ organic_search: 'Organic Search', direct: 'Direct', social: 'Social', referral: 'Referral', paid: 'Paid Ads', email: 'Email', other: 'Other' })[latestSub.marketing_source] || latestSub.marketing_source) : null} />
            <InfoRow icon={ExternalLink} label="Source Page" value={latestSub.source_page} />
            <InfoRow icon={BookOpen} label="Book Title" value={latestSub.book_title} />
            <InfoRow icon={BookOpen} label="Word Count" value={latestSub.book_word_count ? latestSub.book_word_count.toLocaleString() : null} />
            <InfoRow icon={BookOpen} label="Page Count" value={latestSub.book_page_count?.toString()} />
            <InfoRow icon={DollarSign} label="Budget" value={latestSub.budget} />
            {latestSub.message && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Message:</p>
                <p className="text-xs text-gray-700 leading-relaxed">{latestSub.message}</p>
              </div>
            )}
          </Section>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-gray-200 px-5 py-3 flex gap-2">
        <button onClick={() => onDelete(lead.id)}
          className="flex items-center gap-1.5 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-xs font-semibold transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete Lead
        </button>
      </div>
    </div>
  );
}