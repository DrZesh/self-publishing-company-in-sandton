import React from 'react';
import { BookOpen, FileText, CreditCard, FolderOpen, CheckCircle, TrendingUp, Calendar, Sparkles, AlertTriangle, ChevronRight, Clock, Star, MessageSquare, Upload, Truck } from 'lucide-react';
import PublishingTimeline from '@/components/portal/PublishingTimeline';
import NextActionCard from '@/components/portal/NextActionCard';

export default function OverviewTab({ contact, portalAccess, allowedSections = [], quotes = [], invoices = [], projects = [], documents = [], receipts = [], updates = [], onNavigate }) {
  const actionItemsList = [];

  return (
    <div className="space-y-6">
      {/* Quick Actions - Message & File Upload */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5 transition-all bg-white shadow-lg" style={{
          borderColor: 'rgba(184, 115, 51, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Send a Message</p>
              <p className="text-xs text-gray-600">Quick contact with our team</p>
            </div>
          </div>
          <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-500 hover:bg-blue-600 text-white">
            Open Chat
          </button>
        </div>
        
        <div className="rounded-2xl border p-5 transition-all bg-white shadow-lg" style={{
          borderColor: 'rgba(184, 115, 51, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-copper-500" style={{ background: '#B87333' }}>
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Upload Files</p>
              <p className="text-xs text-gray-600">Drop manuscripts, images, etc.</p>
            </div>
          </div>
          <div className="border-2 border-dashed rounded-xl p-4 text-center transition-all" style={{
            borderColor: 'rgba(184, 115, 51, 0.3)',
            background: 'rgba(184, 115, 51, 0.05)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#B87333'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(184, 115, 51, 0.3)'}
          >
            <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: '#B87333' }} />
            <p className="text-xs text-gray-700 font-medium">Drag & drop or click to upload</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOC, JPG (Max 10MB)</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {allowedSections.includes('quotes') && (
          <StatCard 
            icon={FileText}
            value={quotes.length}
            label="Quotes"
            onClick={() => onNavigate('quotes')}
            gradient="from-[#B87333] to-[#D4A574]"
          />
        )}
        {allowedSections.includes('invoices') && (
          <StatCard 
            icon={CreditCard}
            value={invoices.length}
            label="Invoices"
            onClick={() => onNavigate('invoices')}
            gradient="from-[#B87333] to-[#D4A574]"
          />
        )}
        {allowedSections.includes('projects') && (
          <StatCard 
            icon={CheckCircle}
            value={projects.filter(p => !['Completed', 'Delivered'].includes(p.stage)).length}
            label="Active Projects"
            onClick={() => onNavigate('projects')}
            gradient="from-[#B87333] to-[#D4A574]"
          />
        )}
        {actionItemsList.length > 0 ? (
          <StatCard 
            icon={AlertTriangle}
            value={actionItemsList.length}
            label="Action Required"
            onClick={() => onNavigate('action_required')}
            gradient="from-red-500 to-orange-500"
            urgent
          />
        ) : (
          <StatCard 
            icon={FolderOpen}
            value={documents.length}
            label="Documents"
            onClick={() => onNavigate('documents')}
            gradient="from-[#B87333] to-[#D4A574]"
          />
        )}
      </div>

      {/* Timeline */}
      {allowedSections.includes('projects') && projects.length > 0 && (
        <div className="rounded-2xl border" style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(24px)',
          borderColor: 'rgba(184, 115, 51, 0.2)'
        }}>
          <PublishingTimeline project={projects[0]} />
        </div>
      )}

      {/* Action Items Preview */}
      {actionItemsList.length > 0 && (
        <div className="rounded-2xl border p-6" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#fca5a5' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#f87171' }} />
              Action Required
            </h3>
            <button onClick={() => onNavigate('action_required')} className="text-sm font-medium flex items-center gap-1 transition-colors" style={{ color: '#fca5a5' }}>
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {actionItemsList.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border transition-all" style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderColor: 'rgba(239, 68, 68, 0.2)'
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: '#f87171' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#fca5a5' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{item.doc?.file_name || item.invoice?.invoice_number || item.proof?.title}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#64748b' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Updates */}
      {updates.length > 0 && (
        <div className="rounded-2xl border p-6" style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.2)'
        }}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: '#93c5fd' }}>
            <MessageSquare className="w-5 h-5" style={{ color: '#60a5fa' }} />
            Recent Updates
          </h3>
          <div className="space-y-3">
            {updates.slice(0, 3).map(update => (
              <div key={update.id} className="flex gap-4 p-4 rounded-xl border" style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderColor: 'rgba(59, 130, 246, 0.15)'
              }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`} style={{
                  background: update.update_type === 'milestone_completed' ? 'rgba(34, 197, 94, 0.2)' :
                             update.update_type === 'action_required' ? 'rgba(249, 115, 22, 0.2)' :
                             'rgba(59, 130, 246, 0.2)'
                }}>
                  {update.update_type === 'milestone_completed' ? <CheckCircle className="w-5 h-5" style={{ color: '#4ade80' }} /> :
                   update.update_type === 'action_required' ? <AlertTriangle className="w-5 h-5" style={{ color: '#fb923c' }} /> :
                   <Star className="w-5 h-5" style={{ color: '#60a5fa' }} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#dbeafe' }}>{update.title}</p>
                  <p className="text-sm mt-1" style={{ color: '#93c5fd' }}>{update.message}</p>
                  <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                    {new Date(update.created_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, onClick, gradient, urgent }) {
  return (
    <div 
      onClick={onClick}
      className="group relative rounded-2xl border p-5 shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl bg-white"
      style={{
        borderColor: urgent ? 'rgba(239, 68, 68, 0.4)' : 'rgba(184, 115, 51, 0.2)',
        boxShadow: urgent ? '0 4px 24px rgba(239, 68, 68, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: gradient === 'from-red-500 to-orange-500' ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'linear-gradient(135deg, #B87333 0%, #D4A574 100%)' }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-[#B87333] transition-colors" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 font-medium mt-1">{label}</p>
    </div>
  );
}

function FooterCard({ icon: Icon, title, value, href }) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 bg-gradient-to-br from-[#B87333] via-[#D4A574] to-[#B87333] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-[#B87333]/30">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-bold text-[#D4A574] text-sm">{title}</p>
        {href ? (
          <a href={href} className="text-sm text-gray-400 hover:text-white transition-colors">{value}</a>
        ) : (
          <p className="text-sm text-gray-400">{value}</p>
        )}
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block">{content}</a>
  ) : content;
}