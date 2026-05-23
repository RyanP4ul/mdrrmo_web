'use client';

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
  Megaphone,
  UserPlus,
  ShieldCheck,
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
import { Heatmap } from '@/components/maps/heatmap';

const chartConfig = {
  Flood: { label: 'Flood', color: '#f97316' },
  Fire: { label: 'Fire', color: '#ef4444' },
  Medical: { label: 'Medical', color: '#22c55e' },
  Accident: { label: 'Accident', color: '#f59e0b' },
  Typhoon: { label: 'Typhoon', color: '#a855f7' },
  Landslide: { label: 'Landslide', color: '#ec4899' },
  'Power Outage': { label: 'Power Outage', color: '#6b7280' },
  Other: { label: 'Other', color: '#14b8a6' },
} satisfies ChartConfig;

const activityIcons: Record<string, React.ReactNode> = {
  report: <AlertTriangle className="size-4 text-amber-500" />,
  dispatch: <ShieldCheck className="size-4 text-orange-500" />,
  resolve: <CheckCircle className="size-4 text-green-500" />,
  user: <UserPlus className="size-4 text-blue-500" />,
  announcement: <Megaphone className="size-4 text-purple-500" />,
};

function getPriorityBadge(priority: PriorityLevel) {
  const styles: Record<PriorityLevel, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge className={`${styles[priority]} border-0 capitalize`}>
      {priority}
    </Badge>
  );
}

export function AdminDashboard() {
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
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Users className="size-6 text-amber-600 dark:text-amber-400" />
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
              <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FileWarning className="size-5 text-orange-600 dark:text-orange-400" />
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
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Activity className="size-5 text-amber-600 dark:text-amber-400" />
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

      {/* Heat Map and Activity Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Incident Heat Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Map className="size-5 text-orange-500" />
              <CardTitle>Incident Heat Map</CardTitle>
            </div>
            <CardDescription>Geographic distribution of incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap height="300px" />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[320px]">
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

      {/* Bottom Row: Incident Types Chart & Latest Report */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reports Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Types — Last 7 Days</CardTitle>
            <CardDescription>Breakdown of emergency reports by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart data={reportsByType} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  {reportsByType.map((entry, index) => (
                    <rect key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Latest Emergency Report */}
        {latestCriticalReport && (
          <Card className="border-orange-200 dark:border-orange-900/50">
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
      </div>
    </div>
  );
}
