import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken, connectionConfig } = await base44.asServiceRole.connectors.getConnection('google_search_console');

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