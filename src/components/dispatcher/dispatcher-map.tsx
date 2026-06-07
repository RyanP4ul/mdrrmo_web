'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { mockVehicles, mockReports } from '@/lib/mock-data';
import { Vehicle, VehicleStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  MapPin,
  Navigation,
  Activity,
  X,
  Gauge,
  Compass,
  Clock,
  FileText,
  AlertTriangle,
  Ambulance,
  Flame,
  Ship,
  Radio,
  Wrench,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const VEHICLE_ICONS: Record<Vehicle['vehicleType'], string> = {
  ambulance: '🚑',
  'fire-truck': '🚒',
  'rescue-van': '🚐',
  'police-car': '🚓',
  'utility-truck': '🛻',
};

const STATUS_COLORS: Record<VehicleStatus, string> = {
  'en-route': 'bg-blue-500',
  'on-scene': 'bg-red-500',
  available: 'bg-emerald-500',
  returning: 'bg-amber-500',
  offline: 'bg-gray-400',
};

const MAP_DOT_COLORS: Record<VehicleStatus, string> = {
  'en-route': '#3b82f6',
  'on-scene': '#ef4444',
  available: '#10b981',
  returning: '#f59e0b',
  offline: '#9ca3af',
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  'en-route': 'En Route',
  'on-scene': 'On Scene',
  available: 'Available',
  returning: 'Returning',
  offline: 'Offline',
};

const STATUS_BG_COLORS: Record<VehicleStatus, string> = {
  'en-route': 'bg-blue-50 text-blue-700 border-blue-200',
  'on-scene': 'bg-red-50 text-red-700 border-red-200',
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  returning: 'bg-amber-50 text-amber-700 border-amber-200',
  offline: 'bg-gray-100 text-gray-500 border-gray-200',
};

// Dagupan City bounding box
const DAGUPAN_BOUNDS = {
  latMin: 16.0300,
  latMax: 16.0600,
  lngMin: 120.3200,
  lngMax: 120.3500,
};

function normalizeToMap(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - DAGUPAN_BOUNDS.lngMin) / (DAGUPAN_BOUNDS.lngMax - DAGUPAN_BOUNDS.lngMin)) * 100;
  const y = ((DAGUPAN_BOUNDS.latMax - lat) / (DAGUPAN_BOUNDS.latMax - DAGUPAN_BOUNDS.latMin)) * 100;
  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

function getHeadingDirection(heading: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return dirs[index];
}

// Incident marker colors for reports on the map
const INCIDENT_MARKER_COLORS: Record<string, string> = {
  Fire: '#ef4444',
  'Medical Emergency': '#22c55e',
  Disaster: '#3b82f6',
  Vehicular: '#f59e0b',
  Trauma: '#ec4899',
  Service: '#6b7280',
};

// ─── Component ──────────────────────────────────────────────────────────────

export function DispatcherMap() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    mockVehicles.map((v) => ({ ...v }))
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [lastUpdateAgo, setLastUpdateAgo] = useState<Record<string, string>>({});

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId]
  );

  const assignedReport = useMemo(() => {
    if (!selectedVehicle?.assignedReportId) return null;
    return mockReports.find((r) => r.id === selectedVehicle.assignedReportId) ?? null;
  }, [selectedVehicle]);

  // Active (non-resolved) reports for map display
  const activeReports = useMemo(
    () => mockReports.filter((r) => r.status !== 'resolved' && r.status !== 'invalid'),
    []
  );

  // GPS Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === 'en-route' || v.status === 'returning') {
            const latOffset = (Math.random() - 0.5) * 0.0008;
            const lngOffset = (Math.random() - 0.5) * 0.0008;
            const speedVariation = Math.floor((Math.random() - 0.5) * 10);
            const headingVariation = Math.floor((Math.random() - 0.5) * 30);
            return {
              ...v,
              lat: v.lat + latOffset,
              lng: v.lng + lngOffset,
              speed: Math.max(0, v.speed + speedVariation),
              heading: (v.heading + headingVariation + 360) % 360,
              lastUpdated: new Date().toISOString(),
            };
          }
          if (v.status === 'on-scene') {
            const latJitter = (Math.random() - 0.5) * 0.0001;
            const lngJitter = (Math.random() - 0.5) * 0.0001;
            return {
              ...v,
              lat: v.lat + latJitter,
              lng: v.lng + lngJitter,
              lastUpdated: new Date().toISOString(),
            };
          }
          return v;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Refresh time ago
  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, string> = {};
      vehicles.forEach((v) => {
        times[v.id] = formatTimeAgo(v.lastUpdated);
      });
      setLastUpdateAgo(times);
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [vehicles]);

  // Stats
  const stats = useMemo(() => {
    const total = vehicles.length;
    const enRoute = vehicles.filter((v) => v.status === 'en-route').length;
    const onScene = vehicles.filter((v) => v.status === 'on-scene').length;
    const available = vehicles.filter((v) => v.status === 'available').length;
    const offline = vehicles.filter((v) => v.status === 'offline').length;
    return { total, enRoute, onScene, available, offline };
  }, [vehicles]);

  // Map markers for vehicles
  const vehicleMarkers = useMemo(
    () =>
      vehicles.map((v) => ({
        ...v,
        pos: normalizeToMap(v.lat, v.lng),
      })),
    [vehicles]
  );

  // Map markers for active reports
  const reportMarkers = useMemo(
    () =>
      activeReports.map((r) => ({
        ...r,
        pos: normalizeToMap(r.lat, r.lng),
      })),
    [activeReports]
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
            <MapPin className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Live Map</h2>
            <p className="text-sm text-muted-foreground">Real-time vehicle & incident tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Live GPS</span>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MapStatCard label="Total Vehicles" value={stats.total} icon={<Truck className="h-4 w-4" />} color="bg-slate-500" />
        <MapStatCard label="En Route" value={stats.enRoute} icon={<Navigation className="h-4 w-4" />} color="bg-blue-500" />
        <MapStatCard label="On Scene" value={stats.onScene} icon={<MapPin className="h-4 w-4" />} color="bg-red-500" />
        <MapStatCard label="Available" value={stats.available} icon={<Activity className="h-4 w-4" />} color="bg-emerald-500" />
        <MapStatCard label="Offline" value={stats.offline} icon={<X className="h-4 w-4" />} color="bg-gray-400" />
      </div>

      {/* Map Area */}
      <Card className="flex-1 min-h-[450px] overflow-hidden relative">
        <CardContent className="p-0 h-full relative">
          {/* Live Indicator */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/70 rounded-full px-3 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-white tracking-wide">LIVE</span>
          </div>

          {/* Map title */}
          <div className="absolute top-3 right-3 z-20 bg-black/70 rounded-md px-2.5 py-1">
            <span className="text-xs text-white/80 font-medium">Dagupan City Area</span>
          </div>

          {/* Visual Map */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-dispatcher" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dispatcher)" />
            </svg>

            {/* Decorative "water" area */}
            <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-blue-900/30 rounded-t-lg" />
            <div className="absolute top-[20%] left-[10%] w-[25%] h-[8%] bg-blue-900/20 rounded-full blur-sm" />

            {/* Street lines */}
            <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="1" strokeDasharray="8 4" />
              <line x1="0" y1="40%" x2="100%" y2="40%" stroke="white" strokeWidth="1" strokeDasharray="8 4" />
              <line x1="30%" y1="0" x2="30%" y2="100%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
              <line x1="70%" y1="0" x2="70%" y2="100%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
              <line x1="0" y1="65%" x2="100%" y2="65%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8" />
            </svg>

            {/* Barangay labels */}
            <div className="absolute top-[8%] left-[15%] text-[10px] text-white/20 font-medium">POBLACION</div>
            <div className="absolute top-[25%] right-[15%] text-[10px] text-white/20 font-medium">TAPUAC</div>
            <div className="absolute top-[55%] left-[20%] text-[10px] text-white/20 font-medium">PANTAL</div>
            <div className="absolute bottom-[25%] right-[20%] text-[10px] text-white/20 font-medium">BONUAN</div>
            <div className="absolute top-[40%] left-[55%] text-[10px] text-white/20 font-medium">MAYOMBO</div>

            {/* Incident Report Markers (diamond shape) */}
            {reportMarkers.map((r) => {
              const markerColor = INCIDENT_MARKER_COLORS[r.type] || '#6b7280';
              return (
                <div
                  key={`report-${r.id}`}
                  className="absolute z-5 pointer-events-none"
                  style={{
                    left: `${r.pos.x}%`,
                    top: `${r.pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Pulsing ring for pending reports */}
                  {r.status === 'pending' && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="absolute w-8 h-8 rounded-full opacity-20 animate-ping"
                        style={{ backgroundColor: markerColor }}
                      />
                    </span>
                  )}
                  {/* Diamond marker */}
                  <div
                    className="w-4 h-4 rotate-45 border-2 border-white shadow-lg"
                    style={{ backgroundColor: markerColor }}
                  />
                </div>
              );
            })}

            {/* Vehicle Markers */}
            {vehicleMarkers.map((m) => {
              const isSelected = m.id === selectedVehicleId;
              const isMoving = m.status === 'en-route' || m.status === 'returning';
              return (
                <motion.div
                  key={`vehicle-${m.id}`}
                  className="absolute cursor-pointer z-10"
                  style={{
                    left: `${m.pos.x}%`,
                    top: `${m.pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    left: `${m.pos.x}%`,
                    top: `${m.pos.y}%`,
                  }}
                  transition={{
                    duration: 1.8,
                    ease: 'easeInOut',
                  }}
                  onClick={() => setSelectedVehicleId(m.id === selectedVehicleId ? null : m.id)}
                >
                  {/* Pulse ring for moving vehicles */}
                  {isMoving && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="absolute w-8 h-8 rounded-full opacity-30 animate-ping"
                        style={{ backgroundColor: MAP_DOT_COLORS[m.status] }}
                      />
                    </span>
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        className="absolute w-10 h-10 rounded-full border-2 border-white"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </span>
                  )}

                  {/* Dot marker */}
                  <div
                    className={`relative w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform ${isSelected ? 'scale-125' : ''}`}
                    style={{ backgroundColor: MAP_DOT_COLORS[m.status] }}
                  >
                    <span className="text-[8px]">{VEHICLE_ICONS[m.vehicleType]}</span>
                  </div>

                  {/* Label on selected */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-30"
                    >
                      {m.plateNumber} • {STATUS_LABELS[m.status]}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-20 bg-black/70 rounded-md px-3 py-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {(['en-route', 'on-scene', 'available', 'returning', 'offline'] as VehicleStatus[]).map((status) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                    <span className="text-[10px] text-white/80">{STATUS_LABELS[status]}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                <div className="w-2.5 h-2.5 rotate-45 bg-amber-500 border border-white/50" />
                <span className="text-[10px] text-white/80">Incident</span>
              </div>
            </div>
          </div>

          {/* Vehicle count on map */}
          <div className="absolute bottom-3 right-3 z-20 bg-black/70 rounded-md px-2.5 py-1">
            <span className="text-[10px] text-white/80">{vehicles.length} vehicles • {activeReports.length} active incidents</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Vehicle Detail */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-2" style={{ borderColor: MAP_DOT_COLORS[selectedVehicle.status] + '60' }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: MAP_DOT_COLORS[selectedVehicle.status] + '20' }}
                  >
                    {VEHICLE_ICONS[selectedVehicle.vehicleType]}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{selectedVehicle.plateNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedVehicle.teamName} • {selectedVehicle.vehicleType.replace('-', ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${STATUS_BG_COLORS[selectedVehicle.status]} border text-xs font-medium`}>
                    {STATUS_LABELS[selectedVehicle.status]}
                  </Badge>
                  <button
                    onClick={() => setSelectedVehicleId(null)}
                    className="p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <DetailItem icon={<Gauge className="h-3.5 w-3.5" />} label="Speed" value={selectedVehicle.speed > 0 ? `${selectedVehicle.speed} km/h` : 'Stationary'} />
                <DetailItem icon={<Compass className="h-3.5 w-3.5" />} label="Heading" value={selectedVehicle.heading > 0 ? `${selectedVehicle.heading}° ${getHeadingDirection(selectedVehicle.heading)}` : 'N/A'} />
                <DetailItem icon={<MapPin className="h-3.5 w-3.5" />} label="Coordinates" value={`${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lng.toFixed(4)}`} />
                <DetailItem icon={<Clock className="h-3.5 w-3.5" />} label="Last Update" value={lastUpdateAgo[selectedVehicle.id] ?? '—'} />
              </div>

              {/* Assigned Report */}
              {assignedReport && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned Report</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{assignedReport.type} — {assignedReport.id}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{assignedReport.location}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          assignedReport.priority === 'critical'
                            ? 'border-red-300 text-red-600 bg-red-50'
                            : assignedReport.priority === 'high'
                            ? 'border-orange-300 text-orange-600 bg-orange-50'
                            : assignedReport.priority === 'medium'
                            ? 'border-yellow-300 text-yellow-600 bg-yellow-50'
                            : 'border-green-300 text-green-600 bg-green-50'
                        }`}
                      >
                        {assignedReport.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                      {assignedReport.description}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MapStatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="py-0">
        <CardContent className="p-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${color} bg-opacity-15 flex items-center justify-center text-white`}>
            <div className={`${color} rounded-md p-1.5 text-white`}>{icon}</div>
          </div>
          <div>
            <div className="text-2xl font-bold leading-tight">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
