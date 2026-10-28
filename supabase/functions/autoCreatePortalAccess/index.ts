import { createClientFromRequest, serve } from '../_shared/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

async function sendBrandedEmail(to, subject, htmlContent) {
  const resendPayload = {
    from: 'Creative Books SA <info@creativebooks.co.za>',
    to: [to],
    subject,
    html: htmlContent,
  };

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendPayload),
  });

  const resendData = await resendRes.json();
  return resendRes.ok;
}

serve('autoCreatePortalAccess', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const authorizedAdmin = await platform.auth.me();
    if (!authorizedAdmin || !['admin', 'super_user'].includes(authorizedAdmin.role)) return Response.json({ error: 'Administrator access required' }, { status: 403 });
    const body = await req.json();
    
    // Get the project from automation payload
    const project = body.data;
    if (!project || !project.id) {
      return Response.json({ error: 'No project data' }, { status: 400 });
    }

    // Get contact details
    const contact = await platform.asServiceRole.entities.Contact.get(project.contact_id);
    if (!contact || !contact.email) {
      return Response.json({ skipped: true, reason: 'No contact or email found' });
    }

    // Check if portal access already exists for this project
    const existingAccess = await platform.asServiceRole.entities.ClientPortalAccess.filter({
      project_id: project.id,
      is_active: true,
    }, 'created_date', 1);

    if (existingAccess.length > 0) {
      return Response.json({ skipped: true, reason: 'Portal access already exists' });
    }

    // Generate access token
    const generateToken = () => Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days

    // Create portal access
    const portalAccess = await platform.asServiceRole.entities.ClientPortalAccess.create({
      contact_id: contact.id,
      project_id: project.id,
      email: contact.email,
      access_token: token,
      is_active: true,
      expires_at: expiresAt,
      allowed_sections: ['quotes', 'invoices', 'projects', 'documents'],
      access_count: 0,
    });

    // Send welcome email with portal link
    const portalUrl = `https://creativebooks.co.za/portal/${token}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
          <tr><td align="center" style="padding:24px 16px;">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr><td height="10" style="background:linear-gradient(90deg,#B87333,#D4A574);font-size:0;line-height:0;">&nbsp;</td></tr>
              <tr><td align="center" style="padding:32px 0 24px;">
                <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="160" style="max-width:160px;height:auto;display:block;" />
              </td></tr>
              <tr><td style="padding:0 32px 32px;font-size:15px;line-height:1.7;color:#2C2C2C;">
                <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 16px 0;">Welcome to Your Client Portal</h2>
                <p style="font-size:15px;color:#2C2C2C;margin:0 0 16px 0;">Dear ${contact.full_name || 'Valued Client'},</p>
                <p style="font-size:15px;color:#2C2C2C;margin:0 0 16px 0;">Congratulations on starting your publishing journey with us! We've created a secure client portal for <strong>${project.book_title || 'your project'}</strong>.</p>
                <p style="font-size:15px;color:#2C2C2C;margin:0 0 16px 0;">Through this portal, you can:</p>
                <ul style="font-size:15px;color:#2C2C2C;margin:0 0 24px 0;padding-left:20px;">
                  <li>View and download quotes</li>
                  <li>Access invoices and payment receipts</li>
                  <li>Track your project progress in real-time</li>
                  <li>Review and approve documents</li>
                  <li>Communicate with our team</li>
                </ul>
                <div style="text-align:center;margin:24px 0;">
                  <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#B87333 0%,#D4A574 100%);color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Access Your Portal</a>
                </div>
                <div style="background:#FAF5EE;border-left:4px solid #B87333;padding:16px;border-radius:8px;margin:24px 0;">
                  <p style="font-size:14px;color:#2C2C2C;margin:0;"><strong>Quick Tips:</strong></p>
                  <ul style="font-size:14px;color:#2C2C2C;margin:8px 0 0 0;padding-left:20px;">
                    <li>Bookmark this page for easy access</li>
                    <li>Check your project timeline regularly for updates</li>
                    <li>Upload requested files directly through the portal</li>
                  </ul>
                </div>
                <p style="font-size:14px;color:#6B6B6B;margin:16px 0 0 0;">This link will expire on ${new Date(expiresAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}. If you need a new link, please contact us.</p>
                <p style="font-size:14px;color:#6B6B6B;margin:16px 0 0 0;">If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> or call <strong>084 230 5393 / 010 500 3331</strong>.</p>
                <p style="font-size:15px;color:#2C2C2C;margin:24px 0 0 0;">We're excited to bring your book to life!<br><strong>Creative Books SA</strong></p>
              </td></tr>
              <tr><td align="center" style="padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8;">
                <strong style="color:#2C2C2C;">Creative Books SA</strong><br />
                Prism Office Park, Fourways, Johannesburg<br />
                <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> · 084 230 5393 / 010 500 3331
              </td></tr>
              <tr><td align="center" style="padding:12px 32px 28px;font-size:11px;color:#AAAAAA;">
                You are receiving this email as part of your publishing journey with Creative Books SA.
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    try {
      await sendBrandedEmail(contact.email, `Your Client Portal - ${project.book_title || 'Creative Books SA'}`, emailHtml);
      
      return Response.json({
        success: true,
        portal_access_id: portalAccess.id,
        email_sent: true,
        message: 'Portal access created and welcome email sent',
      });
    } catch (emailError) {
      console.error('Email failed:', emailError);
      return Response.json({
        success: true,
        portal_access_id: portalAccess.id,
        email_sent: false,
        message: 'Portal access created (email failed)',
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});