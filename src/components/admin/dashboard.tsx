'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Siren,
  Users,
  Activity,
  ShieldCheck,
  UserPlus,
  MapPin,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  reportsByType,
  recentActivity,
  mockReports,
  mockResidents,
  mockHeatmapData,
} from '@/lib/mock-data';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

// ── Animation variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Color maps ──────────────────────────────────────────────────────
const INCIDENT_COLORS: Record<string, string> = {
  Fire: '#ef4444',
  'Medical Emergency': '#22c55e',
  Disaster: '#3b82f6',
  Vehicular: '#f59e0b',
  Trauma: '#ec4899',
  Service: '#6b7280',
};

// ── Activity icons ──────────────────────────────────────────────────
const activityIcons: Record<string, React.ReactNode> = {
  report: <AlertTriangle className="size-4 text-amber-500" />,
  dispatch: <ShieldCheck className="size-4 text-violet-500" />,
  resolve: <CheckCircle className="size-4 text-green-500" />,
  user: <Activity className="size-4 text-sky-500" />,
};

// ── Custom pie label ────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Heat Map Component ──────────────────────────────────────────────
function IncidentHeatMap() {
  return (
    <div className="h-[350px] w-full rounded-lg overflow-hidden relative">
      <MapContainer
        center={[16.0433, 120.3372]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockHeatmapData.map((point, idx) => (
          <CircleMarker
            key={idx}
            center={[point.lat, point.lng]}
            radius={Math.max(8, point.intensity * 25)}
            pathOptions={{
              fillColor: INCIDENT_COLORS[point.type] || '#6b7280',
              fillOpacity: point.intensity * 0.5,
              color: INCIDENT_COLORS[point.type] || '#6b7280',
              weight: 1,
              opacity: 0.6,
            }}
          />
        ))}
      </MapContainer>
      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-2.5 shadow-lg z-[1000]">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Incident Types</p>
        <div className="flex flex-col gap-1">
          {Object.entries(INCIDENT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export function AdminDashboard() {
  // Period toggle for pie chart: today, weekly, monthly
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly'>('monthly');

  // Compute stats
  const reportStats = useMemo(() => {
    const pending = mockReports.filter((r) => r.status === 'pending').length;
    const acknowledged = mockReports.filter((r) => r.status === 'acknowledged').length;
    const dispatched = mockReports.filter((r) => r.status === 'dispatched').length;
    const resolved = mockReports.filter((r) => r.status === 'resolved').length;
    const invalid = mockReports.filter((r) => r.status === 'invalid').length;
    const activeReports = pending + acknowledged + dispatched;
    return { pending, acknowledged, dispatched, resolved, invalid, activeReports, total: mockReports.length };
  }, []);

  const totalResidents = mockResidents.length;
  const pendingApprovals = useMemo(
    () => mockResidents.filter((r) => r.registrationStatus === 'pending').length,
    [],
  );

  // Pie chart data: Incident Type
  const incidentTypeData = useMemo(() => {
    const data = reportsByType.map((entry) => {
      let value = entry.count;
      if (period === 'today') value = Math.max(1, Math.round(entry.count / 30));
      else if (period === 'weekly') value = Math.max(1, Math.round(entry.count / 4));
      return {
        name: entry.type,
        value,
        color: INCIDENT_COLORS[entry.type] || entry.color,
      };
    });
    return data;
  }, [period]);

  // Stat card definitions
  const statCards = [
    {
      title: 'Active Reports',
      value: reportStats.activeReports,
      subtitle: `${reportStats.pending} pending · ${reportStats.dispatched} dispatched`,
      icon: <Siren className="size-6 text-red-600 dark:text-red-400" />,
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'Resolved Today',
      value: reportStats.resolved,
      subtitle: `${reportStats.invalid} invalid · ${reportStats.total} total`,
      icon: <CheckCircle className="size-6 text-green-600 dark:text-green-400" />,
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Total Residents',
      value: totalResidents,
      subtitle: `${mockResidents.filter((r) => r.status === 'active').length} active`,
      icon: <Users className="size-6 text-sky-600 dark:text-sky-400" />,
      bg: 'bg-sky-100 dark:bg-sky-900/30',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals,
      subtitle: `of ${totalResidents} total registrations`,
      icon: <UserPlus className="size-6 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Top Row: Key Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  </div>
                  <div className={`flex size-12 items-center justify-center rounded-full ${card.bg}`}>
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Second Row: Incident Type Distribution (80%) + Recent Activity (20%) ── */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Incident Type Distribution — 80% */}
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">Incident Type Distribution</CardTitle>
                <CardDescription className="text-xs">Breakdown of emergency reports by incident type</CardDescription>
              </div>
              <Tabs value={period} onValueChange={(v) => setPeriod(v as 'today' | 'weekly' | 'monthly')}>
                <TabsList className="h-8">
                  <TabsTrigger value="today" className="text-xs px-2.5 py-1">Today</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-2.5 py-1">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-2.5 py-1">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incidentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      dataKey="value"
                      stroke="none"
                    >
                      {incidentTypeData.map((entry, index) => (
                        <Cell key={`incident-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} reports`, name]}
                      contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity — 20% */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Latest events</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[280px]">
                <div className="space-y-0.5 px-4 pb-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                        {activityIcons[activity.type] || <Activity className="size-3 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium leading-tight line-clamp-2">{activity.action}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
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
      </motion.div>

      {/* ── Third Row: Incident Heat Map ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-red-500" />
              <div className="space-y-0.5">
                <CardTitle className="text-base">Incident Heat Map</CardTitle>
                <CardDescription className="text-xs">Geographic distribution of reported incidents</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <IncidentHeatMap />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
