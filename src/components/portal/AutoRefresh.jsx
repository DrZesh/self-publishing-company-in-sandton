import React, { useState, useEffect } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AutoRefresh({ onRefresh, intervalMs = 60000, enabled = true }) {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [countdown, setCountdown] = useState(intervalMs / 1000);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !isOnline) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return intervalMs / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, isOnline, intervalMs]);

  const handleRefresh = async () => {
    if (isRefreshing || !isOnline) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
      toast.success('Data refreshed');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
      setCountdown(intervalMs / 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        isOnline
          ? "bg-[#1A1A2E]/50 text-gray-400 border border-[#B87333]/10"
          : "bg-red-900/20 text-red-400 border border-red-500/20"
      )}>
        {isOnline ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Auto-refresh in {formatTime(countdown)}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={isRefreshing || !isOnline}
        className="w-8 h-8 text-gray-400 hover:text-[#D4A574]"
      >
        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
      </Button>
    </div>
  );
}