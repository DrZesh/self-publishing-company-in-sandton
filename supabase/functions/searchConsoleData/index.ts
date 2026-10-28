import { createClientFromRequest, serve } from '../_shared/server.ts';

const SITE_URL = 'sc-domain:creativebooks.co.za';
const GSC_BASE = 'https://www.googleapis.com/webmasters/v3';

// Simple in-memory cache (survives within the same Deno isolate)
const cache = new Map();

function cacheKey(params) {
  return JSON.stringify(params);
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > 6 * 60 * 60 * 1000) { // 6 hours
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

async function gscFetch(accessToken, path, body = null) {
  const url = `${GSC_BASE}${path}`;
  const opts = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    opts.method = 'POST';
    opts.body = JSON.stringify(body);
  } else {
    opts.method = 'GET';
  }

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, opts);
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
      lastError = 'rate_limited';
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = { error: { message: text } }; }
      throw new Error(parsed?.error?.message || `GSC API error ${res.status}`);
    }
    return await res.json();
  }
  throw new Error(lastError === 'rate_limited' ? 'GSC rate limit reached. Please try again in a minute.' : 'GSC API failed after retries.');
}

function dateRange(days) {
  const end = new Date();
  end.setDate(end.getDate() - 3); // GSC 2-3 day delay
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

serve('searchConsoleData', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await platform.asServiceRole.connectors.getConnection('google_search_console');

    const body = await req.json();
    const { action, days = 28, dimensions = ['date'], rowLimit = 25, startRow = 0, forceRefresh = false, customStart, customEnd } = body;

    const ck = cacheKey({ action, days, dimensions, rowLimit, startRow, customStart, customEnd });
    if (!forceRefresh) {
      const cached = getCached(ck);
      if (cached) return Response.json({ ...cached, fromCache: true });
    }

    let result;

    if (action === 'performance') {
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range,
        dimensions,
        rowLimit,
        startRow,
        dataState: 'all',
      });
      result = { rows: data.rows || [], responseAggregationType: data.responseAggregationType, lastDate: range.endDate };
    }

    else if (action === 'performance_compare') {
      // Current period
      const cur = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      // Previous period (same length)
      const diff = Math.round((new Date(cur.endDate) - new Date(cur.startDate)) / 86400000);
      const prevEnd = new Date(cur.startDate);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - diff);

      const [current, previous] = await Promise.all([
        gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
          ...cur, dimensions, rowLimit, startRow, dataState: 'all',
        }),
        gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
          startDate: prevStart.toISOString().slice(0, 10),
          endDate: prevEnd.toISOString().slice(0, 10),
          dimensions, rowLimit, startRow, dataState: 'all',
        }),
      ]);
      result = {
        current: { rows: current.rows || [], lastDate: cur.endDate },
        previous: { rows: previous.rows || [], lastDate: prevEnd.toISOString().slice(0, 10) },
        previousPeriod: { startDate: prevStart.toISOString().slice(0, 10), endDate: prevEnd.toISOString().slice(0, 10) },
        currentPeriod: cur,
      };
    }

    else if (action === 'top_queries') {
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range,
        dimensions: ['query'],
        rowLimit: rowLimit || 10,
        startRow,
        dataState: 'all',
      });
      result = { rows: data.rows || [], lastDate: range.endDate, currentPeriod: range };
    }

    else if (action === 'top_pages') {
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range,
        dimensions: ['page'],
        rowLimit: rowLimit || 10,
        startRow,
        dataState: 'all',
      });
      result = { rows: data.rows || [], lastDate: range.endDate, currentPeriod: range };
    }

    else if (action === 'query_pages') {
      // For a specific query, get pages
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const { query } = body;
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range,
        dimensions: ['page'],
        dimensionFilterGroups: [{
          filters: [{ dimension: 'query', operator: 'equals', expression: query }]
        }],
        rowLimit: 10,
        dataState: 'all',
      });
      result = { rows: data.rows || [], lastDate: range.endDate };
    }

    else if (action === 'page_queries') {
      // For a specific page, get queries
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const { page } = body;
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range,
        dimensions: ['query'],
        dimensionFilterGroups: [{
          filters: [{ dimension: 'page', operator: 'equals', expression: page }]
        }],
        rowLimit: 20,
        dataState: 'all',
      });
      result = { rows: data.rows || [], lastDate: range.endDate };
    }

    else if (action === 'countries') {
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range, dimensions: ['country'], rowLimit: 50, dataState: 'all',
      });
      result = { rows: data.rows || [], lastDate: range.endDate };
    }

    else if (action === 'devices') {
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range, dimensions: ['device'], rowLimit: 10, dataState: 'all',
      });
      result = { rows: data.rows || [], lastDate: range.endDate };
    }

    else if (action === 'search_appearance') {
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        ...range, dimensions: ['searchAppearance'], rowLimit: 20, dataState: 'all',
      });
      result = { rows: data.rows || [], lastDate: range.endDate };
    }

    else if (action === 'sitemaps') {
      const data = await gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/sitemaps`);
      result = { sitemaps: data.sitemap || [] };
    }

    else if (action === 'smart_insights') {
      // Fetch data needed for smart insights — queries at position 11-20 + high impressions low CTR
      const range = customStart && customEnd ? { startDate: customStart, endDate: customEnd } : dateRange(days);
      const [queries, prevQueries] = await Promise.all([
        gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
          ...range, dimensions: ['query', 'page'], rowLimit: 500, dataState: 'all',
        }),
        gscFetch(accessToken, `/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
          startDate: (() => {
            const d = new Date(range.startDate); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10);
          })(),
          endDate: (() => {
            const d = new Date(range.startDate); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10);
          })(),
          dimensions: ['query'], rowLimit: 500, dataState: 'all',
        }),
      ]);

      const rows = queries.rows || [];
      const prevRows = prevQueries.rows || [];
      const prevMap = new Map(prevRows.map(r => [r.keys[0], r]));

      const quickWins = rows.filter(r => r.position >= 11 && r.position <= 20 && r.impressions >= 100)
        .sort((a, b) => b.impressions - a.impressions).slice(0, 10)
        .map(r => ({
          query: r.keys[0], page: r.keys[1], position: r.position,
          impressions: r.impressions, clicks: r.clicks,
          estimatedExtraClicks: Math.round(r.impressions * 0.065 - r.clicks),
        }));

      const highImpLowCtr = rows.filter(r => r.impressions >= 500 && r.ctr < 0.01)
        .sort((a, b) => b.impressions - a.impressions).slice(0, 10)
        .map(r => ({ query: r.keys[0], page: r.keys[1], impressions: r.impressions, ctr: r.ctr, clicks: r.clicks }));

      const risingQueries = rows.filter(r => {
        const prev = prevMap.get(r.keys[0]);
        return prev && prev.clicks > 0 && r.clicks / prev.clicks >= 1.5;
      }).sort((a, b) => {
        const pa = prevMap.get(a.keys[0]); const pb = prevMap.get(b.keys[0]);
        return (b.clicks / pb.clicks) - (a.clicks / pa.clicks);
      }).slice(0, 10).map(r => {
        const prev = prevMap.get(r.keys[0]);
        return { query: r.keys[0], clicks: r.clicks, prevClicks: prev.clicks, pctChange: Math.round((r.clicks / prev.clicks - 1) * 100) };
      });

      result = { quickWins, highImpLowCtr, risingQueries, lastDate: range.endDate };
    }

    else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    setCached(ck, result);
    return Response.json(result);

  } catch (error) {
    console.error('searchConsoleData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});