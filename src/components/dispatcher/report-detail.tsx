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

import { useAppStore } from '@/lib/store';
import { mockReports } from '@/lib/mock-data';
import type { PriorityLevel, ReportStatus } from '@/lib/types';
import { LocationMap } from '@/components/maps/location-map';

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

export function ReportDetail() {
  const { selectedReportId, navigateTo } = useAppStore();

  const report = useMemo(
    () => mockReports.find((r) => r.id === selectedReportId) || null,
    [selectedReportId]
  );

  const handleBack = () => {
    navigateTo('dispatcher-dashboard');
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


    </div>
  );
}

export default ReportDetail;
