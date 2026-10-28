import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CreditCard, CheckCircle, FolderOpen, AlertTriangle, Calendar, Mail, Phone, TrendingUp, ChevronRight, User, BookOpen, Clock } from 'lucide-react';
import PublishingTimeline from './PublishingTimeline';

export default function OverviewTab({ contact, quotes = [], invoices = [], projects = [], documents = [], updates = [], onNavigate }) {
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
  const activeProjects = projects.filter(p => !['Completed', 'Delivered'].includes(p.stage)).length;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {[
          { icon: FileText, label: 'Quotes', value: quotes.length, color: '#3B82F6' },
          { icon: CreditCard, label: 'Invoices', value: invoices.length, color: '#8B5CF6' },
          { icon: CheckCircle, label: 'Active Projects', value: activeProjects, color: '#10B981' },
          { icon: FolderOpen, label: 'Documents', value: documents.length, color: '#F59E0B' },
          { icon: TrendingUp, label: 'Outstanding Balance', value: `R ${totalOutstanding.toLocaleString()}`, color: '#B87333', highlight: true },
        ].map((card, idx) => (
          <motion.div 
            key={idx} 
            className="rounded-xl p-4 md:p-6 bg-white border border-[#E5D9C9] hover:shadow-xl hover:scale-105 transition-all duration-300"
            style={{
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `${card.color}15`,
                }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <card.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: card.color }} />
              </motion.div>
            </div>
            <p className={`text-xs md:text-sm font-medium ${card.highlight ? 'text-[#B87333]' : 'text-gray-600'}`}>{card.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-2 ${card.highlight ? 'text-[#B87333]' : 'text-gray-900'}`}>{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Publishing Journey + Next Action */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="lg:col-span-2">
          <PublishingTimeline project={projects[0]} />
        </div>

        {/* Next Action Card */}
        <motion.div 
          className="rounded-xl bg-gradient-to-br from-[#1A2B4A] to-[#0F1F35] p-6 text-white relative overflow-hidden"
          style={{
            boxShadow: '0 4px 16px rgba(26, 43, 74, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Animated background glow */}
          <motion.div 
            className="absolute -top-20 -right-20 w-40 h-40 bg-[#B87333]/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div 
              className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-5 h-5 text-[#FCD34D]" />
            </motion.div>
            <h3 className="text-lg font-bold">Next Action</h3>
          </div>
          <p className="text-sm text-white/80 mb-6 relative z-10">
            Please review and approve the edited manuscript for Khipa Book.
          </p>
          <motion.button 
            onClick={() => onNavigate('documents')}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white font-semibold text-center flex items-center justify-center gap-2 relative z-10"
            style={{
              boxShadow: '0 4px 12px rgba(184, 115, 51, 0.3)'
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(184, 115, 51, 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            Review Manuscript
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Your Projects + Finance */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {/* Your Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Projects</h2>
            <motion.button 
              onClick={() => onNavigate('projects')}
              className="text-sm font-semibold text-[#B87333] hover:text-[#D4A574] flex items-center gap-1"
              whileHover={{ x: 4 }}
            >
              View all projects <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-4">
            {projects.slice(0, 2).map((project, idx) => (
              <motion.div 
                key={project.id} 
                className="rounded-xl border border-[#E5D9C9] bg-white p-4 md:p-6 hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div 
                    className="w-full sm:w-20 h-32 sm:h-28 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.book_title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#B87333]/20 to-[#D4A574]/20 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-[#B87333]/30" />
                      </div>
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{project.book_title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{project.service_type}</p>
                    
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#B87333]/10 text-[#B87333]">
                        Step 2 of 8
                      </span>
                      <span className="text-xs text-gray-600">Editing</span>
                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#B87333] to-[#D4A574]"
                        initial={{ width: 0 }}
                        animate={{ width: '25%' }}
                        transition={{ delay: 0.8, duration: 1 }}
                      />
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-gray-500">Last updated {project.stage_changed_at ? new Date(project.stage_changed_at).toLocaleDateString() : 'recently'}</p>
                      <motion.button 
                        onClick={() => onNavigate('projects')}
                        className="px-4 py-2 rounded-lg bg-[#1A2B4A] text-white text-sm font-semibold"
                        whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(26, 43, 74, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Project
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Finance + Account Manager */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Finance Card */}
          <motion.div 
            className="rounded-xl border border-[#E5D9C9] bg-white p-6"
            style={{
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Finance</h3>
            
            <div className="mb-6">
              <p className="text-xs text-gray-600 mb-2">Outstanding Balance</p>
              <motion.p 
                className="text-3xl font-bold text-[#B87333]"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
              >
                R {totalOutstanding.toLocaleString()}
              </motion.p>
            </div>

            <motion.button 
              onClick={() => onNavigate('invoices')}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white font-semibold mb-6 relative overflow-hidden"
              style={{
                boxShadow: '0 2px 8px rgba(184, 115, 51, 0.2)'
              }}
              whileHover={{ scale: 1.03, boxShadow: '0 4px 16px rgba(184, 115, 51, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.3 }}
              />
              Pay Now
            </motion.button>

            {invoices.length > 0 && (
              <motion.div 
                className="pt-6 border-t border-[#E5D9C9]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <p className="text-xs text-gray-600 mb-3">Recent Invoice</p>
                <motion.div 
                  className="bg-gray-50 rounded-lg p-3"
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                >
                  <p className="text-sm font-bold text-gray-900">{invoices[0].invoice_number}</p>
                  <p className="text-xs text-gray-600">Due {invoices[0].due_date ? new Date(invoices[0].due_date).toLocaleDateString() : 'soon'}</p>
                  <motion.span 
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                      invoices[0].status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                    animate={{ 
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    {invoices[0].status || 'Pending'}
                  </motion.span>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Account Manager Card */}
          <motion.div 
            className="rounded-xl border border-[#E5D9C9] bg-white p-6"
            style={{
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Manager</h3>
            
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B87333] to-[#D4A574] flex items-center justify-center text-white text-sm font-bold"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                AN
              </motion.div>
              <div>
                <p className="text-sm font-bold text-gray-900">Aubrey Nkanyani</p>
                <p className="text-xs text-gray-600">Client Success Manager</p>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-3 border-t border-[#E5D9C9] pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <motion.a 
                href="mailto:Aubrey@creativebooks.co.za" 
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#B87333] transition-colors"
                whileHover={{ x: 4 }}
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">Aubrey@creativebooks...</span>
              </motion.a>
              <motion.div 
                className="flex items-center gap-3 text-sm text-gray-700"
                whileHover={{ x: 4 }}
              >
                <Phone className="w-4 h-4" />
                <span>010 500 3331 | 084 230 0539</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      {updates.length > 0 && (
        <motion.div 
          className="rounded-xl border border-[#E5D9C9] bg-white p-6"
          style={{
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <motion.button 
              onClick={() => onNavigate('projects')}
              className="text-sm font-semibold text-[#B87333] hover:text-[#D4A574]"
              whileHover={{ x: 4 }}
            >
              View all
            </motion.button>
          </div>

          <div className="space-y-4">
            {updates.slice(0, 4).map((update, idx) => (
              <motion.div 
                key={idx} 
                className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + idx * 0.1, duration: 0.4 }}
                whileHover={{ x: 8, backgroundColor: 'rgba(184, 115, 51, 0.05)', borderRadius: '8px' }}
              >
                <motion.div 
                  className="w-3 h-3 rounded-full bg-[#B87333] flex-shrink-0 mt-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2 + idx * 0.1, type: "spring", stiffness: 200 }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{update.title || update.message}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {update.created_date ? new Date(update.created_date).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}