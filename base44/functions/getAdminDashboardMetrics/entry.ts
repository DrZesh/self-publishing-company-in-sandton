import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch submissions for dashboard metrics
    const submissions = await base44.asServiceRole.entities.Submission.list();
    const leads = await base44.asServiceRole.entities.Lead.list();

    // Calculate key metrics
    const totalSubmissions = submissions.length;
    const newSubmissions = submissions.filter(s => s.status === 'new').length;
    const convertedToLead = submissions.filter(s => s.status === 'converted_to_lead').length;

    const totalLeads = leads.length;
    const openLeads = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length;
    const wonLeads = leads.filter(l => l.stage === 'won').length;

    // Calculate pipeline value
    const pipelineValue = leads
      .filter(l => l.stage !== 'lost')
      .reduce((sum, l) => sum + (l.weighted_value || 0), 0);

    // Group submissions by source
    const submissionsBySource = {};
    submissions.forEach(s => {
      const source = s.marketing_source || 'unknown';
      submissionsBySource[source] = (submissionsBySource[source] || 0) + 1;
    });

    // Group submissions by form type
    const submissionsByType = {};
    submissions.forEach(s => {
      const type = s.form_type || 'unknown';
      submissionsByType[type] = (submissionsByType[type] || 0) + 1;
    });

    // Recent submissions (last 10)
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10)
      .map(s => ({
        id: s.id,
        name: s.full_name,
        email: s.email,
        type: s.form_type,
        status: s.status,
        date: s.created_date
      }));

    return Response.json({
      metrics: {
        totalSubmissions,
        newSubmissions,
        convertedToLead,
        totalLeads,
        openLeads,
        wonLeads,
        pipelineValue
      },
      charts: {
        submissionsBySource,
        submissionsByType
      },
      recentSubmissions
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});