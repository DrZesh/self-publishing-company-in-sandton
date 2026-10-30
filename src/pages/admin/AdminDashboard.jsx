// Admin dashboard: "Mission Control" design, live data from the CRM and Quote to Cash.
// The previous dashboard is kept in AdminDashboardLegacy.jsx and still available at /admin/dashboard-classic.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import MissionControl from '@/dashboard/MissionControl.jsx';
import { liveSource } from '@/dashboard/lib/liveSource.js';
import '@/dashboard/mission-control.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const source = useMemo(() => liveSource(), []);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    let live = true;
    platform.auth.me().then((u) => { if (live && u?.full_name) setFirstName(u.full_name.split(' ')[0]); }).catch(() => {});
    return () => { live = false; };
  }, []);

  return (
    <AdminLayout>
      <div className="mc-root mc-embedded -m-6 lg:-m-7">
        <MissionControl
          source={source}
          firstName={firstName}
          onDraftFollowUp={() => navigate('/admin/follow-ups')}
          onSearch={(q) => navigate(`/admin/contacts?q=${encodeURIComponent(q)}`)}
        />
      </div>
    </AdminLayout>
  );
}
