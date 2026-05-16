import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import GscDashboardSection from '@/components/admin/gsc/GscDashboardSection';

export default function AdminDashboard() {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await base44.functions.invoke('getAdminDashboardMetrics', {});
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-[#0B1220] mb-2">
            Good {timeOfDay}, Owner
          </h1>
          <p className="text-[#2B2B2B]/60">{currentDate}</p>
          <p className="text-sm text-[#2B2B2B]/40 mt-1">
            Here's what's happening on Creative Books SA today.
          </p>
        </motion.div>

        {/* KPI Cards - Row 1 */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="p-6 bg-white rounded-lg border border-[#ddd]/50"
           >
             <p className="text-[#2B2B2B]/60 text-sm font-medium mb-2">Total Submissions</p>
             <p className="text-4xl font-bold text-[#0B1220]">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics?.metrics?.totalSubmissions || 0}</p>
             <p className="text-xs text-[#2B2B2B]/50 mt-2">All time</p>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="p-6 bg-white rounded-lg border border-[#ddd]/50"
           >
             <p className="text-[#2B2B2B]/60 text-sm font-medium mb-2">New Submissions</p>
             <p className="text-4xl font-bold text-[#0B1220]">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics?.metrics?.newSubmissions || 0}</p>
             <p className="text-xs text-[#2B2B2B]/50 mt-2">Waiting for response</p>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="p-6 bg-white rounded-lg border border-[#ddd]/50"
           >
             <p className="text-[#2B2B2B]/60 text-sm font-medium mb-2">Open Leads</p>
             <p className="text-4xl font-bold text-[#0B1220]">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics?.metrics?.openLeads || 0}</p>
             <p className="text-xs text-[#2B2B2B]/50 mt-2">In pipeline</p>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="p-6 bg-white rounded-lg border border-[#ddd]/50"
           >
             <p className="text-[#2B2B2B]/60 text-sm font-medium mb-2">Pipeline Value</p>
             <p className="text-4xl font-bold text-[#0B1220]">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'R' + (metrics?.metrics?.pipelineValue || 0).toLocaleString()}</p>
             <p className="text-xs text-[#2B2B2B]/50 mt-2">Total ZAR</p>
           </motion.div>
         </div>

        {/* Search Console Section */}
        <GscDashboardSection />

        {/* Placeholder for future sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 p-6 bg-white rounded-lg border border-[#ddd]/50"
          >
            <h3 className="text-lg font-bold text-[#0B1220] mb-4">Pipeline Funnel</h3>
            <div className="h-32 flex items-center justify-center text-[#2B2B2B]/40">
              Loading...
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-white rounded-lg border border-[#ddd]/50"
          >
            <h3 className="text-lg font-bold text-[#0B1220] mb-4">Recent Activity</h3>
            <div className="h-32 flex items-center justify-center text-[#2B2B2B]/40">
              No activity yet
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}