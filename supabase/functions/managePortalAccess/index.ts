import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('managePortalAccess', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { project_id, contact_id, action, custom_token, allowed_sections } = await req.json();

    if (!project_id || !contact_id || !action) {
      return Response.json({ error: 'Missing required fields: project_id, contact_id, action' }, { status: 400 });
    }

    // Validate project and contact exist
    const projects = await platform.entities.Project.filter({ id: project_id });
    const contacts = await platform.entities.Contact.filter({ id: contact_id });

    if (!projects.length || !contacts.length) {
      return Response.json({ error: 'Project or Contact not found' }, { status: 404 });
    }

    const generateToken = () => {
      if (custom_token) return custom_token.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      return `portal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    };

    if (action === 'generate') {
      // Check if portal already exists
      const existing = await platform.entities.ClientPortalAccess.filter({ project_id });
      if (existing.length) {
        return Response.json({ error: 'Portal already exists for this project' }, { status: 400 });
      }

      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

      const portal = await platform.entities.ClientPortalAccess.create({
        contact_id,
        project_id,
        access_token: token,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        allowed_sections: allowed_sections || ['quotes', 'invoices', 'projects', 'documents'],
        access_count: 0,
      });

      return Response.json({
        success: true,
        portal_id: portal.id,
        portal_url: `${new URL(req.url).origin}/portal/${token}`,
        access_token: token,
      });
    }

    if (action === 'activate' || action === 'deactivate') {
      const portals = await platform.entities.ClientPortalAccess.filter({ project_id });
      if (!portals.length) {
        return Response.json({ error: 'Portal not found' }, { status: 404 });
      }

      await platform.entities.ClientPortalAccess.update(portals[0].id, {
        is_active: action === 'activate',
      });

      return Response.json({ success: true, is_active: action === 'activate' });
    }

    if (action === 'regenerate') {
      const portals = await platform.entities.ClientPortalAccess.filter({ project_id });
      if (!portals.length) {
        return Response.json({ error: 'Portal not found' }, { status: 404 });
      }

      const newToken = generateToken();
      await platform.entities.ClientPortalAccess.update(portals[0].id, {
        access_token: newToken,
      });

      return Response.json({
        success: true,
        portal_url: `${new URL(req.url).origin}/portal/${newToken}`,
        access_token: newToken,
      });
    }

    if (action === 'update_sections') {
      const portals = await platform.entities.ClientPortalAccess.filter({ project_id });
      if (!portals.length) {
        return Response.json({ error: 'Portal not found' }, { status: 404 });
      }

      await platform.entities.ClientPortalAccess.update(portals[0].id, {
        allowed_sections,
      });

      return Response.json({ success: true, allowed_sections });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('managePortalAccess error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});