import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Send, Eye, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminQuoteBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialContactId = searchParams.get('contact_id');
  const quoteId = searchParams.get('quote_id');

  const queryClient = useQueryClient();
  const [mode, setMode] = useState('standard');
  const [showModeModal, setShowModeModal] = useState(!quoteId);
  const [quoteData, setQuoteData] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [contact, setContact] = useState(null);

  // Fetch contacts for dropdown
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 100),
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['quote-services'],
    queryFn: () => base44.entities.QuoteService.filter({ is_active: true }, 'sort_order'),
  });

  // Fetch existing quote if editing
  useEffect(() => {
    if (quoteId) {
      base44.entities.Quote.filter({ id: quoteId }).then(quotes => {
        if (quotes.length) {
          const q = quotes[0];
          setQuoteData(q);
          setMode(q.mode || 'standard');
          setQuoteData(q);
        }
      });
      base44.entities.QuoteLineItem.filter({ quote_id: quoteId }).then(items => {
        setLineItems(items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      });
    } else if (initialContactId) {
      base44.entities.Contact.filter({ id: initialContactId }).then(con => {
        if (con.length) setContact(con[0]);
      });
    }
  }, [quoteId, initialContactId]);

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setShowModeModal(false);
    if (!quoteId) {
      // Create new quote draft
      createQuoteMutation.mutate({ mode: selectedMode, contact_id: initialContactId });
    }
  };

  const createQuoteMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('quoteActions', {
        action: 'create',
        contact_id: initialContactId,
        valid_until: data.valid_until,
        include_vat: true,
        discount_amount: 0,
        notes: '',
        terms: '',
        line_items: [],
      });
      return result.data.quote;
    },
    onSuccess: (quote) => {
      toast.success('Quote created');
      navigate(`/admin/quotes/new?quote_id=${quote.id}`);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  const saveQuoteMutation = useMutation({
    mutationFn: async (data) => {
      if (quoteId) {
        return base44.entities.Quote.update(quoteId, data);
      }
      return null;
    },
    onSuccess: () => {
      toast.success('Quote saved');
    },
  });

  const addLineItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unit_price: 0,
      line_total: 0,
      sort_order: lineItems.length,
      is_optional: false,
      is_selected: true,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].line_total = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
    }
    setLineItems(updated);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleServiceSelect = (index, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      updateLineItem(index, 'service_id', serviceId);
      updateLineItem(index, 'description', service.default_description);
      updateLineItem(index, 'unit_price', service.default_price);
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    const discount = quoteData?.discount_amount || 0;
    const taxable = subtotal - discount;
    const vatAmount = quoteData?.include_vat ? (taxable * 0.15) : 0;
    const total = taxable + vatAmount;
    return { subtotal, discount, vatAmount, total };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    try {
      const totals = calculateTotals();
      await base44.functions.invoke('quoteActions', {
        action: 'update',
        quote_id: quoteId,
        contact_id: quoteData?.contact_id || contact?.id,
        valid_until: quoteData?.valid_until,
        include_vat: quoteData?.include_vat,
        discount_amount: quoteData?.discount_amount || 0,
        notes: quoteData?.notes,
        terms: quoteData?.terms,
        line_items: lineItems,
      });
      toast.success('Quote saved');
    } catch (error) {
      toast.error(error.message || 'Failed to save quote');
    }
  };

  const handleSend = async () => {
    try {
      // Save first
      await handleSave();
      
      // Then send
      const result = await base44.functions.invoke('quoteActions', {
        action: 'send',
        quote_id: quoteId,
      });

      toast.success('Quote sent successfully!');
      navigate('/admin/quotes');
    } catch (error) {
      toast.error(error.message || 'Failed to send quote');
    }
  };

  if (showModeModal) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Choose Quote Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => handleModeSelect('standard')}
                className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#B87333] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-[#B87333]" />
                  <div>
                    <h3 className="font-semibold text-lg">Standard Quote (PDF)</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Professional PDF quote — ideal for printing jobs, à la carte services, and repeat clients.
                      Clean, straightforward format with line items and totals.
                    </p>
                    <Badge className="mt-2 bg-green-100 text-green-700">Recommended for small jobs</Badge>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleModeSelect('premium')}
                className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#B87333] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 text-[#B87333]" />
                  <div>
                    <h3 className="font-semibold text-lg">Premium Proposal (Interactive)</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Interactive web proposal with packages, add-ons, timeline, and e-signature.
                      Creates a memorable client experience for high-value self-publishing packages.
                    </p>
                    <Badge className="mt-2 bg-purple-100 text-purple-700">Best for package sales</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/quotes')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {quoteId ? `Edit Quote ${quoteData?.quote_number}` : 'Create New Quote'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={mode === 'premium' ? 'default' : 'secondary'}>
                  {mode === 'premium' ? 'Premium Proposal' : 'Standard PDF Quote'}
                </Badge>
                <Button variant="link" className="text-xs" onClick={() => setShowModeModal(true)}>
                  Switch Mode
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={!lineItems.length}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (quoteId && quoteData?.view_token) {
                  window.open(`/quote/view/${quoteId}/${quoteData.view_token}`, '_blank');
                } else {
                  toast.error('Please save the quote first to preview');
                }
              }}
              disabled={!quoteId || !quoteData?.view_token}
            >
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button onClick={handleSend} disabled={!lineItems.length || !quoteData?.contact_id}>
              <Send className="w-4 h-4 mr-2" /> Send Quote
            </Button>
          </div>
        </div>

        {/* Contact Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={quoteData?.contact_id || contact?.id || ''}
              onValueChange={(value) => {
                const selected = contacts.find(c => c.id === value);
                setContact(selected);
                if (!quoteData) {
                  setQuoteData({ ...quoteData, contact_id: value });
                }
              }}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {contact && (
              <div className="mt-3 text-sm text-gray-500">
                {contact.company && <p>{contact.company}</p>}
                {contact.phone && <p>{contact.phone}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Book Title</Label>
                <Input
                  value={quoteData?.book_title || ''}
                  onChange={(e) => setQuoteData({ ...quoteData, book_title: e.target.value })}
                  placeholder="e.g. The Journey Home"
                />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={quoteData?.valid_until || ''}
                  onChange={(e) => setQuoteData({ ...quoteData, valid_until: e.target.value })}
                />
              </div>
            </div>
            {mode === 'premium' && (
              <div>
                <Label className="text-red-600">Project Understanding (Required for Premium)</Label>
                <Textarea
                  value={quoteData?.project_understanding_text || ''}
                  onChange={(e) => setQuoteData({ ...quoteData, project_understanding_text: e.target.value })}
                  placeholder="Write a personalised paragraph about the client's project..."
                  className="h-24"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button size="sm" onClick={addLineItem}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-end gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs">Service</Label>
                    <Select onValueChange={(v) => handleServiceSelect(index, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Total</Label>
                    <div className="text-lg font-bold text-[#B87333]">
                      R{(item.line_total || 0).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!lineItems.length && (
                <p className="text-center text-gray-400 py-8">No line items yet. Click "Add Item" to get started.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={quoteData?.notes || ''}
                onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                placeholder="Internal notes or client message..."
                className="h-24"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={quoteData?.terms || ''}
                onChange={(e) => setQuoteData({ ...quoteData, terms: e.target.value })}
                placeholder="Payment terms, delivery terms, etc."
                className="h-24"
              />
            </CardContent>
          </Card>
        </div>

        {/* Totals */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R{totals.subtotal.toLocaleString()}</span>
                </div>
                {quoteData?.include_vat && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (15%):</span>
                    <span className="font-medium">R{totals.vatAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-[#B87333]">R{totals.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}