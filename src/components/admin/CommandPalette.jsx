import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { 
  Search, Users, FileText, Receipt, FolderKanban, CheckSquare, 
  CreditCard, FolderOpen, X, ArrowRight, Zap, Settings, BarChart3
} from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'New Quote', icon: FileText, path: '/admin/quotes/new', category: 'Quick Action' },
  { label: 'View Pipeline', icon: FolderKanban, path: '/admin/pipeline', category: 'Quick Action' },
  { label: 'Document Dashboard', icon: BarChart3, path: '/admin/document-dashboard', category: 'Quick Action' },
  { label: 'Admin Settings', icon: Settings, path: '/admin/settings', category: 'Quick Action' },
  { label: 'View Tasks', icon: CheckSquare, path: '/admin/tasks', category: 'Quick Action' },
  { label: 'Automations', icon: Zap, path: '/admin/automations', category: 'Quick Action' },
];

function highlight(text, query) {
  if (!query || !text) return text || '';
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#B87333]/20 text-[#B87333] rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      if (contacts.length === 0) loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    const [c, q, p, i, t] = await Promise.all([
      platform.entities.Contact.list('-created_date', 200),
      platform.entities.Quote.list('-created_date', 200),
      platform.entities.Project.list('-created_date', 200),
      platform.entities.Invoice.list('-created_date', 200),
      platform.entities.Task.list('-created_date', 100),
    ]).catch(() => [[], [], [], [], []]);
    setContacts(c || []);
    setQuotes(q || []);
    setProjects(p || []);
    setInvoices(i || []);
    setTasks(t || []);
    setLoading(false);
  };

  const results = query.trim().length < 1 ? [] : [
    ...contacts.filter(c => c.full_name?.toLowerCase().includes(query.toLowerCase()) || c.email?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5).map(c => ({ id: c.id, label: c.full_name, sub: c.email, icon: Users, category: 'Contacts', path: `/admin/contacts/detail?id=${c.id}`, color: 'text-blue-600' })),
    ...quotes.filter(q => q.quote_number?.toLowerCase().includes(query.toLowerCase()) || q.book_title?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4).map(q => ({ id: q.id, label: q.quote_number, sub: q.book_title || q.status, icon: FileText, category: 'Quotes', path: `/admin/quotes/${q.id}`, color: 'text-indigo-600' })),
    ...projects.filter(p => p.book_title?.toLowerCase().includes(query.toLowerCase()) || p.author_name?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4).map(p => ({ id: p.id, label: p.book_title, sub: p.stage, icon: FolderKanban, category: 'Projects', path: '/admin/projects', color: 'text-amber-600' })),
    ...invoices.filter(i => i.invoice_number?.toLowerCase().includes(query.toLowerCase()) || i.book_title?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3).map(i => ({ id: i.id, label: i.invoice_number, sub: `R ${(i.total||0).toLocaleString()} · ${i.status}`, icon: Receipt, category: 'Invoices', path: '/admin/invoices', color: 'text-green-600' })),
    ...tasks.filter(t => t.title?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3).map(t => ({ id: t.id, label: t.title, sub: t.status, icon: CheckSquare, category: 'Tasks', path: '/admin/tasks', color: 'text-rose-600' })),
  ];

  const displayItems = query.trim().length < 1 ? QUICK_ACTIONS.map(a => ({ ...a, isAction: true })) : results;

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleSelect = useCallback((item) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, displayItems.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && displayItems[selectedIdx]) { handleSelect(displayItems[selectedIdx]); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search clients, quotes, projects, invoices, tasks..."
            className="flex-1 text-gray-900 bg-transparent outline-none text-base placeholder:text-gray-400"
          />
          {query && <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-400" /></button>}
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded text-xs font-mono text-gray-400 bg-gray-100 border border-gray-200">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#B87333]/30 border-t-[#B87333] rounded-full animate-spin" />
            </div>
          )}

          {!loading && displayItems.length === 0 && query.trim() && (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No results for "<strong>{query}</strong>"</p>
            </div>
          )}

          {!loading && displayItems.length > 0 && (
            <div className="py-2">
              {query.trim().length < 1 && (
                <p className="px-4 pt-1 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</p>
              )}

              {/* Group by category */}
              {query.trim().length > 0 && (
                ['Contacts','Quotes','Projects','Invoices','Tasks'].map(cat => {
                  const catItems = displayItems.filter(i => i.category === cat);
                  if (!catItems.length) return null;
                  const startIdx = displayItems.indexOf(catItems[0]);
                  return (
                    <div key={cat}>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{cat}</p>
                      {catItems.map((item, relIdx) => {
                        const absIdx = startIdx + relIdx;
                        const Icon = item.icon;
                        return (
                          <button key={item.id} onMouseEnter={() => setSelectedIdx(absIdx)} onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selectedIdx === absIdx ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                            <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-4 h-4 ${item.color || 'text-gray-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{highlight(item.label, query)}</p>
                              {item.sub && <p className="text-xs text-gray-400 truncate">{highlight(item.sub, query)}</p>}
                            </div>
                            {selectedIdx === absIdx && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}

              {/* Quick actions (no query) */}
              {query.trim().length < 1 && displayItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onMouseEnter={() => setSelectedIdx(idx)} onClick={() => handleSelect(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selectedIdx === idx ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                    <div className="w-8 h-8 rounded-lg bg-[#B87333]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#B87333]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                    {selectedIdx === idx && <ArrowRight className="w-4 h-4 text-gray-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-gray-100 border border-gray-200 rounded px-1">ESC</kbd> close</span>
          <span className="ml-auto">Creative Books SA CRM</span>
        </div>
      </div>
    </div>
  );
}