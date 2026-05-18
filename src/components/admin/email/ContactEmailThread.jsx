import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Reply, CornerUpRight, Forward, ChevronDown, ChevronUp, Loader2, Plus } from 'lucide-react';
import EmailCompose from './EmailCompose';

function EmailItem({ email, contact, onReply, onForward, templates }) {
  const [expanded, setExpanded] = useState(true);
  const isInbound = email.direction === 'inbound';
  const date = new Date(email.sent_at || email.created_date);

  return (
    <div className={`border rounded-xl overflow-hidden mb-3 ${isInbound ? 'border-blue-100 bg-blue-50/30' : 'border-black/8 bg-white'}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/2 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isInbound ? 'bg-blue-100 text-blue-600' : 'bg-[#B87333]/15 text-[#B87333]'}`}>
            {isInbound ? '←' : '→'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-black/40">{isInbound ? 'From' : 'To'}</span>
              <span className="text-sm font-medium text-[#1A1208] truncate">
                {isInbound ? email.from_address : (email.to_addresses || []).join(', ')}
              </span>
            </div>
            <div className="text-sm text-black/60 truncate font-medium">{email.subject}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-xs text-black/30 whitespace-nowrap">{date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-black/30" /> : <ChevronDown className="w-4 h-4 text-black/30" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="text-xs text-black/40 mb-3 flex flex-wrap gap-x-4 gap-y-1">
            <span>From: <span className="text-black/60">{email.from_address}</span></span>
            <span>To: <span className="text-black/60">{(email.to_addresses || []).join(', ')}</span></span>
            {email.cc_addresses?.length > 0 && <span>Cc: <span className="text-black/60">{email.cc_addresses.join(', ')}</span></span>}
          </div>
          <div
            className="prose prose-sm max-w-none text-sm text-[#1A1208] leading-relaxed border-t border-black/5 pt-3"
            dangerouslySetInnerHTML={{ __html: email.body_html || email.body_text?.replace(/\n/g, '<br>') || '' }}
          />
          {email.attachments?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {email.attachments.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 hover:bg-black/8 rounded-lg text-xs text-black/60 transition-colors">
                  📎 {a.name}
                </a>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => onReply(email, false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#B87333] border border-[#B87333]/30 rounded-lg hover:bg-[#B87333]/5 transition-colors">
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
            <button onClick={() => onReply(email, true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black/50 border border-black/15 rounded-lg hover:bg-black/5 transition-colors">
              <CornerUpRight className="w-3.5 h-3.5" /> Reply All
            </button>
            <button onClick={() => onForward(email)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black/50 border border-black/15 rounded-lg hover:bg-black/5 transition-colors">
              <Forward className="w-3.5 h-3.5" /> Forward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContactEmailThread({ contact }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [composeProps, setComposeProps] = useState({});
  const [templates, setTemplates] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.functions.invoke('sendContactEmail', { action: 'list', contact_id: contact.id }),
      base44.entities.EmailTemplate.filter({ is_active: true }),
    ]).then(([res, tpls]) => {
      setEmails(res.data?.emails || []);
      setTemplates(tpls);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [contact.id]);

  const handleCompose = () => {
    setComposeProps({});
    setComposing(true);
  };

  const handleReply = (email, replyAll) => {
    const isInbound = email.direction === 'inbound';
    const replyTo = isInbound ? email.from_address : (email.to_addresses?.[0] || contact.email);
    const ccs = replyAll ? (isInbound ? email.cc_addresses || [] : [...(email.cc_addresses || []), ...((email.to_addresses || []).slice(1))]) : [];
    setComposeProps({
      to: [replyTo],
      cc: ccs,
      subject: `Re: ${email.subject.startsWith('Re:') ? email.subject.slice(4).trim() : email.subject}`,
      body_html: `<br><br><blockquote style="border-left:3px solid #B87333;padding-left:12px;color:#666;margin:8px 0">${email.body_html || ''}</blockquote>`,
      thread_id: email.thread_id || email.id,
    });
    setComposing(true);
  };

  const handleForward = (email) => {
    setComposeProps({
      to: [],
      subject: `Fwd: ${email.subject}`,
      body_html: `<br><br><hr style="border:none;border-top:1px solid #eee;margin:12px 0"><p style="color:#999;font-size:12px">---------- Forwarded message ----------<br>From: ${email.from_address}<br>Subject: ${email.subject}</p>${email.body_html || ''}`,
      thread_id: email.thread_id || email.id,
    });
    setComposing(true);
  };

  const handleSent = (msg) => {
    setEmails(prev => [msg, ...prev]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#B87333]" />
          <span className="text-sm font-bold text-black/60 uppercase tracking-wide">Email History</span>
          <span className="text-xs bg-black/5 text-black/50 px-2 py-0.5 rounded-full font-semibold">{emails.length}</span>
        </div>
        <button onClick={handleCompose}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#B87333] text-white rounded-xl text-xs font-semibold hover:bg-[#a06428] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Compose
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
      ) : emails.length === 0 ? (
        <div className="text-center py-8 bg-[#faf8f4] rounded-xl border border-black/5">
          <Mail className="w-8 h-8 text-black/20 mx-auto mb-2" />
          <p className="text-sm text-black/40 font-medium">No emails yet</p>
          <p className="text-xs text-black/25 mt-1">Compose the first email to this contact</p>
          <button onClick={handleCompose} className="mt-3 text-[#B87333] text-sm font-semibold hover:underline">Compose now →</button>
        </div>
      ) : (
        <div>
          {emails.map(email => (
            <EmailItem key={email.id} email={email} contact={contact}
              onReply={handleReply} onForward={handleForward} templates={templates} />
          ))}
        </div>
      )}

      {composing && (
        <EmailCompose
          contact={contact}
          prefill={composeProps}
          templates={templates}
          onClose={() => setComposing(false)}
          onSent={handleSent}
        />
      )}
    </div>
  );
}