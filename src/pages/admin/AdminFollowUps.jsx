import AdminLayout from '@/components/admin/AdminLayout';
import SmartFollowUpCenter from '@/components/admin/dashboard/SmartFollowUpCenter';
import { Zap } from 'lucide-react';

export default function AdminFollowUps() {
  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 lg:-m-7 p-6 lg:p-7 relative"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(20,30,80,0.88) 0%, rgba(60,20,80,0.82) 50%, rgba(10,40,80,0.88) 100%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-400" /> Smart Follow-up Centre
            </h1>
            <p className="text-sm text-white/50 mt-0.5">AI-powered client engagement — identify who needs attention and send personalised follow-ups instantly</p>
          </div>
          <SmartFollowUpCenter />
        </div>
      </div>
    </AdminLayout>
  );
}