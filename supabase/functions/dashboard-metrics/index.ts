import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1);
}

function dateRangeStart(range: string) {
  if (range === 'today') return startOfDay();
  if (range === 'week') return startOfWeek();
  if (range === 'year') return startOfYear();
  return startOfMonth();
}

function monthKey(dateValue: string | null | undefined) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-ZA', { month: 'short' });
}

function daysBetween(from: string | null | undefined, to = new Date()) {
  if (!from) return 0;
  const start = new Date(from).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((to.getTime() - start) / 86400000));
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
    const range = ['today', 'week', 'month', 'year'].includes(body.dateRange) ? body.dateRange : 'month';
    const rangeStart = dateRangeStart(range);
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayKey = now.toISOString().slice(0, 10);

    const queries = await Promise.all([
      admin.from('submissions').select('*').order('created_date', { ascending: false }).limit(1000),
      admin.from('leads').select('*').order('created_date', { ascending: false }).limit(1000),
      admin.from('contacts').select('id, full_name, email, last_contact_date').limit(2000),
      admin.from('quotes').select('*').order('created_date', { ascending: false }).limit(1000),
      admin.from('payments').select('*').eq('status', 'Confirmed').order('payment_date', { ascending: false }).limit(2000),
      admin.from('invoices').select('id, status, due_date, balance_due').limit(2000),
      admin.from('projects').select('*').order('created_date', { ascending: false }).limit(1000),
      admin.from('documents').select('id, category, status').limit(2000),
      admin.from('e_signature_requests').select('id, status').limit(2000),
      admin.from('tasks').select('*').order('due_date', { ascending: true }).limit(1000),
      admin.from('activity_logs').select('*').order('created_date', { ascending: false }).limit(100),
    ]);

    const firstError = queries.map(result => result.error).find(Boolean);
    if (firstError) throw firstError;

    const [
      submissions,
      leads,
      contacts,
      quotes,
      payments,
      invoices,
      projects,
      documents,
      signatures,
      tasks,
      activityLogs,
    ] = queries.map(result => result.data || []);

    const contactById = new Map(contacts.map(contact => [contact.id, contact]));
    const rangeIso = rangeStart.toISOString();
    const currentMonthIso = currentMonthStart.toISOString();
    const previousMonthIso = previousMonthStart.toISOString();
    const previousMonthEndIso = previousMonthEnd.toISOString();

    const monthSubmissions = submissions.filter(item => item.created_date >= currentMonthIso);
    const previousMonthSubmissions = submissions.filter(item => item.created_date >= previousMonthIso && item.created_date < previousMonthEndIso);
    const monthLeads = leads.filter(item => item.created_date >= currentMonthIso);
    const previousMonthLeads = leads.filter(item => item.created_date >= previousMonthIso && item.created_date < previousMonthEndIso);
    const rangeQuotes = quotes.filter(item => item.created_date >= rangeIso);

    const revenueThisMonth = payments
      .filter(payment => (payment.payment_date || payment.created_date || '') >= currentMonthIso.slice(0, 10))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const revenueLastMonth = payments
      .filter(payment => {
        const value = payment.payment_date || payment.created_date || '';
        return value >= previousMonthIso.slice(0, 10) && value < previousMonthEndIso.slice(0, 10);
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const openLeadStages = new Set(['new', 'contacted', 'qualified', 'quoted', 'negotiating']);
    const openLeads = leads.filter(lead => openLeadStages.has(lead.stage));
    const acceptedRangeQuotes = rangeQuotes.filter(quote => quote.status === 'Accepted');

    const serviceCount: Record<string, number> = {};
    monthSubmissions.forEach(submission => {
      const services = Array.isArray(submission.service_interest) ? submission.service_interest : [];
      services.forEach(service => {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      });
    });
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const respondedSubmissions = submissions.filter(item =>
      item.created_date >= currentMonthIso &&
      item.status !== 'new' &&
      item.updated_date &&
      item.created_date
    );
    const avgResponseHours = respondedSubmissions.length
      ? respondedSubmissions.reduce((sum, item) => {
          const diff = new Date(item.updated_date).getTime() - new Date(item.created_date).getTime();
          return sum + Math.max(0, diff / 3600000);
        }, 0) / respondedSubmissions.length
      : null;

    const docsAwaitingSignature = documents.filter(doc => doc.status === 'Awaiting Signature').length +
      signatures.filter(item => ['Sent', 'Delivered', 'Opened', 'Viewed', 'Signing Started', 'Admin Signed'].includes(item.status)).length;

    const metrics = {
      new_leads_today: leads.filter(lead => String(lead.created_date || '').slice(0, 10) === todayKey).length,
      unsigned_contracts: signatures.filter(item => ['Prepared', 'Admin Fields Completed', 'Admin Signed', 'Sent', 'Delivered', 'Opened', 'Viewed', 'Signing Started'].includes(item.status)).length,
      docs_awaiting_signature: docsAwaitingSignature,
      proofs_pending: documents.filter(doc => doc.category === 'Proof Approval' && !['Approved', 'Rejected', 'Archived'].includes(doc.status)).length,
      ready_for_collection: projects.filter(project => project.stage === 'Ready for Collection').length,
      tasks_due_today: tasks.filter(task => task.status === 'Pending' && String(task.due_date || '').slice(0, 10) === todayKey).length,
      overdue_invoices: invoices.filter(invoice =>
        !['Paid', 'Cancelled'].includes(invoice.status) &&
        ((invoice.due_date && invoice.due_date < todayKey) || invoice.status === 'Overdue')
      ).length,
      active_projects: projects.filter(project => !['Delivered', 'Completed'].includes(project.stage)).length,
      revenueThisMonth,
      revenueLastMonth,
      totalPipelineValue: openLeads.reduce((sum, lead) => sum + Number(lead.estimated_value || 0), 0),
      openLeadsCount: openLeads.length,
      acceptedQuoteValue: acceptedRangeQuotes.reduce((sum, quote) => sum + Number(quote.total || 0), 0),
      acceptedQuotes: acceptedRangeQuotes.length,
      topService,
      monthLeads: monthLeads.length,
      lastMonthLeads: previousMonthLeads.length,
      monthSubmissions: monthSubmissions.length,
      lastMonthSubmissions: previousMonthSubmissions.length,
      convertedLeadsThisMonth: leads.filter(lead => lead.stage === 'won' && lead.stage_changed_at >= currentMonthIso).length,
      lostLeadsThisMonth: leads.filter(lead => lead.stage === 'lost' && lead.stage_changed_at >= currentMonthIso).length,
      avgResponseHours,
      pendingQuotes: rangeQuotes.filter(quote => quote.status === 'Draft').length,
      sentQuotes: rangeQuotes.filter(quote => ['Sent', 'Opened', 'Viewed'].includes(quote.status)).length,
      expiredQuotes: rangeQuotes.filter(quote => quote.status === 'Expired').length,
      declinedQuotes: rangeQuotes.filter(quote => quote.status === 'Declined').length,
      quoteConversionRate: rangeQuotes.length ? Math.round((acceptedRangeQuotes.length / rangeQuotes.length) * 100) : 0,
      serviceCount,
    };

    const stages = ['new', 'contacted', 'qualified', 'quoted', 'negotiating'];
    const byStage: Record<string, { count: number; estimatedValue: number }> = {};
    const avgTimeInStage: Record<string, number> = {};
    stages.forEach(stage => {
      const stageLeads = leads.filter(lead => lead.stage === stage);
      byStage[stage] = {
        count: stageLeads.length,
        estimatedValue: stageLeads.reduce((sum, lead) => sum + Number(lead.estimated_value || 0), 0),
      };
      avgTimeInStage[stage] = stageLeads.length
        ? Math.round(stageLeads.reduce((sum, lead) => sum + daysBetween(lead.stage_changed_at || lead.updated_date || lead.created_date), 0) / stageLeads.length)
        : 0;
    });

    const lossReasons: Record<string, number> = {};
    leads.filter(lead => lead.stage === 'lost').forEach(lead => {
      const key = lead.lost_reason || 'other';
      lossReasons[key] = (lossReasons[key] || 0) + 1;
    });

    const pipeline = {
      byStage,
      avgTimeInStage,
      lossReasons,
      attentionFlags: {
        quotedOldCount: leads.filter(lead => lead.stage === 'quoted' && daysBetween(lead.stage_changed_at || lead.updated_date) > 7).length,
        noOwnerCount: openLeads.filter(lead => !lead.owner_id).length,
      },
    };

    const monthlyTrend = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend.push({
        month: monthLabel(monthDate),
        submissions: submissions.filter(item => monthKey(item.created_date) === key).length,
        leads: leads.filter(item => monthKey(item.created_date) === key).length,
        revenue: payments.filter(item => monthKey(item.payment_date || item.created_date) === key).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      });
    }

    const recentActivity = [
      ...submissions.slice(0, 8).map(item => ({
        type: 'submission',
        label: `New enquiry from ${item.full_name}`,
        sub: item.email,
        date: item.created_date,
      })),
      ...leads.filter(item => item.stage === 'won').slice(0, 5).map(item => ({
        type: 'won',
        label: `${contactById.get(item.contact_id)?.full_name || 'Lead'} moved to Won`,
        sub: `R${Number(item.estimated_value || 0).toLocaleString('en-ZA')}`,
        date: item.stage_changed_at || item.updated_date,
      })),
      ...payments.slice(0, 8).map(item => ({
        type: 'payment',
        label: `Payment received: R${Number(item.amount || 0).toLocaleString('en-ZA')}`,
        sub: item.reference || item.payment_method,
        date: item.payment_date || item.created_date,
      })),
      ...activityLogs.slice(0, 8).map(item => ({
        type: 'pipeline',
        label: item.description || item.action,
        sub: item.entity_type,
        date: item.created_date,
      })),
    ]
      .filter(item => item.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    const followUps = openLeads
      .map(lead => {
        const contact = contactById.get(lead.contact_id);
        if (!contact) return null;
        const date = lead.stage_changed_at || lead.updated_date || lead.created_date;
        const daysAgo = daysBetween(date);
        let reason = '';
        if (lead.stage === 'new' && daysAgo >= 1) reason = 'New lead awaiting first response';
        else if (lead.stage === 'contacted' && daysAgo >= 3) reason = 'Contacted lead needs follow-up';
        else if (lead.stage === 'quoted' && daysAgo >= 5) reason = 'Quote follow-up due';
        else if (lead.stage === 'negotiating' && daysAgo >= 3) reason = 'Negotiation follow-up due';
        if (!reason) return null;
        return {
          contact: contact.full_name,
          email: contact.email,
          reason,
          daysAgo,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.daysAgo - a.daysAgo)
      .slice(0, 12);

    const leadsForCopilot = leads.slice(0, 300).map(lead => ({
      ...lead,
      contact_name: contactById.get(lead.contact_id)?.full_name || null,
    }));

    return json({
      metrics,
      pipeline,
      activity: recentActivity,
      followUps,
      monthlyTrend,
      leads: leadsForCopilot,
      quotes: quotes.slice(0, 300),
      submissions: submissions.slice(0, 300),
    });
  } catch (error) {
    return json({ error: (error as Error).message || 'Unexpected error' }, 500);
  }
});
