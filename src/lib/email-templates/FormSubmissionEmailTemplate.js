export const FormSubmissionEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Form Submission - Creative Books SA</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .email-wrapper {
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        .gradient-bar {
            height: 6px;
            background: linear-gradient(to right, #d9534f, #f0ad4e, #5cb85c, #5bc0de, #9b59b6);
        }
        .header-section {
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            max-width: 180px;
            height: auto;
            margin: 0 auto 30px;
            display: block;
        }
        .main-heading {
            font-size: 28px;
            font-weight: 700;
            color: #0f0f0f;
            margin: 0 0 10px 0;
            font-family: Georgia, serif;
        }
        .subtitle {
            font-size: 14px;
            color: #666666;
            margin: 0;
            line-height: 1.6;
        }
        .form-type-section {
            padding: 0 30px 25px;
            border-bottom: 1px solid #e8e8e8;
        }
        .form-type-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #b87333;
            margin: 0 0 8px 0;
        }
        .form-type-value {
            font-size: 16px;
            font-weight: 600;
            color: #0f0f0f;
            margin: 0;
        }
        .details-card {
            margin: 25px 30px;
            padding: 25px;
            background-color: #faf8f3;
            border-radius: 8px;
            border-left: 4px solid #b87333;
        }
        .details-heading {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #b87333;
            margin: 0 0 20px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 15px;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .detail-label {
            font-size: 13px;
            font-weight: 600;
            color: #666666;
            min-width: 140px;
            padding-right: 15px;
        }
        .detail-value {
            font-size: 13px;
            color: #0f0f0f;
            word-break: break-word;
            flex: 1;
        }
        .message-section {
            padding: 0 30px 25px;
            border-top: 1px solid #e8e8e8;
        }
        .message-heading {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #b87333;
            margin: 25px 0 15px 0;
        }
        .message-content {
            font-size: 13px;
            color: #0f0f0f;
            line-height: 1.6;
            background-color: #faf8f3;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #b87333;
        }
        .meta-section {
            padding: 20px 30px;
            background-color: #f9f9f9;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #e8e8e8;
        }
        .meta-row {
            margin-bottom: 8px;
            display: flex;
        }
        .meta-row:last-child {
            margin-bottom: 0;
        }
        .meta-label {
            font-weight: 600;
            min-width: 120px;
        }
        .meta-value {
            color: #666666;
        }
        .button-section {
            padding: 30px;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 20px;
            margin: 6px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .button-primary {
            background-color: #0f0f0f;
            color: #ffffff;
        }
        .button-primary:hover {
            background-color: #2a2a2a;
        }
        .button-secondary {
            background-color: #ffffff;
            color: #b87333;
            border: 2px solid #b87333;
        }
        .button-secondary:hover {
            background-color: #faf8f3;
        }
        .footer-section {
            padding: 30px;
            background-color: #f9f9f9;
            text-align: center;
            border-top: 1px solid #e8e8e8;
        }
        .footer-brand {
            font-size: 16px;
            font-weight: 700;
            color: #0f0f0f;
            margin: 0 0 8px 0;
        }
        .footer-tagline {
            font-size: 13px;
            color: #666666;
            margin: 0 0 15px 0;
        }
        .footer-info {
            font-size: 12px;
            color: #999999;
            line-height: 1.8;
            margin: 0 0 15px 0;
        }
        .footer-info a {
            color: #b87333;
            text-decoration: none;
        }
        .footer-note {
            font-size: 11px;
            color: #cccccc;
            margin: 15px 0 0 0;
            padding-top: 15px;
            border-top: 1px solid #e8e8e8;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }
            .header-section {
                padding: 30px 20px;
            }
            .logo {
                max-width: 140px;
            }
            .main-heading {
                font-size: 24px;
            }
            .details-card,
            .message-section,
            .button-section,
            .footer-section,
            .form-type-section {
                padding-left: 20px;
                padding-right: 20px;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                min-width: auto;
                margin-bottom: 5px;
                padding-right: 0;
            }
            .button {
                display: block;
                width: 90%;
                margin: 8px auto;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="gradient-bar"></div>
            <div class="header-section">
                <img src="{{logo_url}}" alt="Creative Books SA" class="logo" />
                <h1 class="main-heading">New Form Submission</h1>
                <p class="subtitle">A new enquiry has been received from the Creative Books SA website.</p>
            </div>
            <div class="form-type-section">
                <p class="form-type-label">Form Type</p>
                <p class="form-type-value">{{form_type}}</p>
            </div>
            <div class="details-card">
                <p class="details-heading">Submission Details</p>
                {{#if full_name}}<div class="detail-row"><span class="detail-label">Full Name:</span><span class="detail-value">{{full_name}}</span></div>{{/if}}
                {{#if email}}<div class="detail-row"><span class="detail-label">Email Address:</span><span class="detail-value"><a href="mailto:{{email}}" style="color: #b87333; text-decoration: none;">{{email}}</a></span></div>{{/if}}
                {{#if phone}}<div class="detail-row"><span class="detail-label">Contact Number:</span><span class="detail-value"><a href="tel:{{phone}}" style="color: #b87333; text-decoration: none;">{{phone}}</a></span></div>{{/if}}
                {{#if company_name}}<div class="detail-row"><span class="detail-label">Company Name:</span><span class="detail-value">{{company_name}}</span></div>{{/if}}
                {{#if service_required}}<div class="detail-row"><span class="detail-label">Service Required:</span><span class="detail-value">{{service_required}}</span></div>{{/if}}
                {{#if book_title}}<div class="detail-row"><span class="detail-label">Book Title:</span><span class="detail-value">{{book_title}}</span></div>{{/if}}
                {{#if book_size}}<div class="detail-row"><span class="detail-label">Book Size:</span><span class="detail-value">{{book_size}}</span></div>{{/if}}
                {{#if page_count}}<div class="detail-row"><span class="detail-label">Number of Pages:</span><span class="detail-value">{{page_count}}</span></div>{{/if}}
                {{#if quantity}}<div class="detail-row"><span class="detail-label">Quantity:</span><span class="detail-value">{{quantity}}</span></div>{{/if}}
                {{#if interior_printing}}<div class="detail-row"><span class="detail-label">Interior Printing:</span><span class="detail-value">{{interior_printing}}</span></div>{{/if}}
                {{#if cover_type}}<div class="detail-row"><span class="detail-label">Cover Type:</span><span class="detail-value">{{cover_type}}</span></div>{{/if}}
                {{#if binding_type}}<div class="detail-row"><span class="detail-label">Binding Type:</span><span class="detail-value">{{binding_type}}</span></div>{{/if}}
                {{#if editing_required}}<div class="detail-row"><span class="detail-label">Editing Required:</span><span class="detail-value">{{editing_required}}</span></div>{{/if}}
                {{#if cover_design_required}}<div class="detail-row"><span class="detail-label">Cover Design Required:</span><span class="detail-value">{{cover_design_required}}</span></div>{{/if}}
                {{#if typesetting_required}}<div class="detail-row"><span class="detail-label">Typesetting Required:</span><span class="detail-value">{{typesetting_required}}</span></div>{{/if}}
                {{#if author_website_required}}<div class="detail-row"><span class="detail-label">Author Website Required:</span><span class="detail-value">{{author_website_required}}</span></div>{{/if}}
                {{#if deadline}}<div class="detail-row"><span class="detail-label">Deadline:</span><span class="detail-value">{{deadline}}</span></div>{{/if}}
                {{#if budget_range}}<div class="detail-row"><span class="detail-label">Budget Range:</span><span class="detail-value">{{budget_range}}</span></div>{{/if}}
            </div>
            {{#if message}}<div class="message-section">
                <p class="message-heading">Client Message</p>
                <div class="message-content">{{message}}</div>
            </div>{{/if}}
            <div class="meta-section">
                {{#if submission_date}}<div class="meta-row"><span class="meta-label">Submission Date:</span><span class="meta-value">{{submission_date}}</span></div>{{/if}}
                {{#if submission_time}}<div class="meta-row"><span class="meta-label">Submission Time:</span><span class="meta-value">{{submission_time}}</span></div>{{/if}}
                {{#if source_page}}<div class="meta-row"><span class="meta-label">Source Page:</span><span class="meta-value">{{source_page}}</span></div>{{/if}}
                {{#if form_id}}<div class="meta-row"><span class="meta-label">Form ID:</span><span class="meta-value">{{form_id}}</span></div>{{/if}}
            </div>
            <div class="button-section">
                <a href="mailto:{{email}}" class="button button-primary">Reply to Client</a>
                <a href="tel:{{phone}}" class="button button-secondary">Call Client</a>
                <a href="https://wa.me/{{phone}}" class="button button-secondary">WhatsApp Client</a>
                <a href="{{submission_url}}" class="button button-secondary">View Submission</a>
            </div>
            <div class="footer-section">
                <p class="footer-brand">Creative Books SA</p>
                <p class="footer-tagline">Printing, Publishing, Editing, Cover Design and Author Website Services</p>
                <div class="footer-info">
                    Website: <a href="https://www.creativebooks.co.za">www.creativebooks.co.za</a><br>
                    Email: <a href="mailto:info@creativebooks.co.za">info@creativebooks.co.za</a><br>
                    Phone: <a href="tel:{{company_phone}}">{{company_phone}}</a>
                </div>
                <p class="footer-note">This email was automatically generated from the Creative Books SA website.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

export function renderFormSubmissionEmail(data) {
    let html = FormSubmissionEmailTemplate;
    
    Object.entries(data).forEach(([key, value]) => {
        const pattern = `{{\\s*${key}\\s*}}`;
        const regex = new RegExp(pattern, 'g');
        html = html.replace(regex, value || '');
    });
    
    // Remove conditional sections if data is empty
    html = html.replace(/\{\{#if\s+\w+\}\}.*?\{\{\/if\}\}/gs, (match) => {
        const keyMatch = match.match(/\{\{#if\s+(\w+)\}\}/);
        if (!keyMatch) return match;
        const key = keyMatch[1];
        return data[key] ? match.replace(/\{\{#if\s+\w+\}\}|\{\{\/if\}\}/g, '') : '';
    });
    
    return html;
}