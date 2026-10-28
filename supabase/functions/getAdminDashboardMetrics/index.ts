import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('getAdminDashboardMetrics', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Standard users have restricted access
    const isSuperUser = user.role === 'admin' || user.role === 'super_user';

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    // Fetch all data in parallel
    // Standard users only see their assigned records
    const [submissions, leads, contacts, notes, quotes] = await Promise.all([
      platform.asServiceRole.entities.Submission.list(),
      platform.asServiceRole.entities.Lead.list(),
      platform.asServiceRole.entities.Contact.list(),
      platform.asServiceRole.entities.Note.list(),
      platform.asServiceRole.entities.Quote.list(),
    ]);

    // Filter data for Standard users (only show their assigned records)
    let filteredLeads = leads;
    let filteredQuotes = quotes;
    let filteredContacts = contacts;
    
    if (!isSuperUser) {
      // Standard users only see records assigned to them or created by them
      filteredLeads = leads.filter(l => l.assigned_user_id === user.id || l.created_by_id === user.id);
      filteredQuotes = quotes.filter(q => q.created_by_id === user.id);
      filteredContacts = contacts.filter(c => c.created_by_id === user.id);
    }

    // --- SUBMISSIONS ---
    const todaySubmissions = submissions.filter(s => new Date(s.created_date) >= startOfToday);
    const yesterdaySubmissions = submissions.filter(s => {
      const d = new Date(s.created_date);
      return d >= startOfYesterday && d < startOfToday;
    });
    const monthSubmissions = submissions.filter(s => new Date(s.created_date) >= startOfMonth);
    const lastMonthSubmissions = submissions.filter(s => {
      const d = new Date(s.created_date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });
    const newSubmissions = submissions.filter(s => s.status === 'new').length;

    // --- LEADS ---
    const openStages = ['new', 'contacted', 'qualified', 'quoted', 'negotiating'];
    const openLeads = filteredLeads.filter(l => openStages.includes(l.stage));
    const wonLeads = filteredLeads.filter(l => l.stage === 'won');
    const lostLeads = filteredLeads.filter(l => l.stage === 'lost');
    const monthLeads = filteredLeads.filter(l => new Date(l.created_date) >= startOfMonth);
    const lastMonthLeads = filteredLeads.filter(l => {
      const d = new Date(l.created_date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });
    const convertedLeads = wonLeads.filter(l => new Date(l.stage_changed_at || l.updated_date) >= startOfMonth);
    const lostThisMonth = lostLeads.filter(l => new Date(l.stage_changed_at || l.updated_date) >= startOfMonth);

    // Pipeline by stage
    const pipelineByStage = {};
    openStages.forEach(stage => {
      const stageLeads = filteredLeads.filter(l => l.stage === stage);
      pipelineByStage[stage] = {
        count: stageLeads.length,
        weightedValue: stageLeads.reduce((s, l) => s + (l.weighted_value || 0), 0),
        estimatedValue: stageLeads.reduce((s, l) => s + (l.estimated_value || 0), 0),
      };
    });

    const totalPipelineValue = openLeads.reduce((s, l) => s + (l.weighted_value || 0), 0);
    const wonThisMonth = wonLeads.filter(l => new Date(l.stage_changed_at || l.updated_date) >= startOfMonth);
    const revenueThisMonth = wonThisMonth.reduce((s, l) => s + (l.estimated_value || 0), 0);
    const wonLastMonth = wonLeads.filter(l => {
      const d = new Date(l.stage_changed_at || l.updated_date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });
    const revenueLastMonth = wonLastMonth.reduce((s, l) => s + (l.estimated_value || 0), 0);

    // Loss reasons
    const lossReasons = {};
    lostLeads.forEach(l => {
      if (l.lost_reason) lossReasons[l.lost_reason] = (lossReasons[l.lost_reason] || 0) + 1;
    });

    // Avg time in stage (days)
    const avgTimeInStage = {};
    openStages.forEach(stage => {
      const stageLeads = filteredLeads.filter(l => l.stage === stage && l.stage_changed_at);
      if (stageLeads.length) {
        const avgMs = stageLeads.reduce((s, l) => s + (now - new Date(l.stage_changed_at)), 0) / stageLeads.length;
        avgTimeInStage[stage] = Math.round(avgMs / (1000 * 60 * 60 * 24));
      } else {
        avgTimeInStage[stage] = 0;
      }
    });

    // Response time
    const responseTimes = [];
    submissions.slice(0, 50).forEach(sub => {
      const subNotes = notes.filter(n => n.entity_type === 'submission' && n.entity_id === sub.id);
      if (subNotes.length) {
        const firstNote = subNotes.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
        const hours = (new Date(firstNote.created_date) - new Date(sub.created_date)) / (1000 * 60 * 60);
        if (hours >= 0) responseTimes.push(hours);
      }
    });
    const avgResponseHours = responseTimes.length
      ? responseTimes.reduce((s, h) => s + h, 0) / responseTimes.length
      : null;

    // Attention flags
    const quotedOld = filteredLeads.filter(l => {
      if (l.stage !== 'quoted') return false;
      const updated = new Date(l.updated_date || l.created_date);
      return (now - updated) > 7 * 24 * 60 * 60 * 1000;
    });
    const noOwner = filteredLeads.filter(l => openStages.includes(l.stage) && !l.owner_id);

    // --- CONTACTS ---
    const totalContacts = filteredContacts.length;
    const contactsByStage = {};
    ['subscriber', 'lead', 'customer', 'repeat_customer', 'past_customer'].forEach(stage => {
      contactsByStage[stage] = filteredContacts.filter(c => c.lifecycle_stage === stage).length;
    });
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const atRiskContacts = filteredContacts.filter(c =>
      c.lifecycle_stage === 'past_customer' &&
      (!c.last_contact_date || new Date(c.last_contact_date) < sixMonthsAgo)
    ).length;

    // --- QUOTES ---
    const pendingQuotes = filteredQuotes.filter(q => q.status === 'Draft').length;
    const sentQuotes = filteredQuotes.filter(q => ['Sent', 'Delivered', 'Opened', 'Viewed'].includes(q.status)).length;
    const acceptedQuotes = filteredQuotes.filter(q => q.status === 'Accepted').length;
    const declinedQuotes = filteredQuotes.filter(q => q.status === 'Declined').length;
    const expiredQuotes = filteredQuotes.filter(q => q.status === 'Expired').length;
    const monthQuotes = filteredQuotes.filter(q => new Date(q.created_date) >= startOfMonth);
    const monthQuoteValue = monthQuotes.reduce((s, q) => s + (q.total || 0), 0);
    const acceptedQuoteValue = filteredQuotes.filter(q => q.status === 'Accepted').reduce((s, q) => s + (q.total || 0), 0);

    // Quote conversion rate
    const totalQuotesSent = sentQuotes + acceptedQuotes + declinedQuotes + expiredQuotes;
    const quoteConversionRate = totalQuotesSent > 0 ? Math.round((acceptedQuotes / totalQuotesSent) * 100) : 0;

    // --- LEADS BY SERVICE ---
    const serviceCount = {};
    submissions.filter(s => new Date(s.created_date) >= startOfMonth).forEach(s => {
      const services = Array.isArray(s.service_interest) ? s.service_interest : [];
      services.forEach(svc => {
        serviceCount[svc] = (serviceCount[svc] || 0) + 1;
      });
      // Also check message for keywords if service_interest empty
      if (!services.length && s.form_type) {
        serviceCount[s.form_type] = (serviceCount[s.form_type] || 0) + 1;
      }
    });
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // --- MONTHLY TREND (last 6 months) ---
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const mSubs = submissions.filter(s => {
        const d = new Date(s.created_date);
        return d >= mStart && d <= mEnd;
      }).length;
      const mLeads = filteredLeads.filter(l => {
        const d = new Date(l.created_date);
        return d >= mStart && d <= mEnd;
      }).length;
      const mRevenue = wonLeads.filter(l => {
        const d = new Date(l.stage_changed_at || l.updated_date);
        return d >= mStart && d <= mEnd;
      }).reduce((s, l) => s + (l.estimated_value || 0), 0);
      monthlyTrend.push({
        month: mStart.toLocaleString('en-ZA', { month: 'short' }),
        submissions: mSubs,
        leads: mLeads,
        revenue: mRevenue,
      });
    }

    // --- LEAD SOURCES ---
    const leadSources = {};
    submissions.filter(s => new Date(s.created_date) >= startOfMonth).forEach(s => {
      const src = s.marketing_source || 'other';
      leadSources[src] = (leadSources[src] || 0) + 1;
    });

    // --- RECENT ACTIVITY ---
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 8)
      .map(s => ({
        type: 'submission',
        id: s.id,
        label: `New submission from ${s.full_name || 'Unknown'}`,
        sub: s.form_type,
        date: s.created_date,
      }));

    const recentLeadChanges = filteredLeads
      .filter(l => l.updated_date && new Date(l.updated_date) >= new Date(now - 48 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
      .slice(0, 6)
      .map(l => ({
        type: l.stage === 'won' ? 'won' : 'pipeline',
        id: l.id,
        label: l.stage === 'won'
          ? `Lead marked as Won — R${(l.estimated_value || 0).toLocaleString()}`
          : `Lead moved to ${l.stage}`,
        sub: `${(l.estimated_value || 0) > 0 ? 'R' + (l.estimated_value || 0).toLocaleString() : ''}`,
        date: l.updated_date,
      }));

    const recentQuoteActivity = filteredQuotes
      .filter(q => q.updated_date && new Date(q.updated_date) >= new Date(now - 48 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
      .slice(0, 4)
      .map(q => ({
        type: q.status === 'Accepted' ? 'won' : 'quote',
        id: q.id,
        label: `Quote ${q.quote_number || ''} ${q.status.toLowerCase()} — R${(q.total || 0).toLocaleString()}`,
        sub: q.contact_snapshot?.full_name || '',
        date: q.updated_date,
      }));

    const allActivity = [...recentSubmissions, ...recentLeadChanges, ...recentQuoteActivity]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);

    // Suggested follow-ups
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const followUps = submissions
      .filter(s => s.status === 'new' && new Date(s.created_date) < twoDaysAgo)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        reason: 'Unread submission >48h',
        contact: s.full_name,
        email: s.email,
        daysAgo: Math.floor((now - new Date(s.created_date)) / (1000 * 60 * 60 * 24)),
      }));

    // --- AI INSIGHTS ---
    const aiInsights = [];

    // Hot leads needing response
    const newLeads = filteredLeads.filter(l => l.stage === 'new' && new Date(l.created_date) < new Date(now - 24 * 60 * 60 * 1000));
    newLeads.slice(0, 3).forEach(lead => {
      aiInsights.push({
        type: 'Hot',
        title: `New lead: ${lead.contact_id ? 'Contact pending' : 'Unassigned'}`,
        reason: 'Lead created over 24h ago, needs initial contact',
        priority: 'Urgent',
        actionLabel: 'Contact Lead',
        relatedRecord: lead.id,
      });
    });

    // Overdue quotes
    const overdueQuotes = filteredQuotes.filter(q => 
      (q.status === 'Sent' || q.status === 'Viewed') && 
      q.valid_until && 
      new Date(q.valid_until) < now
    );
    overdueQuotes.slice(0, 3).forEach(quote => {
      aiInsights.push({
        type: 'Overdue',
        title: `Quote ${quote.quote_number} expired`,
        reason: `Expired on ${new Date(quote.valid_until).toLocaleDateString()}`,
        priority: 'High',
        actionLabel: 'Follow Up',
        relatedRecord: quote.id,
      });
    });

    // Stalled pipeline
    const stalledLeads = filteredLeads.filter(l => {
      if (!['quoted', 'negotiating'].includes(l.stage)) return false;
      const updated = new Date(l.updated_date || l.created_date);
      return (now - updated) > 10 * 24 * 60 * 60 * 1000;
    });
    stalledLeads.slice(0, 2).forEach(lead => {
      aiInsights.push({
        type: 'Pending',
        title: `Deal stalled in ${lead.stage}`,
        reason: 'No movement in 10+ days',
        priority: 'Medium',
        actionLabel: 'Review Deal',
        relatedRecord: lead.id,
      });
    });

    // Missing information
    const incompleteLeads = filteredLeads.filter(l => {
      const contact = filteredContacts.find(c => c.id === l.contact_id);
      return !contact?.phone || !contact?.email || (l.service_interest && l.service_interest.length === 0);
    }).slice(0, 2);
    incompleteLeads.forEach(lead => {
      aiInsights.push({
        type: 'Missing',
        title: 'Incomplete lead information',
        reason: 'Missing contact details or service interest',
        priority: 'Low',
        actionLabel: 'Update Info',
        relatedRecord: lead.id,
      });
    });

    // High-value opportunities
    const highValueLeads = filteredLeads.filter(l => 
      (l.estimated_value || 0) > 15000 && 
      ['qualified', 'negotiating'].includes(l.stage)
    ).slice(0, 2);
    highValueLeads.forEach(lead => {
      aiInsights.push({
        type: 'Target',
        title: `High-value opportunity: R${(lead.estimated_value || 0).toLocaleString()}`,
        reason: 'Priority follow-up recommended',
        priority: 'High',
        actionLabel: 'Priority Contact',
        relatedRecord: lead.id,
      });
    });

    return Response.json({
      user: { email: user.email, role: user.role, name: user.full_name, isSuperUser },
      metrics: {
        // Submissions
        totalSubmissions: submissions.length,
        todaySubmissions: todaySubmissions.length,
        yesterdaySubmissions: yesterdaySubmissions.length,
        monthSubmissions: monthSubmissions.length,
        lastMonthSubmissions: lastMonthSubmissions.length,
        newSubmissions,
        // Leads (filtered for Standard users)
        totalLeads: filteredLeads.length,
        openLeadsCount: filteredLeads.filter(l => openStages.includes(l.stage)).length,
        monthLeads: filteredLeads.filter(l => new Date(l.created_date) >= startOfMonth).length,
        lastMonthLeads: filteredLeads.filter(l => {
          const d = new Date(l.created_date);
          return d >= startOfLastMonth && d <= endOfLastMonth;
        }).length,
        convertedLeadsThisMonth: filteredLeads.filter(l => l.stage === 'won' && new Date(l.stage_changed_at || l.updated_date) >= startOfMonth).length,
        lostLeadsThisMonth: filteredLeads.filter(l => l.stage === 'lost' && new Date(l.stage_changed_at || l.updated_date) >= startOfMonth).length,
        totalPipelineValue: filteredLeads.filter(l => openStages.includes(l.stage)).reduce((s, l) => s + (l.weighted_value || 0), 0),
        revenueThisMonth: filteredLeads.filter(l => l.stage === 'won' && new Date(l.stage_changed_at || l.updated_date) >= startOfMonth).reduce((s, l) => s + (l.estimated_value || 0), 0),
        revenueLastMonth: filteredLeads.filter(l => {
          const d = new Date(l.stage_changed_at || l.updated_date);
          return d >= startOfLastMonth && d <= endOfLastMonth && l.stage === 'won';
        }).reduce((s, l) => s + (l.estimated_value || 0), 0),
        // Quotes (filtered for Standard users)
        pendingQuotes,
        sentQuotes,
        acceptedQuotes,
        declinedQuotes,
        expiredQuotes,
        monthQuoteValue,
        acceptedQuoteValue,
        quoteConversionRate,
        totalQuotesSent,
        // Services
        topService,
        serviceCount,
        // Response
        avgResponseHours,
        // Contacts (filtered for Standard users)
        totalContacts: filteredContacts.length,
        contactsByStage,
        atRiskContacts,
      },
      pipeline: {
        byStage: pipelineByStage,
        avgTimeInStage,
        lossReasons,
        attentionFlags: {
          quotedOldCount: quotedOld.length,
          noOwnerCount: noOwner.length,
        },
      },
      monthlyTrend,
      leadSources,
      activity: allActivity,
      followUps,
      aiInsights,
      leads: filteredLeads.map(l => ({
        ...l,
        contact_name: filteredContacts.find(c => c.id === l.contact_id)?.full_name,
      })),
      quotes: filteredQuotes,
      submissions,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});