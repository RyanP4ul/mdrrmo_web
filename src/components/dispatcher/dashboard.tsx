'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  Radio,
  ShieldCheck,
  Truck,
  Siren,
  Phone,
  User,
  MapPinned,
  Send,
  Check,
  Navigation,
  Clock,
  Flame,
  Heart,
  Cloud,
  Car,
  Crosshair,
  Wrench,
  ArrowRight,
  PhoneCall,
  X,
  UserCheck,
  Eye,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockReports, mockResponseTeams, mockShifts, mockIncidentTypes } from '@/lib/mock-data';
import { useAppStore } from '@/lib/store';
import type { PriorityLevel, EmergencyReport, ReporterType } from '@/lib/types';
import { toast } from 'sonner';

// ─── Constants & Helpers ──────────────────────────────────────────

const PRIORITY_BADGE_STYLES: Record<PriorityLevel, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  dispatched: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' },
  acknowledged: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const INCIDENT_COLORS: Record<string, { bg: string; text: string }> = {
  Fire: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  'Medical Emergency': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  Disaster: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400' },
  Vehicular: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  Trauma: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400' },
  Service: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300' },
};

const INCIDENT_ICONS: Record<string, React.ReactNode> = {
  Fire: <Flame className="size-3.5" />,
  'Medical Emergency': <Heart className="size-3.5" />,
  Disaster: <Cloud className="size-3.5" />,
  Vehicular: <Car className="size-3.5" />,
  Trauma: <Crosshair className="size-3.5" />,
  Service: <Wrench className="size-3.5" />,
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

function isTeamOnShift(teamId: string): boolean {
  const shiftData = mockShifts.find((s) => s.teamId === teamId);
  if (!shiftData) return false;
  return shiftData.shifts.some((shift) => shift.status === 'on-shift');
}

function getOnShiftMembers(teamId: string): { id: string; name: string; role: string }[] {
  const shiftData = mockShifts.find((s) => s.teamId === teamId);
  if (!shiftData) return [];
  const onShift = shiftData.shifts.find((shift) => shift.status === 'on-shift');
  return onShift?.members ?? [];
}

function getAutoAssignedTeam(): (typeof mockResponseTeams)[number] | null {
  return mockResponseTeams.find((t) => t.status === 'active' && isTeamOnShift(t.id))
    ?? mockResponseTeams.find((t) => t.status === 'active')
    ?? null;
}

// ─── Report Card Component ──────────────────────────────────────

function ReportCard({
  report,
  isSelected,
  onSelect,
  getTeamName,
}: {
  report: EmergencyReport;
  isSelected: boolean;
  onSelect: () => void;
  getTeamName: (id?: string) => string;
}) {
  const incidentStyle = INCIDENT_COLORS[report.type] ?? INCIDENT_COLORS.Service;
  const statusStyle = STATUS_BADGE_STYLES[report.status] ?? STATUS_BADGE_STYLES.pending;
  const priorityStyle = PRIORITY_BADGE_STYLES[report.priority];
  // Only show "Emergency Call" badge — no Mobile App badge
  const isFromCall = report.source === 'emergency-call';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onSelect}
        className={`w-full text-left rounded-xl border p-3.5 transition-all hover:shadow-sm group ${
          isSelected
            ? 'border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-900/10 ring-1 ring-sky-200 dark:ring-sky-800'
            : 'border-border/60 bg-card hover:bg-muted/40 hover:border-border'
        }`}
      >
        {/* Top row: source + badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {/* Only show Emergency Call badge */}
              {isFromCall && (
                <Badge className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-0 text-[11px] gap-1">
                  <PhoneCall className="size-3" />
                  Emergency Call
                </Badge>
              )}
              <Badge className={`${incidentStyle.bg} ${incidentStyle.text} border-0 text-[11px] gap-1`}>
                {INCIDENT_ICONS[report.type] ?? <AlertTriangle className="size-3" />}
                {report.type}
              </Badge>
              <Badge className={`${priorityStyle.bg} ${priorityStyle.text} border-0 text-[11px] capitalize`}>
                {report.priority}
              </Badge>
            </div>
            <p className="text-sm font-semibold truncate leading-tight">{report.location}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{report.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 text-[11px] capitalize gap-1`}>
              <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
              {report.status}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="size-2.5" />
              {getTimeAgo(report.timestamp)}
            </span>
          </div>
        </div>

        {/* Reporter info */}
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
          <User className="size-3" />
          <span>{report.reportedBy.name}</span>
          <span className="text-border">|</span>
          <Phone className="size-3" />
          <span>{report.reportedBy.contact}</span>
        </div>

        {/* Assigned team indicator */}
        {report.assignedTeam && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <Truck className="size-3 text-sky-500" />
            <span className="text-muted-foreground">
              Assigned: <span className="font-semibold text-foreground">{getTeamName(report.assignedTeam)}</span>
            </span>
          </div>
        )}

        {/* Select hint for pending reports */}
        {report.status === 'pending' && !isSelected && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1">
              Click to review & dispatch
              <ArrowRight className="size-2.5" />
            </span>
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="mt-2 pt-2 border-t border-sky-200 dark:border-sky-800/50">
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1">
              <Check className="size-2.5" />
              Selected — Fill dispatch form on the right
            </span>
          </div>
        )}
      </button>
    </motion.div>
  );
}

// ─── Dispatch Form ────────────────────────────────────────────

function DispatchForm({
  selectedReport,
  onClear,
}: {
  selectedReport: EmergencyReport | null;
  onClear: () => void;
}) {
  const isFromApp = selectedReport?.source === 'mobile-app';
  const isNewCall = selectedReport === null;

  // Auto-filled from caller/app — initialize from selectedReport
  const [reporterName, setReporterName] = useState(selectedReport?.reportedBy.name ?? '');
  const [location, setLocation] = useState(selectedReport?.location ?? '');
  const [contactNumber, setContactNumber] = useState(selectedReport?.reportedBy.contact ?? '');

  // Auto-assigned team
  const autoAssignedTeam = useMemo(() => getAutoAssignedTeam(), []);
  const onShiftMembers = useMemo(() => {
    if (!autoAssignedTeam) return [];
    return getOnShiftMembers(autoAssignedTeam.id);
  }, [autoAssignedTeam]);

  // Auto-determined priority from incident type
  const [incidentType, setIncidentType] = useState<string>(selectedReport?.type ?? '');
  const [autoPriority, setAutoPriority] = useState<PriorityLevel>(selectedReport?.priority ?? 'medium');
  const [description, setDescription] = useState(selectedReport?.description ?? '');

  // Reporter type toggle: victim or witness
  const [reporterType, setReporterType] = useState<ReporterType>(selectedReport?.reporterType ?? 'victim');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set priority based on incident type
  const handleIncidentTypeChange = (value: string) => {
    setIncidentType(value);
    const incident = mockIncidentTypes.find((it) => it.name === value);
    if (incident) {
      setAutoPriority(incident.priority);
    }
  };

  const isFormValid = reporterName.trim() && location.trim() && contactNumber.trim() && incidentType;

  const handleSubmit = () => {
    if (!isFormValid || !autoAssignedTeam) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const actionLabel = isNewCall ? 'created & dispatched' : 'dispatched';
      toast.success(`Report ${actionLabel}! Team ${autoAssignedTeam.teamName} has been assigned.`, {
        description: `${incidentType} incident at ${location} — ${autoPriority} priority`,
      });

      // Reset fields
      setIncidentType('');
      setAutoPriority('medium');
      setDescription('');
      setReporterType('victim');
      setIsSubmitting(false);
      onClear();
    }, 800);
  };

  const formTitle = isNewCall
    ? 'New Emergency Call'
    : isFromApp
    ? 'Dispatch Report'
    : 'Dispatch Emergency Call';

  const formDescription = isNewCall
    ? 'Create a new report from an emergency call'
    : 'Review report details and dispatch response team';

  // Button text: mobile app reports → "Dispatch", emergency calls → "Create & Dispatch"
  const buttonText = isFromApp
    ? 'Dispatch'
    : 'Create & Dispatch';

  return (
    <Card className="h-full flex flex-col border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <Siren className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-base">{formTitle}</CardTitle>
              <CardDescription className="text-xs">{formDescription}</CardDescription>
            </div>
          </div>
          {!isNewCall && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClear}>
              <X className="size-4" />
            </Button>
          )}
        </div>
        {!isNewCall && selectedReport && (
          <div className="mt-2 flex items-center gap-2">
            <Badge className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-0">
              {selectedReport.id}
            </Badge>
            <Badge className={`border-0 text-[10px] gap-1 ${
              isFromApp
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
            }`}>
              {isFromApp ? 'From Mobile App' : 'From Emergency Call'}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
          <div className="space-y-4 pr-2">
            {/* ── Report Information (integrated: auto-filled + dispatcher input) ── */}
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-red-500" />
              <span className="text-[11px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                Report Information
              </span>
            </div>

            {/* Reporter Name — auto-filled from app, manual for calls */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <User className="size-3 text-muted-foreground" />
                Reporter Name <span className="text-red-500">*</span>
                {isFromApp && (
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[9px] px-1.5 py-0 ml-1">AUTO</Badge>
                )}
              </Label>
              <Input
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Enter reporter's name"
                className={`h-9 text-sm ${isFromApp ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30' : ''}`}
              />
            </div>

            {/* Incident Location — auto-filled from app, manual for calls */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <MapPinned className="size-3 text-muted-foreground" />
                Incident Location <span className="text-red-500">*</span>
                {isFromApp && (
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[9px] px-1.5 py-0 ml-1">AUTO</Badge>
                )}
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter incident location"
                className={`h-9 text-sm ${isFromApp ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30' : ''}`}
              />
            </div>

            {/* Contact Number — auto-filled from app, manual for calls */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Phone className="size-3 text-muted-foreground" />
                Contact Number <span className="text-red-500">*</span>
                {isFromApp && (
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[9px] px-1.5 py-0 ml-1">AUTO</Badge>
                )}
              </Label>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter contact number"
                className={`h-9 text-sm ${isFromApp ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30' : ''}`}
              />
            </div>

            {/* Auto-assigned Team */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-muted-foreground" />
                Assigned Team
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[9px] px-1.5 py-0 ml-1">AUTO-ASSIGNED</Badge>
              </Label>
              {autoAssignedTeam ? (
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-900/10 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{autoAssignedTeam.teamName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {onShiftMembers.length} member{onShiftMembers.length !== 1 ? 's' : ''} on shift
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="relative flex size-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
                    </div>
                  </div>
                  {onShiftMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {onShiftMembers.map((m) => (
                        <span key={m.id} className="inline-flex items-center rounded-md bg-background px-1.5 py-0.5 text-[10px] font-medium border border-border/50">
                          {m.name} ({m.role})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  No teams available
                </div>
              )}
            </div>

            <Separator className="my-2" />

            {/* ── Dispatcher Input (integrated in same section) ── */}
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-sky-500" />
              <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400 uppercase tracking-wider">Dispatcher Input</span>
            </div>

            {/* Incident Type + Reporter Type in same row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Incident Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Incident Type <span className="text-red-500">*</span>
                </Label>
                <Select value={incidentType} onValueChange={handleIncidentTypeChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIncidentTypes.map((it) => (
                      <SelectItem key={it.id} value={it.name}>
                        <span className="flex items-center gap-2">
                          {INCIDENT_ICONS[it.name] ?? <AlertTriangle className="size-3.5" />}
                          {it.name}
                          <Badge className={`${PRIORITY_BADGE_STYLES[it.priority].bg} ${PRIORITY_BADGE_STYLES[it.priority].text} border-0 text-[9px] px-1 py-0 capitalize`}>
                            {it.priority}
                          </Badge>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reporter Type: Victim or Witness toggle */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Reporter is a</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={reporterType === 'victim' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 h-9 text-xs gap-1.5 ${reporterType === 'victim' ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}`}
                    onClick={() => setReporterType('victim')}
                  >
                    <UserCheck className="size-3.5" />
                    Victim
                  </Button>
                  <Button
                    type="button"
                    variant={reporterType === 'witness' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 h-9 text-xs gap-1.5 ${reporterType === 'witness' ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}`}
                    onClick={() => setReporterType('witness')}
                  >
                    <Eye className="size-3.5" />
                    Witness
                  </Button>
                </div>
              </div>
            </div>

            {/* Auto-determined Priority (read-only display) */}
            {incidentType && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-[11px] text-muted-foreground">Priority level:</span>
                <Badge className={`${PRIORITY_BADGE_STYLES[autoPriority].bg} ${PRIORITY_BADGE_STYLES[autoPriority].text} border-0 text-[11px] capitalize`}>
                  {autoPriority}
                </Badge>
                <span className="text-[10px] text-muted-foreground">(auto-set from incident type)</span>
              </div>
            )}

            {/* Description (optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Description
                <span className="text-muted-foreground font-normal ml-1">(optional)</span>
              </Label>
              <Textarea
                placeholder="Describe the situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[70px] text-sm resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isSubmitting ? 'Dispatching...' : buttonText}
            </Button>

            {!isFormValid && (
              <p className="text-[11px] text-muted-foreground text-center">
                Please fill in Reporter Name, Incident Location, Contact, and Incident Type to dispatch.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  accentDot,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  accentDot?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`flex size-8 items-center justify-center rounded-lg ${iconBg}`}>
                <div className={iconColor}>{icon}</div>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
                <p className="text-xl font-bold leading-tight mt-0.5">{value}</p>
              </div>
            </div>
            {accentDot && (
              <span className="relative flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentDot }} />
                <span className="relative inline-flex size-3 rounded-full" style={{ backgroundColor: accentDot }} />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Dispatcher Dashboard ───────────────────────────────────
export function DispatcherDashboard() {
  const { navigateTo } = useAppStore();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Filter reports: only pending + dispatched + acknowledged (no resolved)
  const incomingReports = useMemo(
    () =>
      mockReports
        .filter((r) => r.status === 'pending' || r.status === 'dispatched' || r.status === 'acknowledged')
        .sort((a, b) => {
          // Sort: pending first, then by timestamp desc
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }),
    []
  );

  const selectedReport = useMemo(
    () => mockReports.find((r) => r.id === selectedReportId) ?? null,
    [selectedReportId]
  );

  const pendingCount = useMemo(() => mockReports.filter((r) => r.status === 'pending').length, []);
  const dispatchedCount = useMemo(() => mockReports.filter((r) => r.status === 'dispatched').length, []);
  const acknowledgedCount = useMemo(() => mockReports.filter((r) => r.status === 'acknowledged').length, []);
  const availableTeamsCount = useMemo(
    () => mockResponseTeams.filter((t) => t.status === 'active' && isTeamOnShift(t.id)).length,
    []
  );

  const getTeamName = (teamId?: string) => {
    if (!teamId) return 'Unassigned';
    const team = mockResponseTeams.find((t) => t.id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId((prev) => prev === reportId ? null : reportId);
  };

  const handleClearSelection = () => {
    setSelectedReportId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/20">
            <Radio className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Dispatch Operations</h2>
            <p className="text-sm text-muted-foreground">Receive reports, review, and dispatch response teams</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">System Online</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<AlertTriangle className="size-4" />}
          label="Pending Reports"
          value={pendingCount}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          accentDot="#f59e0b"
        />
        <StatCard
          icon={<Truck className="size-4" />}
          label="Dispatched"
          value={dispatchedCount}
          iconBg="bg-sky-100 dark:bg-sky-900/30"
          iconColor="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          icon={<Navigation className="size-4" />}
          label="Acknowledged"
          value={acknowledgedCount}
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          icon={<ShieldCheck className="size-4" />}
          label="Available Teams"
          value={availableTeamsCount}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          accentDot="#22c55e"
        />
      </div>

      {/* Main Content: 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT COLUMN: Incoming Reports */}
        <div>
          <Card className="h-full flex flex-col border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-base">Incoming Reports</CardTitle>
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-xs">
                    {incomingReports.length}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-xs">
                Select a pending report to review & dispatch, or create a new emergency call on the right
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-[calc(100vh-420px)] min-h-[400px]">
                {incomingReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                      <ShieldCheck className="size-7 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">All clear!</p>
                    <p className="text-xs text-muted-foreground mt-1">No pending or active reports</p>
                  </div>
                ) : (
                  <div className="space-y-2 px-4 pb-4">
                    <AnimatePresence mode="popLayout">
                      {incomingReports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          isSelected={report.id === selectedReportId}
                          onSelect={() => handleSelectReport(report.id)}
                          getTeamName={getTeamName}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Dispatch Form */}
        <DispatchForm
          key={selectedReportId ?? 'new'}
          selectedReport={selectedReport}
          onClear={handleClearSelection}
        />
      </div>
    </div>
  );
}
