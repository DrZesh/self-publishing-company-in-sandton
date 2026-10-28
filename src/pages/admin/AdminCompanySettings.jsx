import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCompanySettings } from '@/lib/useCompanySettings';
import CompanySettingsForm from '@/components/admin/settings/CompanySettingsForm';
import { Loader2 } from 'lucide-react';

export default function AdminCompanySettings() {
  const { settings, isLoading, refetch } = useCompanySettings();

  return (
    <AdminLayout>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Company Settings</h1>
          <p className="text-sm text-white/50 mt-0.5">Company details, banking information, and financial defaults used on all documents</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#B87333]" />
          </div>
        ) : (
          <CompanySettingsForm settings={settings} onSaved={refetch} />
        )}
      </div>
      </div>
    </AdminLayout>
  );
}