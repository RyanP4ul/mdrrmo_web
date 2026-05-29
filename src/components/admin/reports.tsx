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
  Fuel,
  Heart,
  Activity,
  ClipboardList,
  X,
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
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockAdminReports, mockResponseTeams } from '@/lib/mock-data';
import type { AdminReport, PriorityLevel, ReportStatus } from '@/lib/types';

const ITEMS_PER_PAGE = 8;

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

function getTeamName(teamId?: string) {
  if (!teamId) return 'Unassigned';
  const team = mockResponseTeams.find((t) => t.id === teamId);
  return team ? team.teamName : 'Unknown';
}

// ─── Report Detail Dialog ──────────────────────────────────────
function ReportDetailDialog({
  report,
  open,
  onOpenChange,
}: {
  report: AdminReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!report) return null;

  const d = report.driver;
  const e = report.emergency;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ClipboardList className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Report {report.reportId}
              </DialogTitle>
              <DialogDescription>
                Full report details — Driver & Emergency information
              </DialogDescription>
            </div>
          </div>
          {/* Status + Priority badges */}
          <div className="flex items-center gap-2 mt-2">
            {getTypeBadge(report.incidentType)}
            <Badge className={`${priorityStyles[report.priority]} border-0 text-xs capitalize`}>
              {report.priority}
            </Badge>
            <Badge className={`${statusStyles[report.status]} border-0 text-xs capitalize`}>
              {report.status}
            </Badge>
            {report.assignedTeam && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                <Truck className="size-3 mr-1" />
                {getTeamName(report.assignedTeam)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* ─── DRIVER SECTION ───────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
                <Truck className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Driver
              </h3>
            </div>

            {/* A. To be filled by the administrative official authorizing */}
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                A. To be filled by the administrative official authorizing:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailField label="1. Name of Driver" value={d.driverName} icon={<User className="size-3" />} />
                <DetailField label="2. Government Card Used / Plate No." value={d.governmentCardPlateNo} icon={<FileText className="size-3" />} />
                <DetailField label="3. Name of Authorized Passenger" value={d.authorizedPassenger} icon={<User className="size-3" />} />
                <DetailField label="4. Name of Place to be Visited / Inspected" value={d.placeVisitedInspected} icon={<MapPin className="size-3" />} />
              </div>
              <DetailField label="5. Purpose" value={d.purpose} icon={<ClipboardList className="size-3" />} />
            </div>

            {/* B. To be filled by the driver */}
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3 mt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                B. To be filled by the driver:
              </p>
              <div className="flex items-center gap-2 mb-1">
                <Fuel className="size-4 text-amber-500" />
                <p className="text-xs font-semibold text-muted-foreground">
                  1. Gasoline Issued / Purchased (Liters)
                </p>
              </div>

              <Table>
                <TableBody>
                  <GasRow label="a. Balance in tank" value={d.gasoline.balanceInTank} />
                  <GasRow label="b. Issued by office from stock" value={d.gasoline.issuedByOffice} />
                  <GasRow label="c. As purchased during the trip" value={d.gasoline.asPurchased} />
                  <GasRow label="d. Deduct used during the trip" value={d.gasoline.deductUsed} />
                  <GasRow label="e. Balance in tank at the end of the trip" value={d.gasoline.balanceEndTrip} />
                </TableBody>
              </Table>

              <Separator className="my-2" />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailField label="Name of Passenger" value={d.passengerName} icon={<User className="size-3" />} />
                <DetailField label="Driver" value={d.driverFilledName} icon={<Truck className="size-3" />} />
              </div>
            </div>
          </div>

          <Separator />

          {/* ─── EMERGENCY SECTION ───────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                Emergency
              </h3>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label="Time Reported" value={e.timeReported} icon={<Clock className="size-3" />} />
                <DetailField label="Time of Arrival on Scene" value={e.timeOfArrival} icon={<Clock className="size-3" />} />
                <DetailField label="Date" value={e.date} icon={<FileText className="size-3" />} />
                <DetailField label="Location" value={e.location} icon={<MapPin className="size-3" />} />
                <DetailField label="Name of Patient" value={e.patientName} icon={<User className="size-3" />} />
                <DetailField label="Age" value={e.age} icon={<User className="size-3" />} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DetailField label="Sex" value={e.sex} icon={<User className="size-3" />} />
                <DetailField label="Address" value={e.address} icon={<MapPin className="size-3" />} />
                <DetailField label="Type of Incident" value={e.typeOfIncident} icon={<AlertTriangle className="size-3" />} />
              </div>

              {/* Incident Details Table */}
              <div className="mt-2">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-xs text-muted-foreground bg-muted/40 w-[180px] border-r">
                        Type of Incident
                      </TableCell>
                      <TableCell className="font-medium text-xs text-muted-foreground bg-muted/40 w-[180px] border-r">
                        Allergies
                      </TableCell>
                      <TableCell className="font-medium text-xs text-muted-foreground bg-muted/40">
                        Medications
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs border-r">{e.typeOfIncident}</TableCell>
                      <TableCell className="text-xs border-r">{e.allergies}</TableCell>
                      <TableCell className="text-xs">{e.medications}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <DetailField label="Assessment / Comment" value={e.assessmentComment} />
              <DetailField label="Treatment / Management" value={e.treatmentManagement} />

              {/* Vital Signs Table */}
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="size-4 text-red-500" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vital Signs</p>
                </div>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-xs text-muted-foreground bg-muted/40 border-r">
                        Vital Sign
                      </TableCell>
                      <TableCell className="font-medium text-xs text-muted-foreground bg-muted/40 border-r">
                        Blood Pressure
                      </TableCell>
                      <TableCell className="font-medium text-xs text-muted-foreground bg-muted/40 border-r">
                        Pulse Rate (BPM)
                      </TableCell>
                      <TableCell className="font-medium text-xs text-muted-foreground bg-muted/40">
                        Respiration (BPM)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs border-r">
                        <Activity className="size-3 text-red-500 inline mr-1" />
                        Reading
                      </TableCell>
                      <TableCell className="text-xs border-r">{e.vitalSigns.bloodPressure}</TableCell>
                      <TableCell className="text-xs border-r">{e.vitalSigns.pulseRate}</TableCell>
                      <TableCell className="text-xs">{e.vitalSigns.respiration}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Endorsement */}
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endorsed By</p>
                  <DetailField label="Name" value={e.endorsedBy} />
                  <DetailField label="Time" value={e.endorsedByTime} />
                  <DetailField label="Date" value={e.endorsedByDate} />
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endorsed To</p>
                  <DetailField label="Name" value={e.endorsedTo} />
                  <DetailField label="Time" value={e.endorsedToTime} />
                  <DetailField label="Date" value={e.endorsedToDate} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper Components ──────────────────────────────────────────
function DetailField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

function GasRow({ label, value }: { label: string; value: string }) {
  return (
    <TableRow>
      <TableCell className="text-xs text-muted-foreground w-[60%] border-r">
        {label}
      </TableCell>
      <TableCell className="text-xs font-medium text-right">
        {value} <span className="text-muted-foreground font-normal">Liters</span>
      </TableCell>
    </TableRow>
  );
}

// ─── Main Admin Reports Component ──────────────────────────────
export function AdminReports() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const incidentTypes = useMemo(() => {
    const types = [...new Set(mockAdminReports.map((r) => r.incidentType))];
    return types.sort();
  }, []);

  // Filter reports
  const filteredReports = useMemo(() => {
    let reports = [...mockAdminReports];
    if (search.trim()) {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.reportId.toLowerCase().includes(q) ||
          r.incidentType.toLowerCase().includes(q) ||
          r.emergency.location.toLowerCase().includes(q) ||
          r.driver.driverName.toLowerCase().includes(q) ||
          r.emergency.patientName.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') reports = reports.filter((r) => r.status === statusFilter);
    if (typeFilter !== 'all') reports = reports.filter((r) => r.incidentType === typeFilter);
    if (priorityFilter !== 'all') reports = reports.filter((r) => r.priority === priorityFilter);
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return reports;
  }, [search, statusFilter, typeFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Report stats
  const pendingCount = mockAdminReports.filter((r) => r.status === 'pending').length;
  const activeCount = mockAdminReports.filter((r) => r.status === 'dispatched' || r.status === 'acknowledged').length;
  const resolvedCount = mockAdminReports.filter((r) => r.status === 'resolved').length;
  const totalReports = mockAdminReports.length;

  const handleViewReport = (report: AdminReport) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

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
            <p className="text-sm text-muted-foreground">Emergency reports and driver/responder records</p>
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
              <span className="text-sm text-muted-foreground">Total Reports</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{totalReports}</p>
          </CardContent>
        </Card>
      </div>

      {/* Merged Reports List */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-5 text-blue-500" />
              <CardTitle>All Reports</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                {filteredReports.length}
              </Badge>
            </div>
          </div>
          <CardDescription>Merged emergency reports and driver/responder records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 flex-1 min-h-0">
          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by report ID, location, driver, patient..."
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
          <ScrollArea className="h-[520px]">
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
                        {/* Top row: badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-xs font-mono text-muted-foreground">{report.reportId}</span>
                          {getTypeBadge(report.incidentType)}
                          <Badge className={`${priorityStyles[report.priority]} border-0 text-[10px] capitalize`}>
                            {report.priority}
                          </Badge>
                          <Badge className={`${statusStyles[report.status]} border-0 text-[10px] capitalize`}>
                            {report.status}
                          </Badge>
                        </div>

                        {/* Emergency info */}
                        <p className="text-sm font-medium truncate">{report.emergency.location}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <User className="size-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            Patient: <span className="font-medium text-foreground">{report.emergency.patientName}</span>
                          </span>
                        </div>

                        {/* Driver info */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Truck className="size-2.5 text-amber-500" />
                          <span className="text-[10px] text-muted-foreground">
                            Driver: <span className="font-medium text-foreground">{report.driver.driverName}</span>
                          </span>
                          {report.assignedTeam && (
                            <>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <ShieldCheck className="size-2.5 text-blue-500" />
                              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                {getTeamName(report.assignedTeam)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right side: time + view button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {getTimeAgo(report.timestamp)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="size-3" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} — {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
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
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="size-3 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <ReportDetailDialog
        report={selectedReport}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
