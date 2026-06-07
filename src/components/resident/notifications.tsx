'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { mockResidentNotifications } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  CalendarCheck,
  CalendarX,
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Inbox,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const typeIcons: Record<string, typeof Bell> = {
  schedule_confirmed: CalendarCheck,
  schedule_cancelled: CalendarX,
  report_update: AlertCircle,
  general: Bell,
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  schedule_confirmed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-l-emerald-500',
  },
  schedule_cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-l-red-500',
  },
  report_update: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-l-orange-500',
  },
  general: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-l-gray-500',
  },
};

export function ResidentNotifications() {
  const { currentUser } = useAppStore();
  const residentId = currentUser?.id || 'RES001';

  const [notifications, setNotifications] = useState(
    mockResidentNotifications.filter((n) => n.residentId === residentId)
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-emerald-900">Notifications</h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'You\'re all caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-emerald-100">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">
                  Notifications about your reports and schedules will appear here
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[70vh]">
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {notifications.map((notification, idx) => {
                      const Icon = typeIcons[notification.type] || Bell;
                      const colors = typeColors[notification.type] || typeColors.general;

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.04, duration: 0.3 }}
                          className={`relative cursor-pointer transition-all duration-200 ${
                            !notification.read
                              ? `${colors.border} border-l-4 bg-emerald-50/30 hover:bg-emerald-50/60`
                              : 'border-l-4 border-l-transparent hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id);
                              toast.success('Notification marked as read', {
                                duration: 1500,
                              });
                            }
                          }}
                        >
                          <div className="flex items-start gap-3 p-4">
                            {/* Icon */}
                            <div
                              className={`h-9 w-9 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                            >
                              <Icon className={`h-4 w-4 ${colors.text}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`text-sm font-medium ${
                                        !notification.read
                                          ? 'text-gray-900'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                                    )}
                                  </div>
                                  <p
                                    className={`text-xs mt-0.5 leading-relaxed ${
                                      !notification.read
                                        ? 'text-gray-700'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  {!notification.read && (
                                    <Badge
                                      variant="outline"
                                      className="text-[8px] px-1 py-0 bg-emerald-50 text-emerald-600 border-emerald-200"
                                    >
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 text-xs text-muted-foreground pb-2"
        >
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Unread: {unreadCount}
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            Read: {notifications.length - unreadCount}
          </span>
          <span>Total: {notifications.length}</span>
        </motion.div>
      )}
    </div>
  );
}
