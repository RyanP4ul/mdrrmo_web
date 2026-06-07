'use client';

import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  AlertTriangle,
  FileText,
  Smartphone,
  PhoneCall,
  UserCheck,
  Eye,
  ShieldCheck,
  Send,
  Check,
  Truck,
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

import { useAppStore } from '@/lib/store';
import { mockReports, mockResponseTeams, mockShifts } from '@/lib/mock-data';
import type { PriorityLevel, ReportStatus } from '@/lib/types';
import { LocationMap } from '@/components/maps/location-map';
import { toast } from 'sonner';

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
  Service: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

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

export function ReportDetail() {
  const { selectedReportId, navigateTo } = useAppStore();
  const [isDispatching, setIsDispatching] = useState(false);

  const report = useMemo(
    () => mockReports.find((r) => r.id === selectedReportId) || null,
    [selectedReportId]
  );

  const handleBack = () => {
    navigateTo('dispatcher-dashboard');
  };

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      const team = mockResponseTeams.find((t) => t.status === 'active' && isTeamOnShift(t.id));
      toast.success(`Response team ${team?.teamName ?? 'Team'} dispatched!`, {
        description: `En route to ${report?.location}`,
      });
      setIsDispatching(false);
    }, 800);
  };

  if (!report) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Operations
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-12 text-muted-foreground/40" />
            <p className="mt-3 text-lg font-medium text-muted-foreground">No report selected</p>
            <p className="text-sm text-muted-foreground">Please select a report from the operations page</p>
            <Button variant="outline" onClick={handleBack} className="mt-4 gap-2">
              <ArrowLeft className="size-4" />
              Go to Operations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const incidentStyle = INCIDENT_COLORS[report.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  const isFromApp = report.source === 'mobile-app';
  const assignedTeam = report.assignedTeam ? mockResponseTeams.find((t) => t.id === report.assignedTeam) : null;
  const autoTeam = mockResponseTeams.find((t) => t.status === 'active' && isTeamOnShift(t.id));
  const teamToShow = assignedTeam ?? autoTeam;
  const onShiftMembers = teamToShow ? getOnShiftMembers(teamToShow.id) : [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="gap-2">
        <ArrowLeft className="size-4" />
        Back to Operations
      </Button>

      {/* Report Header */}
      <Card className="border-blue-200 dark:border-blue-900/50">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`border-0 gap-1 ${isFromApp ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'}`}>
                  {isFromApp ? <Smartphone className="size-3" /> : <PhoneCall className="size-3" />}
                  {isFromApp ? 'Mobile App' : 'Emergency Call'}
                </Badge>
                <Badge className={`${incidentStyle} border-0`}>{report.type}</Badge>
                <Badge className={`${priorityStyles[report.priority]} border-0 capitalize`}>
                  {report.priority} priority
                </Badge>
                <Badge className={`${statusStyles[report.status]} border-0 capitalize`}>
                  {report.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">Report {report.id}</CardTitle>
              <CardDescription>{report.location}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date/Time Reported</p>
                  <p className="text-sm font-medium">
                    {new Date(report.timestamp).toLocaleString('en-PH', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reported By</p>
                  <p className="text-sm font-medium">{report.reportedBy.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium">{report.reportedBy.contact}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Team */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-500" />
            <CardTitle>Assigned Response Team</CardTitle>
            {!report.assignedTeam && (
              <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-[10px]">AUTO-ASSIGN</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {teamToShow ? (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-900/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">{teamToShow.teamName}</p>
                  <p className="text-xs text-muted-foreground">
                    {onShiftMembers.length} member{onShiftMembers.length !== 1 ? 's' : ''} on shift
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
                </div>
              </div>
              {onShiftMembers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {onShiftMembers.map((m) => (
                    <span key={m.id} className="inline-flex items-center rounded-md bg-background px-2 py-0.5 text-xs font-medium border border-border/50">
                      {m.name} ({m.role})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              No teams available for assignment
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Map */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-blue-500" />
            <CardTitle>Incident Location</CardTitle>
          </div>
          <CardDescription>
            {report.location} ({report.lat.toFixed(4)}, {report.lng.toFixed(4)})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationMap
            lat={report.lat}
            lng={report.lng}
            label={`${report.type} - ${report.location}`}
            height="350px"
          />
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-blue-500" />
            <CardTitle>Incident Description</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={report.description}
            readOnly
            className="min-h-[100px] resize-none bg-muted/50"
          />
        </CardContent>
      </Card>

      {/* Victim Information */}
      {report.victimInfo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="size-5 text-orange-500" />
              <CardTitle>Victim Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{report.victimInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="text-sm font-medium">{report.victimInfo.age}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sex</p>
                <p className="text-sm font-medium">{report.victimInfo.sex}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{report.victimInfo.address}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="text-sm font-medium">{report.victimInfo.contact}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Witness Information */}
      {report.witnessInfo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Eye className="size-5 text-violet-500" />
              <CardTitle>Witness Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{report.witnessInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="text-sm font-medium">{report.witnessInfo.contact}</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Statement</p>
              <p className="text-sm">{report.witnessInfo.statement}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispatch Button (for pending reports) */}
      {report.status === 'pending' && (
        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Ready to Dispatch?</p>
                <p className="text-sm text-muted-foreground">
                  {teamToShow
                    ? `${teamToShow.teamName} will be dispatched to the incident location.`
                    : 'No available teams to dispatch.'}
                </p>
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-w-[180px]"
                disabled={!teamToShow || isDispatching}
                onClick={handleDispatch}
              >
                {isDispatching ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {isDispatching ? 'Dispatching...' : 'Dispatch Team'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already dispatched indicator */}
      {(report.status === 'dispatched' || report.status === 'acknowledged') && assignedTeam && (
        <Card className="border-sky-200 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
                <Truck className="size-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="font-semibold text-sky-700 dark:text-sky-400">
                  {assignedTeam.teamName} — {report.status === 'dispatched' ? 'Dispatched' : 'Acknowledged'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Response team is {report.status === 'dispatched' ? 'en route' : 'on scene'} to this incident.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ReportDetail;
