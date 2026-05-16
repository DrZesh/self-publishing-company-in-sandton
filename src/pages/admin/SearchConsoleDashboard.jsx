import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
    <div className="min-h-screen bg-[#F9F7F2] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#B87333] flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#1A1208]">Google Search Console</h1>
          </div>
          <p className="text-sm text-black/50 ml-12">SEO & search analytics for creativebooks.co.za</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm border border-black/8 w-fit">
          {TABS.map(({ key, label, IconComp }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-[#B87333] text-white shadow'
                  : 'text-black/50 hover:text-black/80'
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
  );
}