import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { Mail, Phone, MessageSquare, Clock, TrendingUp, AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const GLASS = {
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
};

const URGENCY = {
  high: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20' },
  medium: { label: 'Follow up', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20' },
  low: { label: 'Check in', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
};

function getUrgency(contact, quotes) {
  const daysSinceContact = contact.last_contact_date
    ? Math.floor((Date.now() - new Date(contact.last_contact_date)) / 86400000)
    : 999;
  const openQuote = quotes.find(q => q.contact_id === contact.id && ['Sent', 'Delivered', 'Opened', 'Viewed'].includes(q.status));
  if (openQuote) {
    const daysSinceSent = openQuote.sent_at
      ? Math.floor((Date.now() - new Date(openQuote.sent_at)) / 86400000)
      : 0;
    if (daysSinceSent > 7) return { level: 'high', reason: `Quote sent ${daysSinceSent}d ago, no response`, quote: openQuote };
    if (daysSinceSent > 3) return { level: 'medium', reason: `Quote viewed, no action in ${daysSinceSent}d`, quote: openQuote };
  }
  if (daysSinceContact > 30) return { level: 'high', reason: `No contact in ${daysSinceContact} days` };
  if (daysSinceContact > 14) return { level: 'medium', reason: `Last contacted ${daysSinceContact} days ago` };
  if (daysSinceContact > 7 && ['Quote in Progress', 'Quote Sent', 'Payment Pending'].includes(contact.pipeline_stage)) {
    return { level: 'medium', reason: `In ${contact.pipeline_stage} for ${daysSinceContact}d` };
  }
  return null;
}

export default function SmartFollowUpCenter() {
  const [sendingId, setSendingId] = useState(null);
  const [sentIds, setSentIds] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [loadingAiId, setLoadingAiId] = useState(null);
  const [draftBodies, setDraftBodies] = useState({});
  const [draftSubjects, setDraftSubjects] = useState({});

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-followup'],
    queryFn: () => platform.entities.Contact.filter({ is_disabled: false }),
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes-followup'],
    queryFn: () => platform.entities.Quote.list('-created_date', 200),
  });

  // Build follow-up list
  const followUpList = contacts
    .filter(c => !c.do_not_contact && !c.unsubscribed && c.email)
    .filter(c => ['lead', 'customer', 'repeat_customer'].includes(c.lifecycle_stage))
    .map(c => ({ contact: c, urgency: getUrgency(c, quotes) }))
    .filter(x => x.urgency !== null)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.urgency.level] - order[b.urgency.level];
    })
    .slice(0, 20);

  const highCount = followUpList.filter(x => x.urgency.level === 'high').length;
  const mediumCount = followUpList.filter(x => x.urgency.level === 'medium').length;

  const handleSendFollowUp = async (contact, urgency) => {
    setSendingId(contact.id);
    try {
      const subject = draftSubjects[contact.id] || (urgency.quote
        ? `Following up on your quote — ${urgency.quote.book_title || 'your project'}`
        : `Checking in — ${contact.full_name?.split(' ')[0] || 'there'}`);

      const bodyHtml = draftBodies[contact.id] || aiSuggestions[contact.id]?.emailBody ||
        `<p>Hi ${contact.full_name?.split(' ')[0] || 'there'},</p>
        <p>I wanted to follow up and see if you had any questions or if there's anything we can help you with regarding your project.</p>
        <p>We'd love to hear from you — please feel free to reply to this email or give us a call.</p>
        <p>Warm regards,<br/>Creative Books SA Team</p>`;

      await platform.functions.invoke('sendBrandedEmail', {
        to: contact.email,
        subject,
        body_html: bodyHtml,
        from_name: 'Creative Books SA',
      });

      await platform.entities.Contact.update(contact.id, {
        last_followup_sent_at: new Date().toISOString(),
        last_contact_date: new Date().toISOString(),
      });

      setSentIds(prev => new Set([...prev, contact.id]));
      toast.success(`Follow-up sent to ${contact.full_name}`);
    } catch (err) {
      toast.error('Failed to send follow-up');
    } finally {
      setSendingId(null);
    }
  };

  const handleGetAiSuggestion = async (contact, urgency) => {
    setLoadingAiId(contact.id);
    try {
      const res = await platform.integrations.Core.InvokeLLM({
        prompt: `You are a publishing company sales assistant. Write a brief, warm, professional follow-up email body for a client named ${contact.full_name} who is interested in ${contact.book_title ? `publishing "${contact.book_title}"` : 'book publishing services'}. Context: ${urgency.reason}. Their pipeline stage: ${contact.pipeline_stage || 'lead'}. Keep it under 100 words, personal, non-pushy. Return just the HTML body (use <p> tags).`,
        response_json_schema: {
          type: 'object',
          properties: {
            emailBody: { type: 'string' },
            subject: { type: 'string' },
          },
        },
      });
      setAiSuggestions(prev => ({ ...prev, [contact.id]: res }));
      setDraftBodies(prev => ({ ...prev, [contact.id]: res.emailBody || '' }));
      setDraftSubjects(prev => ({ ...prev, [contact.id]: res.subject || '' }));
      setExpandedId(contact.id);
    } catch {
      toast.error('AI suggestion failed');
    } finally {
      setLoadingAiId(null);
    }
  };

  if (followUpList.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-center" style={GLASS}>
        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">All caught up!</p>
        <p className="text-xs text-white/50 mt-0.5">No follow-ups needed right now.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={GLASS}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Smart Follow-ups</h3>
            <p className="text-xs text-white/50">{followUpList.length} clients need attention</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {highCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">{highCount} urgent</span>
          )}
          {mediumCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{mediumCount} medium</span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
        {followUpList.map(({ contact, urgency }) => {
          const isSent = sentIds.has(contact.id);
          const isSending = sendingId === contact.id;
          const isLoadingAi = loadingAiId === contact.id;
          const isExpanded = expandedId === contact.id;
          const suggestion = aiSuggestions[contact.id];
          const urg = URGENCY[urgency.level];

          return (
            <div key={contact.id} className="p-4 transition-colors hover:bg-white/5">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: `rgba(184,115,51,0.35)` }}>
                  {(contact.full_name || '?')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{contact.full_name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${urg.bg} ${urg.color}`}>
                      {urg.label}
                    </span>
                    {contact.pipeline_stage && (
                      <span className="text-xs text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{contact.pipeline_stage}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5 truncate">{urgency.reason}</p>
                  {contact.book_title && (
                    <p className="text-xs text-[#D4A574]/70 mt-0.5 truncate">📖 {contact.book_title}</p>
                  )}

                  {/* Expanded AI suggestion with editable draft */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      <div className="p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-[10px] font-bold text-[#D4A574] uppercase tracking-wide mb-2">Email Draft</p>
                        
                        {/* Subject field */}
                        <div className="mb-2">
                          <label className="text-[9px] font-semibold text-white/60 uppercase tracking-wide block mb-1">Subject</label>
                          <input
                            type="text"
                            value={draftSubjects[contact.id] || (urgency.quote ? `Following up on your quote — ${urgency.quote.book_title || 'your project'}` : `Checking in — ${contact.full_name?.split(' ')[0] || 'there'}`)}
                            onChange={(e) => setDraftSubjects(prev => ({ ...prev, [contact.id]: e.target.value }))}
                            className="w-full px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#B87333]/50"
                            placeholder="Email subject..."
                          />
                        </div>

                        {/* Body field */}
                        <div>
                          <label className="text-[9px] font-semibold text-white/60 uppercase tracking-wide block mb-1">Email Body</label>
                          <textarea
                            value={draftBodies[contact.id] || suggestion?.emailBody || ''}
                            onChange={(e) => setDraftBodies(prev => ({ ...prev, [contact.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#B87333]/50 min-h-[120px] font-sans"
                            placeholder="Email body..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {isSent ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Sent
                      </span>
                    ) : (
                      <button onClick={() => handleSendFollowUp(contact, urgency)} disabled={isSending}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-all hover:scale-105"
                        style={{ background: 'rgba(184,115,51,0.4)', border: '1px solid rgba(184,115,51,0.3)' }}>
                        {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        Send Follow-up
                      </button>
                    )}
                    <button onClick={() => handleGetAiSuggestion(contact, urgency)} disabled={isLoadingAi}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-purple-300 hover:bg-purple-500/10 disabled:opacity-50 transition-all">
                      {isLoadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      AI Draft
                    </button>
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white/50 hover:bg-white/10 transition-all">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    )}
                    {contact.whatsapp_number && (
                      <a href={`https://wa.me/${contact.whatsapp_number?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all">
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}