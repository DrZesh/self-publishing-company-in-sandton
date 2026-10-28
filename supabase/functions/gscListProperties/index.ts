import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('gscListProperties', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken, connectionConfig } = await platform.asServiceRole.connectors.getConnection('google_search_console');

    // List all properties this account has access to
    const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const data = await res.json();

    // Also get the connected email from tokeninfo
    const tokenRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
    const tokenData = await tokenRes.json();

    return Response.json({
      connectedEmail: tokenData.email,
      properties: data.siteEntry || [],
      rawResponse: data,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});