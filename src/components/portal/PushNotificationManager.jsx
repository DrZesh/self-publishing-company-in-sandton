import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PushNotificationManager({ enabled, onToggle }) {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        onToggle(true);
        toast.success('Notifications enabled! You\'ll now receive important updates.');
        
        // Test notification
        new Notification('Creative Books SA', {
          body: 'Notifications are now active!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } else if (permission === 'denied') {
        onToggle(false);
        toast.error('Notifications denied. You can enable them in browser settings.');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      toast.error('Failed to enable notifications');
    }
  }, [isSupported, onToggle]);

  const disableNotifications = useCallback(() => {
    onToggle(false);
    toast.info('Notifications disabled');
  }, [onToggle]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      {enabled && permission === 'granted' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={disableNotifications}
          className="gap-2 border-[#B87333]/20 text-[#D4A574] hover:bg-[#B87333]/10"
        >
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">Notifications On</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={requestPermission}
          className="gap-2 border-[#B87333]/20 text-gray-400 hover:bg-[#B87333]/10 hover:text-[#D4A574]"
        >
          <BellOff className="w-4 h-4" />
          <span className="hidden sm:inline">Enable Notifications</span>
        </Button>
      )}
    </div>
  );
}

// Utility function to send push notifications
export function sendPushNotification(title, options) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      ...options,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
    });
  }
}

// Notification types for different events
export const NotificationTypes = {
  PROJECT_UPDATE: 'Project Update',
  PAYMENT_RECEIVED: 'Payment Confirmed',
  DOCUMENT_READY: 'Document Available',
  APPROVAL_REQUIRED: 'Action Required',
  MESSAGE_RECEIVED: 'New Message',
  APPOINTMENT_REMINDER: 'Appointment Reminder',
  DEADLINE_APPROACHING: 'Deadline Alert',
};

// Helper to format notification based on type
export function createNotification(type, title, body, onClick) {
  const notification = new Notification(`${NotificationTypes[type]}: ${title}`, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: type, // Group notifications by type
    requireInteraction: type === 'APPROVAL_REQUIRED' || type === 'DEADLINE_APPROACHING',
  });

  if (onClick) {
    notification.onclick = (event) => {
      event.preventDefault();
      onClick();
    };
  }

  return notification;
}