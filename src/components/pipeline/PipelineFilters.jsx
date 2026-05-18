import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

export default function PipelineFilters({ search, onSearch, ownerFilter, onOwnerFilter, owners, view, onView }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search by name or book title…"
          className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white"
        />
      </div>

      <select
        value={ownerFilter}
        onChange={e => onOwnerFilter(e.target.value)}
        className="px-3 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white"
      >
        <option value="">All Owners</option>
        {owners.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      <div className="flex items-center border border-black/10 rounded-xl overflow-hidden">
        <button
          onClick={() => onView('kanban')}
          className={`p-2.5 ${view === 'kanban' ? 'bg-[#B87333] text-white' : 'bg-white text-black/50 hover:bg-black/5'}`}
          title="Kanban view"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onView('list')}
          className={`p-2.5 ${view === 'list' ? 'bg-[#B87333] text-white' : 'bg-white text-black/50 hover:bg-black/5'}`}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}