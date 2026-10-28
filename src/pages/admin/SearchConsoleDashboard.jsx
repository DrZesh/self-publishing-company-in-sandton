import React, { useState } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import SearchPerformance from '../../components/searchconsole/SearchPerformance';
import SitemapManager from '../../components/searchconsole/SitemapManager';
import UrlInspector from '../../components/searchconsole/UrlInspector';
import { BarChart2, Map, Search, Globe } from 'lucide-react';

const TABS = [
  { key: 'performance', label: 'Search Performance', IconComp: BarChart2 },
  { key: 'queries', label: 'Top Queries', IconComp: Search },
  { key: 'sitemaps', label: 'Sitemaps', IconComp: Map },
  { key: 'inspect', label: 'URL Inspector', IconComp: Globe },
];

export default function SearchConsoleDashboard() {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <AdminLayout>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#B87333] flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Google Search Console</h1>
          </div>
          <p className="text-sm text-white/50 ml-12">SEO & search analytics for creativebooks.co.za</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl p-1 w-fit overflow-x-auto" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {TABS.map(({ key, label, IconComp }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === key
                  ? 'bg-[#B87333] text-white shadow'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {(activeTab === 'performance' || activeTab === 'queries') && (
          <SearchPerformance mode={activeTab} />
        )}
        {activeTab === 'sitemaps' && <SitemapManager />}
        {activeTab === 'inspect' && <UrlInspector />}
      </div>
      </div>
    </AdminLayout>
  );
}