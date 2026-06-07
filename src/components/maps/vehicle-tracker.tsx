'use client';

import { useSyncExternalStore } from 'react';
import { mockVehicles, type Vehicle, type VehicleStatus } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  'en-route': '#3b82f6',     // blue
  'on-scene': '#22c55e',     // green
  'available': '#06b6d4',    // cyan
  'returning': '#f59e0b',    // amber
  'offline': '#6b7280',      // gray
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  'en-route': 'En Route',
  'on-scene': 'On Scene',
  'available': 'Available',
  'returning': 'Returning',
  'offline': 'Offline',
};

export const VEHICLE_TYPE_ICONS: Record<string, string> = {
  'ambulance': '🚑',
  'fire-truck': '🚒',
  'rescue-van': '🚐',
  'police-car': '🚔',
  'utility-truck': '🛻',
};

export const VEHICLE_STATUSES: VehicleStatus[] = ['en-route', 'on-scene', 'available', 'returning', 'offline'];

interface VehicleTrackerProps {
  height?: string;
  hiddenStatuses?: Set<VehicleStatus>;
  selectedVehicleId?: string | null;
  onSelectVehicle?: (id: string | null) => void;
}

function VehicleTrackerInner({
  height,
  hiddenStatuses,
  selectedVehicleId,
  onSelectVehicle,
}: {
  height: string;
  hiddenStatuses?: Set<VehicleStatus>;
  selectedVehicleId?: string | null;
  onSelectVehicle?: (id: string | null) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } = require('react-leaflet');

  const visibleVehicles = mockVehicles.filter(
    (v: Vehicle) => !hiddenStatuses?.has(v.status)
  );

  const createVehicleIcon = (vehicle: Vehicle, isSelected: boolean) => {
    const color = VEHICLE_STATUS_COLORS[vehicle.status];
    const emoji = VEHICLE_TYPE_ICONS[vehicle.vehicleType] || '🚗';
    const size = isSelected ? 44 : 36;
    const borderWidth = isSelected ? 3 : 2;

    return L.divIcon({
      className: 'custom-vehicle-icon',
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${vehicle.status === 'en-route' ? `
          <div style="
            position: absolute;
            width: ${size + 12}px;
            height: ${size + 12}px;
            border-radius: 50%;
            background: ${color}33;
            animation: pulse-ring 2s ease-out infinite;
          "></div>
          ` : ''}
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: white;
            border: ${borderWidth}px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? 20 : 16}px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            ${isSelected ? 'box-shadow: 0 0 0 3px ' + color + '44, 0 2px 8px rgba(0,0,0,0.25);' : ''}
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${emoji}
          </div>
          ${vehicle.speed > 0 ? `
          <div style="
            position: absolute;
            bottom: -6px;
            right: -6px;
            background: ${color};
            color: white;
            font-size: 8px;
            font-weight: 700;
            padding: 1px 4px;
            border-radius: 8px;
            line-height: 1.2;
          ">${vehicle.speed}km/h</div>
          ` : ''}
          ${isSelected ? `
          <div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            font-size: 8px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 8px;
            white-space: nowrap;
          ">${vehicle.id}</div>
          ` : ''}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2 + 4)],
    });
  };

  return (
    <div style={{ height, width: '100%' }} className="relative rounded-lg overflow-hidden">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .custom-vehicle-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>
      <MapContainer
        center={[16.0433, 120.3372]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visibleVehicles.map((vehicle: Vehicle) => {
          const isSelected = selectedVehicleId === vehicle.id;
          const statusLabel = VEHICLE_STATUS_LABELS[vehicle.status];

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.lat, vehicle.lng]}
              icon={createVehicleIcon(vehicle, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectVehicle) {
                    onSelectVehicle(isSelected ? null : vehicle.id);
                  }
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} permanent={isSelected}>
                <div className="text-center min-w-[120px]">
                  <p className="font-bold text-xs">{vehicle.teamName}</p>
                  <p className="text-[10px] text-gray-500">{vehicle.id} • {statusLabel}</p>
                </div>
              </Tooltip>
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{VEHICLE_TYPE_ICONS[vehicle.vehicleType]}</span>
                    <div>
                      <p className="font-bold text-sm">{vehicle.teamName}</p>
                      <p className="text-xs text-gray-500">{vehicle.plateNumber || vehicle.id}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-semibold" style={{ color: VEHICLE_STATUS_COLORS[vehicle.status] }}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{vehicle.vehicleType.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Speed:</span>
                      <span className="font-medium">{vehicle.speed > 0 ? `${vehicle.speed} km/h` : 'Stationary'}</span>
                    </div>
                    {vehicle.assignedReportId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Report:</span>
                        <span className="font-medium text-blue-600">{vehicle.assignedReportId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Updated:</span>
                      <span className="font-medium">
                        {new Date(vehicle.lastUpdated).toLocaleTimeString('en-PH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Position:</span>
                      <span className="font-medium font-mono text-[10px]">
                        {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-white/95 dark:bg-gray-900/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Vehicle Status</p>
        <div className="space-y-1.5">
          {Object.entries(VEHICLE_STATUS_COLORS)
            .filter(([status]) => !hiddenStatuses?.has(status as VehicleStatus))
            .map(([status, color]) => {
              const count = mockVehicles.filter((v: Vehicle) => v.status === status).length;
              return (
                <div key={status} className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {VEHICLE_STATUS_LABELS[status as VehicleStatus]}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    ({count})
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Vehicle count overlay */}
      <div className="absolute top-3 right-3 z-10 rounded-lg bg-white/95 dark:bg-gray-900/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {visibleVehicles.length} / {mockVehicles.length} Vehicles
          </span>
        </div>
      </div>
    </div>
  );
}

const emptySubscribe = () => () => {};

export function VehicleTracker({ height = '400px', hiddenStatuses, selectedVehicleId, onSelectVehicle }: VehicleTrackerProps) {
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
            <p className="text-sm text-muted-foreground">Loading vehicle tracker...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VehicleTrackerInner
      height={height}
      hiddenStatuses={hiddenStatuses}
      selectedVehicleId={selectedVehicleId}
      onSelectVehicle={onSelectVehicle}
    />
  );
}

export default VehicleTracker;
