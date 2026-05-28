import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list_properties';

    if (action === 'list_properties') {
      const res = await fetch('https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:accounts/-', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === 'realtime') {
      const { propertyId } = body;
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensions: [{ name: 'country' }, { name: 'unifiedScreenName' }],
          metrics: [{ name: 'activeUsers' }],
        }),
      });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === 'report') {
      const { propertyId } = body;
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        }),
      });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === 'top_pages') {
      const { propertyId } = body;
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        }),
      });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === 'sources') {
      const { propertyId } = body;
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        }),
      });
      const data = await res.json();
      return Response.json(data);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});