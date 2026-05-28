'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  Map,
  AlertOctagon,
  FileWarning,
  UserPlus,
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  adminDashboardStats,
  reportsByType,
  recentActivity,
  mockReports,
} from '@/lib/mock-data';
import type { PriorityLevel } from '@/lib/types';
import { Heatmap, INCIDENT_COLORS, INCIDENT_TYPES } from '@/components/maps/heatmap';

const chartConfig = {
  Fire: { label: 'Fire', color: '#ef4444' },
  'Medical Emergency': { label: 'Medical Emergency', color: '#22c55e' },
  Disaster: { label: 'Disaster', color: '#3b82f6' },
  Vehicular: { label: 'Vehicular', color: '#f59e0b' },
  Trauma: { label: 'Trauma', color: '#ec4899' },
  Ambulance: { label: 'Ambulance', color: '#06b6d4' },
  Service: { label: 'Service', color: '#6b7280' },
} satisfies ChartConfig;

const activityIcons: Record<string, React.ReactNode> = {
  report: <AlertTriangle className="size-4 text-sky-500" />,
  dispatch: <ShieldCheck className="size-4 text-blue-500" />,
  resolve: <CheckCircle className="size-4 text-green-500" />,
  user: <UserPlus className="size-4 text-blue-500" />,
};

function getPriorityBadge(priority: PriorityLevel) {
  const styles: Record<PriorityLevel, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge className={`${styles[priority]} border-0 capitalize`}>
      {priority}
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
  const noneHidden = hiddenTypes.size === 0;

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

export function AdminDashboard() {
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

  // Filter chart data based on hidden types
  const filteredChartData = useMemo(
    () => reportsByType.filter((entry) => !hiddenTypes.has(entry.type)),
    [hiddenTypes]
  );

  const latestCriticalReport = mockReports
    .filter((r) => r.status === 'pending' || r.priority === 'critical')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">
                  {adminDashboardStats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
                <Users className="size-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <TrendingUp className="size-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400">+12%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Reports</p>
                <p className="text-3xl font-bold">
                  {adminDashboardStats.activeReports}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <TrendingUp className="size-3 text-red-500" />
              <span className="text-red-600 dark:text-red-400">+5</span>
              <span className="text-muted-foreground">since yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-3xl font-bold">
                  {adminDashboardStats.pendingApprovals}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="size-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <TrendingUp className="size-3 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400">3 urgent</span>
              <span className="text-muted-foreground">need attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Resolved (24h)</p>
                <p className="text-3xl font-bold">
                  {adminDashboardStats.reportsResolved24h}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <TrendingUp className="size-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400">+8%</span>
              <span className="text-muted-foreground">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Overview Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileWarning className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reports Today</p>
                <p className="text-2xl font-bold">{adminDashboardStats.reportsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                <Activity className="size-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{adminDashboardStats.avgResolutionTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate (7d)</p>
                <p className="text-2xl font-bold">{adminDashboardStats.resolutionRate7d}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Heat Map - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="size-5 text-blue-500" />
              <CardTitle>Incident Heat Map</CardTitle>
            </div>
            <IncidentTypeFilter
              hiddenTypes={hiddenTypes}
              onToggleType={toggleType}
              onToggleAll={toggleAll}
              allTypes={INCIDENT_TYPES}
            />
          </div>
          <CardDescription>Geographic distribution of incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap height="500px" hiddenTypes={hiddenTypes} />
        </CardContent>
      </Card>

      {/* Bottom Row: Incident Types Chart, Latest Report & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Reports Type Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Incident Types — Last 7 Days</CardTitle>
                <CardDescription>Breakdown of emergency reports by type</CardDescription>
              </div>
              <IncidentTypeFilter
                hiddenTypes={hiddenTypes}
                onToggleType={toggleType}
                onToggleAll={toggleAll}
                allTypes={INCIDENT_TYPES}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <EyeOff className="size-10 mb-2 opacity-40" />
                <p className="text-sm">All incident types are hidden</p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-500 mt-1"
                  onClick={() => setHiddenTypes(new Set())}
                >
                  Show all types
                </Button>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={filteredChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="type"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                  >
                    {filteredChartData.map((entry, index) => (
                      <rect key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Latest Emergency Report */}
        {latestCriticalReport && (
          <Card className="border-blue-200 dark:border-blue-900/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertOctagon className="size-5 text-red-500" />
                <CardTitle>Latest Emergency Report</CardTitle>
              </div>
              <CardDescription>Most recent pending or critical report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-lg font-semibold">{latestCriticalReport.type}</h4>
                  <p className="text-sm text-muted-foreground">
                    {latestCriticalReport.location}
                  </p>
                </div>
                {getPriorityBadge(latestCriticalReport.priority)}
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm leading-relaxed">
                  {latestCriticalReport.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>ID: {latestCriticalReport.id}</span>
                <span>
                  {new Date(latestCriticalReport.timestamp).toLocaleString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Reported by: {latestCriticalReport.reportedBy.name}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 px-6">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {activityIcons[activity.type] || <Activity className="size-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} &middot; {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
