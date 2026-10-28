import { getCurrentUser } from '@/lib/auth-service';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import SignatureCanvas from '@/components/signature/SignatureCanvas';
import {
  ChevronLeft, ChevronRight, PenTool, Send,
  CheckCircle, Eye, Loader2, Lock, Unlock,
  Plus, Trash2, GripVertical, User, Building2,
  FileText, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { mergePdfFields } from '@/utils/pdfMerge';

// ── Default field templates ──────────────────────────────────────────────────
const DEFAULT_FIELDS = [
  { id: 'rep_name',        label: 'Creative Books SA Representative', type: 'text',     assigned_to: 'admin',  required: true  },
  { id: 'contract_date',   label: 'Contract Date',                    type: 'date',     assigned_to: 'admin',  required: true  },
  { id: 'ref_number',      label: 'Reference Number',                 type: 'text',     assigned_to: 'admin',  required: false },
  { id: 'client_name',     label: 'Client Full Name',                 type: 'text',     assigned_to: 'client', required: true  },
  { id: 'client_email',    label: 'Client Email Address',             type: 'email',    assigned_to: 'client', required: true  },
  { id: 'client_phone',    label: 'Client Phone Number',              type: 'text',     assigned_to: 'client', required: false },
  { id: 'id_number',       label: 'Client ID / Passport Number',      type: 'text',     assigned_to: 'client', required: false },
  { id: 'company_name',    label: 'Company / Trading Name',           type: 'text',     assigned_to: 'client', required: false },
  { id: 'book_title',      label: 'Book Title',                       type: 'text',     assigned_to: 'client', required: false },
  { id: 'author_name',     label: 'Author / Pen Name',                type: 'text',     assigned_to: 'client', required: false },
  { id: 'services',        label: 'Services Selected',                type: 'text',     assigned_to: 'admin',  required: false },
  { id: 'quote_amount',    label: 'Quote Amount (ZAR)',               type: 'text',     assigned_to: 'admin',  required: false },
  { id: 'payment_terms',   label: 'Payment Terms',                    type: 'textarea', assigned_to: 'admin',  required: false },
  { id: 'timeline',        label: 'Project Timeline',                 type: 'text',     assigned_to: 'admin',  required: false },
  { id: 'special_cond',    label: 'Special Conditions / Notes',       type: 'textarea', assigned_to: 'admin',  required: false },
];

const FIELD_TYPES = [
  { value: 'text',     label: 'Text' },
  { value: 'email',    label: 'Email' },
  { value: 'date',     label: 'Date' },
  { value: 'number',   label: 'Number' },
  { value: 'textarea', label: 'Long Text' },
];

const STEPS = ['Build Fields', 'Admin Fill & Sign', 'Review & Send'];

// ── Helper ────────────────────────────────────────────────────────────────────
function newCustomField() {
  return {
    id: `custom_${Date.now()}`,
    label: '',
    type: 'text',
    assigned_to: 'client',
    required: false,
  };
}

// ── Field Builder Row ─────────────────────────────────────────────────────────
function FieldRow({ field, onChange, onDelete, isCustom }) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border transition-colors ${
      field.assigned_to === 'admin'
        ? 'bg-orange-50 border-orange-200'
        : 'bg-blue-50 border-blue-200'
    }`}>
      <GripVertical className="w-4 h-4 text-gray-300 mt-2 flex-shrink-0" />

      {/* Label */}
      <div className="flex-1 min-w-0">
        {isCustom ? (
          <Input
            value={field.label}
            onChange={e => onChange({ ...field, label: e.target.value })}
            placeholder="Field label..."
            className="text-sm h-8 bg-white"
          />
        ) : (
          <p className="text-sm font-medium text-gray-800 pt-1">{field.label}</p>
        )}
      </div>

      {/* Type */}
      <select
        value={field.type}
        onChange={e => onChange({ ...field, type: e.target.value })}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white h-8 focus:outline-none"
      >
        {FIELD_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Assigned to toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 h-8 flex-shrink-0">
        <button
          onClick={() => onChange({ ...field, assigned_to: 'admin' })}
          className={`flex items-center gap-1 px-2.5 text-xs font-semibold transition-colors ${
            field.assigned_to === 'admin'
              ? 'bg-[#B87333] text-white'
              : 'bg-white text-gray-400 hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-3 h-3" /> Admin
        </button>
        <button
          onClick={() => onChange({ ...field, assigned_to: 'client' })}
          className={`flex items-center gap-1 px-2.5 text-xs font-semibold transition-colors border-l ${
            field.assigned_to === 'client'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-400 hover:bg-gray-50'
          }`}
        >
          <User className="w-3 h-3" /> Client
        </button>
      </div>

      {/* Required */}
      <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer flex-shrink-0 pt-1.5">
        <input
          type="checkbox"
          checked={field.required}
          onChange={e => onChange({ ...field, required: e.target.checked })}
          className="accent-[#B87333]"
        />
        Req.
      </label>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 pt-1.5"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminContractPrepareContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  // Field builder state
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  // Admin-filled values: { field_id: value }
  const [adminValues, setAdminValues] = useState({});

  // Signature
  const [adminSignature, setAdminSignature] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser().catch(() => null);
      if (user) setAdminName(user.full_name || user.email || '');

      const cs = await base44.entities.Contract.filter({ id });
      if (!cs.length) { toast.error('Contract not found'); navigate('/admin/contracts'); return; }
      const c = cs[0];
      setContract(c);

      // Restore saved state if exists
      const saved = c.contract_field_values;
      if (saved?._defs) {
        setFields(saved._defs);
        const { _defs, _client, ...adminVals } = saved;
        setAdminValues(adminVals);
      } else {
        // Auto-fill from contact
        const autoVals = {};
        if (c.contact_id) {
          const contacts = await base44.entities.Contact.filter({ id: c.contact_id }).catch(() => []);
          if (contacts.length) {
            const ct = contacts[0];
            setContact(ct);
            autoVals.client_name = ct.full_name || '';
            autoVals.client_email = ct.email || '';
            autoVals.client_phone = ct.phone || '';
            autoVals.company_name = ct.company || '';
            autoVals.book_title = ct.book_title || c.book_title || '';
            autoVals.author_name = ct.full_name || '';
          }
        }
        if (c.book_title && !autoVals.book_title) autoVals.book_title = c.book_title;
        autoVals.contract_date = new Date().toISOString().split('T')[0];
        setAdminValues(autoVals);
      }

      if (c.admin_signed_at) setStep(2);
      setLoading(false);
    };
    load();
  }, [id]);

  const setAdminVal = (key, val) => setAdminValues(prev => ({ ...prev, [key]: val }));

  const updateField = (idx, updated) => {
    setFields(prev => prev.map((f, i) => i === idx ? updated : f));
  };
  const deleteField = (idx) => {
    setFields(prev => prev.filter((_, i) => i !== idx));
  };
  const addCustomField = () => {
    setFields(prev => [...prev, newCustomField()]);
  };

  // Validate step 0: all field labels filled
  const validateFields = () => {
    const empty = fields.filter(f => !f.label.trim());
    if (empty.length) { toast.error('All fields must have a label'); return false; }
    return true;
  };

  // Validate step 1: required admin fields filled
  const validateAdminFill = () => {
    const adminFields = fields.filter(f => f.assigned_to === 'admin' && f.required);
    const missing = adminFields.filter(f => !adminValues[f.id]?.toString().trim());
    if (missing.length) { toast.error('Please fill required admin fields: ' + missing.map(f => f.label).join(', ')); return false; }
    return true;
  };

  const handleSaveAdminSign = async () => {
    if (!validateAdminFill()) return;
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

      // Store: _defs = field definitions, rest = admin values
      const fieldValuesPayload = {
        _defs: fields,
        ...adminValues,
      };

      const res = await base44.functions.invoke('contractSignature', {
        action: 'admin_sign',
        contract_id: id,
        admin_signature_url: sigUrl,
        contract_field_values: fieldValuesPayload,
        admin_signer_name: adminName,
      });
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed');

      // Merge field values into PDF
      if (contract?.contract_file_url) {
        setMerging(true);
        try {
          const filledUrl = await mergePdfFields(contract.contract_file_url, fields, adminValues);
          await base44.entities.Contract.update(id, { contract_file_url: filledUrl });
        } catch (mergeErr) {
          console.warn('PDF merge skipped:', mergeErr.message);
          toast.warning('PDF field merge skipped — contract sent as-is');
        } finally {
          setMerging(false);
        }
      }

      const updated = await base44.entities.Contract.filter({ id });
      setContract(updated[0]);
      setStep(2);
      toast.success('Admin signature saved & PDF generated');
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

  const adminFields = fields.filter(f => f.assigned_to === 'admin');
  const clientFields = fields.filter(f => f.assigned_to === 'client');

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#B87333]" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/contracts">
            <Button variant="ghost" size="sm" className="gap-1 text-gray-500">
              <ChevronLeft className="w-4 h-4" /> Contracts
            </Button>
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#B87333]" /> Prepare Contract: {contract?.title}
          </h1>
        </div>

        {/* Step indicator */}
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

        {/* ── STEP 0: FIELD BUILDER ──────────────────────────────────────────── */}
        {step === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Field list */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Contract Fields</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Set who fills each field — Admin or Client</p>
                </div>
                <Button size="sm" onClick={addCustomField} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-1">
                  <Plus className="w-3 h-3" /> Custom Field
                </Button>
              </div>

              {/* Legend */}
              <div className="flex gap-4 px-4 pt-3 pb-1">
                <div className="flex items-center gap-1.5 text-xs text-orange-700">
                  <div className="w-3 h-3 rounded bg-orange-200" />
                  Admin fills
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-700">
                  <div className="w-3 h-3 rounded bg-blue-200" />
                  Client fills
                </div>
              </div>

              <div className="p-4 space-y-2 max-h-[560px] overflow-y-auto">
                {fields.map((field, idx) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    isCustom={field.id.startsWith('custom_')}
                    onChange={updated => updateField(idx, updated)}
                    onDelete={() => deleteField(idx)}
                  />
                ))}
                {fields.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No fields yet. Click "Custom Field" to add one.
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <Button
                  onClick={() => { if (validateFields()) setStep(1); }}
                  className="w-full bg-[#B87333] hover:bg-[#A06828] text-white gap-2"
                >
                  Continue to Admin Fill &amp; Sign <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h4 className="font-bold text-gray-900 text-sm mb-3">Field Assignment Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <Building2 className="w-5 h-5 text-[#B87333] mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{adminFields.length}</p>
                    <p className="text-xs text-orange-700 font-medium">Admin fills</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <User className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{clientFields.length}</p>
                    <p className="text-xs text-blue-700 font-medium">Client fills</p>
                  </div>
                </div>
              </div>

              {/* Document preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Document Preview
                  </span>
                  {contract?.contract_file_url && (
                    <a href={contract.contract_file_url} target="_blank" rel="noreferrer" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Open
                    </a>
                  )}
                </div>
                {contract?.contract_file_url ? (
                  <iframe src={contract.contract_file_url + '#toolbar=0&navpanes=0'} className="w-full border-0" style={{ height: 340 }} title="Contract Preview" />
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No document attached</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: ADMIN FILL & SIGN ──────────────────────────────────────── */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin fill form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-orange-50">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#B87333]" />
                  <h3 className="font-bold text-gray-900">Your Fields to Fill</h3>
                </div>
                <p className="text-xs text-orange-700 mt-0.5">Only fields assigned to Admin — client cannot edit these</p>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: 460 }}>
                {adminFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm">No admin fields assigned</p>
                    <button onClick={() => setStep(0)} className="text-xs text-[#B87333] mt-1 hover:underline">Go back to assign fields</button>
                  </div>
                ) : adminFields.map(field => (
                  <div key={field.id}>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-orange-400" />
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={adminValues[field.id] || ''}
                        onChange={e => setAdminVal(field.id, e.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B87333]"
                      />
                    ) : (
                      <Input
                        type={field.type}
                        value={adminValues[field.id] || ''}
                        onChange={e => setAdminVal(field.id, e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Client fields preview */}
              {clientFields.length > 0 && (
                <div className="border-t p-4 bg-blue-50">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Client will fill ({clientFields.length} fields)
                  </p>
                  <div className="space-y-1">
                    {clientFields.map(f => (
                      <div key={f.id} className="flex items-center gap-2 text-xs text-blue-600">
                        <User className="w-3 h-3 flex-shrink-0" />
                        {f.label}{f.required ? ' *' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Signature */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#B87333]" /> Creative Books SA Signature
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Sign on behalf of Creative Books SA</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Your Name (Representative) *</label>
                  <Input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="e.g. Sarah van der Merwe" />
                </div>
                <SignatureCanvas label="Creative Books SA Signature" onChange={setAdminSignature} />
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs text-amber-700 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    By signing you confirm you are authorised to sign on behalf of Creative Books SA.
                  </p>
                </div>
              </div>
              <div className="p-5 border-t flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button
                  onClick={handleSaveAdminSign}
                  disabled={saving || merging || !adminSignature || !adminName.trim()}
                  className="flex-1 bg-[#1A1208] hover:bg-[#2C1E0F] text-white gap-2"
                >
                  {saving || merging
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {merging ? 'Generating PDF...' : 'Saving...'}</>
                    : <><PenTool className="w-4 h-4" /> Save &amp; Continue</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: REVIEW & SEND ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Ready to Send</h3>
                  <p className="text-sm text-gray-500">
                    Admin signed. Client will fill {clientFields.length} field{clientFields.length !== 1 ? 's' : ''} and countersign.
                  </p>
                </div>
              </div>

              {/* Admin signature */}
              {contract?.admin_signature_url && (
                <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Creative Books SA Signature</p>
                  <img src={contract.admin_signature_url} alt="Admin signature" className="max-h-12" />
                  <p className="text-xs text-emerald-600 mt-1">
                    {contract.admin_signer_name} · {contract.admin_signed_at ? new Date(contract.admin_signed_at).toLocaleString('en-ZA') : 'Just now'}
                  </p>
                </div>
              )}

              {/* Admin-filled fields summary */}
              {adminFields.filter(f => adminValues[f.id]).length > 0 && (
                <div className="bg-orange-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-orange-700 uppercase mb-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Admin Pre-filled ({adminFields.filter(f => adminValues[f.id]).length} fields — locked for client)
                  </p>
                  <div className="space-y-1">
                    {adminFields.filter(f => adminValues[f.id]).map(f => (
                      <div key={f.id} className="flex gap-2 text-xs">
                        <span className="text-orange-500 w-36 flex-shrink-0">{f.label}:</span>
                        <span className="text-gray-800 font-medium">{adminValues[f.id]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client fields summary */}
              {clientFields.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Client will fill ({clientFields.length} fields)
                  </p>
                  <div className="space-y-1">
                    {clientFields.map(f => (
                      <div key={f.id} className="flex items-center gap-2 text-xs text-blue-600">
                        <User className="w-3 h-3 flex-shrink-0" />
                        {f.label}{f.required ? ' *' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong> The client receives a secure link. They see all pre-filled admin fields (locked), fill in their own fields, and countersign.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button
                  onClick={handleSendToClient}
                  disabled={sending}
                  className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white gap-2"
                >
                  {sending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4" /> Send to Client</>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}