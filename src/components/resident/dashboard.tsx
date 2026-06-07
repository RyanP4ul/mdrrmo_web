'use client';

import { useAppStore } from '@/lib/store';
import { mockResidentReports, mockServiceSchedules, mockResidentNotifications } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, AlertTriangle, CalendarCheck, Bell, Clock, MapPin, ChevronRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  dispatched: 'bg-blue-100 text-blue-800 border-blue-200',
  acknowledged: 'bg-orange-100 text-orange-800 border-orange-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  invalid: 'bg-gray-100 text-gray-600 border-gray-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export function ResidentDashboard() {
  const { navigateTo, currentUser } = useAppStore();
  const residentId = currentUser?.id || 'RES001';

  // Filter data for current resident
  const myReports = mockResidentReports.filter((r) => r.residentId === residentId);
  const recentReports = myReports.slice(0, 3);
  const mySchedules = mockServiceSchedules.filter((s) => s.residentId === residentId);
  const pendingSchedules = mySchedules.filter(
    (s) => s.status === 'pending' || s.status === 'acknowledged'
  );
  const myNotifications = mockResidentNotifications.filter((n) => n.residentId === residentId);
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const handleEmergencyCall = () => {
    toast.success('Calling MDRRMO...', {
      description: 'Emergency hotline connected. Help is on the way.',
      duration: 3000,
    });
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {/* Emergency Call Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={handleEmergencyCall}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98] group"
        >
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative flex items-center justify-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Phone className="h-8 w-8 md:h-10 md:w-10" />
            </motion.div>
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide">CALL MDRRMO</h2>
              <p className="text-emerald-100 text-sm md:text-base">Emergency Hotline — Tap to Call</p>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card
            className="cursor-pointer border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-emerald-50/50"
            onClick={() => navigateTo('resident-report')}
          >
            <CardContent className="p-4 md:p-6 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-emerald-900">Report Emergency</p>
                <p className="text-xs text-muted-foreground mt-0.5">Submit a report</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Card
            className="cursor-pointer border-teal-200 hover:border-teal-400 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-teal-50/50"
            onClick={() => navigateTo('resident-schedule')}
          >
            <CardContent className="p-4 md:p-6 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-teal-900">Schedule Service</p>
                <p className="text-xs text-muted-foreground mt-0.5">Book assistance</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-emerald-700">{myReports.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">My Reports</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-amber-600">{pendingSchedules.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="cursor-pointer"
          onClick={() => navigateTo('resident-notifications')}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-rose-600">{unreadCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Unread</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <Card className="border-emerald-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-emerald-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                Recent Reports
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs"
                onClick={() => navigateTo('resident-history')}
              >
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reports yet</p>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="space-y-3">
                  {recentReports.map((report, idx) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 hover:bg-emerald-50/50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">{report.type}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${statusColors[report.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {report.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${priorityColors[report.priority] || ''}`}
                          >
                            {report.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{report.location}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">{formatTimestamp(report.timestamp)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Schedules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <Card className="border-teal-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-teal-900 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-teal-600" />
                Pending Schedules
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 text-xs"
                onClick={() => navigateTo('resident-schedule')}
              >
                Manage <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingSchedules.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending schedules</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 hover:bg-teal-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">{schedule.serviceType}</p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.preferredDate} at {schedule.preferredTime}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusColors[schedule.status] || 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {schedule.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Unread Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <Card
          className="border-rose-100 cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigateTo('resident-notifications')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Bell className="h-6 w-6 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">
                {unreadCount > 0 ? `${unreadCount} Unread Notification${unreadCount !== 1 ? 's' : ''}` : 'No Unread Notifications'}
              </p>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? 'Tap to view your notifications' : 'You\'re all caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="h-6 w-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
