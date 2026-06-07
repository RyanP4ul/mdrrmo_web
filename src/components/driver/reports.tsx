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
  FileText,
  User,
  Phone,
  Heart,
  Activity,
  Droplets,
  Wind,
  Thermometer,
  Car,
  Fuel,
  ClipboardList,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Current Driver Info ─────────────────────────────────────────
const CURRENT_DRIVER = {
  name: 'Roberto Guzman',
  teamId: 'TM001',
  teamName: 'Team A',
  plateNumber: 'ABX 1234',
  licenseId: 'DL-2024-0089',
};

// ─── Report Detail Dialog ────────────────────────────────────────
function ReportDetailDialog({
  report,
  open,
  onOpenChange,
  onAcknowledge,
}: {
  report: EmergencyReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: (id: string) => void;
}) {
  if (!report) return null;

  const adminReport = mockAdminReports.find((ar) => ar.reportId === report.id);
  const isDispatched = report.status === 'dispatched';
  const team = mockResponseTeams.find((t) => t.id === report.assignedTeam);
  const teamVehicle = mockVehicles.find((v) => v.teamId === report.assignedTeam);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <FileText className="size-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Report {report.id}
              </DialogTitle>
              <DialogDescription>
                {report.type} incident details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status & Priority Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {getTypeBadge(report.type)}
            <Badge className={`${priorityStyles[report.priority]} border-0 text-xs capitalize`}>
              {report.priority}
            </Badge>
            <Badge className={`${statusStyles[report.status]} border-0 text-xs capitalize`}>
              {report.status}
            </Badge>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{report.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Time Reported</p>
                <p className="text-sm font-medium">{formatTimestamp(report.timestamp)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="size-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Reported By</p>
                <p className="text-sm font-medium">{report.reportedBy.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Contact</p>
                <p className="text-sm font-medium">{report.reportedBy.contact}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3">
              {report.description}
            </p>
          </div>

          <Separator />

          {/* Emergency Form Fields */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="size-4 text-red-500" />
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Emergency Section
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <User className="size-3 text-muted-foreground" />
                  Patient Name
                </Label>
                <Input
                  value={adminReport?.emergency?.patientName || ''}
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Location</Label>
                <Input
                  value={adminReport?.emergency?.location || report.location}
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Incident Type</Label>
                <Input
                  value={adminReport?.emergency?.typeOfIncident || report.type}
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Time of Arrival</Label>
                <Input
                  value={adminReport?.emergency?.timeOfArrival || ''}
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
            </div>

            {/* Vital Signs */}
            <div className="mt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Activity className="size-3" />
                Vital Signs
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Droplets className="size-2.5" />
                    Blood Pressure
                  </Label>
                  <Input
                    value={adminReport?.emergency?.vitalSigns?.bloodPressure || ''}
                    readOnly
                    className="h-7 text-xs bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Heart className="size-2.5" />
                    Pulse Rate
                  </Label>
                  <Input
                    value={adminReport?.emergency?.vitalSigns?.pulseRate || ''}
                    readOnly
                    className="h-7 text-xs bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Wind className="size-2.5" />
                    Respiration
                  </Label>
                  <Input
                    value={adminReport?.emergency?.vitalSigns?.respiration || ''}
                    readOnly
                    className="h-7 text-xs bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Driver Ticket Form Fields */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Car className="size-4 text-indigo-500" />
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Driver Ticket Section
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <User className="size-3 text-muted-foreground" />
                  Driver Name
                </Label>
                <Input
                  value={adminReport?.driver?.driverName || CURRENT_DRIVER.name}
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Car className="size-3 text-muted-foreground" />
                  Plate Number
                </Label>
                <Input
                  value={
                    adminReport?.driver?.governmentCardPlateNo
                      ? adminReport.driver.governmentCardPlateNo.split(' / ')[1] || adminReport.driver.governmentCardPlateNo
                      : CURRENT_DRIVER.plateNumber
                  }
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <ClipboardList className="size-3 text-muted-foreground" />
                  Purpose
                </Label>
                <Input
                  value={adminReport?.driver?.purpose || ''}
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <MapPin className="size-3 text-muted-foreground" />
                  Place Visited/Inspected
                </Label>
                <Input
                  value={adminReport?.driver?.placeVisitedInspected || ''}
                  readOnly
                  className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                />
              </div>
            </div>

            {/* Gasoline */}
            {adminReport?.driver?.gasoline && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Fuel className="size-3" />
                  Gasoline Record
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Balance in Tank</Label>
                    <Input
                      value={adminReport.driver.gasoline.balanceInTank}
                      readOnly
                      className="h-7 text-xs bg-muted/30 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Issued by Office</Label>
                    <Input
                      value={adminReport.driver.gasoline.issuedByOffice}
                      readOnly
                      className="h-7 text-xs bg-muted/30 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">As Purchased</Label>
                    <Input
                      value={adminReport.driver.gasoline.asPurchased}
                      readOnly
                      className="h-7 text-xs bg-muted/30 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Deduct Used</Label>
                    <Input
                      value={adminReport.driver.gasoline.deductUsed}
                      readOnly
                      className="h-7 text-xs bg-muted/30 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Balance End Trip</Label>
                    <Input
                      value={adminReport.driver.gasoline.balanceEndTrip}
                      readOnly
                      className="h-7 text-xs bg-muted/30 border-border/50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acknowledge Button (if dispatched) */}
          {isDispatched && (
            <>
              <Separator />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => {
                    onAcknowledge(report.id);
                    onOpenChange(false);
                  }}
                  className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export function DriverReports() {
  const { navigateTo } = useAppStore();
  const [localReports, setLocalReports] = useState<EmergencyReport[]>([...mockReports]);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter reports assigned to the current driver's team
  const driverReports = useMemo(() => {
    // For demo: show reports that are dispatched, acknowledged, or resolved
    // (as these would be assigned to teams)
    return localReports
      .filter((r) =>
        r.status === 'dispatched' ||
        r.status === 'acknowledged' ||
        r.status === 'resolved'
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [localReports]);

  const filteredReports = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return driverReports.filter(
          (r) => r.status === 'dispatched' || r.status === 'acknowledged'
        );
      case 'completed':
        return driverReports.filter((r) => r.status === 'resolved');
      default:
        return driverReports;
    }
  }, [driverReports, activeTab]);

  const handleViewReport = (report: EmergencyReport) => {
    setSelectedReport(report);
    setDialogOpen(true);
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
      description: `Report ${reportId} has been acknowledged.`,
      duration: 4000,
    });
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return 'Unassigned';
    const team = mockResponseTeams.find((t) => t.id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const activeCount = driverReports.filter(
    (r) => r.status === 'dispatched' || r.status === 'acknowledged'
  ).length;
  const completedCount = driverReports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <FileText className="size-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            All reports assigned to {CURRENT_DRIVER.name} ({CURRENT_DRIVER.teamName})
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="gap-1.5">
            <ClipboardList className="size-3.5" />
            All
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {driverReports.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5">
            <Activity className="size-3.5" />
            Active
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 className="size-3.5" />
            Completed
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {completedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="size-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No reports found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeTab === 'active'
                    ? 'No active assignments at the moment.'
                    : activeTab === 'completed'
                    ? 'No completed reports yet.'
                    : 'No reports assigned to you yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report, index) => {
                  const isDispatched = report.status === 'dispatched';

                  return (
                    <motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03, duration: 0.25 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isDispatched
                            ? 'border-indigo-300 dark:border-indigo-700 shadow-sm shadow-indigo-100 dark:shadow-indigo-900/20'
                            : 'border-border/50 hover:border-indigo-200 dark:hover:border-indigo-800'
                        }`}
                        onClick={() => handleViewReport(report)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            {/* Left side */}
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Top row: ID + Badges */}
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
                                {isDispatched && (
                                  <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide"
                                  >
                                    ● Needs Acknowledgment
                                  </motion.span>
                                )}
                              </div>

                              {/* Location */}
                              <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium truncate">{report.location}</span>
                              </div>

                              {/* Team info */}
                              <div className="flex items-center gap-1.5">
                                <Shield className="size-3 text-indigo-400" />
                                <span className="text-xs text-muted-foreground">
                                  Team: <span className="font-medium text-foreground">{getTeamName(report.assignedTeam)}</span>
                                </span>
                              </div>
                            </div>

                            {/* Right side: timestamp */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 sm:flex-col sm:items-end sm:gap-1">
                              <div className="flex items-center gap-1">
                                <Clock className="size-3" />
                                <span>{formatTimestamp(report.timestamp)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Acknowledge for dispatched */}
                          {isDispatched && (
                            <>
                              <Separator className="my-3" />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewReport(report);
                                  }}
                                >
                                  View Details
                                </Button>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAcknowledge(report.id);
                                    }}
                                  >
                                    <CheckCircle2 className="size-3.5" />
                                    Acknowledge
                                  </Button>
                                </motion.div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        report={selectedReport}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAcknowledge={handleAcknowledge}
      />
    </div>
  );
}
