import { createClientFromRequest, serve } from '../_shared/server.ts';

const SITE_URL = 'sc-domain:creativebooks.co.za';
const RECIPIENT = 'musankanyani@gmail.com';

serve('weeklySeoDigest', async (req) => {
  try {
    const platform = createClientFromRequest(req);

    // Allow both scheduled (service role) and manual admin invocation
    const user = await platform.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await platform.asServiceRole.connectors.getConnection('google_search_console');

    const today = new Date();
    const endDate = today.toISOString().slice(0, 10);
    const startDate = new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Fetch current week performance
    const [queriesRes, pagesRes] = await Promise.all([
      fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: 10, orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }] }),
      }),
      fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, dimensions: ['page'], rowLimit: 5, orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }] }),
      }),
    ]);

    const queriesData = await queriesRes.json();
    const pagesData = await pagesRes.json();

    const topQueries = (queriesData.rows || []).slice(0, 10);
    const topPages = (pagesData.rows || []).slice(0, 5);

    const totalClicks = topQueries.reduce((s, r) => s + r.clicks, 0);
    const totalImpressions = topQueries.reduce((s, r) => s + r.impressions, 0);
    const avgCtr = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

    // Build HTML email
    const queryRows = topQueries.map(r => `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:8px 12px;font-size:13px;color:#1a1a1a;">${r.keys[0]}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:600;color:#B87333;">${r.clicks}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;color:#666;">${r.impressions}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;color:#666;">${(r.position || 0).toFixed(1)}</td>
      </tr>`).join('');

    const pageRows = topPages.map(r => {
      const path = r.keys[0].replace('https://www.creativebooks.co.za', '').replace('https://creativebooks.co.za', '') || '/';
      return `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:8px 12px;font-size:13px;color:#1a1a1a;">${path}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:600;color:#B87333;">${r.clicks}</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;color:#666;">${r.impressions}</td>
      </tr>`;
    }).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Weekly SEO Digest</title></head>
<body style="font-family:system-ui,sans-serif;background:#f9f7f2;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:#1a1208;padding:32px;text-align:center;">
      <div style="font-size:11px;color:#B87333;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Creative Books SA</div>
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Weekly SEO Digest</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0 0;">${startDate} → ${endDate}</p>
    </div>

    <div style="padding:24px;">
      <!-- KPIs -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
        <div style="background:#f9f7f2;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#B87333;">${totalClicks}</div>
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">Clicks</div>
        </div>
        <div style="background:#f9f7f2;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#1a1208;">${totalImpressions.toLocaleString()}</div>
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">Impressions</div>
        </div>
        <div style="background:#f9f7f2;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#1a1208;">${avgCtr}%</div>
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">Avg CTR</div>
        </div>
      </div>

      <!-- Top Queries -->
      <h2 style="font-size:14px;font-weight:700;color:#1a1208;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Top Queries</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f0ebe3;">
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#666;text-align:left;text-transform:uppercase;">Query</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#666;text-align:right;text-transform:uppercase;">Clicks</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#666;text-align:right;text-transform:uppercase;">Impr.</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#666;text-align:right;text-transform:uppercase;">Pos.</th>
          </tr>
        </thead>
        <tbody>${queryRows}</tbody>
      </table>

      <!-- Top Pages -->
      <h2 style="font-size:14px;font-weight:700;color:#1a1208;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Top Pages</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f0ebe3;">
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#666;text-align:left;text-transform:uppercase;">Page</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#666;text-align:right;text-transform:uppercase;">Clicks</th>
            <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#666;text-align:right;text-transform:uppercase;">Impr.</th>
          </tr>
        </thead>
        <tbody>${pageRows}</tbody>
      </table>

      <div style="text-align:center;padding:16px;background:#f9f7f2;border-radius:12px;">
        <a href="https://creativebooks.co.za/admin/search-console" style="color:#B87333;font-size:13px;font-weight:600;text-decoration:none;">View Full SEO Dashboard →</a>
      </div>
    </div>

    <div style="padding:20px;text-align:center;border-top:1px solid #f0f0f0;">
      <p style="font-size:11px;color:#999;margin:0;">Creative Books SA · Automated Weekly Digest</p>
    </div>
  </div>
</body>
</html>`;

    await platform.asServiceRole.integrations.Core.SendEmail({
      to: RECIPIENT,
      subject: `📊 Weekly SEO Digest — ${startDate} to ${endDate}`,
      body: html,
      from_name: 'Creative Books SA · Analytics',
    });

    return Response.json({ success: true, period: `${startDate} to ${endDate}`, topQueries: topQueries.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});