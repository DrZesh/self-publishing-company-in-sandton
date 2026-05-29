import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import SignatureCanvas from '@/components/signature/SignatureCanvas';
import {
  ChevronLeft, ChevronRight, FileText, PenTool, Send,
  CheckCircle, Eye, Loader2, Lock, UserCheck, Building2,
  BookOpen, DollarSign, Calendar, ClipboardList, Hash
} from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_FIELDS = [
  { id: 'rep_name',        label: 'Creative Books SA Representative', type: 'text',     icon: UserCheck,     placeholder: 'e.g. Sarah van der Merwe',            required: true },
  { id: 'contract_date',   label: 'Contract Date',                    type: 'date',     icon: Calendar,      placeholder: '',                                    required: true },
  { id: 'ref_number',      label: 'Internal Reference Number',        type: 'text',     icon: Hash,          placeholder: 'e.g. CBSA-2026-001',                  required: false },
  { id: 'client_name',     label: 'Client Full Name',                 type: 'text',     icon: UserCheck,     placeholder: 'As per identity document',            required: true },
  { id: 'client_email',    label: 'Client Email Address',             type: 'email',    icon: null,          placeholder: 'client@email.com',                    required: true },
  { id: 'client_phone',    label: 'Client Phone Number',              type: 'text',     icon: null,          placeholder: '+27 82 000 0000',                     required: false },
  { id: 'company_name',    label: 'Company / Trading Name',           type: 'text',     icon: Building2,     placeholder: 'If applicable',                       required: false },
  { id: 'book_title',      label: 'Book Title',                       type: 'text',     icon: BookOpen,      placeholder: 'Full book title',                     required: false },
  { id: 'author_name',     label: 'Author Name / Pen Name',           type: 'text',     icon: null,          placeholder: 'Name as it appears on book',          required: false },
  { id: 'services',        label: 'Services Selected',                type: 'text',     icon: ClipboardList, placeholder: 'e.g. Full Publishing Package',         required: false },
  { id: 'quote_amount',    label: 'Quote Amount (ZAR)',               type: 'text',     icon: DollarSign,    placeholder: 'e.g. R12,500.00',                     required: false },
  { id: 'payment_terms',   label: 'Payment Terms',                    type: 'textarea', icon: null,          placeholder: 'e.g. 50% deposit, 50% on completion', required: false },
  { id: 'timeline',        label: 'Project Timeline',                 type: 'text',     icon: Calendar,      placeholder: 'e.g. 8-12 weeks from manuscript',     required: false },
  { id: 'delivery_method', label: 'Delivery / Collection Method',     type: 'text',     icon: null,          placeholder: 'e.g. Courier to client address',      required: false },
  { id: 'special_cond',    label: 'Special Conditions / Notes',       type: 'textarea', icon: null,          placeholder: 'Any additional conditions or notes',  required: false },
];

const STEPS = ['Fill Fields', 'Admin Sign', 'Review & Send'];

export default function AdminContractPrepareContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [fieldValues, setFieldValues] = useState({});
  const [adminSignature, setAdminSignature] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me().catch(() => null);
      if (user) setAdminName(user.full_name || user.email || '');

      const cs = await base44.entities.Contract.filter({ id });
      if (!cs.length) { toast.error('Contract not found'); navigate('/admin/contracts'); return; }
      const c = cs[0];
      setContract(c);

      const existing = c.contract_field_values || {};
      let autoFill = {};
      if (c.contact_id) {
        const contacts = await base44.entities.Contact.filter({ id: c.contact_id }).catch(() => []);
        if (contacts.length) {
          const ct = contacts[0];
          setContact(ct);
          autoFill = {
            client_name: ct.full_name || '',
            client_email: ct.email || '',
            client_phone: ct.phone || '',
            company_name: ct.company || '',
            book_title: ct.book_title || c.book_title || '',
          };
        }
      }
      setFieldValues({ ...autoFill, ...existing });
      if (c.admin_signed_at) setStep(2);
      setLoading(false);
    };
    load();
  }, [id]);

  const setField = (key, val) => setFieldValues(prev => ({ ...prev, [key]: val }));

  const validateFields = () => {
    const missing = ADMIN_FIELDS.filter(f => f.required && !fieldValues[f.id]?.trim());
    if (missing.length) { toast.error('Please fill: ' + missing.map(f => f.label).join(', ')); return false; }
    return true;
  };

  const handleSaveAdminSign = async () => {
    if (!adminSignature) { toast.error('Please provide your signature'); return; }
    if (!adminName.trim()) { toast.error('Please confirm your name'); return; }
    setSaving(true);
    try {
      let sigUrl = adminSignature.dataUrl;
      try {
        const blob = await fetch(adminSignature.dataUrl).then(r => r.blob());
        const file = new File([blob], 'admin_signature.png', { type: 'image/png' });
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        if (uploaded?.file_url) sigUrl = uploaded.file_url;
      } catch { /* fallback */ }

      const res = await base44.functions.invoke('contractSignature', {
        action: 'admin_sign',
        contract_id: id,
        admin_signature_url: sigUrl,
        contract_field_values: fieldValues,
        admin_signer_name: adminName,
      });
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed');

      const updated = await base44.entities.Contract.filter({ id });
      setContract(updated[0]);
      setStep(2);
      toast.success('Admin signature saved');
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendToClient = async () => {
    setSending(true);
    try {
      const res = await base44.functions.invoke('contractSignature', { action: 'send', contract_id: id });
      if (res.data?.success) {
        toast.success('Contract sent to client for countersignature!');
        navigate('/admin/contracts');
      } else {
        toast.error(res.data?.error || 'Failed to send');
      }
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#B87333]" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/contracts">
            <Button variant="ghost" size="sm" className="gap-1 text-gray-500">
              <ChevronLeft className="w-4 h-4" /> Contracts
            </Button>
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#B87333]" /> Prepare &amp; Sign: {contract?.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#B87333] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-[#B87333]' : i < step ? 'text-emerald-600' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* STEP 0: Fill Fields */}
        {step === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4 text-[#B87333]" /> Contract Preview
                </div>
                {contract?.contract_file_url && (
                  <a href={contract.contract_file_url} target="_blank" rel="noreferrer" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Open full
                  </a>
                )}
              </div>
              {contract?.contract_file_url ? (
                <iframe src={contract.contract_file_url + '#toolbar=0&navpanes=0'} className="w-full border-0" style={{ height: 520 }} title="Contract Preview" />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No document attached</div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b bg-gray-50">
                <h3 className="font-bold text-gray-900">Fill Contract Fields</h3>
                <p className="text-xs text-gray-500 mt-0.5">These fields will be locked for the client and visible as pre-filled when they receive the contract.</p>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: 520 }}>
                {ADMIN_FIELDS.map(field => {
                  const Icon = field.icon;
                  return (
                    <div key={field.id}>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        {Icon && <Icon className="w-3 h-3" />}
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea value={fieldValues[field.id] || ''} onChange={e => setField(field.id, e.target.value)}
                          placeholder={field.placeholder} rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B87333]" />
                      ) : (
                        <Input type={field.type} value={fieldValues[field.id] || ''} onChange={e => setField(field.id, e.target.value)}
                          placeholder={field.placeholder} className="text-sm" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="p-5 border-t">
                <Button onClick={() => { if (validateFields()) setStep(1); }} className="w-full bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
                  Continue to Admin Signature <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Admin Sign */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-amber-900 text-sm">Fields to be locked for client</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {ADMIN_FIELDS.filter(f => fieldValues[f.id]).map(f => (
                  <div key={f.id}>
                    <span className="text-amber-600 font-semibold uppercase tracking-wide" style={{ fontSize: 10 }}>{f.label}</span>
                    <p className="text-amber-900 font-medium truncate">{fieldValues[f.id]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#B87333]" /> Creative Books SA Signature
                </h3>
                <p className="text-sm text-gray-500 mt-1">Sign on behalf of Creative Books SA. This signature will be visible to the client in the contract they receive.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Your Full Name (Representative) *</label>
                <Input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="e.g. Sarah van der Merwe" />
              </div>
              <SignatureCanvas label="Creative Books SA Representative Signature" onChange={setAdminSignature} />
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Legal notice:</strong> By signing, you confirm you are authorised to sign on behalf of Creative Books SA and that the contract details are correct.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={handleSaveAdminSign} disabled={saving || !adminSignature || !adminName.trim()}
                  className="flex-1 bg-[#1A1208] hover:bg-[#2C1E0F] text-white gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><PenTool className="w-4 h-4" /> Save Admin Signature</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review & Send */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Contract Prepared &amp; Signed by Admin</h3>
                  <p className="text-sm text-gray-500">Ready to send to {contact?.full_name || 'client'} for countersignature</p>
                </div>
              </div>

              {contract?.admin_signature_url && (
                <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Creative Books SA Signature</p>
                  <img src={contract.admin_signature_url} alt="Admin signature" className="max-h-16" />
                  <p className="text-xs text-emerald-600 mt-1">
                    {contract.admin_signer_name} · {contract.admin_signed_at ? new Date(contract.admin_signed_at).toLocaleString('en-ZA') : 'Just now'}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Pre-filled Fields (locked for client)</p>
                <div className="space-y-1.5">
                  {ADMIN_FIELDS.filter(f => fieldValues[f.id]).map(f => (
                    <div key={f.id} className="flex items-start gap-2 text-xs">
                      <Lock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500 w-36 flex-shrink-0">{f.label}:</span>
                      <span className="text-gray-800 font-medium">{fieldValues[f.id]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong> The client receives a secure link showing the admin-filled and admin-signed contract. They review, complete their fields, and countersign.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleSendToClient} disabled={sending}
                  className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send to Client for Countersignature</>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}