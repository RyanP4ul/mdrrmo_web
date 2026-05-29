'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  FileText,
  MapPin,
  Clock,
  User,
  Phone,
  Truck,
  ShieldCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockReports, mockUsers, mockResponseTeams } from '@/lib/mock-data';
import type { PriorityLevel, ReportStatus, UserStatus } from '@/lib/types';

const REPORTS_PER_PAGE = 6;
const DRIVERS_PER_PAGE = 8;

// Priority styles (Critical/High=Red, Medium/Low=Yellow)
const priorityStyles: Record<PriorityLevel, string> = {
  low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusStyles: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  acknowledged: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  dispatched: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  invalid: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const INCIDENT_COLORS: Record<string, string> = {
  Fire: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Medical Emergency': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Disaster: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Vehicular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Trauma: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  Ambulance: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Service: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const userStatusStyles: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

function getTypeBadge(type: string) {
  const style = INCIDENT_COLORS[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  return <Badge className={`${style} border-0 text-xs`}>{type}</Badge>;
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

function getTeamName(teamId: string) {
  const team = mockResponseTeams.find((t) => t.id === teamId);
  return team ? team.teamName : 'Unassigned';
}

export function AdminReports() {
  // Reports state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Drivers state
  const [driverSearch, setDriverSearch] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState<string>('all');
  const [driverPage, setDriverPage] = useState(1);

  const incidentTypes = useMemo(() => {
    const types = [...new Set(mockReports.map((r) => r.type))];
    return types.sort();
  }, []);

  // Filter reports
  const filteredReports = useMemo(() => {
    let reports = [...mockReports];
    if (search.trim()) {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.reportedBy.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') reports = reports.filter((r) => r.status === statusFilter);
    if (typeFilter !== 'all') reports = reports.filter((r) => r.type === typeFilter);
    if (priorityFilter !== 'all') reports = reports.filter((r) => r.priority === priorityFilter);
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return reports;
  }, [search, statusFilter, typeFilter, priorityFilter]);

  const totalReportPages = Math.max(1, Math.ceil(filteredReports.length / REPORTS_PER_PAGE));
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * REPORTS_PER_PAGE,
    currentPage * REPORTS_PER_PAGE
  );

  // Filter drivers/responders
  const filteredDrivers = useMemo(() => {
    let drivers = mockUsers.filter((u) => u.role === 'driver/responder');
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      drivers = drivers.filter(
        (d) =>
          `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q)
      );
    }
    if (driverStatusFilter !== 'all') drivers = drivers.filter((d) => d.status === driverStatusFilter);
    return drivers;
  }, [driverSearch, driverStatusFilter]);

  const totalDriverPages = Math.max(1, Math.ceil(filteredDrivers.length / DRIVERS_PER_PAGE));
  const paginatedDrivers = filteredDrivers.slice(
    (driverPage - 1) * DRIVERS_PER_PAGE,
    driverPage * DRIVERS_PER_PAGE
  );

  // Report stats
  const pendingCount = mockReports.filter((r) => r.status === 'pending').length;
  const activeCount = mockReports.filter((r) => r.status === 'dispatched' || r.status === 'acknowledged').length;
  const resolvedCount = mockReports.filter((r) => r.status === 'resolved').length;
  const driverCount = mockUsers.filter((u) => u.role === 'driver/responder').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FileText className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Reports & Drivers</h2>
            <p className="text-sm text-muted-foreground">Monitor emergency reports and driver/responder status</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Resolved</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{resolvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Drivers</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{driverCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Reports + Drivers side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Emergency Reports */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-500" />
                  <CardTitle>Emergency Reports</CardTitle>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                    {filteredReports.length}
                  </Badge>
                </div>
              </div>
              <CardDescription>All incident reports across the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 min-h-0">
              {/* Search & Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 w-[120px] text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {(statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || search) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setPriorityFilter('all');
                        setSearch('');
                        setCurrentPage(1);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Reports List */}
              <ScrollArea className="h-[450px]">
                {paginatedReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="size-10 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No reports found</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-1">
                    {paginatedReports.map((report) => (
                      <div
                        key={report.id}
                        className="rounded-lg border border-border/50 bg-card p-3 transition-all hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="text-xs font-mono text-muted-foreground">{report.id}</span>
                              {getTypeBadge(report.type)}
                              <Badge className={`${priorityStyles[report.priority]} border-0 text-[10px] capitalize`}>
                                {report.priority}
                              </Badge>
                              <Badge className={`${statusStyles[report.status]} border-0 text-[10px] capitalize`}>
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium truncate">{report.location}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <User className="size-2.5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{report.reportedBy.name}</span>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <Phone className="size-2.5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{report.reportedBy.contact}</span>
                            </div>
                            {report.assignedTeam && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Truck className="size-2.5 text-blue-500" />
                                <span className="text-[10px] text-muted-foreground">
                                  Team: <span className="font-medium text-foreground">{getTeamName(report.assignedTeam)}</span>
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {getTimeAgo(report.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Reports Pagination */}
              {totalReportPages > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalReportPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="size-3 mr-0.5" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={currentPage >= totalReportPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalReportPages, p + 1))}
                    >
                      Next
                      <ChevronRight className="size-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Drivers / Responders */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber-500" />
                <CardTitle>Drivers / Responders</CardTitle>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                  {filteredDrivers.length}
                </Badge>
              </div>
              <CardDescription>Registered drivers and responders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 min-h-0">
              {/* Search & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search drivers..."
                    value={driverSearch}
                    onChange={(e) => { setDriverSearch(e.target.value); setDriverPage(1); }}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={driverStatusFilter} onValueChange={(v) => { setDriverStatusFilter(v); setDriverPage(1); }}>
                    <SelectTrigger className="h-8 w-[120px] text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  {(driverStatusFilter !== 'all' || driverSearch) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setDriverStatusFilter('all');
                        setDriverSearch('');
                        setDriverPage(1);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Drivers List */}
              <ScrollArea className="h-[450px]">
                {paginatedDrivers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShieldCheck className="size-10 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No drivers found</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-1">
                    {paginatedDrivers.map((driver) => {
                      const fullName = `${driver.firstName} ${driver.lastName}`;
                      const initials = `${driver.firstName.charAt(0)}${driver.lastName.charAt(0)}`;
                      // Find which team this driver belongs to
                      const team = mockResponseTeams.find((t) =>
                        t.members.some((m) => m.name === fullName)
                      );
                      return (
                        <div
                          key={driver.id}
                          className="rounded-lg border border-border/50 bg-card p-3 transition-all hover:bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                {initials}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{fullName}</span>
                                <Badge className={`${userStatusStyles[driver.status]} border-0 text-[10px] capitalize`}>
                                  {driver.status}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">{driver.email}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Phone className="size-2.5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{driver.contactNumber}</span>
                                {team && (
                                  <>
                                    <span className="text-[10px] text-muted-foreground">•</span>
                                    <Truck className="size-2.5 text-blue-500" />
                                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">{team.teamName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="shrink-0 h-7 w-7 p-0">
                              <Eye className="size-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Drivers Pagination */}
              {totalDriverPages > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Page {driverPage} of {totalDriverPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={driverPage <= 1}
                      onClick={() => setDriverPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="size-3 mr-0.5" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={driverPage >= totalDriverPages}
                      onClick={() => setDriverPage((p) => Math.min(totalDriverPages, p + 1))}
                    >
                      Next
                      <ChevronRight className="size-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
