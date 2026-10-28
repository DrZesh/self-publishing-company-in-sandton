import React, { useState } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Settings, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function AdminZohoBooks() {
  const [config, setConfig] = useState({
    client_id: '',
    client_secret: '',
    refresh_token: '',
    organization_id: '',
  });
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await platform.functions.invoke('zohoBooksIntegration', { action: 'zoho_contact_list' });
      if (result.data.contacts !== undefined) {
        setConnected(true);
        toast.success('Connected to Zoho Books successfully!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      setConnected(false);
      toast.error(error.message || 'Connection failed. Check your credentials.');
    } finally {
      setTesting(false);
    }
  };

  const handleSyncContacts = async () => {
    try {
      const result = await platform.functions.invoke('zohoBooksIntegration', { action: 'zoho_sync_contacts' });
      if (result.data.success) {
        toast.success(`Synced ${result.data.synced_count} contacts to Zoho Books`);
      } else {
        throw new Error(result.data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error(error.message || 'Sync failed');
    }
  };

  const handleSyncInvoices = async () => {
    try {
      const result = await platform.functions.invoke('zohoBooksIntegration', { action: 'zoho_sync_invoices' });
      if (result.data.success) {
        toast.success(`Synced ${result.data.synced_count} invoices to Zoho Books`);
      } else {
        throw new Error(result.data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error(error.message || 'Sync failed');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow">Zoho Books Integration</h1>
          <p className="text-sm text-white/60 mt-0.5">Sync invoices, contacts, and payments with Zoho Books</p>
        </div>

        {/* Connection Status */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-green-700">Z</span>
              </div>
              <div>
                <h2 className="font-semibold text-white">Zoho Books</h2>
                <p className="text-sm text-white/50">Accounting Integration</p>
              </div>
            </div>
            {connected ? (
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white/40">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Not Connected</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
                Client ID
              </label>
              <Input
                value={config.client_id}
                onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
                placeholder="Enter Zoho OAuth Client ID"
                className="text-white placeholder:text-white/30 bg-white/10 border-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
                Client Secret
              </label>
              <Input
                type="password"
                value={config.client_secret}
                onChange={(e) => setConfig({ ...config, client_secret: e.target.value })}
                placeholder="Enter Zoho OAuth Client Secret"
                className="text-white placeholder:text-white/30 bg-white/10 border-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
                Refresh Token
              </label>
              <Input
                value={config.refresh_token}
                onChange={(e) => setConfig({ ...config, refresh_token: e.target.value })}
                placeholder="Enter Zoho OAuth Refresh Token"
                className="text-white placeholder:text-white/30 bg-white/10 border-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
                Organization ID
              </label>
              <Input
                value={config.organization_id}
                onChange={(e) => setConfig({ ...config, organization_id: e.target.value })}
                placeholder="Enter Zoho Books Organization ID"
                className="text-white placeholder:text-white/30 bg-white/10 border-white/20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleTestConnection}
                disabled={testing}
                className="bg-[#B87333] hover:bg-[#A06828] text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </div>
        </div>

        {/* Sync Actions */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 className="font-semibold text-white mb-4">Sync Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleSyncContacts} className="h-20 flex-col gap-2 text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <RefreshCw className="w-5 h-5" />
              <span>Sync Contacts</span>
            </Button>
            <Button onClick={handleSyncInvoices} className="h-20 flex-col gap-2 text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <RefreshCw className="w-5 h-5" />
              <span>Sync Invoices</span>
            </Button>
          </div>
          <p className="text-xs text-white/40 mt-4">
            Sync will match local records with Zoho Books and store the Zoho ID for future updates.
          </p>
        </div>

        {/* Setup Guide */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Setup Instructions
          </h3>
          <ol className="space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Go to <a href="https://api-console.zoho.com" target="_blank" className="underline text-orange-300 flex items-center gap-1">Zoho API Console <ExternalLink className="w-3 h-3"/></a></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Create a new OAuth client for Zoho Books</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Copy the Client ID and Client Secret</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Generate an OAuth refresh token using the authorization flow</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">5.</span>
              <span>Find your Organization ID in Zoho Books settings</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">6.</span>
              <span>Enter all credentials above and click "Test Connection"</span>
            </li>
          </ol>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}