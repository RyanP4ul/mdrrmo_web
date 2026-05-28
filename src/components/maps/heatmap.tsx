'use client';

import { useSyncExternalStore } from 'react';
import { mockHeatmapData } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

export const INCIDENT_COLORS: Record<string, string> = {
  Fire: '#ef4444',
  'Medical Emergency': '#22c55e',
  Disaster: '#3b82f6',
  Vehicular: '#f59e0b',
  Trauma: '#ec4899',
  Ambulance: '#06b6d4',
  Service: '#6b7280',
};

export const INCIDENT_TYPES = Object.keys(INCIDENT_COLORS);

interface HeatmapProps {
  height?: string;
  hiddenTypes?: Set<string>;
}

function HeatmapInner({ height, hiddenTypes }: { height: string; hiddenTypes?: Set<string> }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MapContainer, TileLayer, Circle, Popup } = require('react-leaflet');

  const visiblePoints = mockHeatmapData.filter(
    (point: { type: string }) => !hiddenTypes?.has(point.type)
  );

  return (
    <div style={{ height, width: '100%' }} className="relative rounded-lg overflow-hidden">
      <MapContainer
        center={[16.0433, 120.3372]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visiblePoints.map((point: { lat: number; lng: number; intensity: number; type: string }, index: number) => {
          const radius = 10 + point.intensity * 20;
          const color = INCIDENT_COLORS[point.type] || '#6b7280';
          return (
            <Circle
              key={`heatmap-${index}`}
              center={[point.lat, point.lng]}
              radius={radius * 50}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.4,
                weight: 2,
                opacity: 0.8,
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sm">{point.type}</p>
                  <p className="text-xs text-gray-600">Intensity: {(point.intensity * 100).toFixed(0)}%</p>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 dark:bg-gray-900/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Incident Types</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(INCIDENT_COLORS)
            .filter(([type]) => !hiddenTypes?.has(type))
            .map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const emptySubscribe = () => () => {};

export function Heatmap({ height = '400px', hiddenTypes }: HeatmapProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div style={{ height, width: '100%' }} className="relative">
        <Skeleton className="w-full h-full rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse size-10 mx-auto mb-2 rounded-full bg-blue-200 dark:bg-blue-900/30" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return <HeatmapInner height={height} hiddenTypes={hiddenTypes} />;
}

export default Heatmap;
