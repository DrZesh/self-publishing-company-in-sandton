import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase service environment is not configured.' }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const authorization = request.headers.get('authorization') || '';
    const token = authorization.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Unauthorized' }, 401);

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (!['super_admin', 'admin'].includes(profile?.role)) {
      return json({ error: 'Admin access required' }, 403);
    }

    const { invoice_id } = await request.json();
    if (!invoice_id) return json({ error: 'invoice_id required' }, 400);

    const { data: invoice, error: invoiceError } = await admin
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) return json({ error: 'Invoice not found' }, 404);

    const { data: contact, error: contactError } = await admin
      .from('contacts')
      .select('full_name, email')
      .eq('id', invoice.contact_id)
      .single();

    if (contactError || !contact) return json({ error: 'Contact not found' }, 404);
    if (!contact.email) return json({ error: 'Contact has no email address' }, 400);

    const rows = Array.isArray(invoice.line_items)
      ? invoice.line_items.map((item: Record<string, unknown>) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${escapeHtml(item.description)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;">${Number(item.quantity || 0)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;">R ${Number(item.unit_price || 0).toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;">R ${Number(item.line_total || 0).toFixed(2)}</td>
        </tr>`).join('')
      : '';

    const dueDate = invoice.due_date
      ? new Date(`${invoice.due_date}T00:00:00`).toLocaleDateString('en-ZA', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

    const html = `
      <!doctype html>
      <html>
        <body style="margin:0;padding:0;background:#f9f7f2;font-family:Arial,sans-serif;color:#1a1a1a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 16px;">
            <tr><td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:650px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.08);">
                <tr><td style="background:#1A1208;padding:28px 32px;">
                  <div style="color:#B87333;font-size:22px;font-weight:800;">CREATIVE BOOKS SA</div>
                  <div style="color:#fff;opacity:.65;font-size:12px;margin-top:4px;">INVOICE</div>
                </td></tr>
                <tr><td style="padding:32px;">
                  <h2 style="margin:0 0 6px;">${escapeHtml(invoice.invoice_number)}</h2>
                  <p style="margin:0 0 22px;color:#666;">Dear ${escapeHtml(contact.full_name)},</p>
                  <p style="line-height:1.6;color:#444;">Please find your invoice details below${invoice.book_title ? ` for <strong>${escapeHtml(invoice.book_title)}</strong>` : ''}.${dueDate ? ` Payment is due by <strong>${escapeHtml(dueDate)}</strong>.` : ''}</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:24px 0;">
                    <thead><tr style="background:#faf8f4;">
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#666;">DESCRIPTION</th>
                      <th style="padding:10px 12px;text-align:center;font-size:11px;color:#666;">QTY</th>
                      <th style="padding:10px 12px;text-align:right;font-size:11px;color:#666;">UNIT</th>
                      <th style="padding:10px 12px;text-align:right;font-size:11px;color:#666;">TOTAL</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                  </table>
                  <div style="background:#faf8f4;border-radius:10px;padding:18px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Subtotal</span><strong>R ${Number(invoice.subtotal || 0).toFixed(2)}</strong></div>
                    ${invoice.include_vat ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>VAT (${Number(invoice.vat_rate || 15)}%)</span><span>R ${Number(invoice.vat_amount || 0).toFixed(2)}</span></div>` : ''}
                    <div style="border-top:1px solid #ddd;padding-top:10px;margin-top:10px;display:flex;justify-content:space-between;font-size:18px;"><strong>Total Due</strong><strong style="color:#B87333;">R ${Number(invoice.balance_due || invoice.total || 0).toFixed(2)}</strong></div>
                  </div>
                  ${invoice.banking_details ? `<div style="margin-top:24px;background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:0 10px 10px 0;"><strong style="font-size:12px;color:#1e40af;">BANKING DETAILS</strong><div style="white-space:pre-line;margin-top:8px;color:#1d4ed8;font-size:13px;">${escapeHtml(invoice.banking_details)}</div></div>` : ''}
                  ${invoice.payment_terms ? `<p style="margin-top:22px;color:#777;font-size:13px;font-style:italic;">${escapeHtml(invoice.payment_terms)}</p>` : ''}
                  <p style="margin-top:28px;">Kind regards,<br><strong>Creative Books SA Team</strong></p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>`;

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) return json({ error: 'Email service is not configured' }, 500);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [contact.email],
        subject: `Invoice ${invoice.invoice_number} | Creative Books SA`,
        html,
      }),
    });

    const emailResult = await emailResponse.json();
    if (!emailResponse.ok) {
      return json({ error: emailResult?.message || 'Unable to send invoice email' }, 502);
    }

    const { error: updateError } = await admin
      .from('invoices')
      .update({ status: 'Sent', sent_at: new Date().toISOString() })
      .eq('id', invoice.id);

    if (updateError) throw updateError;

    return json({ success: true, resend_id: emailResult.id });
  } catch (error) {
    console.error('send-invoice-email error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500);
  }
});
