import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { BookOpen, FileText, CreditCard, FolderOpen, ChevronRight, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent': 'bg-blue-100 text-blue-700',
  'Paid': 'bg-green-100 text-green-700',
  'Overdue': 'bg-red-100 text-red-700',
  'Accepted': 'bg-green-100 text-green-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
  'Partially Paid': 'bg-yellow-100 text-yellow-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
  );
}

export default function ClientPortal() {
  const { token } = useParams();
  const [access, setAccess] = useState(null);
  const [contact, setContact] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) { setError('Invalid link'); setLoading(false); return; }
    loadPortalData();
  }, [token]);

  const loadPortalData = async () => {
    setLoading(true);
    const accesses = await base44.entities.ClientPortalAccess.filter({ access_token: token });
    if (!accesses.length) { setError('This link is invalid or has been revoked.'); setLoading(false); return; }
    const acc = accesses[0];
    if (!acc.is_active) { setError('This portal link has been deactivated.'); setLoading(false); return; }
    if (acc.expires_at && new Date(acc.expires_at) < new Date()) { setError('This portal link has expired. Please contact us for a new link.'); setLoading(false); return; }

    setAccess(acc);

    // Track access
    await base44.entities.ClientPortalAccess.update(acc.id, { last_accessed_at: new Date().toISOString(), access_count: (acc.access_count || 0) + 1 });

    const cid = acc.contact_id;
    const allowed = acc.allowed_sections || [];

    const [contactData, quotesData, invoicesData, projectsData, docsData] = await Promise.all([
      base44.entities.Contact.filter({ id: cid }).then(r => r[0]),
      allowed.includes('quotes') ? base44.entities.Quote.filter({ contact_id: cid }) : Promise.resolve([]),
      allowed.includes('invoices') ? base44.entities.Invoice.filter({ contact_id: cid }) : Promise.resolve([]),
      allowed.includes('projects') ? base44.entities.Project.filter({ contact_id: cid }) : Promise.resolve([]),
      allowed.includes('documents') ? base44.entities.Document.filter({ contact_id: cid }) : Promise.resolve([]),
    ]);

    setContact(contactData);
    setQuotes(quotesData);
    setInvoices(invoicesData);
    setProjects(projectsData);
    setDocuments(docsData.filter(d => !['Internal Admin', 'Printing Spec'].includes(d.category)));
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#B87333] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading your portal...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Access Unavailable</h2>
        <p className="text-gray-500">{error}</p>
        <p className="text-sm text-gray-400 mt-4">Please contact Creative Books SA to get a new link.</p>
        <a href="/" className="inline-block mt-4 text-[#B87333] text-sm font-medium hover:underline">← Back to Website</a>
      </div>
    </div>
  );

  const allowed = access?.allowed_sections || [];
  const tabs = [
    { key: 'overview', label: 'Overview', icon: BookOpen },
    allowed.includes('quotes') && { key: 'quotes', label: `Quotes (${quotes.length})`, icon: FileText },
    allowed.includes('invoices') && { key: 'invoices', label: `Invoices (${invoices.length})`, icon: CreditCard },
    allowed.includes('projects') && { key: 'projects', label: `Projects (${projects.length})`, icon: CheckCircle },
    allowed.includes('documents') && { key: 'documents', label: `Documents (${documents.length})`, icon: FolderOpen },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#B87333] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Creative Books SA</p>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </div>
          {contact && (
            <div className="text-right">
              <p className="font-medium text-gray-800 text-sm">{contact.full_name}</p>
              <p className="text-xs text-gray-400">{contact.email}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-[#B87333] to-[#D4A574] rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-xl font-bold mb-1">Welcome back, {contact?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-white/80 text-sm">Here's an overview of your publishing journey with Creative Books SA.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-white shadow-sm text-[#B87333] border border-[#B87333]/20' : 'text-gray-500 hover:bg-white/70'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allowed.includes('quotes') && <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><p className="text-2xl font-bold text-[#B87333]">{quotes.length}</p><p className="text-xs text-gray-500 mt-1">Quotes</p></div>}
              {allowed.includes('invoices') && <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><p className="text-2xl font-bold text-blue-600">{invoices.length}</p><p className="text-xs text-gray-500 mt-1">Invoices</p></div>}
              {allowed.includes('projects') && <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><p className="text-2xl font-bold text-green-600">{projects.filter(p => !['Completed', 'Delivered'].includes(p.stage)).length}</p><p className="text-xs text-gray-500 mt-1">Active Projects</p></div>}
              {allowed.includes('documents') && <div className="bg-white rounded-xl border border-gray-100 p-4 text-center"><p className="text-2xl font-bold text-purple-600">{documents.length}</p><p className="text-xs text-gray-500 mt-1">Documents</p></div>}
            </div>

            {/* Active Projects Preview */}
            {allowed.includes('projects') && projects.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Your Projects</h3>
                <div className="space-y-3">
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.book_title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.service_type}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-2 py-1 bg-[#B87333]/10 text-[#B87333] rounded-full text-xs font-medium">{p.stage}</span>
                        {p.deadline && <p className="text-xs text-gray-400 mt-1">Due: {new Date(p.deadline).toLocaleDateString('en-ZA')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outstanding Balance */}
            {allowed.includes('invoices') && invoices.some(i => (i.balance_due || 0) > 0) && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Outstanding Balance</h3>
                <p className="text-2xl font-bold text-orange-700">R {invoices.reduce((s, i) => s + (i.balance_due || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-orange-600 mt-1">Please make payment to avoid delays to your project.</p>
              </div>
            )}
          </div>
        )}

        {/* Quotes */}
        {activeTab === 'quotes' && (
          <div className="space-y-3">
            {quotes.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No quotes yet</div> :
              quotes.map(q => (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{q.book_title || q.quote_number}</p>
                    <p className="text-sm text-gray-500 mt-0.5">R {(q.total || 0).toLocaleString()} · {new Date(q.created_date).toLocaleDateString('en-ZA')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={q.status} />
                    {q.pdf_url && <a href={q.pdf_url} target="_blank" rel="noreferrer"><button className="p-2 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-gray-500" /></button></a>}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            {invoices.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No invoices yet</div> :
              invoices.map(inv => (
                <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{inv.invoice_number}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{inv.book_title || ''} · Total: R {(inv.total || 0).toLocaleString()}</p>
                    {(inv.balance_due || 0) > 0 && <p className="text-xs text-orange-600 mt-0.5 font-medium">Balance due: R {inv.balance_due.toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={inv.status} />
                    {inv.due_date && <p className="text-xs text-gray-400">Due {new Date(inv.due_date).toLocaleDateString('en-ZA')}</p>}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            {projects.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No projects yet</div> :
              projects.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{p.book_title}</p>
                      <p className="text-sm text-gray-500">{p.service_type} {p.author_name && `· ${p.author_name}`}</p>
                    </div>
                    <span className="px-3 py-1 bg-[#B87333]/10 text-[#B87333] rounded-full text-xs font-semibold">{p.stage}</span>
                  </div>
                  {p.client_notes && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Note from Creative Books SA</p>
                      <p className="text-sm text-blue-800">{p.client_notes}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    {p.deadline && <span>Deadline: {new Date(p.deadline).toLocaleDateString('en-ZA')}</span>}
                    <span className={`px-2 py-0.5 rounded-full ${p.payment_status === 'Fully Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{p.payment_status}</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            {documents.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No documents yet</div> :
              documents.map(doc => {
                const hasSecureLink = doc.secure_token && doc.expires_at && new Date(doc.expires_at) > new Date();
                const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();
                const secureUrl = hasSecureLink ? `/doc/view/${doc.id}/${doc.secure_token}` : null;
                const needsAction = ['Sent to Client','Opened','Awaiting Signature','Awaiting Approval'].includes(doc.status);
                return (
                  <div key={doc.id} className={`bg-white rounded-2xl border p-4 ${needsAction ? 'border-[#B87333]/30 bg-orange-50/30' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-sm">{doc.file_name}</p>
                          {doc.version > 1 && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">v{doc.version}</span>}
                          {needsAction && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-semibold">Action needed</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.category}{doc.book_title ? ` · ${doc.book_title}` : ''}</p>
                        {isExpired && <p className="text-xs text-orange-500 mt-0.5">⏱ Link expired — please contact us for a new link</p>}
                        {doc.sent_at && <p className="text-xs text-gray-400 mt-0.5">Sent: {new Date(doc.sent_at).toLocaleDateString('en-ZA')}</p>}
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {secureUrl && (
                        <a href={secureUrl} className="flex items-center gap-1.5 px-3 py-2 bg-[#B87333] hover:bg-[#A06828] text-white rounded-lg text-xs font-semibold transition-colors">
                          <ChevronRight className="w-3 h-3" />
                          {needsAction ? 'Open & Take Action' : 'View Document'}
                        </a>
                      )}
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                          <Download className="w-3 h-3" /> Download
                        </a>
                      )}
                      {doc.proof_url && (
                        <a href={doc.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 border border-teal-200 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-50 transition-colors">
                          <Download className="w-3 h-3" /> View Uploaded Proof
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© Creative Books SA · <a href="/" className="hover:underline">Visit our website</a> · <a href="/contact" className="hover:underline">Contact us</a></p>
        </div>
      </div>
    </div>
  );
}