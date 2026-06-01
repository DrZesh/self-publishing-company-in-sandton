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
import TodaysAppointmentsWidget from '@/components/appointments/TodaysAppointmentsWidget';
import DealPerformanceSummary from '@/components/admin/dashboard/DealPerformanceSummary';
import {
  Plus, FileText, Receipt, Upload, Send, MessageSquare,
  Mail, CheckSquare, FolderKanban, RefreshCw, Zap, Clock,
  AlertTriangle, TrendingUp, Users, Target, Package, ChevronRight,
  Activity, Sparkles, BarChart3, Star, Layers
} from 'lucide-react';

// ─── Glass card wrapper ───────────────────────────────────────────────────────
function Glass({ children, className = '', glow = null, style = {} }) {
  const glowStyles = {
    amber: 'shadow-[0_0_40px_rgba(251,146,60,0.15),0_0_80px_rgba(251,146,60,0.05)]',
    blue: 'shadow-[0_0_40px_rgba(59,130,246,0.15),0_0_80px_rgba(59,130,246,0.05)]',
    violet: 'shadow-[0_0_40px_rgba(139,92,246,0.15),0_0_80px_rgba(139,92,246,0.05)]',
    emerald: 'shadow-[0_0_40px_rgba(16,185,129,0.15),0_0_80px_rgba(16,185,129,0.05)]',
    rose: 'shadow-[0_0_40px_rgba(244,63,94,0.15),0_0_80px_rgba(244,63,94,0.05)]',
    cyan: 'shadow-[0_0_40px_rgba(6,182,212,0.15),0_0_80px_rgba(6,182,212,0.05)]',
  };
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl border border-white/10 ${glow ? glowStyles[glow] : 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]'} ${className}`}
      style={{ background: 'rgba(15,15,25,0.7)', ...style }}
    >
      {children}
    </div>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QA({ label, icon: Icon, to, gradient, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(); else if (to) navigate(to); };
  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border border-white/8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-white/20"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
        style={{ background: gradient, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
      >
        <Icon className="w-5 h-5 text-white drop-shadow-lg" />
      </div>
      <span className="text-[10px] font-semibold text-white/60 text-center leading-tight tracking-wide uppercase group-hover:text-white/90 transition-colors">{label}</span>
    </button>
  );
}

// ─── Status KPI strip ─────────────────────────────────────────────────────────
function StatusStrip({ metrics, loading }) {
  const items = [
    { label: 'New Leads', value: metrics?.new_leads_today ?? 0, gradient: 'linear-gradient(135deg,#f97316,#fb923c)', glow: '#f97316', icon: Target },
    { label: 'Unsigned', value: metrics?.unsigned_contracts ?? 0, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', glow: '#ef4444', icon: FileText },
    { label: 'Signatures', value: metrics?.docs_awaiting_signature ?? 0, gradient: 'linear-gradient(135deg,#eab308,#fbbf24)', glow: '#eab308', icon: Star },
    { label: 'Proofs', value: metrics?.proofs_pending ?? 0, gradient: 'linear-gradient(135deg,#a855f7,#c084fc)', glow: '#a855f7', icon: Clock },
    { label: 'Collection', value: metrics?.ready_for_collection ?? 0, gradient: 'linear-gradient(135deg,#10b981,#34d399)', glow: '#10b981', icon: Package },
    { label: 'Tasks Due', value: metrics?.tasks_due_today ?? 0, gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', glow: '#3b82f6', icon: CheckSquare },
    { label: 'Overdue', value: metrics?.overdue_invoices ?? 0, gradient: 'linear-gradient(135deg,#f43f5e,#fb7185)', glow: '#f43f5e', icon: Receipt },
    { label: 'Projects', value: metrics?.active_projects ?? 0, gradient: 'linear-gradient(135deg,#6366f1,#818cf8)', glow: '#6366f1', icon: FolderKanban },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`relative rounded-2xl border border-white/10 p-4 overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 ${loading ? 'animate-pulse' : ''}`}
            style={{
              background: 'rgba(15,15,25,0.75)',
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), 0 0 20px ${item.glow}20`,
            }}
          >
            {/* Glow orb */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl" style={{ background: item.gradient }} />
            <div className="relative">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: item.gradient, boxShadow: `0 2px 10px ${item.glow}40` }}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-2xl font-black text-white tracking-tight">{loading ? '—' : item.value}</p>
              <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest mt-0.5">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Alerts panel ─────────────────────────────────────────────────────────────
function AlertsPanel({ metrics }) {
  const alerts = [
    metrics?.unsigned_contracts > 0 && { label: `${metrics.unsigned_contracts} unsigned contract${metrics.unsigned_contracts > 1 ? 's' : ''}`, to: '/admin/contracts', color: '#ef4444', icon: AlertTriangle },
    metrics?.overdue_invoices > 0 && { label: `${metrics.overdue_invoices} overdue invoice${metrics.overdue_invoices > 1 ? 's' : ''}`, to: '/admin/invoices', color: '#f97316', icon: Receipt },
    metrics?.tasks_due_today > 0 && { label: `${metrics.tasks_due_today} task${metrics.tasks_due_today > 1 ? 's' : ''} due today`, to: '/admin/tasks', color: '#3b82f6', icon: CheckSquare },
    metrics?.proofs_pending > 0 && { label: `${metrics.proofs_pending} proof${metrics.proofs_pending > 1 ? 's' : ''} awaiting approval`, to: '/admin/projects', color: '#a855f7', icon: Clock },
    metrics?.ready_for_collection > 0 && { label: `${metrics.ready_for_collection} project${metrics.ready_for_collection > 1 ? 's' : ''} ready`, to: '/admin/collections', color: '#10b981', icon: Package },
  ].filter(Boolean);

  if (!alerts.length) return null;

  return (
    <Glass glow="rose" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ef4444,#f87171)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Needs Attention</span>
        <span className="ml-auto text-xs font-black text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">{alerts.length}</span>
      </div>
      <div className="space-y-2">
        {alerts.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link key={i} to={a.to}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01]"
              style={{ background: a.color + '12', borderColor: a.color + '30' }}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: a.color }} />
              <span className="text-xs font-semibold" style={{ color: a.color }}>{a.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-60" style={{ color: a.color }} />
            </Link>
          );
        })}
      </div>
    </Glass>
  );
}

// ─── Live ticker ──────────────────────────────────────────────────────────────
function LiveTicker() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
      <span>LIVE</span>
      <span className="text-white/20">·</span>
      <span>{time.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children }) {
  return (
    <div className="[&>div]:bg-[rgba(15,15,25,0.75)] [&>div]:backdrop-blur-xl [&>div]:border-white/10 [&>div]:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {children}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
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
      {/* Full dark immersive canvas */}
      <div
        className="min-h-screen -m-6 lg:-m-7 p-6 lg:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0a14 0%, #0d0d1e 25%, #0a0f1a 50%, #10080f 75%, #0a0a14 100%)',
        }}
      >
        {/* Ambient light orbs */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #B87333, transparent)' }} />
        <div className="fixed top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

        {/* Subtle grid overlay */}
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative max-w-[1400px] mx-auto space-y-6">

          {/* ── HEADER ── */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{
                    background: 'linear-gradient(90deg, #ffffff 0%, #B87333 50%, #d4944a 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    {greeting}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
                  </h1>
                  <p className="text-xs text-white/30 font-medium tracking-wide">
                    {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LiveTicker />
              <div className="flex items-center gap-1 p-1 rounded-xl border border-white/10 backdrop-blur-xl" style={{ background: 'rgba(15,15,25,0.8)' }}>
                {['today', 'week', 'month', 'year'].map(r => (
                  <button key={r} onClick={() => setDateRange(r)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200"
                    style={dateRange === r ? {
                      background: 'linear-gradient(135deg,#B87333,#d4944a)',
                      color: 'white',
                      boxShadow: '0 2px 10px rgba(184,115,51,0.4)',
                    } : { color: 'rgba(255,255,255,0.4)' }}>
                    {r}
                  </button>
                ))}
              </div>
              <button onClick={fetchDashboard}
                className="p-2.5 rounded-xl border border-white/10 backdrop-blur-xl transition-all hover:border-[#B87333]/40 hover:scale-105"
                style={{ background: 'rgba(15,15,25,0.8)' }}>
                <RefreshCw className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </div>

          {/* ── STATUS STRIP ── */}
          <StatusStrip metrics={metrics} loading={loading} />

          {/* ── QUICK ACTIONS ── */}
          <Glass glow="amber" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Quick Actions</span>
              <div className="flex-1 h-px ml-2" style={{ background: 'linear-gradient(90deg,rgba(184,115,51,0.3),transparent)' }} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              <QA label="Add Lead" icon={Target} to="/admin/leads" gradient="linear-gradient(135deg,#B87333,#d4944a)" />
              <QA label="New Quote" icon={FileText} to="/admin/quotes/new" gradient="linear-gradient(135deg,#6366f1,#818cf8)" />
              <QA label="New Invoice" icon={Receipt} to="/admin/invoices" gradient="linear-gradient(135deg,#10b981,#34d399)" />
              <QA label="New Project" icon={FolderKanban} to="/admin/projects" gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
              <QA label="Upload Doc" icon={Upload} to="/admin/documents" gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)" />
              <QA label="Send Doc" icon={Send} to="/admin/documents" gradient="linear-gradient(135deg,#0ea5e9,#38bdf8)" />
              <QA label="WhatsApp" icon={MessageSquare} to="/admin/automations" gradient="linear-gradient(135deg,#22c55e,#4ade80)" />
              <QA label="Send Email" icon={Mail} to="/admin/email-templates" gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" />
              <QA label="Add Task" icon={CheckSquare} to="/admin/tasks" gradient="linear-gradient(135deg,#ef4444,#f87171)" />
              <QA label="Service Updates" icon={Layers} to="/admin/client-service" gradient="linear-gradient(135deg,#6366f1,#818cf8)" />
            </div>
          </Glass>

          {/* ── ALERTS + KPIs ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <AlertsPanel metrics={metrics} />
              <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&>div]:!text-white [&_p]:!text-white/70 [&_h2]:!text-white [&_h3]:!text-white [&_span]:!text-white/60">
                <FollowUpReminders />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60">
                <KpiCards metrics={metrics} isOwner={isOwner} loading={loading} />
              </div>
            </div>
          </div>

          {/* ── AI COPILOT ── */}
          <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60 [&_textarea]:!bg-white/5 [&_textarea]:!text-white [&_textarea]:!border-white/10">
            <AICopilot data={{ leads: dashData?.leads, quotes: dashData?.quotes, submissions: dashData?.submissions }} />
          </div>

          {/* ── SALES PIPELINE ── */}
          <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60">
            <SalesPipeline pipeline={pipeline} loading={loading} />
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60">
              <MonthlyTrendChart monthlyTrend={monthlyTrend} loading={loading} />
            </div>
            <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60">
              <ServiceBreakdownCard metrics={metrics} loading={loading} />
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[<QuoteConversionFunnel key="qcf" />, <QuoteExpiryAlerts key="qea" />, <FollowUps key="fu" followUps={followUps} loading={loading} />].map((child, i) => (
              <div key={i} className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60">
                {child}
              </div>
            ))}
          </div>

          {/* ── APPOINTMENTS ── */}
          <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60">
            <TodaysAppointmentsWidget />
          </div>

          {/* ── DEAL PERFORMANCE SUMMARY ── */}
          <DealPerformanceSummary />

          {/* ── ACTIVITY FEED ── */}
          <div className="[&>div]:!bg-[rgba(15,15,25,0.75)] [&>div]:!backdrop-blur-xl [&>div]:!border-white/10 [&>div]:!rounded-2xl [&>div]:!border [&_p]:!text-white/70 [&_h2]:!text-white [&_span]:!text-white/60">
            <ActivityFeed activity={activity} loading={loading} />
          </div>

          {/* ── FOOTER ── */}
          <div className="text-center pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-white/20 font-mono">Auto-refreshes every 60s · Creative Books SA Command Centre</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}