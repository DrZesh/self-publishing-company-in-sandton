import React from 'react';
import { Bell, MessageSquare, FileText, CheckCircle, AlertTriangle, Calendar, CreditCard, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  project: CheckCircle,
  message: MessageSquare,
  document: FileText,
  approval: AlertTriangle,
  payment: CreditCard,
  appointment: Calendar,
  review: Star,
};

const colorMap = {
  project: 'from-green-600 to-emerald-600',
  message: 'from-blue-600 to-cyan-600',
  document: 'from-purple-600 to-violet-600',
  approval: 'from-orange-600 to-amber-600',
  payment: 'from-green-600 to-teal-600',
  appointment: 'from-pink-600 to-rose-600',
  review: 'from-yellow-600 to-orange-600',
};

export default function NotificationToast({ type, title, message, timestamp, onClick }) {
  const Icon = iconMap[type] || Bell;
  const colors = colorMap[type] || colorMap.message;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 cursor-pointer",
        "bg-gradient-to-r shadow-lg",
        "hover:shadow-xl transition-all duration-200",
        "animate-in slide-in-from-right-8 fade-in",
        colors
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMHptLTQwIDBoNDBWMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
      
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{title}</p>
          <p className="text-white/80 text-xs mt-1 line-clamp-2">{message}</p>
          {timestamp && (
            <p className="text-white/60 text-[10px] mt-2">
              {timestamp.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
        <div className="h-full bg-white/60 w-full animate-[shrink_5s_linear_forwards]" />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}