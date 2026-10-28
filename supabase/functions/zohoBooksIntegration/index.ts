import { createClientFromRequest, serve } from '../_shared/server.ts';

const ZOHO_BASE = 'https://www.zohoapis.co.za/books/v3';

async function getZohoToken() {
  const clientId = Deno.env.get('ZOHO_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
  
  console.log('[ZOHO] Checking credentials...');
  console.log('[ZOHO] CLIENT_ID exists:', !!clientId);
  console.log('[ZOHO] CLIENT_SECRET exists:', !!clientSecret);
  console.log('[ZOHO] REFRESH_TOKEN exists:', !!refreshToken);
  
  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [];
    if (!clientId) missing.push('ZOHO_CLIENT_ID');
    if (!clientSecret) missing.push('ZOHO_CLIENT_SECRET');
    if (!refreshToken) missing.push('ZOHO_REFRESH_TOKEN');
    throw new Error(`Zoho credentials not configured. Missing: ${missing.join(', ')}`);
  }

  console.log('[ZOHO] Requesting access token from Zoho...');
  console.log('[ZOHO] Client ID:', clientId);
  console.log('[ZOHO] Refresh token (first 20 chars):', refreshToken?.substring(0, 20) + '...');
  
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });
  console.log('[ZOHO] Request body:', params.toString());
  
  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  console.log('[ZOHO] Token response status:', response.status);
  console.log('[ZOHO] Token response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
  const text = await response.text();
  console.log('[ZOHO] Token response raw:', text);
  const data = JSON.parse(text);
  console.log('[ZOHO] Token response parsed:', JSON.stringify(data));
  
  if (!data.access_token) {
    console.error('[ZOHO] Failed to get access token:', data);
    throw new Error(`Failed to get Zoho access token: ${data.error || 'Unknown error'} - ${data.message || ''}`);
  }
  console.log('[ZOHO] Access token obtained successfully');
  return data.access_token;
}

async function zohoRequest(endpoint, options = {}) {
  const accessToken = await getZohoToken();
  const orgId = Deno.env.get('ZOHO_ORGANIZATION_ID');
  
  const url = new URL(ZOHO_BASE + endpoint);
  if (orgId) url.searchParams.set('organization_id', orgId);

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zoho API error: ${response.status} - ${error}`);
  }

  return response.json();
}

serve('zohoBooksIntegration', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { action, data, id } = await req.json();

    // CONTACTS
    if (action === 'zoho_contact_create') {
      const contact = await zohoRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          contact_name: data.full_name,
          company_name: data.company,
          email: data.email,
          phone: data.phone,
          billing_address: {
            address: data.billing_address,
            city: data.city,
            state: data.province,
            zip: data.postal_code,
            country: data.country,
          },
        }),
      });
      return Response.json({ success: true, zoho_contact_id: contact.contacts[0]?.contact_id });
    }

    if (action === 'zoho_contact_list') {
      const result = await zohoRequest('/contacts');
      return Response.json({ contacts: result.contacts || [] });
    }

    if (action === 'zoho_contact_update') {
      const contact = await zohoRequest(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return Response.json({ success: true, zoho_contact_id: contact.contacts[0]?.contact_id });
    }

    // INVOICES
    if (action === 'zoho_invoice_create') {
      const invoice = await zohoRequest('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: data.zoho_contact_id,
          invoice_date: data.issue_date,
          due_date: data.due_date,
          line_items: data.line_items?.map(item => ({
            item_name: item.description,
            rate: item.unit_price,
            quantity: item.quantity,
          })) || [],
          notes: data.notes,
        }),
      });
      return Response.json({ success: true, zoho_invoice_id: invoice.invoices[0]?.invoice_id });
    }

    if (action === 'zoho_invoice_list') {
      const result = await zohoRequest('/invoices');
      return Response.json({ invoices: result.invoices || [] });
    }

    if (action === 'zoho_invoice_update') {
      const invoice = await zohoRequest(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return Response.json({ success: true, zoho_invoice_id: invoice.invoices[0]?.invoice_id });
    }

    if (action === 'zoho_invoice_send') {
      const result = await zohoRequest(`/invoices/${id}/email`, {
        method: 'POST',
      });
      return Response.json({ success: true, message: 'Invoice sent via Zoho' });
    }

    // PAYMENTS
    if (action === 'zoho_payment_record') {
      const payment = await zohoRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoice_id: data.zoho_invoice_id,
          amount: data.amount,
          date: data.payment_date,
          payment_mode: data.payment_method === 'EFT' ? 'BankTransfer' : 
                       data.payment_method === 'Card' ? 'CreditCard' : 'Other',
          reference_number: data.reference,
        }),
      });
      return Response.json({ success: true, zoho_payment_id: payment.payments[0]?.payment_id });
    }

    if (action === 'zoho_payment_list') {
      const result = await zohoRequest('/payments');
      return Response.json({ payments: result.payments || [] });
    }

    // SYNC
    if (action === 'zoho_sync_contacts') {
      const localContacts = await platform.asServiceRole.entities.Contact.list();
      const zohoContacts = await zohoRequest('/contacts');
      
      const synced = [];
      for (const local of localContacts) {
        const zohoMatch = zohoContacts.contacts?.find(z => 
          z.email_addresses?.[0]?.email_address === local.email
        );
        
        if (zohoMatch) {
          await platform.asServiceRole.entities.Contact.update(local.id, {
            zoho_contact_id: zohoMatch.contact_id,
            zoho_synced_at: new Date().toISOString(),
          });
          synced.push(local.email);
        }
      }
      
      return Response.json({ success: true, synced_count: synced.length, synced });
    }

    if (action === 'zoho_sync_invoices') {
      const localInvoices = await platform.asServiceRole.entities.Invoice.list();
      const zohoInvoices = await zohoRequest('/invoices');
      
      const synced = [];
      for (const local of localInvoices) {
        const zohoMatch = zohoInvoices.invoices?.find(z => 
          z.invoice_number === local.invoice_number
        );
        
        if (zohoMatch) {
          await platform.asServiceRole.entities.Invoice.update(local.id, {
            zoho_invoice_id: zohoMatch.invoice_id,
            zoho_synced_at: new Date().toISOString(),
          });
          synced.push(local.invoice_number);
        }
      }
      
      return Response.json({ success: true, synced_count: synced.length, synced });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Zoho Books error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});