import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import KpiCards from '@/components/admin/dashboard/KpiCards';
import SalesPipeline from '@/components/admin/dashboard/SalesPipeline';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import FollowUps from '@/components/admin/dashboard/FollowUps';
import MonthlyTrendChart from '@/components/admin/dashboard/MonthlyTrendChart';
import ServiceBreakdownCard from '@/components/admin/dashboard/ServiceBreakdownCard';
import QuoteConversionFunnel from '@/components/admin/dashboard/QuoteConversionFunnel';
import QuoteExpiryAlerts from '@/components/admin/dashboard/QuoteExpiryAlerts';
import AICopilot from '@/components/admin/dashboard/AICopilot';
import FollowUpReminders from '@/components/admin/dashboard/FollowUpReminders';
import {
  Plus, FileText, Receipt, Upload, Send, MessageSquare,
  Mail, CheckSquare, FolderKanban, RefreshCw, Zap, Clock,
  AlertTriangle, TrendingUp, Users, Target, Package, ChevronRight
} from 'lucide-react';

// ─── Quick Action Button ─────────────────────────────────────────────────────
function QA({ label, icon: Icon, to, color = '#B87333', onClick }) {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(); else if (to) navigate(to); };
  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-xs font-medium text-gray-600 text-center leading-tight">{label}</span>
    </button>
  );
}

// ─── Status KPI strip ────────────────────────────────────────────────────────
function StatusStrip({ metrics, loading }) {
  const items = [
    { label: 'New Leads Today', value: metrics?.new_leads_today ?? '—', color: 'text-[#B87333]', bg: 'bg-orange-50 border-orange-100' },
    { label: 'Unsigned Contracts', value: metrics?.unsigned_contracts ?? '—', color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
    { label: 'Awaiting Signature', value: metrics?.docs_awaiting_signature ?? '—', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
    { label: 'Proofs Pending', value: metrics?.proofs_pending ?? '—', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { label: 'Ready for Collection', value: metrics?.ready_for_collection ?? '—', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    { label: 'Tasks Due Today', value: metrics?.tasks_due_today ?? '—', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Overdue Invoices', value: metrics?.overdue_invoices ?? '—', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
    { label: 'Active Projects', value: metrics?.active_projects ?? '—', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {items.map(item => (
        <div key={item.label} className={`rounded-xl border p-3 ${item.bg} ${loading ? 'animate-pulse' : ''}`}>
          <p className={`text-xl font-bold ${item.color}`}>{loading ? '—' : item.value}</p>
          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Alerts panel ────────────────────────────────────────────────────────────
function AlertsPanel({ metrics }) {
  const alerts = [
    metrics?.unsigned_contracts > 0 && { label: `${metrics.unsigned_contracts} unsigned contract${metrics.unsigned_contracts > 1 ? 's' : ''}`, to: '/admin/contracts', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
    metrics?.overdue_invoices > 0 && { label: `${metrics.overdue_invoices} overdue invoice${metrics.overdue_invoices > 1 ? 's' : ''}`, to: '/admin/invoices', color: 'text-orange-600', bg: 'bg-orange-50', icon: Receipt },
    metrics?.tasks_due_today > 0 && { label: `${metrics.tasks_due_today} task${metrics.tasks_due_today > 1 ? 's' : ''} due today`, to: '/admin/tasks', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckSquare },
    metrics?.proofs_pending > 0 && { label: `${metrics.proofs_pending} proof${metrics.proofs_pending > 1 ? 's' : ''} awaiting approval`, to: '/admin/projects', color: 'text-purple-600', bg: 'bg-purple-50', icon: Clock },
    metrics?.ready_for_collection > 0 && { label: `${metrics.ready_for_collection} project${metrics.ready_for_collection > 1 ? 's' : ''} ready for collection`, to: '/admin/collections', color: 'text-green-600', bg: 'bg-green-50', icon: Package },
  ].filter(Boolean);

  if (!alerts.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Needs Attention ({alerts.length})
      </p>
      <div className="space-y-1.5">
        {alerts.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link key={i} to={a.to} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${a.bg} hover:opacity-80 transition-opacity`}>
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${a.color}`} />
              <span className={`text-xs font-medium ${a.color}`}>{a.label}</span>
              <ChevronRight className={`w-3 h-3 ml-auto ${a.color}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
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
    refreshTimer.current = setInterval(fetchDashboard, 60000);
    return () => clearInterval(refreshTimer.current);
  }, [fetchDashboard]);

  const isOwner = user?.role === 'admin';
  const metrics = dashData?.metrics;
  const pipeline = dashData?.pipeline;
  const activity = dashData?.activity;
  const followUps = dashData?.followUps;
  const monthlyTrend = dashData?.monthlyTrend;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['today', 'week', 'month', 'year'].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${dateRange === r ? 'bg-[#B87333] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {r}
              </button>
            ))}
            <button onClick={fetchDashboard} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Status Strip */}
        <StatusStrip metrics={metrics} loading={loading} />

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#B87333]" /> Quick Actions
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            <QA label="Add Lead" icon={Target} to="/admin/leads" color="#B87333" />
            <QA label="New Quote" icon={FileText} to="/admin/quotes/new" color="#6366f1" />
            <QA label="New Invoice" icon={Receipt} to="/admin/invoices" color="#10b981" />
            <QA label="New Project" icon={FolderKanban} to="/admin/projects" color="#3b82f6" />
            <QA label="Upload Doc" icon={Upload} to="/admin/documents" color="#8b5cf6" />
            <QA label="Send Doc" icon={Send} to="/admin/documents" color="#0ea5e9" />
            <QA label="WhatsApp" icon={MessageSquare} to="/admin/automations" color="#22c55e" />
            <QA label="Send Email" icon={Mail} to="/admin/email-templates" color="#f59e0b" />
            <QA label="Add Task" icon={CheckSquare} to="/admin/tasks" color="#ef4444" />
          </div>
        </div>

        {/* Alerts + KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <AlertsPanel metrics={metrics} />
            <FollowUpReminders />
          </div>
          <div className="lg:col-span-2">
            <KpiCards metrics={metrics} isOwner={isOwner} loading={loading} />
          </div>
        </div>

        {/* AI Copilot */}
        <AICopilot data={{ leads: dashData?.leads, quotes: dashData?.quotes, submissions: dashData?.submissions }} />

        {/* Sales Pipeline */}
        <SalesPipeline pipeline={pipeline} loading={loading} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrendChart monthlyTrend={monthlyTrend} loading={loading} />
          <ServiceBreakdownCard metrics={metrics} loading={loading} />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuoteConversionFunnel />
          <QuoteExpiryAlerts />
          <FollowUps followUps={followUps} loading={loading} />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activity={activity} loading={loading} />

        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">Auto-refreshes every 60 seconds · {new Date().toLocaleTimeString('en-ZA')}</p>
        </div>
      </div>
    </AdminLayout>
  );
}