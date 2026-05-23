'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Radio,
  ShieldCheck,
  Filter,
  Eye,
  EyeOff,
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
import { mockReports, mockResponseTeams } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import type { PriorityLevel, ReportStatus } from '@/lib/types';
import { Heatmap, INCIDENT_COLORS, INCIDENT_TYPES } from '@/components/maps/heatmap';

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

// Incident Type Filter Component
function IncidentTypeFilter({
  hiddenTypes,
  onToggleType,
  onToggleAll,
  allTypes,
}: {
  hiddenTypes: Set<string>;
  onToggleType: (type: string) => void;
  onToggleAll: () => void;
  allTypes: string[];
}) {
  const allHidden = hiddenTypes.size === allTypes.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter className="size-3.5" />
          Filter Types
          {hiddenTypes.size > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {hiddenTypes.size} hidden
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Incident Types</p>
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
            Toggle visibility of each type
          </p>
        </div>
        <Separator />
        <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
          {allTypes.map((type) => {
            const isHidden = hiddenTypes.has(type);
            const color = INCIDENT_COLORS[type] || '#6b7280';
            return (
              <label
                key={type}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={!isHidden}
                  onCheckedChange={() => onToggleType(type)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className={`text-sm ${isHidden ? 'text-muted-foreground line-through' : ''}`}>
                  {type}
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
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());

  const toggleType = (type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setHiddenTypes((prev) => {
      if (prev.size === INCIDENT_TYPES.length) {
        return new Set(); // show all
      }
      return new Set(INCIDENT_TYPES); // hide all
    });
  };

  // Mapping from heatmap incident types to report types
  const heatmapToReportMap: Record<string, string[]> = {
    Flood: ['Flood'],
    Fire: ['Fire'],
    Accident: ['Vehicular Accident'],
    Medical: ['Medical Emergency'],
    Typhoon: ['Typhoon'],
    Landslide: ['Landslide'],
    'Power Outage': ['Power Outage'],
    Drowning: ['Drowning'],
    Earthquake: ['Earthquake'],
    Collapse: ['Structural Collapse'],
  };

  const pendingReports = useMemo(
    () =>
      mockReports
        .filter((r) => {
          if (r.status !== 'pending') return false;
          for (const [heatmapType, reportTypes] of Object.entries(heatmapToReportMap)) {
            if (reportTypes.includes(r.type) && hiddenTypes.has(heatmapType)) return false;
          }
          if (hiddenTypes.has(r.type)) return false;
          return true;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [hiddenTypes, heatmapToReportMap]
  );

  const activeReports = useMemo(
    () =>
      mockReports
        .filter((r) => {
          if (r.status !== 'dispatched' && r.status !== 'acknowledged') return false;
          for (const [heatmapType, reportTypes] of Object.entries(heatmapToReportMap)) {
            if (reportTypes.includes(r.type) && hiddenTypes.has(heatmapType)) return false;
          }
          if (hiddenTypes.has(r.type)) return false;
          return true;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [hiddenTypes, heatmapToReportMap]
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
            <p className="text-sm text-muted-foreground">Live incident monitoring & dispatch</p>
          </div>
        </div>
        <IncidentTypeFilter
          hiddenTypes={hiddenTypes}
          onToggleType={toggleType}
          onToggleAll={toggleAll}
          allTypes={INCIDENT_TYPES}
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
              <ShieldCheck className="size-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{activeReports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Total Reports</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{mockReports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Teams Available</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {mockResponseTeams.filter((t) => t.availability === 'available').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Incident Heatmap - Top 60% */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-blue-500" />
            <CardTitle>Incident Heat Map</CardTitle>
          </div>
          <CardDescription>Geographic distribution of active incidents in Dagupan City</CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap height="500px" hiddenTypes={hiddenTypes} />
        </CardContent>
      </Card>

      {/* Bottom 40%: Incoming Reports & Active Monitor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            <ScrollArea className="h-[350px]">
              {pendingReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {hiddenTypes.size > 0 ? (
                    <>
                      <EyeOff className="size-10 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">All types hidden or no pending reports</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-500 mt-1"
                        onClick={() => setHiddenTypes(new Set())}
                      >
                        Show all types
                      </Button>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-10 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No pending reports</p>
                    </>
                  )}
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
            <ScrollArea className="h-[350px]">
              {activeReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {hiddenTypes.size > 0 ? (
                    <>
                      <EyeOff className="size-10 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">All types hidden or no active reports</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-500 mt-1"
                        onClick={() => setHiddenTypes(new Set())}
                      >
                        Show all types
                      </Button>
                    </>
                  ) : (
                    <>
                      <Radio className="size-10 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No active reports</p>
                    </>
                  )}
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
                            <ShieldCheck className="size-3 text-blue-500" />
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
