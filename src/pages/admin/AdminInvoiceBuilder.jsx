import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Plus, Trash2, Save, Send, FileText, Copy, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminInvoiceBuilder() {
  const navigate = useNavigate();
  const { id: routeInvoiceId } = useParams();
  const queryClient = useQueryClient();

  const [invoiceData, setInvoiceData] = useState(null);
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
  const [contact, setContact] = useState(null);
  const [manualClient, setManualClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 200),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => platform.entities.Service.filter({ active: true }),
  });

  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: () => platform.entities.CompanySettings.filter({ setting_key: 'main' }).then(r => r[0]),
  });

  // Load existing invoice for editing
  useEffect(() => {
    if (routeInvoiceId) {
      platform.entities.Invoice.filter({ id: routeInvoiceId })
        .then(res => {
          const inv = res[0];
          if (inv) {
            setInvoiceData(inv);
            setLineItems(inv.line_items?.length ? inv.line_items : [{ description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
            if (inv.contact_id) {
              platform.entities.Contact.filter({ id: inv.contact_id }).then(c => { if (c.length) setContact(c[0]); }).catch(() => {});
            }
          }
        })
        .catch(() => toast.error('Failed to load invoice'));
    }
  }, [routeInvoiceId]);

  // ── Line item helpers ──────────────────────────────────────────────────────
  const addServiceLineItem = (service) => {
    let description = service?.serviceName || '';
    if (service?.packageName) description += ` - ${service.packageName}`;
    if (service?.description) description += `\n${service.description}`;
    let unitPrice = 0;
    if (service.pricingType === 'fixed') unitPrice = service.price || 0;
    else if (['per_word', 'per_page', 'per_copy', 'per_colour_page'].includes(service.pricingType)) unitPrice = service.basePrice || 0;
    setLineItems(prev => [...prev, { description, quantity: 1, unit_price: unitPrice, line_total: unitPrice, service_category: service.category || '' }]);
    setSelectedServiceId('');
  };

  const addBlankLineItem = () => {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
  };

  const updateLineItem = (index, field, value) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated[index].line_total = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
      }
      return updated;
    });
  };

  const removeLineItem = (index) => setLineItems(prev => prev.filter((_, i) => i !== index));
  const duplicateLineItem = (index) => setLineItems(prev => [...prev, { ...prev[index] }]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const includeVat = invoiceData?.include_vat !== false;
  const vatRate = invoiceData?.vat_rate || 15;
  const subtotal = lineItems.reduce((s, i) => s + (i.line_total || 0), 0);
  const vatAmount = includeVat ? subtotal * (vatRate / 100) : 0;
  const total = subtotal + vatAmount;

  // ── Create new invoice (step 1: pick client) ───────────────────────────────
  const handleCreateInvoice = async () => {
    let contactId = contact?.id;
    if (!contactId && manualClient?.full_name && manualClient?.email) {
      setSaving(true);
      try {
        const newContact = await platform.entities.Contact.create({
          full_name: manualClient.full_name,
          email: manualClient.email,
          phone: manualClient.phone || '',
          company: manualClient.company || '',
          billing_address: manualClient.billing_address || '',
        });
        contactId = newContact.id;
        toast.success('Client created');
      } catch (err) {
        toast.error('Failed to create client: ' + (err.message || 'Unknown error'));
        setSaving(false);
        return;
      }
    }
    if (!contactId) return toast.error('Please select or enter a client');
    setSaving(true);
    try {
      const res = await platform.functions.invoke('invoiceActions', {
        action: 'create',
        contact_id: contactId,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        include_vat: true,
        notes: '',
        payment_terms: companySettings?.invoice_terms || 'Payment due within 7 days of invoice date.',
        line_items: [],
      });
      if (res.data?.invoice) {
        toast.success('Invoice created');
        navigate(`/admin/invoices/${res.data.invoice.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  // ── Save existing invoice ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!routeInvoiceId) return toast.error('Invoice not initialized.');
    setSaving(true);
    try {
      const res = await platform.functions.invoke('invoiceActions', {
        action: 'update',
        invoice_id: routeInvoiceId,
        contact_id: invoiceData?.contact_id || contact?.id,
        issue_date: invoiceData?.issue_date,
        due_date: invoiceData?.due_date,
        include_vat: invoiceData?.include_vat !== false,
        vat_rate: invoiceData?.vat_rate || 15,
        notes: invoiceData?.notes || '',
        payment_terms: invoiceData?.payment_terms || '',
        banking_details: invoiceData?.banking_details || '',
        book_title: invoiceData?.book_title || '',
        line_items: lineItems,
        amount_paid: invoiceData?.amount_paid || 0,
      });
      if (res.data?.invoice) setInvoiceData(res.data.invoice);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice saved');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Send invoice ───────────────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      if (!(await handleSave())) return;
      const { data } = await platform.functions.invoke('invoiceActions', { action: 'generate_pdf', invoice_id: routeInvoiceId });
      const link = document.createElement('a');
      let objectUrl;
      if (data.pdf_base64) {
        const bytes = Uint8Array.from(atob(data.pdf_base64), c => c.charCodeAt(0));
        objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        link.href = objectUrl;
        link.download = `${data.invoice_number || 'invoice'}.pdf`;
      } else if (data.pdf_url) {
        link.href = data.pdf_url;
        link.target = '_blank';
        link.rel = 'noopener';
      } else throw new Error('PDF generation did not return a file.');
      link.click();
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) { toast.error(error.message || 'Could not download PDF'); }
  };

  const handleSend = async () => {
    if (!routeInvoiceId) return toast.error('Please save first.');
    if (!lineItems.length) return toast.error('Add at least one line item.');
    if (!contact?.email) return toast.error('Contact must have an email address.');
    setSending(true);
    try {
      if (!(await handleSave())) return;
      const res = await platform.functions.invoke('invoiceActions', { action: 'send', invoice_id: routeInvoiceId });
      if (res.data?.success) {
        toast.success('Invoice sent to ' + contact.email);
        navigate('/admin/invoices');
      } else {
        toast.error(res.data?.error || 'Failed to send invoice');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  // ── Step 1: Pick client ────────────────────────────────────────────────────
  if (!routeInvoiceId) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto py-16">
          <button onClick={() => navigate('/admin/invoices')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </button>
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 text-white">
            <h1 className="text-lg font-semibold">Create New Invoice</h1>
            <p className="text-xs text-amber-100 mt-0.5">Start a new invoice for a client</p>
          </div>
          <Card className="mb-6 border-0 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <CardTitle className="text-sm font-semibold text-gray-700">Select or Enter Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Choose existing client</label>
                <Select value={contact?.id || ''} onValueChange={val => { setContact(contacts.find(c => c.id === val)); setManualClient(null); }}>
                  <SelectTrigger><SelectValue placeholder="Select from contacts" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}{c.company ? ` — ${c.company}` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center text-sm text-gray-400">— OR —</div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Enter new client details</label>
                <div className="space-y-2">
                  <Input placeholder="Full Name *" value={manualClient?.full_name || ''} onChange={e => setManualClient(m => ({ ...m, full_name: e.target.value }))} />
                  <Input placeholder="Email *" type="email" value={manualClient?.email || ''} onChange={e => setManualClient(m => ({ ...m, email: e.target.value }))} />
                  <Input placeholder="Phone" value={manualClient?.phone || ''} onChange={e => setManualClient(m => ({ ...m, phone: e.target.value }))} />
                  <Input placeholder="Company" value={manualClient?.company || ''} onChange={e => setManualClient(m => ({ ...m, company: e.target.value }))} />
                  <Textarea placeholder="Billing Address" value={manualClient?.billing_address || ''} onChange={e => setManualClient(m => ({ ...m, billing_address: e.target.value }))} className="h-20" />
                </div>
              </div>
              <Button onClick={handleCreateInvoice} disabled={(!contact && !manualClient) || saving} className="w-full mt-4 gap-2 bg-amber-700 hover:bg-amber-800 text-white">
                <FileText className="w-4 h-4" />
                {saving ? 'Creating…' : 'Create Invoice'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // ── Step 2: Build invoice ──────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-24">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-lg bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between flex-wrap gap-4 p-6">
              <div className="flex items-center gap-4">
                {companySettings?.logo_url ? (
                  <img src={companySettings.logo_url} alt="Creative Books SA" className="h-12 w-auto object-contain" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {invoiceData ? `Edit Invoice — ${invoiceData.invoice_number}` : 'New Invoice'}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">Invoice Builder</p>
                </div>
              </div>
              {contact && (
                <div className="text-right hidden sm:block">
                  <div className="font-semibold text-gray-900">{contact.full_name}</div>
                  <div className="text-sm text-gray-600">{contact.email}</div>
                  {contact.company && <div className="text-sm text-gray-600">{contact.company}</div>}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate('/admin/invoices')} className="gap-2 text-gray-600">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2 border-amber-200 text-amber-800 hover:bg-amber-50">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Draft'}
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={saving}>Download PDF</Button>
                <Button onClick={handleSend} disabled title="Email delivery is pending approval" className="gap-2 bg-amber-700 hover:bg-amber-800 text-white">
                  <Send className="w-4 h-4" />
                  Email pending approval
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Client + Line Items + Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="text-sm font-semibold text-gray-700">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Client</label>
                  <Select value={invoiceData?.contact_id || contact?.id || ''} onValueChange={val => {
                    const sel = contacts.find(c => c.id === val);
                    setContact(sel);
                    setInvoiceData(d => ({ ...d, contact_id: val }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}{c.company ? ` — ${c.company}` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {contact && (
                  <div className="bg-amber-50 rounded-lg p-3 text-sm border border-amber-100">
                    <div className="font-medium text-gray-900">{contact.full_name}</div>
                    <div className="text-gray-600">{contact.email}</div>
                    {contact.phone && <div className="text-gray-600">{contact.phone}</div>}
                    {contact.company && <div className="text-gray-600">{contact.company}</div>}
                    {contact.billing_address && <div className="text-gray-500 text-xs mt-1">{contact.billing_address}</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Line Items</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedServiceId} onValueChange={val => {
                    const service = services.find(s => s.id === val);
                    if (service) addServiceLineItem(service);
                  }}>
                    <SelectTrigger className="w-56 h-8">
                      <SelectValue placeholder="+ Add service…" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.serviceName}{s.packageName ? ` (${s.packageName})` : ''} — R{s.pricingType === 'fixed' ? s.price : s.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={addBlankLineItem} className="h-8 gap-1 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Blank
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {lineItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No line items yet. Select a service or add a blank item.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div key={index} className="border border-amber-100 rounded-lg bg-white shadow-sm overflow-hidden">
                        {/* Row header */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-amber-100 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                            {item.service_category && (
                              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">{item.service_category}</Badge>
                            )}
                            Item {index + 1}
                          </h4>
                          <div className="flex items-center gap-1">
                            <button onClick={() => duplicateLineItem(index)} className="p-1.5 hover:bg-amber-100 rounded-lg" title="Duplicate">
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => removeLineItem(index)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Remove">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        {/* Row body */}
                        <div className="p-4 space-y-3">
                          {/* Heading (first line) */}
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Heading / Service Name</label>
                            <Input
                              value={item.description?.split('\n')[0] || ''}
                              onChange={e => {
                                const bodyText = item.description?.split('\n').slice(1).join('\n') || '';
                                updateLineItem(index, 'description', bodyText ? `${e.target.value}\n${bodyText}` : e.target.value);
                              }}
                              placeholder="e.g. Book Editing — 80,000 words"
                              className="text-sm font-medium"
                            />
                          </div>
                          {/* Body text (subsequent lines) */}
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Body Text (optional details)</label>
                            <Textarea
                              value={item.description?.split('\n').slice(1).join('\n') || ''}
                              onChange={e => {
                                const heading = item.description?.split('\n')[0] || '';
                                updateLineItem(index, 'description', e.target.value ? `${heading}\n${e.target.value}` : heading);
                              }}
                              placeholder="Additional description, scope, or notes..."
                              className="h-16 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-28">
                              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                              <Input type="number" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', Number(e.target.value))} className="h-9 text-sm" min="0" />
                            </div>
                            <div className="w-36">
                              <label className="text-xs text-gray-500 block mb-1">Unit Price (R)</label>
                              <Input type="number" value={item.unit_price} onChange={e => updateLineItem(index, 'unit_price', Number(e.target.value))} className="h-9 text-sm" min="0" />
                            </div>
                            <div className="w-36">
                              <label className="text-xs text-gray-500 block mb-1">Total</label>
                              <div className="text-base font-bold text-amber-700 pt-1.5">R {(item.line_total || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes & Payment Terms */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="text-sm font-semibold text-gray-700">Notes & Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Book Title / Project Name</label>
                  <Input value={invoiceData?.book_title || ''} onChange={e => setInvoiceData(d => ({ ...d, book_title: e.target.value }))} placeholder="e.g. The Journey Home" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Notes (visible to client)</label>
                  <Textarea value={invoiceData?.notes || ''} onChange={e => setInvoiceData(d => ({ ...d, notes: e.target.value }))} placeholder="Personal message or instructions for the client..." className="h-20" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Payment Terms</label>
                  <Textarea value={invoiceData?.payment_terms || ''} onChange={e => setInvoiceData(d => ({ ...d, payment_terms: e.target.value }))} placeholder="e.g. Payment due within 7 days of invoice date." className="h-16" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Invoice Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white shadow-md">
                <CardTitle className="text-sm font-semibold">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Issue Date</label>
                  <Input type="date" value={invoiceData?.issue_date || ''} onChange={e => setInvoiceData(d => ({ ...d, issue_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Due Date</label>
                  <Input type="date" value={invoiceData?.due_date || ''} onChange={e => setInvoiceData(d => ({ ...d, due_date: e.target.value }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Include VAT (15%)</label>
                    <p className="text-xs text-gray-400 mt-0.5">Toggle off to remove VAT</p>
                  </div>
                  <button
                    onClick={() => setInvoiceData(d => ({ ...d, include_vat: d?.include_vat !== false ? false : true }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${includeVat ? 'bg-amber-700' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${includeVat ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R {subtotal.toFixed(2)}</span>
                  </div>
                  {includeVat && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT ({vatRate}%)</span>
                      <span className="font-medium">R {vatAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-amber-700">R {total.toFixed(2)}</span>
                  </div>
                </div>

                {invoiceData?.status && (
                  <div className={`text-center py-2 px-3 rounded-lg text-sm font-semibold ${
                    invoiceData.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    invoiceData.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                    invoiceData.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    Status: {invoiceData.status}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}