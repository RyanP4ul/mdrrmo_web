'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Radio,
  ShieldCheck,
  Truck,
  Filter,
  Eye,
  EyeOff,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { mockReports, mockResponseTeams, mockVehicles } from '@/lib/mock-data';
import type { VehicleStatus } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import type { PriorityLevel, ReportStatus } from '@/lib/types';
import {
  VehicleTracker,
  VEHICLE_STATUS_COLORS,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_ICONS,
  VEHICLE_STATUSES,
} from '@/components/maps/vehicle-tracker';

const priorityStyles: Record<PriorityLevel, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusStyles: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  acknowledged: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  dispatched: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  invalid: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

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

const REPORT_TYPE_COLORS: Record<string, string> = {
  Flood: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Fire: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Vehicular Accident': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Medical Emergency': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Typhoon: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Landslide: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  'Power Outage': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  Drowning: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Earthquake: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Structural Collapse': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
};

function getTypeBadge(type: string) {
  const style = REPORT_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  return (
    <Badge className={`${style} border-0 text-xs`}>
      {type}
    </Badge>
  );
}

// Vehicle Status Filter Component
function VehicleStatusFilter({
  hiddenStatuses,
  onToggleStatus,
  onToggleAll,
  allStatuses,
}: {
  hiddenStatuses: Set<VehicleStatus>;
  onToggleStatus: (status: VehicleStatus) => void;
  onToggleAll: () => void;
  allStatuses: VehicleStatus[];
}) {
  const allHidden = hiddenStatuses.size === allStatuses.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter className="size-3.5" />
          Filter Status
          {hiddenStatuses.size > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {hiddenStatuses.size} hidden
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Vehicle Status</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 px-2"
              onClick={onToggleAll}
            >
              {allHidden ? (
                <>
                  <Eye className="size-3" />
                  Show All
                </>
              ) : (
                <>
                  <EyeOff className="size-3" />
                  Hide All
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Toggle visibility of each status
          </p>
        </div>
        <Separator />
        <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
          {allStatuses.map((status) => {
            const isHidden = hiddenStatuses.has(status);
            const color = VEHICLE_STATUS_COLORS[status];
            const count = mockVehicles.filter((v) => v.status === status).length;
            return (
              <label
                key={status}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={!isHidden}
                  onCheckedChange={() => onToggleStatus(status)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className={`text-sm flex-1 ${isHidden ? 'text-muted-foreground line-through' : ''}`}>
                  {VEHICLE_STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DispatcherDashboard() {
  const { setSelectedReportId, navigateTo } = useAppStore();
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<VehicleStatus>>(new Set());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const toggleStatus = (status: VehicleStatus) => {
    setHiddenStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const toggleAllStatuses = () => {
    setHiddenStatuses((prev) => {
      if (prev.size === VEHICLE_STATUSES.length) {
        return new Set();
      }
      return new Set(VEHICLE_STATUSES);
    });
  };

  const pendingReports = useMemo(
    () =>
      mockReports
        .filter((r) => r.status === 'pending')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    []
  );

  const activeReports = useMemo(
    () =>
      mockReports
        .filter((r) => r.status === 'dispatched' || r.status === 'acknowledged')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    []
  );

  const visibleVehicles = useMemo(
    () => mockVehicles.filter((v) => !hiddenStatuses.has(v.status)),
    [hiddenStatuses]
  );

  const handleReportClick = (reportId: string) => {
    setSelectedReportId(reportId);
    navigateTo('dispatcher-report-detail');
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return 'Unassigned';
    const team = mockResponseTeams.find((t) => t.id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const selectedVehicle = mockVehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Radio className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Dispatcher Dashboard</h2>
            <p className="text-sm text-muted-foreground">Live vehicle tracking & dispatch</p>
          </div>
        </div>
        <VehicleStatusFilter
          hiddenStatuses={hiddenStatuses}
          onToggleStatus={toggleStatus}
          onToggleAll={toggleAllStatuses}
          allStatuses={VEHICLE_STATUSES}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{pendingReports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">En Route</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {mockVehicles.filter((v) => v.status === 'en-route').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-green-500" />
              <span className="text-sm text-muted-foreground">On Scene</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {mockVehicles.filter((v) => v.status === 'on-scene').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-cyan-500" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {mockVehicles.filter((v) => v.status === 'available').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Tracker Map - Full Width */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="size-5 text-blue-500" />
              <CardTitle>Vehicle Tracker</CardTitle>
            </div>
            {selectedVehicle && (
              <Badge
                className="border-0 text-xs"
                style={{
                  backgroundColor: VEHICLE_STATUS_COLORS[selectedVehicle.status] + '22',
                  color: VEHICLE_STATUS_COLORS[selectedVehicle.status],
                }}
              >
                {VEHICLE_TYPE_ICONS[selectedVehicle.vehicleType]} {selectedVehicle.id} — {selectedVehicle.teamName}
              </Badge>
            )}
          </div>
          <CardDescription>Real-time location and status of response vehicles in Dagupan City</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleTracker
            height="500px"
            hiddenStatuses={hiddenStatuses}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />
        </CardContent>
      </Card>

      {/* Bottom Row: Vehicle Fleet List & Incoming Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Vehicle Fleet List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Truck className="size-5 text-blue-500" />
              <CardTitle>Fleet Status</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 ml-2">
                {visibleVehicles.length}
              </Badge>
            </div>
            <CardDescription>Active vehicle fleet overview</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {visibleVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <EyeOff className="size-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">All statuses hidden</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-500 mt-1"
                    onClick={() => setHiddenStatuses(new Set())}
                  >
                    Show all statuses
                  </Button>
                </div>
              ) : (
                <div className="space-y-1 px-3 pb-3">
                  {visibleVehicles.map((vehicle) => {
                    const isSelected = selectedVehicleId === vehicle.id;
                    const statusColor = VEHICLE_STATUS_COLORS[vehicle.status];
                    return (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(isSelected ? null : vehicle.id)}
                        className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm ${
                          isSelected
                            ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20'
                            : 'border-border/50 bg-card hover:bg-muted/50 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-base"
                            style={{ backgroundColor: statusColor + '18' }}
                          >
                            {VEHICLE_TYPE_ICONS[vehicle.vehicleType]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-sm font-medium truncate">{vehicle.teamName}</p>
                              <ChevronRight className={`size-3.5 shrink-0 transition-transform ${isSelected ? 'rotate-90 text-blue-500' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className="inline-block size-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: statusColor }}
                              />
                              <span className="text-[10px] font-medium" style={{ color: statusColor }}>
                                {VEHICLE_STATUS_LABELS[vehicle.status]}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                • {vehicle.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                              {vehicle.speed > 0 ? (
                                <span className="flex items-center gap-0.5">
                                  <Navigation className="size-2.5" />
                                  {vehicle.speed} km/h
                                </span>
                              ) : (
                                <span>Stationary</span>
                              )}
                              {vehicle.assignedReportId && (
                                <span className="text-blue-500 font-medium">
                                  → {vehicle.assignedReportId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Incoming Pending Reports */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-500" />
              <CardTitle>Incoming Reports</CardTitle>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0 ml-2">
                {pendingReports.length}
              </Badge>
            </div>
            <CardDescription>Pending reports awaiting dispatch</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {pendingReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShieldCheck className="size-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No pending reports</p>
                </div>
              ) : (
                <div className="space-y-2 px-4 pb-4">
                  {pendingReports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => handleReportClick(report.id)}
                      className="w-full text-left rounded-lg border border-border/50 bg-card p-3 transition-all hover:bg-muted/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeBadge(report.type)}
                            <Badge className={`${priorityStyles[report.priority]} border-0 text-xs capitalize`}>
                              {report.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">{report.location}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {report.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge className={`${statusStyles[report.status]} border-0 text-xs capitalize`}>
                            {report.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {getTimeAgo(report.timestamp)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Reports Monitor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-500" />
              <CardTitle>Active Reports Monitor</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 ml-2">
                {activeReports.length}
              </Badge>
            </div>
            <CardDescription>Currently dispatched / acknowledged incidents</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {activeReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Radio className="size-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No active reports</p>
                </div>
              ) : (
                <div className="space-y-2 px-4 pb-4">
                  {activeReports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => handleReportClick(report.id)}
                      className="w-full text-left rounded-lg border border-border/50 bg-card p-3 transition-all hover:bg-muted/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeBadge(report.type)}
                            <Badge className={`${priorityStyles[report.priority]} border-0 text-xs capitalize`}>
                              {report.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">{report.location}</p>
                          <Separator className="my-2" />
                          <div className="flex items-center gap-1.5">
                            <Truck className="size-3 text-blue-500" />
                            <span className="text-xs text-muted-foreground">
                              Team: <span className="font-medium text-foreground">{getTeamName(report.assignedTeam)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge className={`${statusStyles[report.status]} border-0 text-xs capitalize`}>
                            {report.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {getTimeAgo(report.timestamp)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DispatcherDashboard;
