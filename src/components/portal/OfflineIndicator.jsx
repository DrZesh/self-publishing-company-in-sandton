import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-in slide-in-from-top-2",
      isOnline
        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
        : "bg-gradient-to-r from-red-600 to-rose-600 text-white"
    )}>
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-semibold text-sm">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-semibold text-sm">You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}