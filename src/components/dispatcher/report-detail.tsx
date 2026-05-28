'use client';

import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  AlertTriangle,
  ShieldCheck,
  XCircle,
  Send,
  FileText,
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { mockReports, mockResponseTeams } from '@/lib/mock-data';
import type { PriorityLevel, ReportStatus } from '@/lib/types';
import { LocationMap } from '@/components/maps/location-map';
import { toast } from 'sonner';

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

const INCIDENT_COLORS: Record<string, string> = {
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

export function ReportDetail() {
  const { selectedReportId, navigateTo, setSelectedReportId } = useAppStore();
  const [showInvalidDialog, setShowInvalidDialog] = useState(false);
  const [showDispatchDialog, setShowDispatchDialog] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const report = useMemo(
    () => mockReports.find((r) => r.id === selectedReportId) || null,
    [selectedReportId]
  );

  const availableTeams = useMemo(
    () => mockResponseTeams.filter((t) => t.availability === 'available'),
    []
  );

  const getTeamName = (teamId: string) => {
    const team = mockResponseTeams.find((t) => t.id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const handleBack = () => {
    navigateTo('dispatcher-reports');
  };

  const handleMarkInvalid = () => {
    setShowInvalidDialog(false);
    toast.error(`Report ${report?.id} marked as invalid`, {
      description: 'The report has been flagged as invalid and removed from active monitoring.',
    });
    navigateTo('dispatcher-reports');
  };

  const handleDispatch = () => {
    if (!selectedTeamId) {
      toast.error('Please select a response team');
      return;
    }
    setShowDispatchDialog(false);
    toast.success(`${getTeamName(selectedTeamId)} dispatched!`, {
      description: `Team has been assigned to report ${report?.id}.`,
    });
    setSelectedTeamId('');
    navigateTo('dispatcher-reports');
  };

  if (!report) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Reports
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-12 text-muted-foreground/40" />
            <p className="mt-3 text-lg font-medium text-muted-foreground">No report selected</p>
            <p className="text-sm text-muted-foreground">Please select a report from the reports list</p>
            <Button variant="outline" onClick={handleBack} className="mt-4 gap-2">
              <ArrowLeft className="size-4" />
              Go to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const incidentStyle = INCIDENT_COLORS[report.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="gap-2">
        <ArrowLeft className="size-4" />
        Back to Reports
      </Button>

      {/* Report Header */}
      <Card className="border-blue-200 dark:border-blue-900/50">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
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
          {/* Date/Time and Reporter */}
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

          {/* Assigned Team (if any) */}
          {report.assignedTeam && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Team</p>
                  <p className="text-sm font-medium">{getTeamName(report.assignedTeam)}</p>
                </div>
              </div>
            </>
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

      {/* Action Buttons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Actions</CardTitle>
          <CardDescription>Take action on this emergency report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="destructive"
              className="gap-2 flex-1"
              onClick={() => setShowInvalidDialog(true)}
              disabled={report.status === 'resolved' || report.status === 'invalid'}
            >
              <XCircle className="size-4" />
              Mark as Invalid
            </Button>
            <Button
              className="gap-2 flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowDispatchDialog(true)}
              disabled={report.status === 'resolved' || report.status === 'invalid' || report.status === 'dispatched'}
            >
              <Send className="size-4" />
              Send to Response Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mark as Invalid Confirmation Dialog */}
      <AlertDialog open={showInvalidDialog} onOpenChange={setShowInvalidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-red-500" />
              Mark Report as Invalid
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark report <strong>{report.id}</strong> as invalid? This will remove it from active monitoring. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkInvalid} className="bg-red-600 hover:bg-red-700">
              Mark as Invalid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send to Response Team Dialog */}
      <Dialog open={showDispatchDialog} onOpenChange={setShowDispatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-green-600" />
              Dispatch Response Team
            </DialogTitle>
            <DialogDescription>
              Select an available response team to dispatch for report <strong>{report.id}</strong> ({report.type} - {report.location}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="team-select">Response Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger id="team-select">
                  <SelectValue placeholder="Select a response team..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No teams available
                    </SelectItem>
                  ) : (
                    availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.teamName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Team Details Preview */}
            {selectedTeamId && (
              <Card className="bg-muted/50">
                <CardContent className="p-3 space-y-2">
                  {(() => {
                    const team = mockResponseTeams.find((t) => t.id === selectedTeamId);
                    if (!team) return null;
                    return (
                      <>
                        <p className="text-sm font-medium">{team.teamName}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Members ({team.members.length}):</p>
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between text-xs">
                              <span>{member.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{member.role}</span>
                                <Badge
                                  className={`border-0 text-[10px] ${
                                    member.availability === 'available'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}
                                >
                                  {member.availability}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispatchDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDispatch}
              disabled={!selectedTeamId}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="size-4 mr-2" />
              Dispatch Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReportDetail;
