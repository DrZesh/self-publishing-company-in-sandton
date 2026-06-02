import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderFields = (fields: Array<[string, unknown]> = []) => fields
  .map(([label, value]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td></tr>`)
  .join('');

const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Creative Books SA <noreply@creativebooks.co.za>';

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY missing. Email skipped:', { to, subject });
    return { skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: fromEmail, to, subject, html }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || 'Resend email failed');
  }

  return result;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'info@creativebooks.co.za';
    const submitterName = payload.submitterName || 'Client';
    const submitterEmail = payload.submitterEmail || payload.email;
    const fields = Array.isArray(payload.fields) ? payload.fields : [];

    const businessHtml = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
        <h2 style="margin:0 0 16px;">${escapeHtml(payload.formType || 'Website Form')}</h2>
        <p>A new website submission has been received.</p>
        <table style="border-collapse:collapse;width:100%;max-width:720px;">${renderFields(fields)}</table>
      </div>
    `;

    const userHtml = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
        <h2 style="margin:0 0 16px;">Thank you, ${escapeHtml(submitterName)}</h2>
        <p>We have received your request and the Creative Books SA team will review it.</p>
        <p>Regards,<br/>Creative Books SA</p>
      </div>
    `;

    const results = [];
    results.push(await sendEmail({
      to: adminEmail,
      subject: payload.businessSubject || `New ${payload.formType || 'Website'} Submission`,
      html: businessHtml,
    }));

    if (submitterEmail) {
      results.push(await sendEmail({
        to: submitterEmail,
        subject: payload.userSubject || 'We have received your request',
        html: userHtml,
      }));
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('sendFormEmailResend failed:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
