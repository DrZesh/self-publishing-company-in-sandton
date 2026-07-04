import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ADMIN_BASE = 'https://analyticsadmin.googleapis.com/v1beta';
const DATA_BASE = 'https://analyticsdata.googleapis.com/v1beta';
const ANALYTICS_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const REPORT_CACHE_TTL_MS = 60 * 60 * 1000;
const PROPERTY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REALTIME_CACHE_TTL_MS = 20 * 1000;

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
    scope: ANALYTICS_SCOPE,
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
    throw new Error(payload.error_description || payload.error || 'Unable to obtain Google Analytics service-account access token.');
  }

  return { accessToken: payload.access_token, expiresIn: Number(payload.expires_in || 3600) };
}

async function refreshTokenAccessToken() {
  const clientId = Deno.env.get('GA_CLIENT_ID');
  const clientSecret = Deno.env.get('GA_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GA_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Analytics credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GA_CLIENT_ID, GA_CLIENT_SECRET and GA_REFRESH_TOKEN.');
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
    throw new Error(payload.error_description || payload.error || 'Unable to refresh Google Analytics access token.');
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
      lastError = `Google Analytics API temporarily unavailable (${response.status}).`;
      await sleep((attempt + 1) * 1500);
      continue;
    }

    const text = await response.text();
    let payload = {};
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = { error: { message: text } }; }
    }

    if (!response.ok) {
      throw new Error(payload?.error?.message || `Google Analytics API error ${response.status}`);
    }

    return payload;
  }

  throw new Error(lastError || 'Google Analytics API failed after retries.');
}

function propertyResource(propertyId) {
  const value = String(propertyId || '').trim();
  if (!/^\d+$/.test(value)) throw new Error('propertyId must be a numeric Google Analytics property ID.');
  return `properties/${value}`;
}

function cacheKey(body) {
  return `ga:${JSON.stringify({
    action: body.action || 'list_properties',
    propertyId: body.propertyId || null,
  })}`;
}

function cacheTtl(action) {
  if (action === 'realtime') return REALTIME_CACHE_TTL_MS;
  if (action === 'list_properties') return PROPERTY_CACHE_TTL_MS;
  return REPORT_CACHE_TTL_MS;
}

async function readCache(admin, key) {
  const { data, error } = await admin
    .from('ga_cache')
    .select('payload, expires_at')
    .eq('cache_key', key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  if (Date.parse(data.expires_at) <= Date.now()) {
    await admin.from('ga_cache').delete().eq('cache_key', key);
    return null;
  }

  return data.payload;
}

async function writeCache(admin, key, payload, ttlMs) {
  const { error } = await admin.from('ga_cache').upsert({
    cache_key: key,
    payload,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + ttlMs).toISOString(),
  }, { onConflict: 'cache_key' });
  if (error) throw error;
}

async function paginatedList(accessToken, initialUrl, arrayField) {
  const rows = [];
  let pageToken = null;

  do {
    const url = new URL(initialUrl);
    url.searchParams.set('pageSize', '200');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const payload = await googleRequest(accessToken, url.toString());
    rows.push(...(payload[arrayField] || []));
    pageToken = payload.nextPageToken || null;
  } while (pageToken);

  return rows;
}

async function listProperties(accessToken) {
  const accounts = await paginatedList(accessToken, `${ADMIN_BASE}/accounts`, 'accounts');
  const propertyLists = await Promise.all(accounts.map(async account => {
    const url = new URL(`${ADMIN_BASE}/properties`);
    url.searchParams.set('filter', `parent:${account.name}`);
    return paginatedList(accessToken, url.toString(), 'properties');
  }));

  return { properties: propertyLists.flat(), accounts };
}

async function runReport(accessToken, propertyId, requestBody) {
  const property = propertyResource(propertyId);
  return googleRequest(accessToken, `${DATA_BASE}/${property}:runReport`, { body: requestBody });
}

async function runRealtimeReport(accessToken, propertyId, requestBody) {
  const property = propertyResource(propertyId);
  return googleRequest(accessToken, `${DATA_BASE}/${property}:runRealtimeReport`, { body: requestBody });
}

async function executeAction(accessToken, body) {
  const action = body.action || 'list_properties';

  if (action === 'list_properties') {
    return listProperties(accessToken);
  }

  if (action === 'realtime') {
    return runRealtimeReport(accessToken, body.propertyId, {
      dimensions: [{ name: 'country' }, { name: 'unifiedScreenName' }],
      metrics: [{ name: 'activeUsers' }],
    });
  }

  if (action === 'report') {
    return runReport(accessToken, body.propertyId, {
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
    });
  }

  if (action === 'top_pages') {
    return runReport(accessToken, body.propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: '10',
    });
  }

  if (action === 'sources') {
    return runReport(accessToken, body.propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });
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
    const action = body.action || 'list_properties';
    const key = cacheKey({ ...body, action });

    if (!body.forceRefresh) {
      const cached = await readCache(admin, key);
      if (cached) return json({ ...cached, fromCache: true });
    }

    const accessToken = await getAccessToken();
    const result = await executeAction(accessToken, { ...body, action });
    await writeCache(admin, key, result, cacheTtl(action));

    return json(result);
  } catch (error) {
    console.error('analytics-data error:', error?.message || error);
    const message = error?.message || 'Unexpected Google Analytics error.';
    const status = message === 'Unknown action.' || message.includes('must be') ? 400 : 500;
    return json({ error: message }, status);
  }
});
