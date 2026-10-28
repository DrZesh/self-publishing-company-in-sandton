import React from 'react';
import { BarChart, BookOpen, CheckCircle, Clock, TrendingUp, Calendar, Mail, Phone, Upload, Star } from 'lucide-react';

export default function AnalyticsTab({ contact, projects, quotes, invoices }) {
  const stats = {
    totalProjects: projects?.length || 0,
    completedProjects: projects?.filter(p => ['Completed', 'Delivered'].includes(p.stage)).length || 0,
    totalQuotes: quotes?.length || 0,
    acceptedQuotes: quotes?.filter(q => q.status === 'Accepted').length || 0,
    totalInvoices: invoices?.length || 0,
    paidInvoices: invoices?.filter(i => i.status === 'Paid').length || 0,
    totalValue: invoices?.reduce((sum, i) => sum + (i.total || 0), 0) || 0,
    paidValue: invoices?.reduce((sum, i) => sum + (i.amount_paid || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Projects"
          value={stats.totalProjects}
          subvalue={`${stats.completedProjects} completed`}
          color="from-blue-500/20 to-cyan-500/10"
        />
        <StatCard
          icon={CheckCircle}
          label="Quotes Accepted"
          value={`${stats.acceptedQuotes}/${stats.totalQuotes}`}
          subvalue={`${stats.totalQuotes} total quotes`}
          color="from-green-500/20 to-emerald-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Value"
          value={`R ${stats.totalValue.toLocaleString()}`}
          subvalue={`R ${stats.paidValue.toLocaleString()} paid`}
          color="from-purple-500/20 to-pink-500/10"
        />
        <StatCard
          icon={Calendar}
          label="Invoices Paid"
          value={`${stats.paidInvoices}/${stats.totalInvoices}`}
          subvalue={`${stats.totalInvoices - stats.paidInvoices} outstanding`}
          color="from-orange-500/20 to-red-500/10"
        />
      </div>

      {/* Project Timeline */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#D4A574]" />
          Your Publishing Journey
        </h3>
        
        {projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <ProjectTimelineItem
                key={project.id}
                project={project}
                index={index}
                total={projects.length}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No projects yet</p>
          </div>
        )}
      </div>

      {/* Engagement Metrics */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-[#D4A574]" />
          Engagement Summary
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Communication</h4>
            <div className="space-y-3">
              <MetricRow label="Messages Sent" value="12" icon={Mail} />
              <MetricRow label="Appointments Booked" value="3" icon={Calendar} />
              <MetricRow label="Files Uploaded" value="8" icon={Upload} />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Responsiveness</h4>
            <div className="space-y-3">
              <MetricRow label="Avg. Response Time" value="< 2 hours" icon={Clock} />
              <MetricRow label="Proofs Approved" value="2" icon={CheckCircle} />
              <MetricRow label="Reviews Submitted" value="1" icon={Star} />
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Achievements */}
      <div className="bg-gradient-to-r from-[#B87333]/20 to-[#D4A574]/10 rounded-3xl border border-[#B87333]/30 p-6">
        <h3 className="font-bold text-white text-lg mb-4">Your Publishing Milestones</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MilestoneBadge
            icon={BookOpen}
            label="Project Started"
            achieved={stats.totalProjects > 0}
          />
          <MilestoneBadge
            icon={CheckCircle}
            label="First Proof Approved"
            achieved={stats.completedProjects > 0}
          />
          <MilestoneBadge
            icon={TrendingUp}
            label="Book Published"
            achieved={stats.completedProjects > 0}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subvalue, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl border border-gray-700/50 p-6`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6 text-[#D4A574]" />
        <p className="text-sm font-semibold text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subvalue}</p>
    </div>
  );
}

function ProjectTimelineItem({ project, index, total }) {
  return (
    <div className="relative pl-8 pb-6 border-l-2 border-gray-700 last:border-0">
      <div className={`absolute left-0 top-0 w-4 h-4 -ml-2 rounded-full ${
        ['Completed', 'Delivered'].includes(project.stage) 
          ? 'bg-green-500' 
          : 'bg-[#B87333]'
      }`} />
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-white">{project.book_title}</h4>
            <p className="text-sm text-gray-400 mt-1">{project.service_type}</p>
          </div>
          <StatusBadge status={project.stage} />
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Started: {new Date(project.created_date).toLocaleDateString('en-ZA')}
          </span>
          {project.deadline && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Deadline: {new Date(project.deadline).toLocaleDateString('en-ZA')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Completed': 'bg-green-500/20 text-green-400',
    'Delivered': 'bg-green-500/20 text-green-400',
    'Editing': 'bg-blue-500/20 text-blue-400',
    'Cover Design': 'bg-purple-500/20 text-purple-400',
    'Typesetting': 'bg-orange-500/20 text-orange-400',
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}

function MetricRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function MilestoneBadge({ icon: Icon, label, achieved }) {
  return (
    <div className={`p-4 rounded-xl border text-center ${
      achieved 
        ? 'bg-gradient-to-br from-[#B87333]/20 to-[#D4A574]/10 border-[#B87333]/30' 
        : 'bg-gray-800/30 border-gray-700/50 opacity-50'
    }`}>
      <Icon className={`w-8 h-8 mx-auto mb-2 ${
        achieved ? 'text-[#D4A574]' : 'text-gray-600'
      }`} />
      <p className={`text-xs font-semibold ${
        achieved ? 'text-white' : 'text-gray-500'
      }`}>{label}</p>
      {achieved && (
        <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-1" />
      )}
    </div>
  );
}