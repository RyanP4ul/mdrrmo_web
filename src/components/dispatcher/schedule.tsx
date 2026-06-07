'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Heart,
  ShieldAlert,
  Package,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { mockServiceSchedules } from '@/lib/mock-data';
import type { ServiceSchedule, ScheduleStatus } from '@/lib/types';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────

const STATUS_STYLES: Record<ScheduleStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  acknowledged: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' },
  confirmed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  declined: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  completed: { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
  cancelled: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-400' },
};

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'Medical Transport': <Heart className="size-3.5 text-rose-500" />,
  'Relief Goods Delivery': <Package className="size-3.5 text-amber-500" />,
  'Evacuation Assistance': <ShieldAlert className="size-3.5 text-sky-500" />,
};

const SERVICE_COLORS: Record<string, string> = {
  'Medical Transport': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  'Relief Goods Delivery': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  'Evacuation Assistance': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
};

// ─── Schedule Card ────────────────────────────────────────────────

function ScheduleCard({
  schedule,
  onAcknowledge,
  onDecline,
}: {
  schedule: ServiceSchedule;
  onAcknowledge: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const statusStyle = STATUS_STYLES[schedule.status] ?? STATUS_STYLES.pending;
  const serviceColor = SERVICE_COLORS[schedule.serviceType] ?? 'bg-slate-100 dark:bg-slate-800/50 text-slate-700';
  const serviceIcon = SERVICE_ICONS[schedule.serviceType] ?? <Truck className="size-3.5 text-slate-500" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-sm transition-shadow"
    >
      {/* Top row: Service type + Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Badge className={`${serviceColor} border-0 text-[11px] gap-1`}>
          {serviceIcon}
          {schedule.serviceType}
        </Badge>
        <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 text-[11px] capitalize gap-1`}>
          <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
          {schedule.status}
        </Badge>
      </div>

      {/* Resident info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <User className="size-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{schedule.residentName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="size-3 shrink-0" />
          <span>{schedule.residentContact}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{schedule.address}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3 shrink-0" />
          <span>{format(parseISO(schedule.preferredDate), 'MMM d, yyyy')} at {schedule.preferredTime}</span>
        </div>
        {schedule.notes && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <FileText className="size-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{schedule.notes}</span>
          </div>
        )}
      </div>

      {/* Acknowledged/Declined info */}
      {schedule.acknowledgedBy && schedule.acknowledgedAt && (
        <div className="mt-2 pt-2 border-t border-border/40 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3" />
          <span>Acknowledged by {schedule.acknowledgedBy} · {format(parseISO(schedule.acknowledgedAt), 'MMM d, h:mm a')}</span>
        </div>
      )}

      {schedule.status === 'declined' && schedule.declineReason && (
        <div className="mt-2 pt-2 border-t border-red-200/50 dark:border-red-800/30">
          <div className="flex items-start gap-1.5 text-[10px]">
            <XCircle className="size-3 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-red-600 dark:text-red-400 font-medium">Declined:</span>{' '}
              <span className="text-red-600/80 dark:text-red-400/80">{schedule.declineReason}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons for pending */}
      {schedule.status === 'pending' && (
        <div className="mt-3 pt-2 border-t border-border/40 flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onAcknowledge(schedule.id)}
          >
            <CheckCircle2 className="size-3.5" />
            Acknowledge
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/30"
            onClick={() => onDecline(schedule.id)}
          >
            <XCircle className="size-3.5" />
            Decline
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Calendar Component ───────────────────────────────────────────

function CalendarView({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  selectedDate,
  schedules,
}: {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  schedules: ServiceSchedule[];
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Build schedule map by date
  const scheduleMap = useMemo(() => {
    const map: Record<string, ServiceSchedule[]> = {};
    schedules.forEach((s) => {
      const key = s.preferredDate;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [schedules]);

  // Generate calendar days
  const weeks: Date[][] = useMemo(() => {
    const rows: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [calStart, calEnd]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" onClick={onPrevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={onNextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const daySchedules = scheduleMap[dateStr] ?? [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isTodayDate = isToday(day);

              return (
                <button
                  key={`${wi}-${di}`}
                  onClick={() => onSelectDate(day)}
                  className={`relative rounded-lg p-1.5 min-h-[52px] text-left transition-colors ${
                    !isCurrentMonth
                      ? 'opacity-30'
                      : isSelected
                      ? 'bg-sky-100 dark:bg-sky-900/30 ring-1 ring-sky-300 dark:ring-sky-700'
                      : isTodayDate
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <span className={`text-xs font-medium ${
                    isTodayDate ? 'text-emerald-600 dark:text-emerald-400' : isSelected ? 'text-sky-700 dark:text-sky-300' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {daySchedules.length > 0 && isCurrentMonth && (
                    <div className="mt-0.5 flex flex-wrap gap-0.5">
                      {daySchedules.slice(0, 3).map((s) => {
                        const status = s.status;
                        const dotColor = STATUS_STYLES[status]?.dot ?? 'bg-gray-400';
                        return (
                          <span key={s.id} className={`size-1.5 rounded-full ${dotColor}`} />
                        );
                      })}
                      {daySchedules.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{daySchedules.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-3">
          {(['pending', 'acknowledged', 'confirmed', 'declined'] as ScheduleStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${STATUS_STYLES[status].dot}`} />
              <span className="text-[10px] text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function DispatcherSchedule() {
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([...mockServiceSchedules]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Decline dialog
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [decliningScheduleId, setDecliningScheduleId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Stats
  const pendingCount = useMemo(() => schedules.filter((s) => s.status === 'pending').length, [schedules]);
  const acknowledgedCount = useMemo(() => schedules.filter((s) => s.status === 'acknowledged').length, [schedules]);
  const confirmedCount = useMemo(() => schedules.filter((s) => s.status === 'confirmed').length, [schedules]);
  const declinedCount = useMemo(() => schedules.filter((s) => s.status === 'declined').length, [schedules]);

  // Filtered schedules for queue
  const filteredSchedules = useMemo(() => {
    let result = [...schedules];

    // Filter by selected date
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      result = result.filter((s) => s.preferredDate === dateStr);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((s) => s.status === filterStatus);
    }

    // Sort: pending first, then by date
    result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return a.preferredDate.localeCompare(b.preferredDate);
    });

    return result;
  }, [schedules, selectedDate, filterStatus]);

  const handleAcknowledge = useCallback((scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              status: 'acknowledged' as ScheduleStatus,
              acknowledgedBy: 'Maria Santos',
              acknowledgedAt: new Date().toISOString(),
            }
          : s
      )
    );
    const schedule = schedules.find((s) => s.id === scheduleId);
    toast.success('Schedule acknowledged!', {
      description: `${schedule?.residentName}'s ${schedule?.serviceType} request has been acknowledged. Notification sent to resident.`,
    });
  }, [schedules]);

  const handleOpenDeclineDialog = useCallback((scheduleId: string) => {
    setDecliningScheduleId(scheduleId);
    setDeclineReason('');
    setDeclineDialogOpen(true);
  }, []);

  const handleDecline = useCallback(() => {
    if (!decliningScheduleId || !declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === decliningScheduleId
          ? {
              ...s,
              status: 'declined' as ScheduleStatus,
              declineReason: declineReason.trim(),
            }
          : s
      )
    );

    const schedule = schedules.find((s) => s.id === decliningScheduleId);
    toast.success('Schedule declined', {
      description: `Decline notification with reason sent to ${schedule?.residentName}.`,
    });

    setDeclineDialogOpen(false);
    setDecliningScheduleId(null);
    setDeclineReason('');
  }, [decliningScheduleId, declineReason, schedules]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate((prev) => isSameDay(date, prev ?? new Date(0)) ? null : date);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 shadow-lg shadow-sky-500/20">
            <CalendarClock className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Schedule Management</h2>
            <p className="text-sm text-muted-foreground">Review and manage resident service schedules</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground leading-tight">Pending</p>
                  <p className="text-xl font-bold leading-tight mt-0.5">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                  <Clock className="size-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground leading-tight">Acknowledged</p>
                  <p className="text-xl font-bold leading-tight mt-0.5">{acknowledgedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground leading-tight">Confirmed</p>
                  <p className="text-xl font-bold leading-tight mt-0.5">{confirmedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <XCircle className="size-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground leading-tight">Declined</p>
                  <p className="text-xl font-bold leading-tight mt-0.5">{declinedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main content: Calendar + Schedule Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Calendar — 3 columns (60%) */}
        <div className="lg:col-span-3">
          <CalendarView
            currentMonth={currentMonth}
            onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
            schedules={schedules}
          />
        </div>

        {/* Schedule Queue — 2 columns (40%) */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Schedule Queue</CardTitle>
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-xs">
                    {filteredSchedules.length}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-xs">
                {selectedDate
                  ? `Showing schedules for ${format(selectedDate, 'MMMM d, yyyy')}`
                  : 'All upcoming schedules from resident app requests'}
              </CardDescription>
              {/* Date filter clear */}
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] text-sky-600 dark:text-sky-400 w-fit -mt-1"
                  onClick={() => setSelectedDate(null)}
                >
                  Clear date filter
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              {/* Status filter tabs */}
              <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'acknowledged', label: 'Acknowledged' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'declined', label: 'Declined' },
                ].map((tab) => (
                  <Button
                    key={tab.value}
                    variant={filterStatus === tab.value ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-[11px] px-2.5 ${
                      filterStatus === tab.value
                        ? 'bg-sky-600 hover:bg-sky-700 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setFilterStatus(tab.value)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-[calc(100vh-540px)] min-h-[350px]">
                {filteredSchedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-3">
                      <CalendarClock className="size-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No schedules found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedDate ? 'Try selecting a different date' : 'All schedules are up to date'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 px-4 pb-4">
                    {filteredSchedules.map((schedule) => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        onAcknowledge={handleAcknowledge}
                        onDecline={handleOpenDeclineDialog}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decline Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="size-5" />
              Decline Schedule
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this schedule. The reason will be sent to the resident&apos;s app as a notification.
            </DialogDescription>
          </DialogHeader>
          {decliningScheduleId && (() => {
            const schedule = schedules.find((s) => s.id === decliningScheduleId);
            return schedule ? (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={`${SERVICE_COLORS[schedule.serviceType] ?? ''} border-0 text-[10px] gap-1`}>
                    {SERVICE_ICONS[schedule.serviceType]}
                    {schedule.serviceType}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{schedule.residentName}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(schedule.preferredDate), 'MMM d, yyyy')} at {schedule.preferredTime}
                </p>
              </div>
            ) : null;
          })()}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Reason for declining <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Explain why this schedule cannot be accommodated..."
              className="min-h-[80px] text-sm resize-none"
            />
            <p className="text-[10px] text-muted-foreground">
              This reason will be sent as a notification to the resident&apos;s mobile app.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDecline}
              disabled={!declineReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Decline Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
