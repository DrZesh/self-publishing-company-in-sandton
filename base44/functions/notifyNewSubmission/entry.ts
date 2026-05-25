import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { Resend } from 'npm:resend@2.0.0';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const sub = body.data || {};

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const services = Array.isArray(sub.service_interest) && sub.service_interest.length
      ? sub.service_interest.join(', ')
      : 'Not specified';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #B87333; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">📬 New Submission — Creative Books SA</h1>
        </div>
        <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: bold; color: #1a1a1a;">${sub.full_name || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0; color: #1a1a1a;"><a href="mailto:${sub.email}" style="color: #B87333;">${sub.email || '—'}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0; color: #1a1a1a;">${sub.phone || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Form Type</td><td style="padding: 8px 0; color: #1a1a1a;">${(sub.form_type || '—').replace(/_/g, ' ')}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Services</td><td style="padding: 8px 0; color: #1a1a1a;">${services}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Book Title</td><td style="padding: 8px 0; color: #1a1a1a;">${sub.book_title || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Source</td><td style="padding: 8px 0; color: #1a1a1a;">${sub.source_page || '—'}</td></tr>
            ${sub.message ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #1a1a1a;">${sub.message}</td></tr>` : ''}
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://creativebooks.co.za/admin/submissions" style="background: #B87333; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">View in Dashboard →</a>
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Creative Books CRM <onboarding@resend.dev>',
      to: 'info@creativebooks.co.za',
      subject: `📬 New Submission: ${sub.full_name || 'Unknown'} — ${(sub.form_type || 'enquiry').replace(/_/g, ' ')}`,
      html,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});