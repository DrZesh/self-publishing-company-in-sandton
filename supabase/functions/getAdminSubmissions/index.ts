import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('getAdminSubmissions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { status, search, limit = 50, skip = 0 } = body;

    let query = {};

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const submissions = await platform.asServiceRole.entities.Submission.filter(query, '-created_date', limit, skip);
    const total = await platform.asServiceRole.entities.Submission.filter(query, null, 1000);

    return Response.json({
      submissions: submissions.map(s => ({
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone,
        form_type: s.form_type,
        status: s.status,
        created_date: s.created_date,
        message: s.message ? s.message.substring(0, 100) : ''
      })),
      total: total.length,
      limit,
      skip
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});