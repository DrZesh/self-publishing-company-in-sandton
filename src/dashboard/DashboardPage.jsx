// The page you route to /admin/dashboard. Choose the data source below (see INSTALL.md).
import React, { useMemo, useState } from 'react';
import './mission-control.css';
import MissionControl from './MissionControl.jsx';
import Sidebar from './Sidebar.jsx';
import { demoSource /* , base44Source, supabaseSource */ } from './lib/sources.js';
// import { base44 } from '@/api/base44Client';      // ← current portal (Base44)
// import { supabase } from '@/lib/supabase';         // ← after the Supabase migration

export default function DashboardPage({ withSidebar = true, user, onLogout, onAsk, onDraftFollowUp, onSearch }) {
  // ONE of these:
  const source = useMemo(() => demoSource(), []);
  // const source = useMemo(() => base44Source(base44), []);
  // const source = useMemo(() => supabaseSource(supabase), []);
  const isDemo = true; // set to false once you switch away from demoSource

  const [counts, setCounts] = useState({});
  return (
    <div className="mc-root">
      {withSidebar && <Sidebar counts={counts} user={user || { name: 'Musa Nkanyani', role: 'Admin' }} onLogout={onLogout} />}
      <MissionControl source={source} isDemo={isDemo} onCounts={setCounts} onAsk={onAsk} onDraftFollowUp={onDraftFollowUp} onSearch={onSearch} />
    </div>
  );
}
