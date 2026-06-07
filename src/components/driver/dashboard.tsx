'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Shield,
  LayoutDashboard,
  Activity,
  CheckCheck,
  User,
  Phone,
  FileText,
  Navigation,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { mockReports, mockResponseTeams, mockAdminReports, mockVehicles } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import type { EmergencyReport, PriorityLevel, ReportStatus } from '@/lib/types';
import { toast } from 'sonner';

// ─── Style Maps ──────────────────────────────────────────────────
const priorityStyles: Record<PriorityLevel, string> = {
  low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusStyles: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  acknowledged: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  dispatched: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  invalid: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const INCIDENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Medical Emergency': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Disaster: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Vehicular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Trauma: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  Service: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

function getTypeBadge(type: string) {
  const style = INCIDENT_COLORS[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  return (
    <Badge className={`${style} border-0 text-xs`}>
      {type}
    </Badge>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Current Driver Info (demo) ──────────────────────────────────
// In a real app, this would come from the auth context / current user
const CURRENT_DRIVER = {
  name: 'Roberto Guzman',
  teamId: 'TM001',
  teamName: 'Team A',
  plateNumber: 'ABX 1234',
  licenseId: 'DL-2024-0089',
};

// ─── Main Component ──────────────────────────────────────────────
export function DriverDashboard() {
  const { navigateTo } = useAppStore();
  const [localReports, setLocalReports] = useState<EmergencyReport[]>([...mockReports]);

  // For demo: show dispatched/acknowledged reports as assigned to current driver
  const activeAssignments = useMemo(
    () =>
      localReports
        .filter((r) => r.status === 'dispatched' || r.status === 'acknowledged')
        .sort((a, b) => {
          // Sort: dispatched first (needs action), then by priority (critical first), then by time
          if (a.status === 'dispatched' && b.status !== 'dispatched') return -1;
          if (a.status !== 'dispatched' && b.status === 'dispatched') return 1;
          const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          const pDiff = (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
          if (pDiff !== 0) return pDiff;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }),
    [localReports]
  );

  const dispatchedCount = useMemo(
    () => localReports.filter((r) => r.status === 'dispatched').length,
    [localReports]
  );

  const acknowledgedCount = useMemo(
    () => localReports.filter((r) => r.status === 'acknowledged').length,
    [localReports]
  );

  const recentCompleted = useMemo(
    () =>
      localReports
        .filter((r) => r.status === 'resolved')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3),
    [localReports]
  );

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return localReports.filter(
      (r) => r.status === 'resolved' && r.timestamp.startsWith(today)
    ).length;
  }, [localReports]);

  // Get the team vehicle for auto-filled info
  const teamVehicle = useMemo(
    () => mockVehicles.find((v) => v.teamId === CURRENT_DRIVER.teamId),
    []
  );

  const getTeamName = (teamId?: string) => {
    if (!teamId) return 'Unassigned';
    const team = mockResponseTeams.find((t) => t.id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  // Get admin report data for auto-filled fields
  const getAdminReport = (reportId: string) => {
    return mockAdminReports.find((ar) => ar.reportId === reportId);
  };

  const handleAcknowledge = (reportId: string) => {
    setLocalReports((prev) =>
      prev.map((r) =>
        r.id === reportId && r.status === 'dispatched'
          ? {
              ...r,
              status: 'acknowledged' as ReportStatus,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: CURRENT_DRIVER.name,
            }
          : r
      )
    );
    toast.success('Assignment acknowledged! Dispatcher has been notified.', {
      description: `Report ${reportId} has been acknowledged and the dispatcher is informed.`,
      duration: 4000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <LayoutDashboard className="size-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">My Assignments</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back, {CURRENT_DRIVER.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-0 gap-1 px-3 py-1">
            <Shield className="size-3" />
            {CURRENT_DRIVER.teamName}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 gap-1 px-3 py-1">
            <Truck className="size-3" />
            {teamVehicle?.plateNumber || CURRENT_DRIVER.plateNumber}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-indigo-200 dark:border-indigo-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-indigo-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {activeAssignments.length}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-blue-200 dark:border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Navigation className="size-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Dispatched</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dispatchedCount}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-cyan-200 dark:border-cyan-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-cyan-500" />
                <span className="text-sm text-muted-foreground">Acknowledged</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {acknowledgedCount}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-green-200 dark:border-green-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCheck className="size-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {completedToday}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Assignments - TOP PRIORITY */}
      <Card className="border-indigo-200 dark:border-indigo-800/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-indigo-500" />
            <CardTitle>Active Assignments</CardTitle>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-0">
              {activeAssignments.length}
            </Badge>
          </div>
          <CardDescription>
            Reports assigned to you — acknowledge dispatched assignments immediately
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            {activeAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="size-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No active assignments
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;re all caught up! New assignments will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 px-4 pb-4">
                <AnimatePresence mode="popLayout">
                  {activeAssignments.map((report, index) => {
                    const adminReport = getAdminReport(report.id);
                    const isDispatched = report.status === 'dispatched';
                    const isAcknowledged = report.status === 'acknowledged';

                    return (
                      <motion.div
                        key={report.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <Card className={`overflow-hidden transition-all ${
                          isDispatched
                            ? 'border-indigo-300 dark:border-indigo-700 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20'
                            : 'border-border/50'
                        }`}>
                          <CardContent className="p-0">
                            {/* Priority stripe at top */}
                            <div className={`h-1 w-full ${
                              report.priority === 'critical'
                                ? 'bg-red-500'
                                : report.priority === 'high'
                                ? 'bg-orange-500'
                                : report.priority === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`} />

                            <div className="p-4">
                              {/* Top row: badges and time */}
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                                      {report.id}
                                    </span>
                                    {getTypeBadge(report.type)}
                                    <Badge className={`${priorityStyles[report.priority]} border-0 text-xs capitalize`}>
                                      {report.priority}
                                    </Badge>
                                    <Badge className={`${statusStyles[report.status]} border-0 text-xs capitalize`}>
                                      {report.status}
                                    </Badge>
                                  </div>

                                  {/* Location */}
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="size-3.5 text-indigo-500 shrink-0" />
                                    <span className="text-sm font-medium truncate">{report.location}</span>
                                  </div>

                                  {/* Description */}
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {report.description}
                                  </p>

                                  {/* Reporter info */}
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="size-3" />
                                      <span>{report.reportedBy.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Phone className="size-3" />
                                      <span>{report.reportedBy.contact}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Time & Status */}
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    <span>{getTimeAgo(report.timestamp)}</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatTimestamp(report.timestamp)}
                                  </span>
                                </div>
                              </div>

                              {/* Auto-filled info display */}
                              <Separator className="my-3" />
                              <div className="rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 p-3 space-y-2">
                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                  Pre-populated Assignment Info
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div className="flex items-center gap-2">
                                    <User className="size-3.5 text-indigo-400" />
                                    <div>
                                      <p className="text-[10px] text-muted-foreground">Driver</p>
                                      <p className="text-xs font-medium">
                                        {adminReport?.driver?.driverName || CURRENT_DRIVER.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Truck className="size-3.5 text-indigo-400" />
                                    <div>
                                      <p className="text-[10px] text-muted-foreground">Plate No.</p>
                                      <p className="text-xs font-medium">
                                        {adminReport?.driver?.governmentCardPlateNo
                                          ? adminReport.driver.governmentCardPlateNo.split(' / ')[1]
                                          : CURRENT_DRIVER.plateNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Shield className="size-3.5 text-indigo-400" />
                                    <div>
                                      <p className="text-[10px] text-muted-foreground">Team</p>
                                      <p className="text-xs font-medium">
                                        {getTeamName(report.assignedTeam)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Acknowledge Button or Acknowledged Badge */}
                              <div className="mt-3">
                                {isDispatched && (
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Button
                                      onClick={() => handleAcknowledge(report.id)}
                                      className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all"
                                      size="lg"
                                    >
                                      <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                      >
                                        <CheckCircle2 className="size-5" />
                                      </motion.div>
                                      ACKNOWLEDGE ASSIGNMENT
                                    </Button>
                                  </motion.div>
                                )}
                                {isAcknowledged && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                  >
                                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                      ✓ Acknowledged
                                    </span>
                                    {report.acknowledgedAt && (
                                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                                        at {formatTimestamp(report.acknowledgedAt)}
                                      </span>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Completed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCheck className="size-5 text-green-500" />
              <CardTitle>Recent Completed</CardTitle>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                {recentCompleted.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('driver-reports')}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 gap-1"
            >
              <FileText className="size-3.5" />
              View All Reports
            </Button>
          </div>
          <CardDescription>Your recently resolved incidents</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-96">
            {recentCompleted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCheck className="size-10 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">No completed assignments yet</p>
              </div>
            ) : (
              <div className="space-y-2 px-4 pb-4">
                {recentCompleted.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-lg border border-border/50 bg-card p-3 transition-all hover:bg-muted/30">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground">{report.id}</span>
                            {getTypeBadge(report.type)}
                            <Badge className={`${priorityStyles[report.priority]} border-0 text-xs capitalize`}>
                              {report.priority}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">
                              ✓ Resolved
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">{report.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="size-3" />
                          <span>{formatTimestamp(report.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
