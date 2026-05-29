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
  Download,
  Loader2,
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

// ─── Unified list item type ─────────────────────────────────────
type ListItemType = 'emergency' | 'driver';

interface EmergencyListItem {
  _type: 'emergency';
  id: string;
  report: AdminReport;
}

interface DriverListItem {
  _type: 'driver';
  id: string;
  report: AdminReport; // the first report associated with this driver
  driverName: string;
  reportCount: number;
}

type ListItem = EmergencyListItem | DriverListItem;

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

// ─── Emergency Report Detail Dialog ────────────────────────────
function EmergencyDetailDialog({
  report,
  open,
  onOpenChange,
}: {
  report: AdminReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!report) return null;

  const e = report.emergency;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Emergency Report {report.reportId}
              </DialogTitle>
              <DialogDescription>
                Emergency incident details
              </DialogDescription>
            </div>
          </div>
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

        <div className="mt-2">
          {/* ─── EMERGENCY SECTION ───────────────────────── */}
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

// ─── Driver Detail Dialog ──────────────────────────────────────
function DriverDetailDialog({
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Truck className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Driver / Responder Details
              </DialogTitle>
              <DialogDescription>
                Driver information for Report {report.reportId}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${statusStyles[report.status]} border-0 text-xs capitalize`}>
              {report.status}
            </Badge>
            {report.assignedTeam && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">
                <ShieldCheck className="size-3 mr-1" />
                {getTeamName(report.assignedTeam)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
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
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
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
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Admin Reports Component ──────────────────────────────
export function AdminReports() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // 'all' | 'emergency' | 'driver'
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [incidentTypeFilter, setIncidentTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail dialogs (separate)
  const [selectedEmergency, setSelectedEmergency] = useState<AdminReport | null>(null);
  const [emergencyDetailOpen, setEmergencyDetailOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<AdminReport | null>(null);
  const [driverDetailOpen, setDriverDetailOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const incidentTypes = useMemo(() => {
    const types = [...new Set(mockAdminReports.map((r) => r.incidentType))];
    return types.sort();
  }, []);

  // Build unified list: emergency reports + unique drivers
  const allItems = useMemo(() => {
    const items: ListItem[] = [];

    // Add emergency report items
    mockAdminReports.forEach((r) => {
      items.push({
        _type: 'emergency',
        id: `em-${r.id}`,
        report: r,
      });
    });

    // Add unique driver items
    const driverMap = new Map<string, { report: AdminReport; count: number }>();
    mockAdminReports.forEach((r) => {
      if (!driverMap.has(r.driver.driverName)) {
        driverMap.set(r.driver.driverName, { report: r, count: 1 });
      } else {
        driverMap.get(r.driver.driverName)!.count += 1;
      }
    });
    driverMap.forEach(({ report, count }, name) => {
      items.push({
        _type: 'driver',
        id: `dr-${name.replace(/\s+/g, '-')}`,
        report,
        driverName: name,
        reportCount: count,
      });
    });

    // Sort: emergency first by timestamp descending, then drivers
    items.sort((a, b) => {
      // Emergency items first
      if (a._type === 'emergency' && b._type === 'driver') return -1;
      if (a._type === 'driver' && b._type === 'emergency') return 1;
      if (a._type === 'emergency' && b._type === 'emergency') {
        return new Date(b.report.timestamp).getTime() - new Date(a.report.timestamp).getTime();
      }
      // Drivers sorted by name
      return a.driverName.localeCompare(b.driverName);
    });

    return items;
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Type filter
    if (typeFilter === 'emergency') items = items.filter((i) => i._type === 'emergency');
    if (typeFilter === 'driver') items = items.filter((i) => i._type === 'driver');

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((item) => {
        if (item._type === 'emergency') {
          const r = item.report;
          return (
            r.reportId.toLowerCase().includes(q) ||
            r.incidentType.toLowerCase().includes(q) ||
            r.emergency.location.toLowerCase().includes(q) ||
            r.emergency.patientName.toLowerCase().includes(q) ||
            r.driver.driverName.toLowerCase().includes(q)
          );
        } else {
          const d = item.report.driver;
          return (
            d.driverName.toLowerCase().includes(q) ||
            d.governmentCardPlateNo.toLowerCase().includes(q)
          );
        }
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter((item) => {
        if (item._type === 'emergency') {
          return item.report.status === statusFilter;
        } else {
          // Driver: show if any of their reports has this status
          return mockAdminReports.some(
            (r) => r.driver.driverName === item.driverName && r.status === statusFilter
          );
        }
      });
    }

    // Incident type filter (only applies to emergency items)
    if (incidentTypeFilter !== 'all') {
      items = items.filter((item) => {
        if (item._type === 'emergency') return item.report.incidentType === incidentTypeFilter;
        return true; // keep all drivers when filtering by incident type
      });
    }

    // Priority filter (only applies to emergency items)
    if (priorityFilter !== 'all') {
      items = items.filter((item) => {
        if (item._type === 'emergency') return item.report.priority === priorityFilter;
        return true; // keep all drivers when filtering by priority
      });
    }

    return items;
  }, [allItems, search, typeFilter, statusFilter, incidentTypeFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const pendingCount = mockAdminReports.filter((r) => r.status === 'pending').length;
  const activeCount = mockAdminReports.filter((r) => r.status === 'dispatched' || r.status === 'acknowledged').length;
  const resolvedCount = mockAdminReports.filter((r) => r.status === 'resolved').length;
  const driverCount = useMemo(() => {
    const names = new Set(mockAdminReports.map((r) => r.driver.driverName));
    return names.size;
  }, []);

  const emergencyCount = filteredItems.filter((i) => i._type === 'emergency').length;
  const driverItemCount = filteredItems.filter((i) => i._type === 'driver').length;

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
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={generating}
          onClick={async () => {
            setGenerating(true);
            try {
              const now = new Date();
              const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
              const res = await fetch('/api/admin/generate-monthly-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month: monthLabel }),
              });
              if (!res.ok) throw new Error('Failed to generate report');
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `MMODRM_Monthly_Report_${monthLabel.replace(/\s+/g, '_')}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error('Report generation failed:', err);
            } finally {
              setGenerating(false);
            }
          }}
        >
          {generating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="size-4" />
              Generate Monthly Report
            </>
          )}
        </Button>
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

      {/* Unified List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-5 text-blue-500" />
              <CardTitle>All Reports & Drivers</CardTitle>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px]">
                  {emergencyCount} Emergency
                </Badge>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px]">
                  {driverItemCount} Drivers
                </Badge>
              </div>
            </div>
          </div>
          <CardDescription>Emergency reports and driver/responder records in one view</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports or drivers..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="driver">Driver / Responder</SelectItem>
                </SelectContent>
              </Select>
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
              <Select value={incidentTypeFilter} onValueChange={(v) => { setIncidentTypeFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Incident" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Incidents</SelectItem>
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
              {(typeFilter !== 'all' || statusFilter !== 'all' || incidentTypeFilter !== 'all' || priorityFilter !== 'all' || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setIncidentTypeFilter('all');
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

          {/* Merged List — Emergency & Driver items look visually different */}
          <ScrollArea className="h-[500px]">
            {paginatedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="size-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No items found</p>
              </div>
            ) : (
              <div className="space-y-2 pr-1">
                {paginatedItems.map((item) => {
                  if (item._type === 'emergency') {
                    // ─── EMERGENCY ITEM: Red left accent, multi-line detail layout ───
                    const report = item.report;
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border border-red-200/60 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 p-3 transition-all hover:bg-red-50/70 dark:hover:bg-red-950/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40 mt-0.5">
                              <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <Badge className="bg-red-500 text-white border-0 text-[10px] font-bold px-1.5">
                                  EMERGENCY
                                </Badge>
                                <span className="text-xs font-mono font-semibold text-red-700 dark:text-red-400">{report.reportId}</span>
                                {getTypeBadge(report.incidentType)}
                                <Badge className={`${priorityStyles[report.priority]} border-0 text-[10px] capitalize`}>
                                  {report.priority}
                                </Badge>
                                <Badge className={`${statusStyles[report.status]} border-0 text-[10px] capitalize`}>
                                  {report.status}
                                </Badge>
                              </div>
                              <p className="text-sm font-semibold text-red-900 dark:text-red-100 truncate">{report.emergency.location}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <User className="size-2.5 text-red-400" />
                                <span className="text-[10px] text-red-700/70 dark:text-red-300/70">{report.emergency.patientName}</span>
                                <span className="text-[10px] text-red-400/50">•</span>
                                <Phone className="size-2.5 text-red-400" />
                                <span className="text-[10px] text-red-700/70 dark:text-red-300/70">{report.emergency.timeReported}</span>
                              </div>
                              {report.assignedTeam && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Truck className="size-2.5 text-blue-500" />
                                  <span className="text-[10px] text-red-700/70 dark:text-red-300/70">
                                    Team: <span className="font-semibold text-red-800 dark:text-red-200">{getTeamName(report.assignedTeam)}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-[10px] text-red-500/70 dark:text-red-400/60">
                              {getTimeAgo(report.timestamp)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 text-xs border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                              onClick={() => {
                                setSelectedEmergency(report);
                                setEmergencyDetailOpen(true);
                              }}
                            >
                              <Eye className="size-3" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // ─── DRIVER ITEM: Amber left accent, compact horizontal layout ───
                    const d = item.report.driver;
                    const initials = d.driverName.split(' ').map((n) => n.charAt(0)).join('');
                    const team = item.report.assignedTeam
                      ? mockResponseTeams.find((t) => t.id === item.report.assignedTeam)
                      : null;
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/10 p-3 transition-all hover:bg-amber-50/70 dark:hover:bg-amber-950/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-900/40 ring-2 ring-amber-300/50 dark:ring-amber-700/30">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                              {initials}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <Badge className="bg-amber-500 text-white border-0 text-[10px] font-bold px-1.5">
                                DRIVER
                              </Badge>
                              <span className="text-sm font-semibold text-amber-900 dark:text-amber-100 truncate">{d.driverName}</span>
                            </div>
                            <p className="text-[10px] text-amber-700/70 dark:text-amber-300/70 truncate">
                              Plate: <span className="font-semibold text-amber-800 dark:text-amber-200">{d.governmentCardPlateNo}</span>
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <FileText className="size-2.5 text-amber-500" />
                              <span className="text-[10px] text-amber-700/70 dark:text-amber-300/70">
                                {item.reportCount} report{item.reportCount !== 1 ? 's' : ''}
                              </span>
                              {team && (
                                <>
                                  <span className="text-[10px] text-amber-400/50">•</span>
                                  <Truck className="size-2.5 text-blue-500" />
                                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{team.teamName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-7 gap-1 text-xs border-amber-200 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
                            onClick={() => {
                              setSelectedDriver(item.report);
                              setDriverDetailOpen(true);
                            }}
                          >
                            <Eye className="size-3" />
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredItems.length} items)
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

      {/* Separate Dialogs */}
      <EmergencyDetailDialog
        report={selectedEmergency}
        open={emergencyDetailOpen}
        onOpenChange={setEmergencyDetailOpen}
      />
      <DriverDetailDialog
        report={selectedDriver}
        open={driverDetailOpen}
        onOpenChange={setDriverDetailOpen}
      />
    </div>
  );
}
