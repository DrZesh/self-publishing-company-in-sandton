import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Plus, Trash2, Save, Send, Eye, FileText, Sparkles, UserPlus, Users, Copy, Download, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

function FormRow({ label, required, children, help }) {
  return (
    <div className="flex items-start border-b border-gray-100 py-3 last:border-0">
      <div className="w-44 shrink-0 pt-2">
        <span className="text-sm text-gray-600">
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </span>
        {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}



export default function AdminQuoteBuilder() {
  const navigate = useNavigate();
  const { id: routeQuoteId } = useParams();
  const queryClient = useQueryClient();
  const [quoteData, setQuoteData] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [contact, setContact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [manualClient, setManualClient] = useState(null);
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

  useEffect(() => {
    if (routeQuoteId) {
      platform.functions.invoke('quoteActions', { action: 'load', quote_id: routeQuoteId })
        .then(res => {
          const { quote, line_items: items } = res.data;
          if (quote) {
            setQuoteData(quote);
            setLineItems((items || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
            if (quote.contact_id) {
              platform.entities.Contact.filter({ id: quote.contact_id }).then(c => { if (c.length) setContact(c[0]); }).catch(() => {});
            }
          }
        })
        .catch(err => toast.error('Failed to load quote'));
    }
  }, [routeQuoteId]);

  const handleCreateQuote = async () => {
    let contactId = contact?.id;
    if (!contactId && manualClient) {
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
        toast.success('Client created and quote started');
      } catch (err) {
        toast.error('Failed to create client: ' + (err.message || 'Unknown error'));
        setSaving(false);
        return;
      }
    }
    if (!contactId) return toast.error('Please select or enter a client');
    setSaving(true);
    try {
      const result = await platform.functions.invoke('quoteActions', {
        action: 'create',
        contact_id: contactId,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        include_vat: true,
        discount_amount: 0,
        notes: '',
        terms: companySettings?.quote_terms || '',
        line_items: [],
      });
      if (result.data?.quote) {
        toast.success('Quote created');
        navigate(`/admin/quotes/${result.data.quote.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  const addLineItem = (service) => {
    // Build description from service data
    let description = service?.serviceName || '';
    if (service?.packageName) {
      description += ` - ${service.packageName}`;
    }
    if (service?.description) {
      description += `: ${service.description}`;
    }
    
    // Calculate price based on pricing type
    let unitPrice = 0;
    if (service.pricingType === 'fixed') {
      unitPrice = service.price || 0;
    } else if (['per_word', 'per_page', 'per_copy', 'per_colour_page'].includes(service.pricingType)) {
      unitPrice = service.basePrice || 0;
    }
    
    const newItem = {
      description,
      quantity: 1,
      unit_price: unitPrice,
      line_total: unitPrice,
      service_category: service.category || '',
      sort_order: lineItems.length,
    };
    setLineItems(prev => [...prev, newItem]);
    setSelectedServiceId('');
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

  const duplicateLineItem = (index) => {
    const item = { ...lineItems[index], sort_order: lineItems.length };
    setLineItems(prev => [...prev, item]);
  };

  const subtotal = lineItems.reduce((s, i) => s + (i.line_total || 0), 0);
  const discount = quoteData?.discount_amount || 0;
  const taxable = subtotal - discount;
  const vatAmount = quoteData?.include_vat !== false ? taxable * ((quoteData?.vat_rate || 15) / 100) : 0;
  const total = taxable + vatAmount;

  const handleSave = async () => {
    if (!routeQuoteId) return toast.error('Quote not initialized.');
    const contactId = quoteData?.contact_id || contact?.id;
    if (!contactId) return toast.error('Please select a contact.');
    setSaving(true);
    try {
      const result = await platform.functions.invoke('quoteActions', {
        action: 'update',
        quote_id: routeQuoteId,
        contact_id: contactId,
        valid_until: quoteData?.valid_until,
        include_vat: quoteData?.include_vat !== false,
        vat_rate: quoteData?.vat_rate || 15,
        discount_amount: quoteData?.discount_amount || 0,
        notes: quoteData?.notes || '',
        terms: quoteData?.terms || '',
        line_items: lineItems,
      });
      if (result.data?.quote) setQuoteData(result.data.quote);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!routeQuoteId) return toast.error('Please save first.');
    const contactId = quoteData?.contact_id || contact?.id;
    if (!contactId) return toast.error('Please select a contact.');
    if (!lineItems.length) return toast.error('Add at least one line item.');
    const emailToCheck = contact?.email;
    if (!emailToCheck) return toast.error('Contact must have an email address');
    setSending(true);
    try {
      await handleSave();
      const res = await platform.functions.invoke('quoteActions', { action: 'send', quote_id: routeQuoteId });
      
      // Automatically create deal and move contact to "Quote Sent" stage
      await platform.entities.Contact.update(contactId, {
        pipeline_stage: 'Quote Sent',
        pipeline_stage_changed_at: new Date().toISOString(),
      });
      
      toast.success('Quote sent to ' + emailToCheck);
      navigate('/admin/quotes');
    } catch (err) {
      toast.error(err.message || 'Failed to send quote');
    } finally {
      setSending(false);
    }
  };

  if (!routeQuoteId) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto py-16">
          {/* Header */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 text-white">
            <h1 className="text-lg font-semibold">Create New Quote</h1>
            <p className="text-xs text-amber-100 mt-0.5">Start a new quote for a client</p>
          </div>
          
          <Card className="mb-6 border-0 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <CardTitle className="text-sm font-semibold text-gray-700">Select or Enter Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Choose existing client</label>
                <Select value={contact?.id || ''} onValueChange={val => {
                  setContact(contacts.find(c => c.id === val));
                  setManualClient(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select from contacts" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}{c.company ? ` — ${c.company}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center text-sm text-gray-400">— OR —</div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Enter new client details</label>
                <div className="space-y-2">
                  <Input
                    placeholder="Full Name *"
                    value={manualClient?.full_name || ''}
                    onChange={e => setManualClient(m => ({ ...m, full_name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email *"
                    type="email"
                    value={manualClient?.email || ''}
                    onChange={e => setManualClient(m => ({ ...m, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={manualClient?.phone || ''}
                    onChange={e => setManualClient(m => ({ ...m, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Company"
                    value={manualClient?.company || ''}
                    onChange={e => setManualClient(m => ({ ...m, company: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Billing Address"
                    value={manualClient?.billing_address || ''}
                    onChange={e => setManualClient(m => ({ ...m, billing_address: e.target.value }))}
                    className="h-20"
                  />
                </div>
              </div>
              <Button onClick={handleCreateQuote} disabled={(!contact && !manualClient) || saving} className="w-full mt-4 gap-2 bg-amber-700 hover:bg-amber-800 text-white">
                <FileText className="w-4 h-4" />
                {saving ? 'Creating...' : 'Create Quote'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-24">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-lg bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              {/* Left: Logo */}
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
                    {quoteData ? `Edit Quote — ${quoteData.quote_number}` : 'New Quote'}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">Quote Builder</p>
                </div>
              </div>
              
              {/* Right: Client Details Summary */}
              {contact && (
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{contact.full_name}</div>
                  <div className="text-sm text-gray-600">{contact.email}</div>
                  {contact.company && <div className="text-sm text-gray-600">{contact.company}</div>}
                  {contact.phone && <div className="text-sm text-gray-600">{contact.phone}</div>}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2 border-amber-200 text-amber-800 hover:bg-amber-50">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Draft'}
                </Button>
                <Button onClick={handleSend} disabled={sending || !lineItems.length} className="gap-2 bg-amber-700 hover:bg-amber-800 text-white">
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending…' : 'Send to Client'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Selection */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="text-sm font-semibold text-gray-700">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Client</label>
                  <Select value={quoteData?.contact_id || contact?.id || ''} onValueChange={val => {
                    const sel = contacts.find(c => c.id === val);
                    setContact(sel);
                    setQuoteData(d => ({ ...d, contact_id: val }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name}{c.company ? ` — ${c.company}` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {contact && (
                  <div className="bg-amber-50 rounded-lg p-3 text-sm border border-amber-100">
                    <div className="font-medium text-gray-900">{contact.full_name}</div>
                    <div className="text-gray-600">{contact.email}</div>
                    {contact.phone && <div className="text-gray-600">{contact.phone}</div>}
                    {contact.company && <div className="text-gray-600">{contact.company}</div>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Line Items</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedServiceId} onValueChange={(val) => {
                    const service = services.find(s => s.id === val);
                    if (service) addLineItem(service);
                  }}>
                    <SelectTrigger className="w-64 h-8">
                      <SelectValue placeholder="+ Add service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.serviceName} {s.packageName ? `(${s.packageName})` : ''} - R{s.pricingType === 'fixed' ? s.price : s.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {lineItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No line items yet. Select a service from the dropdown to add.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <div key={index} className="border border-amber-100 rounded-lg bg-white shadow-sm overflow-hidden">
                        {/* Header: Service Name */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-amber-100">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-amber-900">
                              {item.service_category && (
                                <Badge variant="outline" className="mr-2 text-xs border-amber-200 text-amber-700">
                                  {item.service_category}
                                </Badge>
                              )}
                              Line Item {index + 1}
                            </h4>
                            <div className="flex items-center gap-1">
                              <button onClick={() => duplicateLineItem(index)} className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors" title="Duplicate">
                                <Copy className="w-4 h-4 text-gray-400" />
                              </button>
                              <button onClick={() => removeLineItem(index)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content: Details */}
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Description</label>
                            <Textarea
                              value={item.description}
                              onChange={e => updateLineItem(index, 'description', e.target.value)}
                              placeholder="Enter service description..."
                              className="h-20 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-28">
                              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={e => updateLineItem(index, 'quantity', Number(e.target.value))}
                                className="h-9 text-sm"
                                min="0"
                              />
                            </div>
                            <div className="w-36">
                              <label className="text-xs text-gray-500 block mb-1">Unit Price (R)</label>
                              <Input
                                type="number"
                                value={item.unit_price}
                                onChange={e => updateLineItem(index, 'unit_price', Number(e.target.value))}
                                className="h-9 text-sm"
                                min="0"
                              />
                            </div>
                            <div className="w-36">
                              <label className="text-xs text-gray-500 block mb-1">Total</label>
                              <div className="text-base font-bold text-amber-700 pt-1.5">
                                R {(item.line_total || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes & Terms */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="text-sm font-semibold text-gray-700">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Book Title / Project Name</label>
                  <Input
                    value={quoteData?.book_title || ''}
                    onChange={e => setQuoteData(d => ({ ...d, book_title: e.target.value }))}
                    placeholder="e.g. The Journey Home"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Notes (visible to client)</label>
                  <Textarea
                    value={quoteData?.notes || ''}
                    onChange={e => setQuoteData(d => ({ ...d, notes: e.target.value }))}
                    placeholder="Personal message to client..."
                    className="h-20"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Terms & Conditions</label>
                  <Textarea
                    value={quoteData?.terms || ''}
                    onChange={e => setQuoteData(d => ({ ...d, terms: e.target.value }))}
                    placeholder="Payment terms, delivery terms, etc."
                    className="h-20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white shadow-md">
                <CardTitle className="text-sm font-semibold">Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Valid Until</label>
                  <Input
                    type="date"
                    value={quoteData?.valid_until || ''}
                    onChange={e => setQuoteData(d => ({ ...d, valid_until: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Discount (R)</label>
                  <Input
                    type="number"
                    value={quoteData?.discount_amount || 0}
                    onChange={e => setQuoteData(d => ({ ...d, discount_amount: Number(e.target.value) }))}
                    min="0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Include VAT (15%)</label>
                    <p className="text-xs text-gray-400 mt-0.5">Toggle off to remove VAT from quote</p>
                  </div>
                  <button
                    onClick={() => setQuoteData(d => ({ ...d, include_vat: d?.include_vat !== false ? false : true }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${quoteData?.include_vat !== false ? 'bg-amber-700' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${quoteData?.include_vat !== false ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-red-600">- R {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (15%)</span>
                    <span className="font-medium">R {vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-amber-700">R {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


    </AdminLayout>
  );
}