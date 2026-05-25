import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import RightNowStrip from '@/components/admin/dashboard/RightNowStrip';
import KpiCards from '@/components/admin/dashboard/KpiCards';
import SalesPipeline from '@/components/admin/dashboard/SalesPipeline';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import FollowUps from '@/components/admin/dashboard/FollowUps';
import QuickActions from '@/components/admin/dashboard/QuickActions';
import AuthorInsights from '@/components/admin/dashboard/AuthorInsights';
import SearchConsoleMini from '@/components/admin/dashboard/SearchConsoleMini';
import LeadSourcesChart from '@/components/admin/dashboard/LeadSourcesChart';
import RevenueGoalCard from '@/components/admin/dashboard/RevenueGoalCard';
import MonthlyTrendChart from '@/components/admin/dashboard/MonthlyTrendChart';
import ServiceBreakdownCard from '@/components/admin/dashboard/ServiceBreakdownCard';
import QuoteConversionFunnel from '@/components/admin/dashboard/QuoteConversionFunnel';
import QuoteExpiryAlerts from '@/components/admin/dashboard/QuoteExpiryAlerts';
import ResponseTimeTracker from '@/components/admin/dashboard/ResponseTimeTracker';
import AICopilot from '@/components/admin/dashboard/AICopilot';
import AIInsightsPanel from '@/components/admin/dashboard/AIInsightsPanel';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [user, setUser] = useState(null);
  const refreshTimer = useRef(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [meRes, metricsRes] = await Promise.all([
        base44.auth.me(),
        base44.functions.invoke('getAdminDashboardMetrics', { dateRange }),
      ]);
      setUser(meRes);
      setDashData(metricsRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboard();
    // Refresh KPIs every 60 seconds
    refreshTimer.current = setInterval(fetchDashboard, 60000);
    return () => clearInterval(refreshTimer.current);
  }, [fetchDashboard]);

  const isOwner = user?.role === 'admin';
  const metrics = dashData?.metrics;
  const pipeline = dashData?.pipeline;
  const activity = dashData?.activity;
  const followUps = dashData?.followUps;
  const leadSources = dashData?.leadSources;
  const monthlyTrend = dashData?.monthlyTrend;

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Section 1 — Header */}
        <DashboardHeader
          userName={user?.full_name || user?.email}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Section 2 — Right Now Strip */}
        <RightNowStrip metrics={metrics} loading={loading} />

        {/* Section 3 — KPI Cards */}
        <KpiCards metrics={metrics} isOwner={isOwner} loading={loading} />

        {/* Revenue Goal Banner — owner only */}
        {isOwner && <RevenueGoalCard metrics={metrics} loading={loading} />}

        {/* Section 4 — Sales Pipeline */}
        <SalesPipeline pipeline={pipeline} loading={loading} />

        {/* Monthly Trend + Service Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrendChart monthlyTrend={monthlyTrend} loading={loading} />
          <ServiceBreakdownCard metrics={metrics} loading={loading} />
        </div>

        {/* Lead Sources + Author Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadSourcesChart leadSources={leadSources} loading={loading} />
          <AuthorInsights metrics={metrics} loading={loading} />
        </div>

        {/* Follow-ups + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FollowUps followUps={followUps} loading={loading} />
          <QuickActions />
        </div>

        {/* Search Console Mini */}
        <SearchConsoleMini />

        {/* Quote Funnel + Expiry Alerts + Response Time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuoteConversionFunnel />
          <QuoteExpiryAlerts />
          <ResponseTimeTracker />
        </div>

        {/* AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AICopilot data={{ leads: dashData?.leads, quotes: dashData?.quotes, submissions: dashData?.submissions }} />
          <AIInsightsPanel insights={dashData?.aiInsights || []} />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activity={activity} loading={loading} />

        {/* Footer note */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400">Dashboard refreshes every 60 seconds · Last update: {new Date().toLocaleTimeString('en-ZA')}</p>
        </div>
      </div>
    </AdminLayout>
  );
}