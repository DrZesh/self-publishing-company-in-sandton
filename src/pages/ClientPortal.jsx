import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  BookOpen, FileText, CreditCard, FolderOpen, Upload, Calendar, MessageSquare, 
  Star, User, Settings, Bell, CheckCircle, Clock, AlertTriangle, TrendingUp,
  Sparkles, Zap, Truck, PenLine, Download, ExternalLink, ChevronRight, Plus,
  Copy, Shield, Link as LinkIcon, X, Mail, Phone, MapPin, LogOut, HelpCircle
} from 'lucide-react';
import ClientChat from '@/components/portal/ClientChat';
import ChatTab from '@/components/portal/ChatTab';
import NotificationBell from '@/components/portal/NotificationBell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OverviewTabNew from '@/components/portal/OverviewTabNew';
import ProjectsTab from '@/components/portal/ProjectsTab';
import QuotesTab from '@/components/portal/QuotesTab';
import InvoicesTab from '@/components/portal/InvoicesTab';
import DocumentsTab from '@/components/portal/DocumentsTab';
import AppointmentsTab from '@/components/portal/AppointmentsTab';
import PaymentsTab from '@/components/portal/PaymentsTab';
import ProfileTab from '@/components/portal/ProfileTab';
import ClientPortalLayout from '@/components/portal/ClientPortalLayout';
import NoIndexMeta from '@/components/shared/NoIndexMeta';

export default function ClientPortal() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch portal data using token
  useEffect(() => {
    if (!token) {
      toast.error('No portal access token provided');
      navigate('/');
      return;
    }

    const fetchPortalData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await platform.functions.invoke('clientPortalData', {
          action: 'load',
          access_token: token,
        });

        if (response.data.error) {
          setError(response.data.error);
          toast.error(response.data.error);
          setLoading(false);
          return;
        }

        setPortalData(response.data);
        
      } catch (err) {
        console.error('Failed to load portal data:', err);
        setError('Failed to load portal data. Please check your access link.');
        toast.error('Failed to load portal data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FAFAFA] to-[#FFFFFF] flex items-center justify-center">
        <NoIndexMeta title="Client Portal | Creative Books SA" />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#B87333]/20 border-t-[#B87333] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your client portal...</p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FAFAFA] to-[#FFFFFF] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <NoIndexMeta title="Client Portal | Creative Books SA" />
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Portal</h1>
          <p className="text-gray-600 mb-6">{error || 'We could not load your portal details. Please contact Creative Books SA for assistance.'}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/')} className="bg-[#B87333] hover:bg-[#A06828]">
              Return Home
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="border-[#B87333] text-[#B87333] hover:bg-[#B87333]/10">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { contact, portalAccess, allowedSections } = portalData;

  return (
    <ClientPortalLayout 
      contact={contact} 
      portalAccess={portalAccess}
      allowedSections={allowedSections}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      portalData={portalData}
    >
      <NoIndexMeta title="Client Portal | Creative Books SA" />
      {/* Welcome Hero Banner */}
      <div className="mb-8 rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #FFF9F5 0%, #F5EFE8 100%)',
        boxShadow: '0 4px 24px rgba(184, 115, 51, 0.08)',
        border: '1px solid rgba(229, 217, 201, 0.8)'
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 items-center">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#B87333] mb-3">Welcome back</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Good to see you, Creative Books SA</h1>
            <p className="text-gray-700 mb-6 leading-relaxed">Here's a quick look at your publishing journey. You have 1 project in progress and important updates to review.</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white font-semibold hover:shadow-lg transition-all hover:scale-105" style={{
              boxShadow: '0 4px 12px rgba(184, 115, 51, 0.3)'
            }}>
              View My Projects
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-64 h-80">
              <div className="absolute inset-0 rounded-xl overflow-hidden" style={{
                boxShadow: '0 20px 40px rgba(184, 115, 51, 0.15)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=500&fit=crop"
                  alt="Books" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 rounded-xl border border-[#E5D9C9] p-1" style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'projects', label: 'Projects', icon: '📁' },
            { id: 'quotes', label: 'Quotes', icon: '📄' },
            { id: 'invoices', label: 'Invoices', icon: '💳' },
            { id: 'documents', label: 'Documents', icon: '📋' },
            { id: 'appointments', label: 'Book an Appointment', icon: '📅' },
            { id: 'chat', label: 'Chat', icon: '💬' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#1A2B4A] shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{
                borderBottom: activeTab === tab.id ? '3px solid #B87333' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTabNew contact={contact} portalAccess={portalAccess} allowedSections={allowedSections} quotes={portalData.quotes || []} invoices={portalData.invoices || []} projects={portalData.projects || []} documents={portalData.documents || []} receipts={portalData.receipts || []} updates={portalData.updates || []} onNavigate={setActiveTab} />
      )}
      {activeTab === 'projects' && (
        <ProjectsTab contact={contact} projects={portalData.projects || []} />
      )}
      {activeTab === 'quotes' && (
        <QuotesTab contact={contact} quotes={portalData.quotes || []} />
      )}
      {activeTab === 'invoices' && (
        <InvoicesTab contact={contact} invoices={portalData.invoices || []} />
      )}
      {activeTab === 'documents' && (
        <DocumentsTab contact={contact} documents={portalData.documents || []} projectId={portalAccess.project_id} />
      )}
      {activeTab === 'appointments' && (
        <AppointmentsTab contact={contact} appointments={portalData.appointments || []} portalToken={token} />
      )}
      {activeTab === 'chat' && (
        <ChatTab contact={contact} project={portalData.projects?.[0]} />
      )}
    </ClientPortalLayout>
  );
}