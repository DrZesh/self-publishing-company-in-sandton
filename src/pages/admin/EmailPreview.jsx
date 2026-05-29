export default function EmailPreview() {
  const BRAND_COLOR = '#B87333';
  const LOGO_URL = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png';

  const emailHtml = `
    <div style="background:#F5F5F5;padding:24px 16px;min-height:100vh;">
      <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Gradient bar -->
        <div style="height:8px;background:linear-gradient(90deg,#8B5E3C,#B87333,#D4A574,#B87333,#8B5E3C);"></div>
        <!-- Logo -->
        <div style="text-align:center;padding:32px 0 24px;">
          <img src="${LOGO_URL}" alt="Creative Books SA" style="max-width:160px;height:auto;display:inline-block;" />
        </div>
        <!-- Divider -->
        <div style="height:1px;background:#E5E0D5;margin:0 32px;"></div>
        <!-- Body -->
        <div style="padding:24px 32px 32px;">
          <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 8px 0;">New Form Submission</h1>
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#6B6B6B;text-align:center;margin:0 0 28px 0;">A new submission has been received from your website.</p>
          <!-- Form Type -->
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 6px 0;">Form Type</p>
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#2C2C2C;margin:0 0 24px 0;">Contact Form</p>
          <!-- Divider -->
          <div style="height:1px;background:#E5E0D5;margin-bottom:20px;"></div>
          <!-- Submission Details -->
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 10px 0;">Submission Details</p>
          <div style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EE;">
              <tr>
                <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Full Name</td>
                <td style="padding:11px 14px;font-size:14px;font-weight:700;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Musa Aubrey Nkanyani</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Email Address</td>
                <td style="padding:11px 14px;font-size:14px;font-weight:700;color:#B87333;border-bottom:1px solid #E5E0D5;">draubreyzesh@gmail.com</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Phone Number</td>
                <td style="padding:11px 14px;font-size:14px;font-weight:700;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">084 555 1234</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">Service Interest</td>
                <td style="padding:11px 14px;font-size:14px;font-weight:700;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">Full Publishing Package</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;">Message</td>
                <td style="padding:11px 14px;font-size:14px;color:#2C2C2C;">I'd like to publish my memoir. Please get in touch.</td>
              </tr>
            </table>
          </div>
          <!-- Divider -->
          <div style="height:1px;background:#E5E0D5;margin-bottom:20px;"></div>
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:#B87333;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 6px 0;">Submitted At</p>
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#2C2C2C;margin:0 0 20px 0;">29 May 2026 at 12:08</p>
        </div>
        <!-- Divider -->
        <div style="height:1px;background:#E5E0D5;margin:0 32px;"></div>
        <!-- Footer -->
        <div style="text-align:center;padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8;">
          <strong style="color:#2C2C2C;">Creative Books SA</strong><br/>
          Prism Office Park, 1 Ruby Cl, Fourways, 2191<br/>
          <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> · Landline: 010 500 3331 · Mobile: 084 230 5393<br/>
          <span style="color:#B87333;font-style:italic;">#1 Self Publishing Company in South Africa &amp; Abroad</span>
        </div>
        <div style="text-align:center;padding:12px 32px 28px;font-size:11px;color:#AAAAAA;line-height:1.6;">
          You're receiving this email because you submitted a form on our website.<br/>We will not share your email address with third parties.
        </div>
      </div>
    </div>
  `;

  return (
    <div style={{ background: '#e8e8e8', minHeight: '100vh' }}>
      <div style={{ background: '#333', color: '#fff', padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ background: '#B87333', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>PREVIEW</span>
        Email Template — Creative Books SA Branded Design
      </div>
      <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
    </div>
  );
}