import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import KpiCards from '@/components/admin/dashboard/KpiCards';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import MonthlyTrendChart from '@/components/admin/dashboard/MonthlyTrendChart';
import ServiceBreakdownCard from '@/components/admin/dashboard/ServiceBreakdownCard';
import QuoteConversionFunnel from '@/components/admin/dashboard/QuoteConversionFunnel';
import QuoteExpiryAlerts from '@/components/admin/dashboard/QuoteExpiryAlerts';
import AICopilot from '@/components/admin/dashboard/AICopilot';
import DealPerformanceSummary from '@/components/admin/dashboard/DealPerformanceSummary';
import FinanceSummary from '@/components/admin/dashboard/FinanceSummary';
import AdminChatPanel from '@/components/admin/dashboard/AdminChatPanel';
import QuoteAutomationWidget from '@/components/admin/dashboard/QuoteAutomationWidget';
import SmartFollowUpCenter from '@/components/admin/dashboard/SmartFollowUpCenter';
import ProjectHealthBoard from '@/components/admin/projects/ProjectHealthBoard.jsx';
import {
  FileText, Receipt, MessageSquare,
  CheckSquare, FolderKanban, RefreshCw, Zap,
  Target,
  Sparkles
} from 'lucide-react';

// ─── Futuristic Glass card wrapper with neon accents ─────────────────────────
function Glass({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl border ${className}`}
      style={{
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Quick Action Button with neon glow ──────────────────────────────────────
function QA({ label, icon: Icon, to, color, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(); else if (to) navigate(to); };
  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center gap-2.5 p-3.5 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border"
      style={{
        background: 'rgba(255,255,255,0.07)',
        borderColor: 'rgba(255,255,255,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ 
          background: color, 
          boxShadow: `0 4px 16px ${color}60, 0 0 20px ${color}40`
        }}
      >
        <Icon className="w-5 h-5 text-white drop-shadow" />
      </div>
      <span className="text-[10px] font-semibold text-cyan-200/80 text-center leading-tight tracking-wide uppercase group-hover:text-cyan-100 transition-colors">{label}</span>
    </button>
  );
}

// ─── Status KPI strip with neon accents ──────────────────────────────────────
function StatusStrip({ metrics, loading }) {
  const items = [
    { label: 'New Leads', value: metrics?.new_leads_today ?? 0, color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.3)', icon: Target },
    { label: 'Tasks Due', value: metrics?.tasks_due_today ?? 0, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', icon: CheckSquare },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`relative rounded-xl p-4 overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${loading ? 'animate-pulse' : ''}`}
            style={{
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-2xl" style={{ background: item.color }} />
            <div className="relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: item.color, boxShadow: `0 2px 12px ${item.glow}` }}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-cyan-50 tracking-tight">{loading ? '—' : item.value}</p>
              <p className="text-[9px] font-semibold text-cyan-200/60 uppercase tracking-wider mt-0.5">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Live ticker with neon pulse ─────────────────────────────────────────────
function LiveTicker() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-white/60">
      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse inline-block" />
      <span className="font-bold text-white/80">LIVE</span>
      <span className="text-white/30">·</span>
      <span>{time.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
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
        platform.auth.me(),
        platform.functions.invoke('getAdminDashboardMetrics', { dateRange }),
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

  const isSuperUser = user?.role === 'admin' || user?.role === 'super_user';
  const metrics = dashData?.metrics;
  const pipeline = dashData?.pipeline;
  const activity = dashData?.activity;
  const followUps = dashData?.followUps;
  const monthlyTrend = dashData?.monthlyTrend;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AdminLayout>
      <div
        className="min-h-screen -m-6 lg:-m-7 p-6 lg:p-8 relative"
        style={{ 
          backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />
        
        <div className="relative max-w-[1400px] mx-auto space-y-6">

          {/* ── HEADER ── */}
          <div className="flex items-start justify-between flex-wrap gap-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                background: 'linear-gradient(135deg,#22d3ee,#06b6d4)',
                boxShadow: '0 4px 20px rgba(34, 211, 238, 0.5)'
              }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyan-50 tracking-tight">
                  {greeting}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
                </h1>
                <p className="text-xs text-cyan-200/60 font-medium mt-0.5">
                  {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LiveTicker />
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {['today', 'week', 'month', 'year'].map(r => (
                  <button key={r} onClick={() => setDateRange(r)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200"
                    style={dateRange === r ? {
                      background: 'linear-gradient(135deg, #ec4899, #f97316)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    } : { color: 'rgba(255,255,255,0.55)' }}>
                    {r}
                  </button>
                ))}
              </div>
              <button onClick={fetchDashboard}
                className="p-2.5 rounded-xl backdrop-blur-xl transition-all hover:scale-105"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <RefreshCw className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* ── STATUS STRIP ── */}
          <StatusStrip metrics={metrics} loading={loading} />

          {/* ── FINANCE SUMMARY ── */}
          <FinanceSummary />

          {/* ── QUICK ACTIONS ── */}
          <Glass className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899, #f97316)' }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Quick Actions</span>
              <div className="flex-1 h-px ml-2 bg-gradient-to-r from-white/20 to-transparent" />
            </div>
            <div className="grid grid-cols-5 gap-3">
              <QA label="New Quote" icon={FileText} to="/admin/quotes/new" color="#8b5cf6" />
              <QA label="New Invoice" icon={Receipt} to="/admin/invoices" color="#10b981" />
              <QA label="New Project" icon={FolderKanban} to="/admin/projects" color="#3b82f6" />
              <QA label="Add Task" icon={CheckSquare} to="/admin/tasks" color="#f43f5e" />
            </div>
          </Glass>

          {/* ── KPIs ── */}
          <KpiCards metrics={metrics} isOwner={isSuperUser} loading={loading} />

          {/* ── AI COPILOT ── */}
          <AICopilot data={{ leads: dashData?.leads, quotes: dashData?.quotes, submissions: dashData?.submissions }} />



          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyTrendChart monthlyTrend={monthlyTrend} loading={loading} />
            <ServiceBreakdownCard metrics={metrics} loading={loading} />
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuoteConversionFunnel />
            <QuoteExpiryAlerts />
            <QuoteAutomationWidget />
          </div>

          {/* ── PROJECT HEALTH + FOLLOW-UPS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectHealthBoard />
            <SmartFollowUpCenter />
          </div>

          {/* ── DEAL PERFORMANCE SUMMARY ── */}
          <DealPerformanceSummary />

          {/* ── ACTIVITY FEED ── */}
          <ActivityFeed activity={activity} loading={loading} />



          {/* ── FOOTER ── */}
          <div className="text-center pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              <p className="text-xs text-white/50 font-mono">Auto-refreshes every 60s · Creative Books SA Command Centre</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}