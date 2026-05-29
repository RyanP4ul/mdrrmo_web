'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  MapPin,
  Radio,
  ShieldCheck,
  Truck,
  Filter,
  Eye,
  EyeOff,
  Navigation,
  ChevronRight,
  Siren,
  Phone,
  User,
  MapPinned,
  Send,
  Plus,
  Check,
  ChevronsUpDown,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockReports, mockResponseTeams, mockVehicles, mockIncidentTypes } from '@/lib/mock-data';
import type { VehicleStatus } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import type { IncidentType, PriorityLevel, ReportStatus } from '@/lib/types';
import {
  VehicleTracker,
  VEHICLE_STATUS_COLORS,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_ICONS,
  VEHICLE_STATUSES,
} from '@/components/maps/vehicle-tracker';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { toast } from 'sonner';

// ─── Priority Badge Styles ──────────────────────────────────────────
const PRIORITY_BADGE_STYLES: Record<PriorityLevel, { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  high: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

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
  Fire: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Medical Emergency': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Disaster: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Vehicular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Trauma: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  Ambulance: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Service: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

function getTypeBadge(type: string) {
  const style = REPORT_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  return (
    <Badge className={`${style} border-0 text-xs`}>
      {type}
    </Badge>
  );
}

// ─── Vehicle Status Filter Component ─────────────────────────────
function VehicleStatusFilter({
  hiddenStatuses,
  onToggleStatus,
  onToggleAll,
  allStatuses,
  open,
  onOpenChange,
}: {
  hiddenStatuses: Set<VehicleStatus>;
  onToggleStatus: (status: VehicleStatus) => void;
  onToggleAll: () => void;
  allStatuses: VehicleStatus[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const allHidden = hiddenStatuses.size === allStatuses.length;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
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

// ─── Emergency Report Modal ──────────────────────────────────────
function EmergencyReportModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [reporterName, setReporterName] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<IncidentType | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = reporterName.trim() && location.trim() && contactNumber.trim() && selectedIncident;

  // Auto-determined priority from incident type
  const autoPriority = selectedIncident?.priority ?? null;

  const handleSubmit = () => {
    if (!isFormValid) return;
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Emergency Report Submitted', {
        description: `${selectedIncident!.name} incident at ${location} — ${selectedIncident!.priority} priority`,
      });

      setReporterName('');
      setLocation('');
      setContactNumber('');
      setSelectedIncident(null);
      setDescription('');
      setIsSubmitting(false);
      onOpenChange(false);
    }, 800);
  };

  const handleReset = () => {
    setReporterName('');
    setLocation('');
    setContactNumber('');
    setSelectedIncident(null);
    setDescription('');
  };

  // Group incident types by priority for the combobox
  const groupedIncidents = useMemo(() => {
    const groups: Record<string, IncidentType[]> = { critical: [], high: [], medium: [], low: [] };
    mockIncidentTypes.forEach((it) => {
      if (groups[it.priority]) {
        groups[it.priority].push(it);
      }
    });
    return groups;
  }, []);

  const priorityGroupLabels: Record<string, string> = {
    critical: '🔴 Critical Priority',
    high: '🔵 High Priority',
    medium: '🟡 Medium Priority',
    low: '🟢 Low Priority',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <Siren className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">New Emergency Report</DialogTitle>
              <DialogDescription>Fill in the details to report a new incident</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Reporter Name */}
          <div className="space-y-1.5">
            <Label htmlFor="modal-reporter-name" className="text-xs font-medium flex items-center gap-1.5">
              <User className="size-3 text-muted-foreground" />
              Reporter Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="modal-reporter-name"
              placeholder="Full name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Accident Location */}
          <div className="space-y-1.5">
            <Label htmlFor="modal-location" className="text-xs font-medium flex items-center gap-1.5">
              <MapPinned className="size-3 text-muted-foreground" />
              Accident Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="modal-location"
              placeholder="Barangay, street, landmark..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <Label htmlFor="modal-contact" className="text-xs font-medium flex items-center gap-1.5">
              <Phone className="size-3 text-muted-foreground" />
              Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="modal-contact"
              placeholder="+63 9XX XXX XXXX"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <Separator />

          {/* Incident Type Combobox */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Incident Type <span className="text-red-500">*</span>
            </Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between h-9 text-sm font-normal"
                >
                  {selectedIncident ? (
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className={`inline-block size-2 rounded-full shrink-0 ${PRIORITY_BADGE_STYLES[selectedIncident.priority].dot}`}
                      />
                      {selectedIncident.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select incident type...</span>
                  )}
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search incident type..." />
                  <CommandList>
                    <CommandEmpty>No incident type found.</CommandEmpty>
                    {(['critical', 'high', 'medium', 'low'] as const).map((priority) => {
                      const items = groupedIncidents[priority];
                      if (items.length === 0) return null;
                      return (
                        <CommandGroup key={priority} heading={priorityGroupLabels[priority]}>
                          {items.map((incident) => (
                            <CommandItem
                              key={incident.id}
                              value={incident.name}
                              onSelect={() => {
                                setSelectedIncident(
                                  selectedIncident?.id === incident.id ? null : incident
                                );
                                setComboboxOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Check
                                className={`size-4 ${
                                  selectedIncident?.id === incident.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                              <span
                                className={`inline-block size-2 rounded-full shrink-0 ${PRIORITY_BADGE_STYLES[incident.priority].dot}`}
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm">{incident.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">{incident.description}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Show auto-determined priority when incident type is selected */}
            {autoPriority && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground">Auto-assigned priority:</span>
                <Badge className={`${PRIORITY_BADGE_STYLES[autoPriority].bg} ${PRIORITY_BADGE_STYLES[autoPriority].text} border-0 text-xs capitalize`}>
                  {autoPriority}
                </Badge>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-1.5">
            <Label htmlFor="modal-details" className="text-xs font-medium">
              Additional Details <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="modal-details"
              placeholder="Describe the situation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[70px] text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-10"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Dispatcher Dashboard ───────────────────────────────────
export function DispatcherDashboard() {
  const { setSelectedReportId, navigateTo } = useAppStore();
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<VehicleStatus>>(new Set());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

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

  const resolvedReports = useMemo(
    () =>
      mockReports
        .filter((r) => r.status === 'resolved')
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
            <h2 className="text-xl font-bold">Dispatch Operations</h2>
            <p className="text-sm text-muted-foreground">Live incident response & vehicle tracking</p>
          </div>
        </div>

      </div>

      {/* Emergency Report Modal */}
      <EmergencyReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} />

      {/* Incoming Reports (md-3) + Vehicle Tracker (md-9) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Incoming Pending Reports - Left Side */}
        <div className="md:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-500" />
                  <CardTitle>Incoming Reports</CardTitle>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0 ml-2">
                    {pendingReports.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white gap-1 h-7 text-xs"
                  onClick={() => { setFilterPopoverOpen(false); setReportModalOpen(true); }}
                >
                  <Plus className="size-3.5" />
                  New Report
                </Button>
              </div>
              <CardDescription>Pending reports awaiting dispatch</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-[500px]">
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
                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                              <User className="size-2.5" />
                              <span>{report.reportedBy.name}</span>
                              <span>•</span>
                              <Phone className="size-2.5" />
                              <span>{report.reportedBy.contact}</span>
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

        {/* Vehicle Tracker Map - Right Side */}
        <div className="md:col-span-9">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="size-5 text-blue-500" />
                  <CardTitle>Vehicle Tracker</CardTitle>
                </div>
                <div className="flex items-center gap-2">
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
                  <VehicleStatusFilter
                    hiddenStatuses={hiddenStatuses}
                    onToggleStatus={toggleStatus}
                    onToggleAll={toggleAllStatuses}
                    allStatuses={VEHICLE_STATUSES}
                    open={filterPopoverOpen}
                    onOpenChange={setFilterPopoverOpen}
                  />
                </div>
              </div>
              <CardDescription>Real-time location and status of response vehicles in Dagupan City</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-0">
              <VehicleTracker
                height="500px"
                hiddenStatuses={hiddenStatuses}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
              />
            </CardContent>
          </Card>
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

      {/* Reports Section: Active, Resolved */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Reports Monitor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-500" />
              <CardTitle>Active Reports</CardTitle>
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
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                            <User className="size-2.5" />
                            <span>{report.reportedBy.name}</span>
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

        {/* Resolved Reports */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-green-500" />
              <CardTitle>Resolved Reports</CardTitle>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 ml-2">
                {resolvedReports.length}
              </Badge>
            </div>
            <CardDescription>Recently resolved incidents</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              {resolvedReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShieldCheck className="size-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No resolved reports</p>
                </div>
              ) : (
                <div className="space-y-2 px-4 pb-4">
                  {resolvedReports.map((report) => (
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
                            <Truck className="size-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                              Team: <span className="font-medium text-foreground">{getTeamName(report.assignedTeam)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                            <User className="size-2.5" />
                            <span>{report.reportedBy.name}</span>
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

      {/* Fleet Status - Full Width */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-blue-500" />
            <CardTitle>Fleet Status</CardTitle>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 ml-2">
              {visibleVehicles.length} / {mockVehicles.length}
            </Badge>
          </div>
          <CardDescription>Active vehicle fleet overview — click a vehicle to locate on map</CardDescription>
        </CardHeader>
        <CardContent>
          {visibleVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {visibleVehicles.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                const statusColor = VEHICLE_STATUS_COLORS[vehicle.status];
                return (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(isSelected ? null : vehicle.id)}
                    className={`w-full text-left rounded-lg border p-4 transition-all hover:shadow-sm ${
                      isSelected
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm'
                        : 'border-border/50 bg-card hover:bg-muted/50 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg"
                        style={{ backgroundColor: statusColor + '18' }}
                      >
                        {VEHICLE_TYPE_ICONS[vehicle.vehicleType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{vehicle.teamName}</p>
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
                      <ChevronRight className={`size-4 shrink-0 transition-transform mt-1 ${isSelected ? 'rotate-90 text-blue-500' : 'text-muted-foreground'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DispatcherDashboard;
