import { serve } from '../_shared/server.ts';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'Creative Books SA <info@creativebooks.co.za>';
const TO_EMAIL = 'info@creativebooks.co.za';
const TO_CC = 'draubreyzesh@gmail.com';

serve('notifyContractSigned', async (req) => {
  try {
    const body = await req.json();
    const contract = body.data || {};

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td height="6" style="background:linear-gradient(90deg,#B87333,#D4A574);font-size:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:28px 32px 8px;">
        <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="150" style="max-width:150px;height:auto;display:block;" />
      </td></tr>
      <tr><td align="center" style="padding:16px 32px 8px;">
        <h1 style="font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 6px 0;">✍️ Contract Signed</h1>
        <p style="font-size:15px;color:#6B6B6B;margin:0 0 24px 0;">A contract has been signed.</p>
      </td></tr>
      <tr><td style="padding:0 32px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;">
          <tbody>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Contract Title</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${contract.title || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Document Type</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${contract.document_type || 'Contract'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Book Title</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${contract.book_title || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Signed By</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${contract.signer_name || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Signed At</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">${contract.signed_at ? new Date(contract.signed_at).toLocaleDateString('en-ZA') : '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#2C2C2C;border-bottom:1px solid #E5E0D5;width:38%;vertical-align:top;">Status</td>
              <td style="padding:10px 14px;font-size:14px;color:#6B6B6B;border-bottom:1px solid #E5E0D5;vertical-align:top;">✅ ${contract.status}</td>
            </tr>
          </tbody>
        </table>
        <div style="text-align:center;margin-top:28px;">
          <a href="https://creativebooks.co.za/admin/contracts" style="display:inline-block;background:#B87333;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">View Contract →</a>
        </div>
      </td></tr>
      <tr><td style="padding:24px 32px;border-top:1px solid #E5E0D5;text-align:center;font-size:13px;color:#AAAAAA;line-height:1.7;">
        Creative Books SA &nbsp;|&nbsp; Prism Office Park, Fourways &nbsp;|&nbsp; info@creativebooks.co.za
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL, TO_CC],
        subject: `✍️ Contract Signed: ${contract.title || 'Unknown'} — ${contract.signer_name || 'Client'}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend failed:', err);
      throw new Error(`Resend failed: ${err}`);
    }

    console.log('Contract signed notification sent successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyContractSigned error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});