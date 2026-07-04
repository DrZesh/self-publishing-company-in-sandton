import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SEARCH_ANALYTICS_BASE = 'https://www.googleapis.com/webmasters/v3';
const URL_INSPECTION_ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const DEFAULT_SITE_URL = 'sc-domain:creativebooks.co.za';
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const SHORT_CACHE_TTL_MS = 60 * 60 * 1000;
const INSPECTION_CACHE_TTL_MS = 15 * 60 * 1000;
const VALID_DIMENSIONS = new Set(['date', 'query', 'page', 'country', 'device', 'searchAppearance']);

let tokenCache = { accessToken: null, expiresAt: 0 };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function base64Url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem) {
  const normalized = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function serviceAccountAccessToken(rawJson) {
  const credentials = JSON.parse(rawJson);
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(credentials.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${base64Url(new Uint8Array(signature))}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || 'Unable to obtain Google service-account access token.');
  }
  return { accessToken: payload.access_token, expiresIn: Number(payload.expires_in || 3600) };
}

async function refreshTokenAccessToken() {
  const clientId = Deno.env.get('GSC_CLIENT_ID');
  const clientSecret = Deno.env.get('GSC_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GSC_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Search Console credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GSC_CLIENT_ID, GSC_CLIENT_SECRET and GSC_REFRESH_TOKEN.');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || 'Unable to refresh Google Search Console access token.');
  }
  return { accessToken: payload.access_token, expiresIn: Number(payload.expires_in || 3600) };
}

async function getAccessToken() {
  if (tokenCache.accessToken && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.accessToken;

  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  const token = serviceAccountJson
    ? await serviceAccountAccessToken(serviceAccountJson)
    : await refreshTokenAccessToken();

  tokenCache = {
    accessToken: token.accessToken,
    expiresAt: Date.now() + Math.max(60, token.expiresIn - 60) * 1000,
  };
  return token.accessToken;
}

async function googleRequest(accessToken, url, options = {}) {
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      method: options.method || (options.body === undefined ? 'GET' : 'POST'),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (response.status === 429 || response.status >= 500) {
      lastError = `Google API temporarily unavailable (${response.status}).`;
      await sleep((attempt + 1) * 1500);
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      let payload = {};
      try { payload = JSON.parse(text); } catch { payload = { error: { message: text } }; }
      throw new Error(payload?.error?.message || `Google Search Console API error ${response.status}`);
    }

    if (response.status === 204) return {};
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  throw new Error(lastError || 'Google Search Console API failed after retries.');
}

function dateRange(days) {
  const safeDays = Math.min(Math.max(Number(days) || 28, 1), 480);
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - safeDays + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function validIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function resolveRange(body) {
  if (body.customStart || body.customEnd) {
    if (!validIsoDate(body.customStart) || !validIsoDate(body.customEnd)) {
      throw new Error('customStart and customEnd must both use YYYY-MM-DD format.');
    }
    if (body.customStart > body.customEnd) throw new Error('customStart must be before or equal to customEnd.');
    return { startDate: body.customStart, endDate: body.customEnd };
  }
  return dateRange(body.days);
}

function periodDays(range) {
  return Math.round((Date.parse(`${range.endDate}T00:00:00Z`) - Date.parse(`${range.startDate}T00:00:00Z`)) / 86400000) + 1;
}

function previousPeriod(range) {
  const days = periodDays(range);
  const previousEnd = new Date(`${range.startDate}T00:00:00Z`);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  return {
    startDate: previousStart.toISOString().slice(0, 10),
    endDate: previousEnd.toISOString().slice(0, 10),
  };
}

function safeDimensions(value) {
  const dimensions = Array.isArray(value) && value.length ? value : ['date'];
  if (dimensions.length > 5 || dimensions.some(item => !VALID_DIMENSIONS.has(item))) {
    throw new Error('One or more Search Console dimensions are invalid.');
  }
  return dimensions;
}

function safeLimit(value, fallback = 25) {
  return Math.min(Math.max(Number(value) || fallback, 1), 25000);
}

function safeStartRow(value) {
  return Math.max(Number(value) || 0, 0);
}

function siteUrl() {
  return Deno.env.get('GSC_SITE_URL') || DEFAULT_SITE_URL;
}

function analyticsUrl(site, path) {
  return `${SEARCH_ANALYTICS_BASE}/sites/${encodeURIComponent(site)}${path}`;
}

function validateSiteResourceUrl(value, fieldName) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error(`${fieldName} must be a valid HTTPS URL.`); }
  if (parsed.protocol !== 'https:') throw new Error(`${fieldName} must use HTTPS.`);
  const host = parsed.hostname.toLowerCase();
  if (host !== 'creativebooks.co.za' && !host.endsWith('.creativebooks.co.za')) {
    throw new Error(`${fieldName} must belong to creativebooks.co.za.`);
  }
  return parsed.toString();
}

function cacheKey(body) {
  return `gsc:${JSON.stringify({
    action: body.action,
    days: Number(body.days) || 28,
    dimensions: body.dimensions || null,
    rowLimit: Number(body.rowLimit) || null,
    startRow: Number(body.startRow) || 0,
    customStart: body.customStart || null,
    customEnd: body.customEnd || null,
    query: body.query || null,
    page: body.page || null,
    url: body.url || null,
  })}`;
}

function cacheTtlForAction(action) {
  if (action === 'inspectUrl') return INSPECTION_CACHE_TTL_MS;
  if (action === 'sitemaps') return SHORT_CACHE_TTL_MS;
  return DEFAULT_CACHE_TTL_MS;
}

async function readCache(admin, key) {
  const { data, error } = await admin
    .from('gsc_cache')
    .select('payload, expires_at')
    .eq('cache_key', key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (Date.parse(data.expires_at) <= Date.now()) {
    await admin.from('gsc_cache').delete().eq('cache_key', key);
    return null;
  }
  return data.payload;
}

async function writeCache(admin, key, payload, ttlMs) {
  const { error } = await admin.from('gsc_cache').upsert({
    cache_key: key,
    payload,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + ttlMs).toISOString(),
  }, { onConflict: 'cache_key' });
  if (error) throw error;
}

async function queryAnalytics(accessToken, site, body) {
  return googleRequest(accessToken, analyticsUrl(site, '/searchAnalytics/query'), { body });
}

async function executeAction(admin, accessToken, site, body) {
  const action = body.action;
  const rowLimit = safeLimit(body.rowLimit);
  const startRow = safeStartRow(body.startRow);
  const range = ['sitemaps', 'submitSitemap', 'inspectUrl'].includes(action) ? null : resolveRange(body);

  if (action === 'performance') {
    const dimensions = safeDimensions(body.dimensions);
    const data = await queryAnalytics(accessToken, site, {
      ...range,
      dimensions,
      rowLimit,
      startRow,
      dataState: 'all',
    });
    return { rows: data.rows || [], responseAggregationType: data.responseAggregationType, lastDate: range.endDate };
  }

  if (action === 'performance_compare') {
    const dimensions = safeDimensions(body.dimensions);
    const previous = previousPeriod(range);
    const [currentData, previousData] = await Promise.all([
      queryAnalytics(accessToken, site, { ...range, dimensions, rowLimit, startRow, dataState: 'all' }),
      queryAnalytics(accessToken, site, { ...previous, dimensions, rowLimit, startRow, dataState: 'all' }),
    ]);
    return {
      current: { rows: currentData.rows || [], lastDate: range.endDate },
      previous: { rows: previousData.rows || [], lastDate: previous.endDate },
      previousPeriod: previous,
      currentPeriod: range,
    };
  }

  if (action === 'top_queries' || action === 'top_pages') {
    const dimension = action === 'top_queries' ? 'query' : 'page';
    const data = await queryAnalytics(accessToken, site, {
      ...range,
      dimensions: [dimension],
      rowLimit: safeLimit(body.rowLimit, 10),
      startRow,
      dataState: 'all',
    });
    return { rows: data.rows || [], lastDate: range.endDate, currentPeriod: range };
  }

  if (action === 'query_pages') {
    if (!body.query || typeof body.query !== 'string') throw new Error('query is required.');
    const data = await queryAnalytics(accessToken, site, {
      ...range,
      dimensions: ['page'],
      dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'equals', expression: body.query }] }],
      rowLimit: 10,
      dataState: 'all',
    });
    return { rows: data.rows || [], lastDate: range.endDate };
  }

  if (action === 'page_queries') {
    if (!body.page || typeof body.page !== 'string') throw new Error('page is required.');
    const page = validateSiteResourceUrl(body.page, 'page');
    const data = await queryAnalytics(accessToken, site, {
      ...range,
      dimensions: ['query'],
      dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: page }] }],
      rowLimit: 20,
      dataState: 'all',
    });
    return { rows: data.rows || [], lastDate: range.endDate };
  }

  if (['countries', 'devices', 'search_appearance'].includes(action)) {
    const config = {
      countries: ['country', 50],
      devices: ['device', 10],
      search_appearance: ['searchAppearance', 20],
    }[action];
    const data = await queryAnalytics(accessToken, site, {
      ...range,
      dimensions: [config[0]],
      rowLimit: config[1],
      dataState: 'all',
    });
    return { rows: data.rows || [], lastDate: range.endDate };
  }

  if (action === 'sitemaps') {
    const data = await googleRequest(accessToken, analyticsUrl(site, '/sitemaps'));
    return { sitemaps: data.sitemap || [] };
  }

  if (action === 'submitSitemap') {
    const sitemapUrl = validateSiteResourceUrl(body.sitemapUrl, 'sitemapUrl');
    await googleRequest(
      accessToken,
      analyticsUrl(site, `/sitemaps/${encodeURIComponent(sitemapUrl)}`),
      { method: 'PUT' },
    );
    const { error } = await admin.from('gsc_cache').delete().like('cache_key', 'gsc:%');
    if (error) throw error;
    return { success: true, sitemapUrl };
  }

  if (action === 'inspectUrl') {
    const inspectionUrl = validateSiteResourceUrl(body.url, 'url');
    const data = await googleRequest(accessToken, URL_INSPECTION_ENDPOINT, {
      body: { inspectionUrl, siteUrl: site },
    });
    return { result: data.inspectionResult || null };
  }

  if (action === 'smart_insights') {
    const previous = previousPeriod(range);
    const [queries, previousQueries] = await Promise.all([
      queryAnalytics(accessToken, site, {
        ...range,
        dimensions: ['query', 'page'],
        rowLimit: 500,
        dataState: 'all',
      }),
      queryAnalytics(accessToken, site, {
        ...previous,
        dimensions: ['query'],
        rowLimit: 500,
        dataState: 'all',
      }),
    ]);

    const rows = queries.rows || [];
    const previousRows = previousQueries.rows || [];
    const previousMap = new Map(previousRows.map(row => [row.keys[0], row]));

    const quickWins = rows
      .filter(row => row.position >= 11 && row.position <= 20 && row.impressions >= 100)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)
      .map(row => ({
        query: row.keys[0],
        page: row.keys[1],
        position: row.position,
        impressions: row.impressions,
        clicks: row.clicks,
        estimatedExtraClicks: Math.max(0, Math.round(row.impressions * 0.065 - row.clicks)),
      }));

    const highImpLowCtr = rows
      .filter(row => row.impressions >= 500 && row.ctr < 0.01)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)
      .map(row => ({
        query: row.keys[0],
        page: row.keys[1],
        impressions: row.impressions,
        ctr: row.ctr,
        clicks: row.clicks,
      }));

    const risingQueries = rows
      .filter(row => {
        const previousRow = previousMap.get(row.keys[0]);
        return previousRow && previousRow.clicks > 0 && row.clicks / previousRow.clicks >= 1.5;
      })
      .sort((a, b) => {
        const previousA = previousMap.get(a.keys[0]);
        const previousB = previousMap.get(b.keys[0]);
        return (b.clicks / previousB.clicks) - (a.clicks / previousA.clicks);
      })
      .slice(0, 10)
      .map(row => {
        const previousRow = previousMap.get(row.keys[0]);
        return {
          query: row.keys[0],
          clicks: row.clicks,
          prevClicks: previousRow.clicks,
          pctChange: Math.round((row.clicks / previousRow.clicks - 1) * 100),
        };
      });

    return { quickWins, highImpLowCtr, risingQueries, lastDate: range.endDate };
  }

  throw new Error('Unknown action.');
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Supabase service environment is not configured.' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const authorization = request.headers.get('authorization') || '';
    const bearer = authorization.replace(/^Bearer\s+/i, '');
    if (!bearer) return json({ error: 'Unauthorized' }, 401);

    const { data: userData, error: userError } = await admin.auth.getUser(bearer);
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (profileError || !['super_admin', 'admin'].includes(profile?.role)) {
      return json({ error: 'Admin access required' }, 403);
    }

    const body = await request.json().catch(() => ({}));
    if (!body.action || typeof body.action !== 'string') return json({ error: 'action is required' }, 400);

    const bypassCache = Boolean(body.forceRefresh) || body.action === 'submitSitemap';
    const key = cacheKey(body);

    if (!bypassCache) {
      const cached = await readCache(admin, key);
      if (cached) return json({ ...cached, fromCache: true });
    }

    const accessToken = await getAccessToken();
    const result = await executeAction(admin, accessToken, siteUrl(), body);

    if (body.action !== 'submitSitemap') {
      await writeCache(admin, key, result, cacheTtlForAction(body.action));
    }

    return json(result);
  } catch (error) {
    console.error('search-console-data error:', error?.message || error);
    const message = error?.message || 'Unexpected Search Console error.';
    const status = message === 'Unknown action.' || message.includes('required') || message.includes('must') ? 400 : 500;
    return json({ error: message }, status);
  }
});
