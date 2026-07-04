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

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase service environment is not configured.' }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const requireAdmin = async () => {
    const authorization = request.headers.get('authorization') || '';
    const token = authorization.replace(/^Bearer\s+/i, '');

    if (!token) throw new Error('Unauthorized');

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) throw new Error('Unauthorized');

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !['super_admin', 'admin'].includes(profile?.role)) {
      throw new Error('Admin access required');
    }

    return userData.user;
  };

  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create' || action === 'update') {
      await requireAdmin();

      const { data: quote, error } = await admin.rpc('save_quote', {
        p_quote_id: action === 'update' ? body.quote_id : null,
        p_contact_id: body.contact_id,
        p_valid_until: body.valid_until || null,
        p_include_vat: body.include_vat !== false,
        p_discount_amount: Number(body.discount_amount) || 0,
        p_notes: body.notes || '',
        p_terms: body.terms || '',
        p_mode: body.mode || 'standard',
        p_line_items: Array.isArray(body.line_items) ? body.line_items : [],
      });

      if (error) throw error;
      return json({ quote });
    }

    if (action === 'duplicate') {
      await requireAdmin();

      const { data: quote, error } = await admin.rpc('duplicate_quote', {
        p_quote_id: body.quote_id,
      });

      if (error) throw error;
      return json({ quote });
    }

    if (action === 'convert_to_invoice') {
      await requireAdmin();

      const { data: invoice, error } = await admin.rpc('convert_quote_to_invoice', {
        p_quote_id: body.quote_id,
        p_due_date: body.due_date || null,
      });

      if (error) throw error;
      return json({ success: true, invoice });
    }

    if (action === 'send') {
      await requireAdmin();

      const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .select('*')
        .eq('id', body.quote_id)
        .single();

      if (quoteError || !quote) return json({ error: 'Quote not found' }, 404);

      const email = quote.contact_snapshot?.email;
      if (!email) return json({ error: 'Contact has no email address' }, 400);

      const { data: items, error: itemError } = await admin
        .from('quote_line_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('sort_order', { ascending: true });

      if (itemError) throw itemError;

      const siteUrl = (Deno.env.get('SITE_URL') || 'https://www.creativebooks.co.za').replace(/\/$/, '');
      const viewUrl = `${siteUrl}/quote/view/${quote.id}/${quote.view_token}`;
      const clientName = quote.contact_snapshot?.full_name || 'there';

      const rows = (items || []).map(item => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;">${escapeHtml(item.description)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${Number(item.quantity)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;">R ${Number(item.unit_price || 0).toFixed(2)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">R ${Number(item.line_total || 0).toFixed(2)}</td>
        </tr>
      `).join('');

      const emailHtml = `
        <!doctype html>
        <html>
          <body style="margin:0;background:#f6f6f6;font-family:Arial,sans-serif;color:#1A1208;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f6f6f6;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">
                  <tr><td style="background:#1A1208;padding:28px 32px;">
                    <div style="color:#B87333;font-weight:800;font-size:22px;">CREATIVE BOOKS SA</div>
                    <div style="color:#fff;opacity:.65;font-size:12px;margin-top:4px;">Professional Publishing Services</div>
                  </td></tr>
                  <tr><td style="padding:32px;">
                    <h2 style="margin:0 0 12px;font-size:22px;">Quote ${escapeHtml(quote.quote_number)}</h2>
                    <p style="margin:0 0 20px;color:#555;line-height:1.6;">Hi ${escapeHtml(clientName)}, your publishing quote is ready for review.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
                      <thead><tr style="background:#faf8f4;">
                        <th style="padding:10px 12px;text-align:left;font-size:11px;color:#666;">DESCRIPTION</th>
                        <th style="padding:10px 12px;text-align:center;font-size:11px;color:#666;">QTY</th>
                        <th style="padding:10px 12px;text-align:right;font-size:11px;color:#666;">UNIT</th>
                        <th style="padding:10px 12px;text-align:right;font-size:11px;color:#666;">TOTAL</th>
                      </tr></thead>
                      <tbody>${rows}</tbody>
                    </table>
                    <div style="text-align:right;font-size:20px;font-weight:800;color:#B87333;margin-bottom:24px;">Total: R ${Number(quote.total || 0).toFixed(2)}</div>
                    <div style="text-align:center;">
                      <a href="${viewUrl}" style="display:inline-block;background:#B87333;color:#fff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:10px;">View, Sign or Decline Quote</a>
                    </div>
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
          to: [email],
          subject: `Your Quote ${quote.quote_number} | Creative Books SA`,
          html: emailHtml,
        }),
      });

      const emailResult = await emailResponse.json();
      if (!emailResponse.ok) {
        return json({ error: emailResult?.message || 'Unable to send quote email' }, 502);
      }

      const { error: updateError } = await admin
        .from('quotes')
        .update({ status: 'Sent', sent_at: new Date().toISOString() })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      return json({ success: true, resend_id: emailResult.id });
    }

    if (action === 'get_public') {
      const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .select('*')
        .eq('id', body.quote_id)
        .eq('view_token', body.token)
        .maybeSingle();

      if (quoteError) throw quoteError;
      if (!quote) return json({ error: 'Quote not found or token invalid' }, 404);

      let publicQuote = quote;
      const today = new Date().toISOString().slice(0, 10);

      if (
        quote.valid_until &&
        quote.valid_until < today &&
        !['Accepted', 'Declined', 'Expired'].includes(quote.status)
      ) {
        const { data: expired } = await admin
          .from('quotes')
          .update({ status: 'Expired' })
          .eq('id', quote.id)
          .select('*')
          .single();
        publicQuote = expired;
      } else if (['Sent', 'Delivered', 'Opened'].includes(quote.status)) {
        const { data: viewed } = await admin
          .from('quotes')
          .update({ status: 'Viewed', viewed_at: new Date().toISOString() })
          .eq('id', quote.id)
          .select('*')
          .single();
        publicQuote = viewed;
      }

      const { data: lineItems, error: itemError } = await admin
        .from('quote_line_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('sort_order', { ascending: true });

      if (itemError) throw itemError;
      return json({ quote: publicQuote, line_items: lineItems || [] });
    }

    if (action === 'sign') {
      const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .select('id, view_token, status')
        .eq('id', body.quote_id)
        .eq('view_token', body.token)
        .maybeSingle();

      if (quoteError) throw quoteError;
      if (!quote) return json({ error: 'Quote not found or token invalid' }, 404);
      if (['Declined', 'Expired'].includes(quote.status)) return json({ error: 'Quote can no longer be signed' }, 409);
      if (!body.legal_acknowledgment_checked) return json({ error: 'Legal acknowledgment is required' }, 400);

      const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
      const ip = request.headers.get('cf-connecting-ip') || forwardedFor || request.headers.get('x-real-ip') || 'unknown';
      const salt = Deno.env.get('CAPTURE_IP_SALT') || 'creative-books-signature';
      const ipHash = ip === 'unknown' ? null : await sha256(`${ip}:${salt}`);

      const { data: signature, error: signatureError } = await admin
        .from('quote_signatures')
        .insert({
          quote_id: quote.id,
          signer_name: body.signer_name,
          signer_email: body.signer_email,
          signer_ip_hash: ipHash,
          signer_user_agent: body.signer_user_agent || request.headers.get('user-agent'),
          signature_data: body.signature_image_url,
          signed_at: body.signed_at || new Date().toISOString(),
          signature_method: body.signature_method,
          legal_acknowledgment_checked: true,
        })
        .select('id, signed_at')
        .single();

      if (signatureError) throw signatureError;
      return json({ success: true, signature });
    }

    if (action === 'respond') {
      const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .select('*')
        .eq('id', body.quote_id)
        .eq('view_token', body.token)
        .maybeSingle();

      if (quoteError) throw quoteError;
      if (!quote) return json({ error: 'Quote not found or token invalid' }, 404);

      const response = body.response;
      if (!['accept', 'decline'].includes(response)) {
        return json({ error: 'Invalid response' }, 400);
      }

      if (response === 'accept') {
        const { count, error: signatureCheckError } = await admin
          .from('quote_signatures')
          .select('id', { count: 'exact', head: true })
          .eq('quote_id', quote.id);

        if (signatureCheckError) throw signatureCheckError;
        if (!count) return json({ error: 'A signature is required before acceptance' }, 400);
      }

      const update = response === 'accept'
        ? { status: 'Accepted', accepted_at: new Date().toISOString() }
        : { status: 'Declined', declined_at: new Date().toISOString() };

      const { data: updated, error: updateError } = await admin
        .from('quotes')
        .update(update)
        .eq('id', quote.id)
        .select('*')
        .single();

      if (updateError) throw updateError;
      return json({ success: true, quote: updated });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('quote-actions error:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Admin access required' ? 403 : 500;
    return json({ error: message }, status);
  }
});
