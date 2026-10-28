import React, { useState, useRef, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { X, Send, Paperclip, ChevronDown, Bold, Italic, List, Link, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FROM_EMAIL = 'info@creativebooks.co.za';

export default function EmailCompose({ contact, prefill = {}, onClose, onSent, templates = [] }) {
  const [to, setTo] = useState(prefill.to || (contact?.email ? [contact.email] : []));
  const [toInput, setToInput] = useState('');
  const [cc, setCc] = useState(prefill.cc || []);
  const [ccInput, setCcInput] = useState('');
  const [showCc, setShowCc] = useState(!!(prefill.cc?.length));
  const [subject, setSubject] = useState(prefill.subject || '');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState(prefill.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && prefill.body_html) {
      editorRef.current.innerHTML = prefill.body_html;
    }
  }, []);

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const addEmail = (list, setList, input, setInput) => {
    const email = input.trim();
    if (email && /\S+@\S+\.\S+/.test(email) && !list.includes(email)) {
      setList([...list, email]);
    }
    setInput('');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise(resolve => {
        reader.onload = async (ev) => {
          const base64 = ev.target.result.split(',')[1];
          const res = await platform.functions.invoke('sendContactEmail', {
            action: 'upload_attachment',
            file_data: base64,
            file_name: file.name,
            mime_type: file.type,
          });
          if (res.data?.url) {
            setAttachments(prev => [...prev, { name: file.name, url: res.data.url, size: file.size }]);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
    e.target.value = '';
  };

  const applyTemplate = (tpl) => {
    // Merge fields
    const merge = (text) => text
      .replace(/\{first_name\}/g, contact?.full_name?.split(' ')[0] || '')
      .replace(/\{full_name\}/g, contact?.full_name || '')
      .replace(/\{book_title\}/g, contact?.book_title || '')
      .replace(/\{email\}/g, contact?.email || '')
      .replace(/\{company\}/g, contact?.company || '');
    setSubject(merge(tpl.subject));
    if (editorRef.current) editorRef.current.innerHTML = merge(tpl.body_html);
    setShowTemplates(false);
  };

  const handleSend = async () => {
    const allTo = [...to, ...(toInput.trim() ? [toInput.trim()] : [])];
    if (!allTo.length) { toast.error('Add at least one recipient'); return; }
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    const body_html = editorRef.current?.innerHTML || '';
    if (!body_html.replace(/<[^>]*>/g, '').trim()) { toast.error('Email body is empty'); return; }

    setSending(true);
    const res = await platform.functions.invoke('sendContactEmail', {
      action: 'send',
      contact_id: contact?.id || null,
      to: allTo,
      cc: cc.length ? cc : undefined,
      subject,
      body_html,
      attachments,
      thread_id: prefill.thread_id || null,
      template_id: prefill.template_id || null,
    });
    setSending(false);

    if (res.data?.success) {
      toast.success('Email sent!');
      onSent?.(res.data.message);
      onClose();
    } else {
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/8 shrink-0">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-[#B87333]" />
            <span className="font-bold text-[#1A1208]">Compose Email</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Templates */}
            <div className="relative">
              <button onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#B87333] border border-[#B87333]/30 rounded-lg hover:bg-[#B87333]/5">
                <FileText className="w-3.5 h-3.5" /> Templates <ChevronDown className="w-3 h-3" />
              </button>
              {showTemplates && templates.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-black/10 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-[#faf8f4] border-b border-black/5 last:border-0">
                      <div className="font-medium text-[#1A1208]">{t.name}</div>
                      <div className="text-xs text-black/40 truncate">{t.subject}</div>
                    </button>
                  ))}
                </div>
              )}
              {showTemplates && templates.length === 0 && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-black/10 rounded-xl shadow-xl z-10 p-3 text-xs text-black/40 text-center">
                  No templates yet
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Fields */}
        <div className="border-b border-black/8 shrink-0">
          {/* From */}
          <div className="flex items-center px-5 py-2.5 border-b border-black/5">
            <span className="text-xs text-black/40 w-12 shrink-0">From</span>
            <span className="text-sm text-black/60">{FROM_EMAIL}</span>
          </div>
          {/* To */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-black/5 flex-wrap">
            <span className="text-xs text-black/40 w-12 shrink-0">To</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {to.map(addr => (
                <span key={addr} className="flex items-center gap-1 px-2 py-0.5 bg-[#B87333]/10 text-[#B87333] text-xs rounded-full font-medium">
                  {addr}
                  <button onClick={() => setTo(to.filter(a => a !== addr))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <input value={toInput} onChange={e => setToInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(to, setTo, toInput, setToInput); } }}
                onBlur={() => addEmail(to, setTo, toInput, setToInput)}
                placeholder={to.length ? '' : 'recipient@email.com'} className="outline-none text-sm flex-1 min-w-[140px]" />
            </div>
            <button onClick={() => setShowCc(!showCc)} className="text-xs text-black/40 hover:text-[#B87333]">Cc</button>
          </div>
          {/* CC */}
          {showCc && (
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-black/5 flex-wrap">
              <span className="text-xs text-black/40 w-12 shrink-0">Cc</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {cc.map(addr => (
                  <span key={addr} className="flex items-center gap-1 px-2 py-0.5 bg-black/8 text-black/60 text-xs rounded-full">
                    {addr} <button onClick={() => setCc(cc.filter(a => a !== addr))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input value={ccInput} onChange={e => setCcInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(cc, setCc, ccInput, setCcInput); } }}
                  onBlur={() => addEmail(cc, setCc, ccInput, setCcInput)}
                  placeholder="cc@email.com" className="outline-none text-sm flex-1 min-w-[140px]" />
              </div>
            </div>
          )}
          {/* Subject */}
          <div className="flex items-center px-5 py-2.5">
            <span className="text-xs text-black/40 w-12 shrink-0">Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject…"
              className="flex-1 text-sm outline-none text-[#1A1208] font-medium placeholder:font-normal" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-black/8 bg-[#fafaf9] shrink-0">
          <button onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 hover:bg-black/8 rounded text-sm font-bold text-black/60"><Bold className="w-3.5 h-3.5" /></button>
          <button onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 hover:bg-black/8 rounded italic text-black/60"><Italic className="w-3.5 h-3.5" /></button>
          <button onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="p-1.5 hover:bg-black/8 rounded text-black/60"><List className="w-3.5 h-3.5" /></button>
          <button onMouseDown={e => {
            e.preventDefault();
            const url = prompt('Enter URL:');
            if (url) execCmd('createLink', url);
          }} className="p-1.5 hover:bg-black/8 rounded text-black/60"><Link className="w-3.5 h-3.5" /></button>
          <div className="w-px h-4 bg-black/10 mx-1" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 p-1.5 hover:bg-black/8 rounded text-xs text-black/60">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading…' : 'Attach'}
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[180px] outline-none text-sm text-[#1A1208] leading-relaxed prose prose-sm max-w-none"
            data-placeholder="Write your message here…"
            style={{ whiteSpace: 'pre-wrap' }}
            onFocus={e => { if (!e.target.textContent.trim()) e.target.innerHTML = ''; }}
          />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2 shrink-0">
            {attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-lg text-xs text-black/60">
                <Paperclip className="w-3 h-3" /> {a.name}
                <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-black/8 shrink-0">
          <div className="text-xs text-black/30">Sending from {FROM_EMAIL}</div>
          <button onClick={handleSend} disabled={sending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] disabled:opacity-50 transition-colors">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}